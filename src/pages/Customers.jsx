import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import customerService from '../services/customerService';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    name: '',
    customer_type: 'company',
    industry: '',
    status: 'active',
    city: '',
    phone: '',
    email: '',
    website: '',
  });
  const [formError, setFormError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const fetchCustomers = async (searchTerm = search) => {
    setLoading(true);
    setError('');
    try {
      const result = await customerService.list(searchTerm ? { search: searchTerm } : {});
      setCustomers(result.data || []);
    } catch (err) {
      setError('Müşteri şirketleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchCustomers(searchInput);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await customerService.create(form);
      setOpenDialog(false);
      setForm({
        name: '',
        customer_type: 'company',
        industry: '',
        status: 'active',
        city: '',
        phone: '',
        email: '',
        website: '',
      });
      fetchCustomers();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFormError(data.errors.map((e) => e.message).join(', '));
      } else {
        setFormError(data?.message || 'Kayıt eklenemedi.');
      }
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`"${customer.name}" adlı müşteri şirketini silmek istediğine emin misin?`)) {
      return;
    }
    try {
      await customerService.remove(customer.id);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Silinemedi.');
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }} maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Müşteri Şirketleri</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          + Yeni Müşteri
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="İsim, email veya şehre göre ara..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <Button type="submit" variant="outlined">Ara</Button>
        {search && (
          <Button
            onClick={() => {
              setSearchInput('');
              setSearch('');
              fetchCustomers('');
            }}
          >
            Temizle
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Tür</TableCell>
              <TableCell>Sektör</TableCell>
              <TableCell>Şehir</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.customer_type}</TableCell>
                <TableCell>{c.industry}</TableCell>
                <TableCell>{c.city}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>
                  <Chip label={c.status} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {search ? 'Aramanla eşleşen müşteri bulunamadı.' : 'Henüz müşteri şirketi yok.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Yeni Müşteri Şirketi</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <TextField
              fullWidth
              margin="normal"
              label="Ad"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              select
              margin="normal"
              label="Tür"
              name="customer_type"
              value={form.customer_type}
              onChange={handleChange}
              required
            >
              <MenuItem value="company">Şirket</MenuItem>
              <MenuItem value="individual">Şahıs</MenuItem>
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Sektör"
              name="industry"
              value={form.industry}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Şehir"
              name="city"
              value={form.city}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Telefon"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="E-posta"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
              helperText="http:// veya https:// ile başlamalı"
            />
            <TextField
              fullWidth
              select
              margin="normal"
              label="Durum"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Pasif</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button type="submit" variant="contained">Kaydet</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Customers;