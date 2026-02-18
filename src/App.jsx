import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- COMPONENTS ---
import Navbar from './Navbar';
import Register from './Register';
import Login from './Login';
import Gallery from './Gallery';
import ProductDetails from './ProductDetails';
import Cart from './Cart'; 
import ProtectedRoute from './ProtectedRoute'; 
import ForgotPassword from './ForgotPassword'; 
import AdminProduct from './AdminProduct';
import Profile from './Profile';
import Footer from './Footer';
import AddressSection from "./AddressSection";
import Payment from './Payment'; 
import Atelier from './pages/Admin/Atelier'; 
import Wishlist from './Wishlist'; 
import ScrollToTop from "./ScrollToTop";
import Orders from './Orders';

// --- ADMIN DASHBOARD ---
import AdminLayout from './AdminLayout'; 
import AdminCustomers from './AdminCustomers'; 
import AdminStats from './AdminStats';
import AdminInventory from './AdminInventory'; 
import AdminOrders from './pages/Admin/AdminOrders'; 

const Layout = ({ children, token }) => {
  const location = useLocation();
  
  // Routes jahan Navbar/Footer nahi dikhana
  const noNavPaths = ['/register', '/login', '/forgot-password', '/atelier', '/admin-dashboard']; 
  
  const shouldShow = useMemo(() => {
    // Agar path noNavPaths mein hai toh kabhi mat dikhao
    const isExcludedPath = noNavPaths.some(path => location.pathname.startsWith(path));
    // Dikhana tabhi hai jab token ho aur path excluded na ho
    return token && !isExcludedPath;
  }, [token, location.pathname]);

  return (
    <>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={2000} limit={1} />
      <Toaster position="top-right" /> 
      
      {shouldShow && <Navbar />}
      <main style={{ minHeight: '80vh' }}>{children}</main>
      {shouldShow && <Footer />}
    </>
  );
};

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // ✅ Client ID ab .env se uthayega, fallback ke liye teri purani ID rakhi hai
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "280292727223-rlh3i44omc3hsrp5ib643dul2dulnqj8.apps.googleusercontent.com";

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
      setToken(localStorage.getItem('token'));
    };
    // Sync across tabs and manual dispatch
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAdmin = useMemo(() => user?.email === 'sameermansuri8912@gmail.com', [user]);
  const isAuthenticated = !!token;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <CartProvider> 
        <Router>
          <Layout token={token}>
            <Routes>
              {/* AUTH ROUTES */}
              <Route path="/" element={isAuthenticated ? <Navigate to="/gallery" /> : <Register />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/gallery" /> : <Register />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/gallery" /> : <Login setUser={setUser} setToken={setToken} />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* PROTECTED USER ROUTES */}
              <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/checkout/address" element={<ProtectedRoute><AddressSection /></ProtectedRoute>} />
              <Route path="/checkout/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              
              {/* ADMIN SPECIAL ROUTES */}
              <Route path="/atelier/*" element={isAdmin ? <ProtectedRoute adminOnly={true}><Atelier /></ProtectedRoute> : <Navigate to="/" />} />
              
              <Route path="/admin-dashboard" element={isAdmin ? <AdminLayout /> : <Navigate to="/" />}>
                <Route index element={<AdminStats />} />
                <Route path="stats" element={<AdminStats />} />
                <Route path="add-product" element={<AdminProduct />} /> 
                <Route path="products" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} /> 
                <Route path="users" element={<AdminCustomers />} /> 
              </Route>

              {/* 404 Redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </GoogleOAuthProvider>
  );
}

export default App;