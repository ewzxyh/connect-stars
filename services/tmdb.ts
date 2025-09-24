import {
  type MovieCreditsResponse,
  type PersonMovieCreditsResponse,
  type SearchPersonResponse,
  type PersonDetailsResponse,
  type MultiSearchResponse,
} from '@/types/tmdb'

const TMDB_ACCESS_TOKEN = process.env.TMDB_TOKEN
const TMDB_API_URL = 'https://api.themoviedb.org/3'

async function fetchTMDB(endpoint: string) {
  const url = `${TMDB_API_URL}/${endpoint}`
  const options = {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    },
  }

  const res = await fetch(url, options)

  if (!res.ok) {
    throw new Error(`Failed to fetch TMDB data from ${endpoint}`)
  }

  return res.json()
}

export async function multiSearch(
  query: string,
): Promise<MultiSearchResponse> {
  return fetchTMDB(
    `search/multi?query=${encodeURIComponent(query)}&language=en-US,pt-BR`,
  )
}

export async function getPersonDetails(
  personId: number,
): Promise<PersonDetailsResponse> {
  return fetchTMDB(`person/${personId}?language=en-US,pt-BR`)
}

export async function searchPerson(
  query: string,
): Promise<SearchPersonResponse> {
  return fetchTMDB(
    `search/person?query=${encodeURIComponent(
      query,
    )}&include_adult=false&language=en-US,pt-BR`,
  )
}

export async function getPersonMovieCredits(
  personId: number,
): Promise<PersonMovieCreditsResponse> {
  return fetchTMDB(`person/${personId}/movie_credits?language=en-US,pt-BR`)
}

export async function getMovieCredits(
  movieId: number,
): Promise<MovieCreditsResponse> {
  return fetchTMDB(`movie/${movieId}/credits?language=en-US,pt-BR`)
}
