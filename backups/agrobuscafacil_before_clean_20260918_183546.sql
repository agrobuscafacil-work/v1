--
-- PostgreSQL database dump
--

\restrict Gub6df6P76wEYyZYiwyPZ5735nVpWp68TRp2xYHDBpfsT9aHyxBNMjNRB30XuYV

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'IMAGE',
    'FILE',
    'SYSTEM'
);


ALTER TYPE public."MessageType" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER_CREATED',
    'ORDER_UPDATED',
    'ORDER_CANCELLED',
    'MESSAGE_RECEIVED',
    'REVIEW_RECEIVED',
    'PAYMENT_CONFIRMED',
    'PAYMENT_FAILED',
    'SHIPMENT_UPDATED',
    'SUPPLIER_APPROVED',
    'SUPPLIER_REJECTED',
    'PROMOTION',
    'SYSTEM',
    'WELCOME',
    'PASSWORD_CHANGED',
    'SUPPORT_RESPONSE'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CREDIT_CARD',
    'DEBIT_CARD',
    'PIX',
    'BOLETO',
    'BANK_TRANSFER',
    'DEPOSIT',
    'CASH'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'APPROVED',
    'DECLINED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'CANCELLED',
    'CHARGEBACK'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'OUT_OF_STOCK',
    'DISCONTINUED',
    'PENDING_REVIEW',
    'REJECTED'
);


ALTER TYPE public."ProductStatus" OWNER TO postgres;

--
-- Name: ReviewReportReason; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewReportReason" AS ENUM (
    'SPAM',
    'OFFENSIVE_CONTENT',
    'FAKE_REVIEW',
    'IRRELEVANT',
    'PERSONAL_INFORMATION',
    'ADVERTISEMENT',
    'OTHER'
);


ALTER TYPE public."ReviewReportReason" OWNER TO postgres;

--
-- Name: ReviewReportStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewReportStatus" AS ENUM (
    'PENDING',
    'RESOLVED',
    'DISMISSED'
);


ALTER TYPE public."ReviewReportStatus" OWNER TO postgres;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'FLAGGED'
);


ALTER TYPE public."ReviewStatus" OWNER TO postgres;

--
-- Name: SaleMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SaleMode" AS ENUM (
    'DIRECT',
    'CONTACT_ONLY'
);


ALTER TYPE public."SaleMode" OWNER TO postgres;

--
-- Name: ShippingType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ShippingType" AS ENUM (
    'FIXED',
    'CALCULATED_BY_ZIPCODE',
    'FREE',
    'SCHEDULED',
    'PICKUP'
);


ALTER TYPE public."ShippingType" OWNER TO postgres;

--
-- Name: SupplierStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SupplierStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'BLOCKED'
);


ALTER TYPE public."SupplierStatus" OWNER TO postgres;

--
-- Name: SupplierTier; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SupplierTier" AS ENUM (
    'BASIC',
    'STANDARD',
    'PREMIUM'
);


ALTER TYPE public."SupplierTier" OWNER TO postgres;

--
-- Name: SupportAttachmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SupportAttachmentType" AS ENUM (
    'IMAGE',
    'DOCUMENT',
    'VIDEO'
);


ALTER TYPE public."SupportAttachmentType" OWNER TO postgres;

--
-- Name: SupportTicketStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SupportTicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."SupportTicketStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'CUSTOMER',
    'SUPPLIER',
    'ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text,
    "supplierId" text,
    "zipCode" text NOT NULL,
    street text NOT NULL,
    number text NOT NULL,
    complement text,
    neighborhood text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    country text DEFAULT 'Brasil'::text NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    "isMain" boolean DEFAULT false NOT NULL,
    label text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    "oldValue" jsonb,
    "newValue" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Banner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Banner" (
    id text NOT NULL,
    "supplierId" text,
    title text NOT NULL,
    subtitle text,
    description text,
    "imageUrl" text NOT NULL,
    "linkUrl" text,
    "position" text DEFAULT 'HOME_TOP'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Banner" OWNER TO postgres;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "iconUrl" text,
    "imageUrl" text,
    "parentId" text,
    "order" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "supplierId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: ChatSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatSettings" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "autoReply" boolean DEFAULT false NOT NULL,
    "autoReplyMessage" text,
    "workingHoursOnly" boolean DEFAULT false NOT NULL,
    "responseTime" integer,
    "welcomeMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    online boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ChatSettings" OWNER TO postgres;

--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "customerId" text NOT NULL,
    "orderId" text,
    subject text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "blockedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Conversation" OWNER TO postgres;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "productId" text,
    code text NOT NULL,
    description text,
    "discountType" text DEFAULT 'PERCENTAGE'::text NOT NULL,
    "discountValue" numeric(12,2) NOT NULL,
    "minOrderValue" numeric(12,2),
    "maxUses" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "maxUsesPerUser" integer,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Coupon" OWNER TO postgres;

--
-- Name: CustomerProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CustomerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "birthDate" timestamp(3) without time zone,
    gender text,
    "receivePromotions" boolean DEFAULT true NOT NULL,
    notes text,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "totalSpent" numeric(12,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CustomerProfile" OWNER TO postgres;

--
-- Name: Favorite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Favorite" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "supplierId" text,
    "productId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Favorite" OWNER TO postgres;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    "orderId" text,
    type public."MessageType" DEFAULT 'TEXT'::public."MessageType" NOT NULL,
    content text NOT NULL,
    attachments text[],
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Message" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "customerId" text NOT NULL,
    "supplierId" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod",
    "paymentId" text,
    subtotal numeric(12,2) NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    "shippingCost" numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) NOT NULL,
    "shippingType" public."ShippingType",
    "shippingData" jsonb,
    "addressId" text,
    "trackingCode" text,
    "estimatedDelivery" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    notes text,
    "invoiceUrl" text,
    "invoiceNumber" text,
    "cancellationReason" text,
    "refundAmount" numeric(12,2),
    "refundedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "confirmedDeliveryAt" timestamp(3) without time zone
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderCoupon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderCoupon" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "couponId" text NOT NULL,
    discount numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderCoupon" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "confirmedDeliveryAt" timestamp(3) without time zone
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderStatusHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderStatusHistory" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status public."OrderStatus" NOT NULL,
    "changedBy" text,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderStatusHistory" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    gateway text,
    "gatewayId" text,
    "gatewayResponse" jsonb,
    "pixCode" text,
    "pixQrCode" text,
    "boletoUrl" text,
    "boletoBarCode" text,
    "cardLastDigits" text,
    "cardBrand" text,
    installments integer,
    "paidAt" timestamp(3) without time zone,
    "refundedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "idempotencyKey" text
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: PaymentCard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentCard" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "userId" text NOT NULL,
    "paymentCustomerId" text NOT NULL,
    provider text DEFAULT 'MERCADOPAGO'::text NOT NULL,
    "providerCardId" text NOT NULL,
    brand text NOT NULL,
    last4 text NOT NULL,
    "expMonth" integer,
    "expYear" integer,
    "isDefault" boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PaymentCard" OWNER TO postgres;

--
-- Name: PaymentCustomer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentCustomer" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "userId" text NOT NULL,
    provider text DEFAULT 'MERCADOPAGO'::text NOT NULL,
    "providerCustomerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PaymentCustomer" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "shortDescription" text,
    brand text,
    model text,
    sku text,
    barcode text,
    unit text DEFAULT 'un'::text NOT NULL,
    "minimumQuantity" integer DEFAULT 1 NOT NULL,
    price numeric(12,2) NOT NULL,
    "comparePrice" numeric(12,2),
    "costPrice" numeric(12,2),
    "discountPercent" integer DEFAULT 0 NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    "stockAlert" integer DEFAULT 5 NOT NULL,
    weight numeric(10,3),
    height numeric(10,2),
    width numeric(10,2),
    depth numeric(10,2),
    images text[],
    videos text[],
    tags text[],
    specifications jsonb,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    "statusReason" text,
    featured boolean DEFAULT false NOT NULL,
    "freeShipping" boolean DEFAULT false NOT NULL,
    "allowPickup" boolean DEFAULT true NOT NULL,
    "preparationTime" integer DEFAULT 1 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "saleCount" integer DEFAULT 0 NOT NULL,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "saleMode" public."SaleMode" DEFAULT 'DIRECT'::public."SaleMode" NOT NULL,
    "shippingBaseCost" numeric(12,2) DEFAULT 0 NOT NULL,
    "shippingAdditionalCost" numeric(12,2) DEFAULT 0 NOT NULL,
    "shippingFreeDistanceKm" numeric(10,2) DEFAULT 0 NOT NULL,
    "shippingCoverage" text DEFAULT 'ALL_BRAZIL'::text NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductCode" (
    id text NOT NULL,
    "productId" text NOT NULL,
    code text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductCode" OWNER TO postgres;

--
-- Name: Promotion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Promotion" (
    id text NOT NULL,
    "productId" text,
    "supplierId" text,
    title text NOT NULL,
    description text,
    "discountType" text DEFAULT 'PERCENTAGE'::text NOT NULL,
    "discountValue" numeric(12,2) NOT NULL,
    "minQuantity" integer,
    "maxQuantity" integer,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Promotion" OWNER TO postgres;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    jti text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "revokedAt" timestamp(3) without time zone,
    "replacedBy" text,
    "userAgent" text,
    ip text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- Name: Report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Report" (
    id text NOT NULL,
    "reporterId" text,
    "reportedId" text,
    "reportedType" text NOT NULL,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "moderatorId" text,
    "moderatorNote" text,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Report" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "supplierId" text NOT NULL,
    "productId" text,
    "serviceId" text,
    "orderId" text,
    rating integer NOT NULL,
    title text,
    comment text,
    images text[],
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "moderatorId" text,
    "moderatedAt" timestamp(3) without time zone,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "verifiedPurchase" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: ReviewLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReviewLike" (
    id text NOT NULL,
    "reviewId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReviewLike" OWNER TO postgres;

--
-- Name: ReviewReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReviewReport" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "reviewId" text NOT NULL,
    "reportedBy" text NOT NULL,
    reason public."ReviewReportReason" NOT NULL,
    description text,
    status public."ReviewReportStatus" DEFAULT 'PENDING'::public."ReviewReportStatus" NOT NULL,
    "resolvedBy" text,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."ReviewReport" OWNER TO postgres;

--
-- Name: ReviewResponse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReviewResponse" (
    id text NOT NULL,
    "reviewId" text NOT NULL,
    "userId" text NOT NULL,
    "supplierId" text NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ReviewResponse" OWNER TO postgres;

--
-- Name: SearchLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SearchLog" (
    id text NOT NULL,
    term text NOT NULL,
    count integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SearchLog" OWNER TO postgres;

--
-- Name: SellerReview; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerReview" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "supplierId" text NOT NULL,
    "orderId" text NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text,
    images text[] DEFAULT '{}'::text[],
    status public."ReviewStatus" DEFAULT 'APPROVED'::public."ReviewStatus" NOT NULL,
    "verifiedPurchase" boolean DEFAULT false NOT NULL,
    "moderatorId" text,
    "moderatedAt" timestamp(3) without time zone,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SellerReview" OWNER TO postgres;

--
-- Name: SellerReviewLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerReviewLike" (
    id text NOT NULL,
    "sellerReviewId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SellerReviewLike" OWNER TO postgres;

--
-- Name: SellerReviewReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerReviewReport" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "sellerReviewId" text NOT NULL,
    "reportedBy" text NOT NULL,
    reason public."ReviewReportReason" NOT NULL,
    description text,
    status public."ReviewReportStatus" DEFAULT 'PENDING'::public."ReviewReportStatus" NOT NULL,
    "resolvedBy" text,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."SellerReviewReport" OWNER TO postgres;

--
-- Name: SellerReviewResponse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerReviewResponse" (
    id text NOT NULL,
    "sellerReviewId" text NOT NULL,
    "userId" text NOT NULL,
    "supplierId" text NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SellerReviewResponse" OWNER TO postgres;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "shortDescription" text,
    price numeric(12,2),
    "priceType" text DEFAULT 'FIXED'::text NOT NULL,
    "serviceArea" text,
    duration integer,
    "durationUnit" text DEFAULT 'hours'::text NOT NULL,
    images text[],
    tags text[],
    specifications jsonb,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Service" OWNER TO postgres;

--
-- Name: SessionLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SessionLog" (
    id text NOT NULL,
    "userId" text,
    "userAgent" text,
    device text,
    browser text,
    "pagePath" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastActivity" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sessionId" text
);


ALTER TABLE public."SessionLog" OWNER TO postgres;

--
-- Name: SupplierFoundationHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupplierFoundationHistory" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "foundationDate" date NOT NULL,
    "recordedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SupplierFoundationHistory" OWNER TO postgres;

--
-- Name: SupplierProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupplierProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "companyName" text NOT NULL,
    "tradingName" text,
    document text NOT NULL,
    "stateRegistration" text,
    "municipalRegistration" text,
    description text,
    "logoUrl" text,
    "bannerUrl" text,
    website text,
    phone text NOT NULL,
    whatsapp text,
    email text NOT NULL,
    status public."SupplierStatus" DEFAULT 'PENDING'::public."SupplierStatus" NOT NULL,
    "statusReason" text,
    "approvedAt" timestamp(3) without time zone,
    "reviewedBy" text,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "totalProducts" integer DEFAULT 0 NOT NULL,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "totalSales" numeric(12,2) DEFAULT 0 NOT NULL,
    "foundedYear" integer,
    "employeesCount" integer,
    "businessHours" jsonb,
    "deliveryInfo" jsonb,
    certifications text[],
    badges text[],
    "socialNetworks" jsonb,
    featured boolean DEFAULT false NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "sellerRating" numeric(3,2) DEFAULT 0 NOT NULL,
    "sellerTotalReviews" integer DEFAULT 0 NOT NULL,
    tier public."SupplierTier" DEFAULT 'BASIC'::public."SupplierTier" NOT NULL,
    "profileTheme" text DEFAULT 'A'::text NOT NULL
);


ALTER TABLE public."SupplierProfile" OWNER TO postgres;

--
-- Name: SupportAttachment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportAttachment" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    type public."SupportAttachmentType" NOT NULL,
    "fileName" text NOT NULL,
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    url text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SupportAttachment" OWNER TO postgres;

--
-- Name: SupportCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportCategory" (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."SupportCategory" OWNER TO postgres;

--
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportTicket" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "categoryId" text NOT NULL,
    "typeId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status public."SupportTicketStatus" DEFAULT 'OPEN'::public."SupportTicketStatus" NOT NULL,
    "pageUrl" text,
    browser text,
    os text,
    device text,
    "appVersion" text,
    "adminResponse" text,
    "respondedBy" text,
    "respondedAt" timestamp(3) without time zone,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."SupportTicket" OWNER TO postgres;

--
-- Name: SupportTicketNote; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportTicketNote" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "adminId" text NOT NULL,
    note text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SupportTicketNote" OWNER TO postgres;

--
-- Name: SupportTicketStatusHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportTicketStatusHistory" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    status public."SupportTicketStatus" NOT NULL,
    "changedBy" text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SupportTicketStatusHistory" OWNER TO postgres;

--
-- Name: SupportType; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportType" (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SupportType" OWNER TO postgres;

--
-- Name: SystemConfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemConfig" (
    id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemConfig" OWNER TO postgres;

--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSetting" (
    key text NOT NULL,
    value jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "updatedBy" text
);


ALTER TABLE public."SystemSetting" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    document text NOT NULL,
    phone text,
    "avatarUrl" text,
    role public."UserRole" DEFAULT 'CUSTOMER'::public."UserRole" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "emailConfirmationToken" text,
    "resetPasswordToken" text,
    "resetPasswordExpires" timestamp(3) without time zone,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorSecret" text,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "emailConfirmationExpires" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: WorkingHours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkingHours" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "openTime" text NOT NULL,
    "closeTime" text NOT NULL,
    "isOpen" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkingHours" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Address" (id, "userId", "supplierId", "zipCode", street, number, complement, neighborhood, city, state, country, latitude, longitude, "isMain", label, "createdAt", "updatedAt") FROM stdin;
d1ffb3de-e2e1-4a23-8f93-836a604513ba	a7b62382-7810-442b-a7c2-864c58f947ea	\N	13960-000	blabla	132	dadad	asdasda	dadasd	AS	Brasil	\N	\N	t	fazenda	2026-08-25 23:52:02.212	2026-08-25 23:52:02.212
ec09bfa1-e72f-4b50-b781-28ffd9cfdc1e	d5979256-776b-4d45-9f67-5f63b34fc20e	\N	1212121212	dadadas	123	dadsad	dadasd	dadad	AS	Brasil	\N	\N	t	fsafsadas	2026-08-26 01:20:32.911	2026-08-26 01:20:32.911
b38144e7-8d1c-43cd-a4d9-104cc1c12593	\N	3f27a882-9f1b-4714-b5b7-45af0f8a0101	13960000	rua careca	0	igreja	Bairro Moraes	Socorro	SP	Brasil	-22.6848410	-46.5074160	t	\N	2026-08-26 21:57:07.272	2026-08-27 01:08:56.148
f269a01e-86ae-4797-85c1-650f7a235bec	73e05d53-965d-4605-91c8-20abadda6626	\N	12900-000	dadas	123	sadad	opa	asdad	SP	Brasil	\N	\N	t	Fazenda	2026-09-05 21:31:06.883	2026-09-05 21:31:06.883
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", action, entity, "entityId", "oldValue", "newValue", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Banner" (id, "supplierId", title, subtitle, description, "imageUrl", "linkUrl", "position", "order", active, "startDate", "endDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "userId", "createdAt", "updatedAt") FROM stdin;
efc7342e-9bb3-47dd-a11a-93691d6dd83b	73e05d53-965d-4605-91c8-20abadda6626	2026-08-24 21:43:32.062	2026-08-24 21:43:32.062
89119e6a-b75d-475c-bcd1-79c7361a71ae	a7b62382-7810-442b-a7c2-864c58f947ea	2026-08-24 21:43:57.457	2026-08-24 21:43:57.457
51ea2ab2-ce2a-4e12-80f0-ac7eb5ff1404	f8a49a62-61cf-4b16-8eea-8ab4d5b3a291	2026-08-24 21:44:20.143	2026-08-24 21:44:20.143
5e30a125-94bf-4c23-b0b7-a554c8aa0a96	d5979256-776b-4d45-9f67-5f63b34fc20e	2026-08-26 01:19:48.024	2026-08-26 01:19:48.024
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "cartId", "productId", quantity, price, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, description, "iconUrl", "imageUrl", "parentId", "order", active, "supplierId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
e80b73c8-178f-4375-9041-787048bf6da1	Insumos Agrícolas	insumos-agricolas	Fertilizantes, adubos, sementes, mudas, corretivos, bioinsumos e produtos para nutrição e proteção das culturas.	\N	\N	\N	1	t	\N	2026-09-05 20:28:47.827	2026-09-05 20:28:47.827	\N
6ee4665d-7157-4dbb-bd50-ca46fa58ec6d	Máquinas e Implementos	maquinas-e-implementos	Tratores, colheitadeiras, plantadeiras, pulverizadores, implementos, peças e acessórios para mecanização rural.	\N	\N	\N	2	t	\N	2026-09-05 20:31:28.038	2026-09-05 20:31:28.038	\N
36f1c1f1-5293-4d26-95bd-14fc9ab0a89e	Equipamentos Rurais	equipamentos-rurais	Irrigação, bombas, motores, geradores, equipamentos de ordenha, medição, manejo e instalações rurais.	\N	\N	\N	3	t	\N	2026-09-05 18:27:05.773	2026-09-05 18:27:05.773	\N
eff7a86c-57f0-4881-a3cb-6a68c5a08276	Cultivo e Produção	cultivo-e-producao	Culturas, mudas, produtos de colheita, grãos, frutas, hortaliças e materiais para produção agrícola.	\N	\N	\N	4	t	\N	2026-09-05 18:27:05.773	2026-09-05 18:27:05.773	\N
eeacdaee-a50d-43e1-a9f2-270b3c0b66a7	Pecuária	pecuaria	Animais de produção, produtos pecuários e itens relacionados à criação e manejo animal.	\N	\N	\N	5	t	\N	2026-08-24 21:30:48.922	2026-08-24 21:30:48.922	\N
e0f8ee59-9cd8-47f5-8dca-55160c4b5135	Produtos para Animais	produtos-para-animais	Rações, suplementos, medicamentos, vacinas, equipamentos e acessórios para alimentação, saúde e manejo animal.	\N	\N	\N	6	t	\N	2026-09-05 18:27:05.773	2026-09-05 18:27:05.773	\N
d1bcbfc5-62f8-4353-8558-f04a8b8a82bf	Apicultura	apicultura	Colmeias, equipamentos, vestimentas e produtos apícolas como mel, própolis, cera e geleia real.	\N	\N	\N	7	t	\N	2026-09-05 18:27:05.773	2026-09-05 18:27:05.773	\N
e0d376c0-c924-4bfc-9d3c-6ce0c3fa238d	Ferramentas e Equipamentos	ferramentas-e-equipamentos	Ferramentas manuais, elétricas, mecânicas, hidráulicas, pneumáticas e equipamentos de oficina e manutenção.	\N	\N	\N	8	t	\N	2026-09-05 18:27:05.773	2026-09-05 18:27:05.773	\N
9d515745-59ab-4f49-bc67-cbffd19f2473	Infraestrutura Rural	infraestrutura-rural	Galpões, currais, cercas, estufas, silos, armazenamento, pós-colheita e materiais de construção rural.	\N	\N	\N	9	t	\N	2026-09-05 18:27:05.773	2026-09-05 18:27:05.773	\N
9f3790de-8dfe-458c-b79b-cb1179ae546f	EPI e Vestuário	epi-e-vestuario	Luvas, botas, óculos, capacetes, respiradores, roupas de proteção e vestuário para trabalhadores rurais.	\N	\N	\N	10	t	\N	2026-09-05 18:27:05.773	2026-09-05 18:27:05.773	\N
bee204e8-247b-4cc1-984d-daaf7d625f5e	Tecnologia Agrícola	tecnologia-agricola	Softwares, drones, GPS, sensores, automação, IoT, monitoramento, telemetria e agricultura de precisão.	\N	\N	\N	11	t	\N	2026-09-05 18:27:05.773	2026-09-05 18:27:05.773	\N
d0dba06e-7a29-404c-8feb-49d299cea7b0	Serviços	servicos	Serviços agrícolas, pecuários, de máquinas, manutenção, transporte, consultoria, construção e outros.	\N	\N	\N	12	t	\N	2026-09-05 20:33:54.414	2026-09-05 20:33:54.414	\N
\.


--
-- Data for Name: ChatSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatSettings" (id, "supplierId", "autoReply", "autoReplyMessage", "workingHoursOnly", "responseTime", "welcomeMessage", "createdAt", "updatedAt", online) FROM stdin;
f803f645-169c-43a5-8602-fe8136791259	3f27a882-9f1b-4714-b5b7-45af0f8a0101	t	Obrigado pelo contato! Responderemos em breve.	f	\N	Olá! Bem-vindo(a) à nossa loja. Como podemos ajudar?	2026-08-26 21:39:10.612	2026-08-27 01:08:56.23	t
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Conversation" (id, "supplierId", "customerId", "orderId", subject, "isActive", "isBlocked", "blockedBy", "createdAt", "updatedAt") FROM stdin;
4ecd386b-f406-4780-a4e8-41d4e5df6b44	056dbeed-7217-46bb-96e2-6ae0ba3043fb	73e05d53-965d-4605-91c8-20abadda6626	\N	ff	t	f	\N	2026-08-27 01:05:35.581	2026-08-27 01:05:35.609
e3626245-2d99-4ff2-9045-7209c608f82d	3f27a882-9f1b-4714-b5b7-45af0f8a0101	73e05d53-965d-4605-91c8-20abadda6626	\N	Chat - fornecedorTeste	t	f	\N	2026-08-26 21:39:32.411	2026-08-27 01:06:13.388
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coupon" (id, "supplierId", "productId", code, description, "discountType", "discountValue", "minOrderValue", "maxUses", "usedCount", "maxUsesPerUser", "startDate", "endDate", active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CustomerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CustomerProfile" (id, "userId", "birthDate", gender, "receivePromotions", notes, "totalOrders", "totalSpent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Favorite" (id, "userId", "supplierId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Message" (id, "conversationId", "senderId", "orderId", type, content, attachments, "readAt", "createdAt") FROM stdin;
7d94923e-1419-45d0-8a45-b25251613602	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	Olá! Tenho interesse no produto produto_contato. Código: PROD-21894EEEDC. Preço anunciado: R$ 200,00. Link: http://localhost:3000/products/produtocontato-1787787675538	{}	\N	2026-08-27 00:00:11.743
b529aae6-c287-4c5b-90b8-c4cb477a082b	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	Olá! Tenho interesse no produto produto_contato. Código: PROD-21894EEEDC. Preço anunciado: R$ 200,00. Link: http://localhost:3000/products/produtocontato-1787787675538	{}	\N	2026-08-27 00:00:37.021
37b67048-3b62-471d-8c7d-db9dc9847ff3	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	Olá! Tenho interesse no produto produto_contato. Código: PROD-21894EEEDC. Preço anunciado: R$ 200,00. Link: http://localhost:3000/products/produtocontato-1787787675538	{}	\N	2026-08-27 00:00:52.55
37fdbfe0-c68e-49fb-b84b-9d573787dc7a	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	Olá! Tenho interesse no produto produto_contato. Código: PROD-21894EEEDC. Preço anunciado: R$ 200,00. Link: http://localhost:3000/products/produtocontato-1787787675538	{}	\N	2026-08-27 01:05:03.149
a55efc47-e746-4897-81b9-0adb64e1a5ed	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	oi	{}	\N	2026-08-27 01:05:13.542
bf4974fc-271c-4a96-ae95-194610429534	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	oi	{}	\N	2026-08-27 01:05:13.556
5569e925-4536-46bf-9265-599465af7d2a	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	oi	{}	\N	2026-08-27 01:05:20.467
2a6dd25d-fe3d-4466-b813-b8f8f798064f	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	oi	{}	\N	2026-08-27 01:05:20.474
842e07b9-2813-41e4-a8d6-ed327dc71a1c	4ecd386b-f406-4780-a4e8-41d4e5df6b44	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	ff	{}	\N	2026-08-27 01:05:35.605
cf7a92f6-8a88-41f0-b1e0-1bb0d111b87f	e3626245-2d99-4ff2-9045-7209c608f82d	73e05d53-965d-4605-91c8-20abadda6626	\N	TEXT	Olá! Tenho interesse no produto produto_contato. Código: PROD-21894EEEDC. Preço anunciado: R$ 200,00. Link: http://localhost:3000/products/produtocontato-1787787675538	{}	\N	2026-08-27 01:06:13.386
ed437402-39ac-4e19-9756-7e64a1a36b8f	e3626245-2d99-4ff2-9045-7209c608f82d	a7b62382-7810-442b-a7c2-864c58f947ea	\N	TEXT	oi	{}	2026-08-27 01:06:25.285	2026-08-27 01:06:08.71
c9ed73bc-3c3c-4415-8f64-533c46efb8c2	e3626245-2d99-4ff2-9045-7209c608f82d	a7b62382-7810-442b-a7c2-864c58f947ea	\N	TEXT	oi	{}	2026-08-27 01:06:25.285	2026-08-27 01:06:08.725
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", type, title, message, data, read, "readAt", "createdAt") FROM stdin;
c76ca425-ccd9-457f-86d3-9e8077330cea	d5979256-776b-4d45-9f67-5f63b34fc20e	ORDER_CREATED	Pedido criado	Seu pedido #ABF-1787708452467-L10I foi criado com sucesso.	{"orderId": "123b39dc-3297-4853-9066-1ee4151bd085", "orderNumber": "ABF-1787708452467-L10I"}	f	\N	2026-08-26 01:40:52.55
b083cbe2-9f50-44f2-b5e0-e4967823822a	d5979256-776b-4d45-9f67-5f63b34fc20e	ORDER_UPDATED	Pedido entregue!	Seu pedido #ABF-1787708452467-L10I foi marcado como entregue. Confirme o recebimento para avaliar o produto e o fornecedor.	{"url": "/orders", "action": "go_to_orders", "orderId": "123b39dc-3297-4853-9066-1ee4151bd085", "orderNumber": "ABF-1787708452467-L10I"}	f	\N	2026-08-26 01:41:15.282
a6ab3a13-4181-4fb3-ba70-38bc1570103c	95258da1-09b2-4b93-8a94-ec7d635937e2	ORDER_CREATED	Pedido criado	Seu pedido #ABF-1787621537585-0QGY foi criado com sucesso.	{"orderId": "e0b6425b-11df-4f0c-968a-54438e76b650", "orderNumber": "ABF-1787621537585-0QGY"}	f	\N	2026-08-25 01:32:17.61
071e48e5-3b3a-4375-9f16-a123d0b1894d	eac5477d-f6f0-44d0-a18b-04852e6aecd9	ORDER_CREATED	Novo pedido recebido	Você recebeu um novo pedido #ABF-1787621910913-MHTS de R$ 219,80.	{"orderId": "d6177543-3795-41c6-8bb5-2e5371dee1e1", "orderNumber": "ABF-1787621910913-MHTS"}	f	\N	2026-08-25 01:38:30.964
4036c52c-184c-4452-9a2d-2c2830d374d8	95258da1-09b2-4b93-8a94-ec7d635937e2	ORDER_CREATED	Pedido criado	Seu pedido #ABF-1787621910913-MHTS foi criado com sucesso.	{"orderId": "d6177543-3795-41c6-8bb5-2e5371dee1e1", "orderNumber": "ABF-1787621910913-MHTS"}	f	\N	2026-08-25 01:38:30.967
5db4296f-59f0-44a2-aaca-9165783cc381	f8bddf0b-6ed7-4b47-9bbf-ee217859ba40	MESSAGE_RECEIVED	Nova mensagem de cliente_teste	ff	{"conversationId": "4ecd386b-f406-4780-a4e8-41d4e5df6b44"}	f	\N	2026-08-27 01:05:35.615
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "orderNumber", "customerId", "supplierId", status, "paymentStatus", "paymentMethod", "paymentId", subtotal, discount, "shippingCost", total, "shippingType", "shippingData", "addressId", "trackingCode", "estimatedDelivery", "deliveredAt", notes, "invoiceUrl", "invoiceNumber", "cancellationReason", "refundAmount", "refundedAt", "createdAt", "updatedAt", "deletedAt", "confirmedDeliveryAt") FROM stdin;
6c1514dc-3cae-43fb-85e8-6464fbfcfc30	ABF-1787609188640-SIX1	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-24 22:06:28.642	2026-08-24 22:07:44.815	\N	2026-08-24 22:07:44.809
f6788a97-0d1d-4967-9c7c-11ac3f2479dc	ABF-1787608558746-WI84	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-24 21:55:58.747	2026-08-24 22:11:26.097	\N	2026-08-24 22:11:26.097
6ffc5e9f-212b-4ea8-90a0-fb0dbf832d48	ABF-1787693785344-Y9A3	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 21:36:25.36	2026-08-25 21:36:42.963	\N	2026-08-25 21:36:42.959
1a080a4c-a617-4ab1-a702-74ae90733539	ABF-1787608535567-94B9	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-24 21:55:35.567	2026-08-25 01:09:44.686	\N	2026-08-25 01:08:52.138
96f01ad7-9ec4-443f-b436-34fd9e90c7af	ABF-1787608527751-AE08	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-24 21:55:27.759	2026-08-25 01:15:56.613	\N	2026-08-25 01:15:56.606
2770e610-45e9-46db-88e0-dcefe4905257	ABF-1787620713295-BGGB	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 01:18:33.318	2026-08-25 01:22:34.813	\N	2026-08-25 01:22:34.812
19af8f7f-3663-40f3-bf48-5353a01a6e72	ABF-1787620935243-9GSX	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 01:22:15.244	2026-08-25 01:24:21.695	\N	2026-08-25 01:24:21.694
e0b6425b-11df-4f0c-968a-54438e76b650	ABF-1787621537585-0QGY	95258da1-09b2-4b93-8a94-ec7d635937e2	3f27a882-9f1b-4714-b5b7-45af0f8a0101	PENDING	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 01:32:17.587	2026-08-25 01:32:17.587	\N	\N
d6177543-3795-41c6-8bb5-2e5371dee1e1	ABF-1787621910913-MHTS	95258da1-09b2-4b93-8a94-ec7d635937e2	962de021-8d82-4624-a482-85cc8f7a4fe5	DELIVERED	PENDING	CREDIT_CARD	\N	189.90	0.00	29.90	219.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 01:38:30.942	2026-08-25 01:42:05.513	\N	2026-08-25 01:42:05.511
23a8ea3a-e27d-422d-9d97-9556f2b4f330	ABF-1787699944153-A19X	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 23:19:04.174	2026-08-25 23:19:25.173	\N	2026-08-25 23:19:25.169
894d5cc4-928f-41a5-bef8-7dc256f1f52f	ABF-1787693959038-BJNP	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 21:39:19.04	2026-08-25 21:44:54.089	\N	2026-08-25 21:44:54.083
a01da090-7c48-432b-90bc-3ed8b490fff9	ABF-1787694332340-98RA	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 21:45:32.359	2026-08-25 21:46:59.415	\N	2026-08-25 21:46:59.414
8d4ec2a8-fb08-4a9a-a98f-91f27c69537a	ABF-1787707449697-Q8WB	a7b62382-7810-442b-a7c2-864c58f947ea	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	222.00	0.00	29.90	251.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-26 01:24:09.716	2026-08-26 01:24:44.792	\N	2026-08-26 01:24:44.787
ad4d7003-6278-4611-9d4f-274eaf8b6693	ABF-1787695401293-5OKA	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 22:03:21.295	2026-08-25 22:03:45.669	\N	2026-08-25 22:03:45.668
f9cf3dbb-d96d-460b-a3dc-6fa67e590ef5	ABF-1787696141687-AQA9	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 22:15:41.703	2026-08-25 22:16:03.346	\N	2026-08-25 22:16:03.34
0cdc906f-8a74-4884-8571-791bd1764c61	ABF-1787701975618-JVE1	a7b62382-7810-442b-a7c2-864c58f947ea	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 23:52:55.634	2026-08-25 23:54:08.467	\N	2026-08-25 23:54:08.461
6576a771-1596-47a3-ab63-952187557d20	ABF-1787697754132-K6R5	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-25 22:42:34.156	2026-08-25 22:43:01.259	\N	2026-08-25 22:43:01.253
efa8f37c-44fd-4c52-bdf6-ce94d89dce97	ABF-1787705877518-JHQL	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	222.00	0.00	29.90	251.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-26 00:57:57.535	2026-08-26 00:58:18.897	\N	2026-08-26 00:58:18.891
3e98b63d-345e-49b1-ba0b-c076f59f3311	ABF-1787707254305-YM3J	d5979256-776b-4d45-9f67-5f63b34fc20e	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	222.00	0.00	29.90	251.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-26 01:20:54.326	2026-08-26 01:21:20.019	\N	2026-08-26 01:21:20.014
123b39dc-3297-4853-9066-1ee4151bd085	ABF-1787708452467-L10I	d5979256-776b-4d45-9f67-5f63b34fc20e	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-26 01:40:52.485	2026-08-26 01:41:25.961	\N	2026-08-26 01:41:25.952
1d00e134-bd24-4c4a-a4a0-23dd001d4bf8	ABF-1787750012423-7ZPM	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	DELIVERED	PENDING	CREDIT_CARD	\N	999.00	0.00	0.00	999.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-26 13:13:32.441	2026-08-26 13:14:06.161	\N	2026-08-26 13:14:06.151
504c37ff-12e5-421b-b074-51940a4bcf67	ABF-1787780028326-MW0A	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	PENDING	PENDING	CREDIT_CARD	\N	222.00	0.00	29.90	251.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-26 21:33:48.355	2026-08-26 21:33:48.519	\N	\N
\.


--
-- Data for Name: OrderCoupon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderCoupon" (id, "orderId", "couponId", discount, "createdAt") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, "unitPrice", "totalPrice", "createdAt", "confirmedDeliveryAt") FROM stdin;
72bd8afc-e86b-4350-966f-f4a0d503a5f3	6c1514dc-3cae-43fb-85e8-6464fbfcfc30	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-24 22:06:28.642	2026-08-24 22:07:44.809
c11aec39-eb54-4725-a013-4936e6e7325a	f6788a97-0d1d-4967-9c7c-11ac3f2479dc	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-24 21:55:58.747	2026-08-24 22:11:26.097
6149c085-afbc-490e-9cfb-b9026846793a	1a080a4c-a617-4ab1-a702-74ae90733539	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-24 21:55:35.567	2026-08-25 01:08:52.138
2c6829a8-2a9b-4b0a-b6f7-925984aa01ab	96f01ad7-9ec4-443f-b436-34fd9e90c7af	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-24 21:55:27.759	2026-08-25 01:15:56.606
dbca4a5f-e743-4f71-a99b-4f68278170c6	2770e610-45e9-46db-88e0-dcefe4905257	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 01:18:33.318	2026-08-25 01:22:34.812
771462ec-32ab-4028-a375-814d29b90658	19af8f7f-3663-40f3-bf48-5353a01a6e72	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 01:22:15.244	2026-08-25 01:24:21.694
5189e24e-a16a-4ed7-8d21-f08a20441a79	e0b6425b-11df-4f0c-968a-54438e76b650	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 01:32:17.587	\N
9bae7826-3d39-4fc9-a048-4f7762d9686b	d6177543-3795-41c6-8bb5-2e5371dee1e1	99d8a823-aa41-435c-8a70-0a9fc933c38b	1	189.90	189.90	2026-08-25 01:38:30.942	2026-08-25 01:42:05.511
c28f64f7-99ee-4c5e-ade8-8fe8a14dd464	6ffc5e9f-212b-4ea8-90a0-fb0dbf832d48	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 21:36:25.36	2026-08-25 21:36:42.959
bcc32fbb-4514-405f-a96b-e5415d07de51	894d5cc4-928f-41a5-bef8-7dc256f1f52f	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 21:39:19.04	2026-08-25 21:44:54.083
d275583a-55fb-45d5-82b9-220dfa58d681	a01da090-7c48-432b-90bc-3ed8b490fff9	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 21:45:32.359	2026-08-25 21:46:59.414
87e85d67-c909-45e2-99c1-e6cfefdc64b0	ad4d7003-6278-4611-9d4f-274eaf8b6693	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 22:03:21.295	2026-08-25 22:03:45.668
b83adc18-e2e9-4b90-817c-4b3f3eb2e820	f9cf3dbb-d96d-460b-a3dc-6fa67e590ef5	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 22:15:41.703	2026-08-25 22:16:03.34
9bc429f4-4df0-4a3a-88c3-ce58ec193b4a	6576a771-1596-47a3-ab63-952187557d20	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 22:42:34.156	2026-08-25 22:43:01.253
a9a38d05-c5e5-4f00-93f5-f889905d6b2b	23a8ea3a-e27d-422d-9d97-9556f2b4f330	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 23:19:04.174	2026-08-25 23:19:25.169
6551f937-d302-46e6-ba8e-9c3def6ba014	0cdc906f-8a74-4884-8571-791bd1764c61	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-25 23:52:55.634	2026-08-25 23:54:08.461
380fe3b5-1f46-4c61-aad9-31612118639e	efa8f37c-44fd-4c52-bdf6-ce94d89dce97	72842acc-9b2e-42dc-9a89-7c4003f81ed5	1	222.00	222.00	2026-08-26 00:57:57.535	2026-08-26 00:58:18.891
4a8d932f-257f-4690-8746-d65036fe6927	3e98b63d-345e-49b1-ba0b-c076f59f3311	72842acc-9b2e-42dc-9a89-7c4003f81ed5	1	222.00	222.00	2026-08-26 01:20:54.326	2026-08-26 01:21:20.014
30f6e157-2c41-4a68-8ede-6b60ae131d9e	8d4ec2a8-fb08-4a9a-a98f-91f27c69537a	72842acc-9b2e-42dc-9a89-7c4003f81ed5	1	222.00	222.00	2026-08-26 01:24:09.716	2026-08-26 01:24:44.787
e9af56e7-4449-463c-9617-8025b2796e9d	123b39dc-3297-4853-9066-1ee4151bd085	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-26 01:40:52.485	2026-08-26 01:41:25.952
e37a8db9-b9bc-4278-9465-60a7e4299dc2	1d00e134-bd24-4c4a-a4a0-23dd001d4bf8	d03b8e36-9189-4ee0-a9cd-2d42afc90358	1	999.00	999.00	2026-08-26 13:13:32.441	2026-08-26 13:14:06.151
473312bc-a02b-49b2-aacb-f517145b2323	504c37ff-12e5-421b-b074-51940a4bcf67	72842acc-9b2e-42dc-9a89-7c4003f81ed5	1	222.00	222.00	2026-08-26 21:33:48.355	\N
\.


--
-- Data for Name: OrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderStatusHistory" (id, "orderId", status, "changedBy", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "orderId", amount, method, status, gateway, "gatewayId", "gatewayResponse", "pixCode", "pixQrCode", "boletoUrl", "boletoBarCode", "cardLastDigits", "cardBrand", installments, "paidAt", "refundedAt", "createdAt", "updatedAt", "idempotencyKey") FROM stdin;
2a25018a-e6b9-4dba-82f3-da0808c9a61a	6c1514dc-3cae-43fb-85e8-6464fbfcfc30	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787609188896	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-24 22:06:28.886	2026-08-24 22:06:28.905	212361d6-9380-487f-ad89-f8dd266e7a76
f6932f41-a835-4a59-a0ba-20676198ac13	2770e610-45e9-46db-88e0-dcefe4905257	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787620713462	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 01:18:33.452	2026-08-25 01:18:33.467	f2587b38-692c-4f06-bd19-ae500367dedb
4c05dfce-b58d-4df5-a795-0e7bf648c2cb	19af8f7f-3663-40f3-bf48-5353a01a6e72	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787620935299	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 01:22:15.292	2026-08-25 01:22:15.3	c8fbc0b6-848f-4c93-b19b-00a0c4a3f9c1
ba88fca6-da9a-4263-9d21-0d13c3f8cd47	6ffc5e9f-212b-4ea8-90a0-fb0dbf832d48	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787693785473	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 21:36:25.466	2026-08-25 21:36:25.477	e0cccde6-eaaa-4508-9b8a-c9d16ba11d55
f89723c7-b291-472a-815b-65f2a3bce365	894d5cc4-928f-41a5-bef8-7dc256f1f52f	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787693959093	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 21:39:19.088	2026-08-25 21:39:19.094	2480d489-6a2b-457e-864e-ae9adc4bb806
5bde3b00-500a-42bb-b113-8fd7f8710a08	a01da090-7c48-432b-90bc-3ed8b490fff9	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787694332432	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 21:45:32.425	2026-08-25 21:45:32.434	db5e6a0a-b31e-4b4c-8e08-946b5d98b746
ac610f72-b13f-4171-a73e-f714375ca54d	ad4d7003-6278-4611-9d4f-274eaf8b6693	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787695401396	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 22:03:21.385	2026-08-25 22:03:21.399	b16c3fbe-c733-414b-966a-a3e3e5067389
ce448359-0ff6-4ad6-bbef-fc4d69b17fe2	f9cf3dbb-d96d-460b-a3dc-6fa67e590ef5	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787696141815	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 22:15:41.807	2026-08-25 22:15:41.819	4b24043a-9f4a-48fb-8332-447575e99185
133375ca-1301-4bcc-ad95-496c44f5eb6d	6576a771-1596-47a3-ab63-952187557d20	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787697754312	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 22:42:34.301	2026-08-25 22:42:34.324	053f4125-483b-4cfc-9c2d-76e3cb1082df
9e4fd49d-34ea-4d39-815e-774f36840278	23a8ea3a-e27d-422d-9d97-9556f2b4f330	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787699944263	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 23:19:04.254	2026-08-25 23:19:04.27	39773ab7-db7e-4bdf-875e-170f6931a8b8
2f90a177-2566-421e-8f31-af70f26c60fe	0cdc906f-8a74-4884-8571-791bd1764c61	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787701975900	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-25 23:52:55.888	2026-08-25 23:52:55.906	4cfd682d-91f5-4e6e-80fd-822c2d6e1f1c
9c8df287-35e9-4b91-aac5-1f2800fb36d5	efa8f37c-44fd-4c52-bdf6-ce94d89dce97	251.90	CREDIT_CARD	PENDING	MOCK	mock-payment-1787705877637	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-26 00:57:57.63	2026-08-26 00:57:57.641	4614d915-11a2-4f66-93af-a9eda864c37a
482d0354-536c-449d-93da-0ae1c12a9182	3e98b63d-345e-49b1-ba0b-c076f59f3311	251.90	CREDIT_CARD	PENDING	MOCK	mock-payment-1787707254586	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-26 01:20:54.579	2026-08-26 01:20:54.589	c81e1bb1-8328-4b5a-9bd8-74d9c4c68171
1ae68f91-7771-46c8-9436-95e61ae37840	8d4ec2a8-fb08-4a9a-a98f-91f27c69537a	251.90	CREDIT_CARD	PENDING	MOCK	mock-payment-1787707449829	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-26 01:24:09.822	2026-08-26 01:24:09.833	67432a80-527a-47c3-90c1-4ba9820ccc5c
61af6bff-7f17-437c-b94b-25f6bd43f53b	123b39dc-3297-4853-9066-1ee4151bd085	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787708452625	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-26 01:40:52.618	2026-08-26 01:40:52.629	4778c8ff-60b1-4a0e-b012-28a578cdc4a2
517069c1-8242-439e-a9c5-02e0a80cbf30	1d00e134-bd24-4c4a-a4a0-23dd001d4bf8	999.00	CREDIT_CARD	PENDING	MOCK	mock-payment-1787750012563	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-26 13:13:32.555	2026-08-26 13:13:32.567	b3ef6212-fce1-4e09-b79f-5649755fb3d0
30d2a133-1130-4249-9d61-b620570589a8	504c37ff-12e5-421b-b074-51940a4bcf67	251.90	CREDIT_CARD	PENDING	MOCK	mock-payment-1787780028514	\N	\N	\N	\N	\N	\N	visa	1	\N	\N	2026-08-26 21:33:48.506	2026-08-26 21:33:48.516	a3beced0-0b6f-4856-a9c1-9cf196128a78
\.


--
-- Data for Name: PaymentCard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentCard" (id, "userId", "paymentCustomerId", provider, "providerCardId", brand, last4, "expMonth", "expYear", "isDefault", active, "createdAt", "updatedAt") FROM stdin;
4feec014-4985-4300-84e0-30a654bdc6bf	73e05d53-965d-4605-91c8-20abadda6626	0dad0e46-1f7c-482a-9784-970e0ee38a28	MOCK	mock-card-2632	visa	2632	12	2029	t	t	2026-08-24 21:55:07.875	2026-08-24 21:55:07.875
bcbf1822-956c-4175-992d-f69053f0c756	a7b62382-7810-442b-a7c2-864c58f947ea	7204e6e6-0f4d-4dc4-aced-559e07dfeb01	MOCK	mock-card-1313	visa	1313	12	2029	t	t	2026-08-25 23:52:55.884	2026-08-25 23:52:55.884
8991726a-d913-44c8-8931-2098b8e34eb5	d5979256-776b-4d45-9f67-5f63b34fc20e	d99f39e2-c56c-454f-8ff3-58d95eb920c0	MOCK	mock-card-1313	visa	1313	12	2029	t	t	2026-08-26 01:20:54.576	2026-08-26 01:20:54.576
\.


--
-- Data for Name: PaymentCustomer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentCustomer" (id, "userId", provider, "providerCustomerId", "createdAt", "updatedAt") FROM stdin;
0dad0e46-1f7c-482a-9784-970e0ee38a28	73e05d53-965d-4605-91c8-20abadda6626	MOCK	mock-customer-clientetestecom	2026-08-24 21:55:07.861	2026-08-24 21:55:07.861
7204e6e6-0f4d-4dc4-aced-559e07dfeb01	a7b62382-7810-442b-a7c2-864c58f947ea	MOCK	mock-customer-fornecedortestecom	2026-08-25 23:52:55.866	2026-08-25 23:52:55.866
d99f39e2-c56c-454f-8ff3-58d95eb920c0	d5979256-776b-4d45-9f67-5f63b34fc20e	MOCK	mock-customer-cliente2testecom	2026-08-26 01:20:54.564	2026-08-26 01:20:54.564
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, "supplierId", "categoryId", name, slug, description, "shortDescription", brand, model, sku, barcode, unit, "minimumQuantity", price, "comparePrice", "costPrice", "discountPercent", stock, "stockAlert", weight, height, width, depth, images, videos, tags, specifications, status, "statusReason", featured, "freeShipping", "allowPickup", "preparationTime", "viewCount", "saleCount", rating, "totalReviews", "createdAt", "updatedAt", "deletedAt", "saleMode", "shippingBaseCost", "shippingAdditionalCost", "shippingFreeDistanceKm", "shippingCoverage") FROM stdin;
9fae125a-0dca-4727-b980-2ca8f7887d16	3f27a882-9f1b-4714-b5b7-45af0f8a0101	e80b73c8-178f-4375-9041-787048bf6da1	produto_direto	produtocontato-1788640127841	txt...	\N	\N	\N	\N	\N	un	1	111.00	\N	\N	0	996	5	\N	\N	\N	\N	{/products/images/521fc348-1be7-4682-8569-a4d75835996e.jpg}	\N	{}	{}	ACTIVE	\N	f	f	t	1	0	0	0.00	0	2026-09-05 20:28:47.852	2026-09-05 20:32:52.353	\N	DIRECT	0.00	0.00	0.00	ALL_BRAZIL
99d8a823-aa41-435c-8a70-0a9fc933c38b	962de021-8d82-4624-a482-85cc8f7a4fe5	e80b73c8-178f-4375-9041-787048bf6da1	Semente de Soja Transgênica RR	semente-soja-transgenica-rr	Semente de soja transgênica Roundup Ready de alta produtividade.	Semente de soja transgênica Roundup Ready de alta produtividade.	\N	\N	\N	\N	sc	1	189.90	\N	\N	0	45	5	\N	\N	\N	\N	{}	\N	{Sementes}	{"peso": "1kg", "garantia": "12 meses"}	ACTIVE	\N	f	f	t	1	0	0	5.00	1	2026-08-24 22:16:17.81	2026-08-25 23:38:53.66	\N	DIRECT	0.00	0.00	0.00	ALL_BRAZIL
6af32743-f215-433b-80ab-bd64f7ee54bd	3f27a882-9f1b-4714-b5b7-45af0f8a0101	6ee4665d-7157-4dbb-bd50-ca46fa58ec6d	Produto_contato	produtocontato-1788640350218	txt...	\N	\N	\N	\N	\N	un	1	222.00	\N	\N	0	888	5	\N	\N	\N	\N	{/products/images/a1f9035d-5ef1-429e-88d8-8c7d01fed794.jpg}	\N	{}	{}	ACTIVE	\N	f	f	t	1	0	0	0.00	0	2026-09-05 20:32:30.222	2026-09-05 20:32:30.222	\N	CONTACT_ONLY	0.00	0.00	0.00	ALL_BRAZIL
d03b8e36-9189-4ee0-a9cd-2d42afc90358	3f27a882-9f1b-4714-b5b7-45af0f8a0101	9d515745-59ab-4f49-bc67-cbffd19f2473	produto_1	produto1-1787607936046	texto...	\N	\N	\N	\N	\N	un	1	999.00	\N	\N	0	999	5	\N	\N	\N	\N	{/products/images/92b37b58-8181-4e10-9004-23b37995a5fd.jpg}	\N	{}	{}	DISCONTINUED	\N	f	f	t	1	0	0	4.00	1	2026-08-24 21:45:36.05	2026-09-05 20:23:04.652	2026-09-05 20:23:04.652	CONTACT_ONLY	0.00	0.00	0.00	ALL_BRAZIL
7fd82c61-5438-4176-bd5a-a493521be1cd	3f27a882-9f1b-4714-b5b7-45af0f8a0101	d0dba06e-7a29-404c-8feb-49d299cea7b0	produto_serviço	produtoservio-1788640434418	fsdfdsfs	\N	\N	\N	\N	\N	un	1	33.00	\N	\N	0	22	5	\N	\N	\N	\N	{/products/images/46163577-f701-48d3-ae48-a94bccb981b7.jpg}	\N	{}	{}	ACTIVE	\N	f	f	t	1	0	0	0.00	0	2026-09-05 20:33:54.421	2026-09-18 21:26:33.173	\N	CONTACT_ONLY	0.00	0.00	0.00	LOCAL_REGION
72842acc-9b2e-42dc-9a89-7c4003f81ed5	3f27a882-9f1b-4714-b5b7-45af0f8a0101	e80b73c8-178f-4375-9041-787048bf6da1	produto_2	produto2-1787705804451	texto...	\N	\N	\N	\N	\N	un	1	222.00	\N	\N	0	111	5	\N	\N	\N	\N	{/products/images/8076cac8-fe2f-4a7c-9f91-34d064e2f174.jpg}	\N	{}	{}	DISCONTINUED	\N	f	f	t	1	0	0	3.00	1	2026-08-26 00:56:44.458	2026-09-05 20:23:02.692	2026-09-05 20:23:02.688	DIRECT	0.00	0.00	0.00	ALL_BRAZIL
ce90b920-417f-4ac8-ba23-509069f2a0c8	3f27a882-9f1b-4714-b5b7-45af0f8a0101	e80b73c8-178f-4375-9041-787048bf6da1	produto_Frete	produtofrete-1788643981653	txt	\N	\N	\N	\N	\N	un	1	20.00	\N	\N	0	999	5	\N	\N	\N	\N	{}	\N	{}	{}	ACTIVE	\N	f	f	t	1	0	0	0.00	0	2026-09-05 21:33:01.659	2026-09-06 00:59:45.8	\N	DIRECT	0.00	40.00	30.00	ALL_BRAZIL
\.


--
-- Data for Name: ProductCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductCode" (id, "productId", code, "createdAt") FROM stdin;
8b740c5e013c4bfff3cf96d9bdb21aad	d03b8e36-9189-4ee0-a9cd-2d42afc90358	PROD-BC5D6DDF87	2026-08-24 21:45:36.05
6fab93bb484a4cfe534f5cca1d3a4633	99d8a823-aa41-435c-8a70-0a9fc933c38b	PROD-DE38DB9269	2026-08-24 22:16:17.81
bc2de066e06e356bb8d15b8c4bca32a0	72842acc-9b2e-42dc-9a89-7c4003f81ed5	PROD-4B944A4FD0	2026-08-26 00:56:44.458
6fc6831a-0d31-494d-9479-527e1d09a19d	9fae125a-0dca-4727-b980-2ca8f7887d16	PROD-167CE61E3A	2026-09-05 20:28:47.881
90b8b57a-54d4-45ba-9790-eebb52fe53d1	6af32743-f215-433b-80ab-bd64f7ee54bd	PROD-505A948C5E	2026-09-05 20:32:30.233
7583a9a6-860c-4934-bd06-5f163102ccf5	7fd82c61-5438-4176-bd5a-a493521be1cd	PROD-15F8EB9C92	2026-09-05 20:33:54.432
a44ae7f2-1dab-4a08-aa8d-100ec3d2b2d5	ce90b920-417f-4ac8-ba23-509069f2a0c8	PROD-7B4BC6C44D	2026-09-05 21:33:01.677
\.


--
-- Data for Name: Promotion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Promotion" (id, "productId", "supplierId", title, description, "discountType", "discountValue", "minQuantity", "maxQuantity", "startDate", "endDate", active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, "userId", jti, "tokenHash", "expiresAt", "usedAt", "revokedAt", "replacedBy", "userAgent", ip, "createdAt") FROM stdin;
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Report" (id, "reporterId", "reportedId", "reportedType", reason, description, status, "moderatorId", "moderatorNote", "resolvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, "userId", "supplierId", "productId", "serviceId", "orderId", rating, title, comment, images, status, "moderatorId", "moderatedAt", "helpfulCount", "createdAt", "updatedAt", "verifiedPurchase") FROM stdin;
d63c0750-0106-41c7-a9cd-a29e91d6f260	95258da1-09b2-4b93-8a94-ec7d635937e2	962de021-8d82-4624-a482-85cc8f7a4fe5	99d8a823-aa41-435c-8a70-0a9fc933c38b	\N	d6177543-3795-41c6-8bb5-2e5371dee1e1	4	Teste Titulo	Atualizado via teste	{}	APPROVED	\N	\N	0	2026-08-25 23:38:53.624	2026-08-26 00:38:51.1	t
6117ced9-2144-43e7-a28f-a80ba0314939	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	72842acc-9b2e-42dc-9a89-7c4003f81ed5	\N	efa8f37c-44fd-4c52-bdf6-ce94d89dce97	3		ttt	{}	APPROVED	\N	\N	2	2026-08-26 01:58:34.428	2026-08-26 21:17:42.865	t
83de7111-0087-4299-8fdf-5423330d7857	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	d03b8e36-9189-4ee0-a9cd-2d42afc90358	\N	1d00e134-bd24-4c4a-a4a0-23dd001d4bf8	4		ttt	{}	APPROVED	\N	\N	2	2026-08-26 13:14:13.473	2026-08-26 21:18:17.039	t
\.


--
-- Data for Name: ReviewLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReviewLike" (id, "reviewId", "userId", "createdAt") FROM stdin;
45a1b194-4cff-4a0e-99d5-76ab69255d3e	6117ced9-2144-43e7-a28f-a80ba0314939	73e05d53-965d-4605-91c8-20abadda6626	2026-08-26 21:17:23.33
5828f2f4-13d6-4c1d-99d6-d925461c5859	6117ced9-2144-43e7-a28f-a80ba0314939	a7b62382-7810-442b-a7c2-864c58f947ea	2026-08-26 21:17:42.863
42b590ea-200f-4629-88df-1b1facda07e3	83de7111-0087-4299-8fdf-5423330d7857	73e05d53-965d-4605-91c8-20abadda6626	2026-08-26 21:18:05.606
0b1e59d8-b024-4454-9c11-43f1df5d2d8c	83de7111-0087-4299-8fdf-5423330d7857	a7b62382-7810-442b-a7c2-864c58f947ea	2026-08-26 21:18:17.037
\.


--
-- Data for Name: ReviewReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReviewReport" (id, "reviewId", "reportedBy", reason, description, status, "resolvedBy", "resolvedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: ReviewResponse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReviewResponse" (id, "reviewId", "userId", "supplierId", comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SearchLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SearchLog" (id, term, count, "createdAt") FROM stdin;
6f3d1728-f2ad-46ea-9f91-c30f417cb2f8	direto	2	2026-09-06 01:04:40.737
363771ee-2756-4cc7-979c-fda9e7769f0b	roupa	2	2026-09-06 01:04:57.101
813d9562-4311-428f-86fe-d989156c081a	_	2	2026-09-06 01:05:08.276
7e528ea2-29f0-4b32-b4f7-7fbe8506a2f5	trator	1	2026-09-06 01:05:29.191
\.


--
-- Data for Name: SellerReview; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerReview" (id, "userId", "supplierId", "orderId", rating, title, comment, images, status, "verifiedPurchase", "moderatorId", "moderatedAt", "helpfulCount", "createdAt", "updatedAt") FROM stdin;
aed7110f-fd6d-4f9a-91a9-613523c450cc	95258da1-09b2-4b93-8a94-ec7d635937e2	962de021-8d82-4624-a482-85cc8f7a4fe5	d6177543-3795-41c6-8bb5-2e5371dee1e1	4	Fornecedor Top	Atualizado fornecedor	{}	APPROVED	t	\N	\N	0	2026-08-25 23:40:48.752	2026-08-26 00:38:59.916
5e0f8781-00b4-42b9-a85c-ea07c27559b2	73e05d53-965d-4605-91c8-20abadda6626	3f27a882-9f1b-4714-b5b7-45af0f8a0101	efa8f37c-44fd-4c52-bdf6-ce94d89dce97	5		ttt	{}	APPROVED	t	\N	\N	2	2026-08-26 01:59:16.029	2026-08-27 01:09:07.13
\.


--
-- Data for Name: SellerReviewLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerReviewLike" (id, "sellerReviewId", "userId", "createdAt") FROM stdin;
7479f37e-08fa-44c7-a0c7-b452dc5c7d49	5e0f8781-00b4-42b9-a85c-ea07c27559b2	a7b62382-7810-442b-a7c2-864c58f947ea	2026-08-26 21:18:22.048
12a15a5e-2767-487c-a97d-092cc39f73b3	5e0f8781-00b4-42b9-a85c-ea07c27559b2	73e05d53-965d-4605-91c8-20abadda6626	2026-08-27 01:09:07.129
\.


--
-- Data for Name: SellerReviewReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerReviewReport" (id, "sellerReviewId", "reportedBy", reason, description, status, "resolvedBy", "resolvedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: SellerReviewResponse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerReviewResponse" (id, "sellerReviewId", "userId", "supplierId", comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Service" (id, "supplierId", "categoryId", name, slug, description, "shortDescription", price, "priceType", "serviceArea", duration, "durationUnit", images, tags, specifications, status, featured, "viewCount", rating, "totalReviews", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: SessionLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SessionLog" (id, "userId", "userAgent", device, browser, "pagePath", "createdAt", "lastActivity", "sessionId") FROM stdin;
0d75b36a-aeef-4cd2-a398-5dcf6a1d517a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 20:55:50.53	2026-08-24 20:55:50.53	s-msjq5trg-2yy0t8o0
5d89c82f-c006-40e4-b826-486f5acfc369	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 20:55:50.541	2026-08-24 20:55:50.541	s-msjq5trg-2yy0t8o0
1aeb0ccd-39bb-4077-a79d-c3598e9a808f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 21:10:34.422	2026-08-24 21:10:34.422	s-msjq5trg-2yy0t8o0
aa16eeb9-a186-4197-9f05-1a6e7d0515c5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 21:10:34.401	2026-08-24 21:10:34.401	s-msjq5trg-2yy0t8o0
de80959c-d1cc-41f8-a59d-c0898d89d01b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 21:35:35.462	2026-08-24 21:35:35.462	s-msjq5trg-2yy0t8o0
e694da06-02cc-4902-a08e-7b244c47988a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 21:35:35.486	2026-08-24 21:35:35.486	s-msjq5trg-2yy0t8o0
61432408-be9c-47e1-9177-86988adbc249	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-24 21:35:37.361	2026-08-24 21:35:37.361	s-mst4952d-t20wzch8
388635d4-50dc-4415-b390-9c593f593602	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-24 21:35:37.365	2026-08-24 21:35:37.365	s-mst4952d-t20wzch8
c9bfa942-eba7-4657-9fc3-6712e357e64c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/	2026-08-24 21:35:37.641	2026-08-24 21:35:37.641	s-mt7p2nx9-hd2ve7zi
203d639c-016a-4b9f-9ca1-9912ce135f48	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/	2026-08-24 21:35:37.736	2026-08-24 21:35:37.736	s-mt7p2nx9-hd2ve7zi
86a5b0cf-0816-42ee-9a19-6fe4efe3e3b3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-24 21:35:37.862	2026-08-24 21:35:37.862	s-mst4952d-t20wzch8
f03500ad-5191-4317-8d3b-1e5a8a45251c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/register	2026-08-24 21:37:21.27	2026-08-24 21:37:21.27	s-msjq5trg-2yy0t8o0
ae1159f2-0707-410c-a515-a3f5781ba196	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 21:37:23.424	2026-08-24 21:37:23.424	s-msjq5trg-2yy0t8o0
11b8082d-c99c-4862-b6f2-590f693601c7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 21:37:40.131	2026-08-24 21:37:40.131	s-msjq5trg-2yy0t8o0
7aec2ac2-dd01-410c-96fd-023d22f64f77	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/suplemento-mineral-bovino	2026-08-24 21:37:49.337	2026-08-24 21:37:49.337	s-msjq5trg-2yy0t8o0
2b2db84b-c48e-42a7-8f62-5269f1635057	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-24 21:38:11.233	2026-08-24 21:38:11.233	s-msjq5trg-2yy0t8o0
4eb6efbc-55f5-4848-b373-7e43c8a59005	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-24 21:38:15.196	2026-08-24 21:38:15.196	s-msjq5trg-2yy0t8o0
e6d2f7f8-aa87-4281-bfcd-0adb60f0b163	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-24 21:38:20.842	2026-08-24 21:38:20.842	s-msjq5trg-2yy0t8o0
456f202e-c4a5-4c0e-8c06-59e59806d1fb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/profile	2026-08-24 21:38:23.69	2026-08-24 21:38:23.69	s-msjq5trg-2yy0t8o0
e1915730-6728-4cd1-8251-759b75808a9b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-24 21:38:46.102	2026-08-24 21:38:46.102	s-msjq5trg-2yy0t8o0
319200e3-dcde-4d93-bd3a-7631d5af1d57	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-24 21:38:47.725	2026-08-24 21:38:47.725	s-msjq5trg-2yy0t8o0
34905b34-0cd0-4f63-afb6-8415e1b38702	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-24 21:39:29.563	2026-08-24 21:39:29.563	s-msjq5trg-2yy0t8o0
ac5b6eeb-5f54-48a7-b2ef-0d33c9bff0b7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/profile	2026-08-24 21:39:32.328	2026-08-24 21:39:32.328	s-msjq5trg-2yy0t8o0
67af6c33-f9a7-458d-b417-396f19ae83fa	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 21:39:37.389	2026-08-24 21:39:37.389	s-msjq5trg-2yy0t8o0
41c09582-173f-40b8-afb8-ccfbf62873a7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-24 21:40:32.549	2026-08-24 21:40:32.549	s-msjq5trg-2yy0t8o0
39cccded-9a58-4768-952e-61994a418f15	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-24 21:40:35.692	2026-08-24 21:40:35.692	s-msjq5trg-2yy0t8o0
d38bde9c-94e9-4301-bdfd-79d30d34c975	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 21:41:14.753	2026-08-24 21:41:14.753	s-msjq5trg-2yy0t8o0
b54766e6-9a60-4fd5-ad58-ddd7008a1076	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 21:42:15.578	2026-08-24 21:42:15.578	s-msjq5trg-2yy0t8o0
cf4208cd-9e6d-48dd-afd2-76a61277c25a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 21:42:15.585	2026-08-24 21:42:15.585	s-msjq5trg-2yy0t8o0
3429dee8-b212-4baa-a6f0-6b489b7a527a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/register	2026-08-24 21:43:09.098	2026-08-24 21:43:09.098	s-msjq5trg-2yy0t8o0
e67036b1-35da-4438-bc4d-8d9706ebc77c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 21:43:32.21	2026-08-24 21:43:32.21	s-msjq5trg-2yy0t8o0
b741f759-43ec-4e2f-9cfe-6f6d991cdb9b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/register	2026-08-24 21:43:41.257	2026-08-24 21:43:41.257	s-mst4952d-t20wzch8
4bec748b-f050-48e4-a106-74b46ff17184	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-24 21:43:57.673	2026-08-24 21:43:57.673	s-mst4952d-t20wzch8
bbbd2a2c-9721-4b0b-bc3e-1683e3e45a91	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/auth/login	2026-08-24 21:44:02.749	2026-08-24 21:44:02.749	s-mt7p2nx9-hd2ve7zi
6f0ef9e1-c001-417c-869c-42edcaf9c067	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/	2026-08-24 21:44:22.429	2026-08-24 21:44:22.429	s-mt7p2nx9-hd2ve7zi
954ef7af-fd20-4abd-815e-05c0a15f590c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/profile	2026-08-24 21:44:25.913	2026-08-24 21:44:25.913	s-mt7p2nx9-hd2ve7zi
a9aeba5c-a1c5-4a88-ab5f-b67f73090439	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/	2026-08-24 21:44:44.148	2026-08-24 21:44:44.148	s-mt7p2nx9-hd2ve7zi
9cd0b9bf-401c-4c9a-9a9c-23c1ff45a34f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 21:44:50.525	2026-08-24 21:44:50.525	s-msjq5trg-2yy0t8o0
2d8ecfbd-120e-4d80-8441-a97adf6d665e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 21:44:50.541	2026-08-24 21:44:50.541	s-msjq5trg-2yy0t8o0
11d79545-8a4f-4dbf-bd9a-11c0d8f11fc0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/dashboard	2026-08-24 21:45:01.159	2026-08-24 21:45:01.159	s-mst4952d-t20wzch8
ef9a1a02-957a-4c8b-92c4-e007ad379d5a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-24 21:45:09.006	2026-08-24 21:45:09.006	s-mst4952d-t20wzch8
862179f8-6081-4ebd-94df-df4fa5ef620b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-24 21:45:11.448	2026-08-24 21:45:11.448	s-mst4952d-t20wzch8
c0ccb3a6-d270-4338-869d-6abf60c532a4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-24 21:45:12.369	2026-08-24 21:45:12.369	s-mst4952d-t20wzch8
cf17a3eb-378e-431f-804c-e0eb81cbadd1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-24 21:45:36.218	2026-08-24 21:45:36.218	s-mst4952d-t20wzch8
6422f3aa-3a3d-49fe-923c-6b01f4bfe527	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 21:45:38.11	2026-08-24 21:45:38.11	s-msjq5trg-2yy0t8o0
007a7e8d-31f5-4415-abb3-2535cc908afc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 21:45:38.127	2026-08-24 21:45:38.127	s-msjq5trg-2yy0t8o0
98e60a0e-8819-442a-8fac-67c6cc361e20	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-24 21:45:41.304	2026-08-24 21:45:41.304	s-msjq5trg-2yy0t8o0
b0a0a887-d75d-4100-8086-80f7eb25edde	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-24 21:45:48.165	2026-08-24 21:45:48.165	s-msjq5trg-2yy0t8o0
efbfbdfc-0217-4228-8c67-b555f240e4f9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/profile	2026-08-24 21:45:51.321	2026-08-24 21:45:51.321	s-msjq5trg-2yy0t8o0
53e480c4-247d-42d9-8d89-478d1c016af4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/admin	2026-08-24 21:50:35.521	2026-08-24 21:50:35.521	s-mt7p2nx9-hd2ve7zi
b099d5c6-c2be-49a6-9804-a37bd0eadc7e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/profile	2026-08-24 21:55:03.034	2026-08-24 21:55:03.034	s-msjq5trg-2yy0t8o0
2f6cde3b-a8bc-4fac-baaf-2240e294dfa0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/profile	2026-08-24 21:55:03.039	2026-08-24 21:55:03.039	s-msjq5trg-2yy0t8o0
129bf079-b7f6-4306-993a-ce52fd3e4322	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-24 21:55:22.386	2026-08-24 21:55:22.386	s-msjq5trg-2yy0t8o0
7d1f7245-d4b0-433b-a0a8-e873b4c337ba	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-24 21:55:23.277	2026-08-24 21:55:23.277	s-msjq5trg-2yy0t8o0
03e9151c-46fc-42ba-9ced-6e97369b70ee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:06:30.628	2026-08-24 22:06:30.628	s-msjq5trg-2yy0t8o0
1fc39fef-e22a-450e-ab75-014be7903c59	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-24 22:06:48.645	2026-08-24 22:06:48.645	s-mst4952d-t20wzch8
4e779318-73d9-4da3-bd0c-66df7b52914d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-24 22:06:48.651	2026-08-24 22:06:48.651	s-mst4952d-t20wzch8
4f58797f-7f6c-4a9b-ac5f-2dd9f528fa67	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-24 22:06:49.715	2026-08-24 22:06:49.715	s-mst4952d-t20wzch8
42924dd9-32e3-4a0e-9126-d1d9935c13ba	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-24 22:06:54.661	2026-08-24 22:06:54.661	s-mst4952d-t20wzch8
d241595f-bcd3-4e6a-9dd6-b10410eac5ad	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:07:20.234	2026-08-24 22:07:20.234	s-msjq5trg-2yy0t8o0
d04823fe-21e2-439f-adf6-e1691af88653	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:07:20.242	2026-08-24 22:07:20.242	s-msjq5trg-2yy0t8o0
43aa3564-103a-4231-9c24-e5b15d16ba74	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-24 22:07:25.389	2026-08-24 22:07:25.389	s-msjq5trg-2yy0t8o0
193192b8-dd44-4342-b6a4-a6638f13998a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:07:39.249	2026-08-24 22:07:39.249	s-msjq5trg-2yy0t8o0
aeb9e784-9de3-4fbc-9d1d-c711d15e6a97	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 22:08:00.016	2026-08-24 22:08:00.016	s-msjq5trg-2yy0t8o0
10117bbe-1006-4381-833b-9df2b6ec13e3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-24 22:08:00.02	2026-08-24 22:08:00.02	s-msjq5trg-2yy0t8o0
9ada08a0-a0b9-43d8-801c-91936957afc2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 22:08:22.046	2026-08-24 22:08:22.046	s-msjq5trg-2yy0t8o0
328f8bb4-93ad-44e6-832d-d56f3f20b32c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-24 22:08:33.441	2026-08-24 22:08:33.441	s-msjq5trg-2yy0t8o0
9fa0d957-3e3b-495f-acac-ddafabc8c066	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/profile	2026-08-24 22:08:53.948	2026-08-24 22:08:53.948	s-msjq5trg-2yy0t8o0
54ab1ad6-3b7b-4738-9c64-cee620b3cd63	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:08:56.987	2026-08-24 22:08:56.987	s-msjq5trg-2yy0t8o0
0ee8d5e4-fe55-4a04-bdcf-694672ea155f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/profile	2026-08-24 22:09:23.504	2026-08-24 22:09:23.504	s-msjq5trg-2yy0t8o0
d99d0641-0f85-40b4-88c1-b8871312690b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/admin	2026-08-24 22:09:30.397	2026-08-24 22:09:30.397	s-mt7p2nx9-hd2ve7zi
5c806b84-94c8-4b20-addd-22c98ec425f6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/admin	2026-08-24 22:09:30.401	2026-08-24 22:09:30.401	s-mt7p2nx9-hd2ve7zi
6d7becb6-619c-4ca7-a5c4-0f9cd70a9109	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/admin/users	2026-08-24 22:09:33.129	2026-08-24 22:09:33.129	s-mt7p2nx9-hd2ve7zi
765fa407-d0a4-409d-a950-a0d34aa75ea1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/admin/products	2026-08-24 22:09:37.911	2026-08-24 22:09:37.911	s-mt7p2nx9-hd2ve7zi
32d41c46-609d-4fc6-aa07-4909b16132a8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/admin/orders	2026-08-24 22:09:41.968	2026-08-24 22:09:41.968	s-mt7p2nx9-hd2ve7zi
3d9a3a27-351a-4c33-83f9-3c804208fb62	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-24 22:10:14.234	2026-08-24 22:10:14.234	s-msjq5trg-2yy0t8o0
3e566d51-76b6-499c-823a-60f52344a56c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 22:10:15.513	2026-08-24 22:10:15.513	s-msjq5trg-2yy0t8o0
a3526b0f-01cf-475d-a174-ce93acf05321	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-24 22:10:29.445	2026-08-24 22:10:29.445	s-mst4952d-t20wzch8
83e44eea-ebcc-4ab3-bf02-9fb73b0cf898	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-24 22:10:34.342	2026-08-24 22:10:34.342	s-mst4952d-t20wzch8
d0269c64-e0b0-40f1-b0dd-7d1df3120b42	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:10:47.295	2026-08-24 22:10:47.295	s-msjq5trg-2yy0t8o0
66f6f30b-19b8-4843-9331-9c07a2799853	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:11:18.672	2026-08-24 22:11:18.672	s-msjq5trg-2yy0t8o0
e4e1bf2c-959c-4f7d-8b82-876afaffe6fb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:11:18.68	2026-08-24 22:11:18.68	s-msjq5trg-2yy0t8o0
559fb3c7-4175-4b3d-a2c2-50c3dbf103da	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 22:13:04.435	2026-08-24 22:13:04.435	s-msjq5trg-2yy0t8o0
2eef186f-4be2-477a-86c4-bc3bd8eb7027	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-24 22:13:04.414	2026-08-24 22:13:04.414	s-msjq5trg-2yy0t8o0
68d886a9-0fc5-427b-afd1-846c7a95010c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-24 22:13:13.446	2026-08-24 22:13:13.446	s-msjq5trg-2yy0t8o0
225d5e77-3abb-4fa2-b684-34388b01291c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-24 22:13:32.834	2026-08-24 22:13:32.834	s-mst4952d-t20wzch8
8e8617e7-3e22-4bc5-afc2-06f28605e839	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-24 22:13:32.845	2026-08-24 22:13:32.845	s-mst4952d-t20wzch8
56c887d0-862a-4ca6-bd07-4c26f28b6b53	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-24 22:13:56.038	2026-08-24 22:13:56.038	s-msjq5trg-2yy0t8o0
47d7768f-7210-4c39-bc63-16b37b473257	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:08:49.626	2026-08-25 01:08:49.626	s-msjq5trg-2yy0t8o0
6a4185ea-4e9d-4f5a-b5a8-d4ee6d20d7f6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:08:49.649	2026-08-25 01:08:49.649	s-msjq5trg-2yy0t8o0
59e2f9e9-9ff7-4fb1-be61-d6545f4c47b2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:09:12.097	2026-08-25 01:09:12.097	s-msjq5trg-2yy0t8o0
3a0f6b39-8f0e-415c-a4f1-6c86943b64ab	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:09:12.092	2026-08-25 01:09:12.092	s-msjq5trg-2yy0t8o0
9bcb3e33-64ac-4aa9-854c-252e2ea7ddfc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:09:21.01	2026-08-25 01:09:21.01	s-msjq5trg-2yy0t8o0
b48902c3-2475-496d-acb5-bf717a941545	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:09:21.015	2026-08-25 01:09:21.015	s-msjq5trg-2yy0t8o0
b877ff1d-4518-4e64-95ea-0e9c6f80ac79	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/checkout	2026-08-26 01:20:06.55	2026-08-26 01:20:06.55	s-mt7p2nx9-hd2ve7zi
376c728e-e35d-44c6-91f5-660a3f643e8b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:09:49.687	2026-08-25 01:09:49.687	s-msjq5trg-2yy0t8o0
db4099a8-f8b3-4907-b729-64cc16867ef1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:09:49.692	2026-08-25 01:09:49.692	s-msjq5trg-2yy0t8o0
1d131351-46a5-49b7-8789-5cbd05751afe	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:15:37.042	2026-08-25 01:15:37.042	s-msjq5trg-2yy0t8o0
b01577ed-c89d-4324-bfba-40b3cfc272dc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:15:37.052	2026-08-25 01:15:37.052	s-msjq5trg-2yy0t8o0
a6b30d5f-83fb-470a-9abc-0efc97e182e8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 01:15:37.592	2026-08-25 01:15:37.592	s-mst4952d-t20wzch8
ec3d178d-23c4-48c1-be5e-b47be0595bd3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 01:15:37.598	2026-08-25 01:15:37.598	s-mst4952d-t20wzch8
8b5d1d3a-1dc2-40bb-96f2-dcc1bdf0b2aa	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/admin/orders	2026-08-25 01:15:37.651	2026-08-25 01:15:37.651	s-mt7p2nx9-hd2ve7zi
06cf0095-e211-47cd-8463-d731c43172dc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/admin/orders	2026-08-25 01:15:37.656	2026-08-25 01:15:37.656	s-mt7p2nx9-hd2ve7zi
77635a8e-9245-4cb7-aa3f-855970d962ea	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	Desktop	Firefox	/auth/login	2026-08-25 01:15:38.142	2026-08-25 01:15:38.142	s-mt7p2nx9-hd2ve7zi
a7720af7-20a5-4c9b-8d5d-b841df6fcb33	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 01:15:42.824	2026-08-25 01:15:42.824	s-mst4952d-t20wzch8
79b5a93d-cc11-46a7-99b6-8194154c18b4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 01:15:42.827	2026-08-25 01:15:42.827	s-mst4952d-t20wzch8
1a2cc451-f171-4d32-93f1-8e1029c25f43	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:15:54.983	2026-08-25 01:15:54.983	s-msjq5trg-2yy0t8o0
c23547b6-a444-481a-af53-a50ef5b5b492	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:15:54.997	2026-08-25 01:15:54.997	s-msjq5trg-2yy0t8o0
26689af5-e6a9-428b-8079-239720888ebb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:16:06.125	2026-08-25 01:16:06.125	s-msjq5trg-2yy0t8o0
4f6c9aea-7090-4601-a658-c0cc8e81baa5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:16:06.131	2026-08-25 01:16:06.131	s-msjq5trg-2yy0t8o0
3ba86b66-6b09-4f9f-895d-d93b0b67bd39	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-25 01:17:19.382	2026-08-25 01:17:19.382	s-msjq5trg-2yy0t8o0
23b9537a-6d7c-4e7c-9b81-e5b627a0096d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 01:17:21.696	2026-08-25 01:17:21.696	s-msjq5trg-2yy0t8o0
c1bbcacc-f468-4a0d-898d-575573017f3e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 01:17:49.782	2026-08-25 01:17:49.782	s-msjq5trg-2yy0t8o0
282cae1a-87e1-46d5-8dbf-d883b4936340	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 01:18:00.947	2026-08-25 01:18:00.947	s-msjq5trg-2yy0t8o0
71df13ad-7d6b-4b16-9518-9ef0440181d7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 01:18:07.071	2026-08-25 01:18:07.071	s-msjq5trg-2yy0t8o0
f0d6d1ea-804d-4974-a091-f4818a7e5cd1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 01:18:09.508	2026-08-25 01:18:09.508	s-msjq5trg-2yy0t8o0
1b702d8e-a53b-4f30-9d1e-e127555e00ff	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 01:18:12.006	2026-08-25 01:18:12.006	s-msjq5trg-2yy0t8o0
62721b58-88ed-4ffd-907b-4df2c16de983	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 01:18:13.077	2026-08-25 01:18:13.077	s-msjq5trg-2yy0t8o0
5e7e47e9-bb1c-4475-8431-d11c3f750b44	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 01:18:18.889	2026-08-25 01:18:18.889	s-msjq5trg-2yy0t8o0
d2080bff-ea8b-4a45-8ab4-59a76f71da45	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 01:18:20.915	2026-08-25 01:18:20.915	s-msjq5trg-2yy0t8o0
3b85a7f8-0829-4af9-b42f-89d61602eb4e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 01:18:23.807	2026-08-25 01:18:23.807	s-msjq5trg-2yy0t8o0
6a69723c-ae3f-4ddc-a894-c3e3dca38beb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 01:18:28.109	2026-08-25 01:18:28.109	s-msjq5trg-2yy0t8o0
1f275b78-2e86-461d-b3e4-39b12125aadf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 01:18:28.851	2026-08-25 01:18:28.851	s-msjq5trg-2yy0t8o0
7d3072fb-76c2-430b-838a-694dfd4b63f1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:18:33.656	2026-08-25 01:18:33.656	s-msjq5trg-2yy0t8o0
8892b690-fa53-4a6b-9a75-da8712ce7c0b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 01:18:37.195	2026-08-25 01:18:37.195	s-mst4952d-t20wzch8
ef833454-45bb-48ee-8a60-f30b7404b0e8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 01:18:37.204	2026-08-25 01:18:37.204	s-mst4952d-t20wzch8
72735edf-b32d-43c1-b3a6-b90dbec3ddb4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:21:51.762	2026-08-25 01:21:51.762	s-msjq5trg-2yy0t8o0
da08fd14-5bff-403b-9cd5-71f3eea2979d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:21:51.77	2026-08-25 01:21:51.77	s-msjq5trg-2yy0t8o0
fcb59466-628a-4405-b2d8-472e704f0778	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 01:22:01.809	2026-08-25 01:22:01.809	s-msjq5trg-2yy0t8o0
79b044e2-80f9-4b82-bb94-72be72049f90	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 01:22:02.875	2026-08-25 01:22:02.875	s-msjq5trg-2yy0t8o0
03b7a9fb-fd3d-4b20-9a7a-e0c24306f67e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 01:22:05.678	2026-08-25 01:22:05.678	s-msjq5trg-2yy0t8o0
5b293abf-5aa0-4f90-a2c2-f41b93baa687	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 01:22:08.656	2026-08-25 01:22:08.656	s-msjq5trg-2yy0t8o0
6a38d3a4-e28f-40a0-95d3-774da97e929b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 01:22:12.343	2026-08-25 01:22:12.343	s-msjq5trg-2yy0t8o0
0cc4417e-f15e-4895-b885-4ef7360bc9ea	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:22:15.413	2026-08-25 01:22:15.413	s-msjq5trg-2yy0t8o0
0aeb4b14-1c75-4bc8-865c-a94017ed986f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 01:22:20.525	2026-08-25 01:22:20.525	s-mst4952d-t20wzch8
ebf5576c-40b9-44be-bb00-fd7ac62e464a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 01:22:20.531	2026-08-25 01:22:20.531	s-mst4952d-t20wzch8
00ef5950-6678-4443-b7a7-0c016e305ad2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:22:32.849	2026-08-25 01:22:32.849	s-msjq5trg-2yy0t8o0
9e04e606-ddda-4759-bf47-f94b6d7aff70	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:22:32.853	2026-08-25 01:22:32.853	s-msjq5trg-2yy0t8o0
24a7433b-4378-42eb-bbf7-0d3fedc2a241	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 01:22:47.936	2026-08-25 01:22:47.936	s-msjq5trg-2yy0t8o0
8a8d7e21-0eb8-4c92-925f-25026e3f7cf1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 01:22:47.943	2026-08-25 01:22:47.943	s-msjq5trg-2yy0t8o0
6a7ce01b-dee5-4c84-bfab-07e6a340b38a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 01:22:50.059	2026-08-25 01:22:50.059	s-msjq5trg-2yy0t8o0
443f81e1-467d-4cc6-a584-9c4ddd779a6f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-25 01:23:15.744	2026-08-25 01:23:15.744	s-msjq5trg-2yy0t8o0
c8edef67-d8f6-49f1-b619-15e089a03ee2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/profile	2026-08-25 01:23:24.719	2026-08-25 01:23:24.719	s-msjq5trg-2yy0t8o0
d035ba40-2315-4fba-9f60-50a0091a0cac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:23:27.574	2026-08-25 01:23:27.574	s-msjq5trg-2yy0t8o0
8a653dca-3fc3-4e7f-96e1-cc8e3a3c378e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 01:23:58.113	2026-08-25 01:23:58.113	s-msjq5trg-2yy0t8o0
ae176889-08a1-4de7-b45b-76968ac55083	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 01:23:58.135	2026-08-25 01:23:58.135	s-msjq5trg-2yy0t8o0
c910585f-65b4-41d1-93be-34ed64b1c79d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 01:24:13.715	2026-08-25 01:24:13.715	s-msjq5trg-2yy0t8o0
1776e6ec-46fd-46fc-b1e8-916c12e099f7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:24:19.826	2026-08-25 01:24:19.826	s-msjq5trg-2yy0t8o0
bffc62f9-da5a-4050-9903-2d8846a49be9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:24:23.94	2026-08-25 01:24:23.94	s-msjq5trg-2yy0t8o0
93f9ad2c-cb75-452e-aff0-dbe2e4d6efdc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 01:24:23.942	2026-08-25 01:24:23.942	s-msjq5trg-2yy0t8o0
7fef7e71-7f19-4bc1-818a-8b60af5685fd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 21:35:22.28	2026-08-25 21:35:22.28	s-msjq5trg-2yy0t8o0
3ab1bed3-7f27-4be9-836f-f2a8ccdf9177	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 21:35:34.37	2026-08-25 21:35:34.37	s-msjq5trg-2yy0t8o0
426aa6f7-b1cd-4431-9bc5-f29e81ee85db	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 21:35:41.751	2026-08-25 21:35:41.751	s-msjq5trg-2yy0t8o0
33be0da2-4334-41c2-a4a0-7dc3f0a7ea87	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-25 21:35:52.256	2026-08-25 21:35:52.256	s-mst4952d-t20wzch8
c5f4cc02-74ee-4e1a-9448-004d22069ae6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 21:35:56.114	2026-08-25 21:35:56.114	s-msjq5trg-2yy0t8o0
62d03f60-20f6-4f87-a2d1-9833fe40f62a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 21:35:57.051	2026-08-25 21:35:57.051	s-mst4952d-t20wzch8
d6d5521e-1883-451b-bb7e-d6ce48a289cd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 01:20:09.226	2026-08-26 01:20:09.226	s-mt7p2nx9-hd2ve7zi
d16d0ef8-405b-436d-b056-89670457c52d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-25 21:36:07.135	2026-08-25 21:36:07.135	s-mst4952d-t20wzch8
f11f0ce7-866b-480e-96d6-80b9c5fd6529	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:36:09.823	2026-08-25 21:36:09.823	s-mst4952d-t20wzch8
f510aa08-2592-466d-9401-eb955774984f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-25 21:36:11.472	2026-08-25 21:36:11.472	s-mst4952d-t20wzch8
ee779223-55cb-4f70-aa60-a09da48588da	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:36:12.952	2026-08-25 21:36:12.952	s-mst4952d-t20wzch8
72b38f0b-8dad-4c47-8b4b-968bc44c1069	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 21:36:20.166	2026-08-25 21:36:20.166	s-msjq5trg-2yy0t8o0
a43bbfe0-34c1-4119-9f31-c4653ec8a1b4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 21:36:22.395	2026-08-25 21:36:22.395	s-msjq5trg-2yy0t8o0
66e139a1-d9de-41d5-ba93-e2a9332a2f0e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:36:26.135	2026-08-25 21:36:26.135	s-msjq5trg-2yy0t8o0
d1ac188e-a94f-4a44-842b-dabbec329344	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:36:29.586	2026-08-25 21:36:29.586	s-mst4952d-t20wzch8
22f17255-f4c2-417f-bfc6-4bf0b5589a9e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:36:29.589	2026-08-25 21:36:29.589	s-mst4952d-t20wzch8
effbfe9e-dfa3-4697-ad5c-6b4a61cd07a7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:36:40.882	2026-08-25 21:36:40.882	s-msjq5trg-2yy0t8o0
fd404334-ffd8-4146-ba55-b7951bb2759d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:36:40.883	2026-08-25 21:36:40.883	s-msjq5trg-2yy0t8o0
4c46d463-7a98-4ec8-9530-61c8e836c07b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:36:55.011	2026-08-25 21:36:55.011	s-msjq5trg-2yy0t8o0
76f157bf-f940-4e7f-af5c-a516871d0112	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:36:55.015	2026-08-25 21:36:55.015	s-msjq5trg-2yy0t8o0
1101b59c-be3a-44fc-b9c3-d769496948a7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 21:39:07.93	2026-08-25 21:39:07.93	s-msjq5trg-2yy0t8o0
b37a281e-918f-4e63-945a-a26c5d7ef4b9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 21:39:09.068	2026-08-25 21:39:09.068	s-msjq5trg-2yy0t8o0
bd49a259-beea-4190-bac7-659e9cf8bd19	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 21:39:11.489	2026-08-25 21:39:11.489	s-msjq5trg-2yy0t8o0
6dcde54c-7da3-46b2-b35d-c422da8f9be6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 21:39:14.803	2026-08-25 21:39:14.803	s-msjq5trg-2yy0t8o0
46be83ac-863e-4e86-be68-8553effafcf9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 21:39:15.725	2026-08-25 21:39:15.725	s-msjq5trg-2yy0t8o0
16d3f1b2-5d88-45a8-8ca0-f8805354743e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:39:19.209	2026-08-25 21:39:19.209	s-msjq5trg-2yy0t8o0
60ed4eaf-4cc0-4ec6-903d-efc2a2b586f0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:39:25.857	2026-08-25 21:39:25.857	s-mst4952d-t20wzch8
a6f59772-0cdb-4f28-ab85-424e27579d52	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:39:25.862	2026-08-25 21:39:25.862	s-mst4952d-t20wzch8
8b3520d8-e5b9-4122-82f4-0f5bd73c476d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:44:35.021	2026-08-25 21:44:35.021	s-msjq5trg-2yy0t8o0
1b1f49de-2e80-412f-97e6-4062a180dc65	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:44:35.042	2026-08-25 21:44:35.042	s-msjq5trg-2yy0t8o0
c0e99a28-9eb5-423a-8c62-92150eddc3ac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:44:36.38	2026-08-25 21:44:36.38	s-mst4952d-t20wzch8
16897c63-cca5-44d2-8508-bc6acfb7ae8d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:44:36.384	2026-08-25 21:44:36.384	s-mst4952d-t20wzch8
84b7049e-f520-4811-b5a2-2eaefde9dae7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:44:52.38	2026-08-25 21:44:52.38	s-msjq5trg-2yy0t8o0
cf4d43ea-9a03-44c4-bcf3-e5cfd25e9335	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:44:52.387	2026-08-25 21:44:52.387	s-msjq5trg-2yy0t8o0
bddc0088-50ed-4733-b816-4325c1ce2423	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:45:08.108	2026-08-25 21:45:08.108	s-msjq5trg-2yy0t8o0
d46b5c4f-6ac3-4915-a7c7-2f93637367c1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:45:08.113	2026-08-25 21:45:08.113	s-msjq5trg-2yy0t8o0
0cd09eb7-7f74-46ac-8cb5-c68833618c5b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 21:45:21.112	2026-08-25 21:45:21.112	s-msjq5trg-2yy0t8o0
c5ee11ab-c0cb-4ccb-9061-a0e7a4f9ebd9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 21:45:21.956	2026-08-25 21:45:21.956	s-msjq5trg-2yy0t8o0
77e88d19-d2d5-4b83-bcd3-7ce1b013d620	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 21:45:24.008	2026-08-25 21:45:24.008	s-msjq5trg-2yy0t8o0
3261abdd-7b07-45aa-a86a-ed8c8e9b70bd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 21:45:26.937	2026-08-25 21:45:26.937	s-msjq5trg-2yy0t8o0
fe2ee9a4-6f3d-48b2-acbb-cb71c8f5b954	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 21:45:28.069	2026-08-25 21:45:28.069	s-msjq5trg-2yy0t8o0
3c15e136-e7b1-4b51-b790-7e075b7a097d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:45:32.556	2026-08-25 21:45:32.556	s-msjq5trg-2yy0t8o0
4e5aa183-187a-4386-a751-c9a4e005eeac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:45:38.524	2026-08-25 21:45:38.524	s-mst4952d-t20wzch8
156607d1-1f95-4c4a-8493-debe6ad512e1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:45:38.531	2026-08-25 21:45:38.531	s-mst4952d-t20wzch8
a8424bdd-997c-42b8-b75a-848a63ceeaf5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:45:47.229	2026-08-25 21:45:47.229	s-mst4952d-t20wzch8
cfe8d809-42be-4df7-b434-b31706e0f0cb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 21:45:47.235	2026-08-25 21:45:47.235	s-mst4952d-t20wzch8
eabdebe0-5d53-45fb-8db8-68a28e348892	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:45:48.27	2026-08-25 21:45:48.27	s-msjq5trg-2yy0t8o0
b922ad33-d94e-4ced-a31e-c078c36d158a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:45:48.276	2026-08-25 21:45:48.276	s-msjq5trg-2yy0t8o0
2779e723-a704-4916-b3cc-366b6879825a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:48:05.307	2026-08-25 21:48:05.307	s-msjq5trg-2yy0t8o0
07c60570-08f5-4eea-88fd-85073796b68d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 21:48:05.314	2026-08-25 21:48:05.314	s-msjq5trg-2yy0t8o0
22237ac0-f9da-491c-ad33-c45a1c7e0f92	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 22:02:47.606	2026-08-25 22:02:47.606	s-msjq5trg-2yy0t8o0
cc353eef-68bf-4071-8ff5-f0c13f323aed	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 22:02:47.638	2026-08-25 22:02:47.638	s-msjq5trg-2yy0t8o0
20cc770d-6c1a-4934-b806-96efa9345cb8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:02:49.082	2026-08-25 22:02:49.082	s-mst4952d-t20wzch8
67efbfa0-9617-4b4c-88cb-e602d498f7be	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:02:49.089	2026-08-25 22:02:49.089	s-mst4952d-t20wzch8
7ed3e4e0-68ae-47f9-8213-20ab57baa16b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-25 22:02:49.25	2026-08-25 22:02:49.25	s-mst4952d-t20wzch8
53b00147-48ac-439c-87d1-67b2f118b04b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 22:03:01.77	2026-08-25 22:03:01.77	s-msjq5trg-2yy0t8o0
f810f1a4-803f-4d10-a9f8-c6043b57831c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 22:03:05.625	2026-08-25 22:03:05.625	s-mst4952d-t20wzch8
cf676512-1923-43f3-943d-ce39635e5585	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 22:03:09.677	2026-08-25 22:03:09.677	s-msjq5trg-2yy0t8o0
9f4073aa-f0dc-4dcc-80dc-ed2923d75d22	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 22:03:12.173	2026-08-25 22:03:12.173	s-msjq5trg-2yy0t8o0
1ba27619-7cb8-4749-ae5b-0709e61fc53c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 22:03:16.231	2026-08-25 22:03:16.231	s-msjq5trg-2yy0t8o0
26b52bb8-efee-46e4-8339-41e867fc9893	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 22:03:18.486	2026-08-25 22:03:18.486	s-msjq5trg-2yy0t8o0
c0965c7d-187d-4c7c-9e23-4090797f605f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:03:21.628	2026-08-25 22:03:21.628	s-msjq5trg-2yy0t8o0
92bc0ea4-d08c-488d-964c-d219dd8d7a4e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-25 22:03:27.287	2026-08-25 22:03:27.287	s-mst4952d-t20wzch8
ad8b6e78-f2a1-4e63-8bcd-bf6c146c8862	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:03:29.116	2026-08-25 22:03:29.116	s-mst4952d-t20wzch8
c1d6233e-5f19-41c0-8a9b-79b46d51812f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:03:31.685	2026-08-25 22:03:31.685	s-mst4952d-t20wzch8
bfd56403-8db9-4776-8144-c50937143e5c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:03:31.686	2026-08-25 22:03:31.686	s-mst4952d-t20wzch8
7ade8aa7-350a-4e05-aa34-955c3c9cd35c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:03:44.25	2026-08-25 22:03:44.25	s-msjq5trg-2yy0t8o0
cba66d82-d45d-42eb-9112-4792f4623c02	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:03:44.256	2026-08-25 22:03:44.256	s-msjq5trg-2yy0t8o0
6d456718-1ca8-451e-bfae-1c77d9216a91	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:06:40.429	2026-08-25 22:06:40.429	s-msjq5trg-2yy0t8o0
dc85a507-e185-4988-b3b9-e3ce462e5f06	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:06:40.438	2026-08-25 22:06:40.438	s-msjq5trg-2yy0t8o0
8f94c0b4-b0b7-48d2-8332-753dbb92f844	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 22:14:43.539	2026-08-25 22:14:43.539	s-msjq5trg-2yy0t8o0
73fb65b9-10b8-4cd1-b27b-7c8695180a0f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 22:14:46.48	2026-08-25 22:14:46.48	s-mst4952d-t20wzch8
51f4b988-6e1c-47c2-ad84-21a0fb0aa8f2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 22:15:03.724	2026-08-25 22:15:03.724	s-msjq5trg-2yy0t8o0
918db91b-b9e1-4ea2-9307-006f506e1ec9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-25 22:15:15.297	2026-08-25 22:15:15.297	s-mst4952d-t20wzch8
2cf135ab-a8f8-46ba-a806-e41d81ccde16	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 22:15:16.449	2026-08-25 22:15:16.449	s-msjq5trg-2yy0t8o0
c7acb338-6bc3-4674-967a-87e7cb890e4a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:15:17.229	2026-08-25 22:15:17.229	s-mst4952d-t20wzch8
586b016a-fa24-45a6-b613-5b058d771b7f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 22:15:26.743	2026-08-25 22:15:26.743	s-msjq5trg-2yy0t8o0
317ff8b2-8013-44dd-9a1a-2941c9e8937c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 22:15:31.876	2026-08-25 22:15:31.876	s-msjq5trg-2yy0t8o0
b58b8f16-4024-45af-9476-a334fd045875	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:15:42.062	2026-08-25 22:15:42.062	s-msjq5trg-2yy0t8o0
bfcdcf7e-3184-465d-96f2-1cfca38d03f4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:15:52.926	2026-08-25 22:15:52.926	s-mst4952d-t20wzch8
a2436d3a-21e5-434e-913c-8bac35e0d420	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:15:52.931	2026-08-25 22:15:52.931	s-mst4952d-t20wzch8
5dcb3f5b-9a57-4cd9-bcb7-b283612289e9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:16:01.632	2026-08-25 22:16:01.632	s-msjq5trg-2yy0t8o0
7ad2a06b-0b83-42b6-a695-da1ba6850b79	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:16:01.638	2026-08-25 22:16:01.638	s-msjq5trg-2yy0t8o0
e8bf498e-1858-41c9-b5d9-766dcdf413d1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 22:16:11.6	2026-08-25 22:16:11.6	s-msjq5trg-2yy0t8o0
f287f7a7-9965-45da-91f0-efa8ecfc830a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-25 22:16:24.836	2026-08-25 22:16:24.836	s-msjq5trg-2yy0t8o0
c26b94ef-f9ab-4476-9139-8ae2cc21265a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 22:16:28.768	2026-08-25 22:16:28.768	s-msjq5trg-2yy0t8o0
3bb1bf90-b376-449c-9e46-81ee091a23be	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:16:33.487	2026-08-25 22:16:33.487	s-msjq5trg-2yy0t8o0
872887ab-26b4-4f29-bb79-99cbc642bad6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-25 22:16:42.247	2026-08-25 22:16:42.247	s-msjq5trg-2yy0t8o0
222740c9-69c1-4bf4-86c6-aa3ab16aaab2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-25 22:16:57.041	2026-08-25 22:16:57.041	s-msjq5trg-2yy0t8o0
a436540c-afff-476e-9f33-f6965c3be97f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:17:02.514	2026-08-25 22:17:02.514	s-msjq5trg-2yy0t8o0
3d8aeba7-09b8-4cdf-a45a-c76840ea2010	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 22:36:32.92	2026-08-25 22:36:32.92	s-msjq5trg-2yy0t8o0
8274e8d3-1368-4c93-abf2-bf9808536d79	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 22:36:32.906	2026-08-25 22:36:32.906	s-msjq5trg-2yy0t8o0
a40ea067-7ad0-4a68-bc87-90537c6a79c5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:36:36.294	2026-08-25 22:36:36.294	s-mst4952d-t20wzch8
101a67a3-4bad-496c-aec8-5cefd744c502	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:36:36.298	2026-08-25 22:36:36.298	s-mst4952d-t20wzch8
c7ed91fc-ab86-4a33-b0e6-78cb52f9ff03	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-25 22:36:36.455	2026-08-25 22:36:36.455	s-mst4952d-t20wzch8
e3df9f99-65ca-4f87-ace4-6183e3488775	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 22:42:09.034	2026-08-25 22:42:09.034	s-msjq5trg-2yy0t8o0
918a50a4-5179-422d-99b5-1ffbd4f68686	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 22:42:14.033	2026-08-25 22:42:14.033	s-mst4952d-t20wzch8
5350af26-9c91-47b0-98ad-45a7d8a5419a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 22:42:23.195	2026-08-25 22:42:23.195	s-msjq5trg-2yy0t8o0
8ce7c95a-35f5-4605-af7a-60cba4c0bcb7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 22:42:27.784	2026-08-25 22:42:27.784	s-msjq5trg-2yy0t8o0
c030b1fc-64d2-4327-b373-140bc37d284a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 22:42:30.777	2026-08-25 22:42:30.777	s-msjq5trg-2yy0t8o0
8df00e46-44a5-4320-8811-ca1d0727f802	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 22:42:31.681	2026-08-25 22:42:31.681	s-msjq5trg-2yy0t8o0
bb9c0118-7db6-4084-b920-60dfbee5c686	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:55:05.551	2026-09-05 18:55:05.551	s-msjq5trg-2yy0t8o0
30a49db4-ae26-4032-8d06-0ce6595425cb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-05 18:59:02.112	2026-09-05 18:59:02.112	s-msjq5trg-2yy0t8o0
36ebeae1-cba2-4d0b-af1d-6301b1f15ac6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 18:59:05.84	2026-09-05 18:59:05.84	s-msjq5trg-2yy0t8o0
1118ca5b-3b34-4026-8fb8-b2e6bfeaf839	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:06:04.006	2026-09-05 19:06:04.006	s-mst4952d-t20wzch8
96f93199-1b28-46ab-ae30-659442fe288e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-09-05 19:11:59.525	2026-09-05 19:11:59.525	s-mst4952d-t20wzch8
6f2e7592-91e2-4e0b-b6f2-c5e5b79bfc20	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 19:20:19.893	2026-09-05 19:20:19.893	s-mst4952d-t20wzch8
f10adab0-e88f-45bb-a9f3-29481c00d336	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:19:55.51	2026-09-05 20:19:55.51	s-mst4952d-t20wzch8
27fe0e2b-e532-4046-adb6-58a59cc37535	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:23:06.999	2026-09-05 20:23:06.999	s-msjq5trg-2yy0t8o0
cd3f2e7a-284a-4abb-9a4f-58f9d708e995	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:31:30.7	2026-09-05 20:31:30.7	s-msjq5trg-2yy0t8o0
69a61918-b197-4a56-aee0-e208128abf8f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:32:57.551	2026-09-05 20:32:57.551	s-msjq5trg-2yy0t8o0
6162e8a3-084f-4735-89d4-b04ecc3aa0a5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:35:06.38	2026-09-05 20:35:06.38	s-mst4952d-t20wzch8
0211ef8a-7f1d-49b7-b299-3b03642cbc45	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 20:35:13.732	2026-09-05 20:35:13.732	s-mst4952d-t20wzch8
7a2baa8b-7560-40cf-9370-8e9fe097db7e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 20:46:22.753	2026-09-05 20:46:22.753	s-msjq5trg-2yy0t8o0
4f514e30-e4e5-4aae-afef-5481c2d9c7f6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/products/produtoservio-1788640434418	2026-09-05 20:50:18.86	2026-09-05 20:50:18.86	s-mst4952d-t20wzch8
fac2c246-c335-4cd4-826a-076236eba1e7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:56:49.435	2026-09-05 20:56:49.435	s-mst4952d-t20wzch8
e60e6cb8-af74-475d-9ed3-37414db974c6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:56:50.375	2026-09-05 20:56:50.375	s-mst4952d-t20wzch8
811c390e-9df5-4376-b0ad-a679b4395306	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 21:13:53.825	2026-09-05 21:13:53.825	s-msjq5trg-2yy0t8o0
812b19d2-e76a-46d6-8f23-a2c65f1d23a5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 21:29:33.322	2026-09-05 21:29:33.322	s-mst4952d-t20wzch8
4819d37b-cae8-4057-8c6f-f8c41977a407	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 21:29:40.538	2026-09-05 21:29:40.538	s-mst4952d-t20wzch8
e9d47d83-d235-4963-821e-592d6dba9886	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/profile	2026-09-05 21:29:47.486	2026-09-05 21:29:47.486	s-mst4952d-t20wzch8
a2ef27a7-4d68-4b97-b634-cecdf0b0da1c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 21:29:50.51	2026-09-05 21:29:50.51	s-mst4952d-t20wzch8
0d28408a-1c52-4c0c-9159-6ddfa9b460ca	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:31:37.041	2026-09-05 21:31:37.041	s-msjq5trg-2yy0t8o0
bf83691f-1851-457a-b8f9-779a644d48ab	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:39:18.401	2026-09-05 21:39:18.401	s-msjq5trg-2yy0t8o0
bb6095e8-ffa9-4310-9fa2-a97f0a049122	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:39:19.291	2026-09-05 21:39:19.291	s-msjq5trg-2yy0t8o0
c03d5c73-931f-4b1f-a7db-656ee6e7fd81	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 21:43:32.658	2026-09-05 21:43:32.658	s-msjq5trg-2yy0t8o0
9dc79906-a39c-43f5-99a5-8f3718f80e85	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:48:38.826	2026-09-05 21:48:38.826	s-mst4952d-t20wzch8
375612c3-ae1a-4b70-bfed-b4c158ee7032	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-06 00:59:08.516	2026-09-06 00:59:08.516	s-mst4952d-t20wzch8
651dd111-9370-40ea-9bae-2121132b55de	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/search	2026-09-06 01:04:40.665	2026-09-06 01:04:40.665	s-msjq5trg-2yy0t8o0
03fa1032-727a-4475-8a39-0605d90bb8c0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:42:34.533	2026-08-25 22:42:34.533	s-msjq5trg-2yy0t8o0
404fee30-4b54-476f-887f-748e98864ffc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:55:05.537	2026-09-05 18:55:05.537	s-msjq5trg-2yy0t8o0
7975f9ad-a458-4f44-a932-b76681e5366b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-05 18:59:14.891	2026-09-05 18:59:14.891	s-msjq5trg-2yy0t8o0
12033cc8-b0d8-40ff-a93b-5c4fbac3435e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:59:17.549	2026-09-05 18:59:17.549	s-msjq5trg-2yy0t8o0
e613351d-40ac-4890-915f-c66b3ca45552	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:09:00.07	2026-09-05 19:09:00.07	s-mst4952d-t20wzch8
52decafd-e39d-4d04-9c3e-8547378add61	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/dashboard	2026-09-05 19:12:11.738	2026-09-05 19:12:11.738	s-mst4952d-t20wzch8
972e305e-93eb-4edf-b9ef-71df3bf674eb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 19:20:20.973	2026-09-05 19:20:20.973	s-mst4952d-t20wzch8
3a30f387-3fcf-4ce4-a8f3-de4abb464a50	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:19:55.75	2026-09-05 20:19:55.75	s-mst4952d-t20wzch8
1e8afb54-a151-409f-8376-8b4376cdf1ca	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 20:20:09.614	2026-09-05 20:20:09.614	s-msjq5trg-2yy0t8o0
c2734569-686b-4b0d-a441-0bc747ac0c39	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:20:16.856	2026-09-05 20:20:16.856	s-msjq5trg-2yy0t8o0
ada8e523-a404-4a67-b185-3a6f48583cac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:23:07.007	2026-09-05 20:23:07.007	s-msjq5trg-2yy0t8o0
c9991954-a600-4172-8bdf-1088fe01ebe9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:31:35.665	2026-09-05 20:31:35.665	s-msjq5trg-2yy0t8o0
b5664054-2552-4b81-ba54-44b6dbe2a702	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640350218	2026-09-05 20:33:01.312	2026-09-05 20:33:01.312	s-msjq5trg-2yy0t8o0
56928ffb-3065-4192-bc45-e157171244ca	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/products/produtoservio-1788640434418	2026-09-05 20:35:19.492	2026-09-05 20:35:19.492	s-mst4952d-t20wzch8
1cac8367-a222-447b-bc24-e4c04453bef0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:46:43.439	2026-09-05 20:46:43.439	s-msjq5trg-2yy0t8o0
4ac56118-eca3-4acb-8ab5-507c5c1bf5a6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-05 20:50:54.785	2026-09-05 20:50:54.785	s-msjq5trg-2yy0t8o0
13749b2e-58cc-4ac6-a47a-48d0713a5983	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/shipping	2026-09-05 20:57:03.082	2026-09-05 20:57:03.082	s-mst4952d-t20wzch8
0647857d-0143-4d5e-b9ca-c7bd2b6cba2e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:13:55.913	2026-09-05 21:13:55.913	s-msjq5trg-2yy0t8o0
eb582605-5a90-4d39-a8ae-de9015daa187	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 21:29:33.324	2026-09-05 21:29:33.324	s-mst4952d-t20wzch8
c06d61e4-f552-4426-b3ce-dbd8480543e4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 21:31:44.091	2026-09-05 21:31:44.091	s-mst4952d-t20wzch8
fb235a25-dcc8-4bbb-a887-66db5800ca5b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:31:46.769	2026-09-05 21:31:46.769	s-mst4952d-t20wzch8
16c1eb22-f0d1-4ebb-b46a-61aa230f2d15	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:39:31.68	2026-09-05 21:39:31.68	s-msjq5trg-2yy0t8o0
7a5df33f-4d83-437b-b9b9-c287c91b62e0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-09-05 21:39:39.528	2026-09-05 21:39:39.528	s-mst4952d-t20wzch8
62f0bf1e-eadb-47e7-ba34-c9b81de36c7d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 21:43:32.668	2026-09-05 21:43:32.668	s-msjq5trg-2yy0t8o0
5e466f27-3405-4e1a-9e49-e7451cc4ac24	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-05 21:49:18.535	2026-09-05 21:49:18.535	s-msjq5trg-2yy0t8o0
047e04e7-7177-4972-8889-4d8b48c0f4f8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-06 00:59:08.531	2026-09-06 00:59:08.531	s-mst4952d-t20wzch8
1da9f8c4-8b00-4af5-9956-9b79f5a0408a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-06 00:59:30.769	2026-09-06 00:59:30.769	s-msjq5trg-2yy0t8o0
8999d55b-bffe-4486-9422-6c6d353c712e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/search	2026-09-06 01:04:40.672	2026-09-06 01:04:40.672	s-msjq5trg-2yy0t8o0
6d0e0dd3-eefc-43fa-800a-ebabddb24648	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers	2026-09-06 01:06:08.987	2026-09-06 01:06:08.987	s-msjq5trg-2yy0t8o0
4bcdd632-7422-47cc-9024-006f91498efa	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:13:31.194	2026-09-06 01:13:31.194	s-msjq5trg-2yy0t8o0
63ea9def-d85e-4867-815a-71e929e6b0f3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 22:42:37.749	2026-08-25 22:42:37.749	s-mst4952d-t20wzch8
d96addc6-73a2-48cb-98d9-69898a6cdf0b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 22:42:37.73	2026-08-25 22:42:37.73	s-mst4952d-t20wzch8
947f8729-1c36-4ef5-a280-9f516c5d0d1e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 22:42:40.201	2026-08-25 22:42:40.201	s-mst4952d-t20wzch8
190783da-dec5-420c-a9c9-9e6c29e2f71e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:42:47.655	2026-08-25 22:42:47.655	s-msjq5trg-2yy0t8o0
b5f65d45-c5d3-4c9f-a834-eceb6d26d932	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:42:47.663	2026-08-25 22:42:47.663	s-msjq5trg-2yy0t8o0
a84bb38f-cacf-4e36-b9f1-968d15912148	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 22:42:55.339	2026-08-25 22:42:55.339	s-msjq5trg-2yy0t8o0
2c2da359-4d5f-4fed-a7b6-cd04c4da96f8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:42:56.811	2026-08-25 22:42:56.811	s-msjq5trg-2yy0t8o0
ae41e665-8e5f-4be7-8d3e-544f3f4726ea	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 22:43:07.025	2026-08-25 22:43:07.025	s-msjq5trg-2yy0t8o0
06399894-eb5b-43cd-a8b1-969e0b3ef341	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:43:14.776	2026-08-25 22:43:14.776	s-msjq5trg-2yy0t8o0
c6861844-bd5a-4507-8f49-8f2c6b04c993	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-25 22:43:18.091	2026-08-25 22:43:18.091	s-msjq5trg-2yy0t8o0
6313007e-74be-4c35-aba9-6296a9094cff	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:43:27.835	2026-08-25 22:43:27.835	s-msjq5trg-2yy0t8o0
6304bff3-7d20-4893-b826-130719fd32f2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 22:43:39.848	2026-08-25 22:43:39.848	s-msjq5trg-2yy0t8o0
29e5826a-d2d4-40d7-a484-0aabdbc212dc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 22:43:50.853	2026-08-25 22:43:50.853	s-msjq5trg-2yy0t8o0
8f27b038-3f5b-4085-a679-583720dffa13	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 22:43:53.879	2026-08-25 22:43:53.879	s-msjq5trg-2yy0t8o0
dd21cf8b-de70-4a36-899e-6140d48afc89	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 22:43:56.617	2026-08-25 22:43:56.617	s-msjq5trg-2yy0t8o0
914eacd0-ddc1-4679-ab98-955322b99e20	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 22:45:16.195	2026-08-25 22:45:16.195	s-msjq5trg-2yy0t8o0
51281de3-ebd6-4333-bf01-a1a129deb04f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 23:12:13.876	2026-08-25 23:12:13.876	s-msjq5trg-2yy0t8o0
864e9864-810f-4a2c-b27a-c6393048a71b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 23:12:13.889	2026-08-25 23:12:13.889	s-msjq5trg-2yy0t8o0
668a7be1-1acd-4366-af5e-0fcc5a5d19f1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:12:17.111	2026-08-25 23:12:17.111	s-mst4952d-t20wzch8
309f000f-9433-4eb1-8dac-0706a9ab27f7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:12:17.117	2026-08-25 23:12:17.117	s-mst4952d-t20wzch8
5bce8011-985f-491f-a585-9cb691ef0f8b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-25 23:12:17.297	2026-08-25 23:12:17.297	s-mst4952d-t20wzch8
96190f13-49be-4bbc-b875-53adfbb778c2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 23:12:33.452	2026-08-25 23:12:33.452	s-msjq5trg-2yy0t8o0
c317a421-0334-430e-9ec6-4b150fae916b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 23:12:37.67	2026-08-25 23:12:37.67	s-mst4952d-t20wzch8
531f2416-3470-4d85-8114-5ca4756e50a5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:12:44.583	2026-08-25 23:12:44.583	s-msjq5trg-2yy0t8o0
13b8e406-3417-4ab8-8da3-60d163280c4b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:12:46.87	2026-08-25 23:12:46.87	s-msjq5trg-2yy0t8o0
e07fbd5f-ff42-4215-bd16-13360a0e51d8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:13:00.221	2026-08-25 23:13:00.221	s-msjq5trg-2yy0t8o0
67721745-cdc5-4e40-a7de-a5616ead0ea3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-25 23:13:02.395	2026-08-25 23:13:02.395	s-msjq5trg-2yy0t8o0
acac6f4a-39d5-43ef-9ff5-a48cc296c1cd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-25 23:13:41.536	2026-08-25 23:13:41.536	s-msjq5trg-2yy0t8o0
34a5e309-122e-4256-a64a-6d91653ed1b9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-25 23:13:41.543	2026-08-25 23:13:41.543	s-msjq5trg-2yy0t8o0
4ddb8e7e-e5ff-487d-a9da-a7870e903760	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-25 23:13:47.404	2026-08-25 23:13:47.404	s-msjq5trg-2yy0t8o0
975254cc-6e1c-413d-b053-b370f91e7062	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:13:55.008	2026-08-25 23:13:55.008	s-msjq5trg-2yy0t8o0
51ec8c1f-fa5d-4ae6-978c-3f01e0f5ae55	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:14:00.774	2026-08-25 23:14:00.774	s-msjq5trg-2yy0t8o0
fcb28c6f-a29a-45c0-9815-d914fcc99d22	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:16:17.833	2026-08-25 23:16:17.833	s-mst4952d-t20wzch8
dee030c5-cc23-41ee-b6dc-b3fd92dc9e79	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-25 23:16:24.962	2026-08-25 23:16:24.962	s-msjq5trg-2yy0t8o0
7e70dd25-41b5-440f-9748-1f126e788232	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:16:33.86	2026-08-25 23:16:33.86	s-msjq5trg-2yy0t8o0
0dfc3058-4a22-4fc6-bf12-9aaaa2e90d46	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:17:08.255	2026-08-25 23:17:08.255	s-msjq5trg-2yy0t8o0
1064a2d1-fb9f-4193-9db8-bbde73decbd7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:17:08.271	2026-08-25 23:17:08.271	s-msjq5trg-2yy0t8o0
48b78008-8c0f-416e-946c-602fd4ae931f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:17:10.458	2026-08-25 23:17:10.458	s-msjq5trg-2yy0t8o0
0bf92fce-348a-448c-b5b9-98e566576edf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:18:25.627	2026-08-25 23:18:25.627	s-mst4952d-t20wzch8
22d6b616-02b8-433f-bacc-0a17bbd3f652	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:18:25.631	2026-08-25 23:18:25.631	s-mst4952d-t20wzch8
be05d1e6-28af-4f75-831a-d8f71acd8fb4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:18:29.24	2026-08-25 23:18:29.24	s-msjq5trg-2yy0t8o0
a56414f3-540d-4e69-963a-97bc34651b86	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:18:29.273	2026-08-25 23:18:29.273	s-msjq5trg-2yy0t8o0
91105223-7753-4b52-9ecb-c7a6a5b8a179	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:18:38.671	2026-08-25 23:18:38.671	s-msjq5trg-2yy0t8o0
71a8eb58-4cc1-4a0c-b429-42eea7f68d1c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 23:18:46.627	2026-08-25 23:18:46.627	s-msjq5trg-2yy0t8o0
0346b602-5a0c-4637-93fa-a856c246141b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 23:18:47.558	2026-08-25 23:18:47.558	s-msjq5trg-2yy0t8o0
6d062649-ab99-43d9-abc3-d9b53ca1ceb9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:18:50.08	2026-08-25 23:18:50.08	s-msjq5trg-2yy0t8o0
6af4fe22-ce09-482e-b56d-834b955332f3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 23:18:53.857	2026-08-25 23:18:53.857	s-msjq5trg-2yy0t8o0
eed28050-356a-4942-b517-a2b56cc054e6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 23:18:58.759	2026-08-25 23:18:58.759	s-msjq5trg-2yy0t8o0
0a03f4cb-166a-4088-a345-b3bc45b3687a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-25 23:19:00.641	2026-08-25 23:19:00.641	s-msjq5trg-2yy0t8o0
08d6a57b-4da5-4176-be16-bb884e87872f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-25 23:19:01.893	2026-08-25 23:19:01.893	s-msjq5trg-2yy0t8o0
cc42d1fa-90aa-4f11-a1be-e6a5df1db069	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:19:04.387	2026-08-25 23:19:04.387	s-msjq5trg-2yy0t8o0
190157b8-7e08-4f5c-9f34-3e278d33ddf4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:19:08.173	2026-08-25 23:19:08.173	s-mst4952d-t20wzch8
bc393ad8-d900-460f-acc1-27b5d902c074	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:19:08.179	2026-08-25 23:19:08.179	s-mst4952d-t20wzch8
fddbc79c-3e85-4bf9-8d08-cda2c557431d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:19:16.543	2026-08-25 23:19:16.543	s-msjq5trg-2yy0t8o0
18adfc7a-67e7-42bb-ad8d-a82d1848fcae	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:19:16.55	2026-08-25 23:19:16.55	s-msjq5trg-2yy0t8o0
aa0f3ea8-4539-440e-856b-84378122db42	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 23:20:08.276	2026-08-25 23:20:08.276	s-msjq5trg-2yy0t8o0
c719d45c-3ed3-42e7-89f9-463701026450	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 23:20:12.681	2026-08-25 23:20:12.681	s-msjq5trg-2yy0t8o0
e4d6e707-348b-409b-861a-a3a86e92cc43	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:20:14.676	2026-08-25 23:20:14.676	s-msjq5trg-2yy0t8o0
9c71a408-5a29-4a7f-be86-4c8975e6e014	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-25 23:20:27.782	2026-08-25 23:20:27.782	s-mst4952d-t20wzch8
e55f00e2-6bdc-4e3c-9fba-5985ee93ec79	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-25 23:20:29.797	2026-08-25 23:20:29.797	s-mst4952d-t20wzch8
a210228e-806c-4fa7-be50-0c22e2b0a617	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-25 23:20:29.8	2026-08-25 23:20:29.8	s-mst4952d-t20wzch8
7ece6784-ebee-4cbf-91bc-9171b58291a6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-25 23:20:43.072	2026-08-25 23:20:43.072	s-mst4952d-t20wzch8
6eff170f-1898-415f-8d4c-da33bb1bc0f7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:20:51.216	2026-08-25 23:20:51.216	s-mst4952d-t20wzch8
efd76922-4651-4659-8e2e-4b97e530c153	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-25 23:20:51.758	2026-08-25 23:20:51.758	s-mst4952d-t20wzch8
2e365ba1-11be-4a58-90e3-9985bec2d60b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-25 23:21:24.904	2026-08-25 23:21:24.904	s-msjq5trg-2yy0t8o0
a33192ea-e004-4025-8282-8de2f3e4b06a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:21:26.546	2026-08-25 23:21:26.546	s-msjq5trg-2yy0t8o0
6d76289c-bbd0-4bdc-9c39-4e2243f213c7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-25 23:21:39.272	2026-08-25 23:21:39.272	s-msjq5trg-2yy0t8o0
77ca982d-e119-48a2-8d40-44606ddf19ad	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:21:41.036	2026-08-25 23:21:41.036	s-msjq5trg-2yy0t8o0
6e70c5d8-225b-4623-ac4d-8ce53bd41507	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 23:27:39.089	2026-08-25 23:27:39.089	s-msjq5trg-2yy0t8o0
a283863c-fd2e-4802-ae3d-be2ca0045a50	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 23:27:39.116	2026-08-25 23:27:39.116	s-msjq5trg-2yy0t8o0
03aa8ef0-011f-423c-8ffd-483b8fdd1d23	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 23:27:42.486	2026-08-25 23:27:42.486	s-msjq5trg-2yy0t8o0
d6f2d016-99a5-47f1-a994-9c68333b7ddf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 23:27:42.499	2026-08-25 23:27:42.499	s-msjq5trg-2yy0t8o0
13984289-92de-4c88-a40f-86f20521e670	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 23:27:49.028	2026-08-25 23:27:49.028	s-msjq5trg-2yy0t8o0
641c8d85-e0d0-4fac-8527-fccae872b77d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:27:53.664	2026-08-25 23:27:53.664	s-msjq5trg-2yy0t8o0
3d73ca11-3a3e-43e8-88fe-4d5d2fb97409	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 23:28:01.438	2026-08-25 23:28:01.438	s-msjq5trg-2yy0t8o0
257b9765-d38e-4c64-80f1-611e3a20ddae	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 23:28:03.118	2026-08-25 23:28:03.118	s-msjq5trg-2yy0t8o0
3fdb6ec1-06fb-49dd-b1d0-b48f141a8235	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:28:04.949	2026-08-25 23:28:04.949	s-msjq5trg-2yy0t8o0
02f40a4f-0b19-4b5e-b5ac-8de58c19f607	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-25 23:28:40.396	2026-08-25 23:28:40.396	s-mst4952d-t20wzch8
3710f919-a8a1-460e-a500-4ce1902c52be	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-25 23:28:40.387	2026-08-25 23:28:40.387	s-mst4952d-t20wzch8
8197f835-3649-4303-8c03-84bb399090c0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-25 23:28:40.743	2026-08-25 23:28:40.743	s-mst4952d-t20wzch8
90cafde6-095d-490d-bfd9-18656e57d2b7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:28:43.6	2026-08-25 23:28:43.6	s-msjq5trg-2yy0t8o0
2c62d263-ea81-43db-ab7f-0e0ddadf49d9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:28:43.615	2026-08-25 23:28:43.615	s-msjq5trg-2yy0t8o0
1c7d6482-b33e-4181-b599-cf9a48e58e65	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:29:13.435	2026-08-25 23:29:13.435	s-msjq5trg-2yy0t8o0
08930aab-de8e-4ccd-b8ed-5555a67924ef	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:29:13.448	2026-08-25 23:29:13.448	s-msjq5trg-2yy0t8o0
4a38032d-919b-4712-83a7-e7f797554f37	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:29:21.939	2026-08-25 23:29:21.939	s-msjq5trg-2yy0t8o0
e7a3e1c7-4cd2-4b0b-bb45-c6a589644bd0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 23:46:38.591	2026-08-25 23:46:38.591	s-msjq5trg-2yy0t8o0
45834a9a-74b0-43b9-a152-218c890d4a73	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-25 23:46:38.641	2026-08-25 23:46:38.641	s-mst4952d-t20wzch8
8c8e24a9-6151-4c3b-a37a-85477f63c6f8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-25 23:46:38.573	2026-08-25 23:46:38.573	s-msjq5trg-2yy0t8o0
8a52ebcc-2212-4ace-a562-87f9bce7e30a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-25 23:46:38.638	2026-08-25 23:46:38.638	s-mst4952d-t20wzch8
4cb43879-858b-43cb-a57f-88154d228395	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 23:47:26.415	2026-08-25 23:47:26.415	s-msjq5trg-2yy0t8o0
fec02b3e-5c87-4b7c-8c40-1a0d5b180bff	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 23:49:38.1	2026-08-25 23:49:38.1	s-msjq5trg-2yy0t8o0
a9a23d5f-e959-4394-9c95-a84ca817a4d0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-05 18:55:49.654	2026-09-05 18:55:49.654	s-msjq5trg-2yy0t8o0
36caa6d9-e7cf-46c4-ba65-34051aad5585	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-05 18:59:31.398	2026-09-05 18:59:31.398	s-msjq5trg-2yy0t8o0
0627a9bb-7a34-48a3-acbf-2cf17d00f630	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 18:59:32.263	2026-09-05 18:59:32.263	s-msjq5trg-2yy0t8o0
de918e1c-a0bd-40ea-b067-ea5976373733	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:09:00.063	2026-09-05 19:09:00.063	s-mst4952d-t20wzch8
4065a337-8d32-4cdc-bcb2-0c0236294009	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 19:09:06.942	2026-09-05 19:09:06.942	s-msjq5trg-2yy0t8o0
b24c18e2-53e9-4942-aa7a-b3bcb3cb0036	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 19:12:21.17	2026-09-05 19:12:21.17	s-mst4952d-t20wzch8
0b711a59-1b85-4abf-aca7-5a06e16250bd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:20:21.991	2026-09-05 19:20:21.991	s-mst4952d-t20wzch8
4272f3cb-0171-48c9-b665-9a4e1ffe28e5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 20:20:09.611	2026-09-05 20:20:09.611	s-msjq5trg-2yy0t8o0
4e0d9201-f431-4219-923d-a1089d70dc48	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:23:13.543	2026-09-05 20:23:13.543	s-mst4952d-t20wzch8
790e8022-c963-4fb9-820b-990ada0cc2f6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:31:37.111	2026-09-05 20:31:37.111	s-msjq5trg-2yy0t8o0
d6c747c8-6b6c-4453-8201-93ca716baeac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:33:15.087	2026-09-05 20:33:15.087	s-mst4952d-t20wzch8
7776ec17-8916-403a-8fe1-3cd3bcb80f70	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 20:35:27.331	2026-09-05 20:35:27.331	s-msjq5trg-2yy0t8o0
f09da6e0-317f-475e-a034-ec387288450c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 20:35:27.34	2026-09-05 20:35:27.34	s-msjq5trg-2yy0t8o0
efbd2e98-6def-456c-a658-406c4d257a07	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 20:46:53.404	2026-09-05 20:46:53.404	s-mst4952d-t20wzch8
e037dfc4-49fe-4e24-8d24-f3972674e46f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:51:28.53	2026-09-05 20:51:28.53	s-msjq5trg-2yy0t8o0
af3e6669-a724-4ac1-af29-b14be9813018	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:58:09.202	2026-09-05 20:58:09.202	s-mst4952d-t20wzch8
b3c3f748-1cef-430c-9c9d-7a87bca15564	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:27:59.397	2026-09-05 21:27:59.397	s-msjq5trg-2yy0t8o0
729c451f-ebd1-416e-94ce-7c5206817763	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 21:27:59.762	2026-09-05 21:27:59.762	s-msjq5trg-2yy0t8o0
379ceb4f-da15-4e67-b869-5a1e5946d5da	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 21:28:12.489	2026-09-05 21:28:12.489	s-msjq5trg-2yy0t8o0
2f195368-7f6b-4ee8-bf8d-3bd2eed3f948	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 21:29:43.956	2026-09-05 21:29:43.956	s-mst4952d-t20wzch8
24830d70-9bea-4cd4-a629-7155a00723ba	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-09-05 21:29:53.414	2026-09-05 21:29:53.414	s-mst4952d-t20wzch8
3732a83d-99a3-4293-b081-a9609d26a66b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 21:31:47.429	2026-09-05 21:31:47.429	s-mst4952d-t20wzch8
16c3a405-2b14-443e-8094-583316d574c3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:39:40.5	2026-09-05 21:39:40.5	s-mst4952d-t20wzch8
6977bef3-64a3-4c0d-a901-0827b2ea8b87	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:43:56.918	2026-09-05 21:43:56.918	s-mst4952d-t20wzch8
e0249b34-53e1-4ece-af06-ca0373f7e9b4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:49:19.957	2026-09-05 21:49:19.957	s-msjq5trg-2yy0t8o0
3fdf1155-9efd-413b-b864-8c6cbd71590d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-06 00:59:16.839	2026-09-06 00:59:16.839	s-mst4952d-t20wzch8
dc4df971-6d6d-4162-a620-8e258a186569	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/search	2026-09-06 01:04:57.087	2026-09-06 01:04:57.087	s-msjq5trg-2yy0t8o0
83b13fdc-1041-43a9-a648-0bf6ba78e3fc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/search	2026-09-06 01:04:57.099	2026-09-06 01:04:57.099	s-msjq5trg-2yy0t8o0
6c7c9c8d-043a-4573-828a-561f18ae4392	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-06 01:05:16.643	2026-09-06 01:05:16.643	s-msjq5trg-2yy0t8o0
c09808eb-fa1f-44de-a3c2-fe69bf0a4b85	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 23:49:38.083	2026-08-25 23:49:38.083	s-msjq5trg-2yy0t8o0
57f2b1f7-dd99-4f66-8820-6e3f59585c87	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 23:49:47.093	2026-08-25 23:49:47.093	s-msjq5trg-2yy0t8o0
782f1407-b761-4d92-952b-ffe8a4e11678	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:49:51.868	2026-08-25 23:49:51.868	s-msjq5trg-2yy0t8o0
68e91144-7c14-4a0a-bfa1-9d17d7811185	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-25 23:49:59.033	2026-08-25 23:49:59.033	s-msjq5trg-2yy0t8o0
f14a21fd-247b-4793-b85a-ac18fb1da346	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-25 23:50:04.383	2026-08-25 23:50:04.383	s-msjq5trg-2yy0t8o0
cdd98f9b-13db-46fd-9c08-8eaf94b573e5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:50:11.026	2026-08-25 23:50:11.026	s-msjq5trg-2yy0t8o0
a25b0c0e-0a78-432a-bed2-b1a5eae9b81c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:50:20.399	2026-08-25 23:50:20.399	s-msjq5trg-2yy0t8o0
8ebfcbe8-9f84-4787-b68b-0e76c9f0b196	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:50:36.042	2026-08-25 23:50:36.042	s-msjq5trg-2yy0t8o0
4c67c5cc-e6af-4021-93df-636a05c379dc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 23:50:58.592	2026-08-25 23:50:58.592	s-mst4952d-t20wzch8
08a23691-8259-4cc7-b9b0-f3b1c202dea0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-25 23:51:03.489	2026-08-25 23:51:03.489	s-mst4952d-t20wzch8
12f77dac-2036-4686-82e8-5a684d1fbb81	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto1-1787607936046	2026-08-25 23:51:07.665	2026-08-25 23:51:07.665	s-mst4952d-t20wzch8
4f8bc852-7671-495d-b30a-04ed3e460ab9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/cart	2026-08-25 23:51:19.09	2026-08-25 23:51:19.09	s-mst4952d-t20wzch8
860e1b76-57b6-46e3-a96e-e369f9821f83	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/checkout	2026-08-25 23:51:20.184	2026-08-25 23:51:20.184	s-mst4952d-t20wzch8
d30f5d9c-2658-4400-86c9-c7e39752b4b6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 23:51:24.729	2026-08-25 23:51:24.729	s-mst4952d-t20wzch8
8e5c2964-eb9a-4f0d-9765-3235d5dcfa21	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/profile	2026-08-25 23:51:33.394	2026-08-25 23:51:33.394	s-mst4952d-t20wzch8
03370d97-6b7e-4655-b9d7-bcc28365ca47	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 23:52:06.988	2026-08-25 23:52:06.988	s-mst4952d-t20wzch8
e44f9386-857b-4502-b824-9e8511b0c211	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/cart	2026-08-25 23:52:10.29	2026-08-25 23:52:10.29	s-mst4952d-t20wzch8
58c1236e-f291-4ad0-ba83-09422f4cb5c5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/checkout	2026-08-25 23:52:11.316	2026-08-25 23:52:11.316	s-mst4952d-t20wzch8
5a7d79ee-a355-43ac-a928-c4c44e4b1c3b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-25 23:52:56.093	2026-08-25 23:52:56.093	s-mst4952d-t20wzch8
0df9f366-e549-4747-b7a9-69273af28cb7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-25 23:53:06.411	2026-08-25 23:53:06.411	s-mst4952d-t20wzch8
4d176674-ed8e-484e-8329-142c043fa8f3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:53:09.431	2026-08-25 23:53:09.431	s-mst4952d-t20wzch8
94212667-36d8-4f7d-bc62-b1e270207b76	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 23:53:29.151	2026-08-25 23:53:29.151	s-mst4952d-t20wzch8
5a1a09ac-26dd-44a4-8653-cb88e91b4f13	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:53:30.767	2026-08-25 23:53:30.767	s-mst4952d-t20wzch8
dc8ace9b-0fd9-4059-b8c9-5d82ad5aba9b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 23:53:38.536	2026-08-25 23:53:38.536	s-mst4952d-t20wzch8
9b34cf9b-361d-4ec7-b333-b60bb1cc726a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:53:45.161	2026-08-25 23:53:45.161	s-mst4952d-t20wzch8
c1345d1e-03a7-44aa-b845-6b7d2971b0c2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-25 23:54:00.976	2026-08-25 23:54:00.976	s-mst4952d-t20wzch8
e0ebb72f-adb7-41fe-bfdc-04395a62c758	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/dashboard	2026-08-25 23:54:04.929	2026-08-25 23:54:04.929	s-mst4952d-t20wzch8
a7b1d2ab-4955-48b1-8d6d-68a759719387	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-25 23:54:06.47	2026-08-25 23:54:06.47	s-mst4952d-t20wzch8
c2f53ef4-25e6-4894-aedf-3903256efcd6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-25 23:54:17.925	2026-08-25 23:54:17.925	s-mst4952d-t20wzch8
239f923e-7630-4a88-89ee-a3d7757f60c3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-25 23:54:17.934	2026-08-25 23:54:17.934	s-mst4952d-t20wzch8
faafa6de-911b-4a3b-8700-375be3f89f23	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:54:18.945	2026-08-25 23:54:18.945	s-msjq5trg-2yy0t8o0
e1bd9f64-81fc-4309-a7a9-92407dafe041	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:54:18.947	2026-08-25 23:54:18.947	s-msjq5trg-2yy0t8o0
7752885c-3d92-4cb3-9efa-d9e72bbf19c3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-25 23:54:48.57	2026-08-25 23:54:48.57	s-mst4952d-t20wzch8
b9eb92d0-39e2-4a8b-a9f5-da8688ff3e49	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-25 23:54:49.565	2026-08-25 23:54:49.565	s-mst4952d-t20wzch8
0c333d8c-5158-44a6-9f9c-fc825030d402	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-25 23:54:51.963	2026-08-25 23:54:51.963	s-mst4952d-t20wzch8
d378cd58-93a8-48a4-8c1f-e0df9a77321c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/shipping	2026-08-25 23:54:55.161	2026-08-25 23:54:55.161	s-mst4952d-t20wzch8
ea34457f-7df2-4ce2-9e57-fa2fa2d2ddcf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-25 23:54:56.815	2026-08-25 23:54:56.815	s-mst4952d-t20wzch8
73f6eaed-9148-4018-89f3-e75aa9adf373	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:55:08.875	2026-08-25 23:55:08.875	s-msjq5trg-2yy0t8o0
6b9e387c-eb01-4c1d-a693-1144cbf29fc1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:55:08.883	2026-08-25 23:55:08.883	s-msjq5trg-2yy0t8o0
60a59389-4bb0-4400-ae31-49ee2d1cbd0d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:55:17.486	2026-08-25 23:55:17.486	s-msjq5trg-2yy0t8o0
ec074187-e8fb-4995-be62-8f1f25562890	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:55:27.934	2026-08-25 23:55:27.934	s-msjq5trg-2yy0t8o0
4f8f7188-be55-4cf0-bd58-8aad8aaeb461	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:55:27.949	2026-08-25 23:55:27.949	s-msjq5trg-2yy0t8o0
a91878bc-e6dd-46f7-804a-e3061c5c5c41	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:55:28.909	2026-08-25 23:55:28.909	s-msjq5trg-2yy0t8o0
78e0e210-1d22-4117-9a7f-6f6daeae44e5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-25 23:55:49.944	2026-08-25 23:55:49.944	s-msjq5trg-2yy0t8o0
ee1d1377-5328-47a8-947f-900dc65464e4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-25 23:56:00.504	2026-08-25 23:56:00.504	s-msjq5trg-2yy0t8o0
ab049b73-6db7-4cfe-bee9-03b241a12c0c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-25 23:56:06.698	2026-08-25 23:56:06.698	s-msjq5trg-2yy0t8o0
4626a618-2377-487d-9461-0d5162081845	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:02:40.108	2026-08-26 00:02:40.108	s-msjq5trg-2yy0t8o0
f6ac273a-168a-4683-9cc2-eaf0d06fa1a3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:02:40.116	2026-08-26 00:02:40.116	s-msjq5trg-2yy0t8o0
a4a3eae3-2366-47d1-92d6-d156b4946f37	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:03:24.093	2026-08-26 00:03:24.093	s-msjq5trg-2yy0t8o0
47bbf5c3-795e-4d52-9cf1-84e92af8a095	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:03:24.072	2026-08-26 00:03:24.072	s-msjq5trg-2yy0t8o0
7ded8125-0417-473a-8e36-3bc39cde141d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-26 00:03:24.539	2026-08-26 00:03:24.539	s-mst4952d-t20wzch8
1a18ac6c-4470-4865-bf6a-6dbdbea842c3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-26 00:03:24.543	2026-08-26 00:03:24.543	s-mst4952d-t20wzch8
558935ad-3409-413d-ae71-3a11562943f0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:03:38.514	2026-08-26 00:03:38.514	s-msjq5trg-2yy0t8o0
e211ba05-c9f7-4b18-99df-f8e65c4a03f2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/categories	2026-08-26 00:03:42.095	2026-08-26 00:03:42.095	s-msjq5trg-2yy0t8o0
5a0b9190-b828-406a-9cc3-5c98c04790e1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:03:43.697	2026-08-26 00:03:43.697	s-msjq5trg-2yy0t8o0
c3709887-7b42-489b-82e7-5617245bbe5c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:03:45.389	2026-08-26 00:03:45.389	s-msjq5trg-2yy0t8o0
a9781006-7085-4caa-ac13-0bcf2f6971e2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:03:51.593	2026-08-26 00:03:51.593	s-msjq5trg-2yy0t8o0
a73befff-5dca-4b98-b2c0-96d76365e895	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:04:01.133	2026-08-26 00:04:01.133	s-msjq5trg-2yy0t8o0
4ac2c9a0-5488-4501-91fe-de1df25694b7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:04:10.474	2026-08-26 00:04:10.474	s-msjq5trg-2yy0t8o0
f6ff007f-e018-41f2-b329-8b36501aa8e3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:04:10.496	2026-08-26 00:04:10.496	s-msjq5trg-2yy0t8o0
c7c3cfe0-ca4a-4066-93b0-4e95503e4b20	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/profile	2026-08-26 01:20:11.904	2026-08-26 01:20:11.904	s-mt7p2nx9-hd2ve7zi
0f1b0d52-32e9-4860-8a2c-4cfe90d5b25b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:04:26.401	2026-08-26 00:04:26.401	s-msjq5trg-2yy0t8o0
e8fe2f75-8d43-43a5-8a2a-e91c6adc8938	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-26 00:13:54.155	2026-08-26 00:13:54.155	s-mst4952d-t20wzch8
0c5bf464-89cb-4b27-9762-f50272d7dd94	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:13:54.059	2026-08-26 00:13:54.059	s-msjq5trg-2yy0t8o0
d68aabad-1a5e-4a36-b113-7184441ce939	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:13:54.066	2026-08-26 00:13:54.066	s-msjq5trg-2yy0t8o0
1ac83ff2-ae4d-4861-bd5f-6e5a5637bc3c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-26 00:13:54.176	2026-08-26 00:13:54.176	s-mst4952d-t20wzch8
eb3d2c3b-6788-460f-a827-1d9300794dd7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 00:13:54.726	2026-08-26 00:13:54.726	s-mst4952d-t20wzch8
c8d3a1c5-9735-4396-a148-61b4af04b336	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:14:05.836	2026-08-26 00:14:05.836	s-msjq5trg-2yy0t8o0
bbf12ec3-a48c-4c62-8159-d1c0e15f9c57	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:14:10.422	2026-08-26 00:14:10.422	s-msjq5trg-2yy0t8o0
3e4ce3f6-0a2e-478c-91b7-06a8c8ee531f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:14:16.949	2026-08-26 00:14:16.949	s-msjq5trg-2yy0t8o0
4d8d89d4-758c-4531-9d3c-dc697b74dbed	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:14:36.319	2026-08-26 00:14:36.319	s-msjq5trg-2yy0t8o0
a5d688fa-e0df-46a8-8210-d07e92021468	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:15:04.931	2026-08-26 00:15:04.931	s-msjq5trg-2yy0t8o0
3d69b569-38ab-49f2-af8a-faf5ecd5ac16	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:15:09.948	2026-08-26 00:15:09.948	s-msjq5trg-2yy0t8o0
779ab889-7256-464f-b002-187030740bc8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:15:47.438	2026-08-26 00:15:47.438	s-msjq5trg-2yy0t8o0
c6f160fd-015f-40d9-bb0d-6c51382bf0d7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:15:52.292	2026-08-26 00:15:52.292	s-msjq5trg-2yy0t8o0
d8421f32-e882-4d90-ad5c-1ae8986fea84	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:20:27.652	2026-08-26 00:20:27.652	s-msjq5trg-2yy0t8o0
d95aaa8c-572a-44fa-bee3-2ec48d2145a2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:20:27.682	2026-08-26 00:20:27.682	s-msjq5trg-2yy0t8o0
b220d2b9-3f78-4a4b-b76d-ba8f6d2bc095	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:21:10.727	2026-08-26 00:21:10.727	s-msjq5trg-2yy0t8o0
fcfb63ed-91f6-488a-91f9-4f7d88e9240e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:21:15.069	2026-08-26 00:21:15.069	s-msjq5trg-2yy0t8o0
943fad83-7a4d-482b-9bfe-d8a233208177	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:21:48.475	2026-08-26 00:21:48.475	s-msjq5trg-2yy0t8o0
df1b8bd6-8794-4aff-9ea2-5bc2af6211ba	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:21:50.498	2026-08-26 00:21:50.498	s-msjq5trg-2yy0t8o0
fa9853a5-0ef3-43f0-b85d-b58d2074e5ce	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:21:52.998	2026-08-26 00:21:52.998	s-msjq5trg-2yy0t8o0
f6b20997-b5d6-4cc8-ad4e-af41d6a9f152	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:21:58.674	2026-08-26 00:21:58.674	s-msjq5trg-2yy0t8o0
e627edc1-3d72-46b6-8ccc-a74614106c36	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 00:29:30.883	2026-08-26 00:29:30.883	s-mst4952d-t20wzch8
f54f12a2-825c-4f00-8187-7832ee62f235	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 00:29:30.877	2026-08-26 00:29:30.877	s-mst4952d-t20wzch8
2986f397-90a3-4948-bdcc-ff5b7cfdfa93	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:29:33.868	2026-08-26 00:29:33.868	s-msjq5trg-2yy0t8o0
831bf2fb-9d4d-4d9c-88a1-1dd91a6b24e0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:29:33.79	2026-08-26 00:29:33.79	s-msjq5trg-2yy0t8o0
e3289886-4527-4a13-b69a-1251dc9c4e51	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:29:36.702	2026-08-26 00:29:36.702	s-msjq5trg-2yy0t8o0
919e0a6e-749a-4e47-8965-bb54374480f9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:29:36.707	2026-08-26 00:29:36.707	s-msjq5trg-2yy0t8o0
9625f8e6-20c1-4971-a4cc-3b7f2861d771	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:30:03.458	2026-08-26 00:30:03.458	s-msjq5trg-2yy0t8o0
99b154ad-521d-4f9a-a2e8-9c7a9650369e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:30:16.789	2026-08-26 00:30:16.789	s-msjq5trg-2yy0t8o0
ba841b5d-da64-4a7d-ab3e-030fdad6d8ef	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:30:54.689	2026-08-26 00:30:54.689	s-msjq5trg-2yy0t8o0
47469c17-cb80-461e-a163-1fbafc79598e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:30:54.694	2026-08-26 00:30:54.694	s-msjq5trg-2yy0t8o0
05b59326-dfe0-439e-8316-8a567d7d0d1e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:31:03.764	2026-08-26 00:31:03.764	s-msjq5trg-2yy0t8o0
1fcc3513-57ca-45b4-8ba3-ced57da112a4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:31:12.288	2026-08-26 00:31:12.288	s-msjq5trg-2yy0t8o0
7b65f9a8-5d3f-4767-a1a1-c0d02314fc6a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:31:22.787	2026-08-26 00:31:22.787	s-msjq5trg-2yy0t8o0
4917b2ec-252e-49a9-89e5-e38fc8147d30	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:31:22.795	2026-08-26 00:31:22.795	s-msjq5trg-2yy0t8o0
a4544f77-1460-4a13-a2db-4461cac3e3fb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:31:29.652	2026-08-26 00:31:29.652	s-msjq5trg-2yy0t8o0
54454320-ec99-4bff-8c35-1832f8b79a0c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:31:34.741	2026-08-26 00:31:34.741	s-msjq5trg-2yy0t8o0
f9c4eab7-a268-472a-86ee-2c020f26837d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 00:32:15.756	2026-08-26 00:32:15.756	s-msjq5trg-2yy0t8o0
b27075b8-6d78-460a-8233-369ed767f8bc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:32:16.443	2026-08-26 00:32:16.443	s-msjq5trg-2yy0t8o0
f649ed71-0ec3-4df8-b339-94527ab12576	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 00:32:24.952	2026-08-26 00:32:24.952	s-msjq5trg-2yy0t8o0
3df6291e-28e3-42f3-95be-37205de359b0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:32:27.144	2026-08-26 00:32:27.144	s-msjq5trg-2yy0t8o0
b281bd02-2e00-4839-84a3-67f20d7d732e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:33:57.794	2026-08-26 00:33:57.794	s-msjq5trg-2yy0t8o0
375c9f10-1c4f-4405-9a27-90ff405e1e6d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:33:57.788	2026-08-26 00:33:57.788	s-msjq5trg-2yy0t8o0
7c88714b-5a4b-4a01-92aa-68deda018a7f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:34:19.793	2026-08-26 00:34:19.793	s-msjq5trg-2yy0t8o0
ed5cd0cf-4a7e-4e1c-b771-0c3e7dd56aee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:34:22.754	2026-08-26 00:34:22.754	s-msjq5trg-2yy0t8o0
11ed50f9-6c61-4646-8c21-c1e19be5f6fc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:34:24.794	2026-08-26 00:34:24.794	s-msjq5trg-2yy0t8o0
91e9f884-6d69-4807-9841-3c8c412262b0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:34:26.593	2026-08-26 00:34:26.593	s-msjq5trg-2yy0t8o0
c1afd2a2-3167-49c5-b7ef-62b460721c15	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 00:41:46.048	2026-08-26 00:41:46.048	s-msjq5trg-2yy0t8o0
2961b129-016f-4526-baa3-56e6a9687c92	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:41:47.386	2026-08-26 00:41:47.386	s-msjq5trg-2yy0t8o0
e44278a2-dd92-4ab5-b8fa-ede8461c613a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:42:01.829	2026-08-26 00:42:01.829	s-msjq5trg-2yy0t8o0
fcf50ba2-e5e2-4f7e-b87a-e32ae9755838	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:42:05.016	2026-08-26 00:42:05.016	s-msjq5trg-2yy0t8o0
c9d64097-d6d0-4738-b855-c3ea45629b24	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:42:12.213	2026-08-26 00:42:12.213	s-msjq5trg-2yy0t8o0
0e139d5a-8c58-4fa0-b334-ea1439eb1459	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:42:15.079	2026-08-26 00:42:15.079	s-msjq5trg-2yy0t8o0
66deb7cc-a002-45a8-a98d-eed3e98c6eaf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:42:37.806	2026-08-26 00:42:37.806	s-msjq5trg-2yy0t8o0
e37b7c14-3e47-4c4e-988a-655ecb577506	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:42:39.517	2026-08-26 00:42:39.517	s-msjq5trg-2yy0t8o0
8b54f799-8dc3-4f9c-82f8-f1dd096e1d84	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/conjunto-grade-aradora	2026-08-26 00:42:40.417	2026-08-26 00:42:40.417	s-msjq5trg-2yy0t8o0
c56595ea-0847-4d41-9fee-ca36229481cd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/cart	2026-08-26 01:20:36.633	2026-08-26 01:20:36.633	s-mt7p2nx9-hd2ve7zi
d70a932d-6e72-426f-9e34-a29cc3fb8ce0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/eca66561-b8f8-4fdb-99d1-ce59770da07e	2026-08-26 00:42:42.043	2026-08-26 00:42:42.043	s-msjq5trg-2yy0t8o0
ad10cbcf-0671-417e-8128-a1eda012f5f7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/conjunto-grade-aradora	2026-08-26 00:42:58.317	2026-08-26 00:42:58.317	s-msjq5trg-2yy0t8o0
49940d42-9f68-4233-9ed5-ff1cf685e6a8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:42:59.462	2026-08-26 00:42:59.462	s-msjq5trg-2yy0t8o0
75c4ae3f-ed8c-452a-8911-65782eb17152	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:43:01.922	2026-08-26 00:43:01.922	s-msjq5trg-2yy0t8o0
e521931a-e2de-4218-8449-a5c6284c7acf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:43:05.529	2026-08-26 00:43:05.529	s-msjq5trg-2yy0t8o0
ba87728f-49de-4413-bf5d-e31f0d7fa31f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:43:10.56	2026-08-26 00:43:10.56	s-msjq5trg-2yy0t8o0
4ee5217e-52a3-44d7-a55f-eb61ab98480e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:43:24.678	2026-08-26 00:43:24.678	s-msjq5trg-2yy0t8o0
a6085f9f-ad61-4d29-a04e-f4c2fcb0186e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 00:54:43.206	2026-08-26 00:54:43.206	s-mst4952d-t20wzch8
cc77fadf-98ac-420f-969e-ca10bc18acd2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 00:54:43.201	2026-08-26 00:54:43.201	s-mst4952d-t20wzch8
c53dfac7-e190-4775-b506-5b21a2a1cec3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:54:46.713	2026-08-26 00:54:46.713	s-msjq5trg-2yy0t8o0
4c08ba54-b591-49b1-adaf-1716a3039f77	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:54:46.753	2026-08-26 00:54:46.753	s-msjq5trg-2yy0t8o0
88b0f28a-0695-4b0f-ac1b-452da5ef6b09	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:55:18.009	2026-08-26 00:55:18.009	s-msjq5trg-2yy0t8o0
53debdf4-084b-40b7-a965-83f5c832079b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:55:17.864	2026-08-26 00:55:17.864	s-msjq5trg-2yy0t8o0
eda91c96-bf93-4858-a7d2-c09ab451fee5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:55:23.226	2026-08-26 00:55:23.226	s-msjq5trg-2yy0t8o0
77d402d6-c57e-4cc8-8201-cae99c64a794	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 00:55:55.814	2026-08-26 00:55:55.814	s-mst4952d-t20wzch8
5c5cc9dc-fc49-4c4a-b43b-0b3b24511ea3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 00:55:59.715	2026-08-26 00:55:59.715	s-mst4952d-t20wzch8
339b8874-03d8-4090-857c-5d046601072c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 00:56:01.102	2026-08-26 00:56:01.102	s-mst4952d-t20wzch8
9c514a3b-e22c-4514-b962-3ac6c510005d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 00:56:03.499	2026-08-26 00:56:03.499	s-mst4952d-t20wzch8
1867f91e-a058-4dd8-afcf-a755af4ae2dc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 00:56:04.478	2026-08-26 00:56:04.478	s-mst4952d-t20wzch8
ed4233e0-cde7-4352-8607-fd0e8aedb72d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-26 00:56:11.404	2026-08-26 00:56:11.404	s-mst4952d-t20wzch8
52100c6c-3af4-443e-abce-316a9e3ab476	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 00:56:44.916	2026-08-26 00:56:44.916	s-mst4952d-t20wzch8
65295aa5-e707-4ba9-b840-eaa14f4cf8ab	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:56:47.67	2026-08-26 00:56:47.67	s-msjq5trg-2yy0t8o0
9a6b0739-c2ab-4228-866b-51a17045f8da	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:56:50.765	2026-08-26 00:56:50.765	s-msjq5trg-2yy0t8o0
097cc5cb-b56c-40d1-9558-4812f89238dd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:56:50.784	2026-08-26 00:56:50.784	s-msjq5trg-2yy0t8o0
f7e2172a-4105-4226-b324-f8561109678e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 00:56:57.68	2026-08-26 00:56:57.68	s-msjq5trg-2yy0t8o0
69e1656e-c5c5-4912-bbbf-c044c7df4546	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:57:01.738	2026-08-26 00:57:01.738	s-msjq5trg-2yy0t8o0
f8bf615a-5d41-4e10-9220-38939fa8f8ae	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 00:57:10.581	2026-08-26 00:57:10.581	s-msjq5trg-2yy0t8o0
ad9f8d99-818f-4e0b-84d7-5011023e5cf7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:57:11.039	2026-08-26 00:57:11.039	s-msjq5trg-2yy0t8o0
2f3d6a61-c449-4778-9413-eb218c8ec74a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 00:57:11.042	2026-08-26 00:57:11.042	s-msjq5trg-2yy0t8o0
c7f2ee73-801f-4f89-8ee1-49bdaa1d4ad7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:57:18.939	2026-08-26 00:57:18.939	s-msjq5trg-2yy0t8o0
0bc0d3a1-fc17-484e-8a4f-5bb4e03eedc8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:57:23.866	2026-08-26 00:57:23.866	s-msjq5trg-2yy0t8o0
ad7d4c8f-013f-4d9b-bcf7-8bee246de86a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/semente-soja-transgenica-rr	2026-08-26 00:57:26.239	2026-08-26 00:57:26.239	s-msjq5trg-2yy0t8o0
fb8034d5-0623-40ed-96e7-3db84f9dca1a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 00:57:34.056	2026-08-26 00:57:34.056	s-msjq5trg-2yy0t8o0
d7cc93d5-f91d-4411-bc3b-8f4ad9d571ee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:56:15.28	2026-09-05 18:56:15.28	s-msjq5trg-2yy0t8o0
66886a77-7ef4-4ea3-9d11-9a72b5b0f682	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:56:17.7	2026-09-05 18:56:17.7	s-msjq5trg-2yy0t8o0
807a27e7-a319-44c6-b660-d8af415187a6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 19:02:03.732	2026-09-05 19:02:03.732	s-msjq5trg-2yy0t8o0
3c8911cf-a205-4f49-a28d-a76b369df7bf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 19:09:06.937	2026-09-05 19:09:06.937	s-msjq5trg-2yy0t8o0
5dedc34c-dc96-4958-b544-350079db4c0b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 19:12:29.196	2026-09-05 19:12:29.196	s-mst4952d-t20wzch8
2f179ebb-ff29-4fe1-92a4-76ae3d07ff47	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 19:12:34.338	2026-09-05 19:12:34.338	s-msjq5trg-2yy0t8o0
29629aa5-4927-4e23-b17e-9f01c316dee0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:12:40.681	2026-09-05 19:12:40.681	s-msjq5trg-2yy0t8o0
f45fd5bd-7dfb-4f0f-a6e8-becb6f767a5d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:21:16.867	2026-09-05 19:21:16.867	s-msjq5trg-2yy0t8o0
ea177174-681b-4f64-a5cb-f9a9ce7f2329	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 20:20:24.676	2026-09-05 20:20:24.676	s-mst4952d-t20wzch8
5d1018f0-8fd3-437a-9545-8e2faa6b5626	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:25:45.652	2026-09-05 20:25:45.652	s-mst4952d-t20wzch8
204fb6e0-a350-486f-9254-42c4e43dc997	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:31:39.741	2026-09-05 20:31:39.741	s-msjq5trg-2yy0t8o0
a886ae22-0278-42b9-b965-a986dc488ac5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:33:54.5	2026-09-05 20:33:54.5	s-mst4952d-t20wzch8
f76932e6-b03e-4d64-9b2c-a80245d602cf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-09-05 20:35:54.675	2026-09-05 20:35:54.675	s-mst4952d-t20wzch8
fafa58e9-39b5-4e56-a698-437ee51be665	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 20:46:53.424	2026-09-05 20:46:53.424	s-mst4952d-t20wzch8
cbe72a69-47c7-4d30-acf4-852e052c2227	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640350218	2026-09-05 20:51:30.25	2026-09-05 20:51:30.25	s-msjq5trg-2yy0t8o0
247d8597-4321-4b9c-88eb-b7aa8fff81cd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:58:11.264	2026-09-05 20:58:11.264	s-mst4952d-t20wzch8
aef834c8-886e-4a51-b873-2eeda7cc622f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:27:59.376	2026-09-05 21:27:59.376	s-msjq5trg-2yy0t8o0
944d6072-133e-4f2e-910a-374c78ab00e3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 21:27:59.758	2026-09-05 21:27:59.758	s-msjq5trg-2yy0t8o0
c2befcbe-cad7-4922-839a-af9fd2e93dd4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 21:29:45.463	2026-09-05 21:29:45.463	s-mst4952d-t20wzch8
c84b51a7-ad53-47ef-9bd1-15ef9b34a2b1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:33:01.77	2026-09-05 21:33:01.77	s-mst4952d-t20wzch8
5d868bb8-7aa4-4827-838d-d55742b52f9b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:33:07	2026-09-05 21:33:07	s-msjq5trg-2yy0t8o0
1d385912-f654-4f46-8b70-b3308f55dbb3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:41:06.728	2026-09-05 21:41:06.728	s-mst4952d-t20wzch8
76903af5-9cd3-47ea-be21-3a79fbd3fc18	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 21:41:11.813	2026-09-05 21:41:11.813	s-mst4952d-t20wzch8
714202a8-2cdf-4e60-80eb-802ccf101c82	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:43:56.912	2026-09-05 21:43:56.912	s-mst4952d-t20wzch8
57b589ac-3b0d-47c9-8818-e3a2c10b9e9a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:49:36.065	2026-09-05 21:49:36.065	s-msjq5trg-2yy0t8o0
3a4de1fc-0f01-4745-8c5d-8bff234a3984	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-06 00:59:30.78	2026-09-06 00:59:30.78	s-msjq5trg-2yy0t8o0
461ca104-83ea-4bdd-a61b-0633a4f89dc9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 00:57:38.998	2026-08-26 00:57:38.998	s-msjq5trg-2yy0t8o0
f8c551cd-7034-4108-b269-9d2fb2447806	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 00:57:52.683	2026-08-26 00:57:52.683	s-msjq5trg-2yy0t8o0
4c56c7ae-7a33-4733-bb30-3b0fb8a2faa1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 00:57:54.537	2026-08-26 00:57:54.537	s-msjq5trg-2yy0t8o0
f24e9a54-783c-41a6-b405-2edc2ba005e2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:57:57.787	2026-08-26 00:57:57.787	s-msjq5trg-2yy0t8o0
5bc59806-e1b7-4843-8d45-ad876176585b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-26 00:58:03.184	2026-08-26 00:58:03.184	s-mst4952d-t20wzch8
d83db6a5-7697-4f66-8321-f107b6fdb410	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 00:58:04.898	2026-08-26 00:58:04.898	s-mst4952d-t20wzch8
a3262416-5b0f-40a9-9978-c1b6b5b2e385	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:58:13.498	2026-08-26 00:58:13.498	s-msjq5trg-2yy0t8o0
e99cfbd1-0626-4bc1-9c1f-b3d9e8880368	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 00:58:13.507	2026-08-26 00:58:13.507	s-msjq5trg-2yy0t8o0
660e5bf3-d578-46be-a80c-3976e1c0cd6e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 00:58:58.767	2026-08-26 00:58:58.767	s-msjq5trg-2yy0t8o0
dc846f48-9d08-4e91-b533-255acffcc980	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 00:59:01.992	2026-08-26 00:59:01.992	s-msjq5trg-2yy0t8o0
3244153c-28c2-4385-a778-9c892d4f7529	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 00:59:04.883	2026-08-26 00:59:04.883	s-msjq5trg-2yy0t8o0
994f1ac5-9c0f-4b41-ba2c-2d9e0b9bc9b3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 00:59:56.646	2026-08-26 00:59:56.646	s-msjq5trg-2yy0t8o0
4e757924-97e4-411d-8a13-061f3be941bd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:00:06.376	2026-08-26 01:00:06.376	s-msjq5trg-2yy0t8o0
42d548db-4114-4880-b930-774588a2793e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 01:00:19.825	2026-08-26 01:00:19.825	s-msjq5trg-2yy0t8o0
af99e05d-a1de-461c-90e4-5576db7afba3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:00:22.105	2026-08-26 01:00:22.105	s-msjq5trg-2yy0t8o0
418fa1ee-4f7e-4403-ae01-ee228408c868	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:00:53.28	2026-08-26 01:00:53.28	s-msjq5trg-2yy0t8o0
917bed65-7bc7-4430-a0bd-290f4800eea1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:01:00.631	2026-08-26 01:01:00.631	s-msjq5trg-2yy0t8o0
33447e88-79ed-4c9e-9d52-8366d699dfd5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:01:07.897	2026-08-26 01:01:07.897	s-msjq5trg-2yy0t8o0
7af59431-de0c-434f-a0ec-8b71870198b9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:01:09.654	2026-08-26 01:01:09.654	s-msjq5trg-2yy0t8o0
336b713c-3c75-4406-80d0-66f396d01618	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:01:11.298	2026-08-26 01:01:11.298	s-msjq5trg-2yy0t8o0
947db15d-1a35-4880-a3fb-62208db9f36f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:01:12.818	2026-08-26 01:01:12.818	s-msjq5trg-2yy0t8o0
7433b96e-1642-42ef-998c-b0dac5bd24b1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:02:02.426	2026-08-26 01:02:02.426	s-msjq5trg-2yy0t8o0
5d43ee05-34dc-4580-80ea-a6c80ff4292d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:02:06.627	2026-08-26 01:02:06.627	s-msjq5trg-2yy0t8o0
8a449ccb-4e1a-4681-9b04-4097064781f4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:02:17.818	2026-08-26 01:02:17.818	s-msjq5trg-2yy0t8o0
9e89a383-ef0a-4f1e-8ee8-baf26ebcd62e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:02:19.211	2026-08-26 01:02:19.211	s-msjq5trg-2yy0t8o0
edf5391d-ca75-4e3b-a52c-2dcef6e2e3dd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:03:52.217	2026-08-26 01:03:52.217	s-msjq5trg-2yy0t8o0
ddf2f047-fcc7-4f1a-b371-ab9cbc7c35bc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:03:52.243	2026-08-26 01:03:52.243	s-msjq5trg-2yy0t8o0
00397c6c-d252-430c-84ef-8b5df863b9b2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:03:59.607	2026-08-26 01:03:59.607	s-msjq5trg-2yy0t8o0
fba05589-806b-4916-ac4c-3202af581ac2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:04:08.103	2026-08-26 01:04:08.103	s-msjq5trg-2yy0t8o0
d0939685-3f88-4d66-8cbf-63e6283dd981	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:04:10.977	2026-08-26 01:04:10.977	s-msjq5trg-2yy0t8o0
d54c6be2-9bcc-4457-8ab1-0b813abdc062	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:04:38.689	2026-08-26 01:04:38.689	s-msjq5trg-2yy0t8o0
63710187-07bc-402e-968f-059bdff5d592	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:04:39.25	2026-08-26 01:04:39.25	s-msjq5trg-2yy0t8o0
1c043902-c618-4119-a9ad-585596825e8c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:04:46.594	2026-08-26 01:04:46.594	s-msjq5trg-2yy0t8o0
9de79321-97ed-40ac-b2b7-dd1ff831098b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:05:23.03	2026-08-26 01:05:23.03	s-msjq5trg-2yy0t8o0
845e0ed5-e4b7-4d11-abbd-2419fbf340da	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:05:35.779	2026-08-26 01:05:35.779	s-msjq5trg-2yy0t8o0
5dac6b46-6468-4d21-b5e3-fabf0a9449d8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:10:57.896	2026-08-26 01:10:57.896	s-mst4952d-t20wzch8
f1bc93ab-82ab-4886-8afa-c354f8ef2006	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:10:57.902	2026-08-26 01:10:57.902	s-mst4952d-t20wzch8
dbd04aac-9e4b-4c2b-9967-9892d58460b6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 01:10:58.212	2026-08-26 01:10:58.212	s-mst4952d-t20wzch8
f26026e9-edf0-4545-ba09-41bf889843c7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:11:01.344	2026-08-26 01:11:01.344	s-msjq5trg-2yy0t8o0
aedcd92f-adf5-4be8-bc85-772fc9d3e35d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:11:01.361	2026-08-26 01:11:01.361	s-msjq5trg-2yy0t8o0
539780ec-d13e-4d35-a5dc-ec4a22b8bbf1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:11:35.844	2026-08-26 01:11:35.844	s-msjq5trg-2yy0t8o0
e198b551-b0a9-4051-8805-b118a3fc2639	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:11:39.412	2026-08-26 01:11:39.412	s-msjq5trg-2yy0t8o0
42f66367-4003-4195-b51a-b46d68322061	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:11:41.189	2026-08-26 01:11:41.189	s-msjq5trg-2yy0t8o0
fbac613a-7e8b-4d07-a669-6a2ead86226e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:12:12.711	2026-08-26 01:12:12.711	s-msjq5trg-2yy0t8o0
26fea234-97ac-4796-ab49-4a12fcb3147a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:12:15.329	2026-08-26 01:12:15.329	s-msjq5trg-2yy0t8o0
bb564128-4667-44ab-ab8a-77fda954d155	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 01:12:18.207	2026-08-26 01:12:18.207	s-msjq5trg-2yy0t8o0
faab0ac6-2103-4d11-ac62-48a1117df92b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 01:12:18.824	2026-08-26 01:12:18.824	s-msjq5trg-2yy0t8o0
faa1cf1f-0390-4eb0-bd56-932793e98d71	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 01:12:18.829	2026-08-26 01:12:18.829	s-msjq5trg-2yy0t8o0
4ec36aff-61f4-4ba1-be2b-d8139e336e50	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:12:26.079	2026-08-26 01:12:26.079	s-msjq5trg-2yy0t8o0
7deeddb0-9da3-415b-a601-ed647f136d58	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:12:57.609	2026-08-26 01:12:57.609	s-msjq5trg-2yy0t8o0
f8f93ea5-444d-4097-8028-27cc19847b95	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:12:59.949	2026-08-26 01:12:59.949	s-msjq5trg-2yy0t8o0
9bf03e65-1143-4bd9-b816-e18d556cdea2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 01:18:31.024	2026-08-26 01:18:31.024	s-mst4952d-t20wzch8
27154b97-a13e-4062-9e70-9d566ef09bcf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin	2026-08-26 01:19:01.851	2026-08-26 01:19:01.851	s-mt7p2nx9-hd2ve7zi
2eaae75e-699c-4634-bf20-51c5378a1200	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin	2026-08-26 01:19:01.849	2026-08-26 01:19:01.849	s-mt7p2nx9-hd2ve7zi
4e1c723d-3c74-43b4-92a6-ec99737b6b2a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/auth/login	2026-08-26 01:19:02.3	2026-08-26 01:19:02.3	s-mt7p2nx9-hd2ve7zi
1c7fb852-c128-4844-86a8-95d845d7daaa	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/auth/register	2026-08-26 01:19:15.119	2026-08-26 01:19:15.119	s-mt7p2nx9-hd2ve7zi
191bf007-740f-4908-97b9-146cccd5aaf8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 01:19:50.33	2026-08-26 01:19:50.33	s-mt7p2nx9-hd2ve7zi
22ab3a26-bf7b-446e-b7a6-101d85a85222	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products	2026-08-26 01:19:57.844	2026-08-26 01:19:57.844	s-mt7p2nx9-hd2ve7zi
10f772f4-959d-4ace-98d6-bfe00d32fa38	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:20:00.304	2026-08-26 01:20:00.304	s-mt7p2nx9-hd2ve7zi
634d51f7-8f77-4b4a-9d3d-77f6c6b7be7b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/cart	2026-08-26 01:20:03.569	2026-08-26 01:20:03.569	s-mt7p2nx9-hd2ve7zi
9470f898-e515-40d8-a748-ef4cd3e3f0f2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/checkout	2026-08-26 01:20:38.47	2026-08-26 01:20:38.47	s-mt7p2nx9-hd2ve7zi
7e67db66-4787-40a3-8930-7c6e8b0a22c6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:20:56.813	2026-08-26 01:20:56.813	s-mt7p2nx9-hd2ve7zi
127f558e-ff01-4a04-9ea6-b3c76fea0781	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:21:00.969	2026-08-26 01:21:00.969	s-mst4952d-t20wzch8
0994ec3b-da4d-4d1d-91c9-21d1c4c4554e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:21:14.027	2026-08-26 01:21:14.027	s-mt7p2nx9-hd2ve7zi
a6214f87-07eb-42fd-b898-e73387ab7282	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:21:13.99	2026-08-26 01:21:13.99	s-mt7p2nx9-hd2ve7zi
40eed444-3905-4cfa-965f-7a9c28e4f190	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 01:21:40.066	2026-08-26 01:21:40.066	s-mt7p2nx9-hd2ve7zi
05124140-8088-481b-9231-c720c122d0b3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products	2026-08-26 01:21:42.083	2026-08-26 01:21:42.083	s-mt7p2nx9-hd2ve7zi
61f9dde8-665a-4cb9-be22-41f753e9a450	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:21:44.293	2026-08-26 01:21:44.293	s-mt7p2nx9-hd2ve7zi
470ade74-45fd-41d0-bc5c-fa5ca6326407	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:22:47.538	2026-08-26 01:22:47.538	s-mst4952d-t20wzch8
7074c813-2be1-43a9-ab45-30f87509d0fa	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:22:47.533	2026-08-26 01:22:47.533	s-mst4952d-t20wzch8
869609b8-0628-4700-87de-e46d236f8a0a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:22:51.783	2026-08-26 01:22:51.783	s-msjq5trg-2yy0t8o0
42cbc7c8-44d1-475a-bb36-04df223fb737	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:22:51.817	2026-08-26 01:22:51.817	s-msjq5trg-2yy0t8o0
3f5908e7-9e4e-4140-99e7-9f0f6e8cdf4d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:22:53.902	2026-08-26 01:22:53.902	s-mt7p2nx9-hd2ve7zi
e3453f2f-473d-4f86-b0a9-27456ede1923	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:22:53.898	2026-08-26 01:22:53.898	s-mt7p2nx9-hd2ve7zi
a6da3d9a-a95e-4851-8ff1-e21f036ee53c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:23:17.567	2026-08-26 01:23:17.567	s-mt7p2nx9-hd2ve7zi
2d94fd32-5bf6-4e57-b32e-f88a9e7a3e0c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:23:17.58	2026-08-26 01:23:17.58	s-mt7p2nx9-hd2ve7zi
44f67d64-8cdc-478f-86d2-752ae6e5cf22	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 01:23:21.529	2026-08-26 01:23:21.529	s-mst4952d-t20wzch8
26ee9774-a6c0-4f3b-ad3b-bafd4a801748	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 01:23:23.253	2026-08-26 01:23:23.253	s-mst4952d-t20wzch8
82c1f37b-dd0c-44b0-ae29-c024d540acc2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-26 01:23:26.015	2026-08-26 01:23:26.015	s-mst4952d-t20wzch8
f1d63b1e-8fe3-4606-9d12-dfd7030befdd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto2-1787705804451	2026-08-26 01:23:27.617	2026-08-26 01:23:27.617	s-mst4952d-t20wzch8
540f9346-8723-46ef-9fd7-bdb488f80c13	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:23:43.858	2026-08-26 01:23:43.858	s-mst4952d-t20wzch8
b51eade4-d94e-439d-95e7-e82474f3e884	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 01:23:45.771	2026-08-26 01:23:45.771	s-mst4952d-t20wzch8
a982594c-0b13-4fd4-9122-0f7f19972ffc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 01:23:48.35	2026-08-26 01:23:48.35	s-mst4952d-t20wzch8
4b5076a9-20ba-4643-958e-7d319be0494f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/dashboard	2026-08-26 01:23:51.167	2026-08-26 01:23:51.167	s-mst4952d-t20wzch8
ff4d0f28-b5e9-413f-8a6a-d7a4f964be2d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-26 01:23:53.63	2026-08-26 01:23:53.63	s-mst4952d-t20wzch8
5ad688b0-a5f4-4efa-8fde-a699b43ac0c8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/cart	2026-08-26 01:24:01.135	2026-08-26 01:24:01.135	s-mst4952d-t20wzch8
08725d43-5e5c-4605-9ea4-e1f2f2c96f84	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-26 01:24:01.78	2026-08-26 01:24:01.78	s-mst4952d-t20wzch8
f3968eca-e9c2-4253-8c8d-eb407c0be038	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto2-1787705804451	2026-08-26 01:24:02.791	2026-08-26 01:24:02.791	s-mst4952d-t20wzch8
fed0b33f-f38c-4574-808a-1fd13968aae5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/cart	2026-08-26 01:24:06.053	2026-08-26 01:24:06.053	s-mst4952d-t20wzch8
a444d5af-505c-4251-8f9d-74fb53ea7f3b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/checkout	2026-08-26 01:24:07.135	2026-08-26 01:24:07.135	s-mst4952d-t20wzch8
2def8f7b-284f-4ddc-be18-9e88c0cfc153	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-26 01:24:09.93	2026-08-26 01:24:09.93	s-mst4952d-t20wzch8
a92ee836-188e-4d8d-8909-0a5be6f02df1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 01:24:16.921	2026-08-26 01:24:16.921	s-mst4952d-t20wzch8
cc6b0c3b-86c6-4cd3-94cb-6096b25c7730	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 01:24:18.637	2026-08-26 01:24:18.637	s-mst4952d-t20wzch8
ede811ab-d807-463c-b592-b2057f5599ad	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:24:20.115	2026-08-26 01:24:20.115	s-mst4952d-t20wzch8
37a3f8eb-b88c-4508-863a-b35f72f4fc82	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 01:24:29.464	2026-08-26 01:24:29.464	s-mst4952d-t20wzch8
9e016860-2a8d-4822-8798-3308b6b45d29	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:24:32.259	2026-08-26 01:24:32.259	s-mst4952d-t20wzch8
a4dee2f8-812f-4ba9-b380-a358dd3bc062	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 01:24:38.823	2026-08-26 01:24:38.823	s-mst4952d-t20wzch8
f7e4662e-4e1e-4a94-bbed-119f27d3cc85	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/dashboard	2026-08-26 01:24:41.554	2026-08-26 01:24:41.554	s-mst4952d-t20wzch8
2f569e7a-a338-43d2-a3b3-da0b16c64bbd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-26 01:24:42.96	2026-08-26 01:24:42.96	s-mst4952d-t20wzch8
5172fe4b-360d-469e-b79e-f12e1fc50a5b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-26 01:25:00.915	2026-08-26 01:25:00.915	s-mst4952d-t20wzch8
03af98c0-475a-4eda-8e7a-9769dc63fcd0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-26 01:25:00.941	2026-08-26 01:25:00.941	s-mst4952d-t20wzch8
1d49e509-3b59-4cef-8ba9-81f8ead4ca05	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 01:25:02.588	2026-08-26 01:25:02.588	s-mst4952d-t20wzch8
51e50821-8337-4db5-972e-6cd4d8b82b50	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-26 01:25:04.738	2026-08-26 01:25:04.738	s-mst4952d-t20wzch8
37afca31-6560-429c-99d6-a31e8b4737b5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto2-1787705804451	2026-08-26 01:25:05.682	2026-08-26 01:25:05.682	s-mst4952d-t20wzch8
6b003ca8-4954-4294-a8da-6e13252a403d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:25:16.234	2026-08-26 01:25:16.234	s-mt7p2nx9-hd2ve7zi
249c6724-70a7-4148-afcb-9eed97b5e189	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:25:16.243	2026-08-26 01:25:16.243	s-mt7p2nx9-hd2ve7zi
1007c1a5-9e05-481d-bd85-f86e6375e164	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:25:29.804	2026-08-26 01:25:29.804	s-msjq5trg-2yy0t8o0
c0957f31-8662-46ce-8ddf-ce0f0dfb5d09	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:25:29.808	2026-08-26 01:25:29.808	s-msjq5trg-2yy0t8o0
e9171bce-c535-4c6b-b182-25a2cc46a1a9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:26:06.039	2026-08-26 01:26:06.039	s-mt7p2nx9-hd2ve7zi
11ca206b-1b7b-499f-a0b5-272c4c9d9b92	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:26:06.049	2026-08-26 01:26:06.049	s-mt7p2nx9-hd2ve7zi
11dcb8a9-07f8-4eaa-8e03-64553c2b7b75	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:26:21.142	2026-08-26 01:26:21.142	s-mt7p2nx9-hd2ve7zi
b55710db-ccb4-4adb-aecf-1db2d81dc7e9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:28:14.993	2026-08-26 01:28:14.993	s-mst4952d-t20wzch8
f73ad604-8d0e-4439-9aa5-ba9a4e86de72	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:31:15.18	2026-08-26 01:31:15.18	s-mst4952d-t20wzch8
157517b0-087f-4f2e-88f3-cd6c6c46154a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:31:15.214	2026-08-26 01:31:15.214	s-mst4952d-t20wzch8
a15794f7-dc1d-4763-b629-6c8d80f9f338	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:31:17.064	2026-08-26 01:31:17.064	s-mt7p2nx9-hd2ve7zi
3d476faa-079c-4106-8e0f-a3a01c2644e6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:31:17.2	2026-08-26 01:31:17.2	s-mt7p2nx9-hd2ve7zi
b9af4cf3-404f-45a5-a1f6-1db9c60bb054	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:31:46.548	2026-08-26 01:31:46.548	s-mst4952d-t20wzch8
c64d5ef9-cbaf-4942-a5cc-c4dba74e4fd2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:31:46.479	2026-08-26 01:31:46.479	s-mst4952d-t20wzch8
dd949122-bfe0-4d66-baee-0f0fa087991b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/dashboard	2026-08-26 01:31:56.623	2026-08-26 01:31:56.623	s-mst4952d-t20wzch8
a419acb5-997a-4e92-ac81-2a307e519132	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/orders	2026-08-26 01:31:59.503	2026-08-26 01:31:59.503	s-mst4952d-t20wzch8
6c498959-1a32-485e-8850-472404852462	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 01:32:36.739	2026-08-26 01:32:36.739	s-msjq5trg-2yy0t8o0
c2a96af1-e03c-4d0c-9278-a1b1bd02c57c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 01:32:36.75	2026-08-26 01:32:36.75	s-msjq5trg-2yy0t8o0
8b713978-d7a1-490a-af3c-e69667577b2f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:32:51.206	2026-08-26 01:32:51.206	s-msjq5trg-2yy0t8o0
316c5b23-1304-422b-8c02-06b20e19a8b8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:32:55.614	2026-08-26 01:32:55.614	s-msjq5trg-2yy0t8o0
11a7b315-236a-4a5d-b35d-b7113e6d3a91	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:32:56.693	2026-08-26 01:32:56.693	s-msjq5trg-2yy0t8o0
7bccd831-9f86-4967-9db1-9d82823c7ada	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:56:17.695	2026-09-05 18:56:17.695	s-msjq5trg-2yy0t8o0
d90debe3-71ee-4f22-a3e6-a5ed413c1d04	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 19:02:03.727	2026-09-05 19:02:03.727	s-msjq5trg-2yy0t8o0
0291ced8-b13d-4054-9930-a255d51378cc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-05 19:09:17.489	2026-09-05 19:09:17.489	s-msjq5trg-2yy0t8o0
1029f765-68e6-4397-bb9c-ba8acc796224	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:09:18.578	2026-09-05 19:09:18.578	s-msjq5trg-2yy0t8o0
c6037be3-3343-42cf-8e44-86e614672beb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-05 19:16:04.699	2026-09-05 19:16:04.699	s-msjq5trg-2yy0t8o0
be4804ef-1c4c-4f0d-9107-953c5e46265b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:16:06.642	2026-09-05 19:16:06.642	s-msjq5trg-2yy0t8o0
6ed5b27b-c513-4fa8-aa04-b98a31622971	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-09-05 19:21:18.193	2026-09-05 19:21:18.193	s-msjq5trg-2yy0t8o0
b77e96aa-aec4-4d3b-b143-04326f575e9f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:20:25.848	2026-09-05 20:20:25.848	s-mst4952d-t20wzch8
a261bc78-1daa-4e80-8be2-63232c4a3b2f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:25:45.66	2026-09-05 20:25:45.66	s-mst4952d-t20wzch8
f3b8eb08-629e-4b5c-aa76-6dbaf37ab2ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:31:45.518	2026-09-05 20:31:45.518	s-mst4952d-t20wzch8
d8923171-d813-4e82-9141-acf3ede4a503	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:31:52.305	2026-09-05 20:31:52.305	s-mst4952d-t20wzch8
97bbe63b-da83-4b2b-be79-c3e0fb3ce75f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640350218	2026-09-05 20:33:56.789	2026-09-05 20:33:56.789	s-msjq5trg-2yy0t8o0
70eaa985-607e-4a99-ac8d-fb8b5b5fe74d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-05 20:34:02.609	2026-09-05 20:34:02.609	s-msjq5trg-2yy0t8o0
bcd12715-3380-49dc-9903-fd67da82e3ce	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/products/produtoservio-1788640434418	2026-09-05 20:36:00.592	2026-09-05 20:36:00.592	s-mst4952d-t20wzch8
01be8ff9-25a6-4d9b-bbb2-2b5e8a5abadb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:46:54.512	2026-09-05 20:46:54.512	s-mst4952d-t20wzch8
27f277a5-4175-4b3d-bd45-e633d4c8e832	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:51:32.74	2026-09-05 20:51:32.74	s-msjq5trg-2yy0t8o0
dde619ea-8cda-4501-afc8-2477a61035a9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:51:35.347	2026-09-05 20:51:35.347	s-msjq5trg-2yy0t8o0
54404afb-45a4-4574-bda5-9d0eecd93b36	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:59:34.541	2026-09-05 20:59:34.541	s-msjq5trg-2yy0t8o0
b847274c-3462-42b6-998f-f6bcfd534271	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:28:06.6	2026-09-05 21:28:06.6	s-msjq5trg-2yy0t8o0
dbd3135e-5eb8-49be-ad9b-16014f4186a0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:30:33.149	2026-09-05 21:30:33.149	s-msjq5trg-2yy0t8o0
e2db50a8-92fe-4387-ac2d-f49378d9e91c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:33:06.992	2026-09-05 21:33:06.992	s-msjq5trg-2yy0t8o0
9d126da0-78a9-4ad2-a53b-c11893d333b2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:41:06.74	2026-09-05 21:41:06.74	s-mst4952d-t20wzch8
3f9dadf7-462c-4e3f-b3b0-d3b6633d7fb1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:45:40.647	2026-09-05 21:45:40.647	s-msjq5trg-2yy0t8o0
522d0d7a-46c3-448e-9a11-4de5bd8318d3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:49:36.069	2026-09-05 21:49:36.069	s-msjq5trg-2yy0t8o0
d1b24a7e-c637-405b-a4e7-e04fb659ae63	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-06 00:59:48.638	2026-09-06 00:59:48.638	s-msjq5trg-2yy0t8o0
04029ff9-66f3-4558-a0d9-05aecfbedefe	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-06 01:05:00.129	2026-09-06 01:05:00.129	s-msjq5trg-2yy0t8o0
a86541db-209e-4a3f-ab21-1cf52b7920cf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-06 01:05:32.652	2026-09-06 01:05:32.652	s-msjq5trg-2yy0t8o0
eca927a1-ac90-486e-b19f-84f018f0dccd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:06:13.399	2026-09-06 01:06:13.399	s-msjq5trg-2yy0t8o0
bf9c7562-8585-406b-addc-ae5265be0dc4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:33:00.569	2026-08-26 01:33:00.569	s-msjq5trg-2yy0t8o0
d82b5ef2-aa56-420b-abbd-edbd4ab814c0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:33:31.772	2026-08-26 01:33:31.772	s-msjq5trg-2yy0t8o0
c4aa5614-fd3d-4e08-8fe9-321f2cec9b7d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:33:34.06	2026-08-26 01:33:34.06	s-msjq5trg-2yy0t8o0
8a4444b6-9794-47c0-8ce8-4eee49150cd5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/dashboard	2026-08-26 01:35:08.057	2026-08-26 01:35:08.057	s-mt7p2nx9-hd2ve7zi
f2c7c682-896c-44f1-8a03-33c96483a0af	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/auth/login	2026-08-26 01:35:10.515	2026-08-26 01:35:10.515	s-mt7p2nx9-hd2ve7zi
3844a777-165d-45e6-9526-3074eb7a98ba	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/auth/login	2026-08-26 01:35:10.522	2026-08-26 01:35:10.522	s-mt7p2nx9-hd2ve7zi
f99299b8-13c4-47b4-8489-da9554eaeb04	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 01:35:43.452	2026-08-26 01:35:43.452	s-mt7p2nx9-hd2ve7zi
4873a8ee-3c55-441a-918e-640d5648bb4f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/dashboard	2026-08-26 01:35:44.997	2026-08-26 01:35:44.997	s-mt7p2nx9-hd2ve7zi
dfd03d2e-158a-4a71-a9bd-475975a8db29	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:35:46.037	2026-08-26 01:35:46.037	s-mt7p2nx9-hd2ve7zi
5d223797-ea9c-4bf7-aaff-0c4a193a8f2c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/cart	2026-08-26 01:36:12.381	2026-08-26 01:36:12.381	s-mt7p2nx9-hd2ve7zi
cb01c8eb-2a7d-4d01-abd1-b79da6643e17	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products	2026-08-26 01:36:13.893	2026-08-26 01:36:13.893	s-mt7p2nx9-hd2ve7zi
bf2ded12-8fc2-4372-9194-0515e77f25fd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto2-1787705804451	2026-08-26 01:36:19.102	2026-08-26 01:36:19.102	s-mt7p2nx9-hd2ve7zi
3c9eb534-3c41-4a5c-9bda-912b0ece4498	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/dashboard	2026-08-26 01:36:20.382	2026-08-26 01:36:20.382	s-mt7p2nx9-hd2ve7zi
0b317a0d-1fe3-4c13-882c-aa3dc75df5df	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products	2026-08-26 01:36:21.888	2026-08-26 01:36:21.888	s-mt7p2nx9-hd2ve7zi
bd7c967b-dfed-4703-8bf0-aa76fd68ecc6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/dashboard	2026-08-26 01:36:23.992	2026-08-26 01:36:23.992	s-mt7p2nx9-hd2ve7zi
605b86cf-a709-42ed-981a-86c1877d2262	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:36:24.858	2026-08-26 01:36:24.858	s-mt7p2nx9-hd2ve7zi
c9199d9e-f3a3-4a74-b164-e0e05dff6907	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/dashboard	2026-08-26 01:36:59.999	2026-08-26 01:36:59.999	s-mt7p2nx9-hd2ve7zi
26abbca2-c5cb-461b-b613-fcf266dc3f2f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:37:01.84	2026-08-26 01:37:01.84	s-mt7p2nx9-hd2ve7zi
869e5e5b-55ee-4bfe-8a70-c9d5cb13f2c5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 01:39:02.519	2026-08-26 01:39:02.519	s-mt9fe19a-er6yt0qy
245793d0-75d6-41e3-9762-161edfee2970	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 01:39:02.621	2026-08-26 01:39:02.621	s-mt9fe19a-er6yt0qy
10d2916e-893f-4e79-9052-2a6502ebce2e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/cart	2026-08-26 01:40:37.387	2026-08-26 01:40:37.387	s-mt7p2nx9-hd2ve7zi
ffba2d82-9e9d-4b76-9d4b-d87eadfbc3b8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products	2026-08-26 01:40:38.346	2026-08-26 01:40:38.346	s-mt7p2nx9-hd2ve7zi
63cf18d1-a9c1-4892-afe9-382bd8cf7780	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/products/produto1-1787607936046	2026-08-26 01:40:41.751	2026-08-26 01:40:41.751	s-mt7p2nx9-hd2ve7zi
6b9a5439-51fd-402b-b7af-6e3151fa7b64	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/cart	2026-08-26 01:40:45.044	2026-08-26 01:40:45.044	s-mt7p2nx9-hd2ve7zi
c987b79a-a8fe-43ef-acf2-af72a8c04567	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/checkout	2026-08-26 01:40:47.421	2026-08-26 01:40:47.421	s-mt7p2nx9-hd2ve7zi
fdba90cc-f4ff-429e-8bc9-b9187b73fd21	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:40:54.804	2026-08-26 01:40:54.804	s-mt7p2nx9-hd2ve7zi
dea0f741-2cd3-4539-a8ef-94bc98f58088	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 01:40:58.228	2026-08-26 01:40:58.228	s-mst4952d-t20wzch8
f20789ed-0ab8-49be-9e14-de84370806a5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 01:40:58.236	2026-08-26 01:40:58.236	s-mst4952d-t20wzch8
747cbae8-4862-47f4-928f-8bf69f25b2d9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 01:41:05.171	2026-08-26 01:41:05.171	s-mst4952d-t20wzch8
ed5f7ff8-a048-4004-b4d8-daaf3641273b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 01:41:08.671	2026-08-26 01:41:08.671	s-mst4952d-t20wzch8
64792d1b-1ef9-4823-be5c-a4e95cbef9fd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:41:10.766	2026-08-26 01:41:10.766	s-mst4952d-t20wzch8
53c3ffde-44d7-42e0-aadd-ec652abe75eb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:41:22.843	2026-08-26 01:41:22.843	s-mt7p2nx9-hd2ve7zi
b68be7c0-0b2a-4614-89bd-d81e315df058	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:41:22.838	2026-08-26 01:41:22.838	s-mt7p2nx9-hd2ve7zi
eb43b142-b543-4662-89c8-8d8db9d60844	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:42:25.795	2026-08-26 01:42:25.795	s-mst4952d-t20wzch8
21e1bb1c-44d0-44cd-bf70-f76c1eaf15db	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:42:25.8	2026-08-26 01:42:25.8	s-mst4952d-t20wzch8
5e9894d3-2a60-406b-a580-7c7780628f67	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:42:27.679	2026-08-26 01:42:27.679	s-mt7p2nx9-hd2ve7zi
db5e4b28-fe1c-4065-9e86-e29c0d1370b1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/orders	2026-08-26 01:42:27.649	2026-08-26 01:42:27.649	s-mt7p2nx9-hd2ve7zi
d940fb37-5874-4c12-aff2-66eef5f5975f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 01:42:58.003	2026-08-26 01:42:58.003	s-mt7p2nx9-hd2ve7zi
9937527b-d92b-4a49-bb02-628bad8a3bc4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/suppliers	2026-08-26 01:43:03.857	2026-08-26 01:43:03.857	s-mt7p2nx9-hd2ve7zi
2d794852-2c88-4085-84a1-5b3600bc1766	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:43:10.173	2026-08-26 01:43:10.173	s-mt7p2nx9-hd2ve7zi
77faaba8-3cc2-47df-91d5-a471bdea02e0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:43:29.193	2026-08-26 01:43:29.193	s-msjq5trg-2yy0t8o0
aabf95a7-f01b-4a55-9174-1bd2a043654f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:43:29.208	2026-08-26 01:43:29.208	s-msjq5trg-2yy0t8o0
41545c17-c2c8-463a-9444-dc1e98949297	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:43:33.388	2026-08-26 01:43:33.388	s-msjq5trg-2yy0t8o0
165c8177-cecf-4965-b0ad-a7621191d8bb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:43:43.27	2026-08-26 01:43:43.27	s-msjq5trg-2yy0t8o0
b22e7b81-3e67-4a8b-a6e6-70454c791ef7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/veiculo-utilitario-rural	2026-08-26 01:44:17.368	2026-08-26 01:44:17.368	s-msjq5trg-2yy0t8o0
5b7417e7-0419-4682-9176-8ee6668e7f54	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:44:27.902	2026-08-26 01:44:27.902	s-msjq5trg-2yy0t8o0
2567e67d-a6a0-4a8f-9537-970a5e749391	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:44:29.287	2026-08-26 01:44:29.287	s-msjq5trg-2yy0t8o0
d2c37996-609d-4ec2-866e-2a217e793267	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:44:30.773	2026-08-26 01:44:30.773	s-msjq5trg-2yy0t8o0
cf4aeaee-a5bc-44fc-8fe1-bd68241e4e74	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:44:32.703	2026-08-26 01:44:32.703	s-msjq5trg-2yy0t8o0
732d7ae9-a6a5-4096-b6c9-6a49be66ec5a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:44:42.208	2026-08-26 01:44:42.208	s-msjq5trg-2yy0t8o0
373d61f6-255d-41f3-999b-ddcb1f39c112	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:44:44.023	2026-08-26 01:44:44.023	s-msjq5trg-2yy0t8o0
a636ea09-0da3-47a9-897d-f0a00594359f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:44:49.278	2026-08-26 01:44:49.278	s-msjq5trg-2yy0t8o0
dd37e276-3b8a-4cdc-8ef5-ea42e84c4e07	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:44:51.753	2026-08-26 01:44:51.753	s-msjq5trg-2yy0t8o0
1fee7592-c118-4e3a-a189-b0fefd93689c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:44:53.418	2026-08-26 01:44:53.418	s-msjq5trg-2yy0t8o0
2a223ecd-7059-44fe-b4e7-b82303dd23de	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/veiculo-utilitario-rural	2026-08-26 01:44:54.856	2026-08-26 01:44:54.856	s-msjq5trg-2yy0t8o0
131d2534-3d6a-423d-b106-22fbfa66d7c7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:45:46.385	2026-08-26 01:45:46.385	s-msjq5trg-2yy0t8o0
e13c3d0d-acd9-4b51-a850-75ff590a330e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:45:49.576	2026-08-26 01:45:49.576	s-msjq5trg-2yy0t8o0
327b8079-edbb-4dfa-9880-dfc018d68d0b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:45:56.743	2026-08-26 01:45:56.743	s-msjq5trg-2yy0t8o0
caf9c296-6808-41d3-85d9-85f5b3d5aa67	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:45:58.376	2026-08-26 01:45:58.376	s-msjq5trg-2yy0t8o0
62e2abc5-5132-4b58-9900-6a7af13bad25	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:46:22.076	2026-08-26 01:46:22.076	s-msjq5trg-2yy0t8o0
6abd70da-5f15-4948-bde0-ff1db8c6ac56	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/veiculo-utilitario-rural	2026-08-26 01:46:23.966	2026-08-26 01:46:23.966	s-msjq5trg-2yy0t8o0
fbef6107-373d-4d64-850c-f1cfe100de69	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:46:33.69	2026-08-26 01:46:33.69	s-msjq5trg-2yy0t8o0
6ddef982-383b-484c-9877-bcb3cb075e60	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:46:35.935	2026-08-26 01:46:35.935	s-msjq5trg-2yy0t8o0
426d90fd-5209-490a-8122-4e6b103688ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:46:38.912	2026-08-26 01:46:38.912	s-msjq5trg-2yy0t8o0
51da2b78-53a5-4fcb-9647-5e37e90705d0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:46:44.301	2026-08-26 01:46:44.301	s-msjq5trg-2yy0t8o0
7ea05c61-ea5e-4bdf-801f-0ccbb3238683	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/veiculo-utilitario-rural	2026-08-26 01:47:02.26	2026-08-26 01:47:02.26	s-msjq5trg-2yy0t8o0
fca41267-d0de-4a86-988a-88175ca61d7c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:48:50.54	2026-08-26 01:48:50.54	s-msjq5trg-2yy0t8o0
ba77626c-db58-412e-85b2-52c1357e755b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:48:52.271	2026-08-26 01:48:52.271	s-msjq5trg-2yy0t8o0
0680f555-a47c-4e19-9710-c398aa556dca	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:51:07.909	2026-08-26 01:51:07.909	s-mst4952d-t20wzch8
90755884-4dfb-45c6-9b15-a83ae0c68ea5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 01:51:07.91	2026-08-26 01:51:07.91	s-mst4952d-t20wzch8
69c1dde2-596f-4eaf-9992-648ac578a5c9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:51:10.975	2026-08-26 01:51:10.975	s-msjq5trg-2yy0t8o0
4c22de6f-bf81-46a8-bd13-ef52dca6648c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:51:10.991	2026-08-26 01:51:10.991	s-msjq5trg-2yy0t8o0
efa332e9-f0d9-4cda-8ae3-354c888efbb9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:51:12.982	2026-08-26 01:51:12.982	s-mt7p2nx9-hd2ve7zi
2107da00-c15c-4f0a-a2cb-eb4af69ba4cb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:51:12.984	2026-08-26 01:51:12.984	s-mt7p2nx9-hd2ve7zi
18b4e207-8ff3-4ea7-bd3e-4fcff08f5a98	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:51:16.345	2026-08-26 01:51:16.345	s-msjq5trg-2yy0t8o0
e1e562e4-aa0b-418e-a9da-0c3aa9fb5c1c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:51:37.805	2026-08-26 01:51:37.805	s-msjq5trg-2yy0t8o0
c316ba7e-9b60-4594-a6ae-331e8da1f986	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:51:46.414	2026-08-26 01:51:46.414	s-msjq5trg-2yy0t8o0
3166a320-56e4-4e44-983d-19c857d80c94	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:51:52.243	2026-08-26 01:51:52.243	s-msjq5trg-2yy0t8o0
a9430299-a320-4de0-8447-9ec69f728ecc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:51:57.664	2026-08-26 01:51:57.664	s-msjq5trg-2yy0t8o0
24fd0121-3125-4362-a788-cf43bf663b9d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:52:04.805	2026-08-26 01:52:04.805	s-msjq5trg-2yy0t8o0
9bf1f8b2-313a-49cd-a513-13df34a9a990	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:52:07.67	2026-08-26 01:52:07.67	s-msjq5trg-2yy0t8o0
70db9ec6-f44e-4594-b920-507d8f9504b8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:52:16.589	2026-08-26 01:52:16.589	s-msjq5trg-2yy0t8o0
5d152acd-f9ac-4edb-95bc-331f8d0a7f82	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:52:23.445	2026-08-26 01:52:23.445	s-msjq5trg-2yy0t8o0
e02649e0-2ed5-4af9-8c56-f8d8546053ca	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:52:27.851	2026-08-26 01:52:27.851	s-msjq5trg-2yy0t8o0
3b352d6c-f224-4d88-a00e-babd87068046	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:52:29.939	2026-08-26 01:52:29.939	s-msjq5trg-2yy0t8o0
611ef5cd-7a55-4045-bb4e-b291af650293	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:52:31.848	2026-08-26 01:52:31.848	s-msjq5trg-2yy0t8o0
892cec5a-7125-4e09-a038-8b8295810378	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:52:32.842	2026-08-26 01:52:32.842	s-msjq5trg-2yy0t8o0
8803667a-00e9-459f-9c0d-e62c8fc47d64	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:52:49.547	2026-08-26 01:52:49.547	s-msjq5trg-2yy0t8o0
7625c15c-a14f-4f45-89a3-3c3e7728aa57	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 01:52:51.973	2026-08-26 01:52:51.973	s-msjq5trg-2yy0t8o0
3d122994-dc88-4a87-82ed-8aca5ad6455f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:52:54.135	2026-08-26 01:52:54.135	s-msjq5trg-2yy0t8o0
e71f02c3-5a13-4cf1-afeb-4e54705cb005	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 01:52:54.942	2026-08-26 01:52:54.942	s-msjq5trg-2yy0t8o0
b44e1115-4b03-4ee5-97ba-0d0088995903	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:53:11.549	2026-08-26 01:53:11.549	s-msjq5trg-2yy0t8o0
c357df7d-bc35-484d-8a9a-8ea2ad13cd35	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:53:34.146	2026-08-26 01:53:34.146	s-msjq5trg-2yy0t8o0
84503517-18ec-476b-9f55-ee2071052546	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:53:35.289	2026-08-26 01:53:35.289	s-msjq5trg-2yy0t8o0
1bb55afc-4c81-4871-b20b-a1db093097b0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:53:59.362	2026-08-26 01:53:59.362	s-msjq5trg-2yy0t8o0
adc6f90f-6bcc-40d3-96c3-cdbca1abd6ca	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:54:05.72	2026-08-26 01:54:05.72	s-msjq5trg-2yy0t8o0
aef2219d-f40b-4d11-b664-a79c0c857b3b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:54:05.73	2026-08-26 01:54:05.73	s-msjq5trg-2yy0t8o0
ed344a58-5fee-4f68-a512-fa4bcc54517e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-08-26 01:54:55.09	2026-08-26 01:54:55.09	s-mst4952d-t20wzch8
c4ad5c92-71f4-405a-bd48-815919c1f0d7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:55:07.5	2026-08-26 01:55:07.5	s-msjq5trg-2yy0t8o0
79593895-2b5a-400e-b8b3-f29ef9a416cf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:55:07.563	2026-08-26 01:55:07.563	s-msjq5trg-2yy0t8o0
7b91c113-651c-481f-9d92-ecb5cc3592bc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:56:38.373	2026-08-26 01:56:38.373	s-msjq5trg-2yy0t8o0
d304399f-762a-41fe-b898-d2e2e0d49af1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:56:39.546	2026-08-26 01:56:39.546	s-msjq5trg-2yy0t8o0
cc59f242-d46a-40ba-8808-a9bad272ddf6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:56:42.426	2026-08-26 01:56:42.426	s-msjq5trg-2yy0t8o0
3786151a-9b52-4c70-8327-1fb70a055ac0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:56:43.513	2026-08-26 01:56:43.513	s-msjq5trg-2yy0t8o0
f0471bfd-3fef-43c9-bb3d-8f99f4ab670b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:57:33.377	2026-08-26 01:57:33.377	s-msjq5trg-2yy0t8o0
8961776f-eda3-4858-ac65-43790c8b6104	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:57:34.317	2026-08-26 01:57:34.317	s-msjq5trg-2yy0t8o0
3dcf0fac-b4b8-400a-a793-054c2b1d6584	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:57:35.329	2026-08-26 01:57:35.329	s-msjq5trg-2yy0t8o0
027bd3fa-a6b1-4e78-9888-94e64243fa94	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:57:51.447	2026-08-26 01:57:51.447	s-msjq5trg-2yy0t8o0
40946325-328e-427a-8565-59ad749a31f0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:57:51.456	2026-08-26 01:57:51.456	s-msjq5trg-2yy0t8o0
874f27fd-7c0e-47b2-bcb1-5163f77805c0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:57:54.961	2026-08-26 01:57:54.961	s-msjq5trg-2yy0t8o0
97a2a573-e04a-43db-a24a-3a1553116e61	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:58:11.364	2026-08-26 01:58:11.364	s-msjq5trg-2yy0t8o0
375f71d4-5589-496f-a0e9-2c07c5f27417	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:58:11.352	2026-08-26 01:58:11.352	s-msjq5trg-2yy0t8o0
5fc6d7c5-ca2e-4fd4-b1b2-c9c8c9aa2457	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:58:20.752	2026-08-26 01:58:20.752	s-msjq5trg-2yy0t8o0
d225a214-76ce-4bda-908c-0acd49ba20db	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:58:20.771	2026-08-26 01:58:20.771	s-msjq5trg-2yy0t8o0
0164ec01-2741-4d67-84c3-97b35e308046	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:58:26.632	2026-08-26 01:58:26.632	s-msjq5trg-2yy0t8o0
2bbb7fd7-8f5b-49ec-8a92-771aab7e9668	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:58:27.819	2026-08-26 01:58:27.819	s-msjq5trg-2yy0t8o0
41faff1d-9b21-4d16-9325-039621f6b41e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:58:39.799	2026-08-26 01:58:39.799	s-msjq5trg-2yy0t8o0
9f9ea2c2-7284-419f-b62b-3d8a3beb1dcd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:58:40.615	2026-08-26 01:58:40.615	s-msjq5trg-2yy0t8o0
ed7edb96-f86f-41d5-94b5-7f2dc017efe7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:58:41.612	2026-08-26 01:58:41.612	s-msjq5trg-2yy0t8o0
905e73d4-f1ed-499b-bb58-dd4eee4e79ce	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:58:47.68	2026-08-26 01:58:47.68	s-msjq5trg-2yy0t8o0
11a5e11c-864d-421e-98f9-cbb656e733ac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 01:59:09.286	2026-08-26 01:59:09.286	s-msjq5trg-2yy0t8o0
589aafe8-0259-49f5-8865-39ce94f4f27f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 01:59:10.535	2026-08-26 01:59:10.535	s-msjq5trg-2yy0t8o0
731281c3-ab34-4acc-8050-95b874f84c62	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 01:59:18.891	2026-08-26 01:59:18.891	s-msjq5trg-2yy0t8o0
09894abf-ac9f-4bde-afa2-f949e788423b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 01:59:21.074	2026-08-26 01:59:21.074	s-msjq5trg-2yy0t8o0
38f440f0-04a1-46a6-9d63-bf8b87dda42b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 01:59:22.397	2026-08-26 01:59:22.397	s-msjq5trg-2yy0t8o0
11b5eeb2-f2c2-49bd-8740-454bd351a561	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 01:59:24.5	2026-08-26 01:59:24.5	s-msjq5trg-2yy0t8o0
12ecbea6-f2a5-411b-8674-9a9700ff5d59	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 02:10:16.741	2026-08-26 02:10:16.741	s-msjq5trg-2yy0t8o0
71219949-5bec-4466-afb2-63de25e35dda	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 02:10:16.65	2026-08-26 02:10:16.65	s-msjq5trg-2yy0t8o0
8b7b42b1-7969-40e4-8c4b-ac106acfe2c1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 02:10:42.476	2026-08-26 02:10:42.476	s-msjq5trg-2yy0t8o0
e8939174-fd64-46a4-b6ed-cc5a50954cd1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 02:10:45.359	2026-08-26 02:10:45.359	s-msjq5trg-2yy0t8o0
48ce73e3-93ee-47c5-8d59-28d194cefce5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 02:11:41.334	2026-08-26 02:11:41.334	s-msjq5trg-2yy0t8o0
36c0d0b1-bf2e-4844-9399-5c95879315fa	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 02:26:34.688	2026-08-26 02:26:34.688	s-msjq5trg-2yy0t8o0
1365af76-ebee-4585-9686-98b19d6d0adf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 02:26:34.698	2026-08-26 02:26:34.698	s-msjq5trg-2yy0t8o0
ea266870-a68a-4209-96e3-9053fe780476	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 02:26:45.487	2026-08-26 02:26:45.487	s-msjq5trg-2yy0t8o0
7dea0fb6-b4eb-4fcf-8770-8631ec418042	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 02:26:47.815	2026-08-26 02:26:47.815	s-msjq5trg-2yy0t8o0
7b0d9cb4-5d1f-4a1c-9d13-26bc21b4988c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 02:26:49.855	2026-08-26 02:26:49.855	s-msjq5trg-2yy0t8o0
0e9f3feb-0e64-4a73-b20d-1a9523f369bf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 02:26:51.725	2026-08-26 02:26:51.725	s-msjq5trg-2yy0t8o0
4163aab1-7fcc-4287-b780-e66529341269	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 02:26:57.823	2026-08-26 02:26:57.823	s-msjq5trg-2yy0t8o0
b9382530-a90a-446b-ba69-1bff48b192bd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 02:26:57.854	2026-08-26 02:26:57.854	s-msjq5trg-2yy0t8o0
b78500c5-1a71-4f31-9953-e21f8f73c248	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 13:10:12.588	2026-08-26 13:10:12.588	s-msjq5trg-2yy0t8o0
53292bf6-b529-41a5-a330-9081c6fba657	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:11:04.884	2026-08-26 13:11:04.884	s-msjq5trg-2yy0t8o0
1b6207e8-d557-41b3-aa70-5b71a647cfa7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 13:11:12.553	2026-08-26 13:11:12.553	s-msjq5trg-2yy0t8o0
2e1c95ab-6615-4da2-af79-43b1b3237eae	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 13:11:19.898	2026-08-26 13:11:19.898	s-mst4952d-t20wzch8
c224a7bf-13a2-4c01-85b5-c66a49423955	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 13:11:19.912	2026-08-26 13:11:19.912	s-mst4952d-t20wzch8
b03af4ab-c29b-42ae-9ca9-03d5074a7125	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 13:11:20.97	2026-08-26 13:11:20.97	s-mst4952d-t20wzch8
6a236839-ea93-4a20-bba2-d2fa657b5b2f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 13:11:27.509	2026-08-26 13:11:27.509	s-mst4952d-t20wzch8
a5793fcb-ebbf-4e40-8796-0041f495783a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 13:11:34.019	2026-08-26 13:11:34.019	s-mst4952d-t20wzch8
c6aad2ef-9a8f-4d43-b1e7-6ba7210b5ca8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 13:11:36.524	2026-08-26 13:11:36.524	s-mst4952d-t20wzch8
a814c229-6d2c-43cc-82e0-7993293caa9a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 13:11:43.221	2026-08-26 13:11:43.221	s-mst4952d-t20wzch8
142c180f-6d39-4577-8c6b-cde0cefd69a9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 13:11:44.828	2026-08-26 13:11:44.828	s-mst4952d-t20wzch8
e2ce4982-7f0c-4dd6-b623-264a6324712f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 13:11:45.357	2026-08-26 13:11:45.357	s-mst4952d-t20wzch8
fb5e76f9-b051-44d1-bf8a-0532892fad1c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 13:11:50.439	2026-08-26 13:11:50.439	s-msjq5trg-2yy0t8o0
b7c71bb6-6ef9-4dcc-b456-9a6effd86413	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 13:12:06.425	2026-08-26 13:12:06.425	s-mst4952d-t20wzch8
71c7a0eb-fb07-4ad2-ac92-57ff88573a08	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 13:12:16.261	2026-08-26 13:12:16.261	s-msjq5trg-2yy0t8o0
49ec2671-ec1e-435c-bb2c-2a640a7fdf43	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 13:12:16.269	2026-08-26 13:12:16.269	s-msjq5trg-2yy0t8o0
6a06753d-48ef-4908-8956-5956e4e59a9c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 13:12:17.983	2026-08-26 13:12:17.983	s-msjq5trg-2yy0t8o0
61fc2c87-fd9e-4d61-ad70-92fd2e0fa3c3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:12:18.97	2026-08-26 13:12:18.97	s-msjq5trg-2yy0t8o0
c8d317f0-34c1-4ea6-aa89-e549e68023ed	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:12:30.164	2026-08-26 13:12:30.164	s-msjq5trg-2yy0t8o0
eeefd25a-cea3-43c8-81a3-8dbf8f21baa0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:12:30.171	2026-08-26 13:12:30.171	s-msjq5trg-2yy0t8o0
88d6c0c3-5799-4c83-92db-36624d1baf47	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 13:12:32.871	2026-08-26 13:12:32.871	s-msjq5trg-2yy0t8o0
ef3dc819-76a4-4bfc-8236-f94fafa1e103	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:12:39.486	2026-08-26 13:12:39.486	s-msjq5trg-2yy0t8o0
2ce0d2b5-1ae1-4c03-ac76-bcf3a5819751	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 13:12:41.479	2026-08-26 13:12:41.479	s-msjq5trg-2yy0t8o0
4070a0a5-0218-4fc9-9641-4104ba190ec1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:13:04.084	2026-08-26 13:13:04.084	s-msjq5trg-2yy0t8o0
fd321c08-1084-4bd7-86cb-a0f61ec93556	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 13:13:06.057	2026-08-26 13:13:06.057	s-msjq5trg-2yy0t8o0
adb54cfa-d3d3-4a5c-8302-06b9af22e73f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 13:13:07.194	2026-08-26 13:13:07.194	s-msjq5trg-2yy0t8o0
8c09eded-950f-43fa-9411-33cc7d9fac9d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 13:13:15.313	2026-08-26 13:13:15.313	s-msjq5trg-2yy0t8o0
ed9cbede-1212-4fd4-b463-1865e43718f8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 13:13:17.237	2026-08-26 13:13:17.237	s-msjq5trg-2yy0t8o0
2f8d9a13-1b6f-45da-9d77-4b2dbbafbdd7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:13:25.56	2026-08-26 13:13:25.56	s-msjq5trg-2yy0t8o0
a96d8a00-b802-4e4d-a6e8-670e6881d609	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 13:13:28.577	2026-08-26 13:13:28.577	s-msjq5trg-2yy0t8o0
9d59b7bb-f4b4-4e0e-8666-1a70b425b428	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 13:13:32.849	2026-08-26 13:13:32.849	s-msjq5trg-2yy0t8o0
d526a614-f1de-4453-91f0-32c9239312eb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 13:13:35.894	2026-08-26 13:13:35.894	s-mst4952d-t20wzch8
550e4fe3-0209-4006-a9a0-1031b7e384b0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 13:13:38.176	2026-08-26 13:13:38.176	s-mst4952d-t20wzch8
d37f59cc-e924-4349-9fb4-d68374ae24e7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 13:13:39.16	2026-08-26 13:13:39.16	s-mst4952d-t20wzch8
f1aed049-4126-42e2-99ed-cd0bd5856cd0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 13:13:53.705	2026-08-26 13:13:53.705	s-msjq5trg-2yy0t8o0
f4f7b6f6-9bf8-4133-a9cd-95bcfe0cfbb3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 13:13:53.711	2026-08-26 13:13:53.711	s-msjq5trg-2yy0t8o0
da7441c9-d5f7-4e3a-8283-2aeb4d889eec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 13:14:04.385	2026-08-26 13:14:04.385	s-msjq5trg-2yy0t8o0
15a8a06d-670b-493b-bd2e-a9a286dd05ea	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 13:14:04.389	2026-08-26 13:14:04.389	s-msjq5trg-2yy0t8o0
5ca8a821-7d7b-475e-8973-de0d6e562309	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 13:14:16.918	2026-08-26 13:14:16.918	s-msjq5trg-2yy0t8o0
35aa0799-cf01-4ecf-b4ec-9fc5fbdb9c37	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 13:14:16.924	2026-08-26 13:14:16.924	s-msjq5trg-2yy0t8o0
f7e06bf7-de9f-465e-b30d-d619e3bf889d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/dashboard	2026-08-26 13:14:22.246	2026-08-26 13:14:22.246	s-msjq5trg-2yy0t8o0
f5cd9b04-bcde-4b55-b3cf-2bad290b74ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:14:23.207	2026-08-26 13:14:23.207	s-msjq5trg-2yy0t8o0
ad184b4d-8d5a-4539-aad0-c6c016fd635a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 13:14:26.285	2026-08-26 13:14:26.285	s-msjq5trg-2yy0t8o0
78c405dd-946d-4f5a-aec0-4612d54e448e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 13:14:32.465	2026-08-26 13:14:32.465	s-msjq5trg-2yy0t8o0
5e6c421b-bb35-498c-8b2a-5c47673c4532	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 13:27:32.691	2026-08-26 13:27:32.691	s-mst4952d-t20wzch8
3489cec5-a704-49ff-b156-e3b0cf40cc31	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-08-26 13:27:32.712	2026-08-26 13:27:32.712	s-mst4952d-t20wzch8
75ee61e8-26d3-484a-8aec-7d63d9485e5a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 13:27:34.804	2026-08-26 13:27:34.804	s-mst4952d-t20wzch8
061c74e6-4325-48dd-9f9b-7c36e6e3ba1c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 13:27:36.649	2026-08-26 13:27:36.649	s-msjq5trg-2yy0t8o0
6fcf4557-5358-4414-ba4f-d54c3cf33013	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 18:56:44.712	2026-09-05 18:56:44.712	s-msjq5trg-2yy0t8o0
23f82028-5a71-44dd-97a4-832f349f31fd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 19:02:22.275	2026-09-05 19:02:22.275	s-mst4952d-t20wzch8
d6ecfe89-cbc3-46cb-8feb-c737e6124ac4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 19:10:39.328	2026-09-05 19:10:39.328	s-mst4952d-t20wzch8
d1cfd1dc-7b7f-47c7-807b-bf05ba1b3ba7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 19:18:04.146	2026-09-05 19:18:04.146	s-msjq5trg-2yy0t8o0
b0569126-b72f-448c-a386-2b0e2223ebe1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:18:11.824	2026-09-05 19:18:11.824	s-msjq5trg-2yy0t8o0
480b97cc-4924-422d-a9ae-3569e38eb35a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 19:18:16.466	2026-09-05 19:18:16.466	s-msjq5trg-2yy0t8o0
f617038b-c717-43ad-9bc2-00559d76d941	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-09-05 19:21:25.555	2026-09-05 19:21:25.555	s-msjq5trg-2yy0t8o0
1dba4144-b5bb-4ac7-a373-ca3dbb4f2819	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-09-05 19:21:31.37	2026-09-05 19:21:31.37	s-msjq5trg-2yy0t8o0
e75484e5-be69-40ac-a4f8-1d2a449a36db	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:20:39.424	2026-09-05 20:20:39.424	s-mst4952d-t20wzch8
a65eb248-65c4-4ec7-aa83-d3893ccc11d2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:28:48.014	2026-09-05 20:28:48.014	s-mst4952d-t20wzch8
a95720be-608e-41b8-bee2-ce130c29c4e5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:32:09.573	2026-09-05 20:32:09.573	s-mst4952d-t20wzch8
e2bc087c-f93d-4d38-9530-ad55b7d439b7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640350218	2026-09-05 20:33:56.8	2026-09-05 20:33:56.8	s-msjq5trg-2yy0t8o0
0d1c7a91-71a8-4573-ad82-447c35d69cd4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:39:22.878	2026-09-05 20:39:22.878	s-msjq5trg-2yy0t8o0
71a5221e-b9c5-46eb-adc9-1148cec7ac6b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/forgot-password	2026-09-05 20:48:18.03	2026-09-05 20:48:18.03	s-mst4952d-t20wzch8
0d045749-0859-4a8e-be08-51af65a48c6f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 20:51:36.886	2026-09-05 20:51:36.886	s-msjq5trg-2yy0t8o0
c1e003be-e1cb-45fc-9b10-c964e65a6225	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:59:36.059	2026-09-05 20:59:36.059	s-msjq5trg-2yy0t8o0
e6881934-f8c8-4d3f-a1fd-8ff2d1648bdc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:28:09.424	2026-09-05 21:28:09.424	s-msjq5trg-2yy0t8o0
754a5d74-ca7f-44ec-b59d-79087340f7f5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/profile	2026-09-05 21:30:38.322	2026-09-05 21:30:38.322	s-msjq5trg-2yy0t8o0
0e99d725-dd7d-4308-bae2-24535120d5bd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-05 21:33:08.769	2026-09-05 21:33:08.769	s-msjq5trg-2yy0t8o0
9879251e-6063-49b5-8607-0848576fcf08	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:41:22.974	2026-09-05 21:41:22.974	s-mst4952d-t20wzch8
0f3bc382-bfa6-4609-a022-101354e4090f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:46:41.803	2026-09-05 21:46:41.803	s-mst4952d-t20wzch8
914688b3-342b-4c1b-b729-ca153d9a0903	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 21:46:42.007	2026-09-05 21:46:42.007	s-mst4952d-t20wzch8
906136ac-5c5b-4271-8106-9b57febc968e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:50:03.085	2026-09-05 21:50:03.085	s-msjq5trg-2yy0t8o0
29da6c36-87fd-4722-b76f-6808af2ce9a3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-06 00:59:48.644	2026-09-06 00:59:48.644	s-msjq5trg-2yy0t8o0
2cf2c74d-4cf0-42a6-9b01-18d217b314a4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/search	2026-09-06 01:05:08.266	2026-09-06 01:05:08.266	s-msjq5trg-2yy0t8o0
250c1ef5-2272-423c-8e44-fdd156809077	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:05:14.772	2026-09-06 01:05:14.772	s-msjq5trg-2yy0t8o0
6dc9f0db-ecdf-4a2e-b941-2a700c92ade7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/search	2026-09-06 01:05:29.17	2026-09-06 01:05:29.17	s-msjq5trg-2yy0t8o0
28eb6cc0-ab64-4e59-ba3e-cde620578451	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers	2026-09-06 01:09:12.745	2026-09-06 01:09:12.745	s-msjq5trg-2yy0t8o0
10bfeb8d-e5b1-444d-a718-12747e562ae1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 13:27:36.655	2026-08-26 13:27:36.655	s-msjq5trg-2yy0t8o0
b71f424c-d056-447f-bfd0-12296e4194bf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 13:27:44.393	2026-08-26 13:27:44.393	s-msjq5trg-2yy0t8o0
927b7c9b-aa18-4d5f-a9f1-2779cc60b3a1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 13:27:51.78	2026-08-26 13:27:51.78	s-mst4952d-t20wzch8
1f9009d6-434a-41f3-8e7d-02385b35cb54	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 13:27:54.85	2026-08-26 13:27:54.85	s-msjq5trg-2yy0t8o0
4da7f5f2-687d-4d96-8bed-ef843befd703	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 13:28:03.565	2026-08-26 13:28:03.565	s-msjq5trg-2yy0t8o0
9aceaf14-ce42-4524-b02a-234bec33d89f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 13:28:15.528	2026-08-26 13:28:15.528	s-msjq5trg-2yy0t8o0
ef10c397-1aed-45f2-902c-7b31db30d3b3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 13:28:24.467	2026-08-26 13:28:24.467	s-msjq5trg-2yy0t8o0
71bfaf0c-e7ef-4d74-b671-e9eab6d20f12	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 20:51:16.291	2026-08-26 20:51:16.291	s-msjq5trg-2yy0t8o0
c74bc20d-015a-4367-9694-7b243aede626	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 20:51:16.195	2026-08-26 20:51:16.195	s-msjq5trg-2yy0t8o0
30b33e47-123e-468e-93eb-aec2ee94e109	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 20:51:24.818	2026-08-26 20:51:24.818	s-mst4952d-t20wzch8
517e098e-2f60-4e98-be11-94b586e48950	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 20:51:24.838	2026-08-26 20:51:24.838	s-mst4952d-t20wzch8
ae497e11-16aa-46cb-afc0-9f3a9dc5f2c9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 20:51:26.374	2026-08-26 20:51:26.374	s-mst4952d-t20wzch8
e4af1e11-1b8c-45e7-9d6a-95dfc37ccd50	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 20:51:32.287	2026-08-26 20:51:32.287	s-mst4952d-t20wzch8
a1e116be-4853-4f1f-ac4a-4017f9c8f229	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 20:51:36.413	2026-08-26 20:51:36.413	s-msjq5trg-2yy0t8o0
ac563214-e0b1-482f-a281-c2a65f17f0e1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 20:51:43.372	2026-08-26 20:51:43.372	s-msjq5trg-2yy0t8o0
725988bf-ffe5-4052-949e-066bcc16115e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 21:06:01.56	2026-08-26 21:06:01.56	s-msjq5trg-2yy0t8o0
936dabb3-5e30-46e3-8e98-1dc84da5b1be	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 21:06:01.576	2026-08-26 21:06:01.576	s-msjq5trg-2yy0t8o0
058ab447-70bd-4c02-beee-0f332eeb0c8f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:06:10.799	2026-08-26 21:06:10.799	s-msjq5trg-2yy0t8o0
fd940fa9-41ee-4c8d-bbd5-d45cd65dd103	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:06:12.918	2026-08-26 21:06:12.918	s-msjq5trg-2yy0t8o0
3c53ecbe-3572-4ecb-b890-69f6b8e4a3ba	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 21:06:56.542	2026-08-26 21:06:56.542	s-mst4952d-t20wzch8
ff5f3cc6-7f21-44ce-b647-4db8ca7fd95f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 21:06:56.549	2026-08-26 21:06:56.549	s-mst4952d-t20wzch8
3c424535-f63b-467c-9972-6ee0cb68a642	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-26 21:07:00.046	2026-08-26 21:07:00.046	s-mst4952d-t20wzch8
89850786-ee9a-4480-ad8e-549a7491c62f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto2-1787705804451	2026-08-26 21:07:00.882	2026-08-26 21:07:00.882	s-mst4952d-t20wzch8
68d4fd90-e615-4942-87fe-1df556411b39	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 21:07:01.247	2026-08-26 21:07:01.247	s-mst4952d-t20wzch8
68c8c8fe-0931-4ab1-b57b-e8146b13a0ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 21:07:01.25	2026-08-26 21:07:01.25	s-mst4952d-t20wzch8
a7237950-4184-4125-a263-d4e553929c3b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 21:07:11.111	2026-08-26 21:07:11.111	s-mst4952d-t20wzch8
dc497970-c3dc-46a9-8447-4be1c7b1b5b9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 21:07:11.398	2026-08-26 21:07:11.398	s-msjq5trg-2yy0t8o0
8344b727-6b4a-468f-a519-d42cb6701da1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 21:07:11.401	2026-08-26 21:07:11.401	s-msjq5trg-2yy0t8o0
1c538b73-5332-4909-9ae2-f8284efe4200	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-26 21:07:16.303	2026-08-26 21:07:16.303	s-mst4952d-t20wzch8
633bf600-c08b-4ff4-91f9-a5eb2222803f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto2-1787705804451	2026-08-26 21:07:17.073	2026-08-26 21:07:17.073	s-mst4952d-t20wzch8
c7cf5cce-3e08-4986-a800-83d995f27359	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 21:17:14.987	2026-08-26 21:17:14.987	s-msjq5trg-2yy0t8o0
c8f8a3f1-9cbb-4ae1-b753-6b38611277aa	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:17:17.564	2026-08-26 21:17:17.564	s-msjq5trg-2yy0t8o0
e9009aee-3bb3-4b1d-be07-e7de3cef3669	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:17:18.752	2026-08-26 21:17:18.752	s-msjq5trg-2yy0t8o0
baf3932d-c914-4da2-bdc2-60a3d33783ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 21:17:28.264	2026-08-26 21:17:28.264	s-mst4952d-t20wzch8
29ff925f-a8a7-4d90-b5b0-d094c7f18183	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 21:17:33.515	2026-08-26 21:17:33.515	s-mst4952d-t20wzch8
9e25d212-fe86-4f6e-93bd-3bf3b0095655	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-26 21:17:35.421	2026-08-26 21:17:35.421	s-mst4952d-t20wzch8
762bf447-af8e-44a0-93db-603951d05d3e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto2-1787705804451	2026-08-26 21:17:36.63	2026-08-26 21:17:36.63	s-mst4952d-t20wzch8
687ba0e2-8c5b-4711-a91e-b62d8958969e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:17:46.059	2026-08-26 21:17:46.059	s-msjq5trg-2yy0t8o0
e33679bf-ba97-48bb-96c5-c03c247a9a14	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:17:46.069	2026-08-26 21:17:46.069	s-msjq5trg-2yy0t8o0
1666da63-a611-4815-bdb1-b828a25e9fdc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:17:59.773	2026-08-26 21:17:59.773	s-msjq5trg-2yy0t8o0
b4c15a0d-a30c-4fb5-b6af-2c4b7a9bcd16	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:18:02.907	2026-08-26 21:18:02.907	s-msjq5trg-2yy0t8o0
2aaada11-403d-46fc-ab73-926c36c7560d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-26 21:18:10.875	2026-08-26 21:18:10.875	s-mst4952d-t20wzch8
d77bed9b-de64-47bf-a38b-c7c02e1b738f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto1-1787607936046	2026-08-26 21:18:13.107	2026-08-26 21:18:13.107	s-mst4952d-t20wzch8
17debfa1-1e35-4fdb-9b16-fd7251d17d3d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:18:20.103	2026-08-26 21:18:20.103	s-mst4952d-t20wzch8
9f5958c4-6e5b-416b-b108-fe1acc6826ee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-08-26 21:18:46.152	2026-08-26 21:18:46.152	s-mst4952d-t20wzch8
ef8ad8ef-ae37-4fd9-ac9a-fe799e998cf5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:18:51.424	2026-08-26 21:18:51.424	s-mst4952d-t20wzch8
d1dde164-e647-492f-80be-87f9f505b727	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:19:02.332	2026-08-26 21:19:02.332	s-msjq5trg-2yy0t8o0
439c83d4-e0c1-4055-8b56-f618ebec8134	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:19:32.034	2026-08-26 21:19:32.034	s-msjq5trg-2yy0t8o0
19d62d2a-d7d0-4b4a-a768-3fc1bc76e455	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:19:39.014	2026-08-26 21:19:39.014	s-msjq5trg-2yy0t8o0
0e854a6b-040f-46ce-9edd-f22ac4462981	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:19:47.482	2026-08-26 21:19:47.482	s-msjq5trg-2yy0t8o0
367e085c-5cac-4292-83ce-ab3bb4b39b8a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:19:48.866	2026-08-26 21:19:48.866	s-msjq5trg-2yy0t8o0
7b52ff67-53cc-4da4-8d72-d9cf9b3bfb9c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:19:52.835	2026-08-26 21:19:52.835	s-msjq5trg-2yy0t8o0
7911bc4f-3234-400d-bebe-486ba7cf97a4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:19:55.47	2026-08-26 21:19:55.47	s-msjq5trg-2yy0t8o0
4b18b648-fe7f-4c65-ae3d-c6973a76eeaf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:19:57.615	2026-08-26 21:19:57.615	s-msjq5trg-2yy0t8o0
402e6620-1c12-4156-836b-091d5558f59e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:20:14.949	2026-08-26 21:20:14.949	s-msjq5trg-2yy0t8o0
ec0a2e63-8d9f-40c3-9201-b29c9f9c007f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:20:16.798	2026-08-26 21:20:16.798	s-msjq5trg-2yy0t8o0
1031ee1d-4348-4720-9ae0-597fa35c7833	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:20:21.897	2026-08-26 21:20:21.897	s-msjq5trg-2yy0t8o0
945b6d62-2d77-4aa4-aad1-e91536f66052	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:20:25.132	2026-08-26 21:20:25.132	s-msjq5trg-2yy0t8o0
1353742c-63a4-49d4-8056-2866e770b9bc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:20:36.048	2026-08-26 21:20:36.048	s-msjq5trg-2yy0t8o0
8f8ca0e4-69bf-49d9-8ee2-f5a764b27e29	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:20:39.763	2026-08-26 21:20:39.763	s-msjq5trg-2yy0t8o0
a503da7c-4e66-4700-adeb-fff171dc479a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:20:41.432	2026-08-26 21:20:41.432	s-msjq5trg-2yy0t8o0
f3ef4225-5a21-4146-a54c-47aad1ffa385	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:20:45.503	2026-08-26 21:20:45.503	s-msjq5trg-2yy0t8o0
a4d617d5-ed30-487d-a404-fcf4f414a147	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:20:50.429	2026-08-26 21:20:50.429	s-msjq5trg-2yy0t8o0
2553b6d4-0670-4251-9074-0c144b0a6034	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:20:51.518	2026-08-26 21:20:51.518	s-msjq5trg-2yy0t8o0
d627b954-45b8-488c-920f-8e16000a263c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:21:05.264	2026-08-26 21:21:05.264	s-msjq5trg-2yy0t8o0
b60b3fd3-c191-4d0d-a483-887187c4334d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:21:10.595	2026-08-26 21:21:10.595	s-msjq5trg-2yy0t8o0
7b08117e-4d59-4ce9-b299-10b1b5c8a2a7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:22:09.586	2026-08-26 21:22:09.586	s-msjq5trg-2yy0t8o0
54290964-c552-4db4-b3e3-d23ea7a12eea	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:22:14.37	2026-08-26 21:22:14.37	s-msjq5trg-2yy0t8o0
f4c217d4-5523-4cec-bf71-6cc96503b763	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:31:57.289	2026-08-26 21:31:57.289	s-msjq5trg-2yy0t8o0
026abad6-5672-443e-bf43-b18355eed271	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:31:57.303	2026-08-26 21:31:57.303	s-msjq5trg-2yy0t8o0
76bdf7f7-d257-4062-88b8-20cf923ee206	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:32:15.259	2026-08-26 21:32:15.259	s-msjq5trg-2yy0t8o0
8ef03f43-59f4-4444-9312-20d72be3e491	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:32:16.966	2026-08-26 21:32:16.966	s-msjq5trg-2yy0t8o0
58acf52b-c983-4cf0-a4a2-d4a257791bcf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:32:22.945	2026-08-26 21:32:22.945	s-msjq5trg-2yy0t8o0
daaa662b-6154-407f-8fe7-54fe397380fb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:32:24.898	2026-08-26 21:32:24.898	s-msjq5trg-2yy0t8o0
8e0c5d5a-a43b-4650-9619-299228c8b162	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:32:25.643	2026-08-26 21:32:25.643	s-msjq5trg-2yy0t8o0
8039449b-7000-4585-98ba-c65188fff478	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:32:31.713	2026-08-26 21:32:31.713	s-msjq5trg-2yy0t8o0
6b9ad8b2-d5b2-410c-8c91-41790c3de883	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:32:33.077	2026-08-26 21:32:33.077	s-msjq5trg-2yy0t8o0
052df2ad-c878-4190-9495-1087bd8a2fad	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:32:38.084	2026-08-26 21:32:38.084	s-msjq5trg-2yy0t8o0
becec9c4-547c-48ac-945c-a915c9e2ce0d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:32:39.679	2026-08-26 21:32:39.679	s-msjq5trg-2yy0t8o0
0dcf43ba-b3f1-45d3-b017-7226f7a22080	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:32:41.98	2026-08-26 21:32:41.98	s-msjq5trg-2yy0t8o0
aeb5d39e-00b0-4b60-8acc-e95356bc7173	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:32:45.892	2026-08-26 21:32:45.892	s-msjq5trg-2yy0t8o0
1abc160e-3d51-4f30-8136-84cc4266f877	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:32:47.394	2026-08-26 21:32:47.394	s-msjq5trg-2yy0t8o0
4c2bd712-3e32-44f0-8cfc-fe39b834b9b6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 21:32:51.91	2026-08-26 21:32:51.91	s-msjq5trg-2yy0t8o0
21270ec0-c6d6-4dc1-96fa-5296ed79a8cc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:32:53.147	2026-08-26 21:32:53.147	s-msjq5trg-2yy0t8o0
74d97ac9-f4c5-4d34-8369-2f57f50155b2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 21:32:57.476	2026-08-26 21:32:57.476	s-msjq5trg-2yy0t8o0
81cc9002-1dc4-4dc5-be5f-449992a7398e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:32:59.375	2026-08-26 21:32:59.375	s-msjq5trg-2yy0t8o0
a7882c64-8fb1-4d9a-83a6-6834487f4d5e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:33:01.061	2026-08-26 21:33:01.061	s-msjq5trg-2yy0t8o0
4cfd4661-74e0-473c-9adc-ae1672786cdb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:33:02.465	2026-08-26 21:33:02.465	s-msjq5trg-2yy0t8o0
82da4a3f-d0ab-480d-9e90-04f4ccab9f13	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:33:08.632	2026-08-26 21:33:08.632	s-msjq5trg-2yy0t8o0
cb28a05b-33a4-41fd-8a64-bf61fed4f58e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:33:10.211	2026-08-26 21:33:10.211	s-msjq5trg-2yy0t8o0
9aa33205-f47b-45d2-bfd3-06ee52b819d1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:33:18.89	2026-08-26 21:33:18.89	s-msjq5trg-2yy0t8o0
3498beb8-20b2-434b-9754-240b9fd379bd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:33:20.658	2026-08-26 21:33:20.658	s-msjq5trg-2yy0t8o0
5945f264-046f-47bf-9fbe-f67885711411	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:33:33.524	2026-08-26 21:33:33.524	s-msjq5trg-2yy0t8o0
55b0fd3d-d96e-4405-977a-b9d9728539fb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:33:34.5	2026-08-26 21:33:34.5	s-msjq5trg-2yy0t8o0
11f92589-1b6b-4b0a-9ae9-ef8e409b4c65	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:33:35.457	2026-08-26 21:33:35.457	s-msjq5trg-2yy0t8o0
6595d4b5-846a-4881-8b39-d0935ede31ba	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/orders	2026-08-26 21:33:48.815	2026-08-26 21:33:48.815	s-msjq5trg-2yy0t8o0
a994734d-cacc-4e97-b1ce-d521b5c3413a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:33:52.619	2026-08-26 21:33:52.619	s-msjq5trg-2yy0t8o0
77d54e04-f83a-497d-932a-4662c5e520ee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:33:53.861	2026-08-26 21:33:53.861	s-msjq5trg-2yy0t8o0
2d408ee1-8a30-475f-8fc5-59162e0b232f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:33:56.129	2026-08-26 21:33:56.129	s-msjq5trg-2yy0t8o0
4d101d8b-099c-47d4-877a-3ced63691d57	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:33:57.257	2026-08-26 21:33:57.257	s-msjq5trg-2yy0t8o0
1c489d71-0102-46ac-90e7-b1c9d8adcd73	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:33:59.469	2026-08-26 21:33:59.469	s-msjq5trg-2yy0t8o0
626d3eea-4914-43c4-b40c-16920564cb6c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 21:34:01.445	2026-08-26 21:34:01.445	s-msjq5trg-2yy0t8o0
5d481235-d908-4824-95a7-f6b276d487ff	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:34:02.678	2026-08-26 21:34:02.678	s-msjq5trg-2yy0t8o0
97cde2b0-1560-4a72-a303-451933b7d170	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 21:34:07.475	2026-08-26 21:34:07.475	s-msjq5trg-2yy0t8o0
7a696acd-e3c1-4be7-9a51-325641511b7d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:34:09.167	2026-08-26 21:34:09.167	s-msjq5trg-2yy0t8o0
0deabc8c-3a62-4325-9c9a-2f703f8043d7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:34:10.009	2026-08-26 21:34:10.009	s-msjq5trg-2yy0t8o0
105da4f7-c79f-4769-8319-1caffa40dfc3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:34:10.756	2026-08-26 21:34:10.756	s-msjq5trg-2yy0t8o0
6eb155e5-5290-43c4-b5bc-a6e5a8742d0c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:34:15.876	2026-08-26 21:34:15.876	s-msjq5trg-2yy0t8o0
6e0b3750-aa82-49b8-af16-fb883a96a4ac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:34:17.109	2026-08-26 21:34:17.109	s-msjq5trg-2yy0t8o0
50840753-438d-485a-aa76-df1bd819a164	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:34:18.612	2026-08-26 21:34:18.612	s-msjq5trg-2yy0t8o0
f084f41b-2119-46fa-833b-28f411d94c2e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:34:20.02	2026-08-26 21:34:20.02	s-msjq5trg-2yy0t8o0
099ae271-8e99-43b9-95c7-34066cbc96ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 21:34:36.79	2026-08-26 21:34:36.79	s-msjq5trg-2yy0t8o0
d3f0ba82-f7c4-424f-8b6d-93551c52be37	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:34:37.644	2026-08-26 21:34:37.644	s-msjq5trg-2yy0t8o0
ea64d0e0-1496-44ad-b238-38584210a070	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:34:38.458	2026-08-26 21:34:38.458	s-msjq5trg-2yy0t8o0
dd6ad1b2-f42f-407c-9bb7-a7465ff82ba9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 21:34:40.681	2026-08-26 21:34:40.681	s-msjq5trg-2yy0t8o0
f92aae30-1f40-4a0a-9d41-d45723f0d7ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:34:42.254	2026-08-26 21:34:42.254	s-msjq5trg-2yy0t8o0
ce50cdb4-43c6-407a-a550-6dd05abca3b1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:34:45.597	2026-08-26 21:34:45.597	s-msjq5trg-2yy0t8o0
fbb971e1-a697-4f29-8be5-f5e4efa8cdf9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-26 21:34:46.578	2026-08-26 21:34:46.578	s-msjq5trg-2yy0t8o0
20c77a94-152e-435a-a65c-44f7fa17ced6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:34:48.773	2026-08-26 21:34:48.773	s-msjq5trg-2yy0t8o0
fbb37fc1-7cd1-447f-b540-af5658944d88	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:34:50.123	2026-08-26 21:34:50.123	s-msjq5trg-2yy0t8o0
13356272-d3f0-4426-8a95-fefb89e44ad9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 21:35:05.463	2026-08-26 21:35:05.463	s-msjq5trg-2yy0t8o0
7ede720e-afc9-4e08-989f-f5fead30a731	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:36:08.923	2026-08-26 21:36:08.923	s-mst4952d-t20wzch8
f23bd995-f68c-4af8-b8dd-c02fbe09578b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:36:08.926	2026-08-26 21:36:08.926	s-mst4952d-t20wzch8
3f9c1396-5292-4c51-a781-4c70ff74f8b2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/profile	2026-08-26 21:36:13.56	2026-08-26 21:36:13.56	s-mst4952d-t20wzch8
22456306-5f76-4759-baaf-264e10943216	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 21:36:27.74	2026-08-26 21:36:27.74	s-mst4952d-t20wzch8
a597e373-cf1c-42e8-a0cf-f39e76aaa4d6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:36:30.901	2026-08-26 21:36:30.901	s-mst4952d-t20wzch8
ce1d1258-a494-4568-9712-f35ea3fcec38	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-26 21:37:26.285	2026-08-26 21:37:26.285	s-msjq5trg-2yy0t8o0
911ff095-9412-42af-b8bc-44ba58fb5aa8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 21:37:31.758	2026-08-26 21:37:31.758	s-msjq5trg-2yy0t8o0
4d413112-efdb-47e8-9cec-f0d2893077de	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 21:37:35.817	2026-08-26 21:37:35.817	s-mst4952d-t20wzch8
bbab9ad6-11f6-4b46-a4ed-de21ac0dc03c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 21:37:40.705	2026-08-26 21:37:40.705	s-mst4952d-t20wzch8
e36e0c56-49ca-410a-b947-60248bff850f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:37:46.801	2026-08-26 21:37:46.801	s-mst4952d-t20wzch8
0fb11ce9-deb0-4b4a-923d-4645f4be0a1e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 21:37:57.891	2026-08-26 21:37:57.891	s-msjq5trg-2yy0t8o0
d91e2fff-2f10-40de-bf0e-2108adab408a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:37:59.808	2026-08-26 21:37:59.808	s-msjq5trg-2yy0t8o0
2118fe2d-dbb1-4aad-95ff-5d81e00d1324	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 21:38:24.284	2026-08-26 21:38:24.284	s-mst4952d-t20wzch8
88845cb3-eff7-42e0-9f46-5301b1bab408	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:38:55.236	2026-08-26 21:38:55.236	s-mst4952d-t20wzch8
248b167b-98de-41e7-84f5-798586f0771c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:39:12.867	2026-08-26 21:39:12.867	s-mst4952d-t20wzch8
90b62133-5063-4e02-ab86-97b40681fef4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:39:12.87	2026-08-26 21:39:12.87	s-mst4952d-t20wzch8
6b4b716d-6b81-4b3f-a8be-23b8189fa703	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:39:15.368	2026-08-26 21:39:15.368	s-msjq5trg-2yy0t8o0
febf465e-ae3b-464c-b696-6fd191fd53de	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:39:15.377	2026-08-26 21:39:15.377	s-msjq5trg-2yy0t8o0
2c848b4a-6c2c-46e7-9e89-42aba897085d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:55:21.168	2026-08-26 21:55:21.168	s-msjq5trg-2yy0t8o0
96ab35cd-c694-40ce-be69-da3c67941b7f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:55:21.172	2026-08-26 21:55:21.172	s-msjq5trg-2yy0t8o0
10fc4a06-351c-4012-b9b0-08e5ed124ce0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:56:05.874	2026-08-26 21:56:05.874	s-mst4952d-t20wzch8
70523321-37c5-4065-9889-eb8242510b68	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:56:05.884	2026-08-26 21:56:05.884	s-mst4952d-t20wzch8
4af523d0-1597-4a8f-9ef8-f98e03e83c19	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 21:56:06.044	2026-08-26 21:56:06.044	s-mst4952d-t20wzch8
b5df5fb5-bfa6-40fa-8b60-adca08b1a935	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 21:56:13.272	2026-08-26 21:56:13.272	s-mst4952d-t20wzch8
c9919b2e-a7ca-4500-a601-7b3d494205ed	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 21:56:20.51	2026-08-26 21:56:20.51	s-mst4952d-t20wzch8
a2a523a3-8a5d-482e-b3c7-f90cef3bf3b2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:56:21.561	2026-08-26 21:56:21.561	s-mst4952d-t20wzch8
4fe8da3a-a7dd-4c92-b54c-5390739f2891	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:57:10.679	2026-08-26 21:57:10.679	s-msjq5trg-2yy0t8o0
c7ed3ca2-4b4e-40bd-a0b2-48935f3a9135	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 21:57:10.683	2026-08-26 21:57:10.683	s-msjq5trg-2yy0t8o0
cb34fe17-2b7d-4c0f-bcfa-2474ac959e86	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:57:59.607	2026-08-26 21:57:59.607	s-mst4952d-t20wzch8
30e5169c-a088-4ee9-8846-fae3fb1ccd6f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:57:59.617	2026-08-26 21:57:59.617	s-mst4952d-t20wzch8
7ccf6341-6c18-45e3-93ff-8cd833726cfd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:58:21.798	2026-08-26 21:58:21.798	s-mst4952d-t20wzch8
a749edcd-0853-40fc-9c4f-39a640d2acf5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:58:21.808	2026-08-26 21:58:21.808	s-mst4952d-t20wzch8
bbba31f7-b04a-4b2c-845a-03343afbb4ad	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:58:52.765	2026-08-26 21:58:52.765	s-mst4952d-t20wzch8
566ac36b-a082-4758-90ee-8c1b7bb8f354	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 21:58:52.755	2026-08-26 21:58:52.755	s-mst4952d-t20wzch8
eacc7e9b-65e5-46a4-8cc5-77266f80984e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 22:02:42.365	2026-08-26 22:02:42.365	s-msjq5trg-2yy0t8o0
2cc51006-ce04-4f2d-bd8f-6ca7eff09f1e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 22:02:42.361	2026-08-26 22:02:42.361	s-msjq5trg-2yy0t8o0
25f07e18-851e-49fd-aaea-24365c5ae9ee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:03:05.504	2026-08-26 22:03:05.504	s-msjq5trg-2yy0t8o0
7c0cac77-0ce5-47d1-bfdb-356c91f7cdb9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:03:11.785	2026-08-26 22:03:11.785	s-msjq5trg-2yy0t8o0
7a38e089-7515-4972-9cf5-19c0fcc62b72	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:03:13.176	2026-08-26 22:03:13.176	s-msjq5trg-2yy0t8o0
1fe4df5a-dc26-4b1c-9cf3-9788202d77af	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:10:33.502	2026-08-26 22:10:33.502	s-msjq5trg-2yy0t8o0
963535e8-e007-4f32-b145-2435bec5aaa0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:10:33.505	2026-08-26 22:10:33.505	s-msjq5trg-2yy0t8o0
2759ee61-5cd5-4143-8046-2d3d9b66f069	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:10:57.852	2026-08-26 22:10:57.852	s-mst4952d-t20wzch8
abaf3719-ad76-4427-a34e-67c4d5bc70af	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:10:57.845	2026-08-26 22:10:57.845	s-mst4952d-t20wzch8
5170f4cd-ae3d-4e46-94f9-cee388c42b12	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:11:09.572	2026-08-26 22:11:09.572	s-msjq5trg-2yy0t8o0
72946432-b562-4b09-879d-3db829a08023	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:11:09.59	2026-08-26 22:11:09.59	s-msjq5trg-2yy0t8o0
4b77f355-8a69-4ec6-a8eb-84746e347385	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:11:18.383	2026-08-26 22:11:18.383	s-msjq5trg-2yy0t8o0
28004b78-5b36-4199-a08a-3f9b09cb08c7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:11:22.471	2026-08-26 22:11:22.471	s-msjq5trg-2yy0t8o0
4cdf73ea-d53b-4c6c-8cf1-c9ad475be5ea	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:11:26.246	2026-08-26 22:11:26.246	s-msjq5trg-2yy0t8o0
71117550-8dad-4a55-a7e6-69fd7dc2fd4b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:24:35.765	2026-08-26 22:24:35.765	s-mst4952d-t20wzch8
243fca3c-ca84-453d-bb76-0c5fb31f815b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:24:35.771	2026-08-26 22:24:35.771	s-mst4952d-t20wzch8
f8b0b7ac-9d2d-416d-af73-e1d0e1cc0f6a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:24:46.834	2026-08-26 22:24:46.834	s-msjq5trg-2yy0t8o0
c6e4af80-2741-496d-b519-bc3cc7caf48e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:24:46.791	2026-08-26 22:24:46.791	s-msjq5trg-2yy0t8o0
37c92995-dfdc-4877-bafa-088fbf3fe462	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:26:15.541	2026-08-26 22:26:15.541	s-msjq5trg-2yy0t8o0
843f2f58-e94a-4dba-a24b-e4f8bacb3e52	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:26:15.574	2026-08-26 22:26:15.574	s-msjq5trg-2yy0t8o0
02fdb990-1407-4cd9-a8f2-431300c0dadb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 22:26:26.665	2026-08-26 22:26:26.665	s-mst4952d-t20wzch8
dfeee906-300c-4c83-8b19-8f9d51804808	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 22:26:31.66	2026-08-26 22:26:31.66	s-mst4952d-t20wzch8
41b7e431-286b-4090-87f8-2045e7accfee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:26:32.84	2026-08-26 22:26:32.84	s-mst4952d-t20wzch8
58e0d72f-2def-4965-af9c-45ccbe5f4d00	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:26:59.431	2026-08-26 22:26:59.431	s-msjq5trg-2yy0t8o0
7607e065-dce7-411c-8be3-c6cd92a7f422	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:26:59.44	2026-08-26 22:26:59.44	s-msjq5trg-2yy0t8o0
5e63ddd4-cb3e-4783-903a-9211fc5214fc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:27:04.855	2026-08-26 22:27:04.855	s-mst4952d-t20wzch8
cf5b393d-0394-4ba0-8093-c145d5bfefda	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:27:04.86	2026-08-26 22:27:04.86	s-mst4952d-t20wzch8
1209be5f-73c1-47e0-a017-41da2f1c950b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:27:18.449	2026-08-26 22:27:18.449	s-mst4952d-t20wzch8
ec199d72-9ca8-4fe1-9c8b-4af8245834e4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:27:18.454	2026-08-26 22:27:18.454	s-mst4952d-t20wzch8
6c74f489-bc16-41e3-8bc8-265eb5e2b756	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:27:21.169	2026-08-26 22:27:21.169	s-msjq5trg-2yy0t8o0
0c15b88e-ddef-4081-b4f3-31a74188d9fd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:27:21.235	2026-08-26 22:27:21.235	s-msjq5trg-2yy0t8o0
c5676907-ba7d-4554-8434-637468ef1e01	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:27:37.657	2026-08-26 22:27:37.657	s-msjq5trg-2yy0t8o0
a2fd9ec5-d064-465f-adba-0e491b5f6e81	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:27:37.669	2026-08-26 22:27:37.669	s-msjq5trg-2yy0t8o0
f3af367f-495c-4a42-b4dd-cd4c89e3dfea	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:27:55.83	2026-08-26 22:27:55.83	s-msjq5trg-2yy0t8o0
7acbb0f7-3500-4485-99dc-e7aac5cc9644	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:27:55.913	2026-08-26 22:27:55.913	s-msjq5trg-2yy0t8o0
c3454898-7139-4e07-bff5-c1b93470fa02	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:30:48.72	2026-08-26 22:30:48.72	s-mst4952d-t20wzch8
a27b2f58-3116-49a0-8714-6ba6e71eedf2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:30:48.722	2026-08-26 22:30:48.722	s-mst4952d-t20wzch8
84606844-483c-4c20-927d-2bd9d5f41d98	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:31:04.824	2026-08-26 22:31:04.824	s-msjq5trg-2yy0t8o0
6baa13b4-d4f6-47ee-9ef9-cfbbfe438edb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:31:04.836	2026-08-26 22:31:04.836	s-msjq5trg-2yy0t8o0
a9296a03-e587-41c7-99a1-86150bb06549	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 22:31:54.628	2026-08-26 22:31:54.628	s-msjq5trg-2yy0t8o0
40fe7778-415b-438d-99bd-deb398d043e3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:31:57.587	2026-08-26 22:31:57.587	s-msjq5trg-2yy0t8o0
66165393-94ff-43df-a2e6-f3780fd6651b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 22:33:28.162	2026-08-26 22:33:28.162	s-msjq5trg-2yy0t8o0
d677ab73-7ce7-40e2-bb4e-0b8be819c7c2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 22:33:28.169	2026-08-26 22:33:28.169	s-msjq5trg-2yy0t8o0
bfa07fdf-40fd-45b9-8a3e-3f1ee7c5e235	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:34:06.786	2026-08-26 22:34:06.786	s-msjq5trg-2yy0t8o0
ad0e9b49-727c-449a-a356-de1e151c8394	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:34:10.606	2026-08-26 22:34:10.606	s-msjq5trg-2yy0t8o0
950aeb80-95a5-46ab-a3b9-117716cdeb17	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/eca66561-b8f8-4fdb-99d1-ce59770da07e	2026-08-26 22:34:13.475	2026-08-26 22:34:13.475	s-msjq5trg-2yy0t8o0
b63a361b-0f32-41b0-b3b5-087998c734de	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:34:38.217	2026-08-26 22:34:38.217	s-msjq5trg-2yy0t8o0
c553b436-bd28-46d7-8b26-95a7a51aa92f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:34:39.834	2026-08-26 22:34:39.834	s-msjq5trg-2yy0t8o0
761239ed-9af2-4fd0-8ab9-c04fd58e44c1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:34:49.249	2026-08-26 22:34:49.249	s-msjq5trg-2yy0t8o0
2061e25f-15ab-46b1-88bd-28e76412f75e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:34:49.258	2026-08-26 22:34:49.258	s-msjq5trg-2yy0t8o0
df77b4bd-6104-4412-aad1-beb3481f279f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 22:34:50.792	2026-08-26 22:34:50.792	s-msjq5trg-2yy0t8o0
e54b06be-1956-499d-ab1b-f8d91e3cd71d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:34:58.432	2026-08-26 22:34:58.432	s-msjq5trg-2yy0t8o0
d03d81e1-5a05-4296-885b-e6f0d598014f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:56:54.87	2026-09-05 18:56:54.87	s-msjq5trg-2yy0t8o0
98137952-aae0-4b92-bf0b-7a30d5c06185	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 19:02:22.281	2026-09-05 19:02:22.281	s-mst4952d-t20wzch8
e24b182c-18de-4c41-bd1d-f3a834961b94	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reports	2026-09-05 19:10:49.219	2026-09-05 19:10:49.219	s-mst4952d-t20wzch8
5a196451-9604-4f38-be12-9226d6280513	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:18:23.136	2026-09-05 19:18:23.136	s-msjq5trg-2yy0t8o0
dee7a75f-2dc3-4b68-981e-f9bc25366967	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-09-05 19:21:28.812	2026-09-05 19:21:28.812	s-msjq5trg-2yy0t8o0
0f1a2228-382a-402f-a652-3e56ebff4349	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:20:39.432	2026-09-05 20:20:39.432	s-mst4952d-t20wzch8
6df98b81-6a69-4b42-ab87-91643e4ae19a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:28:52.504	2026-09-05 20:28:52.504	s-msjq5trg-2yy0t8o0
3c5d390a-f7b8-447e-86ca-9224a4edddd1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:32:30.306	2026-09-05 20:32:30.306	s-mst4952d-t20wzch8
bb1cea60-57ff-4684-b4a6-ec3e21b99e19	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:32:33.919	2026-09-05 20:32:33.919	s-msjq5trg-2yy0t8o0
15a99609-2d77-4f77-9afe-04b1ff21f206	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:33:57.579	2026-09-05 20:33:57.579	s-msjq5trg-2yy0t8o0
0b1a9c7b-5752-4f07-b636-8d335b339161	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:41:21.328	2026-09-05 20:41:21.328	s-msjq5trg-2yy0t8o0
79985b6a-80b6-4572-a9c6-6920ba2f3024	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:41:21.353	2026-09-05 20:41:21.353	s-msjq5trg-2yy0t8o0
6e88e771-3418-4c6e-a690-1b667bb315f3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:49:22.043	2026-09-05 20:49:22.043	s-mst4952d-t20wzch8
173e97d5-db59-4f1e-b493-2171a10ac163	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:51:47.414	2026-09-05 20:51:47.414	s-msjq5trg-2yy0t8o0
e54c7a6b-4587-496b-8317-e38f035cfb9b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 20:59:37.063	2026-09-05 20:59:37.063	s-msjq5trg-2yy0t8o0
44501283-a4f6-4306-a5bc-af6f364c08fd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 21:28:14.76	2026-09-05 21:28:14.76	s-msjq5trg-2yy0t8o0
692caf34-88f1-4282-a413-7132a2874844	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/profile	2026-09-05 21:31:14.231	2026-09-05 21:31:14.231	s-msjq5trg-2yy0t8o0
fee1eb08-a1c2-4132-8c89-a4b8fe6c48bf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:33:09.914	2026-09-05 21:33:09.914	s-msjq5trg-2yy0t8o0
b887b2ad-09a9-4a02-8093-335abd042799	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:42:00.326	2026-09-05 21:42:00.326	s-mst4952d-t20wzch8
a5a51ccf-e4f6-4333-9814-ebfb3d1f0e17	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:42:12.658	2026-09-05 21:42:12.658	s-mst4952d-t20wzch8
98266bf1-41ef-4545-8d75-fc46824c9d01	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:46:41.808	2026-09-05 21:46:41.808	s-mst4952d-t20wzch8
aace0dfb-b5b2-4fe8-a3e2-52c24e4a9174	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 21:46:50.603	2026-09-05 21:46:50.603	s-mst4952d-t20wzch8
a53102f9-140c-4200-b46f-174243ec07ad	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:50:03.093	2026-09-05 21:50:03.093	s-msjq5trg-2yy0t8o0
f8ff4de4-0b5a-43d3-be08-a6a74d57fe6c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-05 21:50:11.611	2026-09-05 21:50:11.611	s-msjq5trg-2yy0t8o0
2865aae6-5ac8-4137-87d9-c3e38250cd9f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-06 01:00:09.593	2026-09-06 01:00:09.593	s-mst4952d-t20wzch8
b30c6831-cf26-489d-8f9e-0b4464f43c77	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:05:19.783	2026-09-06 01:05:19.783	s-msjq5trg-2yy0t8o0
bdd08040-f1ce-4cee-bf47-df68fb937232	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:10:48.502	2026-09-06 01:10:48.502	s-msjq5trg-2yy0t8o0
38fd5a5e-944a-4f8d-bac2-1a7a4c89b179	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-06 01:13:39.572	2026-09-06 01:13:39.572	s-msjq5trg-2yy0t8o0
67f02e02-1a2c-46da-b997-6e7034da6cf9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:13:43.067	2026-09-06 01:13:43.067	s-msjq5trg-2yy0t8o0
5c0cc87d-c548-4df7-8d86-36a5942456ad	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 22:35:00.87	2026-08-26 22:35:00.87	s-msjq5trg-2yy0t8o0
9fc69663-795d-471a-a9be-0030a590d04f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-05 18:56:56.028	2026-09-05 18:56:56.028	s-msjq5trg-2yy0t8o0
b09f8f38-ca08-4f9a-a376-339cd1ae1505	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:56:58.387	2026-09-05 18:56:58.387	s-msjq5trg-2yy0t8o0
f6d98e31-5537-44d0-8f4a-1ba020458c68	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 19:02:30.509	2026-09-05 19:02:30.509	s-mst4952d-t20wzch8
bd6e3754-7abf-4a4d-88c6-811d6cc05d7f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 19:10:59.005	2026-09-05 19:10:59.005	s-mst4952d-t20wzch8
8ef0d4d5-9b9d-4e50-b388-3cd6de78ae27	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 19:18:50.643	2026-09-05 19:18:50.643	s-mst4952d-t20wzch8
1e0fcfa3-9360-429e-8b6a-30dcbde2a514	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:21:30.53	2026-09-05 19:21:30.53	s-msjq5trg-2yy0t8o0
87c7d830-4dd7-46ad-8ac2-b522d76b9e35	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:22:18.149	2026-09-05 20:22:18.149	s-msjq5trg-2yy0t8o0
199555a7-4479-4d75-9456-ea22e586463d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:28:52.518	2026-09-05 20:28:52.518	s-msjq5trg-2yy0t8o0
4f10913a-62f2-45fe-b117-ce963e4954b5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:32:33.924	2026-09-05 20:32:33.924	s-msjq5trg-2yy0t8o0
f9704bae-1926-4641-a3da-fe13110dbba5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:34:06.48	2026-09-05 20:34:06.48	s-msjq5trg-2yy0t8o0
5beda57d-c50c-4248-bb11-909bed73a491	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-05 20:41:25.202	2026-09-05 20:41:25.202	s-msjq5trg-2yy0t8o0
c6adaa7e-214d-4cd7-9717-15b9607f672a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:49:37.354	2026-09-05 20:49:37.354	s-mst4952d-t20wzch8
35cb3a1c-5490-4f8f-92f8-bf4834e001a2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 20:49:46.878	2026-09-05 20:49:46.878	s-mst4952d-t20wzch8
e379ac6f-8a78-4151-8930-9badc39d69b2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:51:49.733	2026-09-05 20:51:49.733	s-msjq5trg-2yy0t8o0
d4fc46b9-7e55-4241-9de8-4d8419c8dfa1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 21:00:05.884	2026-09-05 21:00:05.884	s-msjq5trg-2yy0t8o0
525fcab8-40c3-4aef-9d5c-f18d10a41373	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:28:18.572	2026-09-05 21:28:18.572	s-msjq5trg-2yy0t8o0
08a08e7e-2ae2-42e5-8d5a-3766ef76e70d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:28:21.913	2026-09-05 21:28:21.913	s-msjq5trg-2yy0t8o0
096e9df0-8f6d-4e81-97b9-87638f67bdc8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/profile	2026-09-05 21:31:14.24	2026-09-05 21:31:14.24	s-msjq5trg-2yy0t8o0
2330bbd5-0aa5-4c05-9a0c-9b9390e613db	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-09-05 21:31:17.242	2026-09-05 21:31:17.242	s-mst4952d-t20wzch8
c5aafcbc-5f02-49fb-8966-340c07d40bc9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 21:35:00.138	2026-09-05 21:35:00.138	s-mst4952d-t20wzch8
bfcfc01d-d635-4ebe-8c45-8e66e8ab1d5b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-09-05 21:35:06.045	2026-09-05 21:35:06.045	s-mst4952d-t20wzch8
3b25f1ef-ade0-4297-84b9-6d34c48f9cab	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:42:00.334	2026-09-05 21:42:00.334	s-mst4952d-t20wzch8
11b42258-55d6-459d-96ba-40faf9b4f3d8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 21:46:58.178	2026-09-05 21:46:58.178	s-mst4952d-t20wzch8
c9680552-ed03-4007-966c-d3058d3b8f3c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 21:50:09.94	2026-09-05 21:50:09.94	s-mst4952d-t20wzch8
87d51b23-cf8e-4bfb-8bbd-690deb70f009	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-09-06 01:00:41.218	2026-09-06 01:00:41.218	s-mst4952d-t20wzch8
41ac7476-87fa-4f90-a80c-cb3713e20754	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-06 01:00:50.913	2026-09-06 01:00:50.913	s-mst4952d-t20wzch8
2c3d0128-1bd0-4d6c-8e28-fd3a51a20986	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/search	2026-09-06 01:05:29.165	2026-09-06 01:05:29.165	s-msjq5trg-2yy0t8o0
aa0c7ac7-c1d2-4df1-a9ac-ded87761e9a4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:13:24.021	2026-09-06 01:13:24.021	s-msjq5trg-2yy0t8o0
4428af2e-8b02-49fc-baf1-1c1cee13c059	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers	2026-09-06 01:13:56.78	2026-09-06 01:13:56.78	s-msjq5trg-2yy0t8o0
1fac115e-a808-4394-a63e-e2db01fa3c8b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers	2026-09-06 01:14:10.462	2026-09-06 01:14:10.462	s-msjq5trg-2yy0t8o0
f550f776-7e5e-4197-a2d7-95e83546a969	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:35:04.19	2026-08-26 22:35:04.19	s-msjq5trg-2yy0t8o0
5ac7a090-97b8-4be4-b1cb-ed1d77bb2711	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:35:08.492	2026-08-26 22:35:08.492	s-msjq5trg-2yy0t8o0
b30c849c-fcf6-4037-a9f3-dd2bcd8ef9d1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/eca66561-b8f8-4fdb-99d1-ce59770da07e	2026-08-26 22:35:19.799	2026-08-26 22:35:19.799	s-msjq5trg-2yy0t8o0
bc2bb466-4c12-44e0-b338-5fad08b47858	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 22:35:34.678	2026-08-26 22:35:34.678	s-msjq5trg-2yy0t8o0
49e9a631-9b6f-4d41-b681-3464e7e6e472	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/eca66561-b8f8-4fdb-99d1-ce59770da07e	2026-08-26 22:35:36.387	2026-08-26 22:35:36.387	s-msjq5trg-2yy0t8o0
d9ac33d3-100b-4a0e-ba7d-2cac65c10194	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:35:42.058	2026-08-26 22:35:42.058	s-msjq5trg-2yy0t8o0
d9119168-58a8-46f0-b356-304da47746a3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:35:43.359	2026-08-26 22:35:43.359	s-msjq5trg-2yy0t8o0
72861375-f8d7-4197-9d63-a0d90e841b85	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:36:01.552	2026-08-26 22:36:01.552	s-msjq5trg-2yy0t8o0
fb0a3e1d-2245-489a-9ce2-046b21115511	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/b72c345d-1116-48b6-ac65-bee14b188580	2026-08-26 22:36:02.95	2026-08-26 22:36:02.95	s-msjq5trg-2yy0t8o0
2bca7918-1046-4617-9064-c0088652ecaf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:36:22.438	2026-08-26 22:36:22.438	s-msjq5trg-2yy0t8o0
43324f8e-0698-4d98-8db8-28d465e0855d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 22:36:30.763	2026-08-26 22:36:30.763	s-mt7p2nx9-hd2ve7zi
d56bb7b7-fdd7-47b3-a4dc-e55ff2ffcf63	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 22:36:30.849	2026-08-26 22:36:30.849	s-mt7p2nx9-hd2ve7zi
4ec6054b-69b3-4cee-8e40-9d93fad2bb6a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/auth/login	2026-08-26 22:36:32.109	2026-08-26 22:36:32.109	s-mt7p2nx9-hd2ve7zi
ebd5fc4c-f90b-4ca5-b4f9-41e77f1df4d7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/	2026-08-26 22:36:52.519	2026-08-26 22:36:52.519	s-mt7p2nx9-hd2ve7zi
4a110e06-1d79-4120-895b-be20a3d81fda	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin	2026-08-26 22:36:56.53	2026-08-26 22:36:56.53	s-mt7p2nx9-hd2ve7zi
6c6d13c8-78d8-4dad-b647-868064470206	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/products	2026-08-26 22:36:59.284	2026-08-26 22:36:59.284	s-mt7p2nx9-hd2ve7zi
81f1088e-d45d-46c6-bfc2-7f1b38452947	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/products	2026-08-26 22:38:21.946	2026-08-26 22:38:21.946	s-mt7p2nx9-hd2ve7zi
358c9493-3543-4009-89bb-e41e4b47effe	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/products	2026-08-26 22:38:21.95	2026-08-26 22:38:21.95	s-mt7p2nx9-hd2ve7zi
06e58dc5-04e7-4d29-bfdf-25a51ddbc49a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/users	2026-08-26 22:38:26.56	2026-08-26 22:38:26.56	s-mt7p2nx9-hd2ve7zi
652d59b3-2a8b-430c-af8a-2339b1dc3e3f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin	2026-08-26 22:38:35.741	2026-08-26 22:38:35.741	s-mt7p2nx9-hd2ve7zi
f60eec77-2b97-4fb7-b3cb-461f00c566c1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/settings	2026-08-26 22:38:46.863	2026-08-26 22:38:46.863	s-mt7p2nx9-hd2ve7zi
6944eece-3bdd-4f7d-85c2-0993ce2d0306	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/messages	2026-08-26 22:38:49.264	2026-08-26 22:38:49.264	s-mt7p2nx9-hd2ve7zi
8a76ccc3-49a0-4a40-b109-9fd045f1b83b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/reports	2026-08-26 22:38:50.226	2026-08-26 22:38:50.226	s-mt7p2nx9-hd2ve7zi
bd71b395-e82e-48fe-98fe-07a0a6e12622	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/support	2026-08-26 22:38:51.389	2026-08-26 22:38:51.389	s-mt7p2nx9-hd2ve7zi
d230b020-2f05-4337-a6dd-4e669fbb200a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/reviews	2026-08-26 22:38:52.264	2026-08-26 22:38:52.264	s-mt7p2nx9-hd2ve7zi
671cd609-0362-47be-8e9c-13b06e24c0cc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/orders	2026-08-26 22:38:53.922	2026-08-26 22:38:53.922	s-mt7p2nx9-hd2ve7zi
4bef2453-c455-46e2-b91c-c1e3b7b905d6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/reviews	2026-08-26 22:38:55.003	2026-08-26 22:38:55.003	s-mt7p2nx9-hd2ve7zi
945d5250-ae1b-420c-9dae-9d15d7e274fc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/orders	2026-08-26 22:38:57.363	2026-08-26 22:38:57.363	s-mt7p2nx9-hd2ve7zi
0594b9c4-f4c8-41da-854b-b131aeb5aa28	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/suppliers	2026-08-26 22:38:59.136	2026-08-26 22:38:59.136	s-mt7p2nx9-hd2ve7zi
dd7b2189-7f67-4c80-8a9a-04b0b5fe6934	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:40:00.707	2026-08-26 22:40:00.707	s-msjq5trg-2yy0t8o0
0c4b9d67-c6b9-47ef-9a08-891fc801fd2d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:40:00.715	2026-08-26 22:40:00.715	s-msjq5trg-2yy0t8o0
5e1d2e67-5634-4521-9203-f6a22c6cead0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:40:05.934	2026-08-26 22:40:05.934	s-msjq5trg-2yy0t8o0
b844f49e-2c75-4984-937b-0a646d1a96dd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-27 01:07:52.796	2026-08-27 01:07:52.796	s-mst4952d-t20wzch8
edd2c3fe-9161-4bf0-a9d9-68b7339b906b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:41:05.064	2026-08-26 22:41:05.064	s-msjq5trg-2yy0t8o0
fd19ae56-e31a-4a97-9888-31d106a4f9bc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-05 18:57:36.889	2026-09-05 18:57:36.889	s-msjq5trg-2yy0t8o0
99f1e98c-e539-4b8d-99cc-9e7d51107661	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/dashboard	2026-09-05 19:02:34.217	2026-09-05 19:02:34.217	s-mst4952d-t20wzch8
11c895e2-1321-4df4-b4a9-6915eac5cb51	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:11:04.486	2026-09-05 19:11:04.486	s-mst4952d-t20wzch8
7a050abe-589e-4147-bf9b-61483a093494	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 19:18:51.244	2026-09-05 19:18:51.244	s-mst4952d-t20wzch8
eafdf789-de33-4a3e-99c2-1a10791f3f7c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:21:39.227	2026-09-05 19:21:39.227	s-msjq5trg-2yy0t8o0
69b29758-8fb9-4cf8-8e96-65ba6870cb7f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:22:18.219	2026-09-05 20:22:18.219	s-msjq5trg-2yy0t8o0
fc3d0d8f-e8e9-4d37-8d4b-6feed63f5eb0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:28:57.703	2026-09-05 20:28:57.703	s-msjq5trg-2yy0t8o0
2adde511-03ea-4de1-8b62-fc535e2d8939	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:32:35.736	2026-09-05 20:32:35.736	s-msjq5trg-2yy0t8o0
3d028070-3d35-4a4e-9ad2-0290e0d4e010	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-09-05 20:34:38.813	2026-09-05 20:34:38.813	s-mst4952d-t20wzch8
0d985f86-acaa-43bb-ac07-0a6ee91acfa3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-05 20:41:43.525	2026-09-05 20:41:43.525	s-msjq5trg-2yy0t8o0
44a3f63e-0770-465d-aef9-c22bd1dfbea9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:49:37.365	2026-09-05 20:49:37.365	s-mst4952d-t20wzch8
26c1e898-2873-424a-a20a-63fd419fa452	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-05 20:51:51.877	2026-09-05 20:51:51.877	s-msjq5trg-2yy0t8o0
bccb8062-c016-4b1a-bbbe-f94c1ed5ff12	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:10:59.492	2026-09-05 21:10:59.492	s-msjq5trg-2yy0t8o0
0f9a8eae-55e4-45ed-b182-40187d780665	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 21:11:09.382	2026-09-05 21:11:09.382	s-msjq5trg-2yy0t8o0
788c09c2-0383-4a4a-9b8f-148092df9a7a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:28:40.209	2026-09-05 21:28:40.209	s-msjq5trg-2yy0t8o0
62004f8e-1ffb-4bd7-821c-0b0c8e383547	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/profile	2026-09-05 21:28:42.328	2026-09-05 21:28:42.328	s-msjq5trg-2yy0t8o0
0ba5b61a-20d9-483b-95a5-81916b921a6d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-09-05 21:31:17.236	2026-09-05 21:31:17.236	s-mst4952d-t20wzch8
fed0438f-985a-418e-8c42-34ff011752c8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 21:31:19.812	2026-09-05 21:31:19.812	s-mst4952d-t20wzch8
9a757263-9974-44be-a6ef-6767dd25779e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:31:23.8	2026-09-05 21:31:23.8	s-msjq5trg-2yy0t8o0
a3834f9f-8f5e-469e-b0f8-e6e6c40db974	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:31:24.545	2026-09-05 21:31:24.545	s-msjq5trg-2yy0t8o0
156b9e80-963a-4775-8b43-d0e22868d689	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 21:35:03.151	2026-09-05 21:35:03.151	s-mst4952d-t20wzch8
e045c7b3-1714-409c-aed2-4f74a5822a14	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/shipping	2026-09-05 21:42:08.087	2026-09-05 21:42:08.087	s-mst4952d-t20wzch8
92024eb9-3840-4b46-9561-68966dc0d66d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 21:42:14.645	2026-09-05 21:42:14.645	s-mst4952d-t20wzch8
9fbd8de3-6858-4894-b3fe-d9ff546bdcc1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:46:59.153	2026-09-05 21:46:59.153	s-mst4952d-t20wzch8
21f60b83-51f6-4c34-8c5e-4159cfbdbba1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-06 00:48:56.181	2026-09-06 00:48:56.181	s-mst4952d-t20wzch8
646f8d4a-6fe6-4a87-b0b1-e0f044901442	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-06 01:04:08.404	2026-09-06 01:04:08.404	s-msjq5trg-2yy0t8o0
b671143e-05bc-4669-bd50-679ef87839bd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-06 01:04:08.757	2026-09-06 01:04:08.757	s-msjq5trg-2yy0t8o0
65c2e67d-51f5-4992-a9ca-f65fb059bd62	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:05:40.32	2026-09-06 01:05:40.32	s-msjq5trg-2yy0t8o0
9ad1e62a-d887-4324-85a6-679f3319d73f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:13:24.03	2026-09-06 01:13:24.03	s-msjq5trg-2yy0t8o0
f59c6c85-cd99-4228-8efc-69387a7b16ac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:41:05.056	2026-08-26 22:41:05.056	s-msjq5trg-2yy0t8o0
8e804602-041c-42ba-8ad8-79fa16d90e94	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:44:51.238	2026-08-26 22:44:51.238	s-msjq5trg-2yy0t8o0
ead5d3db-b9f4-474c-b645-fadd6feab263	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:44:55.071	2026-08-26 22:44:55.071	s-msjq5trg-2yy0t8o0
56b9495f-7d28-4ce3-8824-2a5fba14e52e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 22:47:52.452	2026-08-26 22:47:52.452	s-mst4952d-t20wzch8
2083c2d8-f04e-45dc-ac5d-50592fe6a71d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 22:47:52.467	2026-08-26 22:47:52.467	s-mst4952d-t20wzch8
e5ffc621-7d4d-488d-ac66-db5bd8b363ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 22:51:22.016	2026-08-26 22:51:22.016	s-msjq5trg-2yy0t8o0
a15bed53-5268-4602-9698-56fbbec3d6c4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 22:51:22.005	2026-08-26 22:51:22.005	s-msjq5trg-2yy0t8o0
bddeb41b-4697-473b-aa7a-06f35fd54ce1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 22:51:37.627	2026-08-26 22:51:37.627	s-mst4952d-t20wzch8
e4ebe5af-5973-435a-b1c9-b6d043052af3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 22:51:41.875	2026-08-26 22:51:41.875	s-mst4952d-t20wzch8
a7cb11b1-d3d6-4c1a-85e8-5bde1715ed7d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 22:51:43.804	2026-08-26 22:51:43.804	s-mst4952d-t20wzch8
7760dec1-9a78-409c-9e01-e4197cc4e203	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:51:57.45	2026-08-26 22:51:57.45	s-msjq5trg-2yy0t8o0
0191557a-662b-4ecc-b1b8-6ce8717d0b5c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 22:52:06.289	2026-08-26 22:52:06.289	s-msjq5trg-2yy0t8o0
030d3a31-7cd2-4bfa-a23a-920fe9dda6ae	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:52:08.955	2026-08-26 22:52:08.955	s-msjq5trg-2yy0t8o0
26429612-469a-43db-9919-406965273d8e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 22:52:12.56	2026-08-26 22:52:12.56	s-msjq5trg-2yy0t8o0
0e60324b-29e0-4937-b1dd-7d08bca5f983	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:52:26.408	2026-08-26 22:52:26.408	s-msjq5trg-2yy0t8o0
cce4b4af-5b91-4613-87e9-c0721d70f907	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:52:57.738	2026-08-26 22:52:57.738	s-msjq5trg-2yy0t8o0
7ee0315f-e44a-44df-9721-3b9ddb65f031	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:52:57.751	2026-08-26 22:52:57.751	s-msjq5trg-2yy0t8o0
dd7c9283-7e4c-4baa-a86a-b4887c167e96	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:53:12.069	2026-08-26 22:53:12.069	s-msjq5trg-2yy0t8o0
a6086227-d2dd-4cea-af9d-cd967b90e6e8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:53:12.084	2026-08-26 22:53:12.084	s-msjq5trg-2yy0t8o0
5ab5919d-3889-49a4-8745-519d930b5d72	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:53:38.237	2026-08-26 22:53:38.237	s-msjq5trg-2yy0t8o0
1b83c659-c539-4e8a-acc8-b7dbd65f5588	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:53:38.246	2026-08-26 22:53:38.246	s-msjq5trg-2yy0t8o0
bfe0ce3f-135b-433f-9b52-2f1bc1fdd613	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:53:59.276	2026-08-26 22:53:59.276	s-msjq5trg-2yy0t8o0
0201236a-b4ac-4948-9de6-ef739365f3d3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:53:59.298	2026-08-26 22:53:59.298	s-msjq5trg-2yy0t8o0
c8394ba0-ddae-40f0-90d3-dbd1a0418958	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 22:54:11.617	2026-08-26 22:54:11.617	s-msjq5trg-2yy0t8o0
db52844f-90c3-4596-a9fa-8e83b8394309	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:54:17.332	2026-08-26 22:54:17.332	s-msjq5trg-2yy0t8o0
e88d192c-31d7-48af-b970-0980965ace9b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:54:19.718	2026-08-26 22:54:19.718	s-msjq5trg-2yy0t8o0
6ba194fd-0c21-4f32-a3a8-ab52af8fc02d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/962de021-8d82-4624-a482-85cc8f7a4fe5	2026-08-26 22:54:22.093	2026-08-26 22:54:22.093	s-msjq5trg-2yy0t8o0
015cb0ad-7fcd-4ea0-82bc-16b49f2bd6a9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:54:28.199	2026-08-26 22:54:28.199	s-msjq5trg-2yy0t8o0
9ef88175-41db-4d2d-8cf8-33abe8d63461	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers	2026-08-26 22:54:31.203	2026-08-26 22:54:31.203	s-msjq5trg-2yy0t8o0
55b8848d-fad5-4c71-ae84-628e9c137c78	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:54:32.668	2026-08-26 22:54:32.668	s-msjq5trg-2yy0t8o0
09ed40ed-eb5f-4645-ae04-1cd04722af9b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto2-1787705804451	2026-08-26 22:54:43.801	2026-08-26 22:54:43.801	s-msjq5trg-2yy0t8o0
844764ab-0730-4899-92c3-9144d6e53e9b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 22:57:57.521	2026-08-26 22:57:57.521	s-msjq5trg-2yy0t8o0
cf56c16b-4c55-499f-9ec2-a01869d10694	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 22:58:01.275	2026-08-26 22:58:01.275	s-msjq5trg-2yy0t8o0
12b45bc0-3f70-4967-94de-3d007617e4e6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 22:58:03.628	2026-08-26 22:58:03.628	s-msjq5trg-2yy0t8o0
42d6294d-0749-4d67-9fcd-6f4e474a0071	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 22:58:15.456	2026-08-26 22:58:15.456	s-msjq5trg-2yy0t8o0
a8b36457-4463-4cae-ba02-19d0c75e0c45	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:07:48.882	2026-08-26 23:07:48.882	s-msjq5trg-2yy0t8o0
458a4b30-f14a-4519-a949-c188b3df8296	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:07:48.887	2026-08-26 23:07:48.887	s-msjq5trg-2yy0t8o0
f70c9c43-ae24-4f08-841c-33176ccb6b51	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 23:07:49.323	2026-08-26 23:07:49.323	s-mst4952d-t20wzch8
c5f7318b-a27f-4069-822a-1b313020f07e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-26 23:07:49.328	2026-08-26 23:07:49.328	s-mst4952d-t20wzch8
df73263a-f823-4851-b68c-bd1f28bfbeb9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/suppliers	2026-08-26 23:07:49.474	2026-08-26 23:07:49.474	s-mt7p2nx9-hd2ve7zi
f45d55e9-64ec-4473-bb50-0fcbe9d9ee99	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/admin/suppliers	2026-08-26 23:07:49.477	2026-08-26 23:07:49.477	s-mt7p2nx9-hd2ve7zi
91b935ef-46d8-4e9e-a956-ef5401d11fea	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 23:07:49.53	2026-08-26 23:07:49.53	s-mst4952d-t20wzch8
8b3c521b-db70-4b70-9e26-4ffb1bca81c3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	Desktop	Firefox	/auth/login	2026-08-26 23:07:49.635	2026-08-26 23:07:49.635	s-mt7p2nx9-hd2ve7zi
a84c09da-4b24-41be-ae8d-e9c9fea3b23d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:07:56.753	2026-08-26 23:07:56.753	s-msjq5trg-2yy0t8o0
daf79568-5a73-42db-8593-5d2aea18ae2b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:07:56.756	2026-08-26 23:07:56.756	s-msjq5trg-2yy0t8o0
df1edfe9-69da-419a-aed8-3d84b77ca707	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:08:05.598	2026-08-26 23:08:05.598	s-msjq5trg-2yy0t8o0
0f64647e-4108-4be3-89ac-ccc36dbc23ee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 23:08:08.601	2026-08-26 23:08:08.601	s-msjq5trg-2yy0t8o0
4a1b0d52-4024-4529-8635-5aa82cea04c4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:08:10.71	2026-08-26 23:08:10.71	s-msjq5trg-2yy0t8o0
a6b9195f-13cc-4a84-b504-bc861364847c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 23:08:45.255	2026-08-26 23:08:45.255	s-msjq5trg-2yy0t8o0
18999127-e604-4f57-b789-b9e920c82bdb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:08:46.989	2026-08-26 23:08:46.989	s-msjq5trg-2yy0t8o0
0aeb0302-1aef-41e5-8042-bcedd6368c02	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/semente-soja-transgenica-rr	2026-08-26 23:08:48.125	2026-08-26 23:08:48.125	s-msjq5trg-2yy0t8o0
ceda1864-b0a4-4e15-a668-6d55b10ebc5b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/962de021-8d82-4624-a482-85cc8f7a4fe5	2026-08-26 23:08:50.473	2026-08-26 23:08:50.473	s-msjq5trg-2yy0t8o0
5a486680-bc47-42a5-8b37-baa9750e4646	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/semente-soja-transgenica-rr	2026-08-26 23:09:02.855	2026-08-26 23:09:02.855	s-msjq5trg-2yy0t8o0
f78973c1-7c28-4211-95ff-d2cfcb6673e7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:09:16.898	2026-08-26 23:09:16.898	s-msjq5trg-2yy0t8o0
2dd4741d-736d-4776-90fc-88716783bd92	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produto1-1787607936046	2026-08-26 23:09:18.323	2026-08-26 23:09:18.323	s-msjq5trg-2yy0t8o0
6e74725d-3690-4c79-8ffe-f96fbbed13ce	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:09:23.638	2026-08-26 23:09:23.638	s-msjq5trg-2yy0t8o0
50a89fc7-8051-4e45-90c5-2582ae0f485b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:11:37.446	2026-08-26 23:11:37.446	s-msjq5trg-2yy0t8o0
0bc1595f-411e-4208-a2e6-0e2e5b77d694	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:11:37.464	2026-08-26 23:11:37.464	s-msjq5trg-2yy0t8o0
11f3b987-7539-4f99-84b3-2716130dbf62	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:13:08.846	2026-08-26 23:13:08.846	s-msjq5trg-2yy0t8o0
61012d47-dfb8-4432-bd13-3bed120f5875	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:13:09.077	2026-08-26 23:13:09.077	s-msjq5trg-2yy0t8o0
7707b83c-12ee-4136-a0ae-83183400182c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:13:49.666	2026-08-26 23:13:49.666	s-msjq5trg-2yy0t8o0
97c6a764-441b-4288-bc64-37a7984a984a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/categories	2026-08-26 23:13:52.574	2026-08-26 23:13:52.574	s-msjq5trg-2yy0t8o0
6a51a5a7-0bd8-46b1-b740-6c8a8621bc60	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products	2026-08-26 23:14:00.824	2026-08-26 23:14:00.824	s-msjq5trg-2yy0t8o0
215ea42c-7881-4c7c-ac13-ba2471075482	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/categories	2026-08-26 23:14:02.757	2026-08-26 23:14:02.757	s-msjq5trg-2yy0t8o0
d18823c9-5da5-410b-a0e0-a4ef3b19ba91	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 23:14:28.177	2026-08-26 23:14:28.177	s-mst4952d-t20wzch8
e53e4e60-ca8a-4932-8311-10133faf2f80	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 23:14:37.643	2026-08-26 23:14:37.643	s-mst4952d-t20wzch8
91d7b104-d5e0-4781-9059-4b31226cd3b7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 23:14:39.198	2026-08-26 23:14:39.198	s-mst4952d-t20wzch8
9a410646-b686-4cb5-a388-ecf001f74895	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-26 23:14:41.232	2026-08-26 23:14:41.232	s-mst4952d-t20wzch8
e0409db1-a95f-444b-8837-4ee989218930	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/categories	2026-08-26 23:39:17.602	2026-08-26 23:39:17.602	s-msjq5trg-2yy0t8o0
7bb3aafc-737c-4c7b-9654-48c00449d268	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/categories	2026-08-26 23:39:17.586	2026-08-26 23:39:17.586	s-msjq5trg-2yy0t8o0
85a92f94-6b0c-4aca-b140-cfdb9cea4826	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-26 23:39:22.046	2026-08-26 23:39:22.046	s-mst4952d-t20wzch8
28013cda-5e5a-4d4c-bc96-4369540502c9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-26 23:39:22.052	2026-08-26 23:39:22.052	s-mst4952d-t20wzch8
39eae2de-055b-480d-989e-8fe9b67e1bac	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-08-26 23:39:22.202	2026-08-26 23:39:22.202	s-mst4952d-t20wzch8
150d7a7b-dd8c-4353-bb92-69fd925c8d9a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-26 23:39:30.459	2026-08-26 23:39:30.459	s-mst4952d-t20wzch8
b3d88b63-6ccd-435c-bb92-a48ff5765d18	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/categories	2026-08-26 23:39:32.65	2026-08-26 23:39:32.65	s-msjq5trg-2yy0t8o0
42c436be-9d20-4032-a377-a95fe1a4b836	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/categories	2026-08-26 23:39:32.655	2026-08-26 23:39:32.655	s-msjq5trg-2yy0t8o0
fa68db53-d91c-468e-8429-b4fd7db861c8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:39:34.645	2026-08-26 23:39:34.645	s-msjq5trg-2yy0t8o0
d282b8c0-5be7-4f9b-9358-ef03fe9fa561	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:39:41.161	2026-08-26 23:39:41.161	s-msjq5trg-2yy0t8o0
6854e85d-59e7-45ef-8455-46ee9a10411c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-26 23:39:44.906	2026-08-26 23:39:44.906	s-mst4952d-t20wzch8
178b8065-dc71-46e4-84b6-e930b01c4878	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 23:39:46.363	2026-08-26 23:39:46.363	s-mst4952d-t20wzch8
a643d1c6-73e8-4ca9-96f9-7fd502579411	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-26 23:39:47.355	2026-08-26 23:39:47.355	s-mst4952d-t20wzch8
99f59463-c7cb-4b67-a02c-e1eff1240d98	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 23:40:23.576	2026-08-26 23:40:23.576	s-mst4952d-t20wzch8
f3aa822f-93cc-4211-9815-1175b4bde7d2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:40:26.794	2026-08-26 23:40:26.794	s-msjq5trg-2yy0t8o0
f8ae5f46-2955-4df1-8850-6e31f7c76099	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:40:26.804	2026-08-26 23:40:26.804	s-msjq5trg-2yy0t8o0
599c3bcf-7c8c-405c-8489-6fa878ae1e18	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-26 23:40:31.482	2026-08-26 23:40:31.482	s-msjq5trg-2yy0t8o0
7adccbd8-d590-4a50-bc69-70906ba30b73	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-26 23:40:40.412	2026-08-26 23:40:40.412	s-mst4952d-t20wzch8
65bdd53b-5985-4ade-a838-8d5df7d6fb30	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-26 23:41:15.629	2026-08-26 23:41:15.629	s-mst4952d-t20wzch8
939d73fd-da89-428c-90ac-725a402f3df3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-26 23:41:18.249	2026-08-26 23:41:18.249	s-msjq5trg-2yy0t8o0
4405be01-5dec-43f0-ac39-4393e683cf64	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-26 23:41:18.258	2026-08-26 23:41:18.258	s-msjq5trg-2yy0t8o0
a326c93e-e896-4ba1-8171-f215d22cd5bd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:41:20.14	2026-08-26 23:41:20.14	s-msjq5trg-2yy0t8o0
d1d4b223-bfee-4e82-891b-39eaf18df19b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-26 23:41:23.586	2026-08-26 23:41:23.586	s-msjq5trg-2yy0t8o0
1c9c0a9d-1896-404c-8409-11f8915dc1f7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:41:28.339	2026-08-26 23:41:28.339	s-msjq5trg-2yy0t8o0
096ea580-fd05-459f-b168-4b60c218a15e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-26 23:41:31.128	2026-08-26 23:41:31.128	s-msjq5trg-2yy0t8o0
2eab20e4-2c25-468c-8623-4e286bbaeee0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:41:36.401	2026-08-26 23:41:36.401	s-msjq5trg-2yy0t8o0
f87a6339-6584-481a-9de0-ff7acfdd3948	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-26 23:41:39.902	2026-08-26 23:41:39.902	s-msjq5trg-2yy0t8o0
09e7dd6e-f043-453a-b2b6-f73b36e7b4d9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-26 23:41:40.677	2026-08-26 23:41:40.677	s-msjq5trg-2yy0t8o0
2a959928-ee37-41fc-bf17-d4fdfccfd2c5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-26 23:41:49.935	2026-08-26 23:41:49.935	s-msjq5trg-2yy0t8o0
85fe521a-5e4f-4616-ac37-106207ffa689	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-26 23:49:08.545	2026-08-26 23:49:08.545	s-msjq5trg-2yy0t8o0
7664f753-4666-4d3d-9a74-9f8c6b1aea96	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-26 23:49:08.54	2026-08-26 23:49:08.54	s-msjq5trg-2yy0t8o0
4387b401-788f-4269-901f-4c561535fd32	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:59:48.165	2026-08-26 23:59:48.165	s-msjq5trg-2yy0t8o0
b8c0f5a5-bd81-42d3-9f75-3550d9daffa8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:59:48.207	2026-08-26 23:59:48.207	s-msjq5trg-2yy0t8o0
eb19a12e-d063-4e71-b390-3bff9f10be0b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:59:50.028	2026-08-26 23:59:50.028	s-msjq5trg-2yy0t8o0
2f00a9fe-37bd-42e3-a458-34302a7dfe29	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/auth/login	2026-08-26 23:59:50.035	2026-08-26 23:59:50.035	s-msjq5trg-2yy0t8o0
ebd3160d-77f5-42d9-991f-c5cf158fec38	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-26 23:59:57.691	2026-08-26 23:59:57.691	s-msjq5trg-2yy0t8o0
29d96e9d-d8a7-437a-a415-64f948dfc096	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 00:00:02.151	2026-08-27 00:00:02.151	s-msjq5trg-2yy0t8o0
04197d7b-0256-4f9d-948e-f8a3db4faeef	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 00:00:10.645	2026-08-27 00:00:10.645	s-msjq5trg-2yy0t8o0
f1f00376-af9d-4786-ad69-86eaca6bd63c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/chat	2026-08-27 00:00:14.363	2026-08-27 00:00:14.363	s-msjq5trg-2yy0t8o0
3c7b12db-74b3-4ce2-ae78-94b22a982318	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 00:00:35.14	2026-08-27 00:00:35.14	s-msjq5trg-2yy0t8o0
9215984b-c938-4b6c-a12b-f0aafd16fa8d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/chat	2026-08-27 00:00:37.103	2026-08-27 00:00:37.103	s-msjq5trg-2yy0t8o0
873ed138-d263-49ca-ad5f-9bdf0a946fa3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 00:00:41.137	2026-08-27 00:00:41.137	s-msjq5trg-2yy0t8o0
c60f3251-4a38-45f5-a1a3-2e772bb870a7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 00:00:42.525	2026-08-27 00:00:42.525	s-msjq5trg-2yy0t8o0
1ca1c305-2fa2-4a8b-987e-0cc86ddec069	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 00:00:50.936	2026-08-27 00:00:50.936	s-msjq5trg-2yy0t8o0
64d37812-cf17-46c8-bd5a-1fb33df4a06f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/chat	2026-08-27 00:00:52.617	2026-08-27 00:00:52.617	s-msjq5trg-2yy0t8o0
f72a23d5-ebea-4e79-9313-11a6bbcdf224	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 00:00:57.072	2026-08-27 00:00:57.072	s-msjq5trg-2yy0t8o0
396dcb08-d9b5-4dd2-b48c-67593826013f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 00:01:03.578	2026-08-27 00:01:03.578	s-msjq5trg-2yy0t8o0
2a11bf4d-b831-42fa-8d32-cdef8dbadf88	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-27 00:01:05.395	2026-08-27 00:01:05.395	s-msjq5trg-2yy0t8o0
a241d3a0-ff9b-4ff5-81a4-5f28182ed9c2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 00:01:13.053	2026-08-27 00:01:13.053	s-msjq5trg-2yy0t8o0
3bb1f18b-e434-4b5d-be57-a5499478c843	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-27 00:01:19.197	2026-08-27 00:01:19.197	s-msjq5trg-2yy0t8o0
4621820c-ee42-4378-a2a5-d58b2b23eb64	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/	2026-08-27 01:03:32.879	2026-08-27 01:03:32.879	s-msjq5trg-2yy0t8o0
3ad96dd5-12dc-4076-a7f6-e49aa8cc45ef	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-08-27 01:03:33.264	2026-08-27 01:03:33.264	s-mst4952d-t20wzch8
ed41be29-1853-4669-8b77-2c6a21069061	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 01:04:07.147	2026-08-27 01:04:07.147	s-msjq5trg-2yy0t8o0
491f6094-6a88-4a03-a03e-a698e2d18d10	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 01:04:23.401	2026-08-27 01:04:23.401	s-msjq5trg-2yy0t8o0
ec6207ad-2487-4c4e-becf-9c0695f797c0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 01:04:47.309	2026-08-27 01:04:47.309	s-msjq5trg-2yy0t8o0
2ce9ef53-cde4-403b-9106-e7404112e2cf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 01:04:50.337	2026-08-27 01:04:50.337	s-msjq5trg-2yy0t8o0
e573dcf2-bd49-4dfa-8324-2726effb615b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 01:05:01.742	2026-08-27 01:05:01.742	s-msjq5trg-2yy0t8o0
68014014-e256-4e90-8bda-bbe1ed17b239	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/chat	2026-08-27 01:05:03.397	2026-08-27 01:05:03.397	s-msjq5trg-2yy0t8o0
8ec34495-6414-4b64-97e9-cd81fd475de3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/chat	2026-08-27 01:05:38.207	2026-08-27 01:05:38.207	s-msjq5trg-2yy0t8o0
5a9b3ee9-b637-4059-bfab-0f80aff153d3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/chat	2026-08-27 01:05:38.221	2026-08-27 01:05:38.221	s-msjq5trg-2yy0t8o0
0f3627a2-764c-473c-a78f-98b098711e3a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 01:05:40.391	2026-08-27 01:05:40.391	s-msjq5trg-2yy0t8o0
fdab6bf9-fdfe-4b47-947e-de36c33d74cc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/chat	2026-08-27 01:06:03.797	2026-08-27 01:06:03.797	s-mst4952d-t20wzch8
0313bfd0-965f-49a3-ad88-901c0b15ece9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/chat	2026-08-27 01:06:13.449	2026-08-27 01:06:13.449	s-msjq5trg-2yy0t8o0
e46c1a24-4bce-43c7-929d-bb50945884d9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-08-27 01:06:31.343	2026-08-27 01:06:31.343	s-msjq5trg-2yy0t8o0
4e96df54-8af3-44ee-bfc3-2fca3aedbcd7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 01:07:03.416	2026-08-27 01:07:03.416	s-msjq5trg-2yy0t8o0
9f99b985-d668-459f-b909-9ffe835460ca	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-27 01:07:06.828	2026-08-27 01:07:06.828	s-msjq5trg-2yy0t8o0
81c62629-506c-49b0-b0ca-21913b3dc028	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-27 01:07:08.065	2026-08-27 01:07:08.065	s-msjq5trg-2yy0t8o0
7f75b1de-551d-446f-89ef-0c78c21437c7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-27 01:07:11.552	2026-08-27 01:07:11.552	s-msjq5trg-2yy0t8o0
f4706b9f-41b8-486e-930e-eadf5761bfe3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-27 01:07:13.407	2026-08-27 01:07:13.407	s-msjq5trg-2yy0t8o0
73388d5c-4836-4c56-a528-32f03deb4f46	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-27 01:07:20.782	2026-08-27 01:07:20.782	s-msjq5trg-2yy0t8o0
3dfc6acd-99ff-4fb1-985d-5a45d6b6fd11	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-27 01:07:22.66	2026-08-27 01:07:22.66	s-msjq5trg-2yy0t8o0
b215f88e-0ab0-49b0-9de5-f4d691ea0809	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/cart	2026-08-27 01:07:28.527	2026-08-27 01:07:28.527	s-msjq5trg-2yy0t8o0
1761854a-5166-470c-b21f-0dfc474b6da8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-27 01:07:33.143	2026-08-27 01:07:33.143	s-msjq5trg-2yy0t8o0
3a81fdd0-bee3-4d52-a783-790446e8f701	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-27 01:07:34.179	2026-08-27 01:07:34.179	s-msjq5trg-2yy0t8o0
c7538044-07b1-4a27-bd80-0af2522ffc16	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/checkout	2026-08-27 01:07:35.474	2026-08-27 01:07:35.474	s-msjq5trg-2yy0t8o0
f9cfd16f-3084-4295-a9d1-21a54812b244	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-27 01:07:45.732	2026-08-27 01:07:45.732	s-msjq5trg-2yy0t8o0
5141c8ac-1ab8-411b-bff1-9a2fdf0f3d6e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-08-27 01:07:54.789	2026-08-27 01:07:54.789	s-mst4952d-t20wzch8
feeb984a-b154-4cae-9f70-48f0ca37e89a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-08-27 01:07:56.577	2026-08-27 01:07:56.577	s-mst4952d-t20wzch8
5028a83a-7c79-4aa3-9a4f-c1a3559ad51d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-08-27 01:07:58.795	2026-08-27 01:07:58.795	s-mst4952d-t20wzch8
ba912a59-e8e2-48df-9a64-8609ffa707b8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:58:02.932	2026-09-05 18:58:02.932	s-msjq5trg-2yy0t8o0
5bc2a351-b102-4a0e-9204-6427f4bdb53c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 19:02:37.65	2026-09-05 19:02:37.65	s-mst4952d-t20wzch8
5a3d3ffe-130d-4de5-9e63-229ddba59794	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:11:41.292	2026-09-05 19:11:41.292	s-mst4952d-t20wzch8
2d1e3656-e351-4577-8fbc-578f5b2a3843	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:11:41.285	2026-09-05 19:11:41.285	s-mst4952d-t20wzch8
67634ccb-bb83-4254-b2cc-9053d60bfaf1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 19:11:56.847	2026-09-05 19:11:56.847	s-mst4952d-t20wzch8
6867a006-4e63-4ed6-99bf-54c6e9b8afd0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 19:18:51.246	2026-09-05 19:18:51.246	s-mst4952d-t20wzch8
15b50267-bebd-4e6c-8172-9789d00a8b8f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 20:16:43.586	2026-09-05 20:16:43.586	s-msjq5trg-2yy0t8o0
cea5f912-187f-4cca-b335-909a5e1d4b93	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 20:22:26.02	2026-09-05 20:22:26.02	s-msjq5trg-2yy0t8o0
84e8c4ff-6625-4e80-aa98-0d8774f36e46	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:28:59.923	2026-09-05 20:28:59.923	s-msjq5trg-2yy0t8o0
3711331a-d711-4be8-b27a-9c89e11d5ceb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:32:43.35	2026-09-05 20:32:43.35	s-msjq5trg-2yy0t8o0
75ae9865-e962-40df-8e8c-803d868d7533	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-09-05 20:34:50.131	2026-09-05 20:34:50.131	s-mst4952d-t20wzch8
f00dcd66-c5af-4e52-9c7b-77e5c5c78f2c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-09-05 20:35:06.168	2026-09-05 20:35:06.168	s-mst4952d-t20wzch8
f854f8bc-d84b-4b6c-a3b7-3541f800191b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:35:06.378	2026-09-05 20:35:06.378	s-mst4952d-t20wzch8
a6ffa795-de30-400d-9de8-b5aa11c2014c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-05 20:41:43.533	2026-09-05 20:41:43.533	s-msjq5trg-2yy0t8o0
f9c4c770-16b0-4d25-8192-ea73ad95ea4b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:49:52.438	2026-09-05 20:49:52.438	s-mst4952d-t20wzch8
3fefc5e9-d8d9-4348-853d-c6d1d1c9bf5a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 20:50:00.326	2026-09-05 20:50:00.326	s-mst4952d-t20wzch8
de67b06a-d4f3-4bcf-9707-83075f9a4583	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/profile	2026-09-05 20:52:35.27	2026-09-05 20:52:35.27	s-mst4952d-t20wzch8
eac6c88f-91a7-4e52-88ca-6f8540368d6a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 20:52:41.092	2026-09-05 20:52:41.092	s-mst4952d-t20wzch8
6048b229-9502-4db9-b591-71108098440f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:11:10.631	2026-09-05 21:11:10.631	s-msjq5trg-2yy0t8o0
9fe55f25-f995-4938-ab91-6b2ed9dc087d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 21:11:16.099	2026-09-05 21:11:16.099	s-msjq5trg-2yy0t8o0
6e5bd1a7-b46e-4ed8-8a6a-b336d440b239	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:29:18.873	2026-09-05 21:29:18.873	s-msjq5trg-2yy0t8o0
e7ec5c5d-6bba-420a-88eb-2feabdc41983	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:31:22.765	2026-09-05 21:31:22.765	s-msjq5trg-2yy0t8o0
fb2409f1-1423-4110-b296-0428f62c8470	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:37:37.117	2026-09-05 21:37:37.117	s-msjq5trg-2yy0t8o0
e5c501cc-2460-4331-a322-5827e108741c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:42:17.724	2026-09-05 21:42:17.724	s-mst4952d-t20wzch8
4571aa1f-a624-483a-9cd0-8b9833ece126	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:47:09.641	2026-09-05 21:47:09.641	s-mst4952d-t20wzch8
a2c6eac7-aab4-4f67-a326-9a3e1ccdd529	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-06 00:48:57.853	2026-09-06 00:48:57.853	s-mst4952d-t20wzch8
aa2b71c3-abb7-4053-b7aa-2ca835a8817c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-06 00:48:59.707	2026-09-06 00:48:59.707	s-mst4952d-t20wzch8
39c25317-a1cc-4852-8462-00108813dd79	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-08-27 01:08:06.354	2026-08-27 01:08:06.354	s-mst4952d-t20wzch8
9bedd0dd-5069-42fe-a937-e1d62178eb6c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-27 01:08:34.771	2026-08-27 01:08:34.771	s-msjq5trg-2yy0t8o0
7b572e0e-c158-4eb2-b552-de8e7b142e1e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/products/produtosite-1787787623434	2026-08-27 01:08:34.782	2026-08-27 01:08:34.782	s-msjq5trg-2yy0t8o0
adb06618-101a-4b12-929d-f69ef771606e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 01:08:36.364	2026-08-27 01:08:36.364	s-msjq5trg-2yy0t8o0
5da6f92f-91ee-4402-8de3-a2803e0d18ec	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 01:08:58.97	2026-08-27 01:08:58.97	s-msjq5trg-2yy0t8o0
58765102-1b3a-44aa-a8e4-38bb6f48513e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-27 01:08:58.983	2026-08-27 01:08:58.983	s-msjq5trg-2yy0t8o0
d07fa932-b524-4f08-b319-535cd59f3621	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 17:45:43.901	2026-09-05 17:45:43.901	s-msjq5trg-2yy0t8o0
d42cdc2d-838d-4b36-b542-9aaa1bd475ba	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 17:45:43.909	2026-09-05 17:45:43.909	s-msjq5trg-2yy0t8o0
0367fcf6-fe5c-45b4-a97f-22f09feb29b3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 17:46:04.846	2026-09-05 17:46:04.846	s-msjq5trg-2yy0t8o0
77bbac7d-a8fc-416a-b814-469d8d394b92	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 17:46:15.27	2026-09-05 17:46:15.27	s-msjq5trg-2yy0t8o0
064cd63a-2084-41d7-8e25-8f9a76d5b5a8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 17:46:30.322	2026-09-05 17:46:30.322	s-mst4952d-t20wzch8
cf5db618-c9b9-41f0-8fe8-b32659614ccc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 17:46:30.331	2026-09-05 17:46:30.331	s-mst4952d-t20wzch8
73585bc6-337a-4d01-8422-a4bdd4a36ae0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 17:46:35.265	2026-09-05 17:46:35.265	s-mst4952d-t20wzch8
f32b22fb-3b99-4d16-8f55-427fd7afe121	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 17:46:41.521	2026-09-05 17:46:41.521	s-mst4952d-t20wzch8
93abb4e8-4fb2-4f78-9b6c-b946210de6d9	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/checkout	2026-09-05 17:46:53.408	2026-09-05 17:46:53.408	s-mst4952d-t20wzch8
5787674e-0709-41ff-88a4-1f48f8031c32	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 17:46:58.513	2026-09-05 17:46:58.513	s-mst4952d-t20wzch8
96f228e7-8fef-4caf-98ff-0864137e48bb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-09-05 17:51:25.323	2026-09-05 17:51:25.323	s-msjq5trg-2yy0t8o0
a562e8e9-30eb-424a-a6ea-27e8350ffd88	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 17:51:31.593	2026-09-05 17:51:31.593	s-msjq5trg-2yy0t8o0
9ab187f6-9b84-45e4-9167-ea08522561f2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 17:51:54.42	2026-09-05 17:51:54.42	s-msjq5trg-2yy0t8o0
ee71058a-340a-4a29-83d8-b5f049cf1497	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 17:51:58.366	2026-09-05 17:51:58.366	s-msjq5trg-2yy0t8o0
db1af963-3810-4e74-a465-d05ec4be3a98	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 17:52:07.782	2026-09-05 17:52:07.782	s-msjq5trg-2yy0t8o0
8e0a3149-8718-4c61-9d34-c69445910832	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 17:52:07.794	2026-09-05 17:52:07.794	s-msjq5trg-2yy0t8o0
28520a59-92ca-46f0-b28a-53ef46677fdc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 18:02:20.964	2026-09-05 18:02:20.964	s-msjq5trg-2yy0t8o0
085d8313-2645-4021-9d1c-aeabfe061900	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 18:02:21.052	2026-09-05 18:02:21.052	s-msjq5trg-2yy0t8o0
7a226778-7335-413e-a462-23af0133e0e1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:02:27.921	2026-09-05 18:02:27.921	s-msjq5trg-2yy0t8o0
ef64b67e-0b53-4bfe-b587-bec2b9d3f0b1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products	2026-09-05 18:02:30.619	2026-09-05 18:02:30.619	s-msjq5trg-2yy0t8o0
f50c37cc-7a48-40a8-bdd5-e5a7e1a087f1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:46:58.277	2026-09-05 18:46:58.277	s-msjq5trg-2yy0t8o0
26f850ea-c2d2-4b43-8f22-7f9fb19b06c2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 18:47:15.864	2026-09-05 18:47:15.864	s-mst4952d-t20wzch8
3d5a4920-b2a8-437e-b6c6-53cedfb43e37	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 18:47:15.857	2026-09-05 18:47:15.857	s-mst4952d-t20wzch8
02861286-4f8d-448a-83ba-a555a168b4a2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 18:47:21.644	2026-09-05 18:47:21.644	s-mst4952d-t20wzch8
991a6c85-e7ac-44ba-9b0a-5f06197781c0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/cart	2026-09-05 18:47:32.045	2026-09-05 18:47:32.045	s-mst4952d-t20wzch8
6cb7d3d7-6784-4462-9372-49e842b7f9e3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 18:47:35.265	2026-09-05 18:47:35.265	s-mst4952d-t20wzch8
cbb768af-4611-4a0c-8f93-de4d1332d1d7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 18:47:38.962	2026-09-05 18:47:38.962	s-mst4952d-t20wzch8
05ccdfde-0a9a-4097-a572-c92943e15022	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 18:47:45.665	2026-09-05 18:47:45.665	s-mst4952d-t20wzch8
97d70abe-7e61-44c2-9d6f-2ff36e08ba7f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:58:42.925	2026-09-05 18:58:42.925	s-msjq5trg-2yy0t8o0
6500859b-d726-4bab-9c08-e126b2c89fb3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:05:58.306	2026-09-05 19:05:58.306	s-mst4952d-t20wzch8
51e7b987-c307-4bd9-907f-03748cb923bf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:11:49.719	2026-09-05 19:11:49.719	s-msjq5trg-2yy0t8o0
3eb72e35-ea1a-4865-9af3-0c1f4f475abb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 19:18:57.309	2026-09-05 19:18:57.309	s-mst4952d-t20wzch8
8ee539fa-144a-4847-bce4-5cad3d347c18	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-05 20:16:43.599	2026-09-05 20:16:43.599	s-msjq5trg-2yy0t8o0
8c7a152d-cc9c-4b42-a298-80ab5b15bcf1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:23:00.946	2026-09-05 20:23:00.946	s-mst4952d-t20wzch8
cc24678a-d3b4-46f2-a69e-f8ea3197f609	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:31:22.256	2026-09-05 20:31:22.256	s-mst4952d-t20wzch8
c5c46df5-8566-4489-8dae-a86d03231c43	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:31:30.686	2026-09-05 20:31:30.686	s-msjq5trg-2yy0t8o0
d35deda9-15e9-4ec7-81e0-54fefef4bf8f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:32:55.472	2026-09-05 20:32:55.472	s-msjq5trg-2yy0t8o0
4f7b1ebc-850b-4144-ba8c-3afbaaca600c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/shipping	2026-09-05 20:34:52.279	2026-09-05 20:34:52.279	s-mst4952d-t20wzch8
810c434e-77a1-4f9b-8da0-089709c970d4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/promotions	2026-09-05 20:34:53.243	2026-09-05 20:34:53.243	s-mst4952d-t20wzch8
aa978009-0a8f-4b9c-888b-eff447152c41	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:34:55.433	2026-09-05 20:34:55.433	s-mst4952d-t20wzch8
e280cb99-7f33-4067-bd16-3bdce892dbad	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-05 20:34:56.494	2026-09-05 20:34:56.494	s-mst4952d-t20wzch8
ec32cf21-34e8-49f0-b5cb-50ea9f2ad8c2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:46:21.542	2026-09-05 20:46:21.542	s-msjq5trg-2yy0t8o0
2f269ec0-110d-40ad-a46b-c56d6e14a962	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-05 20:50:04.882	2026-09-05 20:50:04.882	s-mst4952d-t20wzch8
b18165b6-5fc8-4d2f-8a6d-3ba1c889b9e3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/shipping	2026-09-05 20:52:42.882	2026-09-05 20:52:42.882	s-mst4952d-t20wzch8
61dccb76-78aa-4a05-9c35-4babe7aee6df	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:13:36.971	2026-09-05 21:13:36.971	s-msjq5trg-2yy0t8o0
72f35c01-941e-4eb3-bb93-71846b022e78	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 21:13:40.458	2026-09-05 21:13:40.458	s-msjq5trg-2yy0t8o0
6e05308d-f04a-462d-8690-636f2bc2221a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:29:21.53	2026-09-05 21:29:21.53	s-msjq5trg-2yy0t8o0
b574b492-ebba-49e2-8501-a076466bcdca	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 21:29:32.906	2026-09-05 21:29:32.906	s-mst4952d-t20wzch8
ba83aa58-e9b1-41ca-ac6d-9fdfcdcc89a7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:31:31	2026-09-05 21:31:31	s-msjq5trg-2yy0t8o0
a74c432b-3456-46b3-ba03-705c4cc24239	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 21:31:32.813	2026-09-05 21:31:32.813	s-msjq5trg-2yy0t8o0
0b91ca5c-cb77-44aa-a832-3c68db98fa0c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:37:37.121	2026-09-05 21:37:37.121	s-msjq5trg-2yy0t8o0
e377093a-1521-41ab-81f4-647b20af3d57	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:42:55.702	2026-09-05 21:42:55.702	s-mst4952d-t20wzch8
436b97b3-c5fa-4c89-a401-06077abf93f0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:47:09.652	2026-09-05 21:47:09.652	s-mst4952d-t20wzch8
1f7a22ba-d025-4e8f-a923-cd73554757b1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-06 00:55:34.817	2026-09-06 00:55:34.817	s-mst4952d-t20wzch8
d74a1c59-f54a-41a0-9572-feacb932f0bf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/auth/login	2026-09-06 01:04:08.759	2026-09-06 01:04:08.759	s-msjq5trg-2yy0t8o0
3f093690-44ee-4530-8225-506e72939d7c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 18:47:44.339	2026-09-05 18:47:44.339	s-mst4952d-t20wzch8
991395c9-c295-43e5-90c0-a576c30424d2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 18:47:53.288	2026-09-05 18:47:53.288	s-mst4952d-t20wzch8
f2681401-3541-4320-910d-922160edd987	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 18:58:42.94	2026-09-05 18:58:42.94	s-msjq5trg-2yy0t8o0
bcf68ac6-caeb-4491-b9f7-86aa7d067639	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 19:06:03.996	2026-09-05 19:06:03.996	s-mst4952d-t20wzch8
8d7afbfc-a64e-49f9-9d73-c848121e357a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 19:11:49.741	2026-09-05 19:11:49.741	s-msjq5trg-2yy0t8o0
862f61f8-b800-4b25-9fdb-dec93e8a921c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1787787675538	2026-09-05 19:19:30.828	2026-09-05 19:19:30.828	s-msjq5trg-2yy0t8o0
d3315977-7310-487e-b208-fe6bc06b3c02	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-05 20:19:55.522	2026-09-05 20:19:55.522	s-mst4952d-t20wzch8
c49d52b4-540a-4b33-84a5-a5a306a61cdf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 20:20:02.278	2026-09-05 20:20:02.278	s-mst4952d-t20wzch8
5f30b22e-bb68-4bea-9dc6-0c6c683e4e53	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:23:00.952	2026-09-05 20:23:00.952	s-mst4952d-t20wzch8
24f10130-2336-4766-8821-6592e7e4d389	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 20:31:22.268	2026-09-05 20:31:22.268	s-mst4952d-t20wzch8
c834bd60-66c6-4eba-aed7-9d4a8bf7fdcc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-05 20:32:55.478	2026-09-05 20:32:55.478	s-msjq5trg-2yy0t8o0
5dd6d563-351f-40ff-b522-b46c8d7a7cda	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-09-05 20:34:53.954	2026-09-05 20:34:53.954	s-mst4952d-t20wzch8
7d74c8ed-d836-4bff-8a29-42713c9f37f0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-05 20:46:21.551	2026-09-05 20:46:21.551	s-msjq5trg-2yy0t8o0
fa20e9fa-0c76-449e-b772-03a45aa4c26e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-05 20:50:16.878	2026-09-05 20:50:16.878	s-mst4952d-t20wzch8
6fc36934-c565-4efb-b64f-c4dbe4772ab0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-05 20:53:53.155	2026-09-05 20:53:53.155	s-msjq5trg-2yy0t8o0
ffbcd538-dd9a-4ad7-952a-61ef7c17941d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-05 20:53:53.165	2026-09-05 20:53:53.165	s-msjq5trg-2yy0t8o0
78706b73-35a9-4894-95e9-f33e5d236d4a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:13:42.034	2026-09-05 21:13:42.034	s-msjq5trg-2yy0t8o0
d65ed709-9323-411b-8aed-a190d8d486f8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/checkout	2026-09-05 21:29:23.892	2026-09-05 21:29:23.892	s-msjq5trg-2yy0t8o0
711d0e79-8e14-4aec-b4b8-865417a5fe08	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/cart	2026-09-05 21:31:34.55	2026-09-05 21:31:34.55	s-msjq5trg-2yy0t8o0
f331ff6f-5394-4162-bed9-0a8d3e47d68a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-05 21:39:00.745	2026-09-05 21:39:00.745	s-msjq5trg-2yy0t8o0
a66391f9-5693-4463-a3fc-d6cc628277c8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:42:55.71	2026-09-05 21:42:55.71	s-mst4952d-t20wzch8
3e7bafeb-1fec-44d6-8ef9-a00f782104a1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-05 21:48:38.83	2026-09-05 21:48:38.83	s-mst4952d-t20wzch8
27c70407-df03-48e4-8b7a-87935c293fae	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-06 00:55:53.944	2026-09-06 00:55:53.944	s-mst4952d-t20wzch8
e956ca61-3039-4560-8a83-194051c1b320	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:04:22.178	2026-09-06 01:04:22.178	s-msjq5trg-2yy0t8o0
0806148a-04d8-4114-9f67-cf93c4f736b2	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/categories	2026-09-06 01:06:00.667	2026-09-06 01:06:00.667	s-msjq5trg-2yy0t8o0
b2fecb38-2fd9-41dd-885c-ff7ea09f14c4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:06:02.741	2026-09-06 01:06:02.741	s-msjq5trg-2yy0t8o0
4609a9b4-c17b-42c5-98a0-bf19892d993f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:13:31.188	2026-09-06 01:13:31.188	s-msjq5trg-2yy0t8o0
41988844-0f2a-485c-a120-8de61b379003	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/	2026-09-06 01:14:07.725	2026-09-06 01:14:07.725	s-msjq5trg-2yy0t8o0
c624c44a-0ae1-4ba1-a65e-4748a5aa656b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers	2026-09-06 01:16:19.933	2026-09-06 01:16:19.933	s-msjq5trg-2yy0t8o0
7a400684-b4d4-4cc8-a61a-61bcf8e98924	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers	2026-09-06 01:16:19.945	2026-09-06 01:16:19.945	s-msjq5trg-2yy0t8o0
cb1eded2-228a-49e0-a651-fecc33010dce	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers	2026-09-06 01:18:05.693	2026-09-06 01:18:05.693	s-msjq5trg-2yy0t8o0
aaba3288-5c2e-4207-8885-b08fae41781c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	Desktop	Edge	/suppliers	2026-09-06 01:18:05.699	2026-09-06 01:18:05.699	s-msjq5trg-2yy0t8o0
e8038eae-54a4-4aa9-a826-cc24e6234165	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/auth/login	2026-09-18 21:00:48.083	2026-09-18 21:00:48.083	s-msjq5trg-2yy0t8o0
79780a33-6d31-4be4-ae08-2df19024dce1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:09:30.193	2026-09-18 21:09:30.193	s-msjq5trg-2yy0t8o0
416420e6-3e1f-4332-8110-45a3d418b0fd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:09:48.852	2026-09-18 21:09:48.852	s-msjq5trg-2yy0t8o0
e2037725-ba90-4ad1-a212-c1d24b3ab9ff	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:10:12.663	2026-09-18 21:10:12.663	s-msjq5trg-2yy0t8o0
cde81066-ad6e-4c0d-a940-d2c5f27cc7a1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products	2026-09-18 21:10:16.978	2026-09-18 21:10:16.978	s-msjq5trg-2yy0t8o0
755944d5-c87a-472f-859b-6c3033eff6ee	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:10:21.129	2026-09-18 21:10:21.129	s-msjq5trg-2yy0t8o0
5a582e9f-33f7-4b76-bf6a-01bb4d09e65d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:16:01.417	2026-09-18 21:16:01.417	s-msjq5trg-2yy0t8o0
e7a71b93-5f23-431c-abcb-3541fea7ca19	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:16:02.844	2026-09-18 21:16:02.844	s-msjq5trg-2yy0t8o0
872d299e-8705-40ee-bce1-befef2e2076f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:16:01.472	2026-09-18 21:16:01.472	s-msjq5trg-2yy0t8o0
88c8e2a2-ea77-497a-bdd7-184b0eaef58f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:16:02.904	2026-09-18 21:16:02.904	s-msjq5trg-2yy0t8o0
7444c9ff-b467-4275-ba9b-226d2a325436	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:16:23.334	2026-09-18 21:16:23.334	s-msjq5trg-2yy0t8o0
d34c3f46-bef6-47ca-8ff3-79705da95e9f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:16:38.323	2026-09-18 21:16:38.323	s-msjq5trg-2yy0t8o0
e42e60c1-707e-4009-a595-dd9f8eb8f47b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:16:38.345	2026-09-18 21:16:38.345	s-msjq5trg-2yy0t8o0
c7603d72-ed92-4f7f-8df7-213fbada60d3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:16:52.896	2026-09-18 21:16:52.896	s-msjq5trg-2yy0t8o0
d4130b87-2816-41d6-bac1-2fa53ebd6905	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:16:52.907	2026-09-18 21:16:52.907	s-msjq5trg-2yy0t8o0
30028269-ea19-4877-a31a-e0090e05ef69	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:17:46.616	2026-09-18 21:17:46.616	s-msjq5trg-2yy0t8o0
a7c06ff3-7cef-43f6-8870-b0d67e110839	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:17:46.621	2026-09-18 21:17:46.621	s-msjq5trg-2yy0t8o0
9f988e8e-dc29-4c8d-8e56-1038b5633ebe	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:17:47.909	2026-09-18 21:17:47.909	s-msjq5trg-2yy0t8o0
c6475f71-a939-4fb3-876b-d6b86ec12d2d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-18 21:17:56.803	2026-09-18 21:17:56.803	s-msjq5trg-2yy0t8o0
a3e2db51-33a2-4321-86a0-61bb501acb59	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:18:01.134	2026-09-18 21:18:01.134	s-msjq5trg-2yy0t8o0
e26df24a-9460-405c-a8f6-00afd7f13f1e	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtocontato-1788640127841	2026-09-18 21:18:03.393	2026-09-18 21:18:03.393	s-msjq5trg-2yy0t8o0
27155f07-0e09-4ce7-87cc-71af191e13f7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:18:20.88	2026-09-18 21:18:20.88	s-msjq5trg-2yy0t8o0
9d0d3990-e374-4a91-a112-33397bb751e7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-18 21:18:22.563	2026-09-18 21:18:22.563	s-msjq5trg-2yy0t8o0
b14b7122-fc26-4ab6-afe6-77a881aec957	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:18:26.277	2026-09-18 21:18:26.277	s-msjq5trg-2yy0t8o0
9bd61dd1-957d-4099-9dbc-aae14f6e031d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtocontato-1788640350218	2026-09-18 21:18:27.888	2026-09-18 21:18:27.888	s-msjq5trg-2yy0t8o0
8fd4e1e1-6250-41ca-ba17-5c84645bb1cf	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-09-18 21:18:30.397	2026-09-18 21:18:30.397	s-msjq5trg-2yy0t8o0
3a015040-9b8d-4069-bb6c-fa22c2068833	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/suppliers	2026-09-18 21:18:34.094	2026-09-18 21:18:34.094	s-msjq5trg-2yy0t8o0
d4a1c81d-c16d-4942-b31b-fe52d974fb6d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-09-18 21:18:37.869	2026-09-18 21:18:37.869	s-msjq5trg-2yy0t8o0
6aafdbf4-2b07-4086-8a2d-4bd40ff41340	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:18:38.877	2026-09-18 21:18:38.877	s-msjq5trg-2yy0t8o0
abaac64f-eb3d-4aee-afff-c5fa28ea0e94	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:19:05.287	2026-09-18 21:19:05.287	s-msjq5trg-2yy0t8o0
230de9d1-2ecd-475e-ab75-66a3103b7b72	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-09-18 21:19:06.926	2026-09-18 21:19:06.926	s-msjq5trg-2yy0t8o0
e36ab139-b27e-4858-b4f6-5e0a0e485cfd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtofrete-1788643981653	2026-09-18 21:19:08.726	2026-09-18 21:19:08.726	s-msjq5trg-2yy0t8o0
79256570-9dac-44a9-a3a2-74b64a668a50	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/	2026-09-18 21:19:10.469	2026-09-18 21:19:10.469	s-msjq5trg-2yy0t8o0
6ffe7c87-b686-4ec2-8c38-7a8ad1ff4968	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-18 21:20:59.521	2026-09-18 21:20:59.521	s-msjq5trg-2yy0t8o0
fe9a36df-9830-4017-8916-294141749d45	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:21:34.234	2026-09-18 21:21:34.234	s-mst4952d-t20wzch8
990aa8b0-f82d-4560-ae4c-369f0a6fcdbc	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:21:34.255	2026-09-18 21:21:34.255	s-mst4952d-t20wzch8
2f693268-641f-4572-83df-7bb4a5400ce6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/auth/login	2026-09-18 21:21:38.13	2026-09-18 21:21:38.13	s-mst4952d-t20wzch8
00615345-9141-478e-bbf1-75a990a109a3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:21:44.468	2026-09-18 21:21:44.468	s-mst4952d-t20wzch8
ae2b4455-321f-42ad-a1db-dc8ec29a6e42	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-09-18 21:22:00.175	2026-09-18 21:22:00.175	s-msjq5trg-2yy0t8o0
47bb3056-5bb6-448a-97cb-d564d76f0dc1	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-18 21:22:02.15	2026-09-18 21:22:02.15	s-msjq5trg-2yy0t8o0
ed30f949-157c-4d9e-a043-43562336a96f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-18 21:22:17.289	2026-09-18 21:22:17.289	s-mst4952d-t20wzch8
01f8d412-3c55-4b66-a846-0b8d85ffe7d0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-18 21:22:19.735	2026-09-18 21:22:19.735	s-mst4952d-t20wzch8
64860e9e-7bf8-4f8f-9d78-db327553a1d6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-18 21:22:37.148	2026-09-18 21:22:37.148	s-mst4952d-t20wzch8
d32f4622-5f93-44db-bd16-0462743f2683	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-18 21:22:51.727	2026-09-18 21:22:51.727	s-mst4952d-t20wzch8
803076f6-3474-455d-8eda-129900364acb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-18 21:22:57.328	2026-09-18 21:22:57.328	s-mst4952d-t20wzch8
b8170a32-b036-472b-bd6c-db7b0d791646	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-09-18 21:23:49.877	2026-09-18 21:23:49.877	s-mst4952d-t20wzch8
e046538b-eab3-4c93-b073-89f652461e05	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-09-18 21:24:05.718	2026-09-18 21:24:05.718	s-mst4952d-t20wzch8
c7ab00fe-749d-4bdf-8045-84c31a7d7a9d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/products/produto1-1787607936046	2026-09-18 21:24:14.205	2026-09-18 21:24:14.205	s-mst4952d-t20wzch8
92e3b81d-0ef8-4691-b8bf-8ec6922155d0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/products	2026-09-18 21:24:16.332	2026-09-18 21:24:16.332	s-mst4952d-t20wzch8
b6ff0a3f-96fe-4141-ae96-68dae2b75d7f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:24:22.018	2026-09-18 21:24:22.018	s-mst4952d-t20wzch8
f6a4b216-ddd5-45af-97a8-f9b5d2d5051b	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:24:23.412	2026-09-18 21:24:23.412	s-mst4952d-t20wzch8
f319d10d-8598-4dc7-8135-d2d4f9544cf8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:24:23.419	2026-09-18 21:24:23.419	s-mst4952d-t20wzch8
665fab66-a0cd-431f-8912-df19e3b355ff	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:24:27.122	2026-09-18 21:24:27.122	s-mst4952d-t20wzch8
f4b4ec0a-f318-45fd-a172-ab28faccdbe4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:24:27.134	2026-09-18 21:24:27.134	s-mst4952d-t20wzch8
dba68351-7997-4783-895e-45111a723cc5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/products/produtoservio-1788640434418	2026-09-18 21:24:29.829	2026-09-18 21:24:29.829	s-mst4952d-t20wzch8
3a776479-4522-4b3a-bdb1-b5ad6ac708f7	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/suppliers/3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-09-18 21:24:32.069	2026-09-18 21:24:32.069	s-mst4952d-t20wzch8
943a1e23-26cc-49d3-a918-a1de4f9a7029	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:25:11.236	2026-09-18 21:25:11.236	s-mst4952d-t20wzch8
3c7e21a0-0949-4995-8120-a21031099b25	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-18 21:25:15.974	2026-09-18 21:25:15.974	s-mst4952d-t20wzch8
16f511d6-b40f-44cb-b49c-8530d156cf87	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-18 21:25:33.264	2026-09-18 21:25:33.264	s-mst4952d-t20wzch8
0deafbb7-a52f-4627-a7a5-7b363a748881	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-18 21:25:19.432	2026-09-18 21:25:19.432	s-mst4952d-t20wzch8
390e6ab4-0166-4a94-88b4-eded2e496a51	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-09-18 21:25:23.514	2026-09-18 21:25:23.514	s-mst4952d-t20wzch8
c8fea187-fe88-4295-b251-930233bef308	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-09-18 21:25:25.128	2026-09-18 21:25:25.128	s-mst4952d-t20wzch8
459f95df-331f-4810-9f22-f3a6a85c9a53	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-18 21:26:36.44	2026-09-18 21:26:36.44	s-msjq5trg-2yy0t8o0
21968671-3910-47ff-88ab-3dd3b7f4886d	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-18 21:26:36.448	2026-09-18 21:26:36.448	s-msjq5trg-2yy0t8o0
1de26a0a-1179-4371-9aa5-40ae2a988f96	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products/new	2026-09-18 21:27:07.178	2026-09-18 21:27:07.178	s-mst4952d-t20wzch8
a77b1507-fe48-4240-9311-c02ef87ebed0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-18 21:27:45.359	2026-09-18 21:27:45.359	s-mst4952d-t20wzch8
121c3559-3ed5-4fe0-b153-4ab84be1ae22	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-09-18 21:28:59.267	2026-09-18 21:28:59.267	s-mst4952d-t20wzch8
7ac14fe6-6e33-4f9b-ba60-f006353f990a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-18 21:29:05.505	2026-09-18 21:29:05.505	s-mst4952d-t20wzch8
0081dc53-f747-4c67-8ac1-5bfab574f5dd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-09-18 21:29:07.901	2026-09-18 21:29:07.901	s-mst4952d-t20wzch8
04db36c4-3f06-4bf3-8028-30159eeb3b96	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-18 21:29:10.186	2026-09-18 21:29:10.186	s-mst4952d-t20wzch8
d463c0d9-5089-4e5c-9d24-8cbb8c998f79	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/settings	2026-09-18 21:29:12.642	2026-09-18 21:29:12.642	s-mst4952d-t20wzch8
1a1682ff-7682-41eb-afe1-468576935957	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/profile	2026-09-18 21:30:05.456	2026-09-18 21:30:05.456	s-msjq5trg-2yy0t8o0
52c7c371-5771-46c2-ae28-fb50914595cd	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	Desktop	Edge	/products/produtoservio-1788640434418	2026-09-18 21:30:18.485	2026-09-18 21:30:18.485	s-msjq5trg-2yy0t8o0
bbbd39b5-309d-4a3c-b8cd-16379e9d235c	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reports	2026-09-18 21:30:50.119	2026-09-18 21:30:50.119	s-mst4952d-t20wzch8
31a49dc8-e74a-48c0-b98e-f04cd8f41de5	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/messages	2026-09-18 21:31:29.635	2026-09-18 21:31:29.635	s-mst4952d-t20wzch8
4d6497b1-b707-4d80-8d23-737aaf476c14	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/reviews	2026-09-18 21:31:37.292	2026-09-18 21:31:37.292	s-mst4952d-t20wzch8
cfc873b6-2ad5-4166-9e26-4514bb3a404f	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/shipping	2026-09-18 21:31:39.197	2026-09-18 21:31:39.197	s-mst4952d-t20wzch8
73f3a87f-ca46-4985-bf2d-c7c5ec2a437a	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/promotions	2026-09-18 21:31:44.763	2026-09-18 21:31:44.763	s-mst4952d-t20wzch8
201890a2-03b4-4dd6-b40b-89cbcbe1c3c6	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/orders	2026-09-18 21:31:46.62	2026-09-18 21:31:46.62	s-mst4952d-t20wzch8
183e92c4-c39a-4443-bc86-513e745602f3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/products	2026-09-18 21:31:48.801	2026-09-18 21:31:48.801	s-mst4952d-t20wzch8
e8556317-e3dc-4a17-8af8-97813e006bf0	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-18 21:31:50.731	2026-09-18 21:31:50.731	s-mst4952d-t20wzch8
b62b3eda-a7f0-4d2c-86de-bd15b06f93da	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/chat	2026-09-18 21:31:59.074	2026-09-18 21:31:59.074	s-mst4952d-t20wzch8
6bfeeb7b-73ac-4ddf-8888-5d6c2a48b993	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/supplier/dashboard	2026-09-18 21:32:04.733	2026-09-18 21:32:04.733	s-mst4952d-t20wzch8
d5bc1973-8781-40a5-9d45-4ef4d0911926	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Desktop	Chrome	/	2026-09-18 21:32:06.125	2026-09-18 21:32:06.125	s-mst4952d-t20wzch8
\.


--
-- Data for Name: SupplierFoundationHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupplierFoundationHistory" (id, "supplierId", "foundationDate", "recordedAt") FROM stdin;
38a36f9308338126b01534911ad4266d	67c3fca6-c5f8-4c61-be0a-14242941912c	2026-08-24	2026-08-24 22:16:17.596
1bbfeb7bcde0d2a218bbe87e481ce8c7	eca66561-b8f8-4fdb-99d1-ce59770da07e	2026-08-24	2026-08-24 22:16:17.668
3f8cd1cecc4ce569fd7aff035734eb30	34018438-eb0b-4185-b2a9-fdedd144c0f9	2026-08-24	2026-08-24 22:16:17.677
41be1e4ede5789e47b9e3e09738084c7	eb09d0ed-6942-40d3-b86f-1515e4ca6498	2026-08-24	2026-08-24 22:16:17.686
1c8c94eff9a3c92bb73e794eaece04a2	61ee48d5-6035-481d-80e6-dc63514230f4	2026-08-24	2026-08-24 22:16:17.694
a655a6a43641083d40f70acaca9413dc	fb2da4f2-55bb-48ee-b96f-17cabbc575f4	2026-08-24	2026-08-24 22:16:17.706
a1071cfbdbb3651ad622ed08bcce06c6	b3b7711a-5fed-4711-8917-46d69fe9b9f3	2026-08-24	2026-08-24 22:16:17.712
8b8f78d8f196bcfbcb5f5e4ecaee0ebd	b72c345d-1116-48b6-ac65-bee14b188580	2026-08-24	2026-08-24 22:16:17.72
605e6143fe98e4c1ea1e1afeb9714fff	3f27a882-9f1b-4714-b5b7-45af0f8a0101	2026-08-24	2026-08-24 21:43:57.402
4f7124fceec768b74869890163ec0dab	da5e6c54-1778-4a23-86d9-cf78d70f3157	2026-08-24	2026-08-24 22:16:17.728
12dc780f09998656ad263b0eb761c2f0	592eea3f-76b1-4efe-abb8-682d20965b1c	2026-08-24	2026-08-24 22:16:17.736
9fb48f80352354dcfe9f4a0372079b03	c8aeb037-a4fd-4654-8fc6-319e2418ee22	2026-08-24	2026-08-24 22:16:17.748
dee82235bf77c423a4be83bc3cbbfde1	2c7b5efa-b0fe-4204-a590-293aa7dafbcd	2026-08-24	2026-08-24 22:16:17.756
af4243298a2c3a1d738bc7bac0dc4948	7ac44407-d285-4538-93f1-4d4442bf605c	2026-08-24	2026-08-24 22:16:17.761
7fa00d52225074161eaad435ea6a85cf	42202f31-7606-4a80-84e9-bf2ef272bbd2	2026-08-24	2026-08-24 22:16:17.764
2dbfea13b474fd35396c958f5f85e99d	a1912859-5d7b-4472-8230-7653599484db	2026-08-24	2026-08-24 22:16:17.769
bb935c53a90ae90d4475e5a0a2682d42	9dd62bb3-3f23-4295-a310-0ae057f1bfb1	2026-08-24	2026-08-24 22:16:17.775
a1ac5d54733f931dbd4a05c98f13881a	056dbeed-7217-46bb-96e2-6ae0ba3043fb	2026-08-24	2026-08-24 22:16:17.779
e73759b67af0ea0e05e00b5a14ca3772	962de021-8d82-4624-a482-85cc8f7a4fe5	2026-08-24	2026-08-24 22:16:17.641
\.


--
-- Data for Name: SupplierProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupplierProfile" (id, "userId", "companyName", "tradingName", document, "stateRegistration", "municipalRegistration", description, "logoUrl", "bannerUrl", website, phone, whatsapp, email, status, "statusReason", "approvedAt", "reviewedBy", rating, "totalReviews", "totalProducts", "totalOrders", "totalSales", "foundedYear", "employeesCount", "businessHours", "deliveryInfo", certifications, badges, "socialNetworks", featured, "viewCount", "createdAt", "updatedAt", "deletedAt", "sellerRating", "sellerTotalReviews", tier, "profileTheme") FROM stdin;
67c3fca6-c5f8-4c61-be0a-14242941912c	e839b921-8e4c-4fe7-b660-9fe35de77aa7	AgroQuímica Brasil	AgroQuímica	00.000.001/0001-01	\N	\N	AgroQuímica Brasil — fornecedora de produtos para o agronegócio.	\N	\N	https://agroquímica.com.br	(11) 91111-1111	(11) 91111-1111	contato@agroquimica.com.br	APPROVED	\N	\N	\N	4.80	0	78	0	0.00	2023	88	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.596	2026-08-24 22:16:17.596	\N	0.00	0	BASIC	A
eca66561-b8f8-4fdb-99d1-ce59770da07e	e1cfbd43-254a-4c8d-a0dd-c0d77bbab6ea	Agro Tech Ltda	AgroTech	00.000.003/0001-03	\N	\N	Agro Tech Ltda — fornecedora de produtos para o agronegócio.	\N	\N	https://agrotech.com.br	(11) 93333-3333	(11) 93333-3333	admin@agrotech.com	APPROVED	\N	\N	\N	4.60	0	24	0	0.00	2024	80	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.668	2026-08-24 22:16:17.668	\N	0.00	0	BASIC	A
34018438-eb0b-4185-b2a9-fdedd144c0f9	70e4e96c-2709-4ee1-a7db-3338615f0f7b	Fertilizantes ABC	Fert ABC	00.000.004/0001-04	\N	\N	Fertilizantes ABC — fornecedora de produtos para o agronegócio.	\N	\N	https://fertabc.com.br	(11) 94444-4444	(11) 94444-4444	contato@fertabc.com	PENDING	\N	\N	\N	0.00	0	15	0	0.00	2015	77	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	f	0	2026-08-24 22:16:17.677	2026-08-24 22:16:17.677	\N	0.00	0	BASIC	A
eb09d0ed-6942-40d3-b86f-1515e4ca6498	d84edc2b-58fd-4838-ba16-7f9167d20802	Fazenda Boa Vista	Boa Vista	00.000.005/0001-05	\N	\N	Fazenda Boa Vista — fornecedora de produtos para o agronegócio.	\N	\N	https://boavista.com.br	(11) 95555-5555	(11) 95555-5555	contato@boavista.com	PENDING	\N	\N	\N	0.00	0	0	0	0.00	2015	95	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	f	0	2026-08-24 22:16:17.686	2026-08-24 22:16:17.686	\N	0.00	0	BASIC	A
61ee48d5-6035-481d-80e6-dc63514230f4	aa0bc469-025c-42c9-9895-1a18526c1ae3	IrrigaFácil	IrrigaFácil	00.000.006/0001-06	\N	\N	IrrigaFácil — fornecedora de produtos para o agronegócio.	\N	\N	https://irrigafácil.com.br	(11) 96666-6666	(11) 96666-6666	vendas@irrigafacil.com	APPROVED	\N	\N	\N	4.90	0	32	0	0.00	2018	59	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.694	2026-08-24 22:16:17.694	\N	0.00	0	BASIC	A
fb2da4f2-55bb-48ee-b96f-17cabbc575f4	70859dfd-a217-4817-a818-ee8bc8ca5071	Máquinas Agrícolas LTDA	Máq. Agrícolas	00.000.007/0001-07	\N	\N	Máquinas Agrícolas LTDA — fornecedora de produtos para o agronegócio.	\N	\N	https://máq.agrícolas.com.br	(11) 97777-7777	(11) 97777-7777	contato@maquinasagri.com	APPROVED	\N	\N	\N	4.50	0	18	0	0.00	2017	23	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.706	2026-08-24 22:16:17.706	\N	0.00	0	BASIC	A
b3b7711a-5fed-4711-8917-46d69fe9b9f3	10310716-7e13-4cfe-9f2e-be3c839fbd47	Defensivos Nacional	Def. Nacional	00.000.008/0001-08	\N	\N	Defensivos Nacional — fornecedora de produtos para o agronegócio.	\N	\N	https://def.nacional.com.br	(21) 98888-8888	(21) 98888-8888	pedidos@defensivosnac.com	APPROVED	\N	\N	\N	4.70	0	56	0	0.00	2017	71	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.712	2026-08-24 22:16:17.712	\N	0.00	0	BASIC	A
b72c345d-1116-48b6-ac65-bee14b188580	7a50c3a6-1def-431a-8964-afbd13ef4cc8	Sementes Genetix	Genetix	00.000.009/0001-09	\N	\N	Sementes Genetix — fornecedora de produtos para o agronegócio.	\N	\N	https://genetix.com.br	(21) 99999-9999	(21) 99999-9999	comercial@sementesgenetix.com	APPROVED	\N	\N	\N	4.90	0	34	0	0.00	2021	86	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.72	2026-08-24 22:16:17.72	\N	0.00	0	BASIC	A
3f27a882-9f1b-4714-b5b7-45af0f8a0101	a7b62382-7810-442b-a7c2-864c58f947ea	fornecedorTeste	fornecedorTeste	123.123.123-12	\N	\N	somos loja de...	/suppliers/images/b5332779-1ce5-4994-abc6-cfd535406d4a.jpg	\N	www..	(19) 8787-8787	(19) 8787-8787	fornecedor@teste.com	APPROVED	\N	2026-08-26 22:39:10.488	\N	3.50	2	0	0	0.00	\N	\N	\N	{"methods": []}	\N	\N	\N	f	0	2026-08-24 21:43:57.402	2026-09-05 20:54:35.188	\N	5.00	1	BASIC	A
da5e6c54-1778-4a23-86d9-cf78d70f3157	45b747f3-7560-494b-b3a6-695bfe526bd1	AgroTec Sistemas	AgroTec	00.000.010/0001-10	\N	\N	AgroTec Sistemas — fornecedora de produtos para o agronegócio.	\N	\N	https://agrotec.com.br	(31) 91111-1111	(31) 91111-1111	vendas@agrotecsistemas.com	APPROVED	\N	\N	\N	4.30	0	12	0	0.00	2023	60	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	f	0	2026-08-24 22:16:17.728	2026-08-24 22:16:17.728	\N	0.00	0	BASIC	A
592eea3f-76b1-4efe-abb8-682d20965b1c	a08d09da-8d04-4aec-9395-44c2c99ec117	Pecuária Forte	Pec. Forte	00.000.011/0001-11	\N	\N	Pecuária Forte — fornecedora de produtos para o agronegócio.	\N	\N	https://pec.forte.com.br	(31) 92222-2222	(31) 92222-2222	contato@pecuariaforte.com	APPROVED	\N	\N	\N	4.50	0	24	0	0.00	2021	55	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.736	2026-08-24 22:16:17.736	\N	0.00	0	BASIC	A
c8aeb037-a4fd-4654-8fc6-319e2418ee22	909a89ad-e702-4c60-a91a-68f6df63337d	Transporte Rural Log	Rural Log	00.000.012/0001-12	\N	\N	Transporte Rural Log — fornecedora de produtos para o agronegócio.	\N	\N	https://rurallog.com.br	(41) 91111-1111	(41) 91111-1111	logistica@transporterural.com	APPROVED	\N	\N	\N	4.20	0	5	0	0.00	2016	12	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	f	0	2026-08-24 22:16:17.748	2026-08-24 22:16:17.748	\N	0.00	0	BASIC	A
2c7b5efa-b0fe-4204-a590-293aa7dafbcd	80bc165e-29d7-456a-8493-0b55002eb9a6	Armazenagem Total	Arm. Total	00.000.013/0001-13	\N	\N	Armazenagem Total — fornecedora de produtos para o agronegócio.	\N	\N	https://arm.total.com.br	(41) 92222-2222	(41) 92222-2222	admin@armazenagemtotal.com	APPROVED	\N	\N	\N	4.40	0	9	0	0.00	2017	58	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	f	0	2026-08-24 22:16:17.756	2026-08-24 22:16:17.756	\N	0.00	0	BASIC	A
7ac44407-d285-4538-93f1-4d4442bf605c	5ea87a5a-a671-4901-a7f9-c898a3a31360	Orgânicos do Vale	Org. Vale	00.000.014/0001-14	\N	\N	Orgânicos do Vale — fornecedora de produtos para o agronegócio.	\N	\N	https://org.vale.com.br	(51) 91111-1111	(51) 91111-1111	contato@organicosdovale.com	PENDING	\N	\N	\N	0.00	0	0	0	0.00	2019	75	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	f	0	2026-08-24 22:16:17.761	2026-08-24 22:16:17.761	\N	0.00	0	BASIC	A
42202f31-7606-4a80-84e9-bf2ef272bbd2	6857e3fe-8705-432c-bb6a-ed0a91d97eb4	BioDefensivos Naturais	BioDef.	00.000.015/0001-15	\N	\N	BioDefensivos Naturais — fornecedora de produtos para o agronegócio.	\N	\N	https://biodef..com.br	(51) 92222-2222	(51) 92222-2222	pedidos@biodefensivos.com	APPROVED	\N	\N	\N	4.60	0	22	0	0.00	2015	70	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.764	2026-08-24 22:16:17.764	\N	0.00	0	BASIC	A
a1912859-5d7b-4472-8230-7653599484db	588c3775-2e2f-4a72-8622-ac468b3c5b52	Tratores e Cia	Tratores Cia	00.000.016/0001-16	\N	\N	Tratores e Cia — fornecedora de produtos para o agronegócio.	\N	\N	https://tratorescia.com.br	(61) 91111-1111	(61) 91111-1111	vendas@tratoresecia.com	APPROVED	\N	\N	\N	4.50	0	14	0	0.00	2015	57	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.769	2026-08-24 22:16:17.769	\N	0.00	0	BASIC	A
9dd62bb3-3f23-4295-a310-0ae057f1bfb1	7283040e-11c4-4256-8da4-37b3bdaa7354	IrrigaTech Solutions	IrrigaTech	00.000.017/0001-17	\N	\N	IrrigaTech Solutions — fornecedora de produtos para o agronegócio.	\N	\N	https://irrigatech.com.br	(61) 92222-2222	(61) 92222-2222	suporte@irrigatech.com	BLOCKED	\N	\N	\N	4.70	0	28	0	0.00	2022	96	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	f	0	2026-08-24 22:16:17.775	2026-08-24 22:16:17.775	\N	0.00	0	BASIC	A
056dbeed-7217-46bb-96e2-6ae0ba3043fb	f8bddf0b-6ed7-4b47-9bbf-ee217859ba40	NutriPlant Fertilizantes	NutriPlant	00.000.018/0001-18	\N	\N	NutriPlant Fertilizantes — fornecedora de produtos para o agronegócio.	\N	\N	https://nutriplant.com.br	(71) 91111-1111	(71) 91111-1111	admin@nutriplant.com	APPROVED	\N	\N	\N	4.80	0	41	0	0.00	2017	92	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.779	2026-08-24 22:16:17.779	\N	0.00	0	BASIC	A
962de021-8d82-4624-a482-85cc8f7a4fe5	eac5477d-f6f0-44d0-a18b-04852e6aecd9	Sementes Silva	Sementes Silva	00.000.002/0001-02	\N	\N	Sementes Silva — fornecedora de produtos para o agronegócio.	\N	\N	https://sementessilva.com.br	(11) 92222-2222	(11) 92222-2222	vendas@sementessilva.com	APPROVED	\N	\N	\N	5.00	1	48	0	0.00	2024	56	{"friday": {"open": "08:00", "close": "17:00"}, "monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}}	\N	{"ISO 9001"}	{"Fornecedor Verificado"}	\N	t	0	2026-08-24 22:16:17.641	2026-08-25 23:40:48.781	\N	5.00	1	BASIC	A
\.


--
-- Data for Name: SupportAttachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportAttachment" (id, "ticketId", type, "fileName", "mimeType", size, url, "createdAt") FROM stdin;
\.


--
-- Data for Name: SupportCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportCategory" (id, slug, name, description, icon, "order", active, "createdAt", "updatedAt", "deletedAt") FROM stdin;
dc8a7af8-5928-4f2f-afec-f05d9b873d8f	fornecedor	Fornecedor	Problemas com perfis e páginas de fornecedores	store	9	t	2026-08-24 21:30:49.088	2026-08-25 01:26:53.313	\N
74ecfce2-9499-4376-85ec-9c8543d19b66	chat	Chat	Problemas com o chat em tempo real	chat	10	t	2026-08-24 21:30:49.093	2026-08-25 01:26:53.32	\N
ab7a337a-e042-4488-be96-28bfe3f9c78d	avaliacoes	Avaliações	Problemas ao avaliar produtos e fornecedores	star	11	t	2026-08-24 21:30:49.097	2026-08-25 01:26:53.326	\N
3d06a430-6c59-4023-9d8e-62bfdb5ce603	favoritos	Favoritos	Problemas com a lista de favoritos	heart	12	t	2026-08-24 21:30:49.101	2026-08-25 01:26:53.331	\N
0d012b7e-d2fe-4907-952e-63dd7d4f400d	notificacoes	Notificações	Problemas com o recebimento de notificações	bell	13	t	2026-08-24 21:30:49.113	2026-08-25 01:26:53.345	\N
8fef2ec7-3f8a-4977-bf74-d3ef54f93c5a	promocoes	Promoções	Problemas com promoções e cupons	ticket	14	t	2026-08-24 21:30:49.117	2026-08-25 01:26:53.352	\N
e2aad57d-2d5b-4d3a-a6ae-2d65d9af2c46	interface	Interface	Problemas visuais e de layout	monitor	15	t	2026-08-24 21:30:49.12	2026-08-25 01:26:53.358	\N
7387e41b-e213-42ad-962a-75541d089001	desempenho	Desempenho	Problemas de velocidade e estabilidade	zap	16	t	2026-08-24 21:30:49.124	2026-08-25 01:26:53.362	\N
9e3c78cc-c16f-4734-8e42-d7b219b327f4	navegacao	Navegação	Problemas de navegação entre páginas	compass	17	t	2026-08-24 21:30:49.13	2026-08-25 01:26:53.369	\N
3c8df742-59b5-48dc-a49f-f86a862f4fcb	conta-cadastro	Conta e Cadastro	Problemas relacionados à criação e gerenciamento de conta	user	0	t	2026-08-24 21:30:49.027	2026-08-25 01:26:53.233	\N
b061fd3f-b743-4ebf-9123-8acbe7468584	login-seguranca	Login e Segurança	Problemas de autenticação e segurança da conta	lock	1	t	2026-08-24 21:30:49.044	2026-08-25 01:26:53.245	\N
a76b0bd4-a68e-43d6-a15e-93d38d62def9	pesquisa	Pesquisa	Problemas na busca de produtos, serviços e fornecedores	search	2	t	2026-08-24 21:30:49.05	2026-08-25 01:26:53.255	\N
2f7fd9e1-c219-47c2-bedd-f63f089f9ff7	carrinho	Carrinho	Problemas ao adicionar ou gerenciar itens no carrinho	cart	3	t	2026-08-24 21:30:49.055	2026-08-25 01:26:53.263	\N
b08b706d-b736-4f9d-930d-f30d1e1b0e3f	produtos	Produtos	Problemas relacionados ao catálogo de produtos	package	4	t	2026-08-24 21:30:49.061	2026-08-25 01:26:53.275	\N
e69775c7-fee2-435d-82b2-6a8461f7638f	frete	Frete	Problemas com cálculo e prazos de frete	truck	5	t	2026-08-24 21:30:49.066	2026-08-25 01:26:53.284	\N
a243a465-f510-4bb1-8fc5-b83272862f84	pagamento	Pagamento	Problemas relacionados a pagamentos e cobranças	card	6	t	2026-08-24 21:30:49.07	2026-08-25 01:26:53.292	\N
0c060841-f9cb-46e3-a3f7-7c15d52e27e5	pedido	Pedido	Problemas ao realizar ou gerenciar pedidos	bag	7	t	2026-08-24 21:30:49.076	2026-08-25 01:26:53.299	\N
3b89f82c-6642-44e1-8284-b4b1af047cf9	entrega	Entrega	Problemas com recebimento e entregas	package-check	8	t	2026-08-24 21:30:49.083	2026-08-25 01:26:53.306	\N
8327a222-b212-44f1-b691-c45d97d3f650	sistema	Sistema	Falhas gerais do sistema	cloud	18	t	2026-08-24 21:30:49.136	2026-08-25 01:26:53.375	\N
34936de6-1519-42de-9c0c-23103d2e5d76	uploads	Uploads	Problemas com envio de arquivos	upload	19	t	2026-08-24 21:30:49.141	2026-08-25 01:26:53.381	\N
d870d2a7-851c-4736-854d-109380e9f065	dashboard	Dashboard	Problemas com painéis e métricas	dashboard	20	t	2026-08-24 21:30:49.147	2026-08-25 01:26:53.386	\N
5f07abc0-e87f-4efb-8b91-afac7780f2ed	financeiro	Financeiro	Problemas com valores e movimentações financeiras	dollar	21	t	2026-08-24 21:30:49.153	2026-08-25 01:26:53.39	\N
c70e5890-e612-4b94-815d-446286d52c15	documentacao-fiscal	Documentação Fiscal	Problemas com documentos fiscais	file	22	t	2026-08-24 21:30:49.158	2026-08-25 01:26:53.396	\N
d6b5ff96-6c9c-451b-8afe-610423a43d0e	acessibilidade	Acessibilidade	Problemas de acessibilidade do sistema	accessibility	23	t	2026-08-24 21:30:49.164	2026-08-25 01:26:53.402	\N
1ca195c6-cd1f-4072-8abc-316a95f709d0	sugestao	Sugestão	Ideias e sugestões de melhoria	lightbulb	24	t	2026-08-24 21:30:49.168	2026-08-25 01:26:53.407	\N
390c129f-ad62-460b-b0e9-a8437aec9621	outro	Outro	Problemas não enquadrados nas demais categorias	help	25	t	2026-08-24 21:30:49.172	2026-08-25 01:26:53.41	\N
\.


--
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportTicket" (id, "userId", "categoryId", "typeId", title, description, status, "pageUrl", browser, os, device, "appVersion", "adminResponse", "respondedBy", "respondedAt", "resolvedAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: SupportTicketNote; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportTicketNote" (id, "ticketId", "adminId", note, "createdAt") FROM stdin;
\.


--
-- Data for Name: SupportTicketStatusHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportTicketStatusHistory" (id, "ticketId", status, "changedBy", note, "createdAt") FROM stdin;
\.


--
-- Data for Name: SupportType; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportType" (id, "categoryId", name, description, "order", active, "createdAt", "updatedAt") FROM stdin;
f3115af1-0a61-4976-abba-fb759eb62bfb	3c8df742-59b5-48dc-a49f-f86a862f4fcb	Conta bloqueada	Conta indisponível ou bloqueada	3	t	2026-08-24 21:30:49.041	2026-08-25 01:26:53.242
58084bf2-921a-4657-8ec1-3b5f36bca71f	3c8df742-59b5-48dc-a49f-f86a862f4fcb	Dados incorretos	Dados cadastrais divergentes	4	t	2026-08-24 21:30:49.042	2026-08-25 01:26:53.242
7beaf77e-d111-4d13-ae23-076171ff9dd4	3c8df742-59b5-48dc-a49f-f86a862f4fcb	Excluir conta	Solicitação de exclusão de conta	5	t	2026-08-24 21:30:49.043	2026-08-25 01:26:53.243
b3556f0b-d22e-44e5-8099-90a61f5a1368	3c8df742-59b5-48dc-a49f-f86a862f4fcb	Outro	Outro problema relacionado	6	t	2026-08-24 21:30:49.044	2026-08-25 01:26:53.244
eefdea6b-f20c-44f1-963a-5890f51729c3	b061fd3f-b743-4ebf-9123-8acbe7468584	Não consigo fazer login	Falha ao entrar no sistema	0	t	2026-08-24 21:30:49.045	2026-08-25 01:26:53.247
6658ffd5-f327-40ee-84a2-97421185e916	b061fd3f-b743-4ebf-9123-8acbe7468584	Senha incorreta	Senha não reconhecida	1	t	2026-08-24 21:30:49.046	2026-08-25 01:26:53.249
d77a8785-d135-4a50-9727-5a10de0de162	b061fd3f-b743-4ebf-9123-8acbe7468584	Erro ao redefinir senha	Problema no fluxo de recuperação de senha	2	t	2026-08-24 21:30:49.047	2026-08-25 01:26:53.25
e12f3686-24d7-4241-9aa0-0ae3e76e6952	b061fd3f-b743-4ebf-9123-8acbe7468584	Suspeita de acesso não autorizado	Possível invasão ou acesso indevido	3	t	2026-08-24 21:30:49.048	2026-08-25 01:26:53.251
f4c78d36-137a-41ba-bbb1-964ce3e62339	b061fd3f-b743-4ebf-9123-8acbe7468584	Verificação em duas etapas	Problema com autenticação de dois fatores	4	t	2026-08-24 21:30:49.048	2026-08-25 01:26:53.251
e998ef53-a352-4e37-af2a-f65d317127ec	b061fd3f-b743-4ebf-9123-8acbe7468584	Sessão expirada	Login encerrado inesperadamente	5	t	2026-08-24 21:30:49.049	2026-08-25 01:26:53.253
d328cee8-055e-47c9-911e-2d1512c712b4	b061fd3f-b743-4ebf-9123-8acbe7468584	Outro	Outro problema relacionado	6	t	2026-08-24 21:30:49.05	2026-08-25 01:26:53.254
03ff0ccb-5e25-45d5-81ae-76207e6c6463	a76b0bd4-a68e-43d6-a15e-93d38d62def9	Sem resultados	Busca não retorna resultados esperados	0	t	2026-08-24 21:30:49.051	2026-08-25 01:26:53.256
fb2d70a4-dc29-4e3c-af9c-bd007867f263	a76b0bd4-a68e-43d6-a15e-93d38d62def9	Resultados irrelevantes	Resultados não correspondem à pesquisa	1	t	2026-08-24 21:30:49.052	2026-08-25 01:26:53.257
3b8cc9e7-9834-4196-860a-1776df5481aa	a76b0bd4-a68e-43d6-a15e-93d38d62def9	Filtros não funcionam	Filtros de busca apresentam falhas	2	t	2026-08-24 21:30:49.052	2026-08-25 01:26:53.257
23cb560e-f5d4-473d-8abc-7987aedb3361	a76b0bd4-a68e-43d6-a15e-93d38d62def9	Busca lenta	Pesquisa demorando para carregar	3	t	2026-08-24 21:30:49.053	2026-08-25 01:26:53.258
2076f96d-4582-4e63-9df5-1e134c854ce0	a76b0bd4-a68e-43d6-a15e-93d38d62def9	Ordenação incorreta	Resultados fora da ordem selecionada	4	t	2026-08-24 21:30:49.054	2026-08-25 01:26:53.26
72c2044e-cb6c-4b70-965a-969390ecec12	a76b0bd4-a68e-43d6-a15e-93d38d62def9	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.054	2026-08-25 01:26:53.262
f8349e4e-bf0c-4999-bb7b-7951f6775bfb	2f7fd9e1-c219-47c2-bedd-f63f089f9ff7	Produto não adiciona	Falha ao adicionar produto ao carrinho	0	t	2026-08-24 21:30:49.056	2026-08-25 01:26:53.264
f9a02368-bc3c-49f5-90a7-7a187cfe0855	2f7fd9e1-c219-47c2-bedd-f63f089f9ff7	Produto desapareceu	Item sumiu do carrinho	1	t	2026-08-24 21:30:49.057	2026-08-25 01:26:53.265
081f92b2-d0f0-4910-9f9f-7a0c374c1aa5	2f7fd9e1-c219-47c2-bedd-f63f089f9ff7	Carrinho vazio	Carrinho esvaziado indevidamente	2	t	2026-08-24 21:30:49.058	2026-08-25 01:26:53.268
a048494c-e157-4b51-9486-c6d347ca5161	2f7fd9e1-c219-47c2-bedd-f63f089f9ff7	Quantidade incorreta	Quantidade dos itens incorreta	3	t	2026-08-24 21:30:49.058	2026-08-25 01:26:53.27
76261b82-831c-400c-921e-34c9fada8bc4	2f7fd9e1-c219-47c2-bedd-f63f089f9ff7	Cupom inválido	Cupom não aplicado corretamente	4	t	2026-08-24 21:30:49.059	2026-08-25 01:26:53.271
1852e93d-24e1-4b75-9cd2-b033b11d4cc5	2f7fd9e1-c219-47c2-bedd-f63f089f9ff7	Frete incorreto	Valor do frete divergente	5	t	2026-08-24 21:30:49.059	2026-08-25 01:26:53.272
1fbc5039-41ed-4ac9-95d6-f0cab8c763a9	2f7fd9e1-c219-47c2-bedd-f63f089f9ff7	Outro	Outro problema relacionado	6	t	2026-08-24 21:30:49.06	2026-08-25 01:26:53.274
148bf91b-fa52-4b68-a6b7-22cfeb2681aa	b08b706d-b736-4f9d-930d-f30d1e1b0e3f	Produto não encontrado	Produto não localizado no site	0	t	2026-08-24 21:30:49.061	2026-08-25 01:26:53.276
45af5d33-6dc4-470e-811e-df8d6a28fe32	b08b706d-b736-4f9d-930d-f30d1e1b0e3f	Informações incorretas	Dados do produto divergentes	1	t	2026-08-24 21:30:49.062	2026-08-25 01:26:53.277
f8f588d2-8d25-4474-bd46-13f46d1cf8de	b08b706d-b736-4f9d-930d-f30d1e1b0e3f	Imagens não carregam	Fotos do produto indisponíveis	2	t	2026-08-24 21:30:49.063	2026-08-25 01:26:53.278
7e8dee1b-6947-42f3-a23f-a45b2fea6946	b08b706d-b736-4f9d-930d-f30d1e1b0e3f	Preço errado	Preço exibido incorretamente	3	t	2026-08-24 21:30:49.063	2026-08-25 01:26:53.279
d6714590-d50d-4b88-a745-5ba9f6e32628	b08b706d-b736-4f9d-930d-f30d1e1b0e3f	Produto sem estoque	Estoque não atualizado	4	t	2026-08-24 21:30:49.064	2026-08-25 01:26:53.281
9dae545b-59ab-49df-9232-297cbea89bb2	b08b706d-b736-4f9d-930d-f30d1e1b0e3f	Descrição incompleta	Descrição insuficiente do produto	5	t	2026-08-24 21:30:49.065	2026-08-25 01:26:53.282
b8a51068-0d92-4cfb-94c4-212b6730364e	b08b706d-b736-4f9d-930d-f30d1e1b0e3f	Outro	Outro problema relacionado	6	t	2026-08-24 21:30:49.066	2026-08-25 01:26:53.283
e11e066f-8e0b-4ab8-aa79-64450ed8ac13	e69775c7-fee2-435d-82b2-6a8461f7638f	Cálculo de frete errado	Valor do frete calculado incorretamente	0	t	2026-08-24 21:30:49.067	2026-08-25 01:26:53.285
d92b2cf2-ea02-4727-bd56-d70225c257bd	e69775c7-fee2-435d-82b2-6a8461f7638f	Prazo de entrega incorreto	Prazo estimado divergente	1	t	2026-08-24 21:30:49.067	2026-08-25 01:26:53.286
a3298574-11a2-4db6-a00e-d7b5b494be14	e69775c7-fee2-435d-82b2-6a8461f7638f	Frete indisponível	Opção de frete não disponível	2	t	2026-08-24 21:30:49.068	2026-08-25 01:26:53.288
687b3ece-9d77-4da4-a82c-fa53d73110b3	e69775c7-fee2-435d-82b2-6a8461f7638f	Código de rastreio inválido	Rastreio não localizado	3	t	2026-08-24 21:30:49.068	2026-08-25 01:26:53.29
5b58ab79-15f1-4609-9835-0bdf1784ee6d	e69775c7-fee2-435d-82b2-6a8461f7638f	Região não atendida	Entrega não disponível na região	4	t	2026-08-24 21:30:49.069	2026-08-25 01:26:53.291
c96c277b-4838-41f6-a32e-203cde82d574	e69775c7-fee2-435d-82b2-6a8461f7638f	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.07	2026-08-25 01:26:53.291
2d018091-581b-49b6-90b4-805d69075272	a243a465-f510-4bb1-8fc5-b83272862f84	PIX não confirmado	Pagamento via PIX não confirmado	0	t	2026-08-24 21:30:49.071	2026-08-25 01:26:53.293
48430a0c-bc97-4697-9116-57367d878043	a243a465-f510-4bb1-8fc5-b83272862f84	Cartão recusado	Cartão não aceito no pagamento	1	t	2026-08-24 21:30:49.072	2026-08-25 01:26:53.294
c14937d7-b206-4a34-b7ba-a7977759229a	a243a465-f510-4bb1-8fc5-b83272862f84	Cobrança duplicada	Cobrança realizada mais de uma vez	2	t	2026-08-24 21:30:49.072	2026-08-25 01:26:53.296
85b4739a-5ceb-41de-9126-c42c3695ff3f	a243a465-f510-4bb1-8fc5-b83272862f84	Pagamento pendente	Pagamento travado em pendente	3	t	2026-08-24 21:30:49.073	2026-08-25 01:26:53.296
b57d0f38-5cbd-4f69-8fba-e40ae35752a5	a243a465-f510-4bb1-8fc5-b83272862f84	Estorno não recebido	Estorno não creditado	4	t	2026-08-24 21:30:49.073	2026-08-25 01:26:53.297
89879e03-2a5b-481d-a02e-765f10d51511	3c8df742-59b5-48dc-a49f-f86a862f4fcb	Não consigo alterar meus dados	Erro ao editar informações do perfil	2	t	2026-08-24 21:30:49.04	2026-08-25 01:26:53.241
ffcb23ce-f652-408b-a362-e61af8aceee6	0c060841-f9cb-46e3-a3f7-7c15d52e27e5	Pedido sumiu	Pedido não encontrado no histórico	1	t	2026-08-24 21:30:49.078	2026-08-25 01:26:53.3
49ba16ed-9d20-493d-8932-209d1faa9d81	0c060841-f9cb-46e3-a3f7-7c15d52e27e5	Erro na finalização	Erro ao confirmar a compra	2	t	2026-08-24 21:30:49.079	2026-08-25 01:26:53.302
d8e85fb0-6526-4ce1-a3a7-feb99daa1028	0c060841-f9cb-46e3-a3f7-7c15d52e27e5	Pedido cancelado indevidamente	Cancelamento sem solicitação	3	t	2026-08-24 21:30:49.08	2026-08-25 01:26:53.303
f1de8553-6b8a-4fc0-8674-07a05e77d128	0c060841-f9cb-46e3-a3f7-7c15d52e27e5	Cupom não aplicado	Desconto não aplicado no pedido	4	t	2026-08-24 21:30:49.08	2026-08-25 01:26:53.303
590b82b9-0c93-4af2-8b07-ff1cc19ac776	0c060841-f9cb-46e3-a3f7-7c15d52e27e5	Desconto incorreto	Valor de desconto divergente	5	t	2026-08-24 21:30:49.081	2026-08-25 01:26:53.305
11d1fc8c-b396-480f-8d98-45e6202bd2fa	0c060841-f9cb-46e3-a3f7-7c15d52e27e5	Outro	Outro problema relacionado	6	t	2026-08-24 21:30:49.082	2026-08-25 01:26:53.305
2dd6009d-6f56-4bf8-8d4b-5a8da21682b0	3b89f82c-6642-44e1-8284-b4b1af047cf9	Atraso na entrega	Entrega fora do prazo estimado	0	t	2026-08-24 21:30:49.083	2026-08-25 01:26:53.307
feda8eb4-783f-4dc6-89e4-1264d1f3b92b	3b89f82c-6642-44e1-8284-b4b1af047cf9	Endereço errado	Endereço de entrega incorreto	1	t	2026-08-24 21:30:49.084	2026-08-25 01:26:53.308
5c8e92b3-4ca9-4852-98a0-1813eb9f65ce	3b89f82c-6642-44e1-8284-b4b1af047cf9	Não recebi meu pedido	Pedido não entregue	2	t	2026-08-24 21:30:49.084	2026-08-25 01:26:53.309
32d3e7af-4823-4f6b-b7d6-18a80c569f63	3b89f82c-6642-44e1-8284-b4b1af047cf9	Produto danificado	Produto chegou danificado	3	t	2026-08-24 21:30:49.085	2026-08-25 01:26:53.31
d3e06939-2125-4841-9def-21ba070d524e	3b89f82c-6642-44e1-8284-b4b1af047cf9	Pedido devolvido	Pedido retornou ao remetente	4	t	2026-08-24 21:30:49.086	2026-08-25 01:26:53.311
48c72d48-f20a-40da-a6c7-6d0b0add900d	3b89f82c-6642-44e1-8284-b4b1af047cf9	Assinatura incorreta	Recebimento confirmado por terceiro	5	t	2026-08-24 21:30:49.086	2026-08-25 01:26:53.312
792b8ec1-b66a-46e2-9c54-14510fcfb35f	3b89f82c-6642-44e1-8284-b4b1af047cf9	Outro	Outro problema relacionado	6	t	2026-08-24 21:30:49.087	2026-08-25 01:26:53.312
773bdb7f-9bd1-43f7-9b4e-9614c353e11e	dc8a7af8-5928-4f2f-afec-f05d9b873d8f	Perfil não carrega	Página do fornecedor indisponível	0	t	2026-08-24 21:30:49.088	2026-08-25 01:26:53.314
0ed9bf6c-f8e5-40a1-b812-a3881919d99a	dc8a7af8-5928-4f2f-afec-f05d9b873d8f	Produtos não aparecem	Catálogo do fornecedor vazio	1	t	2026-08-24 21:30:49.089	2026-08-25 01:26:53.315
7a155c48-69db-4dae-b03b-0e865fb9e2c0	dc8a7af8-5928-4f2f-afec-f05d9b873d8f	Chat indisponível	Não é possível contatar o fornecedor	2	t	2026-08-24 21:30:49.09	2026-08-25 01:26:53.316
ff871e13-d833-4729-a6cf-a03596320fb8	dc8a7af8-5928-4f2f-afec-f05d9b873d8f	Informações erradas	Dados do fornecedor divergentes	3	t	2026-08-24 21:30:49.09	2026-08-25 01:26:53.317
4bf0d317-c4bd-4437-9db3-09cba6a36505	dc8a7af8-5928-4f2f-afec-f05d9b873d8f	Avaliação não publicada	Avaliação não aparece no perfil	4	t	2026-08-24 21:30:49.091	2026-08-25 01:26:53.318
8b79b704-b5a4-4f69-869b-a3851fe901f9	dc8a7af8-5928-4f2f-afec-f05d9b873d8f	Cadastro pendente	Cadastro de fornecedor sem retorno	5	t	2026-08-24 21:30:49.091	2026-08-25 01:26:53.318
904e325d-6a4b-46ee-ac06-44cbeb786479	dc8a7af8-5928-4f2f-afec-f05d9b873d8f	Outro	Outro problema relacionado	6	t	2026-08-24 21:30:49.092	2026-08-25 01:26:53.319
20105e76-5443-442c-be15-d00ed1184cad	74ecfce2-9499-4376-85ec-9c8543d19b66	Mensagem não envia	Falha ao enviar mensagem	0	t	2026-08-24 21:30:49.094	2026-08-25 01:26:53.321
60976006-4b73-41a2-bbd2-c4e77e35c7c6	74ecfce2-9499-4376-85ec-9c8543d19b66	Chat não carrega	Conversa não abre	1	t	2026-08-24 21:30:49.095	2026-08-25 01:26:53.322
2e47f7a8-2013-4b00-9664-396ebb0bbd5d	74ecfce2-9499-4376-85ec-9c8543d19b66	Mensagem duplicada	Mensagem enviada mais de uma vez	3	t	2026-08-24 21:30:49.096	2026-08-25 01:26:53.324
e34cafe6-b8c4-4070-9e67-f23d5a2821ca	74ecfce2-9499-4376-85ec-9c8543d19b66	Não consigo iniciar conversa	Falha ao abrir novo chat	4	t	2026-08-24 21:30:49.096	2026-08-25 01:26:53.324
2c2e9b51-575f-490f-a379-66ec0f924c8f	74ecfce2-9499-4376-85ec-9c8543d19b66	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.097	2026-08-25 01:26:53.325
9fabea40-0bfb-47d1-9e2b-94a5b7eca5b0	ab7a337a-e042-4488-be96-28bfe3f9c78d	Não consigo avaliar	Falha ao enviar avaliação	0	t	2026-08-24 21:30:49.098	2026-08-25 01:26:53.326
0860fbb5-edd5-4cdd-b31a-5a4539838b9c	ab7a337a-e042-4488-be96-28bfe3f9c78d	Avaliação não publica	Avaliação não aparece	1	t	2026-08-24 21:30:49.098	2026-08-25 01:26:53.327
30bfee45-b42c-4393-89bd-5d8467189592	ab7a337a-e042-4488-be96-28bfe3f9c78d	Editar avaliação	Não consigo editar minha avaliação	2	t	2026-08-24 21:30:49.099	2026-08-25 01:26:53.327
ce9eab36-14c9-4df0-8685-9eca8c5b98c0	ab7a337a-e042-4488-be96-28bfe3f9c78d	Avaliação sumiu	Avaliação removida do perfil	3	t	2026-08-24 21:30:49.099	2026-08-25 01:26:53.328
04fe4832-f021-4dfe-9692-89a1afb775e0	ab7a337a-e042-4488-be96-28bfe3f9c78d	Comentário inapropriado	Denunciar conteúdo inadequado	4	t	2026-08-24 21:30:49.1	2026-08-25 01:26:53.329
45fcbe1b-9ce9-4290-8761-727e50b03d06	ab7a337a-e042-4488-be96-28bfe3f9c78d	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.1	2026-08-25 01:26:53.33
428de427-57c6-4026-aa7f-db95d4cceff7	3d06a430-6c59-4023-9d8e-62bfdb5ce603	Não consigo favoritar	Falha ao salvar favorito	0	t	2026-08-24 21:30:49.101	2026-08-25 01:26:53.331
e488b965-8a92-4ef1-98a7-d528c0e46e02	3d06a430-6c59-4023-9d8e-62bfdb5ce603	Favorito sumiu	Item removido da lista	1	t	2026-08-24 21:30:49.102	2026-08-25 01:26:53.332
eac3e8d4-7e04-45f4-b583-6cf0e5960760	3d06a430-6c59-4023-9d8e-62bfdb5ce603	Lista não carrega	Lista de favoritos indisponível	2	t	2026-08-24 21:30:49.103	2026-08-25 01:26:53.333
0d42a082-1e7e-4af3-95af-f65638cfe19a	3d06a430-6c59-4023-9d8e-62bfdb5ce603	Sincronização	Favoritos não sincronizam entre dispositivos	3	t	2026-08-24 21:30:49.111	2026-08-25 01:26:53.333
29a25df3-afed-42df-8533-a7847dc015e7	3d06a430-6c59-4023-9d8e-62bfdb5ce603	Limite de favoritos	Erro ao atingir limite	4	t	2026-08-24 21:30:49.112	2026-08-25 01:26:53.334
6bf65778-bad0-41d4-80b4-2473545016a7	3d06a430-6c59-4023-9d8e-62bfdb5ce603	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.113	2026-08-25 01:26:53.344
acee07b2-55e1-4ea5-b2fd-9708fcd04957	0d012b7e-d2fe-4907-952e-63dd7d4f400d	Não recebo notificações	Notificações não chegam	0	t	2026-08-24 21:30:49.114	2026-08-25 01:26:53.346
cc414cb7-81cf-4b43-ab63-f8c4fc8a1860	0d012b7e-d2fe-4907-952e-63dd7d4f400d	Recebo notificações demais	Volume excessivo de notificações	1	t	2026-08-24 21:30:49.114	2026-08-25 01:26:53.347
57995648-f739-463c-aab9-ab86646d2e8c	0d012b7e-d2fe-4907-952e-63dd7d4f400d	Notificação com erro	Notificação com conteúdo incorreto	2	t	2026-08-24 21:30:49.115	2026-08-25 01:26:53.348
5f311450-95f2-4b41-9a14-a0ac6514129d	0d012b7e-d2fe-4907-952e-63dd7d4f400d	Não consigo configurar	Configurações de notificação não salvam	3	t	2026-08-24 21:30:49.116	2026-08-25 01:26:53.348
7fa1f9fd-7b67-4541-bb67-04955d56fabf	0d012b7e-d2fe-4907-952e-63dd7d4f400d	Marcar como lida não funciona	Leitura não é registrada	4	t	2026-08-24 21:30:49.116	2026-08-25 01:26:53.349
e13d18ed-410d-4329-bbb5-7fc0a2969eb4	0c060841-f9cb-46e3-a3f7-7c15d52e27e5	Não consigo realizar pedido	Falha na finalização do pedido	0	t	2026-08-24 21:30:49.077	2026-08-25 01:26:53.3
302cc640-3b8a-4119-8ecb-f4df41ccab54	8fef2ec7-3f8a-4977-bf74-d3ef54f93c5a	Promoção não aparece	Oferta não encontrada	1	t	2026-08-24 21:30:49.118	2026-08-25 01:26:53.354
f522cc46-eaff-482f-a119-b1a7ae21adfa	8fef2ec7-3f8a-4977-bf74-d3ef54f93c5a	Desconto não aplicado	Desconto não aplicado na compra	2	t	2026-08-24 21:30:49.119	2026-08-25 01:26:53.354
8bc799b4-8393-4a95-9ad9-6dd0cc6b11a0	8fef2ec7-3f8a-4977-bf74-d3ef54f93c5a	Condições confusas	Regras da promoção pouco claras	3	t	2026-08-24 21:30:49.119	2026-08-25 01:26:53.355
a5d8026b-66d0-4769-aa09-95a7a88d500a	8fef2ec7-3f8a-4977-bf74-d3ef54f93c5a	Promoção encerrada prematuramente	Promoção finalizada antes do prazo	4	t	2026-08-24 21:30:49.12	2026-08-25 01:26:53.356
f0b8ab6b-bb7b-41bc-a6f2-62fdc1451954	8fef2ec7-3f8a-4977-bf74-d3ef54f93c5a	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.12	2026-08-25 01:26:53.357
6a523d2b-1bdd-4221-bd28-151e4fa96472	e2aad57d-2d5b-4d3a-a6ae-2d65d9af2c46	Layout quebrado	Layout exibido incorretamente	0	t	2026-08-24 21:30:49.121	2026-08-25 01:26:53.359
0ea35afa-f6c3-40cc-a628-416ab98b7175	e2aad57d-2d5b-4d3a-a6ae-2d65d9af2c46	Elementos sobrepostos	Elementos se sobrepõem na tela	1	t	2026-08-24 21:30:49.121	2026-08-25 01:26:53.36
4cd9154f-d57d-4949-aed1-2a11a76f00f9	e2aad57d-2d5b-4d3a-a6ae-2d65d9af2c46	Fonte ilegível	Texto difícil de ler	2	t	2026-08-24 21:30:49.122	2026-08-25 01:26:53.36
5aff6fe5-d6a0-4d79-8b7d-5cfb7dc2c5d7	e2aad57d-2d5b-4d3a-a6ae-2d65d9af2c46	Cores confusas	Contraste ou cores inadequados	3	t	2026-08-24 21:30:49.122	2026-08-25 01:26:53.361
f0e2ca5f-1fc0-4b66-9347-4c8c46d7a486	e2aad57d-2d5b-4d3a-a6ae-2d65d9af2c46	Botões não funcionam	Botões sem ação ao clicar	4	t	2026-08-24 21:30:49.123	2026-08-25 01:26:53.361
22acff3e-9ce9-4739-a048-625276730228	e2aad57d-2d5b-4d3a-a6ae-2d65d9af2c46	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.123	2026-08-25 01:26:53.362
07e5ef6c-3528-4518-93b5-d81f25b8db26	7387e41b-e213-42ad-962a-75541d089001	Site lento	Carregamento demorado	0	t	2026-08-24 21:30:49.124	2026-08-25 01:26:53.363
748abef9-67b9-4d57-9c0a-0fd3ab4a7102	7387e41b-e213-42ad-962a-75541d089001	Página não carrega	Página fica em branco	1	t	2026-08-24 21:30:49.125	2026-08-25 01:26:53.365
bcf3c16e-10b7-41e6-a174-51bd108e2cc1	7387e41b-e213-42ad-962a-75541d089001	Erro 500	Erro interno do servidor	2	t	2026-08-24 21:30:49.126	2026-08-25 01:26:53.366
1d1adfb5-a123-47ec-b227-b4320516b8eb	7387e41b-e213-42ad-962a-75541d089001	Travamentos	Congelamento durante o uso	3	t	2026-08-24 21:30:49.127	2026-08-25 01:26:53.367
d5e1b22b-b2bc-49d1-9911-e8fddb94965f	7387e41b-e213-42ad-962a-75541d089001	Demora no upload	Upload de arquivos lento	4	t	2026-08-24 21:30:49.128	2026-08-25 01:26:53.367
3b9aa940-c965-418b-98a4-b322a953c555	7387e41b-e213-42ad-962a-75541d089001	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.129	2026-08-25 01:26:53.368
8ecc3b4a-9362-421f-8c24-02394afe43cc	9e3c78cc-c16f-4734-8e42-d7b219b327f4	Link quebrado	Link não leva ao destino	0	t	2026-08-24 21:30:49.131	2026-08-25 01:26:53.369
87130bba-dd93-492a-b673-9feab4722745	9e3c78cc-c16f-4734-8e42-d7b219b327f4	Página não encontrada	Erro 404 em página esperada	1	t	2026-08-24 21:30:49.132	2026-08-25 01:26:53.371
7ac22e42-d210-4f24-901d-b96982ca987e	9e3c78cc-c16f-4734-8e42-d7b219b327f4	Menu não funciona	Menu de navegação com falhas	2	t	2026-08-24 21:30:49.132	2026-08-25 01:26:53.372
d607bd4e-ed8b-47f3-a65f-b6a18e5ddc8a	9e3c78cc-c16f-4734-8e42-d7b219b327f4	Voltar não funciona	Botão voltar do navegador inoperante	3	t	2026-08-24 21:30:49.133	2026-08-25 01:26:53.373
3a6748f7-6e0e-42d3-af59-9cb2d1188c17	9e3c78cc-c16f-4734-8e42-d7b219b327f4	Página errada	Redirecionamento para página incorreta	4	t	2026-08-24 21:30:49.134	2026-08-25 01:26:53.373
7a08d981-d3e8-41e1-a4ae-19807648ef92	9e3c78cc-c16f-4734-8e42-d7b219b327f4	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.135	2026-08-25 01:26:53.374
52d39a75-9db2-4755-8258-c4a39e5134a7	8327a222-b212-44f1-b691-c45d97d3f650	Erro de servidor	Erro inesperado no servidor	0	t	2026-08-24 21:30:49.137	2026-08-25 01:26:53.375
ec5eadea-68e4-4eac-a864-2d4c53c2242b	8327a222-b212-44f1-b691-c45d97d3f650	Aplicativo indisponível	Serviço fora do ar	1	t	2026-08-24 21:30:49.138	2026-08-25 01:26:53.376
48d8913e-01c5-4589-a4ef-00b6c14c8d86	8327a222-b212-44f1-b691-c45d97d3f650	Erro inesperado	Falha sem causa identificada	2	t	2026-08-24 21:30:49.139	2026-08-25 01:26:53.376
eae7da98-99e6-4107-b31a-7961e657a17d	8327a222-b212-44f1-b691-c45d97d3f650	Manutenção	Sistema em manutenção sem aviso	3	t	2026-08-24 21:30:49.139	2026-08-25 01:26:53.377
1bd2ac0a-b43c-4cb1-a255-1346a62bc0b9	8327a222-b212-44f1-b691-c45d97d3f650	Bug geral	Comportamento incorreto geral	4	t	2026-08-24 21:30:49.14	2026-08-25 01:26:53.379
c922196d-adfd-49c1-82c6-8ef063e59e60	8327a222-b212-44f1-b691-c45d97d3f650	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.141	2026-08-25 01:26:53.38
de5e77cd-2789-41c5-8fb6-ce126d9a6638	34936de6-1519-42de-9c0c-23103d2e5d76	Upload falha	Arquivo não enviado	0	t	2026-08-24 21:30:49.142	2026-08-25 01:26:53.381
9d12e7d0-83c1-487d-9ba8-0de695151e6f	34936de6-1519-42de-9c0c-23103d2e5d76	Arquivo não aceito	Formato ou tamanho não aceito	1	t	2026-08-24 21:30:49.143	2026-08-25 01:26:53.382
22465c76-4a8d-4a85-87b1-4d56d4b22346	34936de6-1519-42de-9c0c-23103d2e5d76	Upload demorado	Envio de arquivo muito lento	2	t	2026-08-24 21:30:49.144	2026-08-25 01:26:53.382
50a9d2bf-e0e4-4e26-a7a2-c7dab8831695	34936de6-1519-42de-9c0c-23103d2e5d76	Arquivo corrompido	Arquivo chega corrompido	3	t	2026-08-24 21:30:49.144	2026-08-25 01:26:53.383
c0e0326e-b6df-49c1-abac-c96b9c7c6a6b	34936de6-1519-42de-9c0c-23103d2e5d76	Formato inválido	Extensão não suportada	4	t	2026-08-24 21:30:49.145	2026-08-25 01:26:53.383
11f7abbe-7eee-4500-a1d2-77f30148fd36	34936de6-1519-42de-9c0c-23103d2e5d76	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.146	2026-08-25 01:26:53.384
70acfb22-62f8-4915-a361-1a27e8778da4	d870d2a7-851c-4736-854d-109380e9f065	Gráfico não carrega	Gráficos indisponíveis	1	t	2026-08-24 21:30:49.148	2026-08-25 01:26:53.388
ecbcd47a-a9d0-4207-b992-ab43f0727964	d870d2a7-851c-4736-854d-109380e9f065	Dados desatualizados	Informações não atualizam	2	t	2026-08-24 21:30:49.149	2026-08-25 01:26:53.388
79af2918-d6bc-4f15-bc36-82fbbab85201	d870d2a7-851c-4736-854d-109380e9f065	Dashboard vazio	Painel sem dados	3	t	2026-08-24 21:30:49.15	2026-08-25 01:26:53.389
2c54877c-b69b-4a16-a2fc-6f9bbff69857	d870d2a7-851c-4736-854d-109380e9f065	Exportação falha	Erro ao exportar relatório	4	t	2026-08-24 21:30:49.151	2026-08-25 01:26:53.389
de3513a4-435c-419c-ace0-23e1e34cc577	d870d2a7-851c-4736-854d-109380e9f065	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.152	2026-08-25 01:26:53.39
138c66d4-4ef9-4208-9804-9575745a39eb	5f07abc0-e87f-4efb-8b91-afac7780f2ed	Saldo incorreto	Saldo divergente do esperado	0	t	2026-08-24 21:30:49.154	2026-08-25 01:26:53.391
35633850-a9b0-402c-8f63-daba94929e16	5f07abc0-e87f-4efb-8b91-afac7780f2ed	Extrato errado	Movimentações incorretas	1	t	2026-08-24 21:30:49.154	2026-08-25 01:26:53.392
33aec172-347b-4f6f-a276-ab89b1dbc1f0	5f07abc0-e87f-4efb-8b91-afac7780f2ed	Comissão não paga	Pagamento de comissão pendente	2	t	2026-08-24 21:30:49.155	2026-08-25 01:26:53.393
7250502d-ef48-484f-953e-f57ed33ff246	8fef2ec7-3f8a-4977-bf74-d3ef54f93c5a	Cupom não funciona	Cupom de desconto inválido	0	t	2026-08-24 21:30:49.118	2026-08-25 01:26:53.353
d7621614-44d6-45df-8463-db652107f6ae	c70e5890-e612-4b94-815d-446286d52c15	XML inválido	Arquivo XML não aceito	4	t	2026-08-24 21:30:49.162	2026-08-25 01:26:53.4
faa17b08-9939-4d53-a9f5-83d86da2b7bc	c70e5890-e612-4b94-815d-446286d52c15	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.163	2026-08-25 01:26:53.401
72ba332d-b705-4b8f-b54d-57ebc9747248	d6b5ff96-6c9c-451b-8afe-610423a43d0e	Contraste inadequado	Cores com baixo contraste	0	t	2026-08-24 21:30:49.164	2026-08-25 01:26:53.403
8ba061d4-4fef-4ea6-b9f0-61d0b85eb81d	d6b5ff96-6c9c-451b-8afe-610423a43d0e	Sem legenda	Conteúdo sem descrição alternativa	1	t	2026-08-24 21:30:49.165	2026-08-25 01:26:53.403
185edbb3-6b87-49ed-87dd-8b414eedad51	d6b5ff96-6c9c-451b-8afe-610423a43d0e	Leitor de tela	Incompatibilidade com leitor de tela	2	t	2026-08-24 21:30:49.166	2026-08-25 01:26:53.404
50180e05-3b6e-4662-9dc3-3de5253273d8	d6b5ff96-6c9c-451b-8afe-610423a43d0e	Tamanho de fonte	Fonte sem opção de ajuste	3	t	2026-08-24 21:30:49.166	2026-08-25 01:26:53.404
f6a1f524-a6e7-4926-a6f3-7a3c3231c77b	d6b5ff96-6c9c-451b-8afe-610423a43d0e	Navegação por teclado	Falha na navegação via teclado	4	t	2026-08-24 21:30:49.167	2026-08-25 01:26:53.405
3ca81d25-4a33-459e-abd8-fb1bca2e3c1a	3c8df742-59b5-48dc-a49f-f86a862f4fcb	Erro ao cadastrar	Falha ao tentar criar uma conta	0	t	2026-08-24 21:30:49.035	2026-08-25 01:26:53.236
d51d3be1-aaa7-4101-8d36-7ccab5b0f660	3c8df742-59b5-48dc-a49f-f86a862f4fcb	Não recebi e-mail de confirmação	E-mail de verificação não chega	1	t	2026-08-24 21:30:49.039	2026-08-25 01:26:53.239
9988e8be-4030-4b81-bdad-f9b646eb7bc2	a243a465-f510-4bb1-8fc5-b83272862f84	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.074	2026-08-25 01:26:53.298
5a7490f1-5903-4b96-b439-3aacdf2693c7	74ecfce2-9499-4376-85ec-9c8543d19b66	Notificações de chat	Sem notificação de novas mensagens	2	t	2026-08-24 21:30:49.095	2026-08-25 01:26:53.323
f7b5d523-89a9-4fe9-bd8a-0ade0c61fa2c	0d012b7e-d2fe-4907-952e-63dd7d4f400d	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.116	2026-08-25 01:26:53.351
0bbdf4df-7bc3-4ec7-8c77-e7da1e7a9c42	d870d2a7-851c-4736-854d-109380e9f065	Métricas erradas	Números divergentes do esperado	0	t	2026-08-24 21:30:49.147	2026-08-25 01:26:53.387
c02182ba-3f6c-4fc4-9376-b6810a4bacdb	5f07abc0-e87f-4efb-8b91-afac7780f2ed	Nota fiscal	Emissão de nota fiscal	3	t	2026-08-24 21:30:49.156	2026-08-25 01:26:53.394
115726d9-cfd9-407d-b971-120062f2f865	5f07abc0-e87f-4efb-8b91-afac7780f2ed	Conciliação	Divergência entre valores	4	t	2026-08-24 21:30:49.157	2026-08-25 01:26:53.395
47e0aac3-cd99-4059-be64-d26f1b8004c2	5f07abc0-e87f-4efb-8b91-afac7780f2ed	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.157	2026-08-25 01:26:53.395
b212e131-c23b-4521-a366-6f0930b4aaac	c70e5890-e612-4b94-815d-446286d52c15	Nota fiscal não emite	Falha na emissão da NF	0	t	2026-08-24 21:30:49.159	2026-08-25 01:26:53.396
3d4085d3-0a96-4f30-a251-1bf67a478369	c70e5890-e612-4b94-815d-446286d52c15	Nota fiscal com erro	NF emitida com dados incorretos	1	t	2026-08-24 21:30:49.16	2026-08-25 01:26:53.397
eb24f97c-9594-46a4-be82-9b36eec335f8	c70e5890-e612-4b94-815d-446286d52c15	CFOP incorreto	CFOP divergente do produto	2	t	2026-08-24 21:30:49.161	2026-08-25 01:26:53.398
5f7ffd48-dc81-49a1-8033-32a40b051646	c70e5890-e612-4b94-815d-446286d52c15	Impostos errados	Valores de impostos incorretos	3	t	2026-08-24 21:30:49.162	2026-08-25 01:26:53.399
05414dca-efa0-4d0e-88a0-8932a23bfe83	d6b5ff96-6c9c-451b-8afe-610423a43d0e	Outro	Outro problema relacionado	5	t	2026-08-24 21:30:49.167	2026-08-25 01:26:53.406
dbbae74a-9a7e-42ac-8f77-12657fc7595b	1ca195c6-cd1f-4072-8abc-316a95f709d0	Nova funcionalidade	Sugestão de recurso inédito	0	t	2026-08-24 21:30:49.169	2026-08-25 01:26:53.408
b06e07bc-f036-42d0-b71c-c38182dd41ec	1ca195c6-cd1f-4072-8abc-316a95f709d0	Melhoria existente	Aperfeiçoamento de recurso atual	1	t	2026-08-24 21:30:49.17	2026-08-25 01:26:53.409
315066df-781f-48b4-8148-cf9e90e1c495	1ca195c6-cd1f-4072-8abc-316a95f709d0	Mudança de layout	Proposta de alteração visual	2	t	2026-08-24 21:30:49.17	2026-08-25 01:26:53.409
f8f24566-114d-4714-9335-6e3afaa0f5e0	1ca195c6-cd1f-4072-8abc-316a95f709d0	Outro	Outra sugestão	3	t	2026-08-24 21:30:49.171	2026-08-25 01:26:53.41
b2ab87a2-b51e-4bb8-b58c-5e0bbc3f19c9	390c129f-ad62-460b-b0e9-a8437aec9621	Outro	Problema não listado	0	t	2026-08-24 21:30:49.173	2026-08-25 01:26:53.411
\.


--
-- Data for Name: SystemConfig; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemConfig" (id, key, value, description, "updatedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSetting" (key, value, "updatedAt", "updatedBy") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, document, phone, "avatarUrl", role, active, verified, "emailConfirmationToken", "resetPasswordToken", "resetPasswordExpires", "twoFactorEnabled", "twoFactorSecret", "lastLoginAt", "createdAt", "updatedAt", "deletedAt", "emailConfirmationExpires") FROM stdin;
73e05d53-965d-4605-91c8-20abadda6626	cliente@teste.com	$2b$12$MfHN.H40wHyTWTrBaSqa6OTHVkFuu.ocJ2Lxi4THwjvTGnd5eI5GS	cliente_teste	12.131.231/2424-21	(12) 12121-2121	\N	CUSTOMER	t	f	\N	\N	\N	f	\N	\N	2026-08-24 21:43:32.036	2026-08-24 21:43:32.036	\N	\N
a7b62382-7810-442b-a7c2-864c58f947ea	fornecedor@teste.com	$2b$12$CbSp.utBd9y.3JJfQPICA.4uAOnEjiN7Rk8Vjn2Lvgyn28W7Pvf.y	fornecedorTeste	123.123.123-12	(19) 8787-8787	\N	SUPPLIER	t	f	\N	\N	\N	f	\N	\N	2026-08-24 21:43:57.4	2026-08-24 21:43:57.4	\N	\N
10310716-7e13-4cfe-9f2e-be3c839fbd47	pedidos@defensivosnac.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Paulo Rocha	00.000.008/0001-08	(21) 98888-8888	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.708	2026-08-25 01:26:52.992	\N	\N
f8a49a62-61cf-4b16-8eea-8ab4d5b3a291	admin@agrobuscafacil.com.br	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Administrador	000.000.000-00	(11) 99999-9999	\N	SUPER_ADMIN	t	t	\N	\N	\N	f	\N	\N	2026-08-24 21:30:48.595	2026-08-25 01:26:52.798	\N	\N
95258da1-09b2-4b93-8a94-ec7d635937e2	cliente@agrobuscafacil.com.br	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Maria Cliente	111.111.111-11	(11) 97777-7777	\N	CUSTOMER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.539	2026-08-25 01:26:52.884	\N	\N
e839b921-8e4c-4fe7-b660-9fe35de77aa7	contato@agroquimica.com.br	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Carlos Almeida	00.000.001/0001-01	(11) 91111-1111	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.555	2026-08-25 01:26:52.889	\N	\N
eac5477d-f6f0-44d0-a18b-04852e6aecd9	vendas@sementessilva.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Pedro Silva	00.000.002/0001-02	(11) 92222-2222	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.634	2026-08-25 01:26:52.923	\N	\N
e1cfbd43-254a-4c8d-a0dd-c0d77bbab6ea	admin@agrotech.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Roberto Lima	00.000.003/0001-03	(11) 93333-3333	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.646	2026-08-25 01:26:52.932	\N	\N
70e4e96c-2709-4ee1-a7db-3338615f0f7b	contato@fertabc.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Fernando Costa	00.000.004/0001-04	(11) 94444-4444	\N	SUPPLIER	t	f	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.672	2026-08-25 01:26:52.942	\N	\N
d84edc2b-58fd-4838-ba16-7f9167d20802	contato@boavista.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Juliana Campos	00.000.005/0001-05	(11) 95555-5555	\N	SUPPLIER	t	f	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.683	2026-08-25 01:26:52.971	\N	\N
aa0bc469-025c-42c9-9895-1a18526c1ae3	vendas@irrigafacil.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	André Oliveira	00.000.006/0001-06	(11) 96666-6666	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.689	2026-08-25 01:26:52.979	\N	\N
70859dfd-a217-4817-a818-ee8bc8ca5071	contato@maquinasagri.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Marcos Santos	00.000.007/0001-07	(11) 97777-7777	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.702	2026-08-25 01:26:52.986	\N	\N
7a50c3a6-1def-431a-8964-afbd13ef4cc8	comercial@sementesgenetix.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Luiz Mendes	00.000.009/0001-09	(21) 99999-9999	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.714	2026-08-25 01:26:52.999	\N	\N
45b747f3-7560-494b-b3a6-695bfe526bd1	vendas@agrotecsistemas.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Tiago Barbosa	00.000.010/0001-10	(31) 91111-1111	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.722	2026-08-25 01:26:53.009	\N	\N
a08d09da-8d04-4aec-9395-44c2c99ec117	contato@pecuariaforte.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Gustavo Pereira	00.000.011/0001-11	(31) 92222-2222	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.734	2026-08-25 01:26:53.019	\N	\N
909a89ad-e702-4c60-a91a-68f6df63337d	logistica@transporterural.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Ricardo Teixeira	00.000.012/0001-12	(41) 91111-1111	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.738	2026-08-25 01:26:53.027	\N	\N
80bc165e-29d7-456a-8493-0b55002eb9a6	admin@armazenagemtotal.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Fábio Carvalho	00.000.013/0001-13	(41) 92222-2222	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.75	2026-08-25 01:26:53.035	\N	\N
5ea87a5a-a671-4901-a7f9-c898a3a31360	contato@organicosdovale.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Marina Duarte	00.000.014/0001-14	(51) 91111-1111	\N	SUPPLIER	t	f	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.758	2026-08-25 01:26:53.044	\N	\N
6857e3fe-8705-432c-bb6a-ed0a91d97eb4	pedidos@biodefensivos.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Rafael Nunes	00.000.015/0001-15	(51) 92222-2222	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.763	2026-08-25 01:26:53.053	\N	\N
588c3775-2e2f-4a72-8622-ac468b3c5b52	vendas@tratoresecia.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Diego Martins	00.000.016/0001-16	(61) 91111-1111	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.767	2026-08-25 01:26:53.062	\N	\N
7283040e-11c4-4256-8da4-37b3bdaa7354	suporte@irrigatech.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Eduardo Araújo	00.000.017/0001-17	(61) 92222-2222	\N	SUPPLIER	t	f	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.77	2026-08-25 01:26:53.07	\N	\N
f8bddf0b-6ed7-4b47-9bbf-ee217859ba40	admin@nutriplant.com	$2b$12$oEepMPzvbertcyr02OfOpuYsJH5UUz3A/0fODGJ8IMC.bbzcCXIpS	Bruno Ferreira	00.000.018/0001-18	(71) 91111-1111	\N	SUPPLIER	t	t	\N	\N	\N	f	\N	\N	2026-08-24 22:16:17.777	2026-08-25 01:26:53.083	\N	\N
d5979256-776b-4d45-9f67-5f63b34fc20e	cliente2@teste.com	$2b$12$.u0Kg4jw5I/sF2t6w50BMeEFn9cCKPVXQ8EE7powvNRgQkNAH0qGu	cliente2	12.344.232/3212-11	(12) 12121-2121	\N	CUSTOMER	t	f	\N	\N	\N	f	\N	\N	2026-08-26 01:19:47.983	2026-08-26 01:19:47.983	\N	\N
\.


--
-- Data for Name: WorkingHours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkingHours" (id, "supplierId", "dayOfWeek", "openTime", "closeTime", "isOpen", "createdAt", "updatedAt") FROM stdin;
77adbf79-9021-47b2-ad5a-2227a4b500de	3f27a882-9f1b-4714-b5b7-45af0f8a0101	1	08:00	18:00	t	2026-08-27 01:08:56.145	2026-08-27 01:08:56.145
4a85a080-bd47-41d6-a04d-688ab879e3f2	3f27a882-9f1b-4714-b5b7-45af0f8a0101	2	08:00	18:00	t	2026-08-27 01:08:56.145	2026-08-27 01:08:56.145
8992b0f0-99a1-43e5-a990-d9ebee9ea192	3f27a882-9f1b-4714-b5b7-45af0f8a0101	3	08:00	18:00	t	2026-08-27 01:08:56.145	2026-08-27 01:08:56.145
24f479e3-16f1-4dd1-bef3-9ebe96efe4c7	3f27a882-9f1b-4714-b5b7-45af0f8a0101	4	08:00	18:00	t	2026-08-27 01:08:56.145	2026-08-27 01:08:56.145
368617d9-3bf7-40dd-adc9-e2da952bc9e9	3f27a882-9f1b-4714-b5b7-45af0f8a0101	5	08:00	18:00	t	2026-08-27 01:08:56.145	2026-08-27 01:08:56.145
8734ca26-ff87-4c76-9f9a-eb8c6d906ac8	3f27a882-9f1b-4714-b5b7-45af0f8a0101	6	08:00	12:00	t	2026-08-27 01:08:56.145	2026-08-27 01:08:56.145
0f58dc42-b636-462f-83af-467f56a70084	3f27a882-9f1b-4714-b5b7-45af0f8a0101	0	08:00	18:00	f	2026-08-27 01:08:56.145	2026-08-27 01:08:56.145
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1ffd887e-f8aa-41d3-b045-6e22c296a820	efb3ceefabaac899f972a22b1a90fe62f5d346c1fe8e896a87ba69887a24cca0	\N	20260825000002_add_review_reports	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260825000002_add_review_reports\n\nDatabase error code: 42P01\n\nDatabase error:\nERRO: relação "SellerReview" não existe\n\nDbError { severity: "ERRO", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relação \\"SellerReview\\" não existe", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(639), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260825000002_add_review_reports"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260825000002_add_review_reports"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255	2026-08-24 22:49:16.218796-03	2026-08-24 22:48:24.448985-03	0
4a0eb341-e416-439e-a6f6-95208148a3eb	6c07b61d540b05f0fff47666746e07c343b9c69ad8388e80e3c3fb17277854ac	2026-08-24 17:55:43.495376-03	20260728190405_	\N	\N	2026-08-24 17:55:43.12175-03	1
3dc2d90a-1326-4706-aeed-4937cb5f5ea4	051c0aad13768b7e29ba6570d20b6ac7af3f28fa20c044209a03d9775c4487fd	2026-08-24 17:55:43.499877-03	20260728191137_init	\N	\N	2026-08-24 17:55:43.495791-03	1
0df78846-99ec-4a84-b62b-29029fa39467	8818c8423732795845186c01ad848488630034e2d1cdc7de3d9971881001fccf	\N	20260826000002_change_seller_unique	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260826000002_change_seller_unique\n\nDatabase error code: 42704\n\nDatabase error:\nERRO: restrição "SellerReview_userId_orderId_key" da relação "SellerReview" não existe\n\nDbError { severity: "ERRO", parsed_severity: Some(Error), code: SqlState(E42704), message: "restrição \\"SellerReview_userId_orderId_key\\" da relação \\"SellerReview\\" não existe", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(14060), routine: Some("ATExecDropConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260826000002_change_seller_unique"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260826000002_change_seller_unique"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255	2026-08-25 21:51:28.868825-03	2026-08-25 21:50:48.67362-03	0
921008a5-35ac-47b4-8f66-4c4c11ccf391	c9122eec4733d275d58ca154351cb8bb26527ed04ffb2e1dbca5d2972651b790	2026-08-24 17:55:43.562776-03	20260803124613_add_support_tickets	\N	\N	2026-08-24 17:55:43.500536-03	1
995479e8-f55f-47ce-9504-82102b6cf117	9d17e93fabda6053481255bcdc896f8e8c9305208543f1ca3f3753709b62a6e7	2026-08-25 20:36:12.152442-03	20260826000000_add_seller_rating	\N	\N	2026-08-25 20:36:12.085686-03	1
79b3e718-3814-40e1-9a3b-9a7b1efbfc32	41b92b4d43eca5a5ba3e2371934281e71c3e4d1b8e280942a39d30f48d9f0ca7	2026-08-24 17:55:43.576276-03	20260807211029_add_analytics_logs	\N	\N	2026-08-24 17:55:43.563199-03	1
dfe6dc93-ab85-4284-9539-63a1fccff123	db30b4e5170f46941fbf47ead2069e471c67349c094b19256984bb988e2f5d73	2026-08-24 17:55:43.579501-03	20260807211639_add_session_id	\N	\N	2026-08-24 17:55:43.576819-03	1
93416bbc-5c27-46e0-aac0-c920cdac7334	d96be49709e779735ef3ab11d26941a7736924dae852adbe4b042d91de828c39	2026-08-24 17:55:43.588805-03	20260807222404_init	\N	\N	2026-08-24 17:55:43.57992-03	1
d1c409da-6af0-4f9b-a593-d5c8a0fb926f	003f45065e4656c3da5e31b72f5a0d3f0dd0408af4bbf9b673edafc43aebefb6	2026-08-25 20:39:56.44918-03	20260826000001_add_review_tables	\N	\N	2026-08-25 20:39:56.208518-03	1
edcf95f8-a9fc-40d4-9b2e-ceee8ba02175	d2584b72e025b215d2a3f5b739a23cf2105980caf9ad071c588c44743b7efe87	2026-08-24 17:55:43.600676-03	20260819120000_add_refresh_tokens	\N	\N	2026-08-24 17:55:43.589439-03	1
275c4f6f-ceb6-44e8-9c3c-74085c62e6f1	8d949ca460c145c65d74e106f1ee34d29456ecb4e81aa86dcfd149fb0fc38ba5	2026-08-24 17:58:57.870326-03	20260824000000_add_confirmed_delivery	\N	\N	2026-08-24 17:58:57.855019-03	1
a423a716-eeed-46b7-ae94-6852c7503815	d989156a0b74d23ba46da4d9b949f289f57cc2202cbc177a08a53f6b6c194f8a	2026-08-24 18:08:07.825114-03	20260824000001_add_verified_purchase	\N	\N	2026-08-24 18:08:07.74401-03	1
8a7ce481-346c-4929-a644-cec66dca4939	dcbad0a0dd031adcadabaf4e30b8274e805e20246510ff6f86f1e614341305a8	2026-08-24 18:51:26.666435-03	20260825000000_add_payment_customer	\N	\N	2026-08-24 18:51:26.504469-03	1
d0d660ec-c1ed-43ac-ad9b-1dd14beb7cea	d608a869fb285c1970dcffbce51e4142731607f582da802e171234b46313262b	2026-08-24 19:00:44.022168-03	20260825000001_add_idempotency_key_to_payment	\N	\N	2026-08-24 19:00:43.958697-03	1
329d5083-5539-4df6-bc01-8b550855c554	3a6826ce1f7d1fd6e3248d068dbfc31a1bf0f31691e733c3cf3797c53d1cfc69	\N	20260826000002_change_seller_unique	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260826000002_change_seller_unique\n\nDatabase error code: 23505\n\nDatabase error:\nERRO: não foi possível criar o índice único "SellerReview_userId_supplierId_key"\nDETAIL: Chave ("userId", "supplierId")=(73e05d53-965d-4605-91c8-20abadda6626, 3f27a882-9f1b-4714-b5b7-45af0f8a0101) está duplicada.\n\nDbError { severity: "ERRO", parsed_severity: Some(Error), code: SqlState(E23505), message: "não foi possível criar o índice único \\"SellerReview_userId_supplierId_key\\"", detail: Some("Chave (\\"userId\\", \\"supplierId\\")=(73e05d53-965d-4605-91c8-20abadda6626, 3f27a882-9f1b-4714-b5b7-45af0f8a0101) está duplicada."), hint: None, position: None, where_: None, schema: Some("public"), table: Some("SellerReview"), column: None, datatype: None, constraint: Some("SellerReview_userId_supplierId_key"), file: Some("tuplesortvariants.c"), line: Some(1693), routine: Some("comparetup_index_btree_tiebreak") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260826000002_change_seller_unique"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260826000002_change_seller_unique"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255	2026-08-25 21:52:11.613781-03	2026-08-25 21:51:35.307585-03	0
516aa6f0-70d8-4f18-813d-1c3591d21681	093c5a96e84d963d4a645e983cb5dbfd94e2fbe3b7b19059bdd387ce79f54041	2026-08-25 21:52:13.420804-03	20260826000002_change_seller_unique	\N	\N	2026-08-25 21:52:13.355141-03	1
4c5d9aec-2f77-4fdd-8404-bd2127cf2d83	ce3bdfdfddb202f2f38879368008dcc4d7765191f96f34694772cd4f2b2fd504	2026-09-05 18:27:05.846572-03	20260905000001_enforce_sale_mode_by_category	\N	\N	2026-09-05 18:27:05.842507-03	1
1cb0505c-ce9e-4310-b6de-b1e756485781	78e411ec1423bef52f8b63c91f672f07cf13216a66db6b11b7c88ae9ea1b6a83	2026-08-26 18:15:14.918631-03	20260826000003_add_review_likes	\N	\N	2026-08-26 18:15:14.669755-03	1
5a62d9ea-5ea3-4862-82b4-48b5c9cf0a4c	0a1c13d6fd80a9b1cfb521119596df5fc5b89a31175ee9c855651bfec2528278	2026-08-26 20:06:09.184018-03	20260826000004_add_supplier_foundation_history	\N	\N	2026-08-26 20:06:09.017793-03	1
a04f77f7-473e-4615-88cf-16fd65e6bd79	7afdbbbeebb753648a8f8f9f69bbeaa2e493cd686c42efe68e672085d2b273bd	2026-08-26 20:35:56.60176-03	20260826000005_add_product_sale_mode	\N	\N	2026-08-26 20:35:56.513341-03	1
4ed47fed-f031-4adc-b650-05b29ba1ec52	a02ac12cb273bf2e5b6c6a878e8cd27bc4465203aafbcaf166920efe5dfc4baf	2026-09-05 18:27:05.899872-03	20260905000002_add_product_shipping_rules	\N	\N	2026-09-05 18:27:05.846963-03	1
8d6424f5-d861-4342-83f1-9995678ef43c	007e30a1c15a01ee0efce0903f9064d01bd8c9bf55c5bdff3be73733e885c237	2026-08-26 20:49:27.298909-03	20260826000006_add_product_codes	\N	\N	2026-08-26 20:49:27.111433-03	1
bafa4a36-86c1-4ed1-b817-cfa5772df84c	596e79ad0e4da9fc4a49a13fad5ed5cc38f7dd00044bc4e2159e4c465652b518	\N	20260905000000_replace_product_categories	\N	2026-09-05 18:26:59.142344-03	2026-09-05 18:26:15.004442-03	0
dfe2bf9d-530e-4f72-a2b1-f52259bb27e2	928d4966c2fe234ab194d4e4dc4fc82515d09f66b0f5e582c8c0a7678281b0fe	2026-09-05 18:27:05.841921-03	20260905000000_replace_product_categories	\N	\N	2026-09-05 18:27:05.770986-03	1
1956d926-c41d-4b21-85e3-319cc898f5b9	46398dd73232e61d4ed821319a1522f8c6514383b045db3948bf5f249794509a	2026-09-05 21:57:03.201835-03	20260905000003_add_product_shipping_coverage	\N	\N	2026-09-05 21:57:03.156235-03	1
cfccb886-9b8e-45b2-8d38-4226f11682b7	cc0471cbd84488be7190b7d17a2ad3cc8b2f08fdd645e407a8d1b3737a75fd9f	2026-09-18 18:07:04.341224-03	20260918181000_align_user_token_columns	\N	\N	2026-09-18 18:07:04.305017-03	1
cfd1e105-0088-4988-a1d7-38909f7ee2f7	7ab6c71077f8da1e1ee7c659403226fbb1d16adaf4ec58dc1232973530a92c11	2026-09-18 18:23:30.190198-03	20260918182300_align_supplier_profile_columns	\N	\N	2026-09-18 18:23:29.810018-03	1
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ChatSettings ChatSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatSettings"
    ADD CONSTRAINT "ChatSettings_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: CustomerProfile CustomerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY (id);


--
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderCoupon OrderCoupon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderCoupon"
    ADD CONSTRAINT "OrderCoupon_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderStatusHistory OrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PaymentCard PaymentCard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentCard"
    ADD CONSTRAINT "PaymentCard_pkey" PRIMARY KEY (id);


--
-- Name: PaymentCustomer PaymentCustomer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentCustomer"
    ADD CONSTRAINT "PaymentCustomer_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductCode ProductCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCode"
    ADD CONSTRAINT "ProductCode_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Promotion Promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: Report Report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);


--
-- Name: ReviewLike ReviewLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewLike"
    ADD CONSTRAINT "ReviewLike_pkey" PRIMARY KEY (id);


--
-- Name: ReviewReport ReviewReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewReport"
    ADD CONSTRAINT "ReviewReport_pkey" PRIMARY KEY (id);


--
-- Name: ReviewResponse ReviewResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewResponse"
    ADD CONSTRAINT "ReviewResponse_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: SearchLog SearchLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SearchLog"
    ADD CONSTRAINT "SearchLog_pkey" PRIMARY KEY (id);


--
-- Name: SellerReviewLike SellerReviewLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewLike"
    ADD CONSTRAINT "SellerReviewLike_pkey" PRIMARY KEY (id);


--
-- Name: SellerReviewReport SellerReviewReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewReport"
    ADD CONSTRAINT "SellerReviewReport_pkey" PRIMARY KEY (id);


--
-- Name: SellerReviewResponse SellerReviewResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewResponse"
    ADD CONSTRAINT "SellerReviewResponse_pkey" PRIMARY KEY (id);


--
-- Name: SellerReview SellerReview_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReview"
    ADD CONSTRAINT "SellerReview_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: SessionLog SessionLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SessionLog"
    ADD CONSTRAINT "SessionLog_pkey" PRIMARY KEY (id);


--
-- Name: SupplierFoundationHistory SupplierFoundationHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierFoundationHistory"
    ADD CONSTRAINT "SupplierFoundationHistory_pkey" PRIMARY KEY (id);


--
-- Name: SupplierProfile SupplierProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierProfile"
    ADD CONSTRAINT "SupplierProfile_pkey" PRIMARY KEY (id);


--
-- Name: SupportAttachment SupportAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportAttachment"
    ADD CONSTRAINT "SupportAttachment_pkey" PRIMARY KEY (id);


--
-- Name: SupportCategory SupportCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportCategory"
    ADD CONSTRAINT "SupportCategory_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicketNote SupportTicketNote_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicketNote"
    ADD CONSTRAINT "SupportTicketNote_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicketStatusHistory SupportTicketStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicketStatusHistory"
    ADD CONSTRAINT "SupportTicketStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- Name: SupportType SupportType_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportType"
    ADD CONSTRAINT "SupportType_pkey" PRIMARY KEY (id);


--
-- Name: SystemConfig SystemConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemConfig"
    ADD CONSTRAINT "SystemConfig_pkey" PRIMARY KEY (id);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (key);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WorkingHours WorkingHours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkingHours"
    ADD CONSTRAINT "WorkingHours_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Address_city_state_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Address_city_state_idx" ON public."Address" USING btree (city, state);


--
-- Name: Address_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Address_supplierId_idx" ON public."Address" USING btree ("supplierId");


--
-- Name: Address_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Address_userId_idx" ON public."Address" USING btree ("userId");


--
-- Name: Address_zipCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Address_zipCode_idx" ON public."Address" USING btree ("zipCode");


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entity_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: Banner_position_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Banner_position_active_idx" ON public."Banner" USING btree ("position", active);


--
-- Name: CartItem_cartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_cartId_idx" ON public."CartItem" USING btree ("cartId");


--
-- Name: CartItem_cartId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON public."CartItem" USING btree ("cartId", "productId");


--
-- Name: CartItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_productId_idx" ON public."CartItem" USING btree ("productId");


--
-- Name: Cart_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cart_userId_idx" ON public."Cart" USING btree ("userId");


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Category_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_active_idx" ON public."Category" USING btree (active);


--
-- Name: Category_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_parentId_idx" ON public."Category" USING btree ("parentId");


--
-- Name: Category_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_slug_idx" ON public."Category" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: ChatSettings_supplierId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ChatSettings_supplierId_key" ON public."ChatSettings" USING btree ("supplierId");


--
-- Name: Conversation_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Conversation_customerId_idx" ON public."Conversation" USING btree ("customerId");


--
-- Name: Conversation_supplierId_customerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Conversation_supplierId_customerId_key" ON public."Conversation" USING btree ("supplierId", "customerId");


--
-- Name: Conversation_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Conversation_supplierId_idx" ON public."Conversation" USING btree ("supplierId");


--
-- Name: Coupon_active_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Coupon_active_startDate_endDate_idx" ON public."Coupon" USING btree (active, "startDate", "endDate");


--
-- Name: Coupon_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Coupon_code_idx" ON public."Coupon" USING btree (code);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: Coupon_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Coupon_supplierId_idx" ON public."Coupon" USING btree ("supplierId");


--
-- Name: CustomerProfile_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CustomerProfile_userId_idx" ON public."CustomerProfile" USING btree ("userId");


--
-- Name: CustomerProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON public."CustomerProfile" USING btree ("userId");


--
-- Name: Favorite_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Favorite_userId_idx" ON public."Favorite" USING btree ("userId");


--
-- Name: Favorite_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON public."Favorite" USING btree ("userId", "productId");


--
-- Name: Favorite_userId_supplierId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Favorite_userId_supplierId_key" ON public."Favorite" USING btree ("userId", "supplierId");


--
-- Name: Message_conversationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Message_conversationId_idx" ON public."Message" USING btree ("conversationId");


--
-- Name: Message_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Message_createdAt_idx" ON public."Message" USING btree ("createdAt");


--
-- Name: Message_senderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Message_senderId_idx" ON public."Message" USING btree ("senderId");


--
-- Name: Notification_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_type_idx" ON public."Notification" USING btree (type);


--
-- Name: Notification_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_createdAt_idx" ON public."Notification" USING btree ("userId", "createdAt");


--
-- Name: Notification_userId_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_read_idx" ON public."Notification" USING btree ("userId", read);


--
-- Name: OrderCoupon_couponId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderCoupon_couponId_idx" ON public."OrderCoupon" USING btree ("couponId");


--
-- Name: OrderCoupon_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderCoupon_orderId_idx" ON public."OrderCoupon" USING btree ("orderId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: OrderStatusHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderStatusHistory_createdAt_idx" ON public."OrderStatusHistory" USING btree ("createdAt");


--
-- Name: OrderStatusHistory_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderStatusHistory_orderId_idx" ON public."OrderStatusHistory" USING btree ("orderId");


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_customerId_idx" ON public."Order" USING btree ("customerId");


--
-- Name: Order_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_orderNumber_idx" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_paymentStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_paymentStatus_idx" ON public."Order" USING btree ("paymentStatus");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_supplierId_idx" ON public."Order" USING btree ("supplierId");


--
-- Name: PaymentCard_paymentCustomerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentCard_paymentCustomerId_idx" ON public."PaymentCard" USING btree ("paymentCustomerId");


--
-- Name: PaymentCard_userId_isDefault_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentCard_userId_isDefault_idx" ON public."PaymentCard" USING btree ("userId", "isDefault");


--
-- Name: PaymentCard_userId_providerCardId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PaymentCard_userId_providerCardId_key" ON public."PaymentCard" USING btree ("userId", "providerCardId");


--
-- Name: PaymentCustomer_provider_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentCustomer_provider_idx" ON public."PaymentCustomer" USING btree (provider);


--
-- Name: PaymentCustomer_provider_providerCustomerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PaymentCustomer_provider_providerCustomerId_key" ON public."PaymentCustomer" USING btree (provider, "providerCustomerId");


--
-- Name: PaymentCustomer_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentCustomer_userId_idx" ON public."PaymentCustomer" USING btree ("userId");


--
-- Name: PaymentCustomer_userId_provider_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PaymentCustomer_userId_provider_key" ON public."PaymentCustomer" USING btree ("userId", provider);


--
-- Name: Payment_gatewayId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_gatewayId_idx" ON public."Payment" USING btree ("gatewayId");


--
-- Name: Payment_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON public."Payment" USING btree ("idempotencyKey");


--
-- Name: Payment_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_orderId_idx" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: ProductCode_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductCode_code_idx" ON public."ProductCode" USING btree (code);


--
-- Name: ProductCode_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductCode_code_key" ON public."ProductCode" USING btree (code);


--
-- Name: ProductCode_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductCode_productId_key" ON public."ProductCode" USING btree ("productId");


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_featured_idx" ON public."Product" USING btree (featured);


--
-- Name: Product_price_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_price_idx" ON public."Product" USING btree (price);


--
-- Name: Product_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_rating_idx" ON public."Product" USING btree (rating);


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: Product_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_slug_idx" ON public."Product" USING btree (slug);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Product_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_status_idx" ON public."Product" USING btree (status);


--
-- Name: Product_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_supplierId_idx" ON public."Product" USING btree ("supplierId");


--
-- Name: Promotion_active_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Promotion_active_startDate_endDate_idx" ON public."Promotion" USING btree (active, "startDate", "endDate");


--
-- Name: Promotion_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Promotion_productId_idx" ON public."Promotion" USING btree ("productId");


--
-- Name: Promotion_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Promotion_supplierId_idx" ON public."Promotion" USING btree ("supplierId");


--
-- Name: RefreshToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_expiresAt_idx" ON public."RefreshToken" USING btree ("expiresAt");


--
-- Name: RefreshToken_jti_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshToken_jti_key" ON public."RefreshToken" USING btree (jti);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: Report_reportedType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_reportedType_idx" ON public."Report" USING btree ("reportedType");


--
-- Name: Report_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_status_idx" ON public."Report" USING btree (status);


--
-- Name: ReviewLike_reviewId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ReviewLike_reviewId_userId_key" ON public."ReviewLike" USING btree ("reviewId", "userId");


--
-- Name: ReviewLike_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReviewLike_userId_idx" ON public."ReviewLike" USING btree ("userId");


--
-- Name: ReviewReport_reportedBy_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReviewReport_reportedBy_idx" ON public."ReviewReport" USING btree ("reportedBy");


--
-- Name: ReviewReport_reviewId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReviewReport_reviewId_idx" ON public."ReviewReport" USING btree ("reviewId");


--
-- Name: ReviewReport_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReviewReport_status_idx" ON public."ReviewReport" USING btree (status);


--
-- Name: ReviewResponse_reviewId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReviewResponse_reviewId_idx" ON public."ReviewResponse" USING btree ("reviewId");


--
-- Name: ReviewResponse_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReviewResponse_supplierId_idx" ON public."ReviewResponse" USING btree ("supplierId");


--
-- Name: Review_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_productId_idx" ON public."Review" USING btree ("productId");


--
-- Name: Review_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_rating_idx" ON public."Review" USING btree (rating);


--
-- Name: Review_serviceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_serviceId_idx" ON public."Review" USING btree ("serviceId");


--
-- Name: Review_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_status_idx" ON public."Review" USING btree (status);


--
-- Name: Review_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_supplierId_idx" ON public."Review" USING btree ("supplierId");


--
-- Name: Review_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_userId_productId_key" ON public."Review" USING btree ("userId", "productId");


--
-- Name: Review_userId_serviceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_userId_serviceId_key" ON public."Review" USING btree ("userId", "serviceId");


--
-- Name: SearchLog_count_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SearchLog_count_idx" ON public."SearchLog" USING btree (count);


--
-- Name: SearchLog_term_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SearchLog_term_key" ON public."SearchLog" USING btree (term);


--
-- Name: SellerReviewLike_sellerReviewId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SellerReviewLike_sellerReviewId_userId_key" ON public."SellerReviewLike" USING btree ("sellerReviewId", "userId");


--
-- Name: SellerReviewLike_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReviewLike_userId_idx" ON public."SellerReviewLike" USING btree ("userId");


--
-- Name: SellerReviewReport_reportedBy_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReviewReport_reportedBy_idx" ON public."SellerReviewReport" USING btree ("reportedBy");


--
-- Name: SellerReviewReport_sellerReviewId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReviewReport_sellerReviewId_idx" ON public."SellerReviewReport" USING btree ("sellerReviewId");


--
-- Name: SellerReviewReport_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReviewReport_status_idx" ON public."SellerReviewReport" USING btree (status);


--
-- Name: SellerReviewResponse_sellerReviewId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReviewResponse_sellerReviewId_idx" ON public."SellerReviewResponse" USING btree ("sellerReviewId");


--
-- Name: SellerReviewResponse_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReviewResponse_supplierId_idx" ON public."SellerReviewResponse" USING btree ("supplierId");


--
-- Name: SellerReview_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReview_orderId_idx" ON public."SellerReview" USING btree ("orderId");


--
-- Name: SellerReview_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReview_status_idx" ON public."SellerReview" USING btree (status);


--
-- Name: SellerReview_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerReview_supplierId_idx" ON public."SellerReview" USING btree ("supplierId");


--
-- Name: SellerReview_userId_supplierId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SellerReview_userId_supplierId_key" ON public."SellerReview" USING btree ("userId", "supplierId");


--
-- Name: Service_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Service_categoryId_idx" ON public."Service" USING btree ("categoryId");


--
-- Name: Service_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Service_featured_idx" ON public."Service" USING btree (featured);


--
-- Name: Service_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Service_slug_idx" ON public."Service" USING btree (slug);


--
-- Name: Service_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Service_slug_key" ON public."Service" USING btree (slug);


--
-- Name: Service_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Service_status_idx" ON public."Service" USING btree (status);


--
-- Name: Service_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Service_supplierId_idx" ON public."Service" USING btree ("supplierId");


--
-- Name: SessionLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SessionLog_createdAt_idx" ON public."SessionLog" USING btree ("createdAt");


--
-- Name: SessionLog_sessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SessionLog_sessionId_idx" ON public."SessionLog" USING btree ("sessionId");


--
-- Name: SessionLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SessionLog_userId_idx" ON public."SessionLog" USING btree ("userId");


--
-- Name: SupplierFoundationHistory_supplierId_foundationDate_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SupplierFoundationHistory_supplierId_foundationDate_key" ON public."SupplierFoundationHistory" USING btree ("supplierId", "foundationDate");


--
-- Name: SupplierFoundationHistory_supplierId_recordedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupplierFoundationHistory_supplierId_recordedAt_idx" ON public."SupplierFoundationHistory" USING btree ("supplierId", "recordedAt");


--
-- Name: SupplierProfile_document_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SupplierProfile_document_key" ON public."SupplierProfile" USING btree (document);


--
-- Name: SupplierProfile_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupplierProfile_featured_idx" ON public."SupplierProfile" USING btree (featured);


--
-- Name: SupplierProfile_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupplierProfile_rating_idx" ON public."SupplierProfile" USING btree (rating);


--
-- Name: SupplierProfile_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupplierProfile_status_idx" ON public."SupplierProfile" USING btree (status);


--
-- Name: SupplierProfile_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupplierProfile_userId_idx" ON public."SupplierProfile" USING btree ("userId");


--
-- Name: SupplierProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SupplierProfile_userId_key" ON public."SupplierProfile" USING btree ("userId");


--
-- Name: SupportAttachment_ticketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportAttachment_ticketId_idx" ON public."SupportAttachment" USING btree ("ticketId");


--
-- Name: SupportCategory_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportCategory_active_idx" ON public."SupportCategory" USING btree (active);


--
-- Name: SupportCategory_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportCategory_order_idx" ON public."SupportCategory" USING btree ("order");


--
-- Name: SupportCategory_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SupportCategory_slug_key" ON public."SupportCategory" USING btree (slug);


--
-- Name: SupportTicketNote_ticketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicketNote_ticketId_idx" ON public."SupportTicketNote" USING btree ("ticketId");


--
-- Name: SupportTicketStatusHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicketStatusHistory_createdAt_idx" ON public."SupportTicketStatusHistory" USING btree ("createdAt");


--
-- Name: SupportTicketStatusHistory_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicketStatusHistory_status_idx" ON public."SupportTicketStatusHistory" USING btree (status);


--
-- Name: SupportTicketStatusHistory_ticketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicketStatusHistory_ticketId_idx" ON public."SupportTicketStatusHistory" USING btree ("ticketId");


--
-- Name: SupportTicket_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicket_categoryId_idx" ON public."SupportTicket" USING btree ("categoryId");


--
-- Name: SupportTicket_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicket_createdAt_idx" ON public."SupportTicket" USING btree ("createdAt");


--
-- Name: SupportTicket_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicket_status_idx" ON public."SupportTicket" USING btree (status);


--
-- Name: SupportTicket_typeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicket_typeId_idx" ON public."SupportTicket" USING btree ("typeId");


--
-- Name: SupportTicket_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicket_userId_idx" ON public."SupportTicket" USING btree ("userId");


--
-- Name: SupportType_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportType_active_idx" ON public."SupportType" USING btree (active);


--
-- Name: SupportType_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportType_categoryId_idx" ON public."SupportType" USING btree ("categoryId");


--
-- Name: SupportType_categoryId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SupportType_categoryId_name_key" ON public."SupportType" USING btree ("categoryId", name);


--
-- Name: SystemConfig_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SystemConfig_key_key" ON public."SystemConfig" USING btree (key);


--
-- Name: SystemSetting_updatedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SystemSetting_updatedAt_idx" ON public."SystemSetting" USING btree ("updatedAt");


--
-- Name: User_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_active_idx" ON public."User" USING btree (active);


--
-- Name: User_document_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_document_idx" ON public."User" USING btree (document);


--
-- Name: User_document_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_document_key" ON public."User" USING btree (document);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: WorkingHours_supplierId_dayOfWeek_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WorkingHours_supplierId_dayOfWeek_key" ON public."WorkingHours" USING btree ("supplierId", "dayOfWeek");


--
-- Name: Address Address_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Banner Banner_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatSettings ChatSettings_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatSettings"
    ADD CONSTRAINT "ChatSettings_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Coupon Coupon_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Coupon Coupon_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CustomerProfile CustomerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Favorite Favorite_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Favorite Favorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderCoupon OrderCoupon_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderCoupon"
    ADD CONSTRAINT "OrderCoupon_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupon"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderCoupon OrderCoupon_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderCoupon"
    ADD CONSTRAINT "OrderCoupon_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderStatusHistory OrderStatusHistory_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PaymentCard PaymentCard_paymentCustomerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentCard"
    ADD CONSTRAINT "PaymentCard_paymentCustomerId_fkey" FOREIGN KEY ("paymentCustomerId") REFERENCES public."PaymentCustomer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PaymentCard PaymentCard_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentCard"
    ADD CONSTRAINT "PaymentCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PaymentCustomer PaymentCustomer_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentCustomer"
    ADD CONSTRAINT "PaymentCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductCode ProductCode_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCode"
    ADD CONSTRAINT "ProductCode_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Promotion Promotion_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Promotion Promotion_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewLike ReviewLike_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewLike"
    ADD CONSTRAINT "ReviewLike_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Review"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewLike ReviewLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewLike"
    ADD CONSTRAINT "ReviewLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewReport ReviewReport_reportedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewReport"
    ADD CONSTRAINT "ReviewReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReviewReport ReviewReport_resolvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewReport"
    ADD CONSTRAINT "ReviewReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReviewReport ReviewReport_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewReport"
    ADD CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Review"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewResponse ReviewResponse_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewResponse"
    ADD CONSTRAINT "ReviewResponse_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Review"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewResponse ReviewResponse_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewResponse"
    ADD CONSTRAINT "ReviewResponse_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReviewResponse ReviewResponse_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewResponse"
    ADD CONSTRAINT "ReviewResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review Review_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review Review_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SellerReviewLike SellerReviewLike_sellerReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewLike"
    ADD CONSTRAINT "SellerReviewLike_sellerReviewId_fkey" FOREIGN KEY ("sellerReviewId") REFERENCES public."SellerReview"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReviewLike SellerReviewLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewLike"
    ADD CONSTRAINT "SellerReviewLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReviewReport SellerReviewReport_reportedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewReport"
    ADD CONSTRAINT "SellerReviewReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReviewReport SellerReviewReport_resolvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewReport"
    ADD CONSTRAINT "SellerReviewReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SellerReviewReport SellerReviewReport_sellerReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewReport"
    ADD CONSTRAINT "SellerReviewReport_sellerReviewId_fkey" FOREIGN KEY ("sellerReviewId") REFERENCES public."SellerReview"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReviewResponse SellerReviewResponse_sellerReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewResponse"
    ADD CONSTRAINT "SellerReviewResponse_sellerReviewId_fkey" FOREIGN KEY ("sellerReviewId") REFERENCES public."SellerReview"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReviewResponse SellerReviewResponse_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewResponse"
    ADD CONSTRAINT "SellerReviewResponse_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReviewResponse SellerReviewResponse_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReviewResponse"
    ADD CONSTRAINT "SellerReviewResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReview SellerReview_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReview"
    ADD CONSTRAINT "SellerReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReview SellerReview_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReview"
    ADD CONSTRAINT "SellerReview_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReview SellerReview_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerReview"
    ADD CONSTRAINT "SellerReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Service Service_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Service Service_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupplierFoundationHistory SupplierFoundationHistory_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierFoundationHistory"
    ADD CONSTRAINT "SupplierFoundationHistory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupplierProfile SupplierProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierProfile"
    ADD CONSTRAINT "SupplierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportAttachment SupportAttachment_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportAttachment"
    ADD CONSTRAINT "SupportAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportTicketNote SupportTicketNote_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicketNote"
    ADD CONSTRAINT "SupportTicketNote_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportTicketNote SupportTicketNote_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicketNote"
    ADD CONSTRAINT "SupportTicketNote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportTicketStatusHistory SupportTicketStatusHistory_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicketStatusHistory"
    ADD CONSTRAINT "SupportTicketStatusHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportTicket SupportTicket_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."SupportCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportTicket SupportTicket_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public."SupportType"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportTicket SupportTicket_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportType SupportType_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportType"
    ADD CONSTRAINT "SupportType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."SupportCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkingHours WorkingHours_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkingHours"
    ADD CONSTRAINT "WorkingHours_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."SupplierProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Gub6df6P76wEYyZYiwyPZ5735nVpWp68TRp2xYHDBpfsT9aHyxBNMjNRB30XuYV

