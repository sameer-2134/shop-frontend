import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// --- 1. SKELETON COMPONENT ---
const SkeletonCard = () => (
    <div className="skeleton-card" style={{
        background: '#f0f0f0',
        borderRadius: '12px',
        height: '350px',
        width: '100%',
        animation: 'pulse 1.5s infinite ease-in-out'
    }}>
        <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
    </div>
);

// --- 2. PRODUCT CARD COMPONENT ---
const ProductCard = ({ product }) => (
    <div className="product-card" style={{
        border: '1px solid #eee',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer'
    }}>
        <div style={{ height: '280px', background: '#f9f9f9', overflow: 'hidden' }}>
            <img 
                src={product.images?.[0] || 'https://via.placeholder.com/300'} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </div>
        <div style={{ padding: '15px' }}>
            <p style={{ margin: '0', color: '#888', fontSize: '12px', fontWeight: 'bold' }}>{product.brand?.toUpperCase()}</p>
            <h3 style={{ margin: '5px 0', fontSize: '16px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>₹{product.price}</span>
                {product.originalPrice && (
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>₹{product.originalPrice}</span>
                )}
            </div>
        </div>
    </div>
);

// --- 3. MAIN LIST COMPONENT ---
const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef();

    const fetchProducts = async (isFirstLoad = false) => {
        if (loading || (!hasMore && !isFirstLoad)) return;
        
        setLoading(true);
        try {
            // FIX: Endpoint ko '/api/products/all' kar diya jo tere backend mein hai
            const currentCursor = isFirstLoad ? '' : cursor;
            const url = `http://localhost:5000/api/products/all?limit=12${currentCursor ? `&cursor=${currentCursor}` : ''}`;
            
            const { data } = await axios.get(url);
            
            if (data.success) {
                setProducts(prev => isFirstLoad ? data.products : [...prev, ...data.products]);
                setCursor(data.nextCursor);
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchProducts(true);
    }, []);

    // Infinite Scroll Logic
    const lastProductRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchProducts();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, cursor]);

    return (
        <div className="product-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '800', letterSpacing: '2px' }}>OUR COLLECTION</h2>
            
            <div className="product-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '25px' 
            }}>
                {products.map((product, index) => {
                    if (products.length === index + 1) {
                        return (
                            <div ref={lastProductRef} key={product._id}>
                                <ProductCard product={product} />
                            </div>
                        );
                    }
                    return <ProductCard key={product._id} product={product} />;
                })}

                {loading && [1, 2, 3, 4].map(n => (
                    <SkeletonCard key={`skeleton-${n}`} />
                ))}
            </div>

            {/* Load More Button - Agar scroll kaam na kare toh ye backup hai */}
            {hasMore && !loading && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button 
                        onClick={() => fetchProducts()}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Load More Products
                    </button>
                </div>
            )}

            {!hasMore && products.length > 0 && (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#666' }}>
                    <p style={{ fontSize: '1.2rem' }}>✨ Bas bhai, itna hi maal tha! ✨</p>
                </div>
            )}
        </div>
    );
};

export default ProductList;