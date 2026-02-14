import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import { Mail, Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'; 
import { GoogleLogin } from '@react-oauth/google'; 
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import './Register.css';

// --- PREMIUM WELCOME MODAL COMPONENT ---
const WelcomeModal = ({ show, name }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="welcome-overlay">
                <motion.div 
                    initial={{ scale: 0.5, y: 100 }} 
                    animate={{ scale: 1, y: 0 }} 
                    className="welcome-card-3d"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    <motion.div animate={{ rotateY: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <CheckCircle2 size={80} color="#00ffcc" strokeWidth={1.5} />
                    </motion.div>
                    <h2>Welcome to the Elite, <br/><span>{name}</span></h2>
                    <p>Your portal to premium shopping is now active.</p>
                    <div className="loading-bar-container">
                        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="loading-bar-fill" />
                    </div>
                    <span className="redirect-text">Teleporting to Gallery...</span>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    
    const [showWelcome, setShowWelcome] = useState(false);
    const [userName, setUserName] = useState("");

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- ✅ GOOGLE LOGIN LOGIC ---
    const handleGoogleSuccess = async (credentialResponse) => {
        const baseURL = import.meta.env.VITE_API_URL;
        setLoading(true);
        try {
            const res = await axios.post(`${baseURL}/api/auth/google-login`, {
                token: credentialResponse.credential
            });

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                
                setUserName(res.data.user.name.split(' ')[0]); // Pehla naam dikhane ke liye
                setShowWelcome(true);

                setTimeout(() => {
                    navigate('/gallery');
                }, 3500);
            }
        } catch (err) {
            console.error("Google Login Error:", err.response?.data);
            toast.error(err.response?.data?.message || "Google Login Failed! ❌");
        } finally {
            setLoading(false);
        }
    };

    // --- ✅ MANUAL FORM LOGIC ---
    const handleRegister = async (e) => {
        e.preventDefault(); 
        setLoading(true);

        const dataToSend = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            password: formData.password,
            phone: "" 
        };

        const baseURL = import.meta.env.VITE_API_URL;

        try {
            const response = await axios.post(`${baseURL}/api/auth/register`, dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.data.success) {
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                setUserName(formData.firstName);
                setShowWelcome(true);

                setTimeout(() => {
                    navigate('/gallery'); 
                }, 3500);
            }
        } catch (error) {
            console.error("Registration Error:", error.response?.data);
            toast.error(error.response?.data?.message || "Registration Failed! ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <WelcomeModal show={showWelcome} name={userName} />

            <div className="ultra-wrapper">
                <div className="mesh-gradient"></div>
                
                <motion.div 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                    className="ultra-card"
                >
                    <div className="ultra-left" style={{ transform: "translateZ(50px)" }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="floating-header">
                            <div className="sl-icon">S<span>L</span></div>
                            <h1 style={{ transform: "translateZ(80px)" }}>ShopLane<span>.</span></h1>
                            <p style={{ transform: "translateZ(40px)" }}>Elevating E-Commerce to the Third Dimension.</p>
                            <div className="status-badge">
                                <Sparkles size={14} className="spin" />
                                <span>Premium Experience Active</span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="ultra-right">
                        <motion.div className="form-inner-3d" style={{ transform: "translateZ(100px)" }}>
                            <div className="form-head">
                                <h2>Join the Elite</h2>
                                <p>Enter the portal to premium shopping.</p>
                            </div>

                            <div className="google-section-3d">
                                {/* ✅ FIXED GOOGLE LOGIN BUTTON */}
                                <GoogleLogin 
                                    onSuccess={handleGoogleSuccess} 
                                    onError={() => toast.error("Google Auth Failed! ❌")} 
                                />
                            </div>

                            <div className="sl-divider-ultra"><span>OR</span></div>

                            <form className="staggered-form" onSubmit={handleRegister}>
                                <div className="input-grid">
                                    <div className="sl-field">
                                        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                                    </div>
                                    <div className="sl-field">
                                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                                    </div>
                                </div>
                                
                                <div className="sl-field icon-field">
                                    <Mail size={16} className="f-icon" />
                                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                                </div>

                                <div className="sl-field icon-field">
                                    <Lock size={16} className="f-icon" />
                                    <input type="password" name="password" placeholder="Secure Password" value={formData.password} onChange={handleChange} required />
                                </div>

                                <motion.button 
                                    type="submit"
                                    disabled={loading || showWelcome}
                                    whileHover={{ scale: 1.05, translateZ: 50 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="ultra-btn"
                                >
                                    {loading ? "PREPARING..." : "START JOURNEY"} <ArrowRight size={18} />
                                </motion.button>
                            </form>

                            <p className="login-hint">Already on board? <span onClick={() => navigate('/login')}>Login</span></p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Register;