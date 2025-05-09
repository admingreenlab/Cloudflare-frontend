import React, { useState } from 'react';
import { Button, TextField, Container, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jwtAuthAxios from './service/axiosConfig';

const API_BASE = 'http://192.168.6.30:3000/auth/login';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await jwtAuthAxios.post('auth/login', { name: username, password: password });
      if (res.status === 200) {
        localStorage.setItem('loggedIns', 'true');
        navigate('/upload');

      }

      window.location.href = '/upload';
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid username and password. Please try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{display:"flex", justifyContent:'center'}}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", border:'1px solid #000', width:'50%', padding:'10px', marginTop:'25px', borderRadius:'10px' }}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column"}}>
          <TextField
            style={{ maxWidth: "450px", width: "100%", margin: "auto" }}
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            style={{ margin: "20px auto 25px auto", maxWidth: "450px", width: "100%" }}
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <Alert severity="error" style={{ margin: 'auto', marginBottom: '10px' }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" disabled={loading} style={{ width: "130px", margin: "auto" }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
      </div>
    </Container>
  );
}

export default Login;


