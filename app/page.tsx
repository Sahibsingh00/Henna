'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Brush, Heart, Sparkles, ArrowRight, Send, Image as ImageIcon, Leaf, Flower2 } from "lucide-react"
import AnimateOnScroll from '@/components/AnimateOnScroll'
import FloatingIcon from '@/components/FloatingIcon'
import DoodleArrow from '@/components/DoodleArrow'
import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { app } from '@/lib/firebase'

// Define the MediaItem type
type MediaItem = {
  id: string;
  url: string;
  name: string;
  section: string;
  subsection?: string;
  index: number;
  mediaType: 'image' | 'video';
};

export default function Home() {
  const heroRef = useRef(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMediaItems = async () => {
      const db = getFirestore(app)
      const q = query(
        collection(db, "siteMedia"),
        where("section", "==", "home"),
        orderBy("subsection"),
        orderBy("index")
      )
      const mediaSnapshot = await getDocs(q)
      const fetchedMedia = mediaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem))
      setMediaItems(fetchedMedia)
      setIsLoading(false)
    }

    fetchMediaItems()
  }, [])

  useEffect(() => {
    if (isLoading && loadingRef.current) {
      const dots = loadingRef.current.querySelectorAll('.loading-dot')
      gsap.set(dots, { opacity: 0, scale: 0 })

      const tl = gsap.timeline({ repeat: -1 })

      dots.forEach((dot, index) => {
        tl.to(dot, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        }, index * 0.15)
          .to(dot, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            ease: "power2.in"
          }, `>0.5`)
      })
    }
  }, [isLoading])

  // Memoize media items by subsection for faster lookup
  const mediaItemsBySubsection = useMemo(() => {
    return mediaItems.reduce((acc, item) => {
      if (item.subsection) {
        if (!acc[item.subsection]) {
          acc[item.subsection] = []
        }
        acc[item.subsection].push(item)
      }
      return acc
    }, {} as Record<string, MediaItem[]>)
  }, [mediaItems])

  // Helper function to get media item by subsection and index
  const getMediaItem = (subsection: string, index: number) =>
    mediaItemsBySubsection[subsection]?.find(item => item.index === index && item.mediaType === 'image')

  // Get hero video
  const heroVideo = useMemo(() =>
    mediaItems.find(item => item.subsection === 'hero-video' && item.mediaType === 'video'),
    [mediaItems]
  )

  if (isLoading) {
    return (
      <div className="fixed inset-x-0 top-[64px] bottom-0 flex items-center justify-center bg-white dark:bg-black z-40">
        <div ref={loadingRef} className="flex space-x-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="loading-dot w-4 h-4 bg-green-500 rounded-full"
            ></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section ref={heroRef} className="relative w-full flex flex-col">
        <div className="flex-1 bg-transparent flex items-center justify-center h-[90vh]">
          <div className="container px-4 md:px-6 text-center max-w-4xl my-10 md:my-20 relative">
            {/* Floating Icons */}
            <FloatingIcon Icon={Leaf} className="absolute left-2 sm:left-2 md:left-4 lg:-left-32 top-1/5 -z-10" direction="left" />
            <FloatingIcon Icon={Flower2} className="absolute right-2 sm:right-2 md:right-4 lg:-right-32 top-1/2 -z-10" direction="up" />
            <FloatingIcon Icon={Sparkles} className="absolute left-8 sm:left-2 md:left-4 lg:-left-24 bottom-1/4 -z-10" direction="right" />
            <FloatingIcon Icon={Heart} className="absolute right-8 sm:right-2 md:right-4 lg:-right-24 bottom-1/5 -z-10" direction="down" />

            <h1 className="hero-element text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-4 text-black dark:text-white">
              Timeless <span className="text-green-500">Henna Art</span> for Every Occasion
            </h1>
            <p className="hero-element text-lg sm:text-xl md:text-2xl mb-6 text-gray-700 dark:text-gray-300">
              Discover the beauty of intricate designs, crafted with tradition and passion. Whether it's for weddings, festivals, or personal adornment, let our expert artists bring your vision to life.
            </p>
            <div className="hero-element relative inline-block">
              <Button asChild size="lg" variant="ghost" className="bg-green-500 dark:bg-green-500 hover:opacity-80 hover:bg-green-500 hover:text-white text-white dark:text-black mt-6 ">
                <Link href="/book">Book Your Session <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <DoodleArrow className="absolute top-4 -right-16 sm:top-0 sm:-right-16 md:-top-8 md:-right-20 lg:-top-12 lg:-right-24 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 transform -rotate-90" />
            </div>
          </div>
        </div>
        <div className="w-full px-4 md:px-6 mb-12">
          <Card className="overflow-hidden rounded-2xl bg-green-300 dark:bg-green-500 backdrop-blur-md relative shadow-glow">
            <div className="aspect-w-16 aspect-h-9 lg:aspect-auto lg:h-[90vh] p-2 sm:p-4 relative z-10">
              {heroVideo ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                >
                  <source src={heroVideo.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-2xl">
                  <p>Video not available</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <AnimateOnScroll className="animate-delay-200">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-transparent">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-green-500">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Bridal Henna', icon: Heart, subsection: 'our-services', index: 1, color: 'bg-[#1b335e]' },
                { name: 'Party Henna', icon: Sparkles, subsection: 'our-services', index: 2, color: 'bg-[#dbb195]' },
                { name: 'Custom Designs', icon: Brush, subsection: 'our-services', index: 3, color: 'bg-[#4dc671]' },
              ].map((service) => {
                const mediaItem = getMediaItem(service.subsection, service.index)
                return (
                  <div key={service.name} className="opacity-0 translate-y-4 animate-fade-in-up">
                    <Card className="overflow-hidden relative group ">
                      <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                        {mediaItem ? (
                          <Image
                            src={mediaItem.url}
                            alt={service.name}
                            width={500}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="eager"
                            priority
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <p>Image not available</p>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button asChild className={`${service.color} bg-opacity-70 hover:bg-opacity-100 text-white rounded-full transition-all duration-300 text-sm sm:text-base lg:text-lg py-6 px-4 sm:px-6 lg:px-8 backdrop-blur-sm`}>
                            <Link href="/book">
                              <span className="flex items-center">
                                Book {service.name}
                                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                              </span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Moto Section */}
      <AnimateOnScroll className="animate-delay-200 w-full">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                Transforming Special Moments with Beautiful Henna Art
              </h2>
              <p className="mx-auto max-w-[700px] md:text-xl mb-8">
                Our personalized henna services are designed to make your special moments even more memorable.
                Book a session with us and let our skilled artists create stunning designs that reflect your style and personality.
              </p>
              <Button asChild size="lg">
                <Link href="/book">Book a Session</Link>
              </Button>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Best Designs Section */}
      <AnimateOnScroll className="animate-delay-200">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-6 text-green-500">
              Our Best Designs
            </h2>
            <p className="text-center mb-12 max-w-2xl mx-auto text-lg text-gray-600">
              Discover our top four exquisite henna designs that have captivated our clients. Each design is a blend of tradition and elegance, crafted to perfection.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Royal Mandala', tagline: 'Elegance Encapsulated', index: 1, color: 'from-[#1b335e]' },
                { name: 'Floral Symphony', tagline: 'Blooming Beauty', index: 2, color: 'from-[#dbb195]' },
                { name: 'Geometric Precision', tagline: 'Symmetry in Art', index: 3, color: 'from-[#4dc671]' },
                { name: 'Classic Paisley', tagline: 'Timeless Tradition', index: 4, color: 'from-[#a67c52]' },
              ].map((design) => {
                const mediaItem = getMediaItem('best-designs', design.index)
                return (
                  <div key={design.name}>
                    <Card className="overflow-hidden relative group h-full ">
                      <div className="aspect-[3/5] overflow-hidden">
                        {mediaItem ? (
                          <Image
                            src={mediaItem.url}
                            alt={design.name}
                            width={300}
                            height={500}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="eager"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <p>Image not available</p>
                          </div>
                        )}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          <div className={`bg-gradient-to-b ${design.color} to-transparent text-white p-4`}>
                            <CardTitle className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{design.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-200">{design.tagline}</CardDescription>
                          </div>
                          <div className="p-4 sm:p-6 self-end">
                            <Button
                              asChild
                              variant="ghost"
                              className="text-white dark:text-gray-200 hover:text-green-500 dark:hover:text-green-400 transition-all duration-300 text-sm sm:text-base"
                            >
                              <Link href="/book">
                                <span className="flex items-center">
                                  Book
                                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                </span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Thank You Section */}
      <AnimateOnScroll className="animate-delay-200">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center opacity-0 translate-y-4 animate-fade-in-up">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                Thank You for Considering Our Henna Services
              </h2>
              <p className="mx-auto max-w-[700px] md:text-xl mb-8">
                We appreciate your interest in our henna artistry. If you have any questions or would like to discuss custom designs,
                we'd love to hear from you. Share your vision with us, and let's create something beautiful together.
              </p>
              <Button asChild size="lg">
                <Link href="/contact">
                  Send an Inquiry
                  <Send className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Impact Section */}
      <AnimateOnScroll className="animate-delay-200">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                  Our Artistry
                </h2>
                <p className="md:text-xl mb-8">
                  At HennaArt, we blend traditional techniques with contemporary designs to create unique and stunning henna art.
                  Our skilled artists are dedicated to bringing your vision to life, ensuring each design is as individual as you are.
                </p>
                <Button asChild className="mx-auto md:mx-0">
                  <Link href="/gallery">
                    Explore Gallery
                    <ImageIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto md:max-w-none">
                {[1, 2].map((index) => {
                  const mediaItem = getMediaItem('our-artistry', index)
                  return (
                    <div key={index} className="aspect-[3/5]">
                      {mediaItem ? (
                        <Image
                          src={mediaItem.url}
                          alt={`Henna Art ${index}`}
                          width={300}
                          height={500}
                          className="w-full h-full object-cover rounded-lg"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                          <p>Image not available</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>
    </div>
  )
}