const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const BASE_URL = "https://maps.googleapis.com/maps/api/place";

/**
 * Fetches nearby cinemas using the Google Places API
 * @param {number} latitude - The latitude coordinate
 * @param {number} longitude - The longitude coordinate
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Array>} Array of cinema objects
 */
export const fetchNearbyCinemas = async (
  latitude,
  longitude,
  radius = 5000
) => {
  try {
    const url = `${BASE_URL}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=movie_theater&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_message || "Failed to fetch cinemas");
    }

    return data.results || [];
  } catch (error) {
    console.error("Error fetching cinemas:", error);
    return [];
  }
};

/**
 * Gets details for a specific cinema using its place_id
 * @param {string} placeId - The Google Places ID for the cinema
 * @returns {Promise<Object>} Detailed cinema information
 */
export const getCinemaDetails = async (placeId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,formatted_address,opening_hours,website,reviews&key=${GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_message || "Failed to fetch cinema details");
    }

    return data.result;
  } catch (error) {
    console.error("Error fetching cinema details:", error);
    return null;
  }
};
