export const validateField = (name, value, formData) => {
  const newErrors = {};

  // Validação básica de campo obrigatório
  if (!value || value.toString().trim() === "") {
    newErrors[name] = "Este campo é obrigatório.";
    return newErrors;
  }

  // Validações específicas por campo
  switch (name) {
    case 'email':
      if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = "E-mail inválido";
      }
      break;
      
    case 'matricula':
      const matriculaError = validateMatricula(value);
      if (matriculaError) {
        newErrors.matricula = matriculaError;
      }
      break;
      
    case 'data_fim_afastamento':
      if (formData.data_inicio_afastamento) {
        const inicio = new Date(formData.data_inicio_afastamento);
        const fim = new Date(value);

        if (fim < inicio) {
          newErrors.data_fim_afastamento = "A data final não pode ser antes da inicial.";
        }else{
          const diffInTime = fim.getTime() - inicio.getTime();
          const diffInDays = diffInTime / (1000 * 3600 * 24);
          if (diffInDays < 15) {
            newErrors.data_fim_afastamento = "O afastamento deve ter pelo menos 15 dias.";
        }
      }
    }
    break;
      
    default:
      break;
  }

  return newErrors;
};

export const validateForm = (formData) => {
  const newErrors = {};
  const requiredFields = [
    "aluno_nome", "email", "matricula", "curso",
    "motivo_solicitacao", "data_inicio_afastamento",
    "data_fim_afastamento", "documento_apresentado"
  ];

  // Validação de campos obrigatórios
  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].toString().trim() === "") {
      newErrors[field] = "Este campo é obrigatório.";
    }
  });

  // Validações específicas
  if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "E-mail inválido";
  }

  const matriculaError = validateMatricula(formData.matricula);
  if (matriculaError) {
    newErrors.matricula = matriculaError;
  }

  if (formData.data_inicio_afastamento && formData.data_fim_afastamento) {
    const inicio = new Date(formData.data_inicio_afastamento);
    const fim = new Date(formData.data_fim_afastamento);
    if (fim < inicio) {
      newErrors.data_fim_afastamento = "A data final não pode ser antes da inicial.";
    }else{
      const diffInTime = fim.getTime() - inicio.getTime();
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      if (diffInDays < 15) {
        newErrors.data_fim_afastamento = "O afastamento deve ter pelo menos 15 dias.";
      }
    }
  }

  // Validações condicionais
  if (formData.motivo_solicitacao === "outro" && !formData.outro_motivo) {
    newErrors.outro_motivo = "Por favor, descreva o motivo";
  }

  if (formData.documento_apresentado === "outro" && !formData.outro_documento) {
    newErrors.outro_documento = "Por favor, descreva o documento";
  }

  return newErrors;
};

  export const extractMatriculaFromEmail = (email) => {
    if (!email) return null;
    
    // Padrão para e-mails institucionais: matricula@dominio.ifrs.edu.br
    const matriculaRegex = /^(\d+)@.*ifrs\./i;
    const match = email.match(matriculaRegex);
    
    return match ? match[1] : null;
};

  export const validateMatricula = (value) => {
    if (!value) return "Número de matrícula é obrigatório";
    if (typeof value !== 'string' && typeof value !== 'number') return "Matrícula inválida";
    
    const matriculaStr = value.toString();
    if (!/^\d+$/.test(matriculaStr)) return "Matrícula deve conter apenas números";
    if (matriculaStr.length < 8 || matriculaStr.length > 12) return "Matrícula deve ter entre 8 e 12 dígitos";
    return null;
};