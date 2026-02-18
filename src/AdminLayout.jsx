import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  FiPieChart, FiBox, FiShoppingBag, FiUsers, 
  FiArrowLeft, FiPlusCircle, FiCreditCard, FiTruck 
} from 'react-icons/fi';
import './AdminDashboard.css';

const baseURL = import.meta.env.VITE_API_URL;
const socket = io(baseURL);

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [stats, setStats] = useState({
        bankBalance: 0,
        expectedCash: 0,
    });
    
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            console.log("✅ Connected to Real-time Server");
        });

        socket.on('updateLedger', (data) => {
            setStats({
                bankBalance: data.bankBalance || 0,
                expectedCash: data.expectedCash || 0
            });
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 5000);
        });

        return () => {
            socket.off('updateLedger');
            socket.off('connect');
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

            <nav className="mobile-bottom-nav">
                {menuItems.map((item) => (
                    <Link key={item.path} to={item.path} className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}>
                        {item.icon}
                        <small>{item.label}</small>
                    </Link>
                ))}
            </nav>

            <main className="admin-main-content">
                <header className="admin-top-bar">
                    <div className="top-bar-left">
                        <h2>{currentTitle}</h2>
                    </div>
                    <div className="top-bar-right">
                        <div className="ledger-badge bank">
                            <FiCreditCard />
                            <div className="ledger-info">
                                <small>BANK REVENUE</small>
                                <span>₹{stats.bankBalance.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <div className={`ledger-badge cod ${isPulsing ? 'live-alert' : ''}`}>
                            <FiTruck />
                            <div className="ledger-info">
                                <small>PENDING/COD</small>
                                <span>₹{stats.expectedCash.toLocaleString('en-IN')}</span>
                            </div>
                            {isPulsing && <div className="status-dot pulse"></div>}
                        </div>
                        <div className="admin-profile-circle">S</div>
                    </div>
                </header>
                
                {/* Ab yahan sirf wahi dikhega jo aapke stats/overview page mein hai */}
                <div className="admin-page-container">
                    <Outlet context={{ stats }} /> 
                </div>
                
                <footer className="sync-status">
                    <div className="sync-indicator"></div>
                    <span>Real-time Sync Active</span>
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;