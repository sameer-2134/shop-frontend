import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    Package, IndianRupee, Image as ImageIcon, 
    Star, PlusCircle, FileStack, 
    X, Palette, AlignLeft 
} from 'lucide-react';
import './AdminProduct.css';

const AdminProduct = () => {
    const [uploadMode, setUploadMode] = useState('single'); 
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [bulkText, setBulkText] = useState("");
    const [colorInput, setColorInput] = useState("");

    const baseURL = import.meta.env.VITE_API_URL;

    const taxonomy = {
        MEN: {
            Clothing: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Jackets", "Kurta"],
            Footwear: ["Sneakers", "Formal Shoes", "Casual Shoes", "Sandals"],
            Accessories: ["Watches", "Wallets", "Belts", "Sunglasses"]
        },
        WOMEN: {
            Clothing: ["Kurtas & Suits", "Sarees", "Dresses", "Tops", "Jeans", "Lehengas"],
            Footwear: ["Heels", "Flats", "Sneakers", "Boots"],
            Beauty: ["Makeup", "Skincare", "Fragrance"]
        },
        KIDS: {
            Clothing: ["T-Shirts", "Shirts", "Dresses", "Ethnic Wear"],
            Footwear: ["Casual Shoes", "School Shoes"],
            Toys: ["Learning Toys", "Soft Toys"]
        },
        ELECTRONICS: {
            Gadgets: ["Smartphones", "Smart Watches", "Powerbanks"],
            Audio: ["Headphones", "Bluetooth Earbuds", "Speakers"],
            Computing: ["Laptops", "Hard Disks", "Monitors"]
        },
        MORE: {
            Sports: ["Cricket", "Football", "Gym Equipment", "Yoga Mats"],
            Home_Living: ["Bedsheets", "Curtains", "Wall Decor", "Kitchenware"],
            Stationery: ["Fiction Books", "Stationery", "Art Supplies"]
        }
    };

    const [formData, setFormData] = useState({
        name: '', brand: '', price: '', originalPrice: '', stock: '',
        description: '', section: '', category: '', subCategory: '', 
        images: [], sizes: [], colors: [], imageUrl: '' 
    });

    const getAvailableSizes = () => {
        const cat = (formData.category || "").toLowerCase();
        const subCat = (formData.subCategory || "").toLowerCase();

        if (cat === 'footwear') return ['6', '7', '8', '9', '10', '11'];
        if (subCat === 'jeans' || subCat === 'trousers') return ['28', '30', '32', '34', '36', '38'];
        if (formData.section === 'KIDS' && cat === 'clothing') return ['2-3Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y'];
        if (cat === 'clothing') return ['S', 'M', 'L', 'XL', 'XXL'];
        return [];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'section') {
            setFormData({ ...formData, section: value, category: '', subCategory: '', sizes: [] });
        } else if (name === 'category') {
            setFormData({ ...formData, category: value, subCategory: '', sizes: [] });
        } else if (name === 'subCategory') {
            setFormData({ ...formData, subCategory: value, sizes: [] });
        } else if (name === 'imageUrl') {
            const urls = value.split(',').map(url => url.trim()).filter(url => url !== "");
            setFormData({ ...formData, imageUrl: value });
            setPreviews(urls);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const addColor = (e) => {
        if (e.key === 'Enter' && colorInput.trim()) {
            e.preventDefault();
            if (!formData.colors.includes(colorInput.trim())) {
                setFormData({ ...formData, colors: [...formData.colors, colorInput.trim()] });
            }
            setColorInput("");
        }
    };

    const removeColor = (colorToRemove) => {
        setFormData({ ...formData, colors: formData.colors.filter(c => c !== colorToRemove) });
    };

    const handleSizeToggle = (size) => {
        const newSizes = formData.sizes.includes(size)
            ? formData.sizes.filter(s => s !== size)
            : [...formData.sizes, size];
        setFormData({ ...formData, sizes: newSizes });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setFormData({ 
            ...formData, 
            images: [...formData.images, ...files], 
            imageUrl: '' 
        }); 
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setPreviews(previews.filter((_, i) => i !== index));
        setFormData({...formData, images: formData.images.filter((_, i) => i !== index)});
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            if (uploadMode === 'single') {
                const data = new FormData();
                const finalSizes = formData.sizes.length > 0 ? formData.sizes : (getAvailableSizes().length === 0 ? ["Free Size"] : []);

                if (finalSizes.length === 0 && getAvailableSizes().length > 0) {
                    toast.warn("Please select at least one size");
                    setLoading(false);
                    return;
                }

                Object.keys(formData).forEach(key => {
                    if (key === 'images') {
                        formData.images.forEach(img => data.append('images', img));
                    } else if (key === 'sizes') {
                        data.append('sizes', JSON.stringify(finalSizes));
                    } else if (key === 'colors') {
                        data.append('colors', JSON.stringify(formData.colors));
                    } else if (key === 'imageUrl') {
                        if (formData.imageUrl) data.append('externalImageUrls', formData.imageUrl);
                    } else {
                        data.append(key, formData[key]);
                    }
                });
                
                const res = await axios.post(`${baseURL}/api/products/add`, data);
                if (res.data.success) {
                    toast.success("Product Authorized! 🚀");
                    resetForm();
                }
            } else {
                let productsArray = [];
                const trimmedText = bulkText.trim();
                if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
                    productsArray = JSON.parse(trimmedText);
                } else {
                    const rows = trimmedText.split('\n');
                    productsArray = rows.map(row => {
                        const [brand, name, price, originalPrice, stock, section, category, subCategory, imageUrl, description, sizesStr] = row.split(',').map(s => s?.trim());
                        const bulkSizes = sizesStr ? sizesStr.split('|') : ["Free Size"];
                        return { brand, name, price, originalPrice, stock, section, category, subCategory, images: [imageUrl], description, sizes: bulkSizes };
                    });
                }
                const res = await axios.post(`${baseURL}/api/products/bulk-add`, productsArray);
                if (res.data.success) {
                    toast.success("Bulk Import Success!");
                    setBulkText("");
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Check Data Format");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ 
            name: '', brand: '', price: '', originalPrice: '', stock: '', 
            description: '', section: '', category: '', subCategory: '', 
            images: [], sizes: [], colors: [], imageUrl: '' 
        });
        setPreviews([]);
    };

    return (
        <div className="ap-page-wrapper">
             <div className="admin-header">
                <h2>Owner Dashboard</h2>
                <p>Manage ShopLane Inventory</p>
            </div>

            <div className="ap-tabs">
                <button className={`ap-tab-btn ${uploadMode === 'single' ? 'active' : ''}`} onClick={() => setUploadMode('single')}>
                    <PlusCircle size={16} /> <span>Single Entry</span>
                </button>
                <button className={`ap-tab-btn ${uploadMode === 'bulk' ? 'active' : ''}`} onClick={() => setUploadMode('bulk')}>
                    <FileStack size={16} /> <span>Bulk Import</span>
                </button>
            </div>

            <div className="ap-main-grid">
                <div className="ap-content-section">
                    {uploadMode === 'single' ? (
                        <div className="ap-form-card">
                            <div className="ap-form-row-2">
                                <div className="ap-input-group">
                                    <label><Star size={14} /> Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="SHOPLANE" />
                                </div>
                                <div className="ap-input-group">
                                    <label><Package size={14} /> Product Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Cotton Slim Shirt" />
                                </div>
                            </div>

                            <div className="ap-input-group">
                                <label><AlignLeft size={14} /> Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Product details..." />
                            </div>

                            <div className="ap-form-row-3">
                                <div className="ap-input-group">
                                    <label>Section</label>
                                    <select name="section" value={formData.section} onChange={handleChange}>
                                        <option value="">Select</option>
                                        {Object.keys(taxonomy).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="ap-input-group">
                                    <label>Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} disabled={!formData.section}>
                                        <option value="">Select Category</option>
                                        {formData.section && Object.keys(taxonomy[formData.section]).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="ap-input-group">
                                    <label>Sub-Category</label>
                                    <select name="subCategory" value={formData.subCategory} onChange={handleChange} disabled={!formData.category}>
                                        <option value="">Select Sub-Type</option>
                                        {formData.category && taxonomy[formData.section][formData.category].map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="ap-form-row-3">
                                <div className="ap-input-group">
                                    <label><IndianRupee size={14} /> Sale Price</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} />
                                </div>
                                <div className="ap-input-group">
                                    <label>MRP Price</label>
                                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} />
                                </div>
                                <div className="ap-input-group">
                                    <label>Stock</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="ap-input-group">
                                <label><Palette size={14} /> Available Colors (Press Enter)</label>
                                <input 
                                    type="text" 
                                    value={colorInput} 
                                    onChange={(e) => setColorInput(e.target.value)} 
                                    onKeyDown={addColor}
                                    placeholder="Red, Blue, Black..."
                                />
                                <div className="ap-color-chips">
                                    {formData.colors.map(color => (
                                        <span key={color} className="color-tag">
                                            {color} <X size={12} onClick={() => removeColor(color)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {getAvailableSizes().length > 0 && (
                                <div className="ap-input-group">
                                    <label>Available Sizes</label>
                                    <div className="ap-size-chips">
                                        {getAvailableSizes().map(size => (
                                            <button key={size} type="button" 
                                                className={`ap-size-btn ${formData.sizes.includes(size) ? 'selected' : ''}`}
                                                onClick={() => handleSizeToggle(size)}>{size}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="ap-input-group">
                                <label><ImageIcon size={14} /> Media Assets</label>
                                <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                                <div style={{marginTop:'10px'}}>
                                    <input type="text" name="imageUrl" placeholder="External URL(s) separate by comma..." value={formData.imageUrl} onChange={handleChange} />
                                </div>
                                {previews.length > 0 && (
                                    <div className="ap-preview-strip">
                                        {previews.map((src, i) => (
                                            <div key={i} className="mini-preview">
                                                <img src={src} alt="thumb" />
                                                <X size={12} className="remove-icon" onClick={() => removeImage(i)} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="ap-bulk-section">
                            <div className="bulk-info">CSV format: Brand, Name, Price, MRP, Stock, Section, Category, SubCategory, ImageURL, Description, Sizes(split by |)</div>
                            <textarea className="ap-bulk-area" value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder='NIKE, Zoom Sneakers, 5000, 8000, 10, MEN, Footwear, Sneakers, http://img.com, Great shoes, 8|9|10' />
                        </div>
                    )}

                    <button className={`ap-submit-btn ${loading ? 'loading' : ''}`} onClick={handleSubmit} disabled={loading}>
                        {loading ? <div className="loader-spinner"></div> : <><PlusCircle size={18} /> Publish Product</>}
                    </button>
                </div>

                <div className="ap-preview-section">
                    <div className="preview-card-sticky">
                        <div className="preview-label">Live Preview</div>
                        <div className="preview-img-container">
                            {previews.length > 0 ? <img src={previews[0]} alt="Preview" /> : <div className="preview-placeholder"><ImageIcon size={48} /></div>}
                        </div>
                        <div className="preview-details">
                            <span className="p-brand">{formData.brand || 'BRAND'}</span>
                            <h3 className="p-name">{formData.name || 'Product Title'}</h3>
                            <div className="p-pricing">
                                <span className="p-price">₹{formData.price || "0"}</span>
                                {formData.originalPrice && <span className="p-mrp">₹{formData.originalPrice}</span>}
                            </div>
                            <div className="p-variants">
                                {formData.colors.length > 0 && <p>Colors: {formData.colors.join(', ')}</p>}
                                {formData.sizes.length > 0 && <p>Sizes: {formData.sizes.join(', ')}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProduct;