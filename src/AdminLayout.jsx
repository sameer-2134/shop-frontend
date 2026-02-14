import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  FiPieChart, FiBox, FiShoppingBag, FiUsers, 
  FiArrowLeft, FiPlusCircle, FiCreditCard, FiTruck 
} from 'react-icons/fi';
import './AdminDashboard.css';

// Socket connection (Backend URL setup)
const socket = io('http://localhost:5000');

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Stats state: Jo backend se live update hogi
    const [stats, setStats] = useState({
        bankBalance: 0,
        expectedCash: 0,
    });
    
    // Pulse animation logic for new orders
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        // 1. Initial Data Fetch (Optional: page load par ek baar API call kar sakte ho)
        
        // 2. Real-time Listener for Socket Events
        socket.on('updateLedger', (data) => {
            console.log("💰 Real-time Ledger Update:", data);
            
            setStats({
                bankBalance: data.bankBalance,
                expectedCash: data.expectedCash
            });

            // Pulse on karo jab naya data aaye
            setIsPulsing(true);
            
            // 5 second baad pulse band karein
            setTimeout(() => setIsPulsing(false), 5000);
            
            // Pro Tip: Agar public folder mein 'cash.mp3' hai toh usey yahan play karo
            // new Audio('/cash.mp3').play().catch(e => console.log("Audio play error"));
        });

        return () => {
            socket.off('updateLedger');
        };
    }, []);

    const menuItems = [
        { path: '/admin-dashboard/stats', icon: <FiPieChart />, label: 'Overview' },
        { path: '/admin-dashboard/add-product', icon: <FiPlusCircle />, label: 'Add Product' },
        { path: '/admin-dashboard/products', icon: <FiBox />, label: 'Inventory' },
        { path: '/admin-dashboard/orders', icon: <FiShoppingBag />, label: 'Orders' },
        { path: '/admin-dashboard/users', icon: <FiUsers />, label: 'Customers' },
    ];

    const currentTitle = menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel';

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Owner Panel</h3>
                    <p>ShopLane Premium</p>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={() => navigate('/')} className="back-btn">
                        <FiArrowLeft /> <span>Back to Shop</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main-content">
                <header className="admin-top-bar">
                    <div className="top-bar-left">
                        <h2>{currentTitle}</h2>
                    </div>

                    <div className="top-bar-right">
                        {/* BANK REVENUE: Jo status 'Paid' hai */}
                        <div className="ledger-badge bank">
                            <FiCreditCard />
                            <div className="ledger-info">
                                <small>BANK REVENUE</small>
                                <span>₹{stats.bankBalance.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* PENDING/COD: Jo abhi Paid nahi hain */}
                        <div className={`ledger-badge cod ${isPulsing ? 'live-alert' : ''}`}>
                            <FiTruck />
                            <div className="ledger-info">
                                <small>PENDING/COD</small>
                                <span>₹{stats.expectedCash.toLocaleString('en-IN')}</span>
                            </div>
                            {/* Pulse animation dot */}
                            {isPulsing && <div className="status-dot pulse"></div>}
                        </div>
                        
                        <div className="admin-profile-circle">S</div>
                    </div>
                </header>
                
                <div className="admin-page-container">
                    {/* Yahan stats pass kiye hain taaki Dashboard cards bhi update ho sakein */}
                    <Outlet context={{ stats }} /> 
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;