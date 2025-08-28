import { newTracker, trackPageView } from '@snowplow/browser-tracker';
import { SnowplowEcommercePlugin, trackAddToCart, trackProductView } from '@snowplow/browser-plugin-snowplow-ecommerce';
import {
  SignalsInterventionsPlugin,
  subscribeToInterventions
} from '@snowplow/signals-browser-plugin';

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
      SignalsInterventionsPlugin(),
    ],
  });

  trackPageView();

  subscribeToInterventions({
    endpoint: 'd0a9ba0f-893a-445f-91a5-a1abf1359d34.svc.snplow.net',
  });
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
