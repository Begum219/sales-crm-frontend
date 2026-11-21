import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import EditIcon from '@mui/icons-material/Edit';
import dealService from '../services/dealService';
import customerService from '../services/customerService';

const STAGE_ORDER = ['new', 'contacted', 'proposal_sent', 'negotiation'];
const STAGE_LABELS = {
  new: 'Yeni',
  contacted: 'İletişime Geçildi',
  proposal_sent: 'Teklif Gönderildi',
  negotiation: 'Müzakere',
  won: 'Kazanıldı',
  lost: 'Kaybedildi',
};

const EMPTY_FORM = {
  customer_company_id: '',
  title: '',
  value: '',
  product: '',
  probability: '',
  expected_close_date: '',
};

// API'den gelen "2026-09-11T21:00:00.000Z" gibi değeri input[type=date] için "2026-09-11" yapar
const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

function Deals() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = yeni, sayı = düzenleme
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const fetchAll = async (searchTerm = search) => {
    setLoading(true);
    setError('');
    try {
      const [dealsResult, customersResult] = await Promise.all([
        dealService.list(searchTerm ? { search: searchTerm } : {}),
        customerService.list(),
      ]);
      setDeals(dealsResult.data || []);
      setCustomers(customersResult.data || []);
    } catch (err) {
      setError('Fırsatlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchAll(searchInput);
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

  const openEditDialog = (deal) => {
    setEditingId(deal.id);
    setForm({
      customer_company_id: deal.customer_company_id,
      title: deal.title || '',
      value: deal.value ?? '',
      product: deal.product || '',
      probability: deal.probability ?? '',
      expected_close_date: toDateInput(deal.expected_close_date),
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
    try {
      if (editingId) {
        // Backend düzenlemede müşteri şirketini değiştirmiyor, o yüzden göndermiyoruz.
        const payload = {
          title: form.title,
          value: form.value !== '' ? Number(form.value) : undefined,
          product: form.product || undefined,
          probability: form.probability !== '' ? Number(form.probability) : undefined,
          expected_close_date: form.expected_close_date || undefined,
        };
        await dealService.update(editingId, payload);
      } else {
        const payload = {
          customer_company_id: Number(form.customer_company_id),
          title: form.title,
          value: form.value !== '' ? Number(form.value) : undefined,
          product: form.product || undefined,
          probability: form.probability !== '' ? Number(form.probability) : undefined,
          expected_close_date: form.expected_close_date || undefined,
        };
        await dealService.create(payload);
      }
      closeDialog();
      fetchAll();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFormError(data.errors.map((e) => e.message).join(', '));
      } else {
        setFormError(data?.message || 'İşlem başarısız.');
      }
    }
  };

  const handleAdvanceStage = async (deal) => {
    const currentIndex = STAGE_ORDER.indexOf(deal.status);
    const nextStage = STAGE_ORDER[currentIndex + 1];
    if (!nextStage) return;
    try {
      await dealService.updateStage(deal.id, nextStage);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Aşama güncellenemedi.');
    }
  };

  const handleMarkLost = async (deal) => {
    if (!window.confirm(`"${deal.title}" fırsatını kaybedildi olarak işaretlemek istediğine emin misin? Bu işlem geri alınamaz.`)) {
      return;
    }
    try {
      await dealService.updateStage(deal.id, 'lost');
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Durum güncellenemedi.');
    }
  };

  const customerName = (id) => {
    const c = customers.find((c) => c.id === id);
    return c ? c.name : `#${id}`;
  };

  const canAdvance = (d) =>
    !d.is_closed && STAGE_ORDER.indexOf(d.status) !== -1 && STAGE_ORDER.indexOf(d.status) < STAGE_ORDER.length - 1;

  return (
    <Container sx={{ mt: 4, mb: 6 }} maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Satış Fırsatları</Typography>
        <Button variant="contained" onClick={openCreateDialog}>
          + Yeni Fırsat
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Başlık veya ürün adına göre ara..."
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
              fetchAll('');
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
              <TableCell>Başlık</TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell>Değer</TableCell>
              <TableCell>Olasılık</TableCell>
              <TableCell>Aşama</TableCell>
              <TableCell>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && deals.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/deals/${d.id}`)} sx={{ textTransform: 'none' }}>
                    {d.title}
                  </Button>
                </TableCell>
                <TableCell>{customerName(d.customer_company_id)}</TableCell>
                <TableCell>{d.value ? `${d.value} ₺` : '-'}</TableCell>
                <TableCell>{d.probability ? `%${d.probability}` : '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={STAGE_LABELS[d.status] || d.status}
                    size="small"
                    color={d.status === 'won' ? 'success' : d.status === 'lost' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {canAdvance(d) && (
                    <Button size="small" onClick={() => handleAdvanceStage(d)}>
                      Sonraki Aşama
                    </Button>
                  )}
                  {!d.is_closed && (
                    <>
                      <Button size="small" color="error" onClick={() => handleMarkLost(d)}>
                        Kaybedildi
                      </Button>
                      <IconButton size="small" color="primary" onClick={() => openEditDialog(d)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!loading && deals.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {search ? 'Aramanla eşleşen fırsat bulunamadı.' : 'Henüz satış fırsatı yok.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? 'Satış Fırsatını Düzenle' : 'Yeni Satış Fırsatı'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <TextField
              fullWidth
              select
              margin="normal"
              label="Müşteri Şirketi"
              name="customer_company_id"
              value={form.customer_company_id}
              onChange={handleChange}
              required
              disabled={!!editingId}
              helperText={editingId ? 'Müşteri şirketi sonradan değiştirilemez' : ''}
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
              label="Başlık"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Değer (₺)"
              name="value"
              type="number"
              value={form.value}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ürün/Hizmet"
              name="product"
              value={form.product}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Olasılık (%)"
              name="probability"
              type="number"
              value={form.probability}
              onChange={handleChange}
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Beklenen Kapanış Tarihi"
              name="expected_close_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.expected_close_date}
              onChange={handleChange}
            />
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

export default Deals;