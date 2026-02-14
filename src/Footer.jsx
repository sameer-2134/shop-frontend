import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, Linkedin, Facebook, Twitter, 
  ShieldCheck, RotateCcw, Truck, Apple, Play
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="premium-footer">
      <div className="neon-line-wrapper">
    <div className="neon-line"></div>
  </div>
      <div className="footer-container">
        <div className="footer-container"></div>
        
        {/* Section 1: Navigation Grid */}
        <div className="footer-grid">
          <div className="footer-col">
            <h3>ONLINE SHOPPING</h3>
            <Link to="/men">Men's Wear</Link>
            <Link to="/women">Women's Wear</Link>
            <Link to="/kids">Kids' Collection</Link>
            <Link to="/home">Home & Decor</Link>
            <Link to="/beauty">Beauty & Personal Care</Link>
            <Link to="/studio">Shoplane Studio</Link>
          </div>

          <div className="footer-col">
            <h3>CUSTOMER POLICIES</h3>
            <Link to="/contact">Contact Us</Link>
            <Link to="/faq">Track Your Order</Link>
            <Link to="/shipping">Shipping Policy</Link>
            <Link to="/returns">Returns & Exchange</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>

          <div className="footer-col">
            <h3>USEFUL LINKS</h3>
            <Link to="/about">About Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/sitemap">Site Map</Link>
            <Link to="/corporate">Corporate Governance</Link>
            <Link to="/press">Press Releases</Link>
          </div>

          <div className="footer-col newsletter-col">
            <h3>EXPERIENCE SHOPLANE APP</h3>
            <p>Get the latest trends and exclusive offers right on your phone.</p>
            
            <div className="app-btns">
              <a href="#" className="store-btn">
                <Play size={20} fill="white" />
                <div className="btn-text">
                  <small>Get it on</small>
                  <span>Google Play</span>
                </div>
              </a>
              <a href="#" className="store-btn">
                <Apple size={20} fill="white" />
                <div className="btn-text">
                  <small>Download on the</small>
                  <span>App Store</span>
                </div>
              </a>
            </div>

            <div className="subscribe-wrap">
                <h4>BE THE FIRST TO KNOW</h4>
                <div className="premium-subscribe">
                    <input type="email" placeholder="Enter your email" />
                    <button>JOIN NOW</button>
                </div>
            </div>
          </div>
        </div>

        {/* Section 2: Trust Badges (3D Cards) */}
        <div className="trust-badges">
          <div className="badge-card">
            <ShieldCheck className="badge-icon" size={36} />
            <div className="badge-info">
                <strong>100% ORIGINAL</strong>
                <p>Authentic products sourced directly</p>
            </div>
          </div>
          <div className="badge-card">
            <RotateCcw className="badge-icon" size={36} />
            <div className="badge-info">
                <strong>14 DAYS RETURN</strong>
                <p>Easy & hassle-free return policy</p>
            </div>
          </div>
          <div className="badge-card">
            <Truck className="badge-icon" size={36} />
            <div className="badge-info">
                <strong>FREE DELIVERY</strong>
                <p>On all orders above ₹799</p>
            </div>
          </div>
        </div>

        {/* Section 3: Social & Brands */}
        <div className="popular-searches">
          <h3>TOP BRANDS</h3>
          <p>
            Nike | Adidas | Puma | Levi's | Tommy Hilfiger | Calvin Klein | H&M | Zara | United Colors of Benetton | Vero Moda | Only | Jack & Jones | Fossil | Casio | Ray-Ban | Lakme | Maybelline
          </p>
        </div>

        <div className="footer-bottom">
            <div className="social-links">
                <Instagram size={22} className="s-icon" />
                <Facebook size={22} className="s-icon" />
                <Twitter size={22} className="s-icon" />
                <Linkedin size={22} className="s-icon" />
            </div>
            <p className="copyright">© 2026 Shoplane. Crafted for the Modern Generation.</p>
            <p className="venture-text">A Premium Fashion Initiative.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;