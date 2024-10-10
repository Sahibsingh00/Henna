'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Sparkles, Heart, Brush } from 'lucide-react'

export default function FloatingIcons() {
  const iconRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    iconRefs.current.forEach((icon, index) => {
      gsap.to(icon, {
        y: -200,
        duration: 2 + index,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: index * 0.5,
      })
    })
  }, [])

  return (
    <div className="fixed top-10 right-10 space-y-4 z-10">
      <div ref={(el) => {
        if (el) iconRefs.current[0] = el;
      }}>
        <Sparkles className="h-6 w-6 text-primary dark:text-primary-foreground" />
      </div>
      <div ref={(el) => {
        if (el) iconRefs.current[1] = el;
      }}>
        <Heart className="h-6 w-6 text-secondary dark:text-secondary-foreground" />
      </div>
      <div ref={(el) => {
        if (el) iconRefs.current[2] = el;
      }}>
        <Brush className="h-6 w-6 text-accent dark:text-accent-foreground" />
      </div>
    </div>
  )
}