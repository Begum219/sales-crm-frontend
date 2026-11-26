import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import customerService from '../services/customerService';
import contactService from '../services/contactService';
import activityService from '../services/activityService';
import { formatDateTime } from '../utils/format';

const TYPE_LABELS = { company: 'Şirket', individual: 'Şahıs' };
const STATUS_LABELS = { active: 'Aktif', inactive: 'Pasif' };
const ACTIVITY_TYPES = {
  call: 'Telefon Görüşmesi',
  meeting: 'Toplantı',
  email: 'E-posta',
  note: 'Not',
};

const EMPTY_CONTACT = { full_name: '', title: '', email: '', phone: '' };
const EMPTY_ACTIVITY = { contact_id: '', type: 'call', notes: '' };

function InfoItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{value || '-'}</Typography>
    </Box>
  );
}

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT);
  const [contactError, setContactError] = useState('');

  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityForm, setActivityForm] = useState(EMPTY_ACTIVITY);
  const [activityError, setActivityError] = useState('');

  const fetchLists = async () => {
    const [contactsResult, activitiesResult] = await Promise.all([
      contactService.list({ customer_company_id: id, limit: 100 }),
      activityService.list({ customer_company_id: id, limit: 100 }),
    ]);
    setContacts(contactsResult.data || []);
    setActivities(activitiesResult.data || []);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const customerData = await customerService.getOne(id);
      setCustomer(customerData);
      await fetchLists();
    } catch (err) {
      console.error(err);
      setError('Müşteri bulunamadı veya yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- Kişiler ----
  const openContactDialog = (contact = null) => {
    setEditingContactId(contact ? contact.id : null);
    setContactForm(
      contact
        ? {
            full_name: contact.full_name || '',
            title: contact.title || '',
            email: contact.email || '',
            phone: contact.phone || '',
          }
        : EMPTY_CONTACT
    );
    setContactError('');
    setContactDialogOpen(true);
  };

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');

    // Backend güncellemede de customer_company_id ve full_name istiyor.
    // Boş opsiyonel alanları göndermiyoruz (backend boş e-postayı reddeder, eksik alan NULL olur).
    const payload = {
      customer_company_id: Number(id),
      full_name: contactForm.full_name.trim(),
    };
    ['title', 'email', 'phone'].forEach((key) => {
      if (contactForm[key] !== '') payload[key] = contactForm[key];
    });

    try {
      if (editingContactId) {
        await contactService.update(editingContactId, payload);
      } else {
        await contactService.create(payload);
      }
      setContactDialogOpen(false);
      await fetchLists();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setContactError(data.errors.map((e) => e.message).join(', '));
      } else {
        setContactError(data?.message || 'İşlem başarısız.');
      }
    }
  };

  const handleContactDelete = async (contact) => {
    if (
      !window.confirm(
        `"${contact.full_name}" kişisini silmek istediğine emin misin? Bu kişiye ait aktiviteler de silinir.`
      )
    ) {
      return;
    }
    try {
      await contactService.remove(contact.id);
      await fetchLists();
    } catch (err) {
      alert(err.response?.data?.message || 'Silinemedi.');
    }
  };

  // ---- Aktiviteler ----
  const openActivityDialog = () => {
    setActivityForm(EMPTY_ACTIVITY);
    setActivityError('');
    setActivityDialogOpen(true);
  };

  const handleActivityChange = (e) => {
    setActivityForm({ ...activityForm, [e.target.name]: e.target.value });
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setActivityError('');

    // user_id göndermiyoruz, backend kullanıcıyı token'dan alıyor.
    const payload = {
      customer_company_id: Number(id),
      contact_id: Number(activityForm.contact_id),
      type: activityForm.type,
    };
    if (activityForm.notes.trim() !== '') payload.notes = activityForm.notes.trim();

    try {
      await activityService.create(payload);
      setActivityDialogOpen(false);
      await fetchLists();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setActivityError(data.errors.map((e) => e.message).join(', '));
      } else {
        setActivityError(data?.message || 'Aktivite eklenemedi.');
      }
    }
  };

  const handleActivityDelete = async (activity) => {
    if (!window.confirm('Bu aktiviteyi silmek istediğine emin misin?')) return;
    try {
      await activityService.remove(activity.id);
      await fetchLists();
    } catch (err) {
      alert(err.response?.data?.message || 'Silinemedi.');
    }
  };

  const contactName = (contactId) => {
    const c = contacts.find((c) => c.id === contactId);
    return c ? c.full_name : `#${contactId}`;
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !customer) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Müşteri bulunamadı.'}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/customers')}>
          Müşterilere Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }} maxWidth="lg">
      <Button onClick={() => navigate('/customers')} sx={{ mb: 2 }}>
        ← Müşterilere Dön
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" gutterBottom>{customer.name}</Typography>
          <Chip
            label={STATUS_LABELS[customer.status] || customer.status}
            color={customer.status === 'active' ? 'success' : 'default'}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <InfoItem label="Tür" value={TYPE_LABELS[customer.customer_type] || customer.customer_type} />
          <InfoItem label="Sektör" value={customer.industry} />
          <InfoItem label="Şehir" value={customer.city} />
          <InfoItem label="Telefon" value={customer.phone} />
          <InfoItem label="E-posta" value={customer.email} />
          <InfoItem label="Website" value={customer.website} />
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Kişiler (${contacts.length})`} />
          <Tab label={`Aktiviteler (${activities.length})`} />
        </Tabs>

        {/* Kişiler sekmesi */}
        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Button variant="contained" onClick={() => openContactDialog()}>
                + Yeni Kişi
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ad Soyad</TableCell>
                  <TableCell>Ünvan</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Telefon</TableCell>
                  <TableCell>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.full_name}</TableCell>
                    <TableCell>{c.title || '-'}</TableCell>
                    <TableCell>{c.email || '-'}</TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" color="primary" onClick={() => openContactDialog(c)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleContactDelete(c)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {contacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Bu müşteriye bağlı kişi yok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Aktiviteler sekmesi */}
        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, p: 2 }}>
              {contacts.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  Aktivite eklemek için önce bir kişi eklemelisin.
                </Typography>
              )}
              <Button variant="contained" onClick={openActivityDialog} disabled={contacts.length === 0}>
                + Yeni Aktivite
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell>Kişi</TableCell>
                  <TableCell>Not</TableCell>
                  <TableCell>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(a.created_at)}</TableCell>
                    <TableCell>
                      <Chip label={ACTIVITY_TYPES[a.type] || a.type} size="small" />
                    </TableCell>
                    <TableCell>{contactName(a.contact_id)}</TableCell>
                    <TableCell>{a.notes || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleActivityDelete(a)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {activities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Bu müşteriye ait aktivite yok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* Kişi Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingContactId ? 'Kişiyi Düzenle' : 'Yeni Kişi'}</DialogTitle>
        <Box component="form" onSubmit={handleContactSubmit}>
          <DialogContent>
            {contactError && <Alert severity="error" sx={{ mb: 2 }}>{contactError}</Alert>}
            <TextField
              fullWidth
              margin="normal"
              label="Ad Soyad"
              name="full_name"
              value={contactForm.full_name}
              onChange={handleContactChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ünvan"
              name="title"
              value={contactForm.title}
              onChange={handleContactChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="E-posta"
              name="email"
              type="email"
              value={contactForm.email}
              onChange={handleContactChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Telefon"
              name="phone"
              value={contactForm.phone}
              onChange={handleContactChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialogOpen(false)}>İptal</Button>
            <Button type="submit" variant="contained">
              {editingContactId ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Aktivite Dialog */}
      <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Yeni Aktivite</DialogTitle>
        <Box component="form" onSubmit={handleActivitySubmit}>
          <DialogContent>
            {activityError && <Alert severity="error" sx={{ mb: 2 }}>{activityError}</Alert>}
            <TextField
              fullWidth
              select
              margin="normal"
              label="Kişi"
              name="contact_id"
              value={activityForm.contact_id}
              onChange={handleActivityChange}
              required
            >
              {contacts.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.full_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              margin="normal"
              label="Tür"
              name="type"
              value={activityForm.type}
              onChange={handleActivityChange}
              required
            >
              {Object.entries(ACTIVITY_TYPES).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Not"
              name="notes"
              value={activityForm.notes}
              onChange={handleActivityChange}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActivityDialogOpen(false)}>İptal</Button>
            <Button type="submit" variant="contained">Kaydet</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default CustomerDetail;