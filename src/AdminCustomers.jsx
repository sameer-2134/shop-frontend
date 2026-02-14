import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserPlus, Search, Clock, Calendar, UserCheck, X, Mail, ShieldCheck } from 'lucide-react';
import './AdminCustomers.css';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    // ✅ Dynamic API URL defined here
    const baseURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // ✅ Localhost removed, using baseURL
                const res = await axios.get(`${baseURL}/api/admin/all-customers`, { withCredentials: true });
                setCustomers(res.data);
            } catch (err) {
                console.error("Error fetching customers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [baseURL]);

    const now = new Date();
    const todayUsers = customers.filter(c => new Date(c.createdAt).toDateString() === now.toDateString());
    const weekUsers = customers.filter(c => (now - new Date(c.createdAt)) / (1000 * 60 * 60 * 24) <= 7);
    const oldUsers = customers.filter(c => (now - new Date(c.createdAt)) / (1000 * 60 * 60 * 24) > 7);

    let filteredData = customers;
    if (activeFilter === 'today') filteredData = todayUsers;
    else if (activeFilter === 'week') filteredData = weekUsers;
    else if (activeFilter === 'old') filteredData = oldUsers;

    const finalDisplayData = filteredData.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="admin-loader-container">
            <div className="premium-loader"></div>
            <p>Fetching Your Loyal Customers...</p>
        </div>
    );

    return (
        <div className="customers-page">
            <div className="cust-stats-grid">
                <div className={`cust-stat-card ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                    <div className="stat-icon-wrapper blue"><Users size={24} /></div>
                    <div className="stat-info">
                        <h3>{customers.length}</h3>
                        <p>Total Customers</p>
                    </div>
                </div>
                <div className={`cust-stat-card ${activeFilter === 'today' ? 'active' : ''}`} onClick={() => setActiveFilter('today')}>
                    <div className="stat-icon-wrapper purple"><Calendar size={24} /></div>
                    <div className="stat-info">
                        <h3>{todayUsers.length}</h3>
                        <p>Joined Today</p>
                    </div>
                </div>
                <div className={`cust-stat-card ${activeFilter === 'week' ? 'active' : ''}`} onClick={() => setActiveFilter('week')}>
                    <div className="stat-icon-wrapper green"><UserPlus size={24} /></div>
                    <div className="stat-info">
                        <h3>{weekUsers.length}</h3>
                        <p>New This Week</p>
                    </div>
                </div>
                <div className={`cust-stat-card ${activeFilter === 'old' ? 'active' : ''}`} onClick={() => setActiveFilter('old')}>
                    <div className="stat-icon-wrapper gold"><ShieldCheck size={24} /></div>
                    <div className="stat-info">
                        <h3>{oldUsers.length}</h3>
                        <p>Old Members</p>
                    </div>
                </div>
            </div>

            <div className="cust-controls">
                <div className="cust-search-box">
                    <Search size={20} />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeFilter} customers...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeFilter !== 'all' && (
                    <button className="cust-clear-btn" onClick={() => setActiveFilter('all')}>
                        <X size={16} /> Reset
                    </button>
                )}
            </div>

            <div className="cust-table-wrapper">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Contact Info</th>
                            <th>Registered On</th>
                            <th>Tier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finalDisplayData.map(user => {
                            const isToday = new Date(user.createdAt).toDateString() === now.toDateString();
                            const isWeek = (now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24) <= 7;

                            return (
                                <tr key={user._id}>
                                    <td>
                                        <div className="cust-name-cell">
                                            <div className="cust-avatar">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="name-details">
                                                <strong>{user.name}</strong>
                                                <span>ID: {user._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="email-cell">
                                            <Mail size={14} /> {user.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            <Clock size={14} /> 
                                            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`tier-badge ${isToday ? 'new' : isWeek ? 'recent' : 'loyal'}`}>
                                            {isToday ? 'New User' : isWeek ? 'Recent' : 'Loyal'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {finalDisplayData.length === 0 && (
                    <div className="cust-empty">
                        <Users size={48} />
                        <p>No customers found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCustomers;