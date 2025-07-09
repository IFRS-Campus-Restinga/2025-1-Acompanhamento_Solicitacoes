import React from 'react';
import { FormPermissionWrapper } from '../../../components/PermissionWrapper';
import FormularioExercDom from './formulario_exerc_dom';

/**
 * Wrapper para o formulário de exercícios domiciliares com controle de permissões
 */
const FormularioExercDomWrapper = () => {
    return (
        <FormPermissionWrapper formType="exercicio_domiciliar">
            <FormularioExercDom />
        </FormPermissionWrapper>
    );
};

export default FormularioExercDomWrapper;

