import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Search, CheckCircle, Phone, User, MapPin, Truck, Check, Package, Mail, FileText, AlertCircle } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import './AdminOrders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending Labels');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const baseURL = import.meta.env.VITE_API_URL;

    const generateInvoicePDF = (order) => {
        if (!order?.address) {
            alert("System Note: Order details are incomplete for PDF generation.");
            return;
        }
        const doc = new jsPDF();
        const displayID = order.razorpayPaymentId ? order.razorpayPaymentId.substring(4) : "N/A";
        doc.setFontSize(22);
        doc.setTextColor(40, 116, 240); 
        doc.text("TAX INVOICE", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Order ID: OD${displayID}`, 14, 30);
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 35);
        doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 40);
        doc.setDrawColor(200);
        doc.line(14, 45, 196, 45); 
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Shipping Details:", 14, 55);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const addr = order.address;
        doc.text(`${addr.fullName || 'Valued Customer'}`, 14, 62);
        const streetInfo = `${addr.address || addr.street || ''} ${addr.locality || ''}`;
        doc.text(streetInfo.trim() || 'N/A', 14, 67);
        doc.text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, 14, 72);
        doc.text(`Phone: +91 ${addr.phone || 'N/A'}`, 14, 77);
        doc.text(`Email: ${addr.email || 'N/A'}`, 14, 82);
        const tableColumn = ["Product Description", "Qty", "Unit Price", "Net Amount"];
        const tableRows = (order.items || []).map(item => [
            item.name || "Product",
            item.qty || 0,
            `INR ${item.price?.toLocaleString('en-IN') || 0}`,
            `INR ${(item.price * item.qty)?.toLocaleString('en-IN') || 0}`
        ]);
        autoTable(doc, {
            startY: 90,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [40, 116, 240], fontSize: 10 },
            styles: { fontSize: 9, cellPadding: 4 }
        });
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total: INR ${order.amount?.toLocaleString('en-IN')}`, 140, finalY);
        doc.text("This is a computer generated invoice.", 14, finalY + 20);
        doc.save(`Invoice_OD${displayID}.pdf`);
    };

    const fetchOrders = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/payment/all-orders`, { withCredentials: true });
            setOrders(res.data);
        } catch (err) {
            console.error("API Fetch Error:", err);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [baseURL]);

    const updateOrderStatus = async (orderId, nextStatus) => {
        try {
            if(!orderId) return;
            const statusToPost = nextStatus.toLowerCase();
            await axios.put(`${baseURL}/api/payment/update-status/${orderId}`, 
                { status: statusToPost }, 
                { withCredentials: true }
            );
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: statusToPost } : o));
            setSelectedOrder(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Internal Server Error";
            alert(`Process Failed: ${errorMsg}`);
        }
    };

    useEffect(() => {
        fetchOrders(true);
        const interval = setInterval(() => fetchOrders(), 60000); 
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const getFilteredOrders = () => {
        return orders.filter(o => {
            const s = (o.status || 'paid').toLowerCase();
            const matchesSearch = 
                o.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                o.address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
            switch(activeTab) {
                case 'Pending Labels': return s === 'paid';
                case 'RTD': return s === 'ready';
                case 'Pending Handover': return s === 'packed';
                case 'In Transit': return s === 'shipped';
                case 'Completed': return s === 'delivered';
                default: return false;
            }
        });
    };

    const currentOrders = getFilteredOrders();

    if (loading) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <p>Syncing Warehouse Data...</p>
        </div>
    );

    return (
        <div className="seller-dashboard">
            <div className="stats-header no-print">
                {['Pending Labels', 'RTD', 'Pending Handover', 'In Transit', 'Completed'].map(tab => {
                    const count = orders.filter(o => {
                        const s = (o.status || 'paid').toLowerCase();
                        if (tab === 'Pending Labels') return s === 'paid';
                        if (tab === 'RTD') return s === 'ready';
                        if (tab === 'Pending Handover') return s === 'packed';
                        if (tab === 'In Transit') return s === 'shipped';
                        if (tab === 'Completed') return s === 'delivered';
                        return false;
                    }).length;
                    return (
                        <div key={tab} 
                             className={`stat-card ${activeTab === tab ? 'active' : ''}`} 
                             onClick={() => { setActiveTab(tab); setSelectedOrder(null); }}>
                            <span className="stat-count">{count}</span>
                            <span className="stat-label">{tab}</span>
                        </div>
                    );
                })}
            </div>

            <div className="control-bar no-print">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Order ID or Customer..." 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            <div className="main-layout">
                <div className="order-sidebar no-print">
                    <div className="sidebar-header">{activeTab} ({currentOrders.length})</div>
                    <div className="order-list-container">
                        {currentOrders.length > 0 ? currentOrders.map(order => (
                            <div key={order._id} 
                                 className={`order-item-link ${selectedOrder?._id === order._id ? 'active' : ''}`} 
                                 onClick={() => setSelectedOrder(order)}>
                                <div className="order-info-mini">
                                    <span className="oid">OD{order.razorpayPaymentId?.substring(4, 15)}</span>
                                    <span className="otime">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="order-cust-mini">{order.address?.fullName}</div>
                            </div>
                        )) : (
                            <div className="empty-state">No orders here.</div>
                        )}
                    </div>
                </div>

                <div className="order-detail-view">
                    {selectedOrder ? (
                        <div className="fade-in">
                            <div className="detail-header">
                                <div className="header-title">
                                    <h2>Order Summary</h2>
                                    <span className="status-pill">{activeTab}</span>
                                </div>
                                <div className="header-actions no-print">
                                    <button className="btn-invoice-alt" onClick={() => generateInvoicePDF(selectedOrder)}>
                                        <FileText size={16}/> Invoice
                                    </button>
                                    
                                    {activeTab === 'Pending Labels' && (
                                        <button className="btn-action accept" onClick={() => updateOrderStatus(selectedOrder._id, 'ready')}>
                                            <Check size={16}/> Accept Order
                                        </button>
                                    )}
                                    {activeTab === 'RTD' && (
                                        <button className="btn-action pack" style={{backgroundColor: '#ff9f00', color: 'white'}} onClick={() => updateOrderStatus(selectedOrder._id, 'packed')}>
                                            <Package size={16}/> Mark Packed
                                        </button>
                                    )}
                                    {activeTab === 'Pending Handover' && (
                                        <button className="btn-action ship" style={{backgroundColor: '#2874f0', color: 'white'}} onClick={() => updateOrderStatus(selectedOrder._id, 'shipped')}>
                                            <Truck size={16}/> Handover to Courier
                                        </button>
                                    )}
                                    {activeTab === 'In Transit' && (
                                        <button className="btn-action complete" style={{backgroundColor: '#388e3c', color: 'white'}} onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')}>
                                            <CheckCircle size={16}/> Mark Delivered
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="info-grid">
                                <section className="info-card">
                                    <label><User size={14}/> Customer</label>
                                    <p className="primary-text">{selectedOrder.address?.fullName}</p>
                                    <p className="secondary-text"><Mail size={12}/> {selectedOrder.address?.email}</p>
                                    <p className="secondary-text"><Phone size={12}/> {selectedOrder.address?.phone}</p>
                                </section>
                                <section className="info-card">
                                    <label><MapPin size={14}/> Address</label>
                                    <p className="primary-text">{selectedOrder.address?.address || selectedOrder.address?.street}</p>
                                    <p className="secondary-text">{selectedOrder.address?.locality}, {selectedOrder.address?.city}</p>
                                    <p className="zip-code">ZIP: {selectedOrder.address?.pincode}</p>
                                </section>
                                <section className="info-card">
                                    <label><Package size={14}/> Payment</label>
                                    <div className="txn-id">ID: {selectedOrder.razorpayPaymentId}</div>
                                    <p className="amount-total">Total: <span>₹{selectedOrder.amount}</span></p>
                                    <span className="pay-badge">PREPAID</span>
                                </section>
                            </div>

                            <div className="items-table-container">
                                <h3>Order Items ({selectedOrder.items?.length || 0})</h3>
                                <div className="items-list">
                                    {(selectedOrder.items || []).map((item, i) => (
                                        <div key={i} className="item-row">
                                            <div className="item-img">📦</div>
                                            <div className="item-details">
                                                <p className="item-name">{item.name}</p>
                                                <p className="item-qty">Qty: {item.qty}</p>
                                            </div>
                                            <div className="item-price">₹{item.price * item.qty}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection-ui">
                            <AlertCircle size={40} />
                            <p>Select an order to manage.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;