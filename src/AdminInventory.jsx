import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion'; // Added Framer Motion
import { Edit, Trash2, Search, RefreshCcw, Package, X, Save, AlertTriangle, Box, ArrowUpRight } from 'lucide-react';
import './AdminInventory.css';

const AdminInventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const baseURL = import.meta.env.VITE_API_URL;

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/products/all`);
            const data = Array.isArray(res.data) ? res.data : (res.data.products || []);
            setProducts(data);
        } catch (err) {
            toast.error("Failed to load inventory");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [baseURL]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id) => {
        if (window.confirm("Confirm delete? This action cannot be undone.")) {
            try {
                await axios.delete(`${baseURL}/api/products/delete/${id}`);
                toast.success("Product deleted successfully");
                setProducts(prev => prev.filter(p => p._id !== id));
            } catch (err) {
                toast.error("Delete failed");
            }
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.patch(`${baseURL}/api/products/update/${editingProduct._id}`, editingProduct);
            if (res.data.success || res.status === 200) {
                toast.success("Product details updated");
                setProducts(prev => prev.map(p => p._id === editingProduct._id ? editingProduct : p));
                setIsEditModalOpen(false);
            }
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: products.length,
        lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        totalValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
    };

    return (
        <div className="inventory-container">
            {/* Header Area */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inventory-header-glass"
            >
                <div className="header-info">
                    <h1>Inventory Ledger</h1>
                    <p>Manage stocks, pricing, and product visibility</p>
                </div>
                <div className="header-controls">
                    <div className="premium-search">
                        <Search size={18} className="search-icon-anim" />
                        <input 
                            type="text" 
                            placeholder="Search inventory..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchProducts} className="glass-refresh" disabled={loading}>
                        <RefreshCcw size={18} className={loading ? "spin" : ""} />
                    </button>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="stats-row">
                {[
                    { label: 'Total SKUs', value: stats.total, icon: <Box />, color: 'blue', glow: false },
                    { label: 'Low Stock', value: stats.lowStock, icon: <AlertTriangle />, color: 'amber', glow: stats.lowStock > 0 },
                    { label: 'Stock Out', value: stats.outOfStock, icon: <Package />, color: 'red', glow: stats.outOfStock > 0 },
                    { label: 'Inv. Value', value: `₹${stats.totalValue.toLocaleString()}`, icon: <ArrowUpRight />, color: 'green', glow: false }
                ].map((s, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`stat-box ${s.glow ? `${s.color}-glow` : ''}`}
                    >
                        <div className={`stat-icon-wrapper ${s.color}`}>{s.icon}</div>
                        <div className="stat-content">
                            <span className="label">{s.label}</span>
                            <span className="value">{s.value}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Table Card */}
            <motion.div 
                layout
                className="main-table-card"
            >
                {loading ? (
                    <div className="loading-overlay">
                        <div className="modern-spinner"></div>
                        <p>Syncing Live Inventory...</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>PRODUCT DETAILS</th>
                                    <th>CATEGORY</th>
                                    <th>PRICING</th>
                                    <th>STOCK STATUS</th>
                                    <th>AVAILABILITY</th>
                                    <th>CONTROL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredProducts.map((product) => (
                                        <motion.tr 
                                            key={product._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            layout
                                            className="table-row"
                                        >
                                            <td>
                                                <div className="product-meta">
                                                    <div className="product-thumb">
                                                        {product.images?.[0] ? <img src={product.images[0]} alt="" /> : <Box size={20}/>}
                                                    </div>
                                                    <div className="product-desc">
                                                        <span className="p-name">{product.name}</span>
                                                        <span className="p-brand">{product.brand}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="category-stack">
                                                    <span className="main-cat">{product.mainCategory}</span>
                                                    <span className="sub-cat">{product.subCategory}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="price-stack">
                                                    <span className="sell-price">₹{product.price}</span>
                                                    {product.originalPrice && <span className="mrp">₹{product.originalPrice}</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="stock-visual">
                                                    <div className="stock-labels">
                                                        <span className="stock-count">{product.stock} Units</span>
                                                        {product.stock < 10 && product.stock > 0 && <span className="urgent-badge">REORDER</span>}
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                                                            className={`progress-fill ${product.stock < 10 ? 'low' : ''}`} 
                                                        ></motion.div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-tag ${product.stock > 0 ? 'instock' : 'outofstock'}`}>
                                                    {product.stock > 0 ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-cluster">
                                                    <button onClick={() => handleEditClick(product)} className="action-icon edit"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(product._id)} className="action-icon delete"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Quick Edit Modal */}
            <AnimatePresence>
            {isEditModalOpen && editingProduct && (
                <div className="premium-modal-overlay">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="premium-modal"
                    >
                        <div className="modal-header-modern">
                            <div>
                                <h2>Edit Inventory Item</h2>
                                <p>ID: {editingProduct._id}</p>
                            </div>
                            <button className="close-x" onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="modal-form">
                            <div className="input-field full">
                                <label>Product Name</label>
                                <input 
                                    type="text" 
                                    value={editingProduct.name} 
                                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                />
                            </div>
                            <div className="input-row">
                                <div className="input-field">
                                    <label>Price (₹)</label>
                                    <input 
                                        type="number" 
                                        value={editingProduct.price} 
                                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                                    />
                                </div>
                                <div className="input-field">
                                    <label>Current Stock</label>
                                    <input 
                                        type="number" 
                                        value={editingProduct.stock} 
                                        onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions-modern">
                            <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Discard</button>
                            <button className="btn-primary" onClick={handleUpdate}>
                                <Save size={18} /> Update Ledger
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default AdminInventory;