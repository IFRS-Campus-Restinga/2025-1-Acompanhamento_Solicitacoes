export const validateField = (name, value, formData) => {
  let newErrors = {};

  if (!value || value.toString().trim() === "") {
    newErrors[name] = "Este campo é obrigatório.";
  } else {
    delete newErrors[name];
  }

  // Validação cruzada: Data final não pode ser antes da inicial
  if (name === "data_fim_afastamento" && formData.data_inicio_afastamento) {
    const inicio = new Date(formData.data_inicio_afastamento);
    const fim = new Date(value);
    if (fim < inicio) {
      newErrors.data_fim_afastamento = "A data final não pode ser antes da inicial.";
    }
  }

  return newErrors;
};

export const validateForm = (formData) => {
  let newErrors = {};
  const requiredFields = [
    "aluno_nome", "email", "matricula", "curso",
    "motivo_solicitacao", "data_inicio_afastamento",
    "data_fim_afastamento", "documento_apresentado"
  ];

  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].trim() === "") {
      newErrors[field] = "Este campo é obrigatório.";
    }
  });

  // Validação do período
  if (formData.data_inicio_afastamento && formData.data_fim_afastamento) {
    const inicio = new Date(formData.data_inicio_afastamento);
    const fim = new Date(formData.data_fim_afastamento);
    if (fim < inicio) {
      newErrors.data_fim_afastamento = "A data final não pode ser antes da inicial.";
    }
  }

  return newErrors;
};
