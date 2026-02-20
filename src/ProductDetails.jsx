import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Heart, ShieldCheck, Truck, 
  ChevronRight, Tag, RotateCcw, MapPin, X, Zap, CheckCircle2 
} from 'lucide-react';
import { useCart } from './CartContext'; 
import ProductImageZoom from './ProductImageZoom'; 
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart, addToWishlist } = useCart();
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [pincode, setPincode] = useState('');
    const [deliveryMsg, setDeliveryMsg] = useState(''); // New State for Pincode
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const getFullUrl = (img) => {
        if (!img) return "https://placehold.co/600x800?text=Premium+Piece";
        const cleanPath = img.replace(/\\/g, '/');
        return cleanPath.startsWith('http') ? cleanPath : `${API_BASE_URL}/${cleanPath}`;
    };

    // Pincode Check Logic
    const checkPincode = () => {
        if (pincode.length === 6) {
            setDeliveryMsg(`🚚 Delivering to ${pincode} by ${new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`);
        } else {
            setDeliveryMsg("❌ Please enter a valid 6-digit pincode");
        }
    };

    useEffect(() => {
        if (isSelectionOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isSelectionOpen]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
                if (res.data.success) {
                    const currentProduct = res.data.product;
                    setProduct(currentProduct);
                    if (currentProduct.images && currentProduct.images.length > 0) {
                        setMainImage(currentProduct.images[0]);
                    }
                    const queryParam = currentProduct.subCategory 
                        ? `subCategory=${encodeURIComponent(currentProduct.subCategory)}` 
                        : `category=${encodeURIComponent(currentProduct.category)}`;
                    const relatedRes = await axios.get(`${API_BASE_URL}/api/products?${queryParam}`);
                    if (relatedRes.data.success) {
                        setRelatedProducts(relatedRes.data.products.filter(p => p._id !== id).slice(0, 10));
                    }
                }
            } catch (err) {
                setError("Product not found.");
            } finally {
                setLoading(false);
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }, 100);
            }
        };
        if (id) fetchProduct();
    }, [id, API_BASE_URL]);

    const triggerToast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleInitialAdd = () => {
        const hasSizes = product?.sizes?.length > 0;
        const hasColors = product?.colors?.length > 0;
        if ((hasSizes && !selectedSize) || (hasColors && !selectedColor)) {
            setIsSelectionOpen(true);
        } else {
            addToCart({ ...product, size: selectedSize, color: selectedColor });
            triggerToast("Added to your bag successfully!");
        }
    };

    const finalAddToCart = () => {
        if (product.colors?.length > 0 && !selectedColor) {
            triggerToast("Please choose a color first");
            return;
        }
        if (product.sizes?.length > 0 && !selectedSize) {
            triggerToast("Please select your size");
            return;
        }
        addToCart({ ...product, size: selectedSize, color: selectedColor });
        setIsSelectionOpen(false);
        triggerToast("Added to your bag!");
    };

    if (loading) return <div className="pd-loader"><div className="loader-ring"></div><p>CURATING EXPERIENCE...</p></div>;
    if (error || !product) return <div className="pd-error">Product Not Found</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pd-wrapper">
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="pd-toast">
                        <CheckCircle2 size={18} /> {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pd-container">
                <div className="pd-gallery-section">
                    <div className="pd-thumbnails">
                        {product.images && product.images.length > 0 ? (
                            product.images.map((img, index) => (
                                <div key={index} className={`pd-thumb-item ${mainImage === img ? 'active' : ''}`} onMouseEnter={() => setMainImage(img)}>
                                    <img src={getFullUrl(img)} alt={`Thumbnail ${index}`} />
                                </div>
                            ))
                        ) : (
                             <div className="pd-thumb-item active"><img src={getFullUrl('')} alt="Placeholder" /></div>
                        )}
                    </div>
                    <div className="pd-main-viewer">
                        <ProductImageZoom src={getFullUrl(mainImage)} />
                    </div>
                </div>

                <div className="pd-details-section">
                    <nav className="pd-breadcrumb">
                        <Link to="/">Home</Link> <ChevronRight size={12}/> 
                        <Link to="/gallery">Shop</Link> <ChevronRight size={12}/> 
                        <span>{product.category}</span>
                    </nav>

                    <span className="pd-brand-tag">{product.brand || "SHOPLANE"}</span>
                    <h1 className="pd-title">{product.name}</h1>
                    
                    <div className="pd-price-card-v2">
                        <span className="pd-current-price">₹{product.price?.toLocaleString()}</span>
                        {product.originalPrice && (
                            <span className="pd-original-price">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                        <p className="tax-info">inclusive of all taxes</p>
                    </div>

                    {product.sizes && product.sizes.length > 0 && (
                        <div className="pd-size-section">
                            <div className="size-header">
                                <h3>SELECT SIZE</h3>
                                <span className="size-chart-link">SIZE CHART</span>
                            </div>
                            <div className="size-grid">
                                {product.sizes.map(size => (
                                    <button key={size} onClick={() => setSelectedSize(size)} className={`size-btn ${selectedSize === size ? 'active' : ''}`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pd-offers-container">
                        <h3 className="section-label"><Tag size={16}/> BEST OFFERS</h3>
                        <div className="offer-item">• Flat ₹500 Off on First Purchase. Code: <b>SHOPLANE500</b></div>
                        <div className="offer-item">• 10% Instant Discount on HDFC Bank Cards</div>
                    </div>

                    <div className="pd-pincode-box">
                        <h3 className="section-label"><MapPin size={16}/> CHECK DELIVERY</h3>
                        <div className="pincode-input-wrap">
                            <input type="text" maxLength="6" placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} />
                            <button onClick={checkPincode}>CHECK</button>
                        </div>
                        {deliveryMsg && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="delivery-status-msg">{deliveryMsg}</motion.p>}
                    </div>

                    <div className="pd-action-btns">
                        <button className="pd-btn-primary" onClick={handleInitialAdd}>
                            <ShoppingBag size={20} /> ADD TO BAG
                        </button>
                        <button className="pd-btn-secondary" onClick={() => { addToWishlist(product); triggerToast("Saved to wishlist!"); }}>
                            <Heart size={22} />
                        </button>
                    </div>

                    <div className="pd-trust-strip">
                        <div className="trust-item"><Truck size={20}/><span>Fast Delivery</span></div>
                        <div className="trust-item"><RotateCcw size={20}/><span>14 Days Return</span></div>
                        <div className="trust-item"><ShieldCheck size={20}/><span>Original</span></div>
                    </div>

                    <div className="pd-description">
                        <h3>THE DESIGN STORY</h3>
                        <p>{product.description}</p>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="related-section">
                    <div className="section-divider"><span>EXPLORE SIMILAR PIECES</span></div>
                    <div className="related-grid">
                        {relatedProducts.map(p => (
                            <Link to={`/product/${p._id}`} key={p._id} className="related-card">
                                <div className="related-img-wrapper">
                                    <img src={getFullUrl(p.images ? p.images[0] : '')} alt={p.name} />
                                </div>
                                <div className="related-info">
                                    <span className="related-brand">{p.brand}</span>
                                    <h4 className="related-name">{p.name}</h4>
                                    <div className="related-price-row">
                                        <span className="rel-curr">₹{p.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Selection Drawer */}
            <AnimatePresence>
                {isSelectionOpen && (
                    <div className="drawer-portal-wrapper">
                        <motion.div className="selection-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSelectionOpen(false)} />
                        <motion.div className="selection-drawer" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.3 }}>
                            <div className="drawer-header">
                                <h2>Select color and size</h2>
                                <button onClick={() => setIsSelectionOpen(false)}><X size={24}/></button>
                            </div>
                            <div className="drawer-body">
                                {product.colors?.length > 0 && (
                                    <div className="drawer-section">
                                        <h3>COLOR</h3>
                                        <div className="drawer-color-grid">
                                            {product.colors.map(color => (
                                                <button key={color} className={`drawer-color-btn ${selectedColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => setSelectedColor(color)} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {product.sizes?.length > 0 && (
                                    <div className="drawer-section">
                                        <div className="drawer-section-header">
                                            <h3>Select Size</h3>
                                            <span className="green-link">Guide & model info</span>
                                        </div>
                                        <div className="drawer-size-grid">
                                            {product.sizes.map(size => (
                                                <button key={size} className={`drawer-size-btn ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>
                                                    <Zap size={12} className="zap-icon"/> {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <button className="drawer-add-btn" onClick={finalAddToCart}>Add To Bag</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductDetails;