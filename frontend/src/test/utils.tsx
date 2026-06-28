import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ui/Toast";

function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ToastProvider>{children}</ToastProvider>
    </CartProvider>
  );
}

/** Render wrapped in the app's client providers, with a userEvent instance. */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Providers, ...options }),
  };
}

export * from "@testing-library/react";
