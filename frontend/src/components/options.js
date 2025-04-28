import { useState, useEffect } from "react";
import axios from "axios";

export default function Options({ url = [], popularCampo = [], onChange, ignoreFields = [] }) {
  const [options, setOptions] = useState({});
  const [dados, setDados] = useState({});

  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
  
    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "file") {
      newValue = files.length > 1 ? files : files[0]; // Se múltiplos arquivos
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
    onChange?.(novosDados);
  };
  

  useEffect(() => {
    url.forEach(popularForm);

    function popularForm(item) {
      axios
      .options(item)
      .then((response) => {
        const fields = response.data.actions.POST;

        setOptions((prevOptions) => ({
          ...prevOptions,
          actions: {
            POST: {
              ...prevOptions.actions?.POST,
              ...fields,
            }
          }
        }));

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

        setDados((prevDados) => ({
          ...prevDados,
          ...camposIniciais
        }));

        onChange?.({
          ...dados,
          ...camposIniciais
        });

      })
      .catch((err) => console.error(err));
    }

  }, [url]);

  return (
    <>
      {options.actions &&
        options.actions.POST &&
        Object.entries(options.actions.POST).map(([key, value]) => {
          if (ignoreFields.includes(key)) {
            return null;
          }

          else if ((value.type === "string") && (value.max_length < 60)) {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label + ":"}</label>
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
                <br></br>
              </div>
            );
          }

          else if ((value.type === "string") && (value.max_length > 60)) {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label + ":"}</label>
                <textarea
                  id={key}
                  name={key}
                  required={value.required}
                  minLength={value.min_length ?? undefined}
                  maxLength={value.max_length ?? undefined}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                />
                <br></br>
              </div>
            );
          }

          else if ((value.type === "string") && (value.max_length == null)) {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label + ":"}</label>
                <textarea
                  id={key}
                  name={key}
                  required={value.required}
                  minLength={value.min_length ?? undefined}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                  className="form-control"
                />
                <br></br>
              </div>
            );
          }

          else if (value.type === "integer") {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label + ":"}</label>
                <input
                  id={key}
                  name={key}
                  type="number"
                  required={value.required}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                />
                <br></br>
              </div>
            );
          }

          else if (value.type === "field") {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label + ":"}</label>
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
                <br></br>
              </div>
            );
          }

          else if (value.type === "bool") {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label + ":"}</label>
                  <input
                    id={key}
                    name={key}
                    type="checkbox"
                    onChange={handleChange}
                    checked={!!dados[key]}
                    className="form-check-input"
                  />
                <br></br>
              </div>
            );
          }

          else if (value.type === "file upload") {
            return (
              <div key={key}>
                <label htmlFor={key}>{value.label + ": "}</label>
                  <input
                    id={key}
                    name={key}
                    type="file"
                    onChange={handleChange}
                    className="form-control-file"
                    multiple
                  />
                  <br></br>
              </div>
            );
            
          } else {
            return null;
          }
        })}
    </>
  );
}
