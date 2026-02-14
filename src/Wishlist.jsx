import React, { useState } from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast'; 
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, addToCart } = useCart();
    // Tracking selected sizes for each product individually
    const [selectedSizes, setSelectedSizes] = useState({});
    // Local state to shake/highlight the size picker if user forgets
    const [shakeId, setShakeId] = useState(null);

    // --- LOGIC: ADD TO BAG WITH VALIDATION ---
    const handleMoveToBag = (item) => {
        const itemId = item._id || item.productId?._id;
        const hasSizes = item.sizes && item.sizes.length > 0 && !item.sizes.includes("Free Size");

        // Validation: Agar size select nahi kiya
        if (hasSizes && !selectedSizes[itemId]) {
            setShakeId(itemId); // Trigger visual hint
            toast.error("Pehle size select karein!", {
                icon: '📏',
                position: "bottom-center",
                style: {
                    borderRadius: '10px',
                    background: '#1e293b',
                    color: '#fff',
                }
            });
            
            // 1 second baad shake effect nikal do
            setTimeout(() => setShakeId(null), 500);
            return;
        }

        // Agar validation pass ho gayi
        const finalItem = {
            ...item,
            selectedSize: selectedSizes[itemId] || "Free Size"
        };
        
        addToCart(finalItem);
        removeFromWishlist(itemId);
        toast.success(`${item.name} Bag mein add ho gaya!`, { position: "bottom-center" });
    };

    const handleSizeSelect = (itemId, size) => {
        setSelectedSizes(prev => ({
            ...prev,
            [itemId]: size
        }));
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };

    // Empty State UI
    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="wishlist-page-wrapper">
                <div className="wishlist-container">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="empty-wishlist-v2"
                    >
                        <h2>WISHLIST KHALI HAI</h2>
                        <p>Apne pasandida items ko yahan save karein.</p>
                        <Link to="/gallery" className="continue-shopping-btn">SHOP NOW</Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page-wrapper">
            <Toaster /> 
            <div className="wishlist-container">
                <header className="wishlist-header">
                    <motion.h2 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        My Wishlist <span>({wishlist.length} Items)</span>
                    </motion.h2>
                </header>
                
                <motion.div 
                    className="wishlist-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence mode='popLayout'>
                        {wishlist.map((item) => {
                            const itemId = item._id || item.productId?._id;
                            const hasSizes = item.sizes && item.sizes.length > 0 && !item.sizes.includes("Free Size");
                            const isSelected = selectedSizes[itemId];

                            return (
                                <motion.div 
                                    key={itemId} 
                                    className={`wishlist-card ${shakeId === itemId ? 'shake-animation' : ''}`}
                                    variants={cardVariants}
                                    layout
                                    exit="exit"
                                >
                                    {/* Remove Button */}
                                    <button className="remove-wishlist" onClick={() => removeFromWishlist(itemId)}>×</button>

                                    {/* Image Section with Size Overlay */}
                                    <div className="wishlist-img-container">
                                        <img src={item.images?.[0]} alt={item.name} />
                                        
                                        {hasSizes && (
                                            <div className={`quick-size-overlay ${shakeId === itemId ? 'force-show' : ''}`}>
                                                <p>{isSelected ? `Size: ${isSelected}` : 'Select Size'}</p>
                                                <div className="mini-size-grid">
                                                    {item.sizes.map(size => (
                                                        <button 
                                                            key={size}
                                                            className={`mini-size-btn ${selectedSizes[itemId] === size ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleSizeSelect(itemId, size);
                                                            }}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="wishlist-info">
                                        <span className="wishlist-brand">{item.brand || 'SHOPLANE'}</span>
                                        <h4 className="wishlist-name">{item.name}</h4>
                                        <div className="price-box">
                                            <span className="current-price">₹{item.price}</span>
                                        </div>
                                        
                                        <button 
                                            className={`move-to-bag-btn ${hasSizes && !isSelected ? 'needs-selection' : ''}`}
                                            onClick={() => handleMoveToBag(item)}
                                        >
                                            {hasSizes && !isSelected ? 'SELECT SIZE' : 'MOVE TO BAG'}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Wishlist;