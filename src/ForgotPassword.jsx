import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Consistent with other files
import { Mail, Lock, Key, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ Dynamic API URL
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
            if (res.data.success) {
                toast.success("OTP sent to your inbox! 📧");
                setStep(2);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "User not found or Server error");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/reset-password`, { 
                email, 
                otp, 
                newPassword 
            });

            if (response.data.success) {
                // ✅ Auto-Login Logic
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                toast.success("Password Reset Successful! Welcome Back. 🚀");

                // Seedha Home page par bhej do
                setTimeout(() => {
                    window.location.href = "/"; 
                }, 1500);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error resetting password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Back Button */}
                <button onClick={() => step === 2 ? setStep(1) : navigate('/login')} style={styles.backBtn}>
                    <ArrowLeft size={18} />
                </button>

                <h2 style={styles.title}>{step === 1 ? "Forgot Password?" : "Verify OTP"}</h2>
                <p style={styles.subtitle}>
                    {step === 1 
                        ? "Don't worry! Enter your email to receive a 6-digit reset code." 
                        : `We've sent a code to ${email}`}
                </p>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <Mail style={styles.icon} size={20} />
                            <input 
                                type="email" placeholder="Email Address" value={email} 
                                onChange={(e) => setEmail(e.target.value)} required style={styles.input}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={styles.primaryBtn}>
                            {loading ? "Sending..." : "Send Reset Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <Key style={styles.icon} size={20} />
                            <input 
                                type="text" placeholder="Enter 6-digit OTP" value={otp} 
                                onChange={(e) => setOtp(e.target.value)} required style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <Lock style={styles.icon} size={20} />
                            <input 
                                type="password" placeholder="New Password" value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} required style={styles.input}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={styles.secondaryBtn}>
                            {loading ? "Updating..." : "Verify & Update"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- ✨ Sundar UI Styles ---
const styles = {
    container: {
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', fontFamily: "'Poppins', sans-serif"
    },
    card: {
        background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%', maxWidth: '400px', position: 'relative', textAlign: 'center'
    },
    backBtn: {
        position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', 
        cursor: 'pointer', color: '#667eea', display: 'flex', alignItems: 'center'
    },
    title: { fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '10px' },
    subtitle: { fontSize: '14px', color: '#777', marginBottom: '30px', lineHeight: '1.5' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '15px', color: '#aaa' },
    input: {
        width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #ddd',
        fontSize: '15px', outline: 'none', transition: '0.3s'
    },
    primaryBtn: {
        padding: '14px', borderRadius: '12px', border: 'none', background: '#ff3f6c',
        color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 15px rgba(255, 63, 108, 0.3)'
    },
    secondaryBtn: {
        padding: '14px', borderRadius: '12px', border: 'none', background: '#28a745',
        color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
    }
};

export default ForgotPassword;