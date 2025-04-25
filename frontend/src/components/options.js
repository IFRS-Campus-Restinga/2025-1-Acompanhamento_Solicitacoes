import { useState, useEffect } from "react";
import axios from "axios";

export default function Options({ url, popularCampo = [], onChange, ignoreFields = [] }) {
  const [options, setOptions] = useState({});
  const [dados, setDados] = useState({});

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = value === "" ? null : parseInt(value);
    } else {
      newValue = value;
    }

    const novosDados = {
      ...dados,
      [name]: newValue,
    };

    setDados(novosDados);
    onChange?.(novosDados); // Envia os dados atualizados ao componente pai
  };

  useEffect(() => {
    axios
      .options(url)
      .then((response) => {
        const fields = response.data.actions.POST;
        setOptions(response.data);

        const camposIniciais = {};
        Object.entries(fields).forEach(([key, value]) => {
          if (ignoreFields.includes(key)) return;

          if (value.type === "bool") {
            camposIniciais[key] = false;
          } else if (value.type === "integer") {
            camposIniciais[key] = null;
          } else {
            camposIniciais[key] = "";
          }
        });

        setDados(camposIniciais);
        onChange?.(camposIniciais); // Inicializa o form no componente pai
      })
      .catch((err) => console.error(err));
  }, [url]);

  return (
    <>
      {options.actions &&
        options.actions.POST &&
        Object.entries(options.actions.POST).map(([key, value]) => {
          if (ignoreFields.includes(key)) {
            return null;
          }

          if ((value.type === "string") && (value.max_length < 60)) {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label}</label>
                <input
                  id={key}
                  name={key}
                  type="text"
                  required={value.required}
                  minLength={value.min_length ?? undefined}
                  maxLength={value.max_length ?? undefined}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                />
              </div>
            );
          }

          if ((value.type === "string") && (value.max_length > 60)) {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label}</label>
                <textarea
                  id={key}
                  name={key}
                  required={value.required}
                  minLength={value.min_length ?? undefined}
                  maxLength={value.max_length ?? undefined}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                />
              </div>
            );
          }

          if ((value.type === "string") && (value.max_length == null)) {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label}</label>
                <textarea
                  id={key}
                  name={key}
                  required={value.required}
                  minLength={value.min_length ?? undefined}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                  className="form-control"
                />
              </div>
            );
          }

          if (value.type === "integer") {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label}</label>
                <input
                  id={key}
                  name={key}
                  type="number"
                  required={value.required}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                />
              </div>
            );
          }

          if (value.type === "field") {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label}</label>
                <select
                  id={key}
                  name={key}
                  required={value.required}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                  className="form-select"
                >
                  <option value="">Selecione</option>
                  {popularCampo.map((campo) => (
                    <option key={campo.id} value={campo.id}>
                      {campo.descricao}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (value.type === "bool") {
            return (
              <div key={key}>
                <label htmlFor={key}>
                  <input
                    id={key}
                    name={key}
                    type="checkbox"
                    onChange={handleChange}
                    checked={!!dados[key]}
                    className="form-check-input"
                  />
                  {value.label}
                </label>
              </div>
            );
          }

          return null;
        })}
    </>
  );
}
