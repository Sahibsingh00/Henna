'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
}

export default function AnimateOnScroll({ children, className = '' }: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = ref.current; // Store ref.current in a variable
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up')
          observer.unobserve(entry.target)
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  )
}