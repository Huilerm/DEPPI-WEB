"use client";

import { useSessao } from "../../components/layout/SessaoContext";
import { InicioAdmin } from "./InicioAdmin";
import { InicioAluno } from "./InicioAluno";
import { InicioDeppi } from "./InicioDeppi";
import { InicioProfessor } from "./InicioProfessor";

export function InicioPage() {
  const { usuario, papel } = useSessao();

  switch (papel) {
    case "ADMIN":
      return <InicioAdmin usuario={usuario} />;
    case "DEPPI":
      return <InicioDeppi usuario={usuario} />;
    case "PROFESSOR":
      return <InicioProfessor usuario={usuario} />;
    case "ALUNO":
      return <InicioAluno usuario={usuario} />;
  }
}
