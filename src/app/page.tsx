"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { lerToken } from "../lib/sessao";

export default function Raiz() {
  const router = useRouter();
  useEffect(() => {
    router.replace(lerToken() ? "/inicio" : "/login");
  }, [router]);
  return null;
}
