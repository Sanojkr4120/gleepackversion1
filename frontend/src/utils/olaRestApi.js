import axios from 'axios';

const API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY;
const BASE_URL = 'https://api.olamaps.io';

// Helper to generate a unique request ID
const getRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const olaRestApi = {
    /**
     * Autocomplete API
     * @param {string} input - The text to search for
     * @param {string} location - Optional lat,lng string (e.g., "12.931,77.616")
     * @param {number} radius - Optional radius in meters
     */
    autocomplete: async (input, location = null, radius = 5000) => {
        try {
            const params = {
                input,
                api_key: API_KEY,
                strictbounds: !!location,
                radius: location ? radius : undefined,
                location: location || undefined
            };

            const response = await axios.get(`${BASE_URL}/places/v1/autocomplete`, {
                params,
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Autocomplete Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Place Details API (Advanced)
     * @param {string} placeId - The place ID from autocomplete
     */
    getPlaceDetails: async (placeId) => {
        try {
            const response = await axios.get(`${BASE_URL}/places/v1/details`, {
                params: {
                    place_id: placeId,
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Place Details Error:', error);
            throw error;
        }
    },

    /**
     * Distance Matrix API
     * @param {string} origins - Lat,Lng string (e.g., "12.931,77.616")
     * @param {string} destinations - Lat,Lng string
     */
    getDistanceMatrix: async (origins, destinations) => {
        try {
            const response = await axios.get(`${BASE_URL}/routing/v1/distanceMatrix`, {
                params: {
                    origins,
                    destinations,
                    mode: 'driving',
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Distance Matrix Error:', error);
            throw error;
        }
    },

    /**
     * Snap To Road API
     * @param {string} points - Pipe separated Lat,Lng (e.g., "12.999,77.673|12.992,77.658")
     * @param {boolean} enhancePath - Whether to enhance the path
     */
    snapToRoad: async (points, enhancePath = false) => {
        try {
            const response = await axios.get(`${BASE_URL}/routing/v1/snapToRoad`, {
                params: {
                    points,
                    enhancePath,
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Snap To Road Error:', error);
            throw error;
        }
    },

    /**
     * Nearest Roads API
     * @param {string} points - Comma separated Lat,Lng (e.g., "12.935,77.663") or pipe separated for multiple
     * @param {number} radius - Radius in meters
     */
    nearestRoads: async (points, radius = 100) => {
        try {
            const response = await axios.get(`${BASE_URL}/routing/v1/nearestRoads`, {
                params: {
                    points,
                    radius,
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Nearest Roads Error:', error);
            throw error;
        }
    },

    /**
     * Reverse Geocoding API
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    reverseGeocode: async (lat, lng) => {
        try {
            const response = await axios.get(`${BASE_URL}/places/v1/reverse-geocode`, {
                params: {
                    latlng: `${lat},${lng}`,
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Reverse Geocode Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Geocoding API
     * @param {string} address - The address to geocode
     */
    geocode: async (address) => {
        try {
            const response = await axios.get(`${BASE_URL}/places/v1/geocode`, {
                params: {
                    address: address,
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Geocode Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Address Validation API
     * @param {string} address - The address to validate
     */
    validateAddress: async (address) => {
        try {
            const response = await axios.get(`${BASE_URL}/places/v1/addressvalidation`, {
                params: {
                    address,
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Address Validation Error:', error);
            throw error;
        }
    },

    /**
     * Nearby Search API (Advanced)
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {string} type - Type of place (e.g., "restaurant")
     * @param {number} radius - Radius in meters (not always used in advanced but kept for compat)
     */
    nearbySearch: async (lat, lng, type = 'restaurant', radius = 10000) => {
        try {
            const response = await axios.get(`${BASE_URL}/places/v1/nearbysearch/advanced`, {
                params: {
                    location: `${lat},${lng}`,
                    types: type,
                    radius, // Note: Advanced API might rely more on viewport or other params, but passing radius is often safe
                    layers: 'venue', // As per sample request
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Nearby Search Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Elevation API
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    getElevation: async (lat, lng) => {
        try {
            const response = await axios.get(`${BASE_URL}/places/v1/elevation`, {
                params: {
                    location: `${lat},${lng}`,
                    api_key: API_KEY
                },
                headers: { 'X-Request-Id': getRequestId() }
            });
            return response.data;
        } catch (error) {
            console.error('Ola Maps Elevation Error:', error);
            throw error;
        }
    },

    /**
     * Geofencing API
     */
    geofencing: {
        create: async (geofenceData) => {
            try {
                const response = await axios.post(`${BASE_URL}/geofences`, geofenceData, {
                    params: { api_key: API_KEY },
                    headers: { 'X-Request-Id': getRequestId() }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps Create Geofence Error:', error);
                throw error;
            }
        },
        update: async (geofenceId, geofenceData) => {
            try {
                const response = await axios.put(`${BASE_URL}/geofences/${geofenceId}`, geofenceData, {
                    params: { api_key: API_KEY },
                    headers: { 'X-Request-Id': getRequestId() }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps Update Geofence Error:', error);
                throw error;
            }
        },
        delete: async (geofenceId) => {
            try {
                const response = await axios.delete(`${BASE_URL}/geofences/${geofenceId}`, {
                    params: { api_key: API_KEY },
                    headers: { 'X-Request-Id': getRequestId() }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps Delete Geofence Error:', error);
                throw error;
            }
        },
        get: async (geofenceId) => {
            try {
                const response = await axios.get(`${BASE_URL}/geofences/${geofenceId}`, {
                    params: { api_key: API_KEY },
                    headers: { 'X-Request-Id': getRequestId() }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps Get Geofence Error:', error);
                throw error;
            }
        },
        list: async (page = 1, size = 10) => {
            try {
                const response = await axios.get(`${BASE_URL}/geofences`, {
                    params: { page, size, api_key: API_KEY },
                    headers: { 'X-Request-Id': getRequestId() }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps List Geofences Error:', error);
                throw error;
            }
        },
        checkStatus: async (lat, lng, geofenceId) => {
            try {
                const response = await axios.get(`${BASE_URL}/geofences/${geofenceId}/status`, {
                    params: {
                        lat,
                        lng,
                        api_key: API_KEY
                    },
                    headers: { 'X-Request-Id': getRequestId() }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps Geofence Status Error:', error);
                throw error;
            }
        }
    },

    /**
     * Street View API
     */
    streetView: {
        getCoverage: async (xMin, yMin, xMax, yMax) => {
            try {
                const response = await axios.get(`${BASE_URL}/sli/v1/streetview/coverage`, {
                    params: {
                        xMin, yMin, xMax, yMax,
                        api_key: API_KEY
                    },
                    headers: { 'accept': '*/*' }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps Street View Coverage Error:', error);
                throw error;
            }
        },
        getImageId: async (lat, lon, radius) => {
            try {
                const response = await axios.get(`${BASE_URL}/sli/streetview/imageId`, {
                    params: {
                        lat, lon, radius,
                        api_key: API_KEY
                    },
                    headers: { 'accept': '*/*' }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps Street View ImageId Error:', error);
                throw error;
            }
        },
        getMetadata: async (imageId) => {
            try {
                const response = await axios.get(`${BASE_URL}/sli/streetview/metadata`, {
                    params: {
                        imageId,
                        api_key: API_KEY
                    },
                    headers: { 'accept': '*/*' }
                });
                return response.data;
            } catch (error) {
                console.error('Ola Maps Street View Metadata Error:', error);
                throw error;
            }
        }
    }
};
