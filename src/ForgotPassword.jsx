import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Key, ArrowLeft, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Make sure VITE_API_URL in your .env doesn't end with a slash
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ✅ Fixed: Added /api/auth prefix to match backend
            const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, 
                { email },
                { withCredentials: true }
            );
            
            if (res.data.success) {
                toast.success("Reset code sent! Check your inbox 📧");
                setStep(2);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("OTP Error:", error);
            toast.error(error.response?.data?.message || "User not found or Server error");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ✅ Fixed: Added /api/auth prefix to match backend
            const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, 
                { email, otp, newPassword },
                { withCredentials: true }
            );

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                toast.success("Account Recovered! 🚀");
                setTimeout(() => navigate('/'), 1000);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Reset Error:", error);
            toast.error(error.response?.data?.message || "Error resetting password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            {/* Background Decorative Circles */}
            <div style={styles.blob1}></div>
            <div style={styles.blob2}></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.card}
            >
                <button 
                    onClick={() => step === 2 ? setStep(1) : navigate('/login')} 
                    style={styles.backBtn}
                >
                    <ArrowLeft size={20} />
                </button>

                <div style={styles.headerArea}>
                    <div style={styles.iconCircle}>
                        {step === 1 ? <ShieldCheck size={32} color="#fff" /> : <Key size={32} color="#fff" />}
                    </div>
                    <h2 style={styles.title}>{step === 1 ? "Account Recovery" : "Verification"}</h2>
                    <p style={styles.subtitle}>
                        {step === 1 
                            ? "Enter your registered email to receive a secure recovery code." 
                            : `We've sent a 6-digit code to your email address.`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOtp} 
                            style={styles.form}
                        >
                            <div style={styles.inputContainer}>
                                <Mail style={styles.inputIcon} size={18} />
                                <input 
                                    type="email" placeholder="Email Address" value={email} 
                                    onChange={(e) => setEmail(e.target.value)} required style={styles.inputField}
                                />
                            </div>
                            <button type="submit" disabled={loading} style={styles.mainBtn}>
                                {loading ? "Processing..." : "Get Recovery Code"}
                                {!loading && <ChevronRight size={18} />}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleResetPassword} 
                            style={styles.form}
                        >
                            <div style={styles.inputContainer}>
                                <Key style={styles.inputIcon} size={18} />
                                <input 
                                    type="text" placeholder="6-digit OTP" value={otp} maxLength="6"
                                    onChange={(e) => setOtp(e.target.value)} required style={styles.inputField}
                                />
                            </div>
                            <div style={styles.inputContainer}>
                                <Lock style={styles.inputIcon} size={18} />
                                <input 
                                    type="password" placeholder="Set New Password" value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} required style={styles.inputField}
                                />
                            </div>
                            <button type="submit" disabled={loading} style={styles.successBtn}>
                                {loading ? "Updating..." : "Recover Account"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0a', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
    },
    blob1: {
        position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px',
        background: 'rgba(255, 63, 108, 0.15)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
    },
    blob2: {
        position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px',
        background: 'rgba(40, 167, 69, 0.1)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
    },
    card: {
        background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', padding: '50px 40px',
        borderRadius: '30px', width: '90%', maxWidth: '440px', zIndex: 1, position: 'relative'
    },
    backBtn: {
        position: 'absolute', top: '25px', left: '25px', background: 'rgba(255,255,255,0.05)',
        border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
    },
    headerArea: { textAlign: 'center', marginBottom: '40px' },
    iconCircle: {
        width: '70px', height: '70px', background: 'linear-gradient(135deg, #ff3f6c 0%, #ff6b6b 100%)',
        borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(255, 63, 108, 0.3)'
    },
    title: { fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' },
    form: { display: 'flex', flexDirection: 'column', gap: '18px' },
    inputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '18px', color: 'rgba(255,255,255,0.4)' },
    inputField: {
        width: '100%', padding: '15px 15px 15px 52px', borderRadius: '15px', 
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s'
    },
    mainBtn: {
        padding: '16px', borderRadius: '15px', border: 'none', 
        background: '#fff', color: '#000', fontWeight: '700', cursor: 'pointer', 
        fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        marginTop: '10px', transition: '0.3s'
    },
    successBtn: {
        padding: '16px', borderRadius: '15px', border: 'none', 
        background: '#28a745', color: '#fff', fontWeight: '700', cursor: 'pointer', 
        fontSize: '15px', marginTop: '10px'
    }
};

export default ForgotPassword;