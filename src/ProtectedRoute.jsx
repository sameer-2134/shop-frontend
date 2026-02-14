import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    // 1. LocalStorage se user aur token nikaalna
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // 2. Agar login nahi hai toh login page par redirect karein
    if (!token || !storedUser) {
        return <Navigate to="/login" replace />;
    }

    // ✅ Sameer ki Master Email (Permanent Bypass)
    const masterAdminEmail = "sameermansuri8912@gmail.com";

    // 3. Agar route Admin-only hai
    if (adminOnly) {
        // Check karo ki role 'admin' hai YA email Sameer ki hai
        const isAdmin = storedUser.role === 'admin' || storedUser.email === masterAdminEmail;
        
        if (!isAdmin) {
            alert("Access Denied: Sirf Sameer (Admin) hi yahan ja sakta hai! ✋");
            return <Navigate to="/gallery" replace />;
        }
    }

    // Sab check pass ho gaye toh content dikhao
    return children;
};

export default ProtectedRoute;