import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Divider,
} from '@mui/material';
import dealService from '../services/dealService';
import offerService from '../services/offerService';
import customerService from '../services/customerService';

const STAGE_LABELS = {
  new: 'Yeni',
  contacted: 'İletişime Geçildi',
  proposal_sent: 'Teklif Gönderildi',
  negotiation: 'Müzakere',
  won: 'Kazanıldı',
  lost: 'Kaybedildi',
};

const OFFER_STATUS_LABELS = {
  pending: 'Beklemede',
  accepted: 'Kabul Edildi',
  rejected: 'Reddedildi',
};

function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const dealData = await dealService.getOne(id);
      setDeal(dealData);

      if (dealData.customer_company_id) {
        try {
          const customerData = await customerService.getOne(dealData.customer_company_id);
          setCustomer(customerData);
        } catch {
          setCustomer(null);
        }
      }

      const offersResult = await offerService.list({ deal_id: id });
      setOffers(offersResult.data || []);
    } catch (err) {
      setError('Fırsat bulunamadı veya yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  if (error || !deal) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Fırsat bulunamadı.'}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/deals')}>
          Fırsatlara Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Button onClick={() => navigate('/deals')} sx={{ mb: 2 }}>
        ← Fırsatlara Dön
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>{deal.title}</Typography>
            <Typography variant="body1" color="text.secondary">
              Müşteri: {customer ? customer.name : `#${deal.customer_company_id}`}
            </Typography>
          </Box>
          <Chip
            label={STAGE_LABELS[deal.status] || deal.status}
            color={deal.status === 'won' ? 'success' : deal.status === 'lost' ? 'error' : 'default'}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Değer</Typography>
            <Typography variant="body1">{deal.value ? `${deal.value} ₺` : '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Ürün/Hizmet</Typography>
            <Typography variant="body1">{deal.product || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Olasılık</Typography>
            <Typography variant="body1">{deal.probability ? `%${deal.probability}` : '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Beklenen Kapanış</Typography>
            <Typography variant="body1">{deal.expected_close_date || '-'}</Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom>Bu Fırsata Bağlı Teklifler</Typography>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Açıklama</TableCell>
              <TableCell>Değer</TableCell>
              <TableCell>Geçerlilik</TableCell>
              <TableCell>Durum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.description}</TableCell>
                <TableCell>{o.value} ₺</TableCell>
                <TableCell>{o.valid_until || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={OFFER_STATUS_LABELS[o.status] || o.status}
                    size="small"
                    color={o.status === 'accepted' ? 'success' : o.status === 'rejected' ? 'error' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
            {offers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Bu fırsata bağlı teklif yok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default DealDetail;