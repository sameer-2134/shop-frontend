import React, { useState } from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, addToCart } = useCart();
    const [selectedSizes, setSelectedSizes] = useState({});
    const [shakeId, setShakeId] = useState(null);

    const handleMoveToBag = (item) => {
        const itemId = item._id || item.productId?._id;
        
        // Check if item has multiple sizes
        const hasSizes = item.sizes && item.sizes.length > 0 && !item.sizes.includes("Free Size");

        // Agar size select nahi ki aur product mein sizes hain, toh shake karo
        if (hasSizes && !selectedSizes[itemId]) {
            setShakeId(itemId);
            setTimeout(() => setShakeId(null), 500);
            return;
        }

        // ✅ FIXED: Sending data as "size" to match Cart.js expectations
        const itemToCart = {
            ...item,
            size: selectedSizes[itemId] || "Free Size", // 'selectedSize' ki jagah 'size' kar diya
            quantity: 1
        };
        
        addToCart(itemToCart);
        removeFromWishlist(itemId);
    };

    const handleSizeSelect = (itemId, size) => {
        setSelectedSizes(prev => ({
            ...prev,
            [itemId]: size
        }));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 100 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="wishlist-page-wrapper">
                <div className="wishlist-container">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="empty-wishlist-v2"
                    >
                        <div className="empty-icon-circle">
                            <ShoppingBag size={40} strokeWidth={1} />
                        </div>
                        <h2>YOUR WISHLIST IS EMPTY</h2>
                        <p>Save your favorite items here to keep track of what you love.</p>
                        <Link to="/gallery" className="continue-shopping-btn">EXPLORE COLLECTION</Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page-wrapper">
            <div className="wishlist-container">
                <header className="wishlist-header">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <h2>My Wishlist <span className="item-count">{wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}</span></h2>
                    </motion.div>
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
                                    <button className="remove-wishlist" onClick={() => removeFromWishlist(itemId)}>
                                        <X size={18} />
                                    </button>

                                    <div className="wishlist-img-container">
                                        <img src={item.images?.[0]} alt={item.name} loading="lazy" />
                                        
                                        {hasSizes && (
                                            <div className={`quick-size-overlay ${shakeId === itemId ? 'force-show' : ''} ${isSelected ? 'has-selection' : ''}`}>
                                                <p>{isSelected ? `Selected: ${isSelected}` : 'Select Size'}</p>
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

                                    <div className="wishlist-info">
                                        <span className="wishlist-brand">{item.brand || 'SHOPLANE'}</span>
                                        <h4 className="wishlist-name">{item.name}</h4>
                                        <div className="price-box">
                                            <span className="current-price">₹{item.price.toLocaleString()}</span>
                                        </div>
                                        
                                        <button 
                                            className={`move-to-bag-btn ${hasSizes && !isSelected ? 'needs-selection' : ''}`}
                                            onClick={() => handleMoveToBag(item)}
                                        >
                                            {hasSizes && !isSelected ? 'CHOOSE SIZE' : 'MOVE TO BAG'}
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