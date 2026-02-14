import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import { FiPlus, FiTrash2, FiX, FiCheckCircle, FiNavigation } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Address.css';

// 1. Separate Card Component for Isolated 3D Logic
const AddressCard = ({ addr, isSelected, onSelect, onDelete }) => {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const card = e.currentTarget.getBoundingClientRect();
        const x = (e.clientY - card.top - card.height / 2) / 15; // Vertical Tilt
        const y = (e.clientX - card.left - card.width / 2) / 15; // Horizontal Tilt
        setRotate({ x, y });
    };

    const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
                opacity: 1, 
                y: 0,
                rotateX: rotate.x, 
                rotateY: -rotate.y,
                scale: isSelected ? 1.02 : 1
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => onSelect(addr.id)}
            className={`address-card-3d ${isSelected ? 'selected' : ''}`}
        >
            <div className="card-glass-shine"></div> {/* CSS Shine Effect */}
            <div className="card-top">
                <span className="address-type-tag">{addr.type}</span>
                <AnimatePresence>
                    {isSelected && (
                        <motion.div 
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                        >
                            <FiCheckCircle className="tick-icon" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="address-details">
                <p className="user-name">{addr.name} <span>{addr.phone}</span></p>
                <p className="user-full-address">
                    {addr.address}, {addr.locality}, {addr.landmark && `${addr.landmark}, `}
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </p>
            </div>

            <div className="card-actions">
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="del-btn" 
                    onClick={(e) => onDelete(e, addr.id)}
                >
                    <FiTrash2 /> Remove
                </motion.button>
            </div>
        </motion.div>
    );
};

const AddressSection = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState(() => {
        const saved = localStorage.getItem('userAddresses');
        return saved ? JSON.parse(saved) : []; 
    });
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null); 
    const [formData, setFormData] = useState({ 
        name: '', phone: '', pincode: '', locality: '', 
        address: '', city: '', state: '', landmark: '', 
        altPhone: '', type: 'Home' 
    });

    useEffect(() => {
        localStorage.setItem('userAddresses', JSON.stringify(addresses));
        if (addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(addresses[0].id);
        }
    }, [addresses, selectedAddress]);

    const handlePincodeChange = async (e) => {
        const pin = e.target.value;
        setFormData({ ...formData, pincode: pin });
        if (pin.length === 6) {
            try {
                const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
                if (res.data[0].Status === "Success") {
                    const postOffice = res.data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev, city: postOffice.District, state: postOffice.State
                    }));
                    toast.success(`Detected: ${postOffice.District}`);
                }
            } catch (err) { console.error("Pincode error", err); }
        }
    };

    const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const saveAddress = (e) => {
        e.preventDefault();
        const newAddress = { ...formData, id: Date.now() };
        setAddresses([...addresses, newAddress]);
        setIsFormOpen(false);
        setFormData({ name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '', altPhone: '', type: 'Home' });
        toast.success("Address added! 🏠"); 
    };

    const deleteAddress = (e, id) => {
        e.stopPropagation();
        setAddresses(addresses.filter(addr => addr.id !== id));
        toast.error("Address removed! 🗑️");
    };

    const handleDeliverClick = () => {
        const data = addresses.find(addr => addr.id === selectedAddress);
        if (!data) return toast.warn("Select an address! 📍");
        localStorage.setItem('shippingAddress', JSON.stringify(data));
        toast.success("Address Locked! 🚀");
        setTimeout(() => navigate('/checkout/payment'), 1000);
    };

    return (
        <div className="address-page">
            <div className="dynamic-bg-glow"></div> {/* Visual Flair */}
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="address-container">
                <div className="address-header">
                    <div className="header-text">
                        <h3>Manage Addresses</h3>
                        <p>Where should we ship your style?</p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="add-new-btn-premium" 
                        onClick={() => setIsFormOpen(true)}
                    >
                        <FiPlus /> ADD NEW
                    </motion.button>
                </div>

                <div className="address-list">
                    <AnimatePresence mode="popLayout">
                        {addresses.map((addr) => (
                            <AddressCard 
                                key={addr.id}
                                addr={addr}
                                isSelected={selectedAddress === addr.id}
                                onSelect={setSelectedAddress}
                                onDelete={deleteAddress}
                            />
                        ))}
                    </AnimatePresence>
                </div>
                
                {addresses.length > 0 && (
                    <motion.button 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="confirm-btn-premium" 
                        onClick={handleDeliverClick}
                    >
                        DELIVER TO THIS ADDRESS
                    </motion.button>
                )}
            </motion.div>

            {/* Modal remains largely same but CSS will handle the 'Glass' look */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="address-modal-3d"
                        >
                            {/* ... (Form Content) ... */}
                            <div className="modal-header">
                                <h4>NEW ADDRESS</h4>
                                <FiX className="close-icon" onClick={() => setIsFormOpen(false)} />
                            </div>
                            <form onSubmit={saveAddress}>
                                <div className="form-grid-premium">
                                    <input type="text" name="name" placeholder="Name" onChange={handleInput} required />
                                    <input type="text" name="phone" placeholder="10-digit Mobile" onChange={handleInput} required />
                                    <input type="text" name="pincode" value={formData.pincode} placeholder="Pincode" onChange={handlePincodeChange} required />
                                    <input type="text" name="locality" placeholder="Locality" onChange={handleInput} required />
                                    <textarea className="full-width" name="address" placeholder="Address (Area/Street)" onChange={handleInput} required />
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