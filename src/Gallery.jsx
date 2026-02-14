import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "./CartContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { Loader2, Plus, Search } from "lucide-react";
import "./Gallery.css";

const Gallery = () => {
  // ✅ Dynamic API URL for production
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observer = useRef(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // URL Query Parameters
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedCat = params.get("cat")?.toLowerCase() || "";
  const selectedSection = params.get("section")?.toLowerCase() || "";
  const searchQuery = params.get("search")?.toLowerCase() || "";

  /* ---------------- SMOOTH SCROLL (LENIS) ---------------- */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  /* ---------------- FETCH LOGIC ---------------- */
  const fetchProducts = useCallback(
    async (loadMore = false) => {
      if (loadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        // Corrected path to ensure no double slashes
        const res = await axios.get(`${API_BASE_URL}/api/products/all`, {
          params: {
            limit: 12,
            cursor: loadMore ? cursor : "",
            search: searchQuery,
            category: selectedCat,
            section: selectedSection
          }
        });

        if (res.data.success) {
          setProducts((prev) =>
            loadMore ? [...prev, ...res.data.products] : res.data.products
          );
          setCursor(res.data.nextCursor);
          setHasMore(res.data.hasMore);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("ARCHIVE ACCESS FAILED");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, searchQuery, selectedCat, selectedSection, API_BASE_URL]
  );

  /* ---------------- RESET ON URL CHANGE ---------------- */
  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchProducts(false); 
  }, [searchQuery, selectedCat, selectedSection]); // Removed fetchProducts from dependency to avoid loop, or keep it if properly memoized

  /* ---------------- LAZY LOADING ---------------- */
  const lastItemRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchProducts(true);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, fetchProducts]
  );

  /* ---------------- UTILS ---------------- */
  const getImage = (img) => {
    if (!img) return "https://placehold.co/400x600?text=No+Image";
    return img.startsWith("http")
      ? img
      : `${API_BASE_URL}/${img.replace(/\\/g, "/")}`;
  };

  const getGridType = (i) => {
    if (i === 0) return "hero";
    if (i % 9 === 0) return "tall";
    if (i % 5 === 0) return "wide";
    return "standard";
  };

  /* ---------------- RENDER ---------------- */
  if (loading && products.length === 0) {
    return (
      <div className="neo-loader">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          LOADING ARCHIVE…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="neo-gallery-root">
      <header className="neo-hero">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {selectedSection ? selectedSection.toUpperCase() : "THE COLLECTION"}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={searchQuery + selectedCat}
        >
          {searchQuery ? `"${searchQuery}"` : (selectedCat || "STILL LIFE")}
        </motion.h1>
      </header>

      <main className="neo-grid">
        <AnimatePresence mode="popLayout">
          {products.length > 0 ? (
            products.map((item, i) => {
              const isLast = i === products.length - 1;
              const gridType = getGridType(i);

              return (
                <motion.div
                  key={item._id}
                  ref={isLast ? lastItemRef : null}
                  className={`neo-card neo-${gridType}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "100px" }}
                  transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
                >
                  <div
                    className="neo-img-wrapper"
                    onClick={() => navigate(`/product/${item._id}`)}
                  >
                    <img
                      src={getImage(item.images?.[0])}
                      alt={item.name}
                      loading="lazy"
                    />
                    <div className="neo-overlay">
                      <button
                        className="neo-quick-add"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                      >
                        <Plus size={26} />
                      </button>
                    </div>
                  </div>

                  <div className="neo-details">
                    <h3>{item.name}</h3>
                    <div className="neo-p-footer">
                      <span>{item.brand || "ARCHIVE"}</span>
                      <span>₹{item.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              className="neo-no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search size={42} strokeWidth={1} />
              <p>NO ITEMS MATCH YOUR SEARCH</p>
              <button onClick={() => navigate("/gallery")}>CLEAR ALL</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div style={{ minHeight: "150px" }}>
        {loadingMore && (
          <div className="neo-scroll-loader">
            <Loader2 className="spin" size={20} />
            <span>EXPANDING ARCHIVE</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;