import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiUser, FiHeart, FiLogOut, FiChevronDown, FiMenu, FiX, FiPlus, FiMinus, FiSettings } from 'react-icons/fi';
import { useCart } from './CartContext';
import './Navbar.css';

const menuData = [
    { 
        title: "MEN", 
        cat: "men", 
        sub: ["T-Shirts", "Jeans", "Casual Shoes", "Shirts", "Watches", "Wallets"] 
    },
    { 
        title: "WOMEN", 
        cat: "women", 
        sub: ["Kurtas", "Dresses", "Handbags", "Earrings", "Jeans", "Flat Heels", "Makeup"] 
    },
    { 
        title: "KIDS", 
        cat: "kids", 
        sub: ["T-Shirts", "Toys", "Dresses", "Footwear"] 
    }
];

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const { cart, wishlist, clearCart } = useCart();

    // FIXED: Email based Admin Logic
    const isAdmin = 
        user?.role?.toLowerCase() === 'admin' || 
        user?.isAdmin === true || 
        user?.role === 'Admin' ||
        user?.email === 'sameermansuri8912@gmail.com';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        setToken(storedToken);
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== "") {
            navigate(`/gallery?search=${searchTerm.trim()}`);
            setIsMenuOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearCart();
        setToken(null);
        setUser(null);
        toast.success("Logged out successfully");
        navigate('/login');
    };

    return (
        <nav className={`main-nav ${isScrolled ? 'nav-scrolled' : ''}`}>
            <div className="nav-container">
                <div className="mobile-menu-btn" onClick={() => setIsMenuOpen(true)}>
                    <FiMenu />
                </div>

                <div className="logo-wrapper">
                    <Link to="/" className="nav-logo">ShopLane<span>.</span></Link>
                </div>

                <div className="desktop-nav-links">
                    {menuData.map((item) => (
                        <div key={item.title} className="nav-item mega-trigger">
                            {item.title} <FiChevronDown className="chevron-icon" />
                            <div className="mega-menu">
                                <div className="mega-column">
                                    <h4>Trending {item.title}</h4>
                                    {item.sub.map(s => <Link key={s} to={`/gallery?cat=${s}`}>{s}</Link>)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="nav-search-container desktop-search">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="search-input" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                <div className="nav-actions">
                    <Link to="/wishlist" className="nav-action-item">
                        <div className="icon-with-badge">
                            <FiHeart />
                            {wishlist?.length > 0 && <span className="red-badge">{wishlist.length}</span>}
                        </div>
                        <span className="hide-mobile">Wishlist</span>
                    </Link>
                    
                    <Link to="/cart" className="nav-action-item">
                        <div className="icon-with-badge">
                            <FiShoppingBag />
                            {cart?.length > 0 && <span className="red-badge">{cart.length}</span>}
                        </div>
                        <span className="hide-mobile">Bag</span>
                    </Link>

                    {token ? (
                        <div className="nav-action-item user-group-container" 
                             onMouseEnter={() => setIsProfileOpen(true)}
                             onMouseLeave={() => setIsProfileOpen(false)}>
                            <FiUser />
                            <span className="hide-mobile">Profile</span>
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="user-dropdown-premium"
                                    >
                                        <div className="dropdown-header">
                                            <p className="user-name">Hi, {user?.name}</p>
                                            <p className="user-email">{user?.email}</p>
                                        </div>
                                        
                                        {isAdmin && (
                                            /* FIXED: Link changed from /admin to /admin-dashboard */
                                            <Link to="/admin-dashboard" className="dropdown-item admin-highlight-item">
                                                <FiSettings /> <strong>Admin Panel</strong>
                                            </Link>
                                        )}
                                        
                                        <Link to="/profile" className="dropdown-item"><FiUser /> My Profile</Link>
                                        <Link to="/orders" className="dropdown-item"><FiShoppingBag /> My Orders</Link>
                                        <button onClick={handleLogout} className="dropdown-item logout-btn">
                                            <FiLogOut /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/login" className="nav-action-item">
                            <FiUser />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="mobile-overlay" />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="mobile-drawer">
                            <div className="drawer-header">
                                <h3 className="nav-logo">ShopLane<span>.</span></h3>
                                <FiX onClick={() => setIsMenuOpen(false)} />
                            </div>

                            <div className="mobile-search-area">
                                <div className="mobile-search-box">
                                    <FiSearch />
                                    <input 
                                        type="text" 
                                        placeholder="Search products..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleSearch}
                                    />
                                </div>
                            </div>

                            <div className="drawer-body">
                                {isAdmin && (
                                    /* FIXED: Link changed from /admin to /admin-dashboard */
                                    <Link to="/admin-dashboard" className="mobile-admin-special" onClick={() => setIsMenuOpen(false)}>
                                        <FiSettings /> ADMIN DASHBOARD
                                    </Link>
                                )}

                                {menuData.map((item) => (
                                    <div key={item.title} className="mobile-accordion-item">
                                        <div className="accordion-title" onClick={() => setActiveAccordion(activeAccordion === item.title ? null : item.title)}>
                                            {item.title} {activeAccordion === item.title ? <FiMinus /> : <FiPlus />}
                                        </div>
                                        <AnimatePresence>
                                            {activeAccordion === item.title && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: 'auto', opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                                                    className="accordion-content"
                                                >
                                                    {item.sub.map(s => <Link key={s} to={`/gallery?cat=${s}`} onClick={() => setIsMenuOpen(false)}>{s}</Link>)}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;