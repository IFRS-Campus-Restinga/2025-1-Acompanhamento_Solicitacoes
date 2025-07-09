import React from 'react';
import { FormPermissionWrapper } from '../../../components/PermissionWrapper';
import FormularioDispensaEdFisica from './formulario_dispensa_ed_fisica';

/**
 * Wrapper para o formulário de dispensa de educação física com controle de permissões
 */
const FormularioDispensaEdFisicaWrapper = () => {
    return (
        <FormPermissionWrapper formType="dispensa_ed_fisica">
            <FormularioDispensaEdFisica />
        </FormPermissionWrapper>
    );
};

export default FormularioDispensaEdFisicaWrapper;

