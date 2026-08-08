"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
    

const router = useRouter();

const [email, setEmail] = useState("");

const [password, setPassword] =
  useState("");

const [loading, setLoading] =
  useState(false);

const [error, setError] =
  useState("");

async function handleSubmit(
  e: React.FormEvent
) {
  e.preventDefault();

  try {
    setLoading(true);
    setError("");

    await signIn(email, password);

    const {
  data: { session },
} = await supabase.auth.getSession();

console.log("SESSION AFTER LOGIN:", session);

const {
  data: { user },
} = await supabase.auth.getUser();

console.log("USER AFTER LOGIN:", user);

    router.push("/admin");
  } catch {
    setError(
      "Correo o contraseña incorrectos."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FDFBF8] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#E7DCC8] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
  <Image
    src="/me-logo.png"
    alt="MelissArte Photos"
    width={220}
    height={80}
    className="mx-auto h-auto w-[180px]"
  />

  <p className="mt-1 text-sm text-[#7D7467]">
    Inicia sesión para administrar tus galerías.
  </p>
</div>

        <form
  onSubmit={handleSubmit}
  className="space-y-5"
>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#5C554B]">
              Correo electrónico
            </label>

            <input
  type="email"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
  className="w-full rounded-xl border border-[#E7DCC8] px-4 py-3 outline-none transition-colors focus:border-[#B08D57]"
  required
/>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5C554B]">
              Contraseña
            </label>

            <input
  type="password"
  value={password}
  onChange={(e) =>
    setPassword(e.target.value)
  }
  className="w-full rounded-xl border border-[#E7DCC8] px-4 py-3 outline-none transition-colors focus:border-[#B08D57]"
  required
/>
          </div>

          <button
  type="submit"
  disabled={loading}
  className="w-full rounded-full bg-[#A88249] px-5 py-3 font-medium text-white transition hover:bg-[#977640] disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading
    ? "Iniciando sesión..."
    : "Iniciar sesión"}
</button>

{error && (
  <p className="text-sm text-red-600">
    {error}
  </p>
)}

        </form>
      </div>
    </main>
  );
}