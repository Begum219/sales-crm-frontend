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
import leadService from '../services/leadService';
import dealService from '../services/dealService';
import customerService from '../services/customerService';

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    name: '',
    source: '',
    email: '',
    phone: '',
    type: 'company',
  });
  const [formError, setFormError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [convertLead, setConvertLead] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [convertForm, setConvertForm] = useState({
    customer_company_id: '',
    title: '',
    value: '',
    product: '',
  });
  const [convertError, setConvertError] = useState('');

  const fetchLeads = async (searchTerm = search) => {
    setLoading(true);
    setError('');
    try {
      const result = await leadService.list(searchTerm ? { search: searchTerm } : {});
      setLeads(result.data || []);
    } catch (err) {
      setError('Müşteri adayları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchLeads(searchInput);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await leadService.create(form);
      setOpenDialog(false);
      setForm({ name: '', source: '', email: '', phone: '', type: 'company' });
      fetchLeads();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFormError(data.errors.map((e) => e.message).join(', '));
      } else {
        setFormError(data?.message || 'Kayıt eklenemedi.');
      }
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`"${lead.name}" adlı müşteri adayını silmek istediğine emin misin?`)) {
      return;
    }
    try {
      await leadService.remove(lead.id);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Silinemedi.');
    }
  };

  const openConvertDialog = async (lead) => {
    setConvertLead(lead);
    setConvertError('');
    setConvertForm({
      customer_company_id: '',
      title: lead.name,
      value: '',
      product: '',
    });
    try {
      const result = await customerService.list();
      setCustomers(result.data || []);
    } catch {
      setCustomers([]);
    }
  };

  const handleConvertChange = (e) => {
    setConvertForm({ ...convertForm, [e.target.name]: e.target.value });
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setConvertError('');
    try {
      const payload = {
        ...convertForm,
        customer_company_id: Number(convertForm.customer_company_id),
        value: convertForm.value ? Number(convertForm.value) : undefined,
      };
      await dealService.convertFromLead(convertLead.id, payload);
      setConvertLead(null);
      fetchLeads();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setConvertError(data.errors.map((e) => e.message).join(', '));
      } else {
        setConvertError(data?.message || 'Dönüştürme başarısız.');
      }
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }} maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Müşteri Adayları</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          + Yeni Aday
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="İsim, email veya kaynağa göre ara..."
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
              fetchLeads('');
            }}
          >
            Temizle
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Tür</TableCell>
              <TableCell>Kaynak</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
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
            {!loading && leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.type}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>
                  <Chip label={lead.status} size="small" color={lead.status === 'converted' ? 'success' : 'default'} />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {lead.status !== 'converted' && (
                    <Button size="small" onClick={() => openConvertDialog(lead)}>
                      Fırsata Dönüştür
                    </Button>
                  )}
                  <IconButton size="small" color="error" onClick={() => handleDelete(lead)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {search ? 'Aramanla eşleşen aday bulunamadı.' : 'Henüz müşteri adayı yok.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Yeni Aday Ekle Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Yeni Müşteri Adayı</DialogTitle>
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
              margin="normal"
              label="Tür (company / individual)"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Kaynak"
              name="source"
              value={form.source}
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
              label="Telefon"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button type="submit" variant="contained">Kaydet</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Fırsata Dönüştür Dialog */}
      <Dialog open={!!convertLead} onClose={() => setConvertLead(null)} fullWidth maxWidth="xs">
        <DialogTitle>"{convertLead?.name}" Adayını Fırsata Dönüştür</DialogTitle>
        <Box component="form" onSubmit={handleConvertSubmit}>
          <DialogContent>
            {convertError && <Alert severity="error" sx={{ mb: 2 }}>{convertError}</Alert>}
            <TextField
              fullWidth
              select
              margin="normal"
              label="Müşteri Şirketi"
              name="customer_company_id"
              value={convertForm.customer_company_id}
              onChange={handleConvertChange}
              required
              helperText="Bu adayın bağlanacağı müşteri şirketini seç"
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Fırsat Başlığı"
              name="title"
              value={convertForm.title}
              onChange={handleConvertChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Değer (₺)"
              name="value"
              type="number"
              value={convertForm.value}
              onChange={handleConvertChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ürün/Hizmet"
              name="product"
              value={convertForm.product}
              onChange={handleConvertChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConvertLead(null)}>İptal</Button>
            <Button type="submit" variant="contained">Fırsata Dönüştür</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Leads;