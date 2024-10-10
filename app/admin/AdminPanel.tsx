'use client'

import React, { useEffect, useState } from 'react'
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { RefreshCw } from "lucide-react"
import { Trash2, Archive } from "lucide-react"
import { Booking } from '@/types/booking'


type DashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

export default function AdminPanel() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [showDeleted, setShowDeleted] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const db = getFirestore(app)
      const bookingsSnapshot = await getDocs(collection(db, "bookings"))
      const fetchedBookings = bookingsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Booking))
        .filter(booking => !booking.isDeleted)  // Add this line to filter out deleted bookings
      setBookings(fetchedBookings)
      
      // Calculate dashboard stats
      const stats: DashboardStats = {
        totalBookings: fetchedBookings.length,
        pendingBookings: fetchedBookings.filter(b => b.status === 'pending').length,
        confirmedBookings: fetchedBookings.filter(b => b.status === 'confirmed').length,
        cancelledBookings: fetchedBookings.filter(b => b.status === 'cancelled').length,
      }
      setDashboardStats(stats)

      toast({
        title: "Bookings Refreshed",
        description: "The bookings list has been updated.",
      })
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to refresh bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    const db = getFirestore(app)
    const bookingRef = doc(db, "bookings", bookingId)
    await updateDoc(bookingRef, { status: newStatus })
    
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    )

    toast({
      title: "Booking Updated",
      description: `Booking status changed to ${newStatus}`,
    })

    fetchBookings() // Refresh bookings and stats
  }

  const calculateTotalPrice = (services: { name: string; complexity: string }[]) => {
    const servicesPrices = [
      { name: 'Hand Henna', complexity: 'Simple', prices: { Simple: 30, Medium: 50, Hard: 70 } },
      { name: 'Hand Nails', complexity: 'Simple', prices: { Simple: 20, Medium: 35, Hard: 50 } },
      { name: 'Full Arm', complexity: 'Simple', prices: { Simple: 60, Medium: 90, Hard: 120 } },
      { name: 'Foot Henna', complexity: 'Simple', prices: { Simple: 40, Medium: 60, Hard: 80 } },
    ];

    return services.reduce((total, service) => {
      const servicePrice = servicesPrices.find(s => s.name === service.name);
      if (servicePrice) {
        return total + (servicePrice.prices[service.complexity as keyof typeof servicePrice.prices] || 0);
      }
      return total;
    }, 0);
  };

  const moveToTrash = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to move this booking to trash?")) {
      try {
        const db = getFirestore(app)
        await updateDoc(doc(db, "bookings", bookingId), { isDeleted: true })
        toast({
          title: "Booking Moved to Trash",
          description: "The booking has been moved to the trash.",
        })
        fetchBookings()
      } catch (error) {
        console.error("Error moving booking to trash:", error)
        toast({
          title: "Error",
          description: "Failed to move the booking to trash. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Booked On
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as { seconds: number };
        return new Date(createdAt.seconds * 1000).toLocaleDateString('en-GB');
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Appointment Date
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("date") as { seconds: number };
        return new Date(date.seconds * 1000).toLocaleDateString('en-GB');
      },
    },
    {
      header: "Services",
      cell: ({ row }) => {
        const services = row.getValue("services") as Array<{ name: string; complexity: string }>;
        return services.map(s => `${s.name} (${s.complexity})`).join(', ');
      },
    },
    {
      accessorKey: "personalDetails.name",
      header: "Customer Name",
    },
    {
      accessorKey: "userEmail",
      header: "Customer Email",
    },
    {
      accessorKey: "personalDetails.phone",
      header: "Phone",
    },
    {
      accessorKey: "services",
      header: "Estimated Price",
      cell: ({ row }) => `$${calculateTotalPrice(row.getValue("services")).toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            className={cn(
              status === "pending" && "bg-yellow-500 hover:bg-yellow-600",
              status === "confirmed" && "bg-green-500 hover:bg-green-600",
              status === "cancelled" && "bg-red-500 hover:bg-red-600"
            )}
          >
            {capitalize(status)}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={(value) => updateBookingStatus(row.original.id, value as 'pending' | 'confirmed' | 'cancelled')}
            defaultValue={row.original.status}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => moveToTrash(row.original.id)}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold">Total Bookings</h3>
              <p className="text-2xl">{dashboardStats.totalBookings}</p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <h3 className="font-semibold">Pending Bookings</h3>
              <p className="text-2xl">{dashboardStats.pendingBookings}</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <h3 className="font-semibold">Confirmed Bookings</h3>
              <p className="text-2xl">{dashboardStats.confirmedBookings}</p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h3 className="font-semibold">Cancelled Bookings</h3>
              <p className="text-2xl">{dashboardStats.cancelledBookings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by email..."
              value={(table.getColumn("userEmail")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("userEmail")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Button
              onClick={() => fetchBookings()}
              variant="outline"
              size="icon"
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}