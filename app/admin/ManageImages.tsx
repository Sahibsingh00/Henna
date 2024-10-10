'use client'

import React, { useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react'
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, query, orderBy, where } from 'firebase/firestore'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { app } from '@/lib/firebase'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/hooks/use-toast"
import Image from 'next/image'
import { Plus, Trash2, Loader2, X, Edit } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

// Define MediaType for strict typing
type MediaType = 'image' | 'video';

// Refined Interface for MediaItem
interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string; // Optional thumbnail URL
  name: string;
  section: string;
  subsection?: string;
  index: number;
  mediaType: MediaType;
}

interface MediaUploadButtonProps {
  section: string;
  subsection?: string;
  index: number;
  mediaType: MediaType;
  images: MediaItem[];
  setSelectedSection: Dispatch<SetStateAction<string | null>>;
  setSelectedSubsection: Dispatch<SetStateAction<string | null>>;
  handleMediaUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  addOrUpdateMedia: (targetIndex: number) => Promise<void>;
  deleteMedia?: (mediaId: string) => Promise<void>;
  uploading: boolean;
  newMedia: File | null;
}

interface AddMediaCardProps extends Omit<MediaUploadButtonProps, 'images' | 'deleteMedia' | 'index'> {
  targetIndex: number;
  mediaType: MediaType;
}

type SubSection = {
  value: string;
  label: string;
  count: number;
  mediaType: MediaType;
};

type Section = {
  value: string;
  label: string;
  count?: number;
  mediaType?: MediaType;
  subsections?: SubSection[];
};

// Initial site sections with proper typing
const initialSiteSections: Section[] = [
  { 
    value: 'home', 
    label: 'Home',
    subsections: [
      { value: 'hero-video', label: 'Hero Video', count: 1, mediaType: 'video' },
      { value: 'our-services', label: 'Our Services', count: 3, mediaType: 'image' },
      { value: 'best-designs', label: 'Our Best Designs', count: 4, mediaType: 'image' },
      { value: 'our-artistry', label: 'Our Artistry', count: 2, mediaType: 'image' },
    ]
  },
  { 
    value: 'services', 
    label: 'Our Henna Services',
    subsections: [
      { value: 'design-complexity', label: 'Design Complexity', count: 3, mediaType: 'image' },
      { value: 'types-of-henna', label: 'Types of Henna Services', count: 4, mediaType: 'image' },
    ]
  },
  { value: 'gallery', label: 'Gallery', count: 5, mediaType: 'image' },
]

// Helper component for responsive images
const ResponsiveImage = ({ src, alt }: { src: string, alt: string }) => (
  <div className="relative w-full h-0 pb-[100%]">
    <Image
      src={src}
      alt={alt}
      layout="fill"
      objectFit="contain"
      className="rounded-t-lg"
    />
  </div>
);

// Helper component for responsive videos
const ResponsiveVideo = ({ src }: { src: string }) => (
  <div className="relative w-full h-0 pb-[100%]">
    <video
      src={src}
      controls
      className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg"
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
);

export default function ManageImages() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null)
  const [newMedia, setNewMedia] = useState<File | null>(null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [currentMediaType, setCurrentMediaType] = useState<MediaType>('image')
  const [siteSections, setSiteSections] = useState<Section[]>(initialSiteSections)
  const [gallerySlotCount, setGallerySlotCount] = useState(5) // Initial gallery slot count
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchMediaItems()
  }, [])

  const fetchMediaItems = async () => {
    const db = getFirestore(app)
    const q = query(
      collection(db, "siteMedia"), 
      orderBy("section"), 
      orderBy("subsection", 'asc'), 
      orderBy("index")
    )
    try {
      const mediaSnapshot = await getDocs(q)
      const fetchedMedia = mediaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem))
      setMediaItems(fetchedMedia)
    } catch (error) {
      console.error("Error fetching media items:", error)
      toast({
        title: "Fetch Error",
        description: "Failed to fetch media items. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMediaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setNewMedia(file)
    }
  }

  const createThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const scaleFactor = 0.1; // Adjust for desired thumbnail size
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  const addOrUpdateMedia = async (targetIndex: number) => {
    if (!newMedia || !selectedSection) return

    setUploading(true)
    setUploadProgress(0)
    setCurrentUploadingIndex(targetIndex)

    try {
      const storage = getStorage(app)
      const db = getFirestore(app)
      const mediaType = newMedia.type.startsWith('image/') ? 'image' : 'video'
      const newMediaName = `${selectedSection}_${selectedSubsection || ''}_${mediaType} ${targetIndex}`
      const storageRef = ref(storage, `siteMedia/${newMediaName}`)

      const uploadTask = uploadBytesResumable(storageRef, newMedia)

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error("Upload error:", error)
          toast({
            title: "Upload Error",
            description: "Failed to upload media. Please try again.",
            variant: "destructive",
          })
          setUploading(false)
          setUploadProgress(0)
          setCurrentUploadingIndex(null)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Check if media with the same name already exists
          const existingMediaQuery = query(
            collection(db, "siteMedia"),
            where("name", "==", newMediaName)
          )
          const existingMediaSnapshot = await getDocs(existingMediaQuery)

          if (!existingMediaSnapshot.empty) {
            // Update existing media
            const existingMediaDoc = existingMediaSnapshot.docs[0]
            await updateDoc(doc(db, "siteMedia", existingMediaDoc.id), {
              url: downloadURL,
              updatedAt: new Date().toISOString()
            })
          } else {
            // Add new media
            await addDoc(collection(db, "siteMedia"), {
              url: downloadURL,
              name: newMediaName,
              section: selectedSection,
              subsection: selectedSubsection || null,
              index: targetIndex,
              mediaType: mediaType,
              createdAt: new Date().toISOString()
            })
          }

          toast({
            title: "Upload Successful",
            description: "Media has been uploaded successfully.",
          })

          fetchMediaItems()
          setUploading(false)
          setUploadProgress(0)
          setNewMedia(null)
          setCurrentUploadingIndex(null)
        }
      )
    } catch (error) {
      console.error("Error uploading media:", error)
      toast({
        title: "Upload Error",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      })
      setUploading(false)
      setUploadProgress(0)
      setCurrentUploadingIndex(null)
    }
  }

  const deleteMedia = async (mediaId: string) => {
    try {
      const db = getFirestore(app)
      await deleteDoc(doc(db, "siteMedia", mediaId))

      const storage = getStorage(app)
      const mediaItem = mediaItems.find(item => item.id === mediaId)
      if (mediaItem) {
        const storageRef = ref(storage, mediaItem.url)
        await deleteObject(storageRef)
      }

      toast({
        title: "Media Deleted",
        description: "The media has been successfully deleted.",
      })

      fetchMediaItems()
    } catch (error) {
      console.error("Error deleting media:", error)
      toast({
        title: "Delete Error",
        description: "Failed to delete media. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addGallerySlot = () => {
    setGallerySlotCount(prevCount => prevCount + 1)
    setSiteSections(prevSections => 
      prevSections.map(section => 
        section.value === 'gallery' 
          ? { ...section, count: (section.count || 0) + 1 }
          : section
      )
    )
  }

  const deleteGallerySlot = (index: number) => {
    const galleryMedia = mediaItems.filter(item => item.section === 'gallery' && item.index === index)
    if (galleryMedia.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This slot contains media. Please delete the media first.",
        variant: "destructive",
      })
      return
    }

    setGallerySlotCount(prevCount => Math.max(prevCount - 1, 1)) // Ensure at least one slot remains
    setSiteSections(prevSections => 
      prevSections.map(section => 
        section.value === 'gallery' 
          ? { ...section, count: Math.max((section.count || 0) - 1, 1) }
          : section
      )
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Site Media</h1>
      <Accordion type="single" collapsible className="w-full">
        {siteSections.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.label}</AccordionTrigger>
            <AccordionContent>
              {section.subsections ? (
                section.subsections.map((subsection) => (
                  <div key={subsection.value} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{subsection.label}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: subsection.count }).map((_, idx) => {
                        const targetIdx = idx + 1
                        const mediaItem = mediaItems.find(item => 
                          item.section === section.value && 
                          item.subsection === subsection.value && 
                          item.index === targetIdx &&
                          item.mediaType === subsection.mediaType
                        )
                        return (
                          <MediaCard
                            key={mediaItem?.id || `new-${targetIdx}`}
                            media={mediaItem}
                            section={section.value}
                            subsection={subsection.value}
                            mediaType={subsection.mediaType}
                            images={mediaItems}
                            setSelectedSection={setSelectedSection}
                            setSelectedSubsection={setSelectedSubsection}
                            handleMediaUpload={handleMediaUpload}
                            addOrUpdateMedia={addOrUpdateMedia}
                            deleteMedia={deleteMedia}
                            uploading={uploading && currentUploadingIndex === targetIdx}
                            newMedia={newMedia}
                            index={targetIdx}
                            uploadProgress={uploadProgress}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="mt-8 mb-8 mr-4 ml-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: section.count || 0 }).map((_, idx) => {
                      const targetIdx = idx + 1
                      const mediaItem = mediaItems.find(item => 
                        item.section === section.value && 
                        item.index === targetIdx &&
                        item.mediaType === section.mediaType
                      )
                      return (
                        <div key={`slot-${targetIdx}`} className="relative">
                          <MediaCard
                            media={mediaItem}
                            section={section.value}
                            mediaType={section.mediaType || 'image'}
                            images={mediaItems}
                            setSelectedSection={setSelectedSection}
                            setSelectedSubsection={setSelectedSubsection}
                            handleMediaUpload={handleMediaUpload}
                            addOrUpdateMedia={addOrUpdateMedia}
                            deleteMedia={deleteMedia}
                            uploading={uploading && currentUploadingIndex === targetIdx}
                            newMedia={newMedia}
                            index={targetIdx}
                            uploadProgress={uploadProgress}
                          />
                          {section.value === 'gallery' && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 z-10"
                              onClick={() => deleteGallerySlot(targetIdx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {section.value === 'gallery' && (
                    <Button 
                      onClick={addGallerySlot} 
                      className="mt-4"
                    >
                      Add Gallery Slot
                    </Button>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

// Updated MediaCard Component
function MediaCard({ 
  media, section, subsection, mediaType, deleteMedia, 
  setSelectedSection, setSelectedSubsection, handleMediaUpload, 
  addOrUpdateMedia, uploading, newMedia, index, uploadProgress 
}: MediaUploadButtonProps & { 
  media?: MediaItem; 
  section: string;
  subsection?: string;
  mediaType: MediaType; 
  index: number;
  uploadProgress: number;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [localNewMedia, setLocalNewMedia] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenDialog = () => {
    setSelectedSection(section)
    setSelectedSubsection(subsection || null)
    setIsDialogOpen(true)
  }

  const handleLocalMediaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLocalNewMedia(file)
      handleMediaUpload(event)
    }
  }

  const handleAddOrUpdate = async () => {
    setIsLoading(true)
    await addOrUpdateMedia(index)
    setIsDialogOpen(false)
    setLocalNewMedia(null)
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (media && deleteMedia) {
      setIsDeleting(true)
      await deleteMedia(media.id)
      setIsDeleting(false)
    }
  }

  const displayName = media ? `${mediaType} ${index}` : `Add ${mediaType} ${index}`;
  const isCurrentlyUploading = uploading && (!!localNewMedia || !!newMedia);

  return (
    <Card className="overflow-hidden relative mt-8" style={{ minHeight: '250px' }}>
      {(isLoading || isCurrentlyUploading || isDeleting) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">
              {isDeleting ? "Deleting..." : 
               isCurrentlyUploading ? `Uploading... ${Math.round(uploadProgress)}%` :
               "Processing..."}
            </p>
          </div>
        </div>
      )}
      {media ? (
        <>
          {media.mediaType === 'image' ? (
            <ResponsiveImage src={media.url} alt={displayName} />
          ) : (
            <ResponsiveVideo src={media.url} />
          )}
          <CardContent className="p-4">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <div className="mt-2 flex justify-between">
              <Button
                variant="outline" 
                size="sm"
                onClick={handleOpenDialog}
                disabled={isLoading || isCurrentlyUploading || isDeleting}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {deleteMedia && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading || isCurrentlyUploading || isDeleting}
                  title="Delete Media"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent className="flex flex-col items-center justify-center h-full">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleOpenDialog} 
            disabled={isLoading || isCurrentlyUploading || isDeleting}
          >
            <Plus className="mr-2 h-4 w-4" />
            {displayName}
          </Button>
        </CardContent>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{media ? 'Edit' : 'Add'} {displayName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input 
              type="file" 
              onChange={handleLocalMediaUpload} 
              accept={mediaType === 'image' ? 'image/*' : 'video/*'} 
              disabled={isLoading || isCurrentlyUploading || isDeleting}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <Button 
              onClick={handleAddOrUpdate} 
              disabled={isLoading || isCurrentlyUploading || isDeleting || (!localNewMedia && !newMedia)}
              className="w-full flex items-center justify-center"
            >
              {isLoading || isCurrentlyUploading || isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isDeleting ? "Deleting..." : 
                   isCurrentlyUploading ? `Uploading... ${Math.round(uploadProgress)}%` :
                   "Processing..."}
                </>
              ) : (
                `${media ? 'Update' : 'Add'} ${displayName}`
              )}
            </Button>
            {(isLoading || isCurrentlyUploading || isDeleting) && (
              <Progress value={uploadProgress} className="w-full" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Remove AddMediaCard and MediaUploadButton components as they are no longer used