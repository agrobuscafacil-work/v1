export type UserRole = 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  document: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  active: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProfile {
  id: string;
  userId: string;
  companyName: string;
  tradingName?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  rating: number;
  totalReviews: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  address?: Address;
  certifications: string[];
  badges: string[];
  featured: boolean;
  workingHours?: WorkingHour[];
  createdAt: string;
}

export interface Address {
  id: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isMain: boolean;
  label?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
  order: number;
  active: boolean;
}

export interface Product {
  id: string;
  supplierId: string;
  supplier?: SupplierProfile;
  categoryId: string;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  sku?: string;
  unit: string;
  minimumQuantity: number;
  price: number;
  comparePrice?: number;
  discountPercent: number;
  stock: number;
  images: string[];
  tags: string[];
  specifications?: any;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  featured: boolean;
  freeShipping: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

export interface Service {
  id: string;
  supplierId: string;
  supplier?: SupplierProfile;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price?: number;
  priceType: string;
  duration?: number;
  durationUnit: string;
  images: string[];
  status: string;
  rating: number;
  totalReviews: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: User;
  supplierId: string;
  supplier?: SupplierProfile;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  trackingCode?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  createdAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'DECLINED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  userId: string;
  user: { name: string; avatarUrl?: string };
  supplierId: string;
  productId?: string;
  serviceId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  helpfulCount: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  supplierId: string;
  customerId: string;
  orderId?: string;
  isActive: boolean;
  lastMessage?: Message;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: { id: string; name: string; avatarUrl?: string };
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  content: string;
  attachments: string[];
  readAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  statusCode: number;
}

export interface WorkingHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type SupportAttachmentType = 'IMAGE' | 'DOCUMENT' | 'VIDEO';

export interface SupportCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  active: boolean;
  types: SupportType[];
}

export interface SupportType {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  order: number;
  active: boolean;
}

export interface SupportAttachment {
  id: string;
  ticketId: string;
  type: SupportAttachmentType;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface SupportTicketNote {
  id: string;
  ticketId: string;
  adminId: string;
  admin?: { id: string; name: string };
  note: string;
  createdAt: string;
}

export interface SupportTicketStatusHistory {
  id: string;
  ticketId: string;
  status: SupportTicketStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string; avatarUrl?: string };
  categoryId: string;
  category: SupportCategory;
  typeId: string;
  type: SupportType;
  title: string;
  description: string;
  pageUrl?: string;
  browser?: string;
  os?: string;
  device?: string;
  appVersion?: string;
  status: SupportTicketStatus;
  adminResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  attachments: SupportAttachment[];
  notes?: SupportTicketNote[];
  statusHistory?: SupportTicketStatusHistory[];
}
