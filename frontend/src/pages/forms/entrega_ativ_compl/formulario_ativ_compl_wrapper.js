import React from 'react';
import { FormPermissionWrapper } from '../../../components/PermissionWrapper';
import FormularioAtivCompl from './formulario_ativ_compl';

/**
 * Wrapper para o formulário de entrega de atividades complementares com controle de permissões
 */
const FormularioAtivComplWrapper = () => {
    return (
        <FormPermissionWrapper formType="entrega_ativ_compl">
            <FormularioAtivCompl />
        </FormPermissionWrapper>
    );
};

export default FormularioAtivComplWrapper;

