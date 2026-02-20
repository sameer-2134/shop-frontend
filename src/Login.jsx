import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Login = ({ setUser, setToken }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/gallery";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await axios.post(`${API_BASE_URL}${endpoint}`, formData);

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                
                if (setUser) setUser(res.data.user);
                if (setToken) setToken(res.data.token);
                
                window.dispatchEvent(new Event("storage"));
                toast.success(isLogin ? `Welcome back, ${res.data.user.name}` : "Account created successfully!");
                navigate(from, { replace: true });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shoplane-auth-container">
            <div className="auth-split-layout">
                <div className="auth-visual-side">
                    <div className="visual-overlay"></div>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="visual-text"
                    >
                        <span className="brand-tag">SHOPLANE / ARCHIVE</span>
                        <h2>CURATING THE <br/> FUTURE OF STYLE</h2>
                    </motion.div>
                </div>

                <div className="auth-form-side">
                    <div className="form-container">
                        <header className="form-header">
                            <h1>{isLogin ? "Welcome Back" : "Join Shoplane"}</h1>
                            <p>{isLogin ? "Enter your details to access the archive" : "Create an account for a curated experience"}</p>
                        </header>

                        <div className="tab-switcher">
                            <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>LOGIN</button>
                            <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>REGISTER</button>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="input-group"
                                    >
                                        <label>Full Name</label>
                                        <div className="input-wrapper">
                                            <User size={18} />
                                            <input type="text" name="name" placeholder="John Doe" onChange={handleChange} required={!isLogin} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="input-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} />
                                    <input type="email" name="email" placeholder="email@example.com" onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? <Loader2 className="spinner" /> : (isLogin ? "SIGN IN" : "CREATE ACCOUNT")}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;