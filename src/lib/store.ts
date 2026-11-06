// Teacher's cart/library/wishlist kept in localStorage until Lovable Cloud is added.
import { useSyncExternalStore } from "react";
import type { Review } from "@/data/types";

export interface StoreState {
  cart: string[];
  purchased: string[];
  wishlist: string[];
  recent: string[];
  myReviews: Review[];
  helpful: string[];
}
const KEY = "kitbit-store-v1";
const empty: StoreState = { cart: [], purchased: [], wishlist: [], recent: [], myReviews: [], helpful: [] };

let state: StoreState = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

export function setStore(fn: (s: StoreState) => StoreState) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useStore(): StoreState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return state;
    },
    () => empty,
  );
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
const add = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

export const actions = {
  addToCart: (id: string) => setStore((s) => ({ ...s, cart: add(s.cart, id) })),
  removeFromCart: (id: string) => setStore((s) => ({ ...s, cart: s.cart.filter((x) => x !== id) })),
  addToLibrary: (id: string) => setStore((s) => ({ ...s, purchased: add(s.purchased, id) })),
  checkout: () => setStore((s) => ({ ...s, purchased: [...new Set([...s.purchased, ...s.cart])], cart: [] })),
  toggleWishlist: (id: string) => setStore((s) => ({ ...s, wishlist: toggle(s.wishlist, id) })),
  viewed: (id: string) => setStore((s) => ({ ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12) })),
  addReview: (r: Review) => setStore((s) => ({ ...s, myReviews: [r, ...s.myReviews] })),
  toggleHelpful: (id: string) => setStore((s) => ({ ...s, helpful: toggle(s.helpful, id) })),
};
