import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Try to refresh the token
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // Update tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// AUTH API
// ============================================

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: (data) => api.post('/auth/logout', data),
    getCurrentUser: () => api.get('/auth/me'),
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// ============================================
// TRIPS API
// ============================================

export const tripsApi = {
    getTrips: (params) => api.get('/trips', { params }),
    getTripBySlug: (slug) => api.get(`/trips/${slug}`),
    getTripDepartures: (id, params) => api.get(`/trips/${id}/departures`, { params }),
};

// ============================================
// BOOKINGS API
// ============================================

export const bookingsApi = {
    createBooking: (data) => api.post('/bookings', data),
    getMyBookings: (params) => api.get('/bookings/my', { params }),
    getBookingById: (id) => api.get(`/bookings/${id}`),
    cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data),
};

// ============================================
// PAYMENTS API
// ============================================

export const paymentsApi = {
    createPayment: (data) => api.post('/payments', data),
    getAllPayments: (params) => api.get('/payments', { params }),
    confirmPayment: (id) => api.put(`/payments/${id}/confirm`),
};

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
    // Trips
    getAllTrips: (params) => api.get('/admin/trips', { params }),
    createTrip: (data) => api.post('/admin/trips', data),
    updateTrip: (id, data) => api.put(`/admin/trips/${id}`, data),
    deleteTrip: (id) => api.delete(`/admin/trips/${id}`),

    // Departures
    getAllDepartures: (params) => api.get('/admin/departures', { params }),
    createDeparture: (data) => api.post('/admin/departures', data),
    updateDeparture: (id, data) => api.put(`/admin/departures/${id}`, data),
    deleteDeparture: (id) => api.delete(`/admin/departures/${id}`),

    // Bookings
    getAllBookings: (params) => api.get('/admin/bookings', { params }),
    updateBookingStatus: (id, data) => api.put(`/admin/bookings/${id}/status`, data),

    // Destinations
    getAllDestinations: () => api.get('/admin/destinations'),
    createDestination: (data) => api.post('/admin/destinations', data),

    // Users
    getAllUsers: (params) => api.get('/admin/users', { params }),
    updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
    updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
};

// ============================================
// CUSTOMERS API
// ============================================

export const customersApi = {
    getAllCustomers: (params) => api.get('/customers', { params }),
    getCustomerById: (id) => api.get(`/customers/${id}`),
};

// ============================================
// REPORTS API
// ============================================

export const reportsApi = {
    getSummary: () => api.get('/reports/summary'),
    getRevenue: (params) => api.get('/reports/revenue', { params }),
    getBookingsReport: (params) => api.get('/reports/bookings', { params }),
};

export default api;
