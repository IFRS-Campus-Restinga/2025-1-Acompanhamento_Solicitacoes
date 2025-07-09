// // components/ProtectedRoute.js
// // Componente para proteger rotas baseado em permissões

// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { getUserRole } from '../utils/permissions';

// /**
//  * Componente para proteger rotas baseado em roles de usuário
//  * @param {Object} props - Propriedades do componente
//  * @param {Array<string>} props.allowedRoles - Roles permitidas para acessar a rota
//  * @param {React.ReactNode} props.children - Componente filho a ser renderizado se autorizado
//  * @param {string} props.redirectTo - Rota para redirecionamento se não autorizado (padrão: '/')
//  * @returns {React.ReactNode}
//  */
// const ProtectedRoute = ({ 
//     allowedRoles, 
//     children, 
//     redirectTo = '/' 
// }) => {
//     const userRole = getUserRole();
//     const location = useLocation();
    
//     // Verifica se o usuário tem permissão para acessar a rota
//     const hasPermission = allowedRoles.includes(userRole);
    
//     if (!hasPermission) {
//         // Salva a localização atual para redirecionamento após login (se necessário)
//         return (
//             <Navigate 
//                 to={redirectTo} 
//                 state={{ from: location }} 
//                 replace 
//             />
//         );
//     }
    
//     return children;
// };

// /**
//  * Componente para rotas que requerem autenticação
//  * @param {Object} props - Propriedades do componente
//  * @param {React.ReactNode} props.children - Componente filho a ser renderizado se autenticado
//  * @param {string} props.redirectTo - Rota para redirecionamento se não autenticado (padrão: '/')
//  * @returns {React.ReactNode}
//  */
// export const AuthenticatedRoute = ({ 
//     children, 
//     redirectTo = '/' 
// }) => {
//     const userRole = getUserRole();
//     const location = useLocation();
    
//     // Verifica se o usuário está autenticado (não é 'public')
//     const isAuthenticated = userRole !== 'public';
    
//     if (!isAuthenticated) {
//         return (
//             <Navigate 
//                 to={redirectTo} 
//                 state={{ from: location }} 
//                 replace 
//             />
//         );
//     }
    
//     return children;
// };

// /**
//  * Componente para rotas específicas do CRE
//  * @param {Object} props - Propriedades do componente
//  * @param {React.ReactNode} props.children - Componente filho a ser renderizado
//  * @returns {React.ReactNode}
//  */
// export const CRERoute = ({ children }) => {
//     return (
//         <ProtectedRoute allowedRoles={['cre']}>
//             {children}
//         </ProtectedRoute>
//     );
// };

// /**
//  * Componente para rotas específicas do Coordenador
//  * @param {Object} props - Propriedades do componente
//  * @param {React.ReactNode} props.children - Componente filho a ser renderizado
//  * @returns {React.ReactNode}
//  */
// export const CoordenadorRoute = ({ children }) => {
//     return (
//         <ProtectedRoute allowedRoles={['coordenador']}>
//             {children}
//         </ProtectedRoute>
//     );
// };

// /**
//  * Componente para rotas específicas do Aluno
//  * @param {Object} props - Propriedades do componente
//  * @param {React.ReactNode} props.children - Componente filho a ser renderizado
//  * @returns {React.ReactNode}
//  */
// export const AlunoRoute = ({ children }) => {
//     return (
//         <ProtectedRoute allowedRoles={['aluno', 'responsavel']}>
//             {children}
//         </ProtectedRoute>
//     );
// };

// /**
//  * Componente para rotas específicas do Externo
//  * @param {Object} props - Propriedades do componente
//  * @param {React.ReactNode} props.children - Componente filho a ser renderizado
//  * @returns {React.ReactNode}
//  */
// export const ExternoRoute = ({ children }) => {
//     return (
//         <ProtectedRoute allowedRoles={['externo']}>
//             {children}
//         </ProtectedRoute>
//     );
// };

// /**
//  * Componente para rotas que permitem gerenciamento (CRE e Coordenador)
//  * @param {Object} props - Propriedades do componente
//  * @param {React.ReactNode} props.children - Componente filho a ser renderizado
//  * @returns {React.ReactNode}
//  */
// export const ManagementRoute = ({ children }) => {
//     return (
//         <ProtectedRoute allowedRoles={['cre', 'coordenador']}>
//             {children}
//         </ProtectedRoute>
//     );
// };

// /**
//  * Componente para rotas que permitem submissão de formulários
//  * @param {Object} props - Propriedades do componente
//  * @param {React.ReactNode} props.children - Componente filho a ser renderizado
//  * @returns {React.ReactNode}
//  */
// export const FormSubmissionRoute = ({ children }) => {
//     return (
//         <ProtectedRoute allowedRoles={['aluno', 'responsavel', 'externo']}>
//             {children}
//         </ProtectedRoute>
//     );
// };

// export default ProtectedRoute;

