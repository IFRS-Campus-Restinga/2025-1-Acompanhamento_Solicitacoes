import Cruds from './cruds';

export default function Configuracoes() {
  // Aqui você pode usar lógica de permissão (ex: checar se é CRE)
  const usuarioEhCRE = true; // Mude para seu controle real

  return (
    <div>
      {usuarioEhCRE ? <Cruds /> : <p>Você não tem permissão para ver os CRUDs.</p>}
    </div>
  );
}
