import React, { useEffect, useState, useCallback, useRef, useMemo, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "./CartContext";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { 
  Loader2, ShoppingBag, Fingerprint, Scan, Plus, 
  Cpu, Zap, ShieldCheck, Globe 
} from "lucide-react";
import "./Gallery.css";

const Gallery = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // ✅ 1. LOGIN REFRESH PROBLEM KA SOLUTION
  // Is logic ko Navbar me bhi use kar sakte ho bina page refresh kiye state update karne ke liye
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    // Storage change detect karne ke liye listener
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const lenisRef = useRef(null);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedCat = params.get("cat")?.toUpperCase() || "NEW_ARCHIVE";

  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getImage = (img) => {
    if (!img) return "https://placehold.co/800x1000?text=No+Image";
    if (img.startsWith("http")) return img.replace("http://", "https://");
    const baseUrl = API_BASE_URL?.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanPath = img.replace(/\\/g, "/");
    const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${baseUrl}${formattedPath}`.replace("http://", "https://");
  };

  const fetchProducts = useCallback(async (loadMore = false) => {
    if (loadMore) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/all`, {
        params: { limit: 12, cursor: loadMore ? cursor : "", category: params.get("cat") || "" }
      });
      if (res.data.success) {
        setProducts(prev => {
          const incomingProducts = shuffleArray(res.data.products);
          return loadMore ? [...prev, ...incomingProducts] : incomingProducts;
        });
        setCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, API_BASE_URL, params]);

  useEffect(() => { fetchProducts(false); }, [location.search]);

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const savedScrollPos = localStorage.getItem(`scrollPos_${location.search}`);
    if (savedScrollPos && !loading && products.length > 0) {
      setTimeout(() => {
        if (lenisRef.current) lenisRef.current.scrollTo(parseInt(savedScrollPos), { immediate: true });
        else window.scrollTo(0, parseInt(savedScrollPos));
      }, 150);
    }
  }, [loading, products.length, location.search]);

  useEffect(() => {
    const handleScroll = () => localStorage.setItem(`scrollPos_${location.search}`, window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.search]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, lerp: 0.1 });
    lenisRef.current = lenis;
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); lenisRef.current = null; };
  }, []);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const rotateX = useTransform(smoothProgress, [0, 0.2], [0, 15]);

  if (loading && products.length === 0) {
    return (
      <div className="heavy-loader-screen">
        <Fingerprint size={80} className="loader-icon-anim" />
        <p className="loader-text">SYNCING_ARCHIVE...</p>
      </div>
    );
  }

  return (
    <div className="premium-root">
      <div className="marquee-wrapper top">
        <div className="marquee-track">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="marquee-item">
              <Zap size={14} fill="currentColor" /> SYSTEM_BOOT_2026 
              <span className="separator">/</span> 
              <Cpu size={14} /> ARCHIVE_RESOURCES 
              <span className="separator">/</span> 
              <ShieldCheck size={14} /> ENCRYPTED_LINK 
              <span className="separator">/</span> 
              <Globe size={14} /> INDORE_CORE —
            </span>
          ))}
        </div>
      </div>

      <header className="premium-header">
        <motion.div className="header-grid" style={{ rotateX }}>
          <div className="h-left">
            <span className="system-status">
              <span className="blink-dot">●</span> 
              {isLoggedIn ? "AUTH_ACTIVE" : "STATUS_READY"}
            </span>
            <h1>{selectedCat}</h1>
          </div>
          <div className="h-right">
            <div className="data-row"><span>COUNT:</span><span>{products.length}</span></div>
            <div className="data-row"><span>BATCH:</span><span>2026_A</span></div>
          </div>
        </motion.div>
      </header>

      <main className="premium-grid">
        <AnimatePresence mode="popLayout">
          {products.map((item, i) => (
            <motion.div
              key={item._id}
              className={`premium-card ${i % 7 === 0 ? 'large' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="card-inner">
                <div className="img-holder" onClick={() => navigate(`/product/${item._id}`)}>
                  <img 
                    src={getImage(item.images?.[0])} 
                    alt={item.name} 
                    loading="lazy" 
                    onError={(e) => { e.target.src="https://placehold.co/800x1000?text=IMAGE_ERROR"; }}
                  />
                  <div className="scan-line" />
                  <div className="card-overlay-info">
                    <Scan size={40} />
                    <span>VIEW_ASSET</span>
                  </div>
                </div>
                <div className="card-info">
                  <div className="info-top">
                    <h3>{item.name}</h3>
                    <span className="price-tag">₹{item.price?.toLocaleString()}</span>
                  </div>
                  <div className="info-bottom">
                    <span className="brand-code">[{item.brand || "ARCHIVE"}]</span>
                    <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(item); }}>
                      <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {hasMore && (
        <div className="load-more-section">
          <button className="load-more-btn" onClick={() => fetchProducts(true)}>
            {loadingMore ? <Loader2 className="spin" /> : "REQUEST_MORE_DATA"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;