"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Product } from "@/data/catalog";
import {useCatalog} from "@/context/CatalogContext";
import {api} from "@/lib/api";

export interface CartItem {
  productId: number;
  variantId?: number;
  slug: string;
  name: string;
  price: number;
  regularPrice?: number;
  image: string;
  weight?: string;
  quantity: number;
}

export interface CustomerOrder {
  orderId: string;
  customerName: string;
  phone: string;
  area: "inside-dhaka" | "outside-dhaka";
  address: string;
  district?: string;
  note?: string;
  coupon?: string;
  paymentMethod: "cod" | "bkash" | "nagad" | "sslcommerz";
  bkashSenderNumber?: string;
  bkashTrxId?: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  status: "Order Placed" | "Confirmed" | "Packed" | "Out for Delivery" | "Delivered";
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "info" | "error";
}

interface StoreContextValue {
  cart: CartItem[];
  totalItems: number;
  subtotal: number;
  hydrated: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  wishlist: number[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;
  orders: CustomerOrder[];
  placeOrder: (order: Omit<CustomerOrder, "orderId" | "status" | "createdAt">) => Promise<CustomerOrder>;
  findOrder: (query: string) => CustomerOrder | undefined;
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, "id" | "createdAt">) => void;
  user: { name: string; phone: string; email?: string; address?: string } | null;
  signIn: (name: string, phone: string, email?: string, address?: string) => void;
  signOut: () => void;
  showToast: (text: string, type?: "success" | "info" | "error") => void;
}

const STORAGE_KEY = "halalsheba_store_v1";

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const {PRODUCTS}=useCatalog();
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [user, setUser] = useState<{
    name: string;
    phone: string;
    email?: string;
    address?: string;
  } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.cart)) setCart(parsed.cart);
        if (Array.isArray(parsed.wishlist)) setWishlist(parsed.wishlist);
        if (parsed.user && parsed.user.phone) setUser(parsed.user);
      }
    } catch {
      // Ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cart, wishlist, user })
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [cart, wishlist, orders, reviews, user, hydrated]);

  // Synchronize cart item prices and details with latest catalog
  useEffect(() => {
    if (!hydrated || !PRODUCTS || PRODUCTS.length === 0) return;
    setCart((prevCart) => {
      let changed = false;
      const updated = prevCart.map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId || p.slug === item.slug);
        if (!product) return item;
        const variant = product.variants?.find((v) => v.id === item.variantId) || product.variants?.[0];
        const newPrice = variant?.price ?? product.price;
        const newRegularPrice = variant?.regularPrice ?? product.regularPrice;
        const newName = product.name;
        const newWeight = variant?.name || product.weight || item.weight;
        const newImage = variant?.image || product.image || item.image;
        if (
          newPrice !== item.price ||
          newRegularPrice !== item.regularPrice ||
          newName !== item.name ||
          newWeight !== item.weight ||
          newImage !== item.image
        ) {
          changed = true;
          return {
            ...item,
            price: newPrice,
            regularPrice: newRegularPrice,
            name: newName,
            weight: newWeight,
            image: newImage,
          };
        }
        return item;
      });
      return changed ? updated : prevCart;
    });
  }, [hydrated, PRODUCTS]);

  const showToast = useCallback(
    (text: string, type: "success" | "info" | "error" = "success") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (product: Product, quantity = 1, openDrawer = true) => {
      const minimum = product.slug === "satkhira-aam" ? 5 : 1;
      if (quantity < minimum) { showToast(`Minimum order quantity is ${minimum} kg.`, "error"); return; }
      const variant =
        product.variants?.find((v) => v.id === product.variantId) ||
        product.variants?.[0] || {
          id: product.variantId || product.id,
          name: product.weight || "Standard",
          price: product.price,
          regularPrice: product.regularPrice,
          image: product.image,
          available: 100,
        };

      const variantId = variant.id || product.id;
      const variantPrice = variant.price || product.price;

      setCart((prev) => {
        const existing = prev.find(
          (item) => (item.variantId || item.productId) === (variantId || product.id)
        );
        if (existing) {
          return prev.map((item) =>
            (item.variantId || item.productId) === (variantId || product.id)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            variantId: variantId,
            slug: product.slug,
            name: product.name,
            price: variantPrice,
            regularPrice: product.regularPrice,
            image: variant.image || product.image,
            weight: variant.name || product.weight || "Standard",
            quantity,
          },
        ];
      });
      showToast("Added to cart");
      if (openDrawer) setIsCartOpen(true);
    },
    [showToast]
  );

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => (item.variantId || item.productId) !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    const item = cart.find((entry) => (entry.variantId || entry.productId) === id);
    const minimum = item?.slug === "satkhira-aam" ? 5 : 1;
    if (quantity > 0 && quantity < minimum) { showToast(`Minimum order quantity is ${minimum} kg.`, "error"); return; }
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => (item.variantId || item.productId) !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        (item.variantId || item.productId) === id ? { ...item, quantity } : item
      )
    );
  }, [cart, showToast]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((prev) => {
        const exists = prev.includes(product.id);
        if (exists) {
          showToast(`Removed ${product.name} from wishlist`, "info");
          return prev.filter((id) => id !== product.id);
        }
        showToast(`Saved ${product.name} to wishlist`);
        return [...prev, product.id];
      });
    },
    [showToast]
  );

  const isWishlisted = useCallback(
    (productId: number) => wishlist.includes(productId),
    [wishlist]
  );

  const placeOrder = useCallback(async (orderData: Omit<CustomerOrder, "orderId" | "status" | "createdAt">) => {
    if (orderData.paymentMethod !== 'cod' && orderData.paymentMethod !== 'bkash') throw new Error('Online payments are not configured. Please select Cash on Delivery or bKash.');
    const fingerprint=JSON.stringify(orderData);
    if(sessionStorage.getItem('checkout-request-data')!==fingerprint){sessionStorage.removeItem('checkout-request-key');sessionStorage.setItem('checkout-request-data',fingerprint);}
    let key=sessionStorage.getItem('checkout-request-key');
    if(!key){key=crypto.randomUUID();sessionStorage.setItem('checkout-request-key',key);}
    try {
      const result=await api<{reference:string;subtotal:number;discount:number;delivery_charge:number;total:number;created_at:string}>('orders',{method:'POST',body:JSON.stringify({
        idempotency_key:key,name:orderData.customerName,phone:orderData.phone,address:orderData.address,
        district:orderData.district || (orderData.area==='inside-dhaka'?'Dhaka':orderData.address.split(',').at(-1)?.trim()||'Outside Dhaka'),
        source:'web',payment_method:orderData.paymentMethod,bkash_sender_number:orderData.bkashSenderNumber,bkash_trxid:orderData.bkashTrxId,note:orderData.note,coupon:orderData.coupon,items:orderData.items.map(i=>({variant_id:i.variantId || i.productId,quantity:i.quantity}))
      })});
      sessionStorage.removeItem('checkout-request-key');
      sessionStorage.removeItem('checkout-request-data');
      const order:CustomerOrder={...orderData,orderId:result.reference,status:'Order Placed',subtotal:result.subtotal/100,discount:result.discount/100,deliveryCharge:result.delivery_charge/100,total:result.total/100,createdAt:result.created_at};
      setOrders(prev=>[order,...prev]);return order;
    } catch (err) {
      throw err;
    }
  }, []);

  const findOrder = useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return undefined;
      return orders.find(
        (o) =>
          o.orderId.toLowerCase() === normalized ||
          o.phone.toLowerCase().includes(normalized)
      );
    },
    [orders]
  );

  const addReview = useCallback(() => { showToast('Please submit a review from the product page with your order reference.', 'info'); }, [showToast]);

  const signIn = useCallback(
    (name: string, phone: string, email?: string, address?: string) => {
      setUser({
        name: name.trim() || "Halal Sheba Customer",
        phone: phone.trim(),
        email: email?.trim() || undefined,
        address: address?.trim() || undefined,
      });
      showToast("Signed in successfully");
    },
    [showToast]
  );

  const signOut = useCallback(() => {
    setUser(null);
    showToast("Signed out", "info");
  }, [showToast]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      totalItems,
      subtotal,
      hydrated,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      orders,
      placeOrder,
      findOrder,
      reviews,
      addReview,
      user,
      signIn,
      signOut,
      showToast,
    }),
    [
      cart,
      totalItems,
      subtotal,
      hydrated,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      orders,
      placeOrder,
      findOrder,
      reviews,
      addReview,
      user,
      signIn,
      signOut,
      showToast,
    ]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {/* Responsive Toast Notifications with Type Support */}
      <div
        aria-live="polite"
        className="fixed top-16 sm:top-20 right-3 sm:right-6 z-[1300] flex flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((t) => {
          const isError = t.type === "error" || /error|failed|ব্যর্থ|ত্রুটি|সমস্যা/i.test(t.text);
          const isInfo = t.type === "info" && !isError;
          const bgClass = isError
            ? "bg-[#dc2626] hover:bg-[#b91c1c] shadow-[0_8px_25px_rgba(220,38,38,0.4)]"
            : isInfo
            ? "bg-[#1e293b] hover:bg-[#0f172a] shadow-[0_8px_25px_rgba(30,41,59,0.4)]"
            : "bg-[#4ea84b] hover:bg-[#439640] shadow-[0_8px_25px_rgba(78,168,75,0.4)]";

          return (
            <div
              key={t.id}
              onClick={isError ? undefined : openCart}
              title={isError ? undefined : "Click to view cart"}
              className={`pointer-events-auto flex items-center gap-2.5 sm:gap-3 rounded-lg ${bgClass} text-white px-4 sm:px-5 py-3 sm:py-3.5 transition-all animate-in slide-in-from-top-2 duration-200 cursor-pointer select-none`}
            >
              {isError ? (
                <svg
                  className="h-6 w-6 shrink-0 text-white stroke-[2.5]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : isInfo ? (
                <svg
                  className="h-6 w-6 shrink-0 text-white stroke-[2.5]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 shrink-0 text-white stroke-[3.2]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">
                {t.text}
              </span>
            </div>
          );
        })}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return ctx;
}
