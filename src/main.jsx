import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; 
import { CartProvider } from './CartContext'; // ✅ Ye sahi hai

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ App ko CartProvider ke andar lapetna zaroori hai */}
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);