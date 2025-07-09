// components/PermissionWrapper.js
// Componente wrapper para controlar a exibição de elementos baseado em permissões

import React from 'react';
import { getUserRole, canAccessForm, getAccessDeniedMessage } from '../utils/permissions';

/**
 * Wrapper para controlar acesso a formulários baseado em permissões
 * @param {Object} props - Propriedades do componente
 * @param {string} props.formType - Tipo do formulário a ser verificado
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {boolean} props.showMessage - Se deve mostrar mensagem de acesso negado (padrão: true)
 * @param {string} props.fallback - Componente alternativo para renderizar quando não tem permissão
 * @returns {React.ReactNode}
 */
export const FormPermissionWrapper = ({ 
    formType, 
    children, 
    showMessage = true, 
    fallback = null 
}) => {
    const hasPermission = canAccessForm(formType);
    
    if (!hasPermission) {
        if (fallback) {
            return fallback;
        }
        
        if (showMessage) {
            return (
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Acesso Restrito</h4>
                    <p>{getAccessDeniedMessage(formType)}</p>
                    <hr />
                    <p className="mb-0">
                        Entre em contato com a administração se você acredita que deveria ter acesso a este formulário.
                    </p>
                </div>
            );
        }
        
        return null;
    }
    
    return children;
};

/**
 * Wrapper genérico para controlar acesso baseado em roles
 * @param {Object} props - Propriedades do componente
 * @param {Array<string>} props.allowedRoles - Roles permitidas
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {boolean} props.showMessage - Se deve mostrar mensagem de acesso negado (padrão: false)
 * @param {string} props.fallback - Componente alternativo para renderizar quando não tem permissão
 * @returns {React.ReactNode}
 */
export const RolePermissionWrapper = ({ 
    allowedRoles, 
    children, 
    showMessage = false, 
    fallback = null 
}) => {
    const userRole = getUserRole();
    const hasPermission = allowedRoles.includes(userRole);
    
    if (!hasPermission) {
        if (fallback) {
            return fallback;
        }
        
        if (showMessage) {
            return (
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Acesso Restrito</h4>
                    <p>Você não tem permissão para acessar este conteúdo.</p>
                </div>
            );
        }
        
        return null;
    }
    
    return children;
};

/**
 * Componente para desabilitar elementos baseado em permissões
 * @param {Object} props - Propriedades do componente
 * @param {string} props.formType - Tipo do formulário a ser verificado
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {string} props.disabledMessage - Mensagem a ser exibida quando desabilitado
 * @returns {React.ReactNode}
 */
export const DisableableFormWrapper = ({ 
    formType, 
    children, 
    disabledMessage = "Este formulário não está disponível para seu tipo de usuário" 
}) => {
    const hasPermission = canAccessForm(formType);
    
    if (!hasPermission) {
        return (
            <div className="position-relative">
                {/* Overlay para desabilitar interação */}
                <div 
                    className="position-absolute w-100 h-100" 
                    style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                        zIndex: 10,
                        cursor: 'not-allowed'
                    }}
                    title={disabledMessage}
                />
                {/* Conteúdo desabilitado */}
                <div style={{ pointerEvents: 'none', opacity: 0.5 }}>
                    {children}
                </div>
                {/* Mensagem de aviso */}
                <div className="alert alert-info mt-2" role="alert">
                    <small>
                        <i className="bi bi-info-circle me-1"></i>
                        {disabledMessage}
                    </small>
                </div>
            </div>
        );
    }
    
    return children;
};

/**
 * Hook personalizado para verificar permissões
 * @param {string} formType - Tipo do formulário
 * @returns {Object} - Objeto com informações de permissão
 */
export const useFormPermission = (formType) => {
    const userRole = getUserRole();
    const hasPermission = canAccessForm(formType);
    const message = getAccessDeniedMessage(formType);
    
    return {
        userRole,
        hasPermission,
        message,
        shouldDisable: !hasPermission
    };
};

/**
 * Componente para mostrar informações de debug sobre permissões (apenas em desenvolvimento)
 * @returns {React.ReactNode}
 */
export const PermissionDebugInfo = () => {
    const userRole = getUserRole();
    
    // Só mostra em desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    
    return (
        <div className="alert alert-secondary mt-3" role="alert">
            <h6>Debug - Informações de Permissão</h6>
            <p className="mb-0">
                <strong>Role atual:</strong> {userRole}
            </p>
        </div>
    );
};

