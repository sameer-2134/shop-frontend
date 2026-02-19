import React from 'react';
import { useCart } from './CartContext';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiShield, FiTruck } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    // ✅ Dynamic API URL for production
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const getFullUrl = (img) => {
        if (!img) return "https://placehold.co/100x150?text=No+Image";
        if (img.startsWith('http')) return img;
        return `${API_BASE_URL}/${img.replace(/\\/g, '/')}`;
    };

    const totalMRP = cart.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const platformFee = cart.length > 0 ? 20 : 0;
    const totalAmount = totalMRP + platformFee;

    // --- Empty Cart State ---
    if (!cart || cart.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="empty-cart-container"
            >
                <div className="empty-cart-content">
                    <div className="cart-icon-wrapper">
                        <FiShoppingBag size={50} color="#ff3f6c" />
                    </div>
                    <h3>Hey, it feels so light!</h3>
                    <p>There is nothing in your bag. Let's add some items to make it happy!</p>
                    <button className="shop-now-btn" onClick={() => navigate('/gallery')}>
                        EXPLORE GALLERY
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="cart-page-wrapper">
            <div className="cart-stepper-container">
                <div className="cart-stepper">
                    <span className="step active">BAG</span>
                    <span className="step-line active"></span>
                    <span className="step">ADDRESS</span>
                    <span className="step-line"></span>
                    <span className="step">PAYMENT</span>
                </div>
            </div>

            <div className="cart-content-container">
                <div className="cart-items-section">
                    <AnimatePresence mode="popLayout">
                        {cart.map((item) => (
                            <motion.div 
                                key={`${item._id}-${item.size}`} 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="cart-card-premium"
                            >
                                {/* Remove Button */}
                                <button className="remove-btn-3d" onClick={() => removeFromCart(item._id, item.size)}>
                                    <FiX />
                                </button>

                                <div className="cart-card-inner">
                                    <Link to={`/product/${item._id}`} className="cart-img-3d-wrap">
                                        <img src={getFullUrl(item.images?.[0])} alt={item.name} />
                                    </Link>
                                    
                                    <div className="cart-item-info">
                                        <h3 className="brand-label">{item.brand || 'ShopLane Premium'}</h3>
                                        <h4 className="product-title">{item.name}</h4>
                                        
                                        {/* FIXED SIZE SECTION */}
                                        <div className="cart-item-details-row">
                                            <div className="size-selector-badge">
                                                <span>Size: <strong>{item.size || 'Free Size'}</strong></span>
                                            </div>
                                            <div className="qty-selector-badge">
                                                <span>Qty: <strong>{item.quantity || 1}</strong></span>
                                            </div>
                                        </div>

                                        <div className="qty-price-flex">
                                            <div className="modern-qty-box">
                                                <button 
                                                    onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1, item.size)} 
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <FiMinus />
                                                </button>
                                                <span className="qty-num">{item.quantity || 1}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1, item.size)}
                                                >
                                                    <FiPlus />
                                                </button>
                                            </div>
                                            
                                            <div className="price-stack">
                                                <span className="current-p">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <p className="return-policy"><strong>14 days</strong> return available</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="price-sidebar-premium"
                >
                    <div className="bill-card-3d">
                        <p className="summary-title">PRICE DETAILS ({cart.length} Items)</p>
                        <div className="bill-rows">
                            <div className="b-row">
                                <span>Total MRP</span>
                                <span>₹{totalMRP.toLocaleString()}</span>
                            </div>
                            <div className="b-row">
                                <span>Platform Fee</span>
                                <span className="text-success">₹{platformFee}</span>
                            </div>
                            <div className="b-row">
                                <span>Shipping Fee</span>
                                <span className="text-success">FREE</span>
                            </div>
                            <div className="divider"></div>
                            <div className="b-row total-amount">
                                <span>Total Amount</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="place-order-btn-3d" onClick={() => navigate('/checkout/address')}>
                            PLACE ORDER 
                        </button>

                        <div className="trust-footer">
                            <div className="trust-item"><FiShield /> 100% SECURE</div>
                            <div className="trust-item"><FiTruck /> FAST DELIVERY</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Internal icon fix for the remove button
const FiX = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default Cart;