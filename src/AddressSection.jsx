import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import { FiPlus, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Address.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const AddressCard = ({ addr, isSelected, onSelect, onDelete }) => {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const card = e.currentTarget.getBoundingClientRect();
        const x = (e.clientY - card.top - card.height / 2) / 15;
        const y = (e.clientX - card.left - card.width / 2) / 15;
        setRotate({ x, y });
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
                opacity: 1, y: 0,
                rotateX: rotate.x, 
                rotateY: -rotate.y,
                scale: isSelected ? 1.02 : 1
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setRotate({ x: 0, y: 0 })}
            onClick={() => onSelect(addr._id)}
            className={`address-card-3d ${isSelected ? 'selected' : ''}`}
        >
            <div className="card-glass-shine"></div>
            <div className="card-top">
                <span className="address-type-tag">{addr.type}</span>
                {isSelected && <FiCheckCircle className="tick-icon" />}
            </div>

            <div className="address-details">
                <p className="user-name">{addr.name} <span>{addr.phone}</span></p>
                <p className="user-full-address">
                    {addr.address}, {addr.locality}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </p>
            </div>

            <div className="card-actions">
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    className="del-btn" 
                    onClick={(e) => onDelete(e, addr._id)}
                >
                    <FiTrash2 /> Remove
                </motion.button>
            </div>
        </motion.div>
    );
};

const AddressSection = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null); 
    const [formData, setFormData] = useState({ 
        name: '', phone: '', pincode: '', locality: '', 
        address: '', city: '', state: '', landmark: '', 
        type: 'Home' 
    });

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        };
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/customers/addresses`, getAuthConfig());
            if (res.data.success) {
                setAddresses(res.data.addresses);
                if (res.data.addresses.length > 0) setSelectedAddress(res.data.addresses[0]._id);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                toast.error("Session expired, please login again.");
            }
        }
    };

    useEffect(() => { fetchAddresses(); }, []);

    const handlePincodeChange = async (e) => {
        const pin = e.target.value;
        setFormData(prev => ({ ...prev, pincode: pin }));

        if (pin.length === 6) {
            try {
                const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
                if (res.data[0].Status === "Success") {
                    const postOffice = res.data[0].PostOffice[0];
                    setFormData(prev => ({ 
                        ...prev, 
                        city: postOffice.District, 
                        state: postOffice.State 
                    }));
                }
            } catch (err) { 
                toast.error("Invalid Pincode"); 
            }
        }
    };

    const saveAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/api/customers/address`, formData, getAuthConfig());
            if (res.data.success) {
                setAddresses(res.data.addresses);
                setIsFormOpen(false);
                toast.success("Address added! 🏠");
                setFormData({ name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '', type: 'Home' });
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Error saving address"); 
        }
    };

    const deleteAddress = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await axios.delete(`${API_BASE_URL}/api/customers/address/${id}`, getAuthConfig());
            if (res.data.success) {
                setAddresses(res.data.addresses);
                toast.info("Address deleted 🗑️");
            }
        } catch (err) { toast.error("Delete failed"); }
    };

    const handleDeliverClick = () => {
        const data = addresses.find(addr => addr._id === selectedAddress);
        if (!data) return toast.warn("Please select an address!");
        localStorage.setItem('shippingAddress', JSON.stringify(data));
        navigate('/checkout/payment');
    };

    return (
        <div className="address-page">
            <div className="dynamic-bg-glow"></div>
            <div className="address-container">
                <div className="address-header">
                    <div className="header-text">
                        <h3>Manage Addresses</h3>
                        <p>Where should we ship your style?</p>
                    </div>
                    <button className="add-new-btn-premium" onClick={() => setIsFormOpen(true)}>
                        <FiPlus /> ADD NEW
                    </button>
                </div>

                <div className="address-list">
                    <AnimatePresence mode="popLayout">
                        {addresses.map((addr) => (
                            <AddressCard 
                                key={addr._id}
                                addr={addr}
                                isSelected={selectedAddress === addr._id}
                                onSelect={setSelectedAddress}
                                onDelete={deleteAddress}
                            />
                        ))}
                    </AnimatePresence>
                </div>
                
                {addresses.length > 0 && (
                    <button className="confirm-btn-premium" onClick={handleDeliverClick}>
                        DELIVER TO THIS ADDRESS
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="address-modal-3d">
                            <div className="modal-header">
                                <h4>NEW ADDRESS</h4>
                                <FiX className="close-icon" onClick={() => setIsFormOpen(false)} />
                            </div>
                            <form onSubmit={saveAddress}>
                                <div className="form-grid-premium">
                                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                    <input type="text" name="phone" placeholder="Mobile" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                                    <input type="text" name="pincode" value={formData.pincode} placeholder="Pincode" onChange={handlePincodeChange} required />
                                    <input type="text" name="locality" placeholder="Locality" value={formData.locality} onChange={(e) => setFormData({...formData, locality: e.target.value})} required />
                                    <textarea className="full-width" name="address" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
                                    <input type="text" name="city" value={formData.city} placeholder="City" readOnly />
                                    <input type="text" name="state" value={formData.state} placeholder="State" readOnly />
                                </div>
                                <div className="modal-footer-btns">
                                    <button type="submit" className="save-btn-final">SAVE ADDRESS</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddressSection;