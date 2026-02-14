import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Consistent with other components
import { FiUser, FiMail, FiPhone, FiEdit3, FiCheckCircle, FiLoader } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token'); 
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        userId: user?.id || user?._id 
    });

    // ✅ Production-ready API URL
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const handleUpdate = async () => {
        if (!formData.name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(
                `${API_BASE_URL}/api/users/update-profile`, 
                formData,
                { headers: { Authorization: `Bearer ${token}` } } // Security check
            );

            if (res.data.success) {
                // Update local storage with new user data
                const updatedUser = { ...user, ...res.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                toast.success("Profile refined successfully ✨");
                setIsEditing(false);
                
                // Reload to sync Navbar and other components
                setTimeout(() => window.location.reload(), 800);
            }
        } catch (err) {
            console.error("Profile Update Error:", err);
            toast.error(err.response?.data?.message || "Process interrupted. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="aesthetic-profile-bg">
            <div className="glass-card">
                <div className="profile-top">
                    <div className="premium-avatar">
                        <span>{formData.name ? formData.name.charAt(0).toUpperCase() : <FiUser />}</span>
                    </div>
                    <h1 className="user-greeting">Personal Suite</h1>
                    <p className="sub-text">Manage your account details and preferences</p>
                </div>

                <div className="details-grid">
                    {/* FULL NAME */}
                    <div className="field-group">
                        <label><FiUser /> Full Name</label>
                        {isEditing ? (
                            <input 
                                className="aesthetic-input"
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Enter your name"
                            />
                        ) : <p className="static-val">{formData.name}</p>}
                    </div>

                    {/* EMAIL - LOCKED */}
                    <div className="field-group locked">
                        <label><FiMail /> Email Address</label>
                        <p className="static-val">{user?.email}</p>
                        <span className="lock-badge">Verified</span>
                    </div>

                    {/* CONTACT */}
                    <div className="field-group">
                        <label><FiPhone /> Contact Number</label>
                        {isEditing ? (
                            <input 
                                className="aesthetic-input"
                                placeholder="+91 00000 00000"
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        ) : <p className="static-val">{formData.phone || "Not linked yet"}</p>}
                    </div>
                </div>

                <div className="action-footer">
                    {isEditing ? (
                        <div className="btn-stack">
                            <button className="btn-save" onClick={handleUpdate} disabled={loading}>
                                {loading ? <FiLoader className="spin" /> : <FiCheckCircle />} 
                                {loading ? "Updating..." : "Commit Changes"}
                            </button>
                            <button className="btn-cancel" onClick={() => setIsEditing(false)} disabled={loading}>
                                Dismiss
                            </button>
                        </div>
                    ) : (
                        <button className="btn-edit" onClick={() => setIsEditing(true)}>
                            <FiEdit3 /> Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;