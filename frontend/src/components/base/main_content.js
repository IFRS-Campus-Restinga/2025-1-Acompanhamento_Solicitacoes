// Não é necessário importar "./main.css" aqui diretamente
// pois ele já deve ser importado em App.js (ou App.css) para que as regras sejam globais.

const MainContent = ({ children }) => { // Recebe 'children' como prop
  return (
    <main> {/* Removemos o className="container" daqui */}
      {/* Esta div é crucial para aplicar o max-width e padding ao conteúdo */}
      <div className="main-content-wrapper">
        {children} {/* Aqui é onde o conteúdo das suas rotas será renderizado */}
      </div>
    </main>
  );
};

export default MainContent;