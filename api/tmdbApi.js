const API_KEY = 'a80f392256d3c7c3005432ab07b19299';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchPopularMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const fetchUpcomingMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
};

export const fetchTopRatedMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

export const getImageUrl = (path) => {
  return `https://image.tmdb.org/t/p/w500${path}`;
};

export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export const fetchPopularTVShows = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    return [];
  }
};

export const fetchTopRatedTVShows = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching top rated TV shows:', error);
    return [];
  }
};

export const fetchOnTheAirTVShows = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching on the air TV shows:', error);
    return [];
  }
};

export const fetchTVShowDetails = async (showId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${showId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
};

export const searchMoviesAndTVShows = async (query) => {
  if (!query) return { movies: [], tvShows: [] };
  
  try {
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`),
      fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`)
    ]);
    
    const movieData = await movieResponse.json();
    const tvData = await tvResponse.json();
    
    return {
      movies: movieData.results || [],
      tvShows: tvData.results || []
    };
  } catch (error) {
    console.error('Error searching:', error);
    return { movies: [], tvShows: [] };
  }
};
