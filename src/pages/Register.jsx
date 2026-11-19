import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    companySlug: '',
    email: '',
    password: '',
  });
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
      await authService.register(form);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setError(data.errors.map((e) => e.message).join(', '));
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Kayıt başarısız.');
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
            Yeni Şirket Kaydı
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Şirket Adı"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Şirket Slug"
              name="companySlug"
              value={form.companySlug}
              onChange={handleChange}
              required
              helperText="Örn: benim-sirketim (boşluksuz, küçük harf)"
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
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </Box>

          <Typography align="center" sx={{ mt: 2 }}>
            Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;