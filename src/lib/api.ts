const API_URL = import.meta.env.VITE_API_URL || '';
const CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || '';
const CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || '';

// Basic Authentication Token
const authHeader = `Basic ${btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)}`;

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL.replace(/\/+$/, '')}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Request failed: ${response.status} - ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export interface WCImage {
  id?: number;
  src: string;
  alt: string;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
  image?: WCImage | null;
}

export interface WCAttribute {
  id?: number;
  name: string;
  options: string[];
  visible: boolean;
  variation: boolean;
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: WCImage[];
  categories: WCCategory[];
  short_description: string;
  description: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  attributes: WCAttribute[];
}

export function resolveImageUrl(src: string | undefined | null): string {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  const baseUrl = API_URL.replace(/\/+$/, '');
  const relativePath = src.startsWith('/') ? src : `/${src}`;
  return `${baseUrl}${relativePath}`;
}

function mapImage(img: WCImage | null | undefined): WCImage | null {
  if (!img) return null;
  return {
    ...img,
    src: resolveImageUrl(img.src),
  };
}

function mapProduct(p: WCProduct): WCProduct {
  return {
    ...p,
    images: (p.images || []).map((img) => mapImage(img)).filter(Boolean) as WCImage[],
  };
}

function mapCategory(c: WCCategory): WCCategory {
  return {
    ...c,
    image: mapImage(c.image),
  };
}

export const api = {
  getProducts: async (params: { search?: string; category?: string; page?: number; per_page?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.category) searchParams.set('category', params.category);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));

    const queryString = searchParams.toString();
    const data = await apiRequest<WCProduct[]>(`/products${queryString ? `?${queryString}` : ''}`);
    return data.map(mapProduct);
  },

  getProduct: async (id: number) => {
    const data = await apiRequest<WCProduct>(`/products/${id}`);
    return mapProduct(data);
  },

  createProduct: async (product: Omit<WCProduct, 'id'>) => {
    return apiRequest<{ id: number }>('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
  },

  deleteProduct: async (id: number) => {
    return apiRequest<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  getCategories: async () => {
    const data = await apiRequest<WCCategory[]>('/products/categories');
    return data.map(mapCategory);
  },

  createCategory: async (category: { name: string; slug: string; image?: WCImage | null }) => {
    return apiRequest<{ id: number }>('/products/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
  },

  deleteCategory: async (id: number) => {
    return apiRequest<{ success: boolean }>(`/products/categories/${id}`, {
      method: 'DELETE',
    });
  },

  uploadImage: async (file: File): Promise<WCImage> => {
    const url = `${API_URL.replace(/\/+$/, '')}/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': file.type,
        'X-Filename': file.name,
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText || response.statusText}`);
    }

    const data = (await response.json()) as any;
    const mapped = {
      id: data.id,
      src: data.src || data.url || '',
      alt: data.alt || data.name || file.name || '',
    };
    return mapImage(mapped) as WCImage;
  },
};
