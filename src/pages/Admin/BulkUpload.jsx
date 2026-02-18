import React, { useState } from 'react';
import { uploadBulkProducts } from '../../api/adminApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Rocket, Trash2, Box, Image as ImageIcon } from 'lucide-react';
import './BulkUpload.css'; 

const BulkUpload = () => {
    const [products, setProducts] = useState([
        { id: Date.now(), name: '', brand: '', price: '', originalPrice: '', images: [] }
    ]);
    const [loading, setLoading] = useState(false);

    const addRow = () => {
        if (products.length < 20) {
            setProducts([...products, { id: Date.now(), name: '', brand: '', price: '', originalPrice: '', images: [] }]);
        } else {
            alert("Bhai, max 20 products limit!");
        }
    };

    const removeRow = (id) => {
        if (products.length > 1) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const handleInputChange = (id, field, value) => {
        setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleFileChange = (id, files) => {
        setProducts(products.map(p => p.id === id ? { ...p, images: Array.from(files) } : p));
    };

    const handleSubmit = async () => {
        const validProducts = products.filter(p => p.name && p.price && p.images.length > 0);
        if (validProducts.length === 0) {
            alert("Ek toh poora bharo!");
            return;
        }

        setLoading(true);
        try {
            for (let prod of validProducts) {
                const formData = new FormData();
                formData.append('name', prod.name);
                formData.append('brand', prod.brand);
                formData.append('price', prod.price);
                formData.append('originalPrice', prod.originalPrice || prod.price);
                formData.append('category', 'Premium'); 
                prod.images.forEach(img => formData.append('images', img));
                await uploadBulkProducts(formData);
            }
            alert("🚀 Collection Live in The Atelier!");
            setProducts([{ id: Date.now(), name: '', brand: '', price: '', originalPrice: '', images: [] }]);
        } catch (err) {
            alert("Error: Backend check kar!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bulk-container"
        >
            <div className="bulk-header-3d">
                <div className="header-icon"><Box size={40} /></div>
                <div>
                    <h1>NEW COLLECTION</h1>
                    <p>The Atelier Inventory Management</p>
                </div>
            </div>

            <div className="glass-table-container">
                <table className="bulk-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>PRODUCT DETAILS</th>
                            <th>BRAND</th>
                            <th>PRICE (₹)</th>
                            <th>MEDIA</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {products.map((p, index) => (
                                <motion.tr 
                                    key={p.id}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 50, opacity: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="row-3d"
                                >
                                    <td><span className="index-badge">{index + 1}</span></td>
                                    <td>
                                        <input type="text" placeholder="Product Name..." 
                                            onChange={(e) => handleInputChange(p.id, 'name', e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="text" placeholder="Brand..." 
                                            onChange={(e) => handleInputChange(p.id, 'brand', e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="0.00" 
                                            onChange={(e) => handleInputChange(p.id, 'price', e.target.value)} />
                                    </td>
                                    <td>
                                        <label className="custom-file-upload">
                                            <input type="file" multiple onChange={(e) => handleFileChange(p.id, e.target.files)} />
                                            <ImageIcon size={16} /> {p.images.length > 0 ? `${p.images.length} Files` : "Upload"}
                                        </label>
                                    </td>
                                    <td>
                                        <button onClick={() => removeRow(p.id)} className="btn-delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <div className="bulk-actions-floating">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addRow} className="btn-add-row"
                >
                    <Plus size={20} /> ADD ANOTHER ROW
                </motion.button>
                
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit} 
                    className={`btn-publish ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? <div className="spinner"></div> : <><Rocket size={20} /> PUBLISH COLLECTION</>}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default BulkUpload;