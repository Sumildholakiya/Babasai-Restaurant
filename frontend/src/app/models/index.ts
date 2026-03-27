// User model
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// MenuItem model
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  createdAt?: string;
}

// Cart models
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
  total: number;
}

// Order models
export interface OrderItem {
  menuItem: string | MenuItem;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
}

// Review model
export interface Review {
  _id: string;
  user: User | { name: string; email?: string };
  message: string;
  rating: number;
  createdAt: string;
}

// Admin stats
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalMenuItems: number;
  totalReviews: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  unreadContacts: number;
}

// API response wrappers
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface MenuFilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  available?: boolean;
}
