import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import { FiPlus, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './Address.css';

const AddressCard = ({ addr, isSelected, onSelect, onDelete }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            onClick={() => onSelect(addr._id)}
            className={`shoplane-card ${isSelected ? 'selected' : ''}`}
        >
            <div className="card-header-minimal">
                <span className="type-label">{addr.type || 'Home'}</span>
                {isSelected && <motion.div initial={{scale:0}} animate={{scale:1}} className="selected-dot" />}
            </div>

            <div className="address-body-minimal">
                <h4 className="client-name">{addr.name}</h4>
                <p className="client-phone">{addr.phone}</p>
                <p className="client-address">
                    {addr.address}, {addr.locality},<br />
                    {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                </p>
            </div>

            <div className="card-footer-minimal">
                <button 
                    className="minimal-del-btn" 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onDelete(addr._id);
                    }}
                >
                    <FiTrash2 /> REMOVE
                </button>
                {isSelected && <span className="deliver-tag">SELECTED FOR DELIVERY</span>}
            </div>
        </motion.div>
    );
};

const AddressSection = () => {
    const navigate = useNavigate();

    // Custom Toast function for that "Archive" premium feel
    const showToast = (message, type = "success") => {
        const toastConfig = {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            theme: "dark",
            style: {
                borderRadius: '0px',
                background: '#000',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                border: '1px solid #333',
                textTransform: 'uppercase'
            }
        };

        if (type === "success") toast.success(message, toastConfig);
        else if (type === "error") toast.error(message, toastConfig);
        else toast.info(message, toastConfig);
    };

    // 1. Browser se data load karna (Initial State)
    const [addresses, setAddresses] = useState(() => {
        const saved = localStorage.getItem('shoplane_user_addresses');
        return saved ? JSON.parse(saved) : [];
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null); 
    const [formData, setFormData] = useState({ 
        name: '', phone: '', pincode: '', locality: '', 
        address: '', city: '', state: '', type: 'Home' 
    });

    // 2. LocalStorage Sync
    useEffect(() => {
        localStorage.setItem('shoplane_user_addresses', JSON.stringify(addresses));
        if (addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(addresses[0]._id);
        }
    }, [addresses]);

    // Pincode API Logic
    const handlePincodeChange = async (e) => {
        const pin = e.target.value;
        if (!/^\d*$/.test(pin)) return;
        setFormData(prev => ({ ...prev, pincode: pin }));
        
        if (pin.length === 6) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();
                if (data[0].Status === "Success") {
                    const po = data[0].PostOffice[0];
                    setFormData(prev => ({ 
                        ...prev, 
                        city: po.District, 
                        state: po.State 
                    }));
                    showToast("LOCATION DATA SYNCED ✨");
                }
            } catch (err) { 
                showToast("INVALID PINCODE", "error"); 
            }
        }
    };

    // 3. Save Address (No Backend)
    const saveAddress = (e) => {
        e.preventDefault();
        const newAddress = {
            ...formData,
            _id: `addr_${Date.now()}` 
        };

        setAddresses([newAddress, ...addresses]);
        setIsFormOpen(false);
        showToast("ADDRESS ARCHIVED SUCCESSFULLY 🏠");
        
        // Form Reset
        setFormData({ name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', type: 'Home' });
    };

    // 4. Delete Address (No Backend)
    const deleteAddress = (id) => {
        const filtered = addresses.filter(addr => addr._id !== id);
        setAddresses(filtered);
        showToast("ENTRY REMOVED FROM ARCHIVE 🗑️", "info");
        if (selectedAddress === id) setSelectedAddress(null);
    };

    const handleDeliverClick = () => {
        const data = addresses.find(addr => addr._id === selectedAddress);
        if (!data) return showToast("SELECT AN ADDRESS FIRST", "error");
        
        localStorage.setItem('shippingAddress', JSON.stringify(data));
        navigate('/checkout/payment');
    };

    return (
        <div className="sl-address-page">
            <div className="sl-container">
                <header className="sl-page-header">
                    <div className="sl-title-group">
                        <span className="sl-subtitle">EST. 2026 / LOCAL STORAGE</span>
                        <h1 className="sl-main-title">SHIPPING INFO</h1>
                    </div>
                    <button className="sl-add-btn" onClick={() => setIsFormOpen(true)}>
                        <FiPlus /> ADD NEW ADDRESS
                    </button>
                </header>

                <div className="sl-address-grid">
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
                    {addresses.length === 0 && (
                        <p className="no-address">No addresses found in your browser archive.</p>
                    )}
                </div>
                
                {addresses.length > 0 && (
                    <div className="sl-sticky-footer">
                        <motion.button 
                            whileTap={{ scale: 0.98 }}
                            className="sl-confirm-btn" 
                            onClick={handleDeliverClick}
                        >
                            PROCEED TO PAYMENT — <FiCheck />
                        </motion.button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.div className="sl-modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <motion.div className="sl-modal" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                            <div className="sl-modal-header">
                                <h3>NEW ARCHIVE LOCATION</h3>
                                <FiX className="sl-close" onClick={() => setIsFormOpen(false)} />
                            </div>
                            <form onSubmit={saveAddress} className="sl-form">
                                <div className="sl-form-row">
                                    <input type="text" placeholder="FULL NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                    <input type="text" placeholder="MOBILE NO." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                                </div>
                                <input type="text" placeholder="PINCODE" value={formData.pincode} maxLength="6" onChange={handlePincodeChange} required />
                                <input type="text" placeholder="LOCALITY / AREA" value={formData.locality} onChange={(e) => setFormData({...formData, locality: e.target.value})} required />
                                <textarea placeholder="COMPLETE ADDRESS DETAILS" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
                                <div className="sl-form-row">
                                    <input type="text" placeholder="CITY" value={formData.city} readOnly className="sl-read" />
                                    <input type="text" placeholder="STATE" value={formData.state} readOnly className="sl-read" />
                                </div>
                                <div className="sl-type-select">
                                    <button type="button" className={formData.type === 'Home' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'Home'})}>HOME</button>
                                    <button type="button" className={formData.type === 'Work' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'Work'})}>WORK</button>
                                </div>
                                <button type="submit" className="sl-save-btn">SAVE TO BROWSER ARCHIVE</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddressSection;