import React, { useState } from 'react';
import BulkUpload from './BulkUpload'; 
import './Atelier.css';

const Atelier = () => {
    const [activeTab, setActiveTab] = useState('bulk');

    // Content render karne ke liye ek helper function
    const renderContent = () => {
        switch (activeTab) {
            case 'bulk':
                return <BulkUpload />;
            case 'orders':
                return (
                    <div className="tab-placeholder">
                        <h2>Order Management</h2>
                        <p>Incoming orders ki list yahan show hogi...</p>
                    </div>
                );
            case 'settings':
                return <div className="tab-placeholder"><h2>Settings</h2></div>;
            default:
                return <BulkUpload />;
        }
    };

    return (
        <div className="atelier-container">
            {/* Sidebar Section */}
            <aside className="atelier-sidebar">
                <div className="sidebar-header">
                    <h1>THE ATELIER</h1>
                    <small>Admin Control Panel</small>
                </div>

                <nav className="atelier-nav">
                    <button 
                        className={activeTab === 'bulk' ? 'active' : ''} 
                        onClick={() => setActiveTab('bulk')}
                    >
                        BULK LISTING
                    </button>
                    <button 
                        className={activeTab === 'orders' ? 'active' : ''} 
                        onClick={() => setActiveTab('orders')}
                    >
                        ORDERS
                    </button>
                    {/* Future use ke liye ek extra tab */}
                    <button 
                        className={activeTab === 'settings' ? 'active' : ''} 
                        onClick={() => setActiveTab('settings')}
                    >
                        SETTINGS
                    </button>
                </nav>

                <div className="sidebar-footer">
                   <button onClick={() => window.location.href = '/gallery'} className="exit-btn">
                       Exit Dashboard
                   </button>
                </div>
            </aside>

            {/* Main Content Section */}
            <main className="atelier-main">
                {renderContent()}
            </main>
        </div>
    );
};

export default Atelier;