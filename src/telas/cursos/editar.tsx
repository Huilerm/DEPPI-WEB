"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Curso } from "../../types";
import { buscarCurso } from "../../lib/api";
import { AVISO_ERRO, PAGINA } from "../../components/ui/estilos";
import { FormularioCurso } from "./formulario";

export function EditarCursoPage() {
  const { id } = useParams<{ id: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => { buscarCurso(id).then(setCurso).catch((e: Error) => setErro(e.message)); }, [id]);
  if (erro) return <div className={PAGINA}><div className={AVISO_ERRO}>{erro}</div></div>;
  if (!curso) return <div className={PAGINA}><p>Carregando…</p></div>;
  return <FormularioCurso curso={curso} />;
}
