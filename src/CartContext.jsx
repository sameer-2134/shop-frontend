import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Dynamic API URL for production
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    const [loading, setLoading] = useState(true);

    const getActiveToken = () => localStorage.getItem('token');

    // 1. Logout/Full Clear
    const clearCart = useCallback(() => {
        setCart([]);
        setWishlist([]);
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        localStorage.removeItem('token');
    }, []);

    // ✅ Order Success Clear (DB + State + LocalStorage)
    const orderSuccessClear = useCallback(async () => {
        try {
            const activeToken = getActiveToken();
            
            // Step A: Backend se cart delete karo
            if (activeToken) {
                await axios.delete(`${API_BASE_URL}/api/cart/empty`, {
                    headers: { Authorization: `Bearer ${activeToken}` }
                });
            }

            // Step B: Frontend state + LocalStorage khali karo
            setCart([]);
            localStorage.removeItem('cart');
            
            console.log("Cart cleared from everywhere! 🔥");
        } catch (error) {
            console.error("Error clearing cart after order:", error);
            setCart([]);
            localStorage.removeItem('cart');
        }
    }, [API_BASE_URL]);

    // 2. Fetch User Data from Server
    const fetchUserData = useCallback(async () => {
        const activeToken = getActiveToken(); 
        if (!activeToken) {
            setLoading(false);
            return;
        }

        try {
            const [cartRes, wishRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/cart`, { headers: { Authorization: `Bearer ${activeToken}` } }),
                axios.get(`${API_BASE_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${activeToken}` } })
            ]);

            const serverCart = cartRes.data.products?.map(item => {
                if (!item.productId) return null;
                return {
                    ...item.productId,
                    _id: item.productId._id || item.productId,
                    quantity: item.quantity || 1,
                    cartItemId: item._id
                };
            }).filter(Boolean) || [];

            const serverWish = wishRes.data.products?.map(item => {
                if (!item || !item.productId) return null;
                return {
                    ...(typeof item.productId === 'object' ? item.productId : {}),
                    _id: typeof item.productId === 'object' ? item.productId._id : item.productId
                };
            }).filter(Boolean) || [];

            setWishlist(serverWish);
            setCart(serverCart);

        } catch (err) {
            console.error("Data fetch error:", err);
            if (err.response?.status === 401) clearCart();
        } finally {
            setLoading(false);
        }
    }, [clearCart, API_BASE_URL]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // LocalStorage sync
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [cart, wishlist]);

    const showToast = (message, type = 'success') => {
        toast.dismiss();
        if (type === 'success') toast.success(message);
        else if (type === 'error') toast.error(message);
        else toast(message);
    };

    const addToCart = async (product) => {
        setCart(prev => {
            if (prev.find(item => item._id === product._id)) {
                showToast("Item already in bag!", "info");
                return prev;
            }
            showToast("Added to bag! 🔥", "success");
            return [...prev, { ...product, quantity: 1 }];
        });
        
        const token = getActiveToken();
        if (token) {
            axios.post(`${API_BASE_URL}/api/cart/add`, { productId: product._id }, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.log(e));
        }
    };

    const addToWishlist = async (product) => {
        setWishlist(prev => {
            if (prev.find(item => item._id === product._id)) {
                showToast("Already in wishlist! ❤️", "info");
                return prev;
            }
            showToast("Added to wishlist! ✨", "success");
            return [...prev, product];
        });
        
        const token = getActiveToken();
        if (token) {
            axios.post(`${API_BASE_URL}/api/wishlist/add`, { productId: product._id }, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.log(e));
        }
    };

    const removeFromWishlist = async (id) => {
        setWishlist(prev => prev.filter(item => item._id !== id));
        const token = getActiveToken();
        if (token) {
            axios.delete(`${API_BASE_URL}/api/wishlist/remove/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.log(e));
        }
        showToast("Removed from wishlist.", "error");
    };

    const removeFromCart = async (id) => {
        setCart(prev => prev.filter(item => item._id !== id));
        const token = getActiveToken();
        if (token) {
            axios.delete(`${API_BASE_URL}/api/cart/remove/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.log(e));
        }
        showToast("Removed from bag.", "error");
    };

    const updateQuantity = async (productId, newQty) => {
        if (newQty < 1) return;
        setCart(prev => prev.map(item => item._id === productId ? { ...item, quantity: newQty } : item));
        const token = getActiveToken();
        if (token) {
            axios.put(`${API_BASE_URL}/api/cart/update`, { productId, quantity: newQty }, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.log(e));
        }
    };

    return (
        <CartContext.Provider value={{ 
            cart, wishlist, loading, addToCart, removeFromCart, 
            updateQuantity, addToWishlist, removeFromWishlist, fetchUserData, 
            clearCart, orderSuccessClear 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);