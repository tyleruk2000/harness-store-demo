"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { KeyRound, Lock } from "lucide-react";

import { AddProductForm } from "@/components/admin/AddProductForm";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { DemoAdminWarning } from "@/components/admin/DemoAdminWarning";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { api, ApiError } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/constants";
import type { Product } from "@/types/product";

export default function AdminPage() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Restore a previously verified passcode for this tab session.
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.adminPasscode);
    if (saved) setPasscode(saved);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="container-page py-10">
        <Skeleton className="mx-auto h-72 w-full max-w-md" />
      </div>
    );
  }

  if (!passcode) {
    return <PasscodeGate onUnlock={setPasscode} />;
  }

  return <AdminDashboard passcode={passcode} onLock={() => {
    sessionStorage.removeItem(STORAGE_KEYS.adminPasscode);
    setPasscode(null);
  }} />;
}

function PasscodeGate({ onUnlock }: { onUnlock: (passcode: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setChecking(true);
    try {
      await api.verifyAdmin(value);
      sessionStorage.setItem(STORAGE_KEYS.adminPasscode, value);
      onUnlock(value);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "That passcode didn't work." : "Couldn't verify — is the backend running?");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-100 text-primary-700">
            <Lock className="size-7" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink-strong">Admin access</h1>
          <p className="mt-1 text-sm text-muted">Enter the demo admin passcode to manage the catalogue.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
          <Field label="Admin passcode" htmlFor="passcode" error={error ?? undefined}>
            <Input
              id="passcode"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              invalid={!!error}
              autoFocus
              placeholder="••••••••"
            />
          </Field>
          <Button type="submit" loading={checking} className="w-full">
            <KeyRound className="size-4" aria-hidden /> Unlock admin
          </Button>
          <p className="text-center text-xs text-muted">
            Default passcode for this demo is <code className="font-mono text-ink">belay-on</code>.
          </p>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard({ passcode, onLock }: { passcode: string; onLock: () => void }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      setProducts(await api.listProducts());
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function upsert(product: Product) {
    setProducts((prev) => {
      if (!prev) return [product];
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx === -1) return [product, ...prev];
      const next = [...prev];
      next[idx] = product;
      return next;
    });
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-strong sm:text-4xl">Admin</h1>
          <p className="mt-1 text-muted">Add gear and manage the catalogue.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLock}>Lock admin</Button>
      </div>

      <div className="mb-6">
        <DemoAdminWarning />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
        <AddProductForm passcode={passcode} onCreated={upsert} />

        {failed ? (
          <ErrorState description="Couldn't load the catalogue." onRetry={load} />
        ) : products ? (
          <AdminProductTable products={products} passcode={passcode} onUpdated={upsert} />
        ) : (
          <Skeleton className="h-96 w-full" />
        )}
      </div>
    </div>
  );
}
