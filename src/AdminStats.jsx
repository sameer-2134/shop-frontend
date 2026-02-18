import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
    FiTrendingUp, FiCreditCard, FiClock, 
    FiPlus, FiFileText, FiPercent, FiActivity, FiArrowRight 
} from 'react-icons/fi';
import './AdminStats.css'; 

const AdminStats = () => {
    // Layout se live stats nikaal lo (Socket logic with fallbacks)
    const { stats = { bankBalance: 0, expectedCash: 0 } } = useOutletContext() || {};

    const liveCards = [
        {
            id: 1,
            label: "Total Revenue",
            value: `₹${((stats?.bankBalance || 0) + (stats?.expectedCash || 0)).toLocaleString('en-IN')}`,
            icon: <FiTrendingUp />,
            color: "#10b981",
            desc: "Net Business Value"
        },
        {
            id: 2,
            label: "Bank Balance",
            value: `₹${(stats?.bankBalance || 0).toLocaleString('en-IN')}`,
            icon: <FiCreditCard />,
            color: "#3b82f6",
            desc: "Settled Payouts"
        },
        {
            id: 3,
            label: "COD Pending",
            value: `₹${(stats?.expectedCash || 0).toLocaleString('en-IN')}`,
            icon: <FiClock />,
            color: "#f59e0b",
            desc: "Expected from Delivery"
        },
        {
            id: 4,
            label: "System Status",
            value: "Active",
            icon: <FiActivity />,
            color: "#8b5cf6",
            desc: "Socket Stable"
        }
    ];

    return (
        <div className="admin-main-content">
            {/* Header Section */}
            <header className="stats-header">
                <div>
                    <h1>Live Business Insights</h1>
                    <p className="subtitle">Real-time data from your store</p>
                </div>
                <div className="live-sync-indicator">
                    <span className="pulse-dot"></span>
                    Live Sync Active
                </div>
            </header>

            {/* 1. High-Performance Stats Grid */}
            <div className="stats-grid-v2">
                {liveCards.map((item) => (
                    <div key={item.id} className="premium-stat-card" style={{ "--accent": item.color }}>
                        <div className="card-glass-effect"></div>
                        <div className="card-top">
                            <div className="icon-wrapper">
                                {item.icon}
                            </div>
                            <span className="live-tag">LIVE</span>
                        </div>
                        <div className="card-info">
                            <p className="card-label">{item.label}</p>
                            <h2 className="card-value">{item.value}</h2>
                            <p className="card-desc">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Responsive Layout Row */}
            <div className="dashboard-flex-row">
                
                {/* Recent Transactions Table */}
                <div className="content-panel table-panel">
                    <div className="panel-header">
                        <h3>Recent Transactions</h3>
                        <button className="view-all-link">View All <FiArrowRight /></button>
                    </div>
                    <div className="table-wrapper">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Example row with real-look logic */}
                                <tr>
                                    <td className="mono">#ORD-7721</td>
                                    <td>Rahul Sharma</td>
                                    <td><span className="status-pill success">Paid</span></td>
                                    <td className="amount-cell">₹2,499</td>
                                </tr>
                                <tr>
                                    <td className="mono">#ORD-7722</td>
                                    <td>Priya Patel</td>
                                    <td><span className="status-pill warning">Pending</span></td>
                                    <td className="amount-cell">₹1,200</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Owner Control Center */}
                <div className="content-panel controls-panel">
                    <div className="panel-header">
                        <h3>Owner Controls 👑</h3>
                    </div>
                    <div className="action-button-grid">
                        <button className="action-tile">
                            <FiPlus className="tile-icon" />
                            <span>Add Product</span>
                        </button>
                        <button className="action-tile">
                            <FiFileText className="tile-icon" />
                            <span>Sales Report</span>
                        </button>
                        <button className="action-tile">
                            <FiPercent className="tile-icon" />
                            <span>Coupons</span>
                        </button>
                        <button className="action-tile danger">
                            <FiActivity className="tile-icon" />
                            <span>System Logs</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminStats;