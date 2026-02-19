import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import './Register.css';

// --- CONFIGURATION ---
// Ise yahan define karne se manage karna asan ho jata hai
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const WelcomeModal = ({ show, name }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="welcome-overlay">
                <motion.div initial={{ scale: 0.8, rotateY: 20 }} animate={{ scale: 1, rotateY: 0 }} className="welcome-card-premium">
                    <div className="success-icon-wrapper">
                        <Sparkles size={40} color="#fff" />
                    </div>
                    <h2>Welcome to the Elite, {name}</h2>
                    <p>Premium Experience Active</p>
                    <div className="premium-loader">
                        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5 }} className="premium-fill" />
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userName, setUserName] = useState("");

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                name: formData.fullName.trim(),
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                // Storage Update
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Sync across tabs/components
                window.dispatchEvent(new Event("storage"));

                setUserName(formData.fullName.split(' ')[0]);
                setShowWelcome(true);

                // Redirect after animation
                setTimeout(() => navigate('/gallery'), 3000);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Registration Failed!";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shoplane-auth-container">
            {/* Background Aesthetic */}
            <div className="bg-floating-text">
                <motion.h2 
                    animate={{ y: [0, -20, 0], opacity: [0.03, 0.06, 0.03] }} 
                    transition={{ duration: 8, repeat: Infinity }}
                >
                    Elevating E-Commerce to the Third Dimension
                </motion.h2>
            </div>

            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>

            <WelcomeModal show={showWelcome} name={userName} />
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-dark-card"
            >
                <div className="auth-header">
                    <div className="brand-badge">Premium Experience Active</div>
                    <h1>ShopLane<span>.</span></h1>
                    <p>Where luxury meets technology.</p>
                </div>

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="dark-input-wrapper">
                        <User size={18} className="left-icon" />
                        <input 
                            type="text" 
                            name="fullName" 
                            placeholder="Enter Full Name" 
                            value={formData.fullName}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="dark-input-wrapper">
                        <Mail size={18} className="left-icon" />
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Enter Your Email" 
                            value={formData.email}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="dark-input-wrapper">
                        <Lock size={18} className="left-icon" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="Secure Password" 
                            value={formData.password}
                            onChange={handleChange} 
                            required 
                        />
                        <div 
                            className="eye-toggle" 
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="main-auth-btn-dark" 
                        disabled={loading}
                    >
                        {loading ? "INITIALIZING..." : "START JOURNEY"} <ArrowRight size={18} />
                    </motion.button>
                </form>

                <p className="auth-footer-text">
                    Part of the elite? <span onClick={() => navigate('/login')}>Sign In</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;