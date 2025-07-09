import React from 'react';
import { FormPermissionWrapper } from '../../../components/PermissionWrapper';
import FormularioAbonoFaltas from './formulario_abono_falta';

/**
 * Wrapper para o formulário de abono de falta com controle de permissões
 */
const FormularioAbonoFaltaWrapper = () => {
    return (
        <FormPermissionWrapper formType="abono_falta">
            <FormularioAbonoFaltas />
        </FormPermissionWrapper>
    );
};

export default FormularioAbonoFaltaWrapper;

