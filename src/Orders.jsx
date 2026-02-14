import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPackage, FiClock, FiCheckCircle, FiBox, 
    FiLoader, FiArrowLeft, FiDownload, FiMapPin, FiCreditCard, FiChevronRight 
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ✅ Dynamic API URL for production
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const FALLBACK_IMG = "https://placehold.co/400x400/1e1b4b/white?text=Product";

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const res = await axios.get(`${API_BASE_URL}/api/payment/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setOrders(res.data.orders);
                }
            } catch (err) {
                console.error("❌ Orders load error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyOrders();
    }, [API_BASE_URL]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return FALLBACK_IMG;
        return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
    };

    const handleProductClick = (e, item) => {
        e.stopPropagation();
        // Backend models ke according id check kar rahe hain
        const pId = item.productId?._id || item.productId || item._id || item.id; 
        
        if (pId) {
            navigate(`/product/${pId}`); 
        } else {
            console.warn("Product ID not found in item:", item);
        }
    };

    const downloadInvoice = (order) => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text("SHOPLANE INVOICE", 15, 20);
            doc.setFontSize(10);
            doc.text(`Order ID: ${order._id}`, 15, 30);
            doc.text(`Date: ${formatDate(order.createdAt)}`, 15, 35);

            const tableRows = order.items.map(item => [
                item.name, 
                item.qty, 
                `₹${item.price}`, 
                `₹${item.qty * item.price}`
            ]);

            doc.autoTable({
                startY: 45,
                head: [['Product', 'Qty', 'Price', 'Total']],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [30, 27, 75] }
            });

            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(12);
            doc.text(`Grand Total: ₹${order.amount}`, 150, finalY);

            doc.save(`Invoice_${order._id.substring(0, 6)}.pdf`);
        } catch (error) {
            console.error("PDF Error:", error);
        }
    };

    if (loading) return (
        <div className="premium-loader-container">
            <div className="loader-cube-3d"></div>
            <p>Accessing Your Vault...</p>
        </div>
    );

    return (
        <div className="orders-canvas">
            <div className="ambient-orb"></div>
            <AnimatePresence mode="wait">
                {!selectedOrder ? (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="view-wrapper">
                        <div className="header-glass">
                            <h1><FiPackage className="icon-glow" /> My Purchases</h1>
                        </div>
                        <div className="stack-container">
                            {orders.length === 0 ? (
                                <div className="no-orders-box">
                                    <FiBox size={50} style={{ opacity: 0.3, marginBottom: '20px' }} />
                                    <p className="no-orders">No treasures found yet.</p>
                                    <button className="back-btn-premium" onClick={() => navigate('/gallery')}>Start Shopping</button>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <motion.div 
                                        key={order._id}
                                        className="premium-order-card"
                                        onClick={() => setSelectedOrder(order)}
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="card-inner">
                                            <div className="img-group">
                                                <img src={getImageUrl(order.items[0]?.image)} alt="product" className="main-img-3d" />
                                                {order.items.length > 1 && <div className="plus-badge">+{order.items.length - 1}</div>}
                                            </div>
                                            <div className="card-info">
                                                <h3 className="hover-underline">{order.items[0]?.name || "Multiple Items"}</h3>
                                                <span><FiClock /> {formatDate(order.createdAt)}</span>
                                            </div>
                                            <div className="card-right">
                                                <div className="price-3d">₹{order.amount}</div>
                                                <div className={`status-pill-3d ${order.status?.toLowerCase() || 'paid'}`}>
                                                    {order.status || 'Paid'}
                                                </div>
                                                <FiChevronRight className="chevron-3d" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="details" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="view-wrapper">
                        <button className="back-btn-premium" onClick={() => setSelectedOrder(null)}>
                            <FiArrowLeft /> Return to Orders
                        </button>
                        <div className="bento-grid-3d">
                            <div className="bento-box main-items">
                                <h3>Ordered Items</h3>
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="item-detail-row clickable-row" onClick={(e) => handleProductClick(e, item)}>
                                        <div className="item-img-container-3d">
                                            <img src={getImageUrl(item.image)} alt={item.name} />
                                        </div>
                                        <div className="item-meta-3d">
                                            <h4 className="hover-link">{item.name}</h4>
                                            <p>Qty: {item.qty} | Price: ₹{item.price}</p>
                                        </div>
                                        <div className="item-total-3d">₹{item.price * item.qty}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="bento-sidebar">
                                <div className="bento-box info-card-3d">
                                    <h4><FiMapPin /> Delivery</h4>
                                    <p>{selectedOrder.address || "Dream Land Apartment, Indore"}</p>
                                </div>
                                <div className="bento-box info-card-3d">
                                    <h4><FiCreditCard /> Total: ₹{selectedOrder.amount}</h4>
                                    <button className="invoice-btn-3d" onClick={() => downloadInvoice(selectedOrder)}>
                                        <FiDownload /> Invoice PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;