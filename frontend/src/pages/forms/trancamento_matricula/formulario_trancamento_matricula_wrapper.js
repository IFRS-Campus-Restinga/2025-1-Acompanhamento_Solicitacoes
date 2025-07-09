import React from 'react';
import { FormPermissionWrapper } from '../../../components/PermissionWrapper';
import FormularioTrancamentoMatricula from './formulario_trancamento_matricula';

/**
 * Wrapper para o formulário de trancamento de matrícula com controle de permissões
 */
const FormularioTrancamentoMatriculaWrapper = () => {
    return (
        <FormPermissionWrapper formType="trancamento_matricula">
            <FormularioTrancamentoMatricula />
        </FormPermissionWrapper>
    );
};

export default FormularioTrancamentoMatriculaWrapper;

