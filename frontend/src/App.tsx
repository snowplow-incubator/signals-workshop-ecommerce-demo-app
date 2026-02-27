import React, { useState, useEffect, useCallback } from 'react';
import { initializeSnowplow, trackProductViewEvent, trackAddToCartEvent } from './snowplow';
import UserSwitcher from './components/UserSwitcher';
import InterventionModal, { ModalIntervention } from './components/InterventionModal';
import { PersonalizationProvider } from './contexts/PersonalizationContext';

import { addInterventionHandlers, Intervention } from '@snowplow/signals-browser-plugin';

interface Product {
  id: number;
  title: string;
  brand?: string;
  category: string;
  price: number;
  thumbnail: string;
  description: string;
  stock: number;
  rating: number;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>Product Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <img src={product.thumbnail} alt={product.title} className="product-modal-image" />
          <h1 className="product-modal-title">{product.title}</h1>
          <div className="product-modal-price">${product.price}</div>
          <p className="product-modal-description">{product.description}</p>

          <div className="product-modal-details">
            <div className="product-detail">
              <div className="product-detail-label">Category</div>
              <div className="product-detail-value">{product.category}</div>
            </div>
            <div className="product-detail">
              <div className="product-detail-label">Brand</div>
              <div className="product-detail-value">{product.brand || 'N/A'}</div>
            </div>
            <div className="product-detail">
              <div className="product-detail-label">Stock</div>
              <div className="product-detail-value">{product.stock} items</div>
            </div>
            <div className="product-detail">
              <div className="product-detail-label">Rating</div>
              <div className="product-detail-value">⭐ {product.rating}/5</div>
            </div>
          </div>

          <div className="product-modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={() => onAddToCart(product)}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartToastProps {
  productName: string | null;
}

function CartToast({ productName }: CartToastProps) {
  if (!productName) return null;
  return (
    <div className="cart-toast">
      <span className="cart-toast-icon">🛒</span>
      <span><strong>{productName}</strong> added to cart</span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, onViewProduct, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card" onClick={() => { trackProductViewEvent(product); onViewProduct(product); }}>
      <img src={product.thumbnail} alt={product.title} className="product-image" />
      <h3 className="product-title">{product.title}</h3>
      <p className="product-description">{product.description.substring(0, 100)}...</p>
      <div className="product-price">${product.price}</div>
      <button
        className="btn btn-primary"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}

const MODAL_INTERVENTION_NAMES = new Set<ModalIntervention['type']>([
  'high_purchase_intent',
  'furniture_interest',
  'fragrance_interest',
]);

function isModalInterventionType(name: string): name is ModalIntervention['type'] {
  return MODAL_INTERVENTION_NAMES.has(name as ModalIntervention['type']);
}

function AppContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [intervention, setIntervention] = useState<ModalIntervention | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartToast, setCartToast] = useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAddToCart = useCallback((product: Product) => {
    trackAddToCartEvent(product);

    if (toastTimer.current) clearTimeout(toastTimer.current);
    setCartToast(product.title);
    toastTimer.current = setTimeout(() => setCartToast(null), 2500);
  }, []);

  useEffect(() => {
    initializeSnowplow();

    fetch('https://dummyjson.com/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });

    addInterventionHandlers({
      handler: (incoming: Intervention) => {
        console.log('intervention received!', incoming);
        if (isModalInterventionType(incoming.name)) {
          setIntervention({ type: incoming.name });
        } else {
          console.log('unknown intervention', incoming);
        }
      },
    });

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const displayedProducts = products.slice(0, 12);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <CartToast productName={cartToast} />

      <header className="header">
        <h1>🛍️ Signals Workshop E-Shop</h1>
        <p>Demo application showcasing Snowplow Signals personalization</p>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <UserSwitcher />
        </aside>

        <main className="products-section">
          <div className="products-grid">
            {displayedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onViewProduct={setSelectedProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </main>
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => { handleAddToCart(p); setSelectedProduct(null); }}
      />
      <InterventionModal intervention={intervention} onClose={() => setIntervention(null)} />
    </div>
  );
}

function App() {
  return (
    <PersonalizationProvider>
      <AppContent />
    </PersonalizationProvider>
  );
}

export default App;
