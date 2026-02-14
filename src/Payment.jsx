import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Consistent with other files
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; 
import { FiCreditCard, FiSmartphone, FiCheckCircle, FiShield, FiLock, FiMail, FiLoader } from 'react-icons/fi';
import './Payment.css';

const Payment = () => {
    const navigate = useNavigate();
    const { orderSuccessClear, cart } = useCart(); 
    const [paymentMode, setPaymentMode] = useState('upi');
    const [loading, setLoading] = useState(false);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStep, setProcessStep] = useState(1); 

    // ✅ Dynamic API & RZP Key
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const RZP_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

    const savedAddress = JSON.parse(localStorage.getItem('shippingAddress'));
    const token = localStorage.getItem('token'); 
    const user = JSON.parse(localStorage.getItem('user'));
    
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 49; 
    const totalAmount = subtotal + shipping;

    useEffect(() => {
        // Redirect if cart is empty or address missing
        if (cart.length === 0) {
            navigate('/gallery');
            return;
        }
        if (!savedAddress) {
            toast.error("Please provide shipping details first");
            navigate('/checkout'); // Assuming checkout is where address is filled
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, [cart.length, navigate, savedAddress]);

    const handleSuccessFlow = () => {
        setIsProcessing(true);
        setProcessStep(1);
        orderSuccessClear(); 
        localStorage.removeItem('shippingAddress');
        
        setTimeout(() => setProcessStep(2), 2000);
        setTimeout(() => setProcessStep(3), 5000);
        setTimeout(() => navigate('/gallery'), 7500);
    };

    const handlePayment = async () => {
        if (!token) {
            toast.error("Authentication required!");
            return;
        }

        setLoading(true);
        const orderData = {
            email: user?.email || "customer@example.com",
            amount: totalAmount,
            items: cart.map(item => ({ 
                name: item.name, 
                price: item.price, 
                qty: item.quantity,
                image: item.images?.[0] || "" 
            })),
            address: `${savedAddress.address}, ${savedAddress.city}, ${savedAddress.state} - ${savedAddress.pincode}`
        };

        try {
            // --- COD LOGIC ---
            if (paymentMode === 'cod') {
                await axios.post(`${API_BASE_URL}/api/payment/verify`, {
                    ...orderData,
                    razorpay_order_id: "COD_" + Date.now(),
                    razorpay_payment_id: "CASH_ON_DELIVERY",
                    razorpay_signature: "COD_BYPASS",
                    status: 'Pending'
                }, { headers: { Authorization: `Bearer ${token}` } });

                handleSuccessFlow();
                return;
            }

            // --- RAZORPAY LOGIC ---
            const { data: order } = await axios.post(`${API_BASE_URL}/api/payment/order`, 
                { amount: totalAmount }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const options = {
                key: RZP_KEY_ID, 
                amount: order.amount,
                currency: order.currency,
                name: "ShopLane",
                description: "Premium Purchase",
                order_id: order.id, 
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post(`${API_BASE_URL}/api/payment/verify`, {
                            ...orderData,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { headers: { Authorization: `Bearer ${token}` } });

                        if (verifyRes.data.success) {
                            handleSuccessFlow();
                        }
                    } catch (err) {
                        toast.error("Verification failed!");
                        setIsProcessing(false);
                    }
                },
                prefill: { 
                    name: savedAddress.name, 
                    contact: savedAddress.phone,
                    email: user?.email 
                },
                theme: { color: "#6366f1" },
                modal: { ondismiss: () => setLoading(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Payment Error:", error);
            toast.error(error.response?.data?.message || "Transaction failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-page-wrapper">
            <AnimatePresence>
                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="processing-overlay">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="process-card">
                            <div className="process-loader-container">
                                <div className="process-loader"></div>
                                <div className="check-icon-inner">
                                    {processStep === 3 ? <FiCheckCircle /> : <FiLoader className="spin" />}
                                </div>
                            </div>
                            <div className="process-text-content">
                                {processStep === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h3>Payment Verified!</h3>
                                        <p>Securing your transaction details...</p>
                                    </motion.div>
                                )}
                                {processStep === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h3>Sending Confirmation...</h3>
                                        <p>Check your email for the digital receipt. <FiMail /></p>
                                    </motion.div>
                                )}
                                {processStep === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h3>Success! 🥳</h3>
                                        <p>Order confirmed! Redirecting to Gallery...</p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="payment-layout">
                <div className="payment-box">
                    <div className="payment-header">
                        <h3><FiLock /> Secure Checkout</h3>
                        <p><FiCheckCircle /> AES-256 Encryption Active</p>
                    </div>
                    <div className="payment-options">
                        {[
                            { id: 'upi', icon: <FiSmartphone />, title: 'UPI (GPay, PhonePe, Paytm)', sub: 'Instant & Secure' },
                            { id: 'card', icon: <FiCreditCard />, title: 'Credit / Debit Cards', sub: 'Visa, Master, RuPay' },
                            { id: 'cod', icon: <FiCheckCircle />, title: 'Cash On Delivery', sub: 'Pay at your doorstep' }
                        ].map((mode) => (
                            <div key={mode.id} className={`pay-card ${paymentMode === mode.id ? 'active' : ''}`} onClick={() => setPaymentMode(mode.id)}>
                                <div className="pay-icon">{mode.icon}</div>
                                <div className="pay-text">
                                    <p>{mode.title}</p>
                                    <span>{mode.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="order-summary-box">
                    <h4>Order Summary</h4>
                    <div className="price-breakdown">
                        <div className="price-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                        <div className="price-row"><span>Delivery</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                        <div className="price-row total"><span>Total</span><span>₹{totalAmount.toLocaleString()}</span></div>
                    </div>
                    <div className="address-snippet">
                        <p>SHIP TO</p>
                        <span>{savedAddress?.name}</span>
                        <small>{savedAddress?.city}, {savedAddress?.pincode}</small>
                    </div>
                    <button className="pay-now-btn" onClick={handlePayment} disabled={loading || isProcessing}>
                        {loading ? <div className="spinner"></div> : (paymentMode === 'cod' ? 'PLACE ORDER' : `PAY ₹${totalAmount.toLocaleString()}`)}
                    </button>
                    <div className="secure-badge">
                        <FiShield /> SSL SECURED
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Payment;