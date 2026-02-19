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
        sections: [
            { heading: "Bottomwear", items: ["Jeans", "Casual Trousers", "Formal Trousers", "Shorts", "Track Pants"] },
            { heading: "Footwear", items: ["Casual Shoes", "Sports Shoes", "Formal Shoes", "Sneakers", "Sandals", "Socks"] },
            { heading: "Inner & Sleepwear", items: ["Briefs & Trunks", "Boxers", "Vests", "Sleepwear", "Thermals"] },
            { heading: "Accessories", items: ["Watches", "Wallets", "Belts", "Smart Wearables", "Sunglasses"] },
            { heading: "Grooming", items: ["Perfumes", "Trimmers", "Deodorants", "Caps & Hats"] }
        ]
    },
    { 
        title: "WOMEN", 
        cat: "women", 
        sections: [
            { heading: "Indian & Fusion", items: ["Kurtas & Suits", "Sarees", "Ethnic Wear", "Lehenga Cholis", "Dupattas"] },
            { heading: "Western Wear", items: ["Dresses", "Tops", "Jeans", "Trousers", "Co-ords", "Jumpsuits", "Shrugs"] },
            { heading: "Beauty & Personal Care", items: ["Makeup", "Skincare", "Premium Beauty", "Lipsticks", "Fragrances"] },
            { heading: "Lingerie & Sleep", items: ["Bra", "Briefs", "Shapewear", "Sleepwear", "Swimwear"] },
            { heading: "Footwear & More", items: ["Flats", "Heels", "Boots", "Casual Shoes", "Watches", "Sunglasses"] }
        ]
    },
    { 
        title: "KIDS", 
        cat: "kids", 
        sections: [
            { heading: "Clothing", items: ["T-Shirts", "Shirts", "Jeans", "Dresses", "Track Pants"] },
            { heading: "Footwear & Toys", items: ["Casual Shoes", "Sports Shoes", "Toys", "Watches"] }
        ]
    },
    {
        title: "HOME & LIVING",
        cat: "home",
        sections: [
            { heading: "Bed Linen", items: ["Bedsheets", "Bedding Sets", "Blankets", "Pillows", "Mattress Protectors"] },
            { heading: "Bath & Flooring", items: ["Bath Towels", "Bath Rugs", "Carpets", "Floor Mats", "Door Mats"] },
            { heading: "Lamps & Lighting", items: ["Floor Lamps", "Table Lamps", "Wall Lamps", "String Lights"] },
            { heading: "Home Décor", items: ["Plants", "Candles", "Clocks", "Mirrors", "Wall Décor", "Vases"] }
        ]
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

    const isAdmin = 
        user?.role?.toLowerCase() === 'admin' || 
        user?.isAdmin === true || 
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
        if (window.confirm("Logout karein?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            clearCart();
            setToken(null);
            setUser(null);
            toast.success("Logged out successfully");
            navigate('/login');
        }
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

                {/* DESKTOP NAV - Fixing the hover gap here */}
                <div className="desktop-nav-links">
                    {menuData.map((menu) => (
                        <div key={menu.title} className="nav-item mega-trigger">
                            <span className="nav-link-text">
                                {menu.title} <FiChevronDown className="chevron-icon" />
                            </span>
                            
                            {/* Mega menu starts here */}
                            <div className="mega-menu">
                                <div className="mega-grid">
                                    {menu.sections.map((section, idx) => (
                                        <div key={idx} className="mega-column">
                                            <h4>{section.heading}</h4>
                                            {section.items.map(item => (
                                                <Link key={item} to={`/gallery?cat=${item}`}>{item}</Link>
                                            ))}
                                        </div>
                                    ))}
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
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="user-dropdown-premium">
                                        <div className="dropdown-header">
                                            <p className="user-name">Hi, {user?.name}</p>
                                        </div>
                                        {isAdmin && <Link to="/admin-dashboard" className="dropdown-item"><FiSettings /> Admin Panel</Link>}
                                        <Link to="/orders" className="dropdown-item"><FiShoppingBag /> My Orders</Link>
                                        <button onClick={handleLogout} className="dropdown-item logout-btn"><FiLogOut /> Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/login" className="nav-action-item"><FiUser /> <span>Login</span></Link>
                    )}
                </div>
            </div>

            {/* MOBILE DRAWER - As per your Image 2 */}
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
                                    <Link to="/admin-dashboard" className="mobile-admin-special" onClick={() => setIsMenuOpen(false)}>
                                        <FiSettings /> ADMIN DASHBOARD
                                    </Link>
                                )}

                                {menuData.map((menu) => (
                                    <div key={menu.title} className="mobile-accordion-item">
                                        <div className="accordion-title" onClick={() => setActiveAccordion(activeAccordion === menu.title ? null : menu.title)}>
                                            {menu.title} {activeAccordion === menu.title ? <FiMinus /> : <FiPlus />}
                                        </div>
                                        <AnimatePresence>
                                            {activeAccordion === menu.title && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="accordion-content">
                                                    {menu.sections.map((sec, sIdx) => (
                                                        <div key={sIdx} className="mobile-drawer-section">
                                                            <div className="mobile-section-heading">{sec.heading}</div>
                                                            <div className="mobile-section-links">
                                                                {sec.items.map(sub => (
                                                                    <Link key={sub} to={`/gallery?cat=${sub}`} onClick={() => setIsMenuOpen(false)}>{sub}</Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
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