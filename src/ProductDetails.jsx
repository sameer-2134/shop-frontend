import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Heart, ShieldCheck, Truck, 
  ChevronRight, Tag, RotateCcw, MapPin, X, Zap 
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
    
    // Selection States
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [pincode, setPincode] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Selection Modal State
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);
    
    // ✅ Production-ready API URL
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
                if (res.data.success) {
                    const currentProduct = res.data.product;
                    setProduct(currentProduct);
                    if (currentProduct.images?.length > 0) setMainImage(currentProduct.images[0]);
                    
                    // Logic to fetch related products
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
            }
        };
        if (id) fetchProduct();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id, API_BASE_URL]);

    const handleInitialAdd = () => {
        if ((product.sizes?.length > 0) || (product.colors?.length > 0)) {
            setIsSelectionOpen(true);
        } else {
            addToCart({ ...product });
        }
    };

    const finalAddToCart = () => {
        if (product.colors?.length > 0 && !selectedColor) return;
        if (product.sizes?.length > 0 && !selectedSize) return;

        addToCart({ ...product, selectedSize, selectedColor });
        setIsSelectionOpen(false);
    };

    const getFullUrl = (img) => {
        if (!img) return "https://placehold.co/600x800?text=Premium+Piece";
        // Fixing backslashes for windows-based paths and ensuring correct URL
        const cleanPath = img.replace(/\\/g, '/');
        return cleanPath.startsWith('http') ? cleanPath : `${API_BASE_URL}/${cleanPath}`;
    };

    if (loading) return <div className="pd-loader"><div className="loader-ring"></div><p>CURATING EXPERIENCE...</p></div>;
    if (error || !product) return <div className="pd-error">Product Not Found</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pd-wrapper">
            <div className="pd-container">
                {/* LEFT: GALLERY */}
                <div className="pd-gallery-section">
                    <div className="pd-thumbnails">
                        {product.images?.map((img, index) => (
                            <div key={index} className={`pd-thumb-item ${mainImage === img ? 'active' : ''}`} onMouseEnter={() => setMainImage(img)}>
                                <img src={getFullUrl(img)} alt={`Thumbnail ${index}`} />
                            </div>
                        ))}
                    </div>
                    <div className="pd-main-viewer">
                        <ProductImageZoom src={getFullUrl(mainImage)} />
                    </div>
                </div>

                {/* RIGHT: DETAILS */}
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

                    {/* SIZE SELECTOR */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="pd-size-section">
                            <div className="size-header">
                                <h3>SELECT SIZE</h3>
                                <span className="size-chart-link">SIZE CHART</span>
                            </div>
                            <div className="size-grid">
                                {product.sizes.map(size => (
                                    <button 
                                        key={size} 
                                        onClick={() => setSelectedSize(size)}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                    >
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
                        <h3 className="section-label"><MapPin size={16}/> DELIVERY OPTIONS</h3>
                        <div className="pincode-input-wrap">
                            <input type="text" placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                            <button>CHECK</button>
                        </div>
                    </div>

                    <div className="pd-action-btns">
                        <button className="pd-btn-primary" onClick={handleInitialAdd}>
                            <ShoppingBag size={20} /> ADD TO BAG
                        </button>
                        <button className="pd-btn-secondary" onClick={() => addToWishlist(product)}>
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

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="related-section">
                    <div className="section-divider"><span>EXPLORE SIMILAR PIECES</span></div>
                    <div className="related-grid">
                        {relatedProducts.map(p => (
                            <Link to={`/product/${p._id}`} key={p._id} className="related-card">
                                <div className="related-img-wrapper">
                                    <img src={getFullUrl(p.images[0])} alt={p.name} />
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

            {/* SELECTION POPUP DRAWER */}
            <AnimatePresence>
                {isSelectionOpen && (
                    <>
                        <motion.div 
                            className="selection-overlay" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSelectionOpen(false)}
                        />
                        <motion.div 
                            className="selection-drawer"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
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
                                                <button 
                                                    key={color} 
                                                    className={`drawer-color-btn ${selectedColor === color ? 'active' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setSelectedColor(color)}
                                                />
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
                                                <button 
                                                    key={size}
                                                    className={`drawer-size-btn ${selectedSize === size ? 'active' : ''}`}
                                                    onClick={() => setSelectedSize(size)}
                                                >
                                                    <Zap size={12} className="zap-icon"/> {size}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="delivery-tip"><Zap size={14} className="zap-icon-yellow"/> Available for fast delivery</p>
                                    </div>
                                )}

                                <button 
                                    className={`drawer-add-btn ${(product.sizes?.length > 0 && !selectedSize) ? 'disabled' : ''}`} 
                                    onClick={finalAddToCart}
                                >
                                    Add To Bag
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductDetails;