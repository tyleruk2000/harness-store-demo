"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

interface State {
  items: CartItem[];
}

type Action =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD"; product: Product; qty: number }
  | { type: "SET_QTY"; id: number; qty: number }
  | { type: "INC"; id: number }
  | { type: "DEC"; id: number }
  | { type: "REMOVE"; id: number }
  | { type: "CLEAR" };

function clamp(qty: number, stock: number): number {
  return Math.max(1, Math.min(qty, Math.max(1, stock)));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };
    case "ADD": {
      const { product, qty } = action;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: clamp(i.qty + qty, product.stock_quantity) } : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category: product.category,
            qty: clamp(qty, product.stock_quantity),
            stock: product.stock_quantity,
          },
        ],
      };
    }
    case "SET_QTY":
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: clamp(action.qty, i.stock) } : i,
        ),
      };
    case "INC":
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: clamp(i.qty + 1, i.stock) } : i,
        ),
      };
    case "DEC":
      return {
        items: state.items.flatMap((i) =>
          i.id === action.id ? (i.qty <= 1 ? [] : [{ ...i, qty: i.qty - 1 }]) : [i],
        ),
      };
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

export interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (product: Product, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  inc: (id: number) => void;
  dec: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once on the client. Never read localStorage during render — that
  // would desync server and client HTML and throw a hydration error.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.cart);
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) as CartItem[] });
    } catch {
      /* ignore corrupt JSON */
    }
    setHydrated(true);
  }, []);

  // Persist after hydration only (avoid clobbering storage with the empty
  // initial state before we've read it).
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.items));
    }
  }, [state.items, hydrated]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.cart && e.newValue) {
        try {
          dispatch({ type: "HYDRATE", items: JSON.parse(e.newValue) as CartItem[] });
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((product: Product, qty = 1) => dispatch({ type: "ADD", product, qty }), []);
  const setQty = useCallback((id: number, qty: number) => dispatch({ type: "SET_QTY", id, qty }), []);
  const inc = useCallback((id: number) => dispatch({ type: "INC", id }), []);
  const dec = useCallback((id: number) => dispatch({ type: "DEC", id }), []);
  const remove = useCallback((id: number) => dispatch({ type: "REMOVE", id }), []);
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((n, i) => n + i.qty, 0);
    const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    return { items: state.items, count, subtotal, hydrated, add, setQty, inc, dec, remove, clear };
  }, [state.items, hydrated, add, setQty, inc, dec, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
