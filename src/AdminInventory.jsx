import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Edit, Trash2, Search, RefreshCcw, Package, X, Save, AlertTriangle, Box } from 'lucide-react';
import './AdminInventory.css';

const AdminInventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const baseURL = import.meta.env.VITE_API_URL;

    const fetchProducts = async () => {
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
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`${baseURL}/api/products/delete/${id}`);
                toast.success("Product removed");
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
                toast.success("Product updated");
                setProducts(prev => prev.map(p => p._id === editingProduct._id ? editingProduct : p));
                setIsEditModalOpen(false);
            }
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const filteredProducts = (products || []).filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockItems = products.filter(p => p.stock > 0 && p.stock < 5);
    const outOfStockItems = products.filter(p => p.stock === 0);

    return (
        <div className="inventory-wrapper">
            <div className="inventory-header">
                <div className="header-text">
                    <h2>Inventory Management</h2>
                    <p>Track and manage your product stock levels</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search brand or product..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchProducts} className="refresh-btn" title="Refresh Data">
                        <RefreshCcw size={18} />
                    </button>
                </div>
            </div>

            <div className="inventory-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><Box size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Products</span>
                        <span className="stat-value">{products.length}</span>
                    </div>
                </div>
                <div className={`stat-card ${lowStockItems.length > 0 ? 'warning' : ''}`}>
                    <div className="stat-icon"><AlertTriangle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Low Stock</span>
                        <span className="stat-value">{lowStockItems.length}</span>
                    </div>
                </div>
                <div className={`stat-card ${outOfStockItems.length > 0 ? 'danger' : ''}`}>
                    <div className="stat-icon"><Package size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Out of Stock</span>
                        <span className="stat-value">{outOfStockItems.length}</span>
                    </div>
                </div>
            </div>

            <div className="inventory-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Updating Ledger...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock Status</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="product-info-cell">
                                                <div className="p-img-mini">
                                                    {product.images?.[0] ? 
                                                        <img src={product.images[0]} alt="" /> : 
                                                        <Package size={16}/>
                                                    }
                                                </div>
                                                <div>
                                                    <div className="p-name-main">{product.name}</div>
                                                    <div className="p-brand-sub">{product.brand}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="cat-badge">{product.mainCategory}</span>
                                            <div className="sub-cat-text">{product.subCategory}</div>
                                        </td>
                                        <td>
                                            <div className="p-price-cell">
                                                <span className="current-price">₹{product.price}</span>
                                                {product.originalPrice && <span className="p-mrp-sub">₹{product.originalPrice}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`stock-indicator ${product.stock < 5 ? 'critical' : ''}`}>
                                                <span className="stock-num">{product.stock} left</span>
                                                {product.stock < 5 && product.stock > 0 && <span className="restock-badge">LOW</span>}
                                                {product.stock === 0 && <span className="oos-badge">OOS</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${product.stock > 0 ? 'active' : 'oos'}`}>
                                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="edit-btn" onClick={() => handleEditClick(product)} title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="del-btn" onClick={() => handleDelete(product._id)} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isEditModalOpen && editingProduct && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <div className="modal-header">
                            <h3>Quick Edit Product</h3>
                            <button className="close-modal" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-input-group">
                                <label>Product Name</label>
                                <input 
                                    type="text" 
                                    value={editingProduct.name} 
                                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                />
                            </div>
                            <div className="modal-row">
                                <div className="modal-input-group">
                                    <label>Price (₹)</label>
                                    <input 
                                        type="number" 
                                        value={editingProduct.price} 
                                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                                    />
                                </div>
                                <div className="modal-input-group">
                                    <label>Stock Quantity</label>
                                    <input 
                                        type="number" 
                                        value={editingProduct.stock} 
                                        onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="save-btn" onClick={handleUpdate}>
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;