'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'

type MediaItem = {
  id: string;
  url: string;
  name: string;
  section: string;
  subsection?: string;
  index: number;
  mediaType: 'image' | 'video';
};

const complexityLevels = [
  { id: 1, name: 'Simple', description: 'Perfect for beginners or quick applications. These designs typically take 30-60 minutes and feature basic patterns and motifs.', color: 'from-blue-500' },
  { id: 2, name: 'Medium', description: 'Intricate patterns for special occasions. Medium designs take 1-2 hours and include more detailed work and fuller coverage.', color: 'from-green-500' },
  { id: 3, name: 'Complex', description: 'Elaborate designs for weddings and festivals. These can take 2-4 hours and feature highly detailed, full-coverage patterns.', color: 'from-purple-500' },
]

const designTypes = [
  { id: 1, name: 'Hand Henna', description: 'Traditional hand designs for various occasions.', color: 'from-red-500' },
  { id: 2, name: 'Nail Design', description: 'Delicate patterns to adorn your nails.', color: 'from-yellow-500' },
  { id: 3, name: 'Foot Design', description: 'Beautiful designs for your feet and ankles.', color: 'from-pink-500' },
  { id: 4, name: 'Full Arm Design', description: 'Stunning patterns covering the entire arm.', color: 'from-indigo-500' },
]

export default function Services() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMediaItems = async () => {
      setIsLoading(true)
      try {
        const db = getFirestore(app)
        const q = query(
          collection(db, "siteMedia"),
          where("section", "==", "services"),
          orderBy("subsection"),
          orderBy("index")
        )
        const mediaSnapshot = await getDocs(q)
        const fetchedMedia = mediaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem))
        setMediaItems(fetchedMedia)
      } catch (error) {
        console.error("Error fetching media items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMediaItems()
  }, [])

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

  const getMediaItem = (subsection: string, index: number) => 
    mediaItemsBySubsection[subsection]?.find(item => item.index === index && item.mediaType === 'image')

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 mb-32">
      <h1 className="text-5xl font-extrabold mb-12 text-center text-green-500">Our Henna Services</h1>
      
      <section className="mb-24">
        <h2 className="text-4xl font-bold mb-8 text-center text-green-400">Design Complexity Levels</h2>
        <p className="mb-12 text-center text-xl max-w-3xl mx-auto">We offer henna designs in various complexity levels to suit your preferences and occasion. Choose from simple, medium, or complex designs.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {complexityLevels.map((level, index) => {
            const mediaItem = getMediaItem('design-complexity', level.id)
            return (
              <div key={level.id} className="relative overflow-hidden rounded-lg group shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full pb-[110%]">
                  {mediaItem && (
                    <Image 
                      src={mediaItem.url} 
                      alt={level.name} 
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={index < 3}
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className={`bg-gradient-to-t ${level.color} to-transparent text-white p-6`}>
                      <h3 className="text-2xl font-bold mb-2">{level.name}</h3>
                      <p className="text-lg text-gray-200">{level.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-4xl font-bold mb-8 text-center text-green-500">Types of Henna Services</h2>
        <p className="mb-12 text-center text-xl max-w-3xl mx-auto">We offer a variety of henna services to cater to different preferences and body areas. Each service can be customized to your desired complexity level.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {designTypes.map((type, index) => {
            const mediaItem = getMediaItem('types-of-henna', type.id)
            return (
              <div key={type.id} className="relative overflow-hidden rounded-lg group shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full pb-[133%]">
                  {mediaItem && (
                    <Image 
                      src={mediaItem.url} 
                      alt={type.name} 
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy" // Lazy load all images in this section
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className={`bg-gradient-to-t ${type.color} to-transparent text-white p-6`}>
                      <h3 className="text-2xl font-bold mb-2">{type.name}</h3>
                      <p className="text-lg text-gray-200">{type.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mb-24 text-center">
        <h2 className="text-5xl font-bold mb-8 text-green-500">Inspiration Gallery</h2>
        <p className="text-xl mb-8">Explore our extensive collection of beautiful henna designs to get inspired for your next session.</p>
        <div className="flex justify-center space-x-4">
          <Link href="/gallery" className="inline-block bg-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors duration-300">
            View Gallery
          </Link>
          <Link href="/book" className="inline-block bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300">
            Book Now
          </Link>
        </div>
      </section>
    </div>
  )
}