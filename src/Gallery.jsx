import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Loader2, Plus, ArrowUpRight, Heart, Search, X } from "lucide-react";
import { useCart } from "./CartContext";
import "./Gallery.css";

// --- Smooth Image Component for Premium Loading Feel ---
const SmoothImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={`img-skeleton-container ${isLoaded ? "loaded" : "loading"}`}>
      <motion.img
        src={src}
        alt={alt}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        onLoad={() => setIsLoaded(true)}
      />
      {!isLoaded && <div className="shimmer-overlay"></div>}
    </div>
  );
};

const Gallery = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const ITEMS_PER_PAGE = 8; 

  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // --- Wishlist and Cart Context ---
  const { addToCart, addToWishlist, wishlist, removeFromWishlist } = useCart();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedCat = params.get("cat")?.toUpperCase() || "THE ARCHIVE";

  // Helper check for Wishlist state
  const isInWishlist = (id) => wishlist?.some(item => (item._id === id || item.productId?._id === id));

  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getImage = (img) => {
    if (!img) return "https://placehold.co/600x800?text=No+Image";
    const cleanPath = img.replace(/\\/g, '/');
    return cleanPath.startsWith('http') ? cleanPath : `${API_BASE_URL}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
  };

  const fetchProducts = useCallback(async (loadMore = false) => {
    loadMore ? setLoadingMore(true) : setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/all`, {
        params: { 
            limit: ITEMS_PER_PAGE, 
            cursor: loadMore ? cursor : "", 
            category: params.get("cat") || "" 
        },
      });

      if (res.data.success) {
        const fetched = res.data.products;
        const finalProducts = loadMore ? [...products, ...fetched] : shuffleArray(fetched);
        
        setProducts(finalProducts);
        setDisplayProducts(finalProducts);
        setCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, API_BASE_URL, params, products]);

  useEffect(() => {
    fetchProducts(false);
  }, [location.search]);

  useEffect(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayProducts(filtered);
  }, [searchTerm, products]);

  if (loading && products.length === 0) {
    return (
      <div className="aesthetic-loader">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>
          <ShoppingBag size={48} strokeWidth={1} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="aesthetic-page">
      <header className="aesthetic-header">
        <div className="header-left">
          <p className="subtitle">EST. 2026 / CURATED PIECES</p>
          <h1>{selectedCat}</h1>
        </div>
        
        <div className="header-right">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="SEARCH ARCHIVE..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <X size={16} className="clear-search" onClick={() => setSearchTerm("")} />}
          </div>
          <span className="count-pill">{displayProducts.length} ITEMS</span>
        </div>
      </header>

      <main className="aesthetic-grid">
        <AnimatePresence mode="popLayout">
          {displayProducts.map((item, i) => {
            const sizeClass = i % 7 === 0 ? "card-tall" : i % 5 === 0 ? "card-wide" : "card-normal";
            const activeWish = isInWishlist(item._id);

            return (
              <motion.div
                layout
                key={item._id}
                className={`aesthetic-card ${sizeClass}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: (i % ITEMS_PER_PAGE) * 0.05 }}
              >
                <div className="img-wrapper">
                  <div className="img-container" onClick={() => navigate(`/product/${item._id}`)}>
                    <SmoothImage 
                      src={getImage(item.images?.[0])} 
                      alt={item.name} 
                    />
                    <div className="img-overlay">
                      <span>EXPLORE PIECE <ArrowUpRight size={14} /></span>
                    </div>
                  </div>

                  {/* --- Wishlist Button Logic --- */}
                  <button 
                    className={`wish-heart ${activeWish ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        activeWish ? removeFromWishlist(item._id) : addToWishlist(item);
                    }}
                  >
                    <Heart 
                        size={18} 
                        fill={activeWish ? "#ff4757" : "none"} 
                        stroke={activeWish ? "#ff4757" : "currentColor"} 
                    />
                  </button>

                  <button className="quick-add-btn" onClick={() => addToCart(item)}>
                    <Plus size={16} /> ADD TO BAG
                  </button>
                </div>

                <div className="info-area">
                  <div className="brand-line">
                    <span className="brand-name">{item.brand || "STUDIO"}</span>
                    {i < 2 && !searchTerm && <span className="new-tag">NEW</span>}
                  </div>
                  <h3 className="product-name">{item.name}</h3>
                  <div className="price-line">
                    <span className="current-price">₹{item.price?.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      {hasMore && !searchTerm && (
        <div className="load-more-section">
          <button 
            className="view-more-btn" 
            onClick={() => fetchProducts(true)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <> <Loader2 className="spin" size={18} /> LOADING ARCHIVE... </>
            ) : (
              "VIEW MORE PIECES"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;