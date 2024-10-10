import React, { useEffect, useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Service, BookingData } from '@/types/booking'
import Link from 'next/link'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Button } from "@/components/ui/button"

interface ServiceSelectionProps {
  selectedServices: Service[];
  updateBookingData: (data: Partial<BookingData>) => void;
  availableServices: Service[];
}

export default function ServiceSelection({ selectedServices, updateBookingData, availableServices }: ServiceSelectionProps) {
  const [selectedServiceList, setSelectedServiceList] = useState<Service[]>(selectedServices);

  useEffect(() => {
    // Update booking data whenever selectedServiceList changes
    updateBookingData({ services: selectedServiceList });
  }, [selectedServiceList, updateBookingData]);

  const handleServiceToggle = (service: Service) => {
    setSelectedServiceList(prevServices => {
      const isSelected = prevServices.some(s => s.name === service.name);
      if (isSelected) {
        return prevServices.filter(s => s.name !== service.name);
      } else {
        return [...prevServices, { ...service, complexity: 'Simple' }];
      }
    });
  };

  const handleComplexityChange = (serviceName: string, complexity: 'Simple' | 'Medium' | 'Hard') => {
    setSelectedServiceList(prevServices => 
      prevServices.map(service => 
        service.name === serviceName ? { ...service, complexity } : service
      )
    );
  };

  const totalPrice = selectedServiceList.reduce((total, service) => {
    return total + (service.prices?.[service.complexity] ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Select Services</h2>
      <div className="flex justify-center sm:justify-start mb-4">
        <Link href="/services" className="text-primary hover:underline">
          View our services and complexity levels
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {availableServices.map((service) => {
          const isSelected = selectedServiceList.some(s => s.name === service.name);
          return (
            <Card 
              key={service.name} 
              className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : ''}`}
              onClick={() => handleServiceToggle(service)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Checkbox 
                    id={service.name} 
                    checked={isSelected}
                    className="pointer-events-none"
                  />
                  <Label htmlFor={service.name} className="text-sm sm:text-base">{service.name}</Label>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSelected && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {Object.entries(service.prices || {}).map(([complexity, price]) => (
                      <Button
                        key={complexity}
                        variant={selectedServiceList.find(s => s.name === service.name)?.complexity === complexity ? "default" : "outline"}
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplexityChange(service.name, complexity as 'Simple' | 'Medium' | 'Hard');
                        }}
                      >
                        {complexity} (${price})
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="text-xl font-semibold text-center sm:text-left">
        Total Price: ${totalPrice}
      </div>
    </div>
  )
}
