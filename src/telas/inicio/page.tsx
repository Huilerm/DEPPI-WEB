"use client";

import { useSessao } from "../../components/layout/SessaoContext"; //Decide qual tela mostrar de acordo com o usuário logado.
import { InicioAdmin } from "./admin/page";
import { InicioAluno } from "./aluno/page";
import { InicioDeppi } from "./deppi/page";
import { InicioProfessor } from "./professor/page";

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
