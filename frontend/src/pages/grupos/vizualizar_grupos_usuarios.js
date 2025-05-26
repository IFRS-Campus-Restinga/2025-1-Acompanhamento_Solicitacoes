import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './lista_grupos_usuarios.css';

export default function VisualizarUsuariosGrupoModal({ show, onClose, grupo }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

const USER_DETAIL_ENDPOINT = '/solicitacoes/usuarios/'; // Endpoint confirmado pelo usuário


  useEffect(() => {
    if (show && grupo && grupo.id) {
      setCarregando(true);
      setErro(null);
      setUsuarios([]);
      setUsuariosFiltrados([]);
      setFiltro('');

      // 1. Buscar detalhes do grupo para obter a lista de IDs de usuários
      axios.get(`http://localhost:8000/solicitacoes/grupos/${grupo.id}/`)
        .then(response => {
          const userIds = response.data.user_set || []; // Assumindo que o campo é 'user_set'
          
          if (userIds.length === 0) {
            setCarregando(false);
            return;
          }

          // 2. Criar promessas para buscar detalhes de cada usuário
          // !!! VERIFIQUE SE O ENDPOINT USER_DETAIL_ENDPOINT ESTÁ CORRETO !!!
          const userPromises = userIds.map(userId => 
            axios.get(`http://localhost:8000${USER_DETAIL_ENDPOINT}${userId}/`)
              .then(res => res.data) // Retorna os dados do usuário
              .catch(err => {
                console.error(`Erro ao buscar usuário ${userId}:`, err);
                return null; // Retorna null se houver erro ao buscar um usuário específico
              })
          );

          // 3. Executar todas as promessas em paralelo
          Promise.all(userPromises)
            .then(userDataArray => {
              // Filtra usuários que não puderam ser carregados (null)
              const loadedUsers = userDataArray.filter(user => user !== null);
              setUsuarios(loadedUsers);
              setUsuariosFiltrados(loadedUsers);
              setCarregando(false);
            })
            .catch(error => {
              console.error('Erro ao buscar detalhes dos usuários:', error);
              setErro('Não foi possível carregar os detalhes dos usuários.');
              setCarregando(false);
            });
        })
        .catch(err => {
          console.error('Erro ao buscar detalhes do grupo:', err);
          setErro('Não foi possível carregar os dados do grupo.');
          setCarregando(false);
        });
    }
  }, [show, grupo]);

  // Filtrar usuários com base no input de busca
  useEffect(() => {
    if (filtro) {
      const termoLowerCase = filtro.toLowerCase();
      const filtrados = usuarios.filter(user => 
        (user.first_name && user.first_name.toLowerCase().includes(termoLowerCase)) ||
        (user.last_name && user.last_name.toLowerCase().includes(termoLowerCase)) ||
        (user.email && user.email.toLowerCase().includes(termoLowerCase))
        // Adicione a busca pelo 'papel' se o serializer o retornar diretamente
        // (user.papel && user.papel.toLowerCase().includes(termoLowerCase))
      );
      setUsuariosFiltrados(filtrados);
    } else {
      setUsuariosFiltrados(usuarios);
    }
  }, [filtro, usuarios]);

  // Função para obter o papel do usuário (ajuste conforme a estrutura do seu UserSerializer)
  const getPapelUsuario = (user) => {
    // Exemplo: Adapte esta lógica baseada em como o 'papel' é representado no seu UserSerializer
    if (user.is_superuser) return 'Admin';
    if (user.groups && user.groups.includes('CRE')) return 'CRE'; // Supondo que 'groups' seja uma lista de nomes
    if (user.groups && user.groups.includes('Coordenador')) return 'Coordenador';
    if (user.tipo_usuario === 'aluno') return 'Aluno'; // Supondo um campo 'tipo_usuario'
    return 'Usuário'; // Padrão
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Usuários do Grupo: {grupo?.name || '...'}</h2>
        
        <div className="modal-search">
          <input 
            type="text"
            placeholder="Buscar usuário por nome ou email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-area"
          />
        </div>

        <div className="modal-body">
          {carregando && <p>Carregando usuários...</p>}
          {erro && <p className="error-message">{erro}</p>}
          {!carregando && !erro && (
            usuariosFiltrados.length === 0 ? (
              <p>{usuarios.length === 0 ? 'Nenhum usuário pertence a este grupo.' : 'Nenhum usuário encontrado com o filtro atual.'}</p>
            ) : (
              <ul className="user-list">
                {usuariosFiltrados.map(user => (
                  <li key={user.id} className="user-list-item">
                    <span className="user-name">{user.first_name || ''} {user.last_name || ''}</span>
                    <span className="user-email">{user.email}</span>
                    <span className="user-role">{getPapelUsuario(user)}</span> 
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-button">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
