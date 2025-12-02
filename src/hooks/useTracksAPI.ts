import { useQuery } from '@tanstack/react-query'
import type { Track } from '@/types/track'

interface UseTracksAPIParams {
  page?: number
  limit?: number
  genre?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
}

interface TracksAPIResponse {
  tracks: Track[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export function useTracksAPI(params: UseTracksAPIParams = {}) {
  const { page = 1, limit = 24, genre, minPrice, maxPrice, sortBy = 'popular' } = params

  return useQuery<TracksAPIResponse>({
    queryKey: ['tracks', { page, limit, genre, minPrice, maxPrice, sortBy }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      })

      if (genre && genre !== 'all') {
        searchParams.append('genre', genre)
      }
      if (minPrice !== undefined) {
        searchParams.append('minPrice', minPrice.toString())
      }
      if (maxPrice !== undefined) {
        searchParams.append('maxPrice', maxPrice.toString())
      }

      const response = await fetch(`/api/tracks?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch tracks')
      }

      return response.json()
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })
}

export function useTrackDetails(id: string) {
  return useQuery({
    queryKey: ['track', id],
    queryFn: async () => {
      const response = await fetch(`/api/tracks/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Track not found')
        }
        throw new Error('Failed to fetch track details')
      }

      return response.json()
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  })
}
