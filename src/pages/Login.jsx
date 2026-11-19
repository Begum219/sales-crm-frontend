import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import authService from '../services/authService';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ companySlug: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(form);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setError(data.errors.map((e) => e.message).join(', '));
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Giriş başarısız, bilgileri kontrol et.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            CRM Giriş
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Şirket Slug"
              name="companySlug"
              value={form.companySlug}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="E-posta"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Şifre"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;