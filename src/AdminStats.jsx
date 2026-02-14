import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
    FiTrendingUp, FiShoppingBag, FiCreditCard, FiClock, 
    FiPlus, FiFileText, FiPercent, FiActivity 
} from 'react-icons/fi';
import './AdminDashboard.css'; 

const AdminStats = () => {
    // Layout se live stats nikaal lo (Socket ka kamaal)
    const { stats } = useOutletContext();

    // Live Cards Data
    const liveCards = [
        {
            id: 1,
            label: "Total Revenue",
            value: `₹${(stats.bankBalance + stats.expectedCash).toLocaleString('en-IN')}`,
            icon: <FiTrendingUp />,
            color: "#10b981", // Emerald
            growth: "+Live",
            desc: "Combined Bank + COD"
        },
        {
            id: 2,
            label: "Bank Balance",
            value: `₹${stats.bankBalance.toLocaleString('en-IN')}`,
            icon: <FiCreditCard />,
            color: "#3b82f6", // Blue
            growth: "Razorpay",
            desc: "Direct Payouts"
        },
        {
            id: 3,
            label: "COD Pending",
            value: `₹${stats.expectedCash.toLocaleString('en-IN')}`,
            icon: <FiClock />,
            color: "#f59e0b", // Amber
            growth: "Expected",
            desc: "From delivery"
        },
        {
            id: 4,
            label: "Live Status",
            value: "Active",
            icon: <FiActivity />,
            color: "#8b5cf6", // Purple
            growth: "Online",
            desc: "Socket Connected"
        }
    ];

    return (
        <div className="stats-wrapper">
            {/* 1. Live Stats Cards Grid */}
            <div className="stats-grid">
                {liveCards.map((item) => (
                    <div key={item.id} className="stat-card" style={{ "--card-color": item.color }}>
                        <div className="stat-card-inner">
                            <div className="stat-icon-box" style={{ background: `${item.color}15`, color: item.color }}>
                                {item.icon}
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">{item.label}</p>
                                <h3 className="stat-value">{item.value}</h3>
                                <div className="stat-badge">
                                    <span className="growth-text" style={{ color: item.color }}>{item.growth}</span>
                                    <span className="time-text">{item.desc}</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-glow"></div>
                    </div>
                ))}
            </div>

            {/* 2. Dashboard Bottom Row (Transactions + Actions) */}
            <div className="dashboard-row">
                
                {/* Recent Transactions Table */}
                <div className="data-card recent-transactions">
                    <div className="card-header">
                        <h3>Recent Transactions</h3>
                        <button className="view-all-btn">View All</button>
                    </div>
                    <div className="table-responsive">
                        <table className="mini-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span className="order-id">#ORD-7721</span></td>
                                    <td><strong>Rahul Sharma</strong></td>
                                    <td><span className="status-pill success">Paid</span></td>
                                    <td className="amount">₹2,499</td>
                                </tr>
                                <tr>
                                    <td><span className="order-id">#ORD-7722</span></td>
                                    <td><strong>Priya Patel</strong></td>
                                    <td><span className="status-pill warning">Pending</span></td>
                                    <td className="amount">₹1,200</td>
                                </tr>
                                <tr>
                                    <td><span className="order-id">#ORD-7723</span></td>
                                    <td><strong>Sameer Mansuri</strong></td>
                                    <td><span className="status-pill success">Paid</span></td>
                                    <td className="amount">₹4,500</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Owner Action Center */}
                <div className="data-card action-center">
                    <div className="card-header">
                        <h3>Owner Controls 👑</h3>
                    </div>
                    <div className="action-grid">
                        <button className="premium-action-btn primary">
                            <FiPlus /> Add Product
                        </button>
                        <button className="premium-action-btn">
                            <FiFileText /> Sales Report
                        </button>
                        <button className="premium-action-btn">
                            <FiPercent /> Coupons
                        </button>
                        <button className="premium-action-btn danger">
                            <FiActivity /> System Logs
                        </button>
                    </div>
                    <div className="socket-status-tag">
                        <span className="dot pulse"></span> Real-time Sync Active
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminStats;