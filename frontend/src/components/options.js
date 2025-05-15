import { useState, useEffect } from "react";
import axios from "axios";

export default function Options({
  url = [],
  popularCampo = {},
  onChange,
  ignoreFields = []
}) {
  const [fieldsOrdered, setFieldsOrdered] = useState([]);
  const [dados, setDados] = useState({});
  const [loading, setLoading] = useState(true); // <- estado de carregamento

  const handleChange = (e) => {
    const { name, type, checked, value, files, options } = e.target;

    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "file") {
      newValue = files.length > 1 ? Array.from(files) : files[0];
    } else if (type === "number") {
      newValue = value === "" ? null : parseInt(value);
    } else if (e.target.multiple && type === "select-multiple") {
      newValue = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
    }
    else {
      newValue = value === "" ? null : value;
    }

    const novosDados = {
      ...dados,
      [name]: newValue,
    };

    setDados(novosDados);
    onChange?.(novosDados);
  };

  useEffect(() => {
    let cancelado = false;

    async function carregarOptionsSequencialmente() {
      setLoading(true);
      let novosCamposOrdenados = [];
      let novosDadosIniciais = {};

      novosCamposOrdenados.sort(([keyA], [keyB]) => {
        if (keyA === "anexos") return 1;
        if (keyB === "anexos") return -1;
        return 0;
      });

      for (const endpoint of url) {
        try {
          const response = await axios.options(endpoint);
          const fields = response.data.actions.POST;

          for (const [key, value] of Object.entries(fields)) {
            if (ignoreFields.includes(key)) continue;

            novosCamposOrdenados.push([key, value]);

            if (value.type === "bool") {
              novosDadosIniciais[key] = false;
            } else if (value.type === "integer") {
              novosDadosIniciais[key] = null;
            } else {
              novosDadosIniciais[key] = "";
            }
          }
        } catch (err) {
          console.error("Erro ao carregar options de:", endpoint, err);
        }
      }

      if (!cancelado) {
        setFieldsOrdered(novosCamposOrdenados);
        setDados((prev) => {
          const atualizados = { ...prev, ...novosDadosIniciais };
          onChange?.(atualizados);
          return atualizados;
        });
        setLoading(false);
      }
      novosCamposOrdenados.sort(([keyA], [keyB]) => {
        if (keyA === "anexos") return 1;
        if (keyB === "anexos") return -1;
        return 0;
      });
    }



    carregarOptionsSequencialmente();

    return () => {
      cancelado = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {fieldsOrdered.map(([key, value]) => {

        if (key === "anexos") {
          return (
            <div key={key} className="form-group">
              <label htmlFor={key}>{value.label || "Anexos"}:</label>
              <input
                id={key}
                name={key}
                type="file"
                multiple
                required={value.required}
                onChange={handleChange}
                className="form-control-file"
              />
              <br />
            </div>
          );
        }

        if (value.type === "string" && value.max_length < 60) {
          return (
            <div key={key} className="form-group">
              <label htmlFor={key}>{value.label}:</label>
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
              <br />
            </div>
          );
        }

        if (value.type === "string" && (value.max_length >= 60 || value.max_length == null)) {
          return (
            <div key={key} className="form-group">
              <label htmlFor={key}>{value.label}:</label>
              <textarea
                id={key}
                name={key}
                required={value.required}
                minLength={value.min_length ?? undefined}
                maxLength={value.max_length ?? undefined}
                onChange={handleChange}
                value={dados[key] ?? ""}
                className="form-control"
              />
              <br />
            </div>
          );
        }

        if (value.type === "integer") {
          return (
            <div key={key} className="form-group">
              <label htmlFor={key}>{value.label}:</label>
              <input
                id={key}
                name={key}
                type="number"
                required={value.required}
                onChange={handleChange}
                value={dados[key] ?? ""}
              />
              <br />
            </div>
          );
        }

        if (value.type === "field") {
          const campoInfo = popularCampo[key];
          const lista = Array.isArray(campoInfo) ? campoInfo : campoInfo?.data;
          const labelKey = Array.isArray(campoInfo) ? "nome" : campoInfo?.labelKey || "nome";
          if (key === "disciplinas") {
            return (
              <div key={key} className="form-group">
                <label htmlFor={key}>{value.label}:</label>
                <select
                  id={key}
                  name={key}
                  required={value.required}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                  className="form-select"
                  multiple
                >
                  <option value="">Selecione</option>
                  {lista?.map((campo) => (
                    <option key={campo.codigo} value={campo.codigo}>
                      {campo.nome}
                    </option>
                  ))}
                </select>
                <br />
              </div>
            )
          } else if (key === "curso") {
            return (
              <div key={key} className="form-group">
                <label htmlFor={key}>{value.label}:</label>
                <select
                  id={key}
                  name={key}
                  required={value.required}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                  className="form-select"

                >
                  <option value="">Selecione</option>
                  {lista?.map((campo) => (
                    <option key={campo.codigo} value={campo.codigo}>
                      {campo[labelKey]}
                    </option>
                  ))}
                </select>
                <br />
              </div>
            )
          } else {
            return (
              <div key={key} className="form-group">
                <label htmlFor={key}>{value.label}:</label>
                <select
                  id={key}
                  name={key}
                  required={value.required}
                  onChange={handleChange}
                  value={dados[key] ?? ""}
                  className="form-select"

                >
                  <option value="">Selecione</option>
                  {lista?.map((campo) => (
                    <option key={campo.id} value={campo.id}>
                      {campo[labelKey]}
                    </option>
                  ))}
                </select>
                <br />
              </div>
            )
          }
        }

        if (value.type === "bool") {
          return (
            <div key={key} className="form-group">
              <label htmlFor={key}>{value.label}:</label>
              <input
                id={key}
                name={key}
                type="checkbox"
                onChange={handleChange}
                checked={!!dados[key]}
                className="form-check-input"
              />
              <br />
            </div>
          );
        }

        if (value.type === "file upload" || value.label === "Anexo(s)") {
          return (
            <div key={key} className="form-group">
              <label htmlFor={key}>{value.label}:</label>
              <input
                id={key}
                name={key}
                type="file"
                onChange={handleChange}
                className="form-control-file"
                multiple
              />
              <br />
            </div>
          );
        }

        if (value.type === "email") {
          return (
            <div key={key} className="form-group">
              <label htmlFor={key}>{value.label}:</label>
              <input
                id={key}
                name={key}
                type="email"
                onChange={handleChange}></input>
              <br />
            </div>
          )
        }

        return null;
      })}
    </>
  );
}
