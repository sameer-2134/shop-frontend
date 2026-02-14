import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiEdit3, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        userId: user?.id || user?._id 
    });

    const handleUpdate = async () => {
        try {
            const res = await axios.put("http://localhost:5000/api/users/update-profile", formData);
            if (res.data.success) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                toast.success("Profile refined successfully ✨");
                setIsEditing(false);
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (err) {
            toast.error("Process interrupted. Please try again.");
        }
    };

    return (
        <div className="aesthetic-profile-bg">
            <div className="glass-card">
                <div className="profile-top">
                    <div className="premium-avatar">
                        <span>{formData.name.charAt(0)}</span>
                    </div>
                    <h1 className="user-greeting">Personal Suite</h1>
                    <p className="sub-text">Manage your account details and preferences</p>
                </div>

                <div className="details-grid">
                    <div className="field-group">
                        <label><FiUser /> Full Name</label>
                        {isEditing ? (
                            <input 
                                className="aesthetic-input"
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        ) : <p className="static-val">{formData.name}</p>}
                    </div>

                    <div className="field-group locked">
                        <label><FiMail /> Email Address</label>
                        <p className="static-val">{user?.email}</p>
                    </div>

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
                            <button className="btn-save" onClick={handleUpdate}>
                                <FiCheckCircle /> Commit Changes
                            </button>
                            <button className="btn-cancel" onClick={() => setIsEditing(false)}>
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