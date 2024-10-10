'use client'

import Link from 'next/link'
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X } from "lucide-react"
import { useAuth } from '@/components/AuthProvider'
import { useState, useRef, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { usePathname, useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const { setTheme } = useTheme()
  const { user, isAdmin, logout } = useAuth()
  const [menuState, setMenuState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed')
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const linksContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (menuState === 'opening') {
      gsap.to(mobileMenuRef.current, {
        y: '0%',
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => setMenuState('open')
      })
      if (linksContainerRef.current) {
        gsap.fromTo(Array.from(linksContainerRef.current.children),
          { 
            y: 20, 
            opacity: 0, 
          },
          { 
            y: 0, 
            opacity: 1, 
            stagger: 0.05, 
            duration: 0.3,
            ease: 'power2.out',
            delay: 0.1
          }
        )
      }
    } else if (menuState === 'closing') {
      gsap.to(mobileMenuRef.current, {
        y: '100%',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setMenuState('closed')
      })
      if (linksContainerRef.current) {
        gsap.to(Array.from(linksContainerRef.current.children), {
          y: 20,
          opacity: 0,
          stagger: 0.05,
          duration: 0.2,
          ease: 'power2.in'
        })
      }
    }
  }, [menuState])

  const handleNavItemClick = (href: string) => {
    setMenuState('closing')
    router.push(href)
  }

  const NavItems = () => {
    const pathname = usePathname()

    const navLinks = [
      { href: '/', label: 'Home' },
      { href: '/services', label: 'Services' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/book', label: 'Book Now' },
    ]

    if (isAdmin) {
      navLinks.push({ href: '/admin', label: 'Admin Panel' })
    }

    return (
      <>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-primary 
              ${pathname === link.href ? 'text-green-500' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </>
    )
  }

  const MobileNavItems = () => {
    const pathname = usePathname()

    const navLinks = [
      { href: '/', label: 'Home' },
      { href: '/profile', label: 'Profile' },
      { href: '/services', label: 'Services' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/book', label: 'Book Now' },
    ]

    if (isAdmin) {
      navLinks.push({ href: '/admin', label: 'Admin Panel' })
    }

    return (
      <>
        {navLinks.map((link) => (
          <button
            key={link.href}
            className={`text-lg font-bold transition-colors hover:text-primary 
              ${pathname === link.href ? 'text-green-500' : ''}
              block w-full text-right py-3 px-4 uppercase border-b border-gray-200 dark:border-gray-700`}
            onClick={() => handleNavItemClick(link.href)}
          >
            {link.label}
          </button>
        ))}
      </>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const UserActions = () => (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative w-8 h-8 rounded-full p-0">
              <span className="sr-only">Open user menu</span>
              <span className="flex items-center justify-center w-full h-full rounded-full bg-muted">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant="outline" className="bg-black text-white hover:bg-gray-800 hover:text-white">
          <Link href="/login">Login</Link>
        </Button>
      )}
    </>
  )

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold text-xl text-green-500">HennaArt</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <NavItems />
            </nav>
            <div className="flex items-center space-x-4">
              <UserActions />
              <Button
                variant="ghost"
                className="md:hidden px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => setMenuState(menuState === 'closed' ? 'opening' : 'closing')}
              >
                {menuState !== 'closed' ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="fixed left-0 right-0 bottom-0 h-[calc(100vh-4rem)] bg-background/80 backdrop-blur-lg z-40 transform translate-y-full"
      >
        <div className="flex flex-col h-full">
          <nav className="flex-grow flex flex-col justify-end">
            <div ref={linksContainerRef} className="w-full pr-4 pb-16">
              <MobileNavItems />
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}