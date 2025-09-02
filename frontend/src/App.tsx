import React, { useState, useEffect } from 'react';
import { initializeSnowplow, trackProductViewEvent, trackAddToCartEvent } from './snowplow';

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

interface BannerIntervention {
  type: string;
  message: string;
  code?: string;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

function ProductModal({ product, onClose }: ProductModalProps) {
  const handleAddToCart = () => {
    if (product) {
      trackAddToCartEvent(product);
      alert(`Added ${product.title} to cart!`);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
          <img
            src={product.thumbnail}
            alt={product.title}
            className="product-modal-image"
          />
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
            <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InterventionBannerProps {
  intervention: BannerIntervention | null;
  onClose: () => void;
}

function InterventionBanner({ intervention, onClose }: InterventionBannerProps) {
  const handleClick = () => {
    onClose();
  };

  if (!intervention) return null;

  return (
    <div className={`intervention-banner intervention-${intervention.type}`}>
      <span>{intervention.message}</span>
      {intervention.code && <span> Use code: <strong>{intervention.code}</strong></span>}
      <button className="intervention-close" onClick={handleClick}>×</button>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
}

function ProductCard({ product, onViewProduct }: ProductCardProps) {
  const handleViewProduct = () => {
    trackProductViewEvent(product);
    onViewProduct(product);
  };

  const handleAddToCart = () => {
    trackAddToCartEvent(product);
    alert(`Added ${product.title} to cart!`);
  };

  return (
    <div className="product-card" onClick={handleViewProduct}>
      <img
        src={product.thumbnail}
        alt={product.title}
        className="product-image"
      />
      <h3 className="product-title">{product.title}</h3>
      <p className="product-description">{product.description.substring(0, 100)}...</p>
      <div className="product-price">${product.price}</div>
      <button
        className="btn btn-primary"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          handleAddToCart();
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [intervention, setIntervention] = useState<BannerIntervention | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

    // TODO: add intervention handlers
  }, []);

  const closeIntervention = () => {
    setIntervention(null);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <InterventionBanner intervention={intervention} onClose={closeIntervention} />

      <header className="header">
        <h1>🛍️ Signals Workshop E-Shop</h1>
        <p>Demo application showcasing Snowplow Signals integration</p>
      </header>

      <main>
        <div className="products-grid">
          {products.slice(0, 12).map(product => (
            <ProductCard key={product.id} product={product} onViewProduct={handleViewProduct} />
          ))}
        </div>
      </main>

      <ProductModal product={selectedProduct} onClose={closeProductModal} />
    </div>
  );
}

export default App;
