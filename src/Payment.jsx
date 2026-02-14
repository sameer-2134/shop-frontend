import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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

    const savedAddress = JSON.parse(localStorage.getItem('shippingAddress'));
    const token = localStorage.getItem('token'); 
    
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 49; 
    const totalAmount = subtotal + shipping;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const handlePayment = async () => {
        if (!savedAddress || !token) {
            toast.error("Required information missing!");
            return;
        }

        // --- COD LOGIC (Updated to save in Database) ---
        if (paymentMode === 'cod') {
            setLoading(true);
            try {
                // COD ke liye hum direct verify endpoint ya ek naya COD endpoint hit kar sakte hain
                // Filhal verify endpoint ko hi simulate kar rahe hain backend data ke liye
                await axios.post('http://localhost:5000/api/payment/verify', {
                    razorpay_order_id: "COD_" + Date.now(),
                    razorpay_payment_id: "CASH_ON_DELIVERY",
                    razorpay_signature: "COD_BYPASS", // Backend handle kar lega
                    email: "sameermansuri8912@gmail.com",
                    amount: totalAmount,
                    items: cart.map(item => ({ 
                        name: item.name, 
                        price: item.price, 
                        qty: item.quantity,
                        image: item.images?.[0] || "" 
                    })),
                    address: savedAddress,
                    status: 'Pending' // COD order pending status mein jayega
                }, { headers: { Authorization: `Bearer ${token}` } });

                setIsProcessing(true);
                setProcessStep(1);
                setTimeout(() => setProcessStep(2), 2000);
                setTimeout(() => setProcessStep(3), 5000);
                setTimeout(() => {
                    orderSuccessClear();
                    localStorage.removeItem('shippingAddress');
                    navigate('/gallery');
                }, 7500);
            } catch (error) {
                toast.error("COD Order failed!");
            } finally {
                setLoading(false);
            }
            return;
        }

        // --- RAZORPAY LOGIC ---
        setLoading(true);
        try {
            const { data: order } = await axios.post('http://localhost:5000/api/payment/order', 
                { amount: totalAmount }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const options = {
                key: "rzp_test_SDxWuePBe6VK93", 
                amount: order.amount,
                currency: order.currency,
                name: "ShopLane",
                order_id: order.id, 
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post('http://localhost:5000/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            email: "sameermansuri8912@gmail.com",
                            amount: totalAmount,
                            // 🔥 FIX: Image ab pakka jayegi
                            items: cart.map(item => ({ 
                                name: item.name, 
                                price: item.price, 
                                qty: item.quantity,
                                image: item.images?.[0] || "" 
                            })),
                            address: savedAddress
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (verifyRes.data.success) {
                            setIsProcessing(true);
                            setProcessStep(1);
                            orderSuccessClear(); 
                            localStorage.removeItem('shippingAddress');
                            setTimeout(() => setProcessStep(2), 2000);
                            setTimeout(() => setProcessStep(3), 5000);
                            setTimeout(() => {
                                navigate('/gallery');
                            }, 7500);
                        }
                    } catch (err) {
                        toast.error("Verification failed!");
                        setIsProcessing(false);
                    }
                },
                prefill: { name: savedAddress.name, contact: savedAddress.phone },
                theme: { color: "#6366f1" },
                modal: { ondismiss: () => setLoading(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error("Server error!");
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
                                    {processStep === 3 ? <FiCheckCircle /> : <FiLoader />}
                                </div>
                            </div>
                            <div className="process-text-content">
                                {processStep === 1 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h3>Payment Verified!</h3>
                                        <p>We are securing your transaction details...</p>
                                    </motion.div>
                                )}
                                {processStep === 2 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h3>Sending Confirmation...</h3>
                                        <p>A digital receipt is being sent to your email. <FiMail /></p>
                                    </motion.div>
                                )}
                                {processStep === 3 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h3>Success! 🥳</h3>
                                        <p>Order confirmed! Redirecting to Gallery...</p>
                                    </motion.div>
                                )}
                            </div>
                            <div className="secure-footer">
                                <FiShield /> 100% Secure Payment Powered by Razorpay
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="payment-layout">
                <div className="payment-box">
                    <div className="payment-header">
                        <h3><FiLock /> Secure Checkout</h3>
                        <p><FiCheckCircle /> Your information is encrypted</p>
                    </div>
                    <div className="payment-options">
                        {[
                            { id: 'upi', icon: <FiSmartphone />, title: 'UPI (PhonePe, GPay, Paytm)', sub: 'Instant & Secure' },
                            { id: 'card', icon: <FiCreditCard />, title: 'Credit / Debit Cards', sub: 'Visa, Master, RuPay' },
                            { id: 'cod', icon: <FiCheckCircle />, title: 'Cash On Delivery', sub: 'Pay when you receive' }
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
                        <div className="price-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                        <div className="price-row"><span>Delivery</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                        <div className="price-row total"><span>Total Amount</span><span>₹{totalAmount}</span></div>
                    </div>
                    <div className="address-snippet">
                        <p>DELIVERING TO</p>
                        <span>{savedAddress?.name}, {savedAddress?.pincode}</span>
                    </div>
                    <button className="pay-now-btn" onClick={handlePayment} disabled={loading || isProcessing}>
                        {loading ? <div className="spinner"></div> : (paymentMode === 'cod' ? 'CONFIRM ORDER' : `PAY ₹${totalAmount}`)}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Payment;