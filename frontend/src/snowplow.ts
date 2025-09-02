import { newTracker, trackPageView } from '@snowplow/browser-tracker';
import { SnowplowEcommercePlugin, trackAddToCart, trackProductView } from '@snowplow/browser-plugin-snowplow-ecommerce';

interface Product {
  id: number;
  title: string;
  brand?: string;
  category: string;
  price: number;
}

export const initializeSnowplow = () => {
  newTracker('sp', 'https://collector-sales-aws.snowplow.io', {
    appId: 'ai_demo',
    discoverRootDomain: true,
    cookieSameSite: 'Lax',
    contexts: {
      webPage: true
    },
    plugins: [
      SnowplowEcommercePlugin(),
      // TODO: add SignalsInterventionsPlugin
    ],
  });

  trackPageView();

  // TODO: add subscribeToInterventions
};

export const trackProductViewEvent = (product: Product) => {
  console.log('trackProductView', product);
  trackProductView({
    id: String(product.id),
    name: product.title,
    brand: product.brand || "N/A",
    category: product.category,
    price: product.price,
    currency: "USD",
  });
};

export const trackAddToCartEvent = (product: Product) => {
  console.log('trackAddToCart', product);
  trackAddToCart({
    products: [
      {
        id: String(product.id),
        name: product.title,
        brand: product.brand || "N/A",
        category: product.category,
        price: product.price,
        currency: "USD",
      },
    ],
    total_value: product.price,
    currency: "USD",
  });
};
