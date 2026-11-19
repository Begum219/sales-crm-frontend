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
} from '@mui/material';
import offerService from '../services/offerService';
import dealService from '../services/dealService';

const STATUS_LABELS = {
  pending: 'Beklemede',
  accepted: 'Kabul Edildi',
  rejected: 'Reddedildi',
};

function Offers() {
  const [offers, setOffers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    deal_id: '',
    description: '',
    value: '',
    valid_until: '',
  });
  const [formError, setFormError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const fetchAll = async (searchTerm = search) => {
    setLoading(true);
    setError('');
    try {
      const [offersResult, dealsResult] = await Promise.all([
        offerService.list(searchTerm ? { search: searchTerm } : {}),
        dealService.list(),
      ]);
      setOffers(offersResult.data || []);
      setDeals(dealsResult.data || []);
    } catch (err) {
      setError('Teklifler yüklenemedi.');
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = {
        ...form,
        deal_id: Number(form.deal_id),
        value: Number(form.value),
      };
      await offerService.create(payload);
      setOpenDialog(false);
      setForm({ deal_id: '', description: '', value: '', valid_until: '' });
      fetchAll();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFormError(data.errors.map((e) => e.message).join(', '));
      } else {
        setFormError(data?.message || 'Teklif eklenemedi.');
      }
    }
  };

  const handleStatusChange = async (offer, status) => {
    try {
      await offerService.updateStatus(offer.id, status);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Durum güncellenemedi.');
    }
  };

  const dealTitle = (id) => {
    const d = deals.find((d) => d.id === id);
    return d ? d.title : `#${id}`;
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }} maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Teklifler</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          + Yeni Teklif
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Açıklamaya göre ara..."
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

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fırsat</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Değer</TableCell>
              <TableCell>Geçerlilik</TableCell>
              <TableCell>Durum</TableCell>
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
            {!loading && offers.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{dealTitle(o.deal_id)}</TableCell>
                <TableCell>{o.description}</TableCell>
                <TableCell>{o.value} ₺</TableCell>
                <TableCell>{o.valid_until || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[o.status] || o.status}
                    size="small"
                    color={o.status === 'accepted' ? 'success' : o.status === 'rejected' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {o.status === 'pending' && (
                    <>
                      <Button size="small" color="success" onClick={() => handleStatusChange(o, 'accepted')}>
                        Kabul Et
                      </Button>
                      <Button size="small" color="error" onClick={() => handleStatusChange(o, 'rejected')}>
                        Reddet
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!loading && offers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {search ? 'Aramanla eşleşen teklif bulunamadı.' : 'Henüz teklif yok.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Yeni Teklif</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <TextField
              fullWidth
              select
              margin="normal"
              label="Satış Fırsatı"
              name="deal_id"
              value={form.deal_id}
              onChange={handleChange}
              required
            >
              {deals.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Açıklama"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Değer (₺)"
              name="value"
              type="number"
              value={form.value}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Geçerlilik Son Tarihi"
              name="valid_until"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.valid_until}
              onChange={handleChange}
            />
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

export default Offers;