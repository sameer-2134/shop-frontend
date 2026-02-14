import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { motion } from 'framer-motion'; 
import { FiSearch, FiShoppingBag, FiUser, FiHeart, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi'; 
import { useCart } from './CartContext'; 
import './Navbar.css'; 

const Navbar = () => { 
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const { cart, wishlist, clearCart } = useCart();

    // Scroll Effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync state when location changes (Important for Login/Logout)
    useEffect(() => {
        setToken(localStorage.getItem('token'));
        setUser(JSON.parse(localStorage.getItem('user')));
        
        // Sync Search Bar with URL
        const params = new URLSearchParams(location.search);
        const query = params.get('search');
        if (query) setSearchTerm(query);
        else if (location.pathname !== '/gallery') setSearchTerm("");
    }, [location]);

    const isAdmin = user && user.email === 'sameermansuri8912@gmail.com';

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            navigate(`/gallery?search=${encodeURIComponent(value.trim())}`);
        } else {
            navigate('/gallery');
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout? 👋")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            clearCart(); 
            setToken(null); 
            setUser(null);
            toast.success("Logged out successfully!");
            navigate('/login');
        }
    };

    return (
        <nav className={`main-nav ${isScrolled ? 'nav-scrolled' : ''}`}>
            <div className="nav-container">
                {/* LOGO */}
                <motion.div whileHover={{ scale: 1.1, rotateY: 15 }}>
                    <Link to="/" className="nav-logo">ShopLane<span>.</span></Link>
                </motion.div>

                {/* MAIN LINKS - ALL CATEGORIES PRESERVED */}
                <div className="nav-links">
                    
                    {/* MEN SECTION */}
                    <div className="nav-item mega-trigger">
                        MEN <FiChevronDown className="chevron-icon" />
                        <div className="mega-menu">
                            <div className="mega-column">
                                <h4>Topwear</h4>
                                <Link to="/gallery?cat=T-Shirts">T-Shirts</Link>
                                <Link to="/gallery?cat=Casual Shirts">Casual Shirts</Link>
                                <Link to="/gallery?cat=Formal Shirts">Formal Shirts</Link>
                                <Link to="/gallery?cat=Sweatshirts">Sweatshirts</Link>
                                <Link to="/gallery?cat=Sweaters">Sweaters</Link>
                                <Link to="/gallery?cat=Jackets">Jackets</Link>
                                <Link to="/gallery?cat=Blazers">Blazers & Coats</Link>
                                <Link to="/gallery?cat=Suits">Suits</Link>
                                <Link to="/gallery?cat=Rain Jackets">Rain Jackets</Link>
                                <h4 className="sub-h">Indian & Festive</h4>
                                <Link to="/gallery?cat=Kurtas">Kurtas & Kurta Sets</Link>
                                <Link to="/gallery?cat=Sherwanis">Sherwanis</Link>
                                <Link to="/gallery?cat=Nehru Jackets">Nehru Jackets</Link>
                                <Link to="/gallery?cat=Dhotis">Dhotis</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Bottomwear</h4>
                                <Link to="/gallery?cat=Jeans">Jeans</Link>
                                <Link to="/gallery?cat=Casual Trousers">Casual Trousers</Link>
                                <Link to="/gallery?cat=Formal Trousers">Formal Trousers</Link>
                                <Link to="/gallery?cat=Shorts">Shorts</Link>
                                <Link to="/gallery?cat=Joggers">Track Pants & Joggers</Link>
                                <h4 className="sub-h">Innerwear & Sleep</h4>
                                <Link to="/gallery?cat=Briefs">Briefs & Trunks</Link>
                                <Link to="/gallery?cat=Boxers">Boxers</Link>
                                <Link to="/gallery?cat=Vests">Vests</Link>
                                <Link to="/gallery?cat=Sleepwear">Sleepwear & Loungewear</Link>
                                <Link to="/gallery?cat=Thermals">Thermals</Link>
                                <Link to="/gallery?cat=Plus Size" className="highlight">Plus Size</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Footwear</h4>
                                <Link to="/gallery?cat=Casual Shoes">Casual Shoes</Link>
                                <Link to="/gallery?cat=Sports Shoes">Sports Shoes</Link>
                                <Link to="/gallery?cat=Formal Shoes">Formal Shoes</Link>
                                <Link to="/gallery?cat=Sneakers">Sneakers</Link>
                                <Link to="/gallery?cat=Sandals">Sandals & Floaters</Link>
                                <Link to="/gallery?cat=Flip Flops">Flip Flops</Link>
                                <Link to="/gallery?cat=Socks">Socks</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Accessories & Gadgets</h4>
                                <Link to="/gallery?cat=Sunglasses">Sunglasses & Frames</Link>
                                <Link to="/gallery?cat=Watches">Watches</Link>
                                <Link to="/gallery?cat=Smart Wearables">Smart Wearables</Link>
                                <Link to="/gallery?cat=Wallets">Wallets</Link>
                                <Link to="/gallery?cat=Belts">Belts</Link>
                                <Link to="/gallery?cat=Perfumes">Perfumes</Link>
                                <Link to="/gallery?cat=Trimmers">Trimmers</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Bags & More</h4>
                                <Link to="/gallery?cat=Backpacks">Bags & Backpacks</Link>
                                <Link to="/gallery?cat=Luggages">Luggages & Trolleys</Link>
                                <Link to="/gallery?cat=Helmets">Helmets</Link>
                                <Link to="/gallery?cat=Caps">Caps & Hats</Link>
                                <Link to="/gallery?cat=Ties">Ties & Cufflinks</Link>
                            </div>
                        </div>
                    </div>

                    {/* WOMEN SECTION */}
                    <div className="nav-item mega-trigger">
                        WOMEN <FiChevronDown className="chevron-icon" />
                        <div className="mega-menu">
                            <div className="mega-column">
                                <h4>Indian & Fusion Wear</h4>
                                <Link to="/gallery?cat=Kurtas">Kurtas & Suits</Link>
                                <Link to="/gallery?cat=Kurtis">Kurtis, Tunics & Tops</Link>
                                <Link to="/gallery?cat=Sarees">Sarees</Link>
                                <Link to="/gallery?cat=Ethnic Wear">Ethnic Wear</Link>
                                <Link to="/gallery?cat=Leggings">Leggings & Churidars</Link>
                                <Link to="/gallery?cat=Skirts">Skirts & Palazzos</Link>
                                <Link to="/gallery?cat=Lehenga Cholis">Lehenga Cholis</Link>
                                <Link to="/gallery?cat=Dupattas">Dupattas & Shawls</Link>
                                <Link to="/gallery?cat=Jackets">Jackets</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Western Wear</h4>
                                <Link to="/gallery?cat=Dresses">Dresses</Link>
                                <Link to="/gallery?cat=Tops">Tops</Link>
                                <Link to="/gallery?cat=Tshirts">Tshirts</Link>
                                <Link to="/gallery?cat=Jeans">Jeans</Link>
                                <Link to="/gallery?cat=Trousers">Trousers & Capris</Link>
                                <Link to="/gallery?cat=Shorts">Shorts & Skirts</Link>
                                <Link to="/gallery?cat=Co-ords">Co-ords</Link>
                                <Link to="/gallery?cat=Jumpsuits">Jumpsuits</Link>
                                <Link to="/gallery?cat=Shrugs">Shrugs</Link>
                                <Link to="/gallery?cat=Sweaters">Sweaters & Sweatshirts</Link>
                                <Link to="/gallery?cat=Blazers">Blazers & Waistcoats</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Footwear</h4>
                                <Link to="/gallery?cat=Flats">Flats</Link>
                                <Link to="/gallery?cat=Casual Shoes">Casual Shoes</Link>
                                <Link to="/gallery?cat=Heels">Heels</Link>
                                <Link to="/gallery?cat=Boots">Boots</Link>
                                <Link to="/gallery?cat=Sports Shoes">Sports Shoes</Link>
                                <h4 className="sub-h">Lingerie & Sleep</h4>
                                <Link to="/gallery?cat=Bra">Bra</Link>
                                <Link to="/gallery?cat=Briefs">Briefs</Link>
                                <Link to="/gallery?cat=Sleepwear">Sleepwear</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Beauty & Personal Care</h4>
                                <Link to="/gallery?cat=Makeup">Makeup</Link>
                                <Link to="/gallery?cat=Skincare">Skincare</Link>
                                <Link to="/gallery?cat=Lipsticks">Lipsticks</Link>
                                <Link to="/gallery?cat=Fragrances">Fragrances</Link>
                                <h4 className="sub-h">Gadgets</h4>
                                <Link to="/gallery?cat=Smart Wearables">Smart Wearables</Link>
                                <Link to="/gallery?cat=Headphones">Headphones</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Jewellery & Bags</h4>
                                <Link to="/gallery?cat=Fashion Jewellery">Fashion Jewellery</Link>
                                <Link to="/gallery?cat=Earrings">Earrings</Link>
                                <Link to="/gallery?cat=Handbags">Handbags & Wallets</Link>
                                <Link to="/gallery?cat=Backpacks">Backpacks</Link>
                                <Link to="/gallery?cat=Luggages">Luggages & Trolleys</Link>
                            </div>
                        </div>
                    </div>

                    {/* KIDS SECTION */}
                    <div className="nav-item mega-trigger">
                        KIDS <FiChevronDown className="chevron-icon" />
                        <div className="mega-menu">
                            <div className="mega-column">
                                <h4>Boys Clothing</h4>
                                <Link to="/gallery?cat=T-Shirts">T-Shirts</Link>
                                <Link to="/gallery?cat=Shirts">Shirts</Link>
                                <Link to="/gallery?cat=Shorts">Shorts</Link>
                                <Link to="/gallery?cat=Jeans">Jeans</Link>
                                <Link to="/gallery?cat=Trousers">Trousers</Link>
                                <Link to="/gallery?cat=Clothing Sets">Clothing Sets</Link>
                                <Link to="/gallery?cat=Ethnic Wear">Ethnic Wear</Link>
                                <Link to="/gallery?cat=Track Pants">Track Pants & Pyjamas</Link>
                                <Link to="/gallery?cat=Winter Wear">Jacket, Sweater & Sweatshirts</Link>
                                <Link to="/gallery?cat=Party Wear">Party Wear</Link>
                                <Link to="/gallery?cat=Innerwear">Innerwear & Thermals</Link>
                                <Link to="/gallery?cat=Nightwear">Nightwear & Loungewear</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Girls Clothing</h4>
                                <Link to="/gallery?cat=Dresses">Dresses</Link>
                                <Link to="/gallery?cat=Tops">Tops</Link>
                                <Link to="/gallery?cat=Tshirts">Tshirts</Link>
                                <Link to="/gallery?cat=Clothing Sets">Clothing Sets</Link>
                                <Link to="/gallery?cat=Lehenga choli">Lehenga choli</Link>
                                <Link to="/gallery?cat=Kurta Sets">Kurta Sets</Link>
                                <Link to="/gallery?cat=Party wear">Party wear</Link>
                                <Link to="/gallery?cat=Jumpsuits">Dungarees & Jumpsuits</Link>
                                <Link to="/gallery?cat=Skirts">Skirts & shorts</Link>
                                <Link to="/gallery?cat=Tights">Tights & Leggings</Link>
                                <Link to="/gallery?cat=Winter Wear">Jacket, Sweater & Sweatshirts</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Footwear</h4>
                                <Link to="/gallery?cat=Casual Shoes">Casual Shoes</Link>
                                <Link to="/gallery?cat=Flipflops">Flipflops</Link>
                                <Link to="/gallery?cat=Sports Shoes">Sports Shoes</Link>
                                <Link to="/gallery?cat=Flats">Flats</Link>
                                <Link to="/gallery?cat=Sandals">Sandals</Link>
                                <Link to="/gallery?cat=Heels">Heels</Link>
                                <Link to="/gallery?cat=School Shoes">School Shoes</Link>
                                <Link to="/gallery?cat=Socks">Socks</Link>
                                <h4 className="sub-h">Infants</h4>
                                <Link to="/gallery?cat=Bodysuits">Bodysuits</Link>
                                <Link to="/gallery?cat=Rompers">Rompers & Sleepsuits</Link>
                                <Link to="/gallery?cat=Infant Care">Infant Care</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Toys & Games</h4>
                                <Link to="/gallery?cat=Learning">Learning & Development</Link>
                                <Link to="/gallery?cat=Activity Toys">Activity Toys</Link>
                                <Link to="/gallery?cat=Soft Toys">Soft Toys</Link>
                                <Link to="/gallery?cat=Action Figures">Action Figure / Play set</Link>
                                <h4 className="sub-h">Accessories</h4>
                                <Link to="/gallery?cat=Kids Bags">Bags & Backpacks</Link>
                                <Link to="/gallery?cat=Watches">Watches</Link>
                                <Link to="/gallery?cat=Kids Jewellery">Jewellery & Hair accessory</Link>
                                <Link to="/gallery?cat=Sunglasses">Sunglasses</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Brands</h4>
                                <Link to="/gallery?brand=H&M">H&M</Link>
                                <Link to="/gallery?brand=Max Kids">Max Kids</Link>
                                <Link to="/gallery?brand=Pantaloons">Pantaloons</Link>
                                <Link to="/gallery?brand=Benetton">United Colors Of Benetton</Link>
                                <Link to="/gallery?brand=YK">YK</Link>
                                <Link to="/gallery?brand=US Polo">U.S. Polo Assn. Kids</Link>
                                <Link to="/gallery?brand=Mothercare">Mothercare</Link>
                                <Link to="/gallery?brand=HRX">HRX</Link>
                            </div>
                        </div>
                    </div>

                    {/* HOME & LIVING SECTION */}
                    <div className="nav-item mega-trigger">
                        HOME & LIVING <FiChevronDown className="chevron-icon" />
                        <div className="mega-menu">
                            <div className="mega-column">
                                <h4>Bed Linen & Furnishing</h4>
                                <Link to="/gallery?cat=Bed Runners">Bed Runners</Link>
                                <Link to="/gallery?cat=Mattress Protectors">Mattress Protectors</Link>
                                <Link to="/gallery?cat=Bedsheets">Bedsheets</Link>
                                <Link to="/gallery?cat=Bedding Sets">Bedding Sets</Link>
                                <Link to="/gallery?cat=Blankets">Blankets, Quilts & Dohars</Link>
                                <Link to="/gallery?cat=Pillows">Pillows & Pillow Covers</Link>
                                <Link to="/gallery?cat=Bed Covers">Bed Covers</Link>
                                <Link to="/gallery?cat=Diwan Sets">Diwan Sets</Link>
                                <Link to="/gallery?cat=Chair Pads">Chair Pads & Covers</Link>
                                <Link to="/gallery?cat=Sofa Covers">Sofa Covers</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Flooring & Bath</h4>
                                <Link to="/gallery?cat=Floor Runners">Floor Runners</Link>
                                <Link to="/gallery?cat=Carpets">Carpets</Link>
                                <Link to="/gallery?cat=Floor Mats">Floor Mats & Dhurries</Link>
                                <Link to="/gallery?cat=Door Mats">Door Mats</Link>
                                <h4 className="sub-h">Bath</h4>
                                <Link to="/gallery?cat=Bath Towels">Bath Towels</Link>
                                <Link to="/gallery?cat=Hand Towels">Hand & Face Towels</Link>
                                <Link to="/gallery?cat=Beach Towels">Beach Towels</Link>
                                <Link to="/gallery?cat=Towels Set">Towels Set</Link>
                                <Link to="/gallery?cat=Bath Rugs">Bath Rugs</Link>
                                <Link to="/gallery?cat=Bath Robes">Bath Robes</Link>
                                <Link to="/gallery?cat=Bathroom Accessories">Bathroom Accessories</Link>
                                <Link to="/gallery?cat=Shower Curtains">Shower Curtains</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Lamps & Lighting</h4>
                                <Link to="/gallery?cat=Floor Lamps">Floor Lamps</Link>
                                <Link to="/gallery?cat=Ceiling Lamps">Ceiling Lamps</Link>
                                <Link to="/gallery?cat=Table Lamps">Table Lamps</Link>
                                <Link to="/gallery?cat=Wall Lamps">Wall Lamps</Link>
                                <Link to="/gallery?cat=Outdoor Lamps">Outdoor Lamps</Link>
                                <Link to="/gallery?cat=String Lights">String Lights</Link>
                                <h4 className="sub-h">Home Décor</h4>
                                <Link to="/gallery?cat=Plants">Plants & Planters</Link>
                                <Link to="/gallery?cat=Aromas">Aromas & Candles</Link>
                                <Link to="/gallery?cat=Clocks">Clocks</Link>
                                <Link to="/gallery?cat=Mirrors">Mirrors</Link>
                                <Link to="/gallery?cat=Wall Decor">Wall Décor</Link>
                                <Link to="/gallery?cat=Festive Decor">Festive Decor</Link>
                                <Link to="/gallery?cat=Pooja Essentials">Pooja Essentials</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Kitchen & Table</h4>
                                <Link to="/gallery?cat=Table Runners">Table Runners</Link>
                                <Link to="/gallery?cat=Dinnerware">Dinnerware & Serveware</Link>
                                <Link to="/gallery?cat=Cups and Mugs">Cups and Mugs</Link>
                                <Link to="/gallery?cat=Bakeware">Bakeware & Cookware</Link>
                                <Link to="/gallery?cat=Kitchen Storage">Kitchen Storage & Tools</Link>
                                <Link to="/gallery?cat=Barware">Bar & Drinkware</Link>
                                <Link to="/gallery?cat=Table Covers">Table Covers & Furnishings</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Storage & Organisers</h4>
                                <Link to="/gallery?cat=Bins">Bins</Link>
                                <Link to="/gallery?cat=Hangers">Hangers</Link>
                                <Link to="/gallery?cat=Organisers">Organisers</Link>
                                <Link to="/gallery?cat=Hooks">Hooks & Holders</Link>
                                <Link to="/gallery?cat=Laundry Bags">Laundry Bags</Link>
                                <Link to="/gallery?cat=Wall Shelves">Wall Shelves</Link>
                                <h4 className="sub-h">Gift Sets</h4>
                                <Link to="/gallery?cat=Home Gift Sets">Home Gift Sets</Link>
                                <Link to="/gallery?cat=Showpieces">Showpieces & Vases</Link>
                                <Link to="/gallery?cat=Fountains">Fountains</Link>
                            </div>
                        </div>
                    </div>

                    {/* BEAUTY SECTION */}
                    <div className="nav-item mega-trigger">
                        BEAUTY <FiChevronDown className="chevron-icon" />
                        <div className="mega-menu">
                            <div className="mega-column">
                                <h4>Makeup</h4>
                                <Link to="/gallery?cat=Lipstick">Lipstick</Link>
                                <Link to="/gallery?cat=Lip Gloss">Lip Gloss</Link>
                                <Link to="/gallery?cat=Lip Liner">Lip Liner</Link>
                                <Link to="/gallery?cat=Mascara">Mascara</Link>
                                <Link to="/gallery?cat=Eyeliner">Eyeliner</Link>
                                <Link to="/gallery?cat=Kajal">Kajal</Link>
                                <Link to="/gallery?cat=Eyeshadow">Eyeshadow</Link>
                                <Link to="/gallery?cat=Foundation">Foundation</Link>
                                <Link to="/gallery?cat=Primer">Primer</Link>
                                <Link to="/gallery?cat=Concealer">Concealer</Link>
                                <Link to="/gallery?cat=Compact">Compact</Link>
                                <Link to="/gallery?cat=Nail Polish">Nail Polish</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Skincare & Body</h4>
                                <Link to="/gallery?cat=Face Moisturiser">Face Moisturiser</Link>
                                <Link to="/gallery?cat=Cleanser">Cleanser</Link>
                                <Link to="/gallery?cat=Masks & Peel">Masks & Peel</Link>
                                <Link to="/gallery?cat=Sunscreen">Sunscreen</Link>
                                <Link to="/gallery?cat=Serum">Serum</Link>
                                <Link to="/gallery?cat=Face Wash">Face Wash</Link>
                                <Link to="/gallery?cat=Eye Cream">Eye Cream</Link>
                                <Link to="/gallery?cat=Lip Balm">Lip Balm</Link>
                                <Link to="/gallery?cat=Body Lotion">Body Lotion</Link>
                                <Link to="/gallery?cat=Body Wash">Body Wash</Link>
                                <Link to="/gallery?cat=Hand Cream">Hand Cream</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Haircare</h4>
                                <Link to="/gallery?cat=Shampoo">Shampoo</Link>
                                <Link to="/gallery?cat=Conditioner">Conditioner</Link>
                                <Link to="/gallery?cat=Hair Cream">Hair Cream</Link>
                                <Link to="/gallery?cat=Hair Oil">Hair Oil</Link>
                                <Link to="/gallery?cat=Hair Gel">Hair Gel</Link>
                                <Link to="/gallery?cat=Hair Color">Hair Color</Link>
                                <Link to="/gallery?cat=Hair Serum">Hair Serum</Link>
                                <h4 className="sub-h">Men's Grooming</h4>
                                <Link to="/gallery?cat=Trimmers">Trimmers</Link>
                                <Link to="/gallery?cat=Beard Oil">Beard Oil</Link>
                                <Link to="/gallery?cat=Hair Wax">Hair Wax</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Fragrances & Tools</h4>
                                <Link to="/gallery?cat=Perfume">Perfume</Link>
                                <Link to="/gallery?cat=Deodorant">Deodorant</Link>
                                <Link to="/gallery?cat=Body Mist">Body Mist</Link>
                                <h4 className="sub-h">Appliances</h4>
                                <Link to="/gallery?cat=Hair Straightener">Hair Straightener</Link>
                                <Link to="/gallery?cat=Hair Dryer">Hair Dryer</Link>
                                <Link to="/gallery?cat=Epilator">Epilator</Link>
                            </div>
                            <div className="mega-column">
                                <h4>Top Brands</h4>
                                <Link to="/gallery?brand=Lakme">Lakme</Link>
                                <Link to="/gallery?brand=Maybelline">Maybelline</Link>
                                <Link to="/gallery?brand=LOreal">L'Oreal</Link>
                                <Link to="/gallery?brand=Philips">Philips</Link>
                                <Link to="/gallery?brand=Biotique">Biotique</Link>
                                <Link to="/gallery?brand=Mamaearth">Mamaearth</Link>
                                <Link to="/gallery?brand=Nivea">Nivea</Link>
                                <Link to="/gallery?brand=MAC">M.A.C</Link>
                                <Link to="/gallery?brand=Forest Essentials">Forest Essentials</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="nav-search-container">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search for brands, products..." 
                        className="search-input" 
                        value={searchTerm} 
                        onChange={handleSearch} 
                    />
                </div>

                {/* ACTIONS */}
                <div className="nav-actions">
                    {token ? (
                        <div className="nav-action-item user-group-container">
                            <motion.div className="icon-with-label" whileHover={{ y: -3 }}>
                                <FiUser /> <span>Profile</span>
                            </motion.div>
                            <div className="user-dropdown-premium">
                                <div className="dropdown-header">
                                    <p className="user-full-name">{user?.name}</p>
                                    {isAdmin && <span className="admin-status-badge">OWNER</span>}
                                </div>
                                {isAdmin && <Link to="/admin-dashboard" className="dropdown-menu-item"><FiSettings /> Admin</Link>}
                                <Link to="/my-orders" className="dropdown-menu-item"><FiShoppingBag /> Orders</Link>
                                <button onClick={handleLogout} className="dropdown-menu-item logout-red"><FiLogOut /> Logout</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="nav-action-item">
                            <FiUser /><span>Login</span>
                        </Link>
                    )}

                    <Link to="/wishlist" className="nav-action-item">
                        <div className="icon-with-badge">
                            <FiHeart />
                            {wishlist?.length > 0 && <span className="cart-badge">{wishlist.length}</span>}
                        </div>
                        <span>Wishlist</span>
                    </Link>

                    <Link to="/cart" className="nav-action-item">
                        <div className="icon-with-badge">
                            <FiShoppingBag />
                            {cart?.length > 0 && <span className="cart-badge pulse-anim">{cart.length}</span>}
                        </div>
                        <span>Bag</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;