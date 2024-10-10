'use client'

import { useEffect, useState } from 'react'
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export default function ImagePreloader() {
  const [mediaUrls, setMediaUrls] = useState<{images: string[], video: string | null}>({
    images: [],
    video: null
  })

  useEffect(() => {
    const fetchMediaUrls = async () => {
      const db = getFirestore(app)
      
      // Fetch image URLs
      const imageQuery = query(
        collection(db, "siteMedia"),
        where("section", "==", "services"),
        where("mediaType", "==", "image"),
        orderBy("subsection"),
        orderBy("index"),
        limit(3)
      )
      const imageSnapshot = await getDocs(imageQuery)
      const imageUrls = imageSnapshot.docs.map(doc => doc.data().url as string)

      // Fetch video URL
      const videoQuery = query(
        collection(db, "siteMedia"),
        where("section", "==", "home"),
        where("mediaType", "==", "video"),
        where("subsection", "==", "hero"),
        limit(1)
      )
      const videoSnapshot = await getDocs(videoQuery)
      const videoUrl = videoSnapshot.docs[0]?.data().url as string | undefined

      setMediaUrls({
        images: imageUrls,
        video: videoUrl || null
      })
    }

    fetchMediaUrls()
  }, [])

  return (
    <>
      {mediaUrls.images.map((url, index) => (
        <link
          key={`image-${index}`}
          rel="preload"
          href={url}
          as="image"
          type="image/jpeg"
        />
      ))}
      {mediaUrls.video && (
        <link
          rel="preload"
          href={mediaUrls.video}
          as="video"
          type="video/mp4"
        />
      )}
    </>
  )
}