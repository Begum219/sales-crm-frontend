import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
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
import EditIcon from '@mui/icons-material/Edit';
import customerService from '../services/customerService';

const EMPTY_FORM = {
  name: '',
  customer_type: 'company',
  industry: '',
  status: 'active',
  city: '',
  phone: '',
  email: '',
  website: '',
};

const TYPE_LABELS = { company: 'Şirket', individual: 'Şahıs' };
const STATUS_LABELS = { active: 'Aktif', inactive: 'Pasif' };

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = yeni kayıt, sayı = düzenleme
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0); // MUI'de sayfa 0'dan başlar
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async ({
    searchTerm = search,
    pageNum = page,
    limit = rowsPerPage,
  } = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum + 1, limit }; // backend sayfayı 1'den başlatıyor
      if (searchTerm) params.search = searchTerm;
      const result = await customerService.list(params);
      setCustomers(result.data || []);
      setTotal(result.meta?.total || 0);
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
    setPage(0);
    fetchCustomers({ searchTerm: searchInput, pageNum: 0 });
  };

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
    fetchCustomers({ pageNum: newPage });
  };

  const handleChangeRowsPerPage = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
    fetchCustomers({ pageNum: 0, limit: newLimit });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setOpenDialog(true);
  };

  const openEditDialog = (customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name || '',
      customer_type: customer.customer_type || 'company',
      industry: customer.industry || '',
      status: customer.status || 'active',
      city: customer.city || '',
      phone: customer.phone || '',
      email: customer.email || '',
      website: customer.website || '',
    });
    setFormError('');
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Boş bırakılan opsiyonel alanları göndermiyoruz:
    // backend boş string'i isEmail/isURL ile reddeder.
    const payload = {};
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '') payload[key] = value;
    });

    try {
      if (editingId) {
        await customerService.update(editingId, payload);
      } else {
        await customerService.create(payload);
      }
      closeDialog();
      fetchCustomers();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFormError(data.errors.map((e) => e.message).join(', '));
      } else if (err.response?.status === 500) {
        setFormError('Kayıt başarısız. Aynı ad ve sektöre sahip bir müşteri zaten var olabilir.');
      } else {
        setFormError(data?.message || 'İşlem başarısız.');
      }
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`"${customer.name}" adlı müşteri şirketini silmek istediğine emin misin?`)) {
      return;
    }
    try {
      await customerService.remove(customer.id);
      // Sayfadaki son kaydı silersek bir önceki sayfaya dön
      const targetPage = customers.length === 1 && page > 0 ? page - 1 : page;
      setPage(targetPage);
      fetchCustomers({ pageNum: targetPage });
    } catch (err) {
      alert(err.response?.data?.message || 'Silinemedi.');
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }} maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Müşteri Şirketleri</Typography>
        <Button variant="contained" onClick={openCreateDialog}>
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
              setPage(0);
              fetchCustomers({ searchTerm: '', pageNum: 0 });
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
                <TableCell>{TYPE_LABELS[c.customer_type] || c.customer_type}</TableCell>
                <TableCell>{c.industry || '-'}</TableCell>
                <TableCell>{c.city || '-'}</TableCell>
                <TableCell>{c.email || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[c.status] || c.status}
                    size="small"
                    color={c.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(c)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
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
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? 'Müşteri Şirketini Düzenle' : 'Yeni Müşteri Şirketi'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
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
            <Button onClick={closeDialog}>İptal</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Customers;