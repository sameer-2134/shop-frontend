import React from 'react';
import { useCart } from './CartContext';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiShield, FiTruck, FiArrowLeft } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();
    const API_BASE_URL = "http://localhost:5000/";

    const getFullUrl = (img) => {
        if (!img) return "https://placehold.co/100x150?text=No+Image";
        return img.startsWith('http') ? img : `${API_BASE_URL}${img.replace(/\\/g, '/')}`;
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
            {/* Minimalist Stepper */}
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
                {/* Left Side: Items List */}
                <div className="cart-items-section">
                    <AnimatePresence mode="popLayout">
                        {cart.map((item) => (
                            <motion.div 
                                key={item._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="cart-card-premium"
                            >
                                <button className="remove-btn-3d" onClick={() => removeFromCart(item._id)}>
                                    <FiTrash2 />
                                </button>

                                <div className="cart-card-inner">
                                    <Link to={`/product/${item._id}`} className="cart-img-3d-wrap">
                                        <img src={getFullUrl(item.images?.[0])} alt={item.name} />
                                    </Link>
                                    
                                    <div className="cart-item-info">
                                        <h3 className="brand-label">{item.brand || 'ShopLane Premium'}</h3>
                                        <h4 className="product-title">{item.name}</h4>
                                        
                                        <div className="qty-price-flex">
                                            <div className="modern-qty-box">
                                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}><FiMinus /></button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}><FiPlus /></button>
                                            </div>
                                            <div className="price-stack">
                                                <span className="current-p">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Right Side: Bill Summary */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="price-sidebar-premium">
                    <div className="bill-card-3d">
                        <p className="summary-title">ORDER SUMMARY ({cart.length} Items)</p>
                        <div className="bill-rows">
                            <div className="b-row"><span>Total MRP</span><span>₹{totalMRP.toLocaleString()}</span></div>
                            <div className="b-row"><span>Platform Fee</span><span className="text-success">₹{platformFee}</span></div>
                            <div className="b-row"><span>Shipping</span><span className="text-success">FREE</span></div>
                            <div className="b-row total-amount">
                                <span>Total Payable</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="trust-footer">
                            <span><FiShield /> 100% SECURE</span>
                            <span><FiTruck /> FAST DELIVERY</span>
                        </div>

                        <button className="place-order-btn-3d" onClick={() => navigate('/checkout/address')}>
                            PLACE ORDER 
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cart;