import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
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
    const [user, setUser] = useState(null);

    const getActiveToken = () => localStorage.getItem('token');

    const showToast = (message, type = 'success') => {
        toast.dismiss(); 
        if (type === 'success') toast.success(message);
        else if (type === 'error') toast.error(message);
        else if (type === 'info') toast(message, { icon: 'ℹ️' });
        else toast(message);
    };

    const clearCart = useCallback(() => {
        setCart([]);
        setWishlist([]);
        setUser(null);
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        localStorage.removeItem('token');
    }, []);

    const orderSuccessClear = useCallback(async () => {
        try {
            const activeToken = getActiveToken();
            if (activeToken) {
                await axios.delete(`${API_BASE_URL}/api/cart/empty`, {
                    headers: { Authorization: `Bearer ${activeToken}` }
                });
            }
            setCart([]);
            localStorage.removeItem('cart');
        } catch (error) {
            console.error(error);
            setCart([]);
            localStorage.removeItem('cart');
        }
    }, [API_BASE_URL]);

    const fetchUserData = useCallback(async () => {
        const activeToken = getActiveToken(); 
        if (!activeToken) {
            setUser(null);
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
                    quantity: item.quantity,
                    size: item.size,
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
            setUser(true);

        } catch (err) {
            if (err.response?.status === 401) {
                setTimeout(() => clearCart(), 0);
            }
        } finally {
            setLoading(false);
        }
    }, [clearCart, API_BASE_URL]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [cart, wishlist]);

    const addToCart = async (product) => {
        const isExist = cart.find(item => item._id === product._id && item.size === product.size);

        if (isExist) {
            showToast("Item with this size already in bag!", "info");
            return;
        }

        setCart(prev => [...prev, { ...product, quantity: 1 }]);
        showToast("Added to bag! 🔥", "success");
        
        const token = getActiveToken();
        if (token) {
            axios.post(`${API_BASE_URL}/api/cart/add`, { 
                productId: product._id, 
                size: product.size 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.log(e));
        }
    };

    const addToWishlist = async (product) => {
        const isExist = wishlist.find(item => item._id === product._id);

        if (isExist) {
            showToast("Already in wishlist! ❤️", "info");
            return;
        }

        setWishlist(prev => [...prev, product]);
        showToast("Added to wishlist! ✨", "success");
        
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

    const removeFromCart = async (id, size) => {
        setCart(prev => prev.filter(item => !(item._id === id && item.size === size)));
        const token = getActiveToken();
        if (token) {
            axios.delete(`${API_BASE_URL}/api/cart/remove/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { size }
            }).catch(e => console.log(e));
        }
        showToast("Removed from bag.", "error");
    };

    const updateQuantity = async (productId, newQty, size) => {
        if (newQty < 1) return;
        setCart(prev => prev.map(item => 
            (item._id === productId && item.size === size) ? { ...item, quantity: newQty } : item
        ));
        const token = getActiveToken();
        if (token) {
            try {
                await axios.post(`${API_BASE_URL}/api/cart/update`, { 
                    itemId: productId, 
                    quantity: newQty, 
                    size: size 
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <CartContext.Provider value={{ 
            cart, wishlist, loading, user, addToCart, removeFromCart, 
            updateQuantity, addToWishlist, removeFromWishlist, fetchUserData, 
            clearCart, orderSuccessClear 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);