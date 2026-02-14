import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Fingerprint } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './Login.css';

const Login = ({ setUser, setToken }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- INTERACTIVE 3D SENSORS (NO CHANGES HERE) ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 120, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 120, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- FULLY WORKING LOGIN HANDLER ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // FIX: URL matched exactly with your server.js (app.post("/api/auth/login", login))
            const res = await axios.post('http://localhost:5000/api/auth/login', formData, { 
                withCredentials: true 
            });

            if (res.data.success) {
                // 1. Data Save karo
                localStorage.setItem("token", res.data.token); 
                localStorage.setItem("user", JSON.stringify(res.data.user));
                
                // 2. State Update karo
                if (setUser) setUser(res.data.user);
                if (setToken) setToken(res.data.token);
                
                // 3. Feedback aur Redirect
                toast.success(`Welcome Back, ${res.data.user.name}! 🚀`);
                navigate('/gallery'); 
            }
        } catch (error) {
            // Error Handling: 404/401/500 sab handle hoga
            const errorMessage = error.response?.data?.message || "Login failed. Check server connection.";
            toast.error(errorMessage);
            console.error("Login detail error:", error.response);
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="login-3d-wrapper">
            {/* Dynamic Background Elements */}
            <div className="login-bg-orb orb-primary"></div>
            <div className="login-bg-orb orb-secondary"></div>
            <div className="grid-layer"></div>

            <motion.div 
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { x.set(0); y.set(0); }}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="login-main-card"
            >
                {/* Left Side: Visual Experience */}
                <div className="login-visual-panel">
                    <motion.div style={{ translateZ: 100 }} className="visual-content">
                        <div className="brand-badge-3d">
                            <Fingerprint size={16} />
                            <span>Biometric Secure</span>
                        </div>
                        <h1>Welcome <br/><span>Back.</span></h1>
                        <p>Access your curated universe of premium products.</p>
                        
                        <div className="trust-meter">
                            <div className="trust-item"><ShieldCheck size={14}/> 128-bit Encrypted</div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: High-End Form */}
                <div className="login-form-panel">
                    <motion.div style={{ translateZ: 80 }} className="form-inner-3d">
                        <div className="login-header">
                            <div className="login-icon-box">
                                <LogIn size={32} />
                            </div>
                            <h2>Sign In</h2>
                            <p>Enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form-actual">
                            <div className="login-field-wrap">
                                <Mail className="f-icon" size={18} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email Address" 
                                    value={formData.email}
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            <div className="login-field-wrap">
                                <Lock className="f-icon" size={18} />
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Password" 
                                    value={formData.password}
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            <div className="forgot-box">
                                <Link to="/forgot-password">Forgot Identity?</Link>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.05, translateZ: 40 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit" 
                                disabled={loading} 
                                className="login-btn-3d"
                            >
                                {loading ? "Verifying..." : "LAUNCH DASHBOARD"}
                                <ArrowRight size={20} />
                            </motion.button>
                        </form>

                        <p className="login-footer">
                            New Explorer? <Link to="/register">Create Account</Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;