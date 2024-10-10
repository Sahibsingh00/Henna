'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
}

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGalleryImages = async () => {
      setIsLoading(true)
      try {
        const db = getFirestore(app)
        const q = query(
          collection(db, "siteMedia"),
          where("section", "==", "gallery"),
          where("mediaType", "==", "image"),
          orderBy("index")
        )
        const imageSnapshot = await getDocs(q)
        const fetchedImages = imageSnapshot.docs.map(doc => ({
          id: doc.id,
          url: doc.data().url,
          alt: doc.data().name || `Henna design ${doc.data().index}`
        }))
        setGalleryImages(fetchedImages)
      } catch (error) {
        console.error("Error fetching gallery images:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGalleryImages()
  }, [])

  const breakpointColumnsObj = {
    default: 4,
    1100: 4,
    700: 3,
    500: 2
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 mb-32">
      <h1 className="text-5xl font-extrabold mb-12 text-center text-green-500">Henna Design Gallery</h1>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {galleryImages.map((image) => (
          <div key={image.id} className="mb-6 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <Image
              src={image.url}
              alt={image.alt}
              width={300}
              height={300}
              className="w-full h-auto rounded-lg transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </Masonry>
    </div>
  )
}