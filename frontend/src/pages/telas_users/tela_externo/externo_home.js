import React from 'react';
// Importe o componente usando o NOME EXATO que ele é exportado por default.
// Ou seja: FormularioDispensaEdFisica, não FormularioDesistenciaVaga.
import FormularioDispensaEdFisica from '../../forms/desistencia_vaga/formulario_desistencia_vaga'; 

const ExternoHome = () => {
  return (
    <main className="container">
      
      {/* Aqui você renderiza o componente importado com o nome correto. */}
      <FormularioDispensaEdFisica />
      
    </main>
  );
};

export default ExternoHome;