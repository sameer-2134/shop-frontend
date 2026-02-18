import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPackage, FiClock, FiBox, FiArrowLeft, 
    FiDownload, FiMapPin, FiCreditCard, FiChevronRight, FiRefreshCw, FiActivity 
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 
import toast, { Toaster } from 'react-hot-toast';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const pollTimer = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Window Resize Monitor for Layout Fix
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchMyOrders = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${API_BASE_URL}/api/payment/my-orders`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            if (res.data.success) {
                const sorted = res.data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sorted);
                // Real-time update toast only if manually refreshed
                if (refreshing) toast.success("Synced Live Data");
            }
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [API_BASE_URL, refreshing]);

    // ✅ Real-time Polling: Har 5 seconds mein check karega
    useEffect(() => {
        fetchMyOrders();
        pollTimer.current = setInterval(() => fetchMyOrders(true), 5000); 
        return () => clearInterval(pollTimer.current);
    }, [fetchMyOrders]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMyOrders(true);
    };

    const getImageUrl = (img) => img?.startsWith('http') ? img : `${API_BASE_URL}${img}` || "https://placehold.co/100";

    return (
        <div className="orders-canvas">
            <Toaster position="top-right" />
            
            {/* Real-time Status Indicator */}
            <div className="live-status-bar">
                <FiActivity className="pulse-icon" /> <span>Real-time Sync Active</span>
                <button onClick={handleRefresh} className={refreshing ? 'spin' : ''}><FiRefreshCw /></button>
            </div>

            <div className="orders-main-layout">
                {/* Left Side: Order List (Always visible on Desktop, Conditional on Mobile) */}
                {(!selectedOrder || !isMobile) && (
                    <motion.div className="orders-sidebar-list" initial={{x: -20}} animate={{x: 0}}>
                        <div className="list-header">
                            <h2><FiPackage /> Orders ({orders.length})</h2>
                        </div>
                        <div className="list-scroll">
                            {orders.map(order => (
                                <div 
                                    key={order._id} 
                                    className={`order-mini-card ${selectedOrder?._id === order._id ? 'active' : ''}`}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div className="mini-info">
                                        <p className="order-id">#{order._id.slice(-6).toUpperCase()}</p>
                                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="mini-price">₹{order.amount}</div>
                                    <FiChevronRight />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Right Side: Order Details (Main View) */}
                {(selectedOrder || !isMobile) ? (
                    <motion.div className="order-details-view" initial={{opacity: 0}} animate={{opacity: 1}}>
                        {selectedOrder ? (
                            <div className="details-content">
                                {isMobile && (
                                    <button className="back-nav" onClick={() => setSelectedOrder(null)}>
                                        <FiArrowLeft /> Back to List
                                    </button>
                                )}
                                
                                <div className="detail-card-3d">
                                    <div className="status-header">
                                        <h3>Order Status: <span className="status-tag">{selectedOrder.status || 'Paid'}</span></h3>
                                        <p>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    </div>

                                    <div className="items-grid">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="item-row">
                                                <img src={getImageUrl(item.image)} alt="" />
                                                <div className="item-text">
                                                    <h4>{item.name}</h4>
                                                    <p>Qty: {item.qty} × ₹{item.price}</p>
                                                </div>
                                                <div className="item-subtotal">₹{item.qty * item.price}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="summary-section">
                                        <div className="info-box">
                                            <h4><FiMapPin /> Shipping</h4>
                                            <p>{selectedOrder.address || "Indore, MP"}</p>
                                        </div>
                                        <div className="info-box highlight">
                                            <div className="total-row"><span>Grand Total:</span> <span>₹{selectedOrder.amount}</span></div>
                                            <button className="invoice-btn"><FiDownload /> Invoice</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <FiBox size={60} />
                                <p>Select an order to see full details</p>
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </div>
        </div>
    );
};

export default Orders;