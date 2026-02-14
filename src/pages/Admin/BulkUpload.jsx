import React, { useState } from 'react';
import { uploadBulkProducts } from '../../api/adminApi'; // ✅ Path updated
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
            alert("Bhai, ek baar mein 20 products kaafi hain!");
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
            alert("Kam se kam ek product toh poora bharo!");
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
                
                prod.images.forEach(img => {
                    formData.append('images', img);
                });

                await uploadBulkProducts(formData);
            }
            alert("All products launched in The Atelier! 🚀");
            setProducts([{ id: Date.now(), name: '', brand: '', price: '', originalPrice: '', images: [] }]);
        } catch (err) {
            console.error("Upload Error:", err);
            alert("Backend check karo, upload nahi ho pa raha!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bulk-container">
            <div className="bulk-header">
                <h3>NEW COLLECTION ENTRY</h3>
                <p>Inventory management for The Atelier</p>
            </div>

            <div className="table-wrapper">
                <table className="bulk-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>PRODUCT NAME</th>
                            <th>BRAND</th>
                            <th>PRICE (₹)</th>
                            <th>IMAGES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, index) => (
                            <tr key={p.id}>
                                <td>{index + 1}</td>
                                <td><input type="text" placeholder="Name" onChange={(e) => handleInputChange(p.id, 'name', e.target.value)} /></td>
                                <td><input type="text" placeholder="Brand" onChange={(e) => handleInputChange(p.id, 'brand', e.target.value)} /></td>
                                <td><input type="number" placeholder="0" onChange={(e) => handleInputChange(p.id, 'price', e.target.value)} /></td>
                                <td><input type="file" multiple className="file-input" onChange={(e) => handleFileChange(p.id, e.target.files)} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bulk-footer">
                <button onClick={addRow} className="btn-secondary">+ ADD ROW</button>
                <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
                    {loading ? "UPLOADING..." : "PUBLISH TO SITE"}
                </button>
            </div>
        </div>
    );
};

export default BulkUpload;