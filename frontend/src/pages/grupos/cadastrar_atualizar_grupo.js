import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import "./grupo.css";

export default function CadastrarAtualizarGrupo() {
  const [nome, setNome] = useState("");
  const [permissoes, setPermissoes] = useState([]);
  const [permissoesDisponiveis, setPermissoesDisponiveis] = useState([]);
  const [permissoesFiltradas, setPermissoesFiltradas] = useState([]);
  const [filtroPermissao, setFiltroPermissao] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [carregando, setCarregando] = useState(true);
  
  const navigate = useNavigate();
  const { id } = useParams();

  // Função para extrair permissões do texto fornecido com uma lógica completamente reescrita
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
    setPermissoesDisponiveis(todasPermissoes);
    setPermissoesFiltradas(todasPermissoes);
    
    // Se estiver editando um grupo existente, carregar seus dados
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/grupos/${id}/`)
        .then((res) => {
          setNome(res.data.name || "");
          // Converter IDs de permissão para números, se necessário
          const permissionIds = res.data.permissions || [];
          setPermissoes(permissionIds.map(id => typeof id === 'string' ? parseInt(id) : id));
          setCarregando(false);
        })
        .catch((err) => {
          console.error("Erro ao carregar grupo:", err);
          setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar grupo."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
          setCarregando(false);
        });
    } else {
      setCarregando(false);
    }
  }, [id]);

  // Filtrar permissões por texto
  useEffect(() => {
    let permissoesFiltradas = permissoesDisponiveis;
    
    // Filtrar por texto
    if (filtroPermissao) {
      const termoLowerCase = filtroPermissao.toLowerCase();
      permissoesFiltradas = permissoesFiltradas.filter(
        perm => 
          perm.descricao.toLowerCase().includes(termoLowerCase) || 
          perm.content_type.model.toLowerCase().includes(termoLowerCase) ||
          perm.content_type.app_label.toLowerCase().includes(termoLowerCase)
      );
    }
    
    setPermissoesFiltradas(permissoesFiltradas);
  }, [filtroPermissao, permissoesDisponiveis]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dados = { 
      name: nome,
      permissions: permissoes 
    };

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/grupos/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/grupos/", dados);

    requisicao
      .then(() => {
        setMensagemPopup(id ? "Grupo atualizado com sucesso!" : "Grupo cadastrado com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar grupo."}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  const handlePermissaoChange = (permissaoId) => {
    setPermissoes(prevPermissoes => {
      if (prevPermissoes.includes(permissaoId)) {
        return prevPermissoes.filter(id => id !== permissaoId);
      } else {
        return [...prevPermissoes, permissaoId];
      }
    });
  };

  const selecionarTodasPermissoes = () => {
    setPermissoes(permissoesFiltradas.map(perm => perm.id));
  };

  const limparTodasPermissoes = () => {
    if (!filtroPermissao) {
      setPermissoes([]);
    } else {
      const idsPermissoesFiltradas = permissoesFiltradas.map(perm => perm.id);
      setPermissoes(prevPermissoes => 
        prevPermissoes.filter(id => !idsPermissoesFiltradas.includes(id))
      );
    }
  };

  if (carregando) {
    return (
      <div>
        <HeaderCRE />
        <main className="container form-container">
          <h2>Carregando...</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <HeaderCRE />
      <main className="container form-container">
        <h2>{id ? "Editar Grupo" : "Cadastrar Novo Grupo"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
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
            
            <div className="permissoes-filtro">
              <input
                type="text"
                className="input-area"
                placeholder="Filtrar permissões..."
                value={filtroPermissao}
                onChange={(e) => setFiltroPermissao(e.target.value)}
              />
              
              <div className="permissoes-acoes">
                <button 
                  type="button" 
                  className="btn-selecionar-todas"
                  onClick={selecionarTodasPermissoes}
                >
                  Selecionar Todas
                </button>
                <button 
                  type="button" 
                  className="btn-limpar-todas"
                  onClick={limparTodasPermissoes}
                >
                  Limpar Seleção
                </button>
              </div>
            </div>
            
            <div className="permissoes-lista">
              {permissoesFiltradas.length === 0 ? (
                <p>Nenhuma permissão encontrada com os filtros atuais.</p>
              ) : (
                permissoesFiltradas.map(permissao => (
                  <div key={permissao.id} className="permissao-item">
                    <input
                      type="checkbox"
                      id={`perm-${permissao.id}`}
                      checked={permissoes.includes(permissao.id)}
                      onChange={() => handlePermissaoChange(permissao.id)}
                    />
                    <label htmlFor={`perm-${permissao.id}`}>
                      {permissao.descricao}
                    </label>
                  </div>
                ))
              )}
            </div>
            
            <div className="permissoes-contador">
              {permissoes.length} permissões selecionadas de {permissoesDisponiveis.length} disponíveis
            </div>
          </div>

          <button type="submit" className="submit-button">
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
      <Footer />
    </div>
  );
}
