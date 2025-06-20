import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import "./grupo.css";

export default function CadastrarAtualizarGrupo() {
  const [nome, setNome] = useState("");
  const [permissoesDisponiveis, setPermissoesDisponiveis] = useState([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState([]);
  const [filtroDisponiveis, setFiltroDisponiveis] = useState("");
  const [filtroSelecionadas, setFiltroSelecionadas] = useState("");
  const [permissoesDisponiveisFiltradas, setPermissoesDisponiveisFiltradas] = useState([]);
  const [permissoesSelecionadasFiltradas, setPermissoesSelecionadasFiltradas] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [carregando, setCarregando] = useState(true);
  
  const navigate = useNavigate();
  const { id } = useParams();

  // Função para extrair permissões do texto fornecido
  const extrairPermissoes = () => {
    // Lista de permissões pré-definidas no formato correto
    const permissoesPredefinidas = [
      { app: "Administração", modelo: "entrada de log", acao: "adicionar" },
      { app: "Administração", modelo: "entrada de log", acao: "atualizar" },
      { app: "Administração", modelo: "entrada de log", acao: "deletar" },
      { app: "Administração", modelo: "entrada de log", acao: "ver" },
      { app: "Autenticação e Autorização", modelo: "grupo", acao: "adicionar" },
      { app: "Autenticação e Autorização", modelo: "grupo", acao: "atualizar" },
      { app: "Autenticação e Autorização", modelo: "grupo", acao: "deletar" },
      { app: "Autenticação e Autorização", modelo: "grupo", acao: "ver" },
      { app: "Autenticação e Autorização", modelo: "permissão", acao: "adicionar" },
      { app: "Autenticação e Autorização", modelo: "permissão", acao: "atualizar" },
      { app: "Autenticação e Autorização", modelo: "permissão", acao: "deletar" },
      { app: "Autenticação e Autorização", modelo: "permissão", acao: "ver" },
      { app: "Token de autenticação", modelo: "Token", acao: "adicionar" },
      { app: "Token de autenticação", modelo: "Token", acao: "atualizar" },
      { app: "Token de autenticação", modelo: "Token", acao: "deletar" },
      { app: "Token de autenticação", modelo: "Token", acao: "ver" },
      { app: "Tipos de Conteúdo", modelo: "tipo de conteúdo", acao: "adicionar" },
      { app: "Tipos de Conteúdo", modelo: "tipo de conteúdo", acao: "atualizar" },
      { app: "Tipos de Conteúdo", modelo: "tipo de conteúdo", acao: "deletar" },
      { app: "Tipos de Conteúdo", modelo: "tipo de conteúdo", acao: "ver" },
      { app: "Sessões", modelo: "sessão", acao: "adicionar" },
      { app: "Sessões", modelo: "sessão", acao: "atualizar" },
      { app: "Sessões", modelo: "sessão", acao: "deletar" },
      { app: "Sessões", modelo: "sessão", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "aluno", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "aluno", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "aluno", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "aluno", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "anexo", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "anexo", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "anexo", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "anexo", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Coordenador", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Coordenador", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Coordenador", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Coordenador", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "CRE", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "CRE", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "CRE", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "CRE", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "curso", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "curso", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "curso", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "curso", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "disciplina", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "disciplina", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "disciplina", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "disciplina", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "disponibilidade", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "disponibilidade", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "disponibilidade", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "disponibilidade", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Formulário de Abono de Faltas", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Abono de Faltas", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Abono de Faltas", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Abono de Faltas", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Formulário de Desistência de Vaga", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Desistência de Vaga", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Desistência de Vaga", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Desistência de Vaga", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Formulário de Dispensa de Educação Física", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Dispensa de Educação Física", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Dispensa de Educação Física", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Dispensa de Educação Física", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Formulário de Atividades Complementares", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Atividades Complementares", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Atividades Complementares", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Atividades Complementares", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Formulário de Exercícios Domiciliares", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Exercícios Domiciliares", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Exercícios Domiciliares", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Exercícios Domiciliares", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Formulário de Trancamento de Componente Curricular", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Trancamento de Componente Curricular", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Trancamento de Componente Curricular", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Trancamento de Componente Curricular", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Formulário de Trancamento de Matrícula", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Trancamento de Matrícula", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Trancamento de Matrícula", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Formulário de Trancamento de Matrícula", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Mandato", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Mandato", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Mandato", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Mandato", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "motivo abono", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "motivo abono", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "motivo abono", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "motivo abono", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "motivo dispensa", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "motivo dispensa", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "motivo dispensa", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "motivo dispensa", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "motivo exercicios", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "motivo exercicios", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "motivo exercicios", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "motivo exercicios", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "nome", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "nome", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "nome", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "nome", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "ppc", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "ppc", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "ppc", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "ppc", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "responsavel", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "responsavel", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "responsavel", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "responsavel", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "solicitacao", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "solicitacao", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "solicitacao", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "solicitacao", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "turma", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "turma", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "turma", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "turma", acao: "ver" },
      { app: "Solicitacoes_App", modelo: "Usuário", acao: "adicionar" },
      { app: "Solicitacoes_App", modelo: "Usuário", acao: "atualizar" },
      { app: "Solicitacoes_App", modelo: "Usuário", acao: "deletar" },
      { app: "Solicitacoes_App", modelo: "Usuário", acao: "ver" }
    ];
    
    // Converter as permissões pré-definidas para o formato necessário
    const permissoesProcessadas = permissoesPredefinidas.map((perm, index) => {
      return {
        id: index + 1,
        name: `Can ${perm.acao === 'adicionar' ? 'add' : 
               perm.acao === 'atualizar' ? 'change' : 
               perm.acao === 'deletar' ? 'delete' : 'view'} ${perm.modelo}`,
        codename: `${perm.acao === 'adicionar' ? 'add' : 
                   perm.acao === 'atualizar' ? 'change' : 
                   perm.acao === 'deletar' ? 'delete' : 'view'}_${perm.modelo.replace(/\s+/g, '_').toLowerCase()}`,
        content_type: {
          app_label: perm.app,
          model: perm.modelo
        },
        descricao: `${perm.app} | ${perm.modelo} | Pode ${perm.acao} ${perm.modelo}`
      };
    });
    
    return permissoesProcessadas;
  };

  // Carregar dados iniciais
  useEffect(() => {
    setCarregando(true);
    
    // Gerar permissões disponíveis a partir do texto
    const todasPermissoes = extrairPermissoes();
    
    // Se estiver editando um grupo existente, carregar seus dados
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/grupos/${id}/`)
        .then((res) => {
          setNome(res.data.name || "");
          
          // Converter IDs de permissão para números, se necessário
          const permissionIds = res.data.permissions || [];
          const idsPermissoesSelecionadas = permissionIds.map(id => typeof id === 'string' ? parseInt(id) : id);
          
          // Separar permissões em disponíveis e selecionadas
          const permissoesSelecionadas = todasPermissoes.filter(perm => idsPermissoesSelecionadas.includes(perm.id));
          const permissoesDisponiveis = todasPermissoes.filter(perm => !idsPermissoesSelecionadas.includes(perm.id));
          
          setPermissoesSelecionadas(permissoesSelecionadas);
          setPermissoesDisponiveis(permissoesDisponiveis);
          setPermissoesDisponiveisFiltradas(permissoesDisponiveis);
          setPermissoesSelecionadasFiltradas(permissoesSelecionadas);
          
          setCarregando(false);
        })
        .catch((err) => {
          console.error("Erro ao carregar grupo:", err);
          setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar grupo."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
          setCarregando(false);
        });
    } else {
      // Caso de criação de novo grupo
      setPermissoesDisponiveis(todasPermissoes);
      setPermissoesDisponiveisFiltradas(todasPermissoes);
      setPermissoesSelecionadas([]);
      setPermissoesSelecionadasFiltradas([]);
      setCarregando(false);
    }
  }, [id]);

  // Filtrar permissões disponíveis
  useEffect(() => {
    if (filtroDisponiveis) {
      const termoLowerCase = filtroDisponiveis.toLowerCase();
      const filtradas = permissoesDisponiveis.filter(
        perm => 
          perm.descricao.toLowerCase().includes(termoLowerCase) || 
          perm.content_type.model.toLowerCase().includes(termoLowerCase) ||
          perm.content_type.app_label.toLowerCase().includes(termoLowerCase)
      );
      setPermissoesDisponiveisFiltradas(filtradas);
    } else {
      setPermissoesDisponiveisFiltradas(permissoesDisponiveis);
    }
  }, [filtroDisponiveis, permissoesDisponiveis]);

  // Filtrar permissões selecionadas
  useEffect(() => {
    if (filtroSelecionadas) {
      const termoLowerCase = filtroSelecionadas.toLowerCase();
      const filtradas = permissoesSelecionadas.filter(
        perm => 
          perm.descricao.toLowerCase().includes(termoLowerCase) || 
          perm.content_type.model.toLowerCase().includes(termoLowerCase) ||
          perm.content_type.app_label.toLowerCase().includes(termoLowerCase)
      );
      setPermissoesSelecionadasFiltradas(filtradas);
    } else {
      setPermissoesSelecionadasFiltradas(permissoesSelecionadas);
    }
  }, [filtroSelecionadas, permissoesSelecionadas]);

  // Mover permissão de disponíveis para selecionadas
  const moverParaSelecionadas = (permissao) => {
    setPermissoesDisponiveis(prev => prev.filter(p => p.id !== permissao.id));
    setPermissoesSelecionadas(prev => [...prev, permissao]);
  };

  // Mover permissão de selecionadas para disponíveis
  const moverParaDisponiveis = (permissao) => {
    setPermissoesSelecionadas(prev => prev.filter(p => p.id !== permissao.id));
    setPermissoesDisponiveis(prev => [...prev, permissao]);
  };

  // Mover todas as permissões filtradas para selecionadas
  const moverTodasParaSelecionadas = () => {
    setPermissoesSelecionadas(prev => [...prev, ...permissoesDisponiveisFiltradas]);
    setPermissoesDisponiveis(prev => prev.filter(p => !permissoesDisponiveisFiltradas.some(fp => fp.id === p.id)));
  };

  // Mover todas as permissões filtradas para disponíveis
  const moverTodasParaDisponiveis = () => {
    setPermissoesDisponiveis(prev => [...prev, ...permissoesSelecionadasFiltradas]);
    setPermissoesSelecionadas(prev => prev.filter(p => !permissoesSelecionadasFiltradas.some(fp => fp.id === p.id)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dados = { 
      name: nome,
      permissions: permissoesSelecionadas.map(p => p.id)
    };

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/grupos/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/grupos/", dados);

    requisicao
      .then(() => {
        setMensagem(id ? "Grupo atualizado com sucesso!" : "Grupo cadastrado com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar grupo."}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  if (carregando) {
    return (
      <div>
        <main className="container form-container">
          <h2>Carregando...</h2>
        </main>
      </div>
    );
  }

  return (
    <div>
      <main className="container form-container">
        <h2>{id ? "Editar Grupo" : "Cadastrar Novo Grupo"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group label-reduced">
            <label>Nome:</label>
            <input
              type="text"
              className="input-area"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group permissoes-section">
            <label>Permissões:</label>
            
            <div className="dual-list-container">
              {/* Coluna de permissões disponíveis */}
              <div className="dual-list-column">
                <h3>Permissões disponíveis</h3>
                <div className="permissoes-filtro">
                  <input
                    type="text"
                    className="input-area"
                    placeholder="Filtrar permissões disponíveis..."
                    value={filtroDisponiveis}
                    onChange={(e) => setFiltroDisponiveis(e.target.value)}
                  />
                </div>
                
                <div className="permissoes-lista">
                  {permissoesDisponiveisFiltradas.length === 0 ? (
                    <p>Nenhuma permissão disponível com os filtros atuais.</p>
                  ) : (
                    permissoesDisponiveisFiltradas.map(permissao => (
                      <div key={permissao.id} className="permissao-item">
                        <span className="permissao-texto">{permissao.descricao}</span>
                        <button 
                          type="button" 
                          className="btn-mover"
                          onClick={() => moverParaSelecionadas(permissao)}
                        >
                          &gt;
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="permissoes-acoes">
                  <button 
                    type="button" 
                    className="btn-mover-todas"
                    onClick={moverTodasParaSelecionadas}
                    disabled={permissoesDisponiveisFiltradas.length === 0}
                  >
                    Adicionar todas &gt;&gt;
                  </button>
                </div>
                
                <div className="permissoes-contador">
                  {permissoesDisponiveis.length} permissões disponíveis
                </div>
              </div>
              
              {/* Coluna de permissões selecionadas */}
              <div className="dual-list-column">
                <h3>Permissões concedidas</h3>
                <div className="permissoes-filtro">
                  <input
                    type="text"
                    className="input-area"
                    placeholder="Filtrar permissões escolhidas..."
                    value={filtroSelecionadas}
                    onChange={(e) => setFiltroSelecionadas(e.target.value)}
                  />
                </div>
                
                <div className="permissoes-lista">
                  {permissoesSelecionadasFiltradas.length === 0 ? (
                    <p>Nenhuma permissão escolhida com os filtros atuais.</p>
                  ) : (
                    permissoesSelecionadasFiltradas.map(permissao => (
                      <div key={permissao.id} className="permissao-item">
                        <button 
                          type="button" 
                          className="btn-mover"
                          onClick={() => moverParaDisponiveis(permissao)}
                        >
                          &lt;
                        </button>
                        <span className="permissao-texto">{permissao.descricao}</span>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="permissoes-acoes">
                  <button 
                    type="button" 
                    className="btn-mover-todas"
                    onClick={moverTodasParaDisponiveis}
                    disabled={permissoesSelecionadasFiltradas.length === 0}
                  >
                    &lt;&lt; Remover todas
                  </button>
                </div>
                
                <div className="permissoes-contador">
                  {permissoesSelecionadas.length} permissões escolhidas
                </div>
              </div>
            </div>
          </div>
          
          <button type="submit" className="submit-button reduced">
            {id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => {
            setShowFeedback(false);
            navigate("/grupos");
          }}
        />
      </main>
    </div>
  );
}
