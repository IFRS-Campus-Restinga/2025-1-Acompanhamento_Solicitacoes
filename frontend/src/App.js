import './App.css';
import axios from 'axios';
import React from 'react';

class App extends React.Component {
  state = {
    details: [],
    isConnected: false,
  };
  //teste
  //teste
  //teste

  async componentDidMount() {
    try {
      const res = await axios.get('http://localhost:8000/solicitacoes/saudacao/');
      this.setState({
        details: res.data,
        isConnected: true,
      });
    } catch (err) {
      console.error('Erro na conexão:', err);
      this.setState({
        isConnected: false,
      });
    }
  }

  //teste
  render() {
    const { isConnected, details } = this.state;

    return (
      <div className="p-4">

        {isConnected ? (
          <>
            <p className="text-green-600 font-semibold">CONEXÃO BEM SUCEDIDA</p>

          </>
        ) : (
          <p className="text-red-600">Falha na conexão com a API.</p>
        )}
      </div>
    );
  }
}

export default App;