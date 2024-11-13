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

export const getImageUrl = (path) => {
  return `https://image.tmdb.org/t/p/w500${path}`;
};
