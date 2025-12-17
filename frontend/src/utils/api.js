import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      (error.response &&
        error.response.data &&
        error.response.data.message) ||
      error.message ||
      error.toString();

    // Optional: Handle 401 Unauthorized globally (e.g., logout user)
    if (error.response && error.response.status === 401) {
        // We could emit an event or call a logout function here if we had access to context
        // For now, we just pass the error through
    }

    // Attach formatted message to error object for easier access
    error.formattedMessage = message;
    
    return Promise.reject(error);
  }
);

export default api;
