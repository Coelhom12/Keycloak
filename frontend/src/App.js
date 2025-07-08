import React, { useEffect, useState, useRef } from 'react';
import keycloak from './keycloak';
import axios from 'axios';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [error, setError] = useState(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;

      keycloak.init({ onLoad: 'login-required' })
        .then(auth => {
          if (auth) {
            console.log("Usuário autenticado.");
            console.log("Token recebido:", keycloak.token); 
            setToken(keycloak.token);
            setAuthenticated(true);
          } else {
            console.warn("Usuário não autenticado");
            setAuthenticated(false);
          }
        })
        .catch(err => {
          console.error("Erro ao iniciar Keycloak:", err);
          setError("Erro ao conectar com o servidor de autenticação.");
        });
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token]);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchItems = () => {
    console.log("Enviando headers:", headers); 
    axios.get('http://localhost:5000/items', { headers })
      .then(res => setItems(res.data))
      .catch(err => {
        console.error("Erro ao buscar itens:", err);
        setError("Erro ao buscar itens.");
      });
  };

  const createItem = () => {
    axios.post('http://localhost:5000/items', form, { headers })
      .then(() => fetchItems())
      .catch(err => {
        console.error("Erro ao criar item:", err);
        setError("Erro ao criar item.");
      });
  };

  const deleteItem = (id) => {
    axios.delete(`http://localhost:5000/items/${id}`, { headers })
      .then(() => fetchItems())
      .catch(err => {
        console.error("Erro ao excluir item:", err);
        setError("Erro ao excluir item.");
      });
  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!authenticated) return <div>Carregando autenticação...</div>;
  if (!token) return <div>Carregando token...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>CRUD com Keycloak</h1>
      <input
        placeholder="Nome"
        value={form.name}
        onChange={e => setForm({ name: e.target.value })}
      />
      <button onClick={createItem}>Criar</button>

      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name} <button onClick={() => deleteItem(item.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
