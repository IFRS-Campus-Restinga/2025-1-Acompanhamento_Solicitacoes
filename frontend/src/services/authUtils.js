// AuthUtils.js - Funções utilitárias para autenticação

/**
 * Define um cookie com opções de segurança
 * @param {string} name - Nome do cookie
 * @param {string} value - Valor do cookie
 * @param {number} expiryMinutes - Tempo de expiração em minutos (padrão: 60)
 * @param {string} path - Caminho do cookie (padrão: '/')
 */
export const setCookie = (name, value, expiryMinutes = 60, path = '/') => {
  // Calcula a data de expiração
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (expiryMinutes * 60 * 1000));
  
  // Configura as opções de segurança do cookie
  const cookieOptions = [
    `${name}=${encodeURIComponent(value)}`,
    `expires=${expiryDate.toUTCString()}`,
    `path=${path}`,
    'SameSite=Strict', // Protege contra ataques CSRF
    'Secure'           // Garante que o cookie só seja enviado via HTTPS
  ];
  
  // Define o cookie
  document.cookie = cookieOptions.join('; ');
};

/**
 * Obtém o valor de um cookie pelo nome
 * @param {string} name - Nome do cookie
 * @returns {string|null} - Valor do cookie ou null se não encontrado
 */
export const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

/**
 * Remove um cookie
 * @param {string} name - Nome do cookie
 * @param {string} path - Caminho do cookie (padrão: '/')
 */
export const removeCookie = (name, path = '/') => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Strict; Secure`;
};

/**
 * Obtém o token de autenticação
 * @returns {string|null} - Token de autenticação ou null se não encontrado
 */
export const getAuthToken = () => {
  return getCookie('appToken');
};

/**
 * Obtém os dados do usuário Google
 * @returns {Object|null} - Dados do usuário ou null se não encontrado
 */
export const getGoogleUser = () => {
  const userStr = getCookie('googleUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Erro ao analisar dados do usuário Google:', e);
      return null;
    }
  }
  return null;
};

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} - true se autenticado, false caso contrário
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Realiza logout removendo os cookies de autenticação
 */
export const logout = () => {
  removeCookie('appToken');
  removeCookie('googleUser');
};
