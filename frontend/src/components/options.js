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
    const { name, type, checked, value, files } = e.target;

    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "file") {
      newValue = files.length > 1 ? files : files[0];
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
    let cancelado = false;

    async function carregarOptionsSequencialmente() {
      setLoading(true);
      let novosCamposOrdenados = [];
      let novosDadosIniciais = {};

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
          );
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

        if (value.type === "file upload") {
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
