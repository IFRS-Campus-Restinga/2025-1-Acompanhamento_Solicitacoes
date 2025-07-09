import React from 'react';
import { FormPermissionWrapper } from '../../../components/PermissionWrapper';
import FormularioTrancDisciplina from './formulario_tranc_disc';

/**
 * Wrapper para o formulário de trancamento de disciplina com controle de permissões
 */
const FormularioTrancDisciplinaWrapper = () => {
    return (
        <FormPermissionWrapper formType="trancamento_disciplina">
            <FormularioTrancDisciplina />
        </FormPermissionWrapper>
    );
};

export default FormularioTrancDisciplinaWrapper;

