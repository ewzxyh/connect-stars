export interface Actor {
  id: number
  name: string
  profile_path: string | null
  popularity: number
}

export interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
}

export interface SearchPersonResponse {
  results: Actor[]
}

export interface PersonMovieCreditsResponse {
  cast: Movie[]
}

export interface MovieCreditsResponse {
  cast: Actor[]
}

export interface PersonDetailsResponse extends Actor {
  // Add other properties if needed
}

export interface MultiSearchResult {
  id: number
  name?: string // For people
  title?: string // For movies
  media_type: 'person' | 'movie'
  poster_path?: string | null
  profile_path?: string | null
  popularity: number
}

export interface MultiSearchResponse {
  results: MultiSearchResult[]
}
