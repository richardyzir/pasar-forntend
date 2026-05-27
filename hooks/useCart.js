import { useState, useEffect, useCallback } from "react";

const CART_KEY = "pasar_cart";

// Singleton pattern - state dibagi ke semua komponen
let globalItems = [];
let listeners = [];

function notifyListeners() {
  listeners.forEach((fn) => fn(globalItems));
}

export function useCart() {
  const [items, setItems] = useState(globalItems);

  // Daftarin listener
  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((fn) => fn !== setItems);
    };
  }, []);

  // Load dari localStorage sekali
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        globalItems = JSON.parse(saved).map((item) => ({
          ...item,
          price: Number(item.price),
        }));
        notifyListeners();
      }
    } catch (e) {}
  }, []);

  const addItem = useCallback((product, qty = 1) => {
    const existing = globalItems.find((item) => item.id === product.id);

    if (existing) {
      globalItems = globalItems.map((item) =>
        item.id === product.id ? { ...item, qty: item.qty + qty } : item,
      );
    } else {
      globalItems = [
        ...globalItems,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          stock: product.stock,
          qty,
        },
      ];
    }

    localStorage.setItem(CART_KEY, JSON.stringify(globalItems));
    notifyListeners();
  }, []);

  const removeItem = useCallback((productId) => {
    globalItems = globalItems.filter((item) => item.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(globalItems));
    notifyListeners();
  }, []);

  const updateQty = useCallback(
    (productId, qty) => {
      if (qty <= 0) {
        removeItem(productId);
        return;
      }
      globalItems = globalItems.map((item) =>
        item.id === productId ? { ...item, qty } : item,
      );
      localStorage.setItem(CART_KEY, JSON.stringify(globalItems));
      notifyListeners();
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    globalItems = [];
    localStorage.removeItem(CART_KEY);
    notifyListeners();
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    items,
    total,
    totalItems,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  };
}
