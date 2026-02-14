import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true // 👈 Ye sabse important hai cookies ke liye
});

export const uploadBulkProducts = (formData) => API.post('/api/products/add', formData);
// Baki admin APIs yahan aayengi...