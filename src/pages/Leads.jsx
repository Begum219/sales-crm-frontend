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
import leadService from '../services/leadService';
import dealService from '../services/dealService';
import customerService from '../services/customerService';

const EMPTY_FORM = {
  name: '',
  source: '',
  email: '',
  phone: '',
  type: 'company',
  status: 'new',
};

const TYPE_LABELS = { company: 'Şirket', individual: 'Şahıs' };
const STATUS_LABELS = {
  new: 'Yeni',
  contacted: 'İletişime Geçildi',
  qualified: 'Nitelikli',
  converted: 'Dönüştürüldü',
  lost: 'Kaybedildi',
};
// "converted" durumu sadece fırsata dönüştürme ile atanır, formda seçilemez
const EDITABLE_STATUSES = ['new', 'contacted', 'qualified', 'lost'];

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = yeni, sayı = düzenleme
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0); // MUI'de sayfa 0'dan başlar
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [convertLead, setConvertLead] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [convertForm, setConvertForm] = useState({
    customer_company_id: '',
    title: '',
    value: '',
    product: '',
  });
  const [convertError, setConvertError] = useState('');

  const fetchLeads = async ({
    searchTerm = search,
    pageNum = page,
    limit = rowsPerPage,
  } = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum + 1, limit }; // backend sayfayı 1'den başlatıyor
      if (searchTerm) params.search = searchTerm;
      const result = await leadService.list(params);
      setLeads(result.data || []);
      setTotal(result.meta?.total || 0);
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
    setPage(0);
    fetchLeads({ searchTerm: searchInput, pageNum: 0 });
  };

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
    fetchLeads({ pageNum: newPage });
  };

  const handleChangeRowsPerPage = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
    fetchLeads({ pageNum: 0, limit: newLimit });
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

  const openEditDialog = (lead) => {
    setEditingId(lead.id);
    setForm({
      name: lead.name || '',
      source: lead.source || '',
      email: lead.email || '',
      phone: lead.phone || '',
      type: lead.type || 'company',
      status: lead.status || 'new',
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

    // Boş alanları göndermiyoruz (backend boş e-posta/telefonu reddeder).
    // Yeni kayıtta status göndermiyoruz, backend varsayılanı 'new' yapıyor.
    const payload = {};
    Object.entries(form).forEach(([key, value]) => {
      if (value === '') return;
      if (!editingId && key === 'status') return;
      payload[key] = value;
    });

    try {
      if (editingId) {
        await leadService.update(editingId, payload);
      } else {
        await leadService.create(payload);
      }
      closeDialog();
      fetchLeads();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFormError(data.errors.map((e) => e.message).join(', '));
      } else {
        setFormError(data?.message || 'İşlem başarısız.');
      }
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`"${lead.name}" adlı müşteri adayını silmek istediğine emin misin?`)) {
      return;
    }
    try {
      await leadService.remove(lead.id);
      // Sayfadaki son kaydı silersek bir önceki sayfaya dön
      const targetPage = leads.length === 1 && page > 0 ? page - 1 : page;
      setPage(targetPage);
      fetchLeads({ pageNum: targetPage });
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
      // Açılır listede tüm müşteriler görünsün diye yüksek limit istiyoruz
      const result = await customerService.list({ limit: 100 });
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
        <Button variant="contained" onClick={openCreateDialog}>
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
              setPage(0);
              fetchLeads({ searchTerm: '', pageNum: 0 });
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
                <TableCell>{TYPE_LABELS[lead.type] || lead.type}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[lead.status] || lead.status}
                    size="small"
                    color={lead.status === 'converted' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {lead.status !== 'converted' && (
                    <>
                      <Button size="small" onClick={() => openConvertDialog(lead)}>
                        Fırsata Dönüştür
                      </Button>
                      <IconButton size="small" color="primary" onClick={() => openEditDialog(lead)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
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

      {/* Ekleme / Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? 'Müşteri Adayını Düzenle' : 'Yeni Müşteri Adayı'}</DialogTitle>
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
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="company">Şirket</MenuItem>
              <MenuItem value="individual">Şahıs</MenuItem>
            </TextField>
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
            {editingId && (
              <TextField
                fullWidth
                select
                margin="normal"
                label="Durum"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {EDITABLE_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>İptal</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Güncelle' : 'Kaydet'}
            </Button>
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