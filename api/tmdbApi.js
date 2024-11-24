const API_KEY = "a80f392256d3c7c3005432ab07b19299";
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Fetches a list of popular movies from TMDB API
 * @returns {Promise<Array>} Array of popular movie objects
 */
export const fetchPopularMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
};

/**
 * Fetches a list of upcoming movies from TMDB API
 * @returns {Promise<Array>} Array of upcoming movie objects
 */
export const fetchUpcomingMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    return [];
  }
};

/**
 * Fetches a list of top rated movies from TMDB API
 * @returns {Promise<Array>} Array of top rated movie objects
 */
export const fetchTopRatedMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    return [];
  }
};

/**
 * Generates a full image URL from a TMDB image path
 * @param {string} path - The image path from TMDB
 * @returns {string} Complete image URL
 */
export const getImageUrl = (path) => {
  return `https://image.tmdb.org/t/p/w500${path}`;
};

/**
 * Fetches detailed information about a specific movie including credits
 * @param {string|number} movieId - The ID of the movie
 * @returns {Promise<Object|null>} Movie details object or null if error
 */
export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

/**
 * Fetches a list of popular TV shows from TMDB API
 * @returns {Promise<Array>} Array of popular TV show objects
 */
export const fetchPopularTVShows = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    return [];
  }
};

/**
 * Fetches a list of top rated TV shows from TMDB API
 * @returns {Promise<Array>} Array of top rated TV show objects
 */
export const fetchTopRatedTVShows = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching top rated TV shows:", error);
    return [];
  }
};

/**
 * Fetches a list of currently airing TV shows
 * @returns {Promise<Array>} Array of on-air TV show objects
 */
export const fetchOnTheAirTVShows = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching on the air TV shows:", error);
    return [];
  }
};

/**
 * Fetches detailed information about a specific TV show including credits
 * @param {string|number} showId - The ID of the TV show
 * @returns {Promise<Object>} TV show details object
 * @throws {Error} If the fetch fails
 */
export const fetchTVShowDetails = async (showId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${showId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV show details:", error);
    throw error;
  }
};

/**
 * Searches for both movies and TV shows based on a query string
 * @param {string} query - The search query
 * @returns {Promise<Object>} Object containing arrays of matching movies and TV shows
 */
export const searchMoviesAndTVShows = async (query) => {
  if (!query) return { movies: [], tvShows: [] };

  try {
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&page=1`
      ),
      fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&page=1`
      ),
    ]);

    const movieData = await movieResponse.json();
    const tvData = await tvResponse.json();

    return {
      movies: movieData.results || [],
      tvShows: tvData.results || [],
    };
  } catch (error) {
    console.error("Error searching:", error);
    return { movies: [], tvShows: [] };
  }
};
