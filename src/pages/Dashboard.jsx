import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Grid, CircularProgress, Avatar } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DescriptionIcon from '@mui/icons-material/Description';
import PaidIcon from '@mui/icons-material/Paid';
import authService from '../services/authService';
import leadService from '../services/leadService';
import customerService from '../services/customerService';
import dealService from '../services/dealService';
import offerService from '../services/offerService';

function StatCard({ label, value, icon, color }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}
    >
      <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Paper>
  );
}

function Dashboard() {
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [leadsResult, customersResult, dealsResult, offersResult] = await Promise.all([
          leadService.list({ limit: 100 }),
          customerService.list({ limit: 100 }),
          dealService.list({ limit: 100 }),
          offerService.list({ limit: 100 }),
        ]);

        const deals = dealsResult.data || [];
        const wonDeals = deals.filter((d) => d.status === 'won');
        const openDeals = deals.filter((d) => !d.is_closed);
        const totalWonValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

        setStats({
          leadsTotal: leadsResult.meta?.total ?? (leadsResult.data || []).length,
          customersTotal: customersResult.meta?.total ?? (customersResult.data || []).length,
          dealsOpen: openDeals.length,
          dealsWon: wonDeals.length,
          totalWonValue,
          offersPending: (offersResult.data || []).filter((o) => o.status === 'pending').length,
        });
      } catch (err) {
        // istatistikler yüklenemezse sessizce geç
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const initial = user?.email ? user.email[0].toUpperCase() : '?';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2c5282 100%)',
          color: 'white',
          py: 5,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#4A90A4', width: 64, height: 64, fontSize: 28 }}>
              {initial}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Hoş geldin, {user?.email}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mt: 0.5 }}>
                Şirket: {user?.companySlug} &nbsp;•&nbsp; Rol: {user?.role}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && stats && (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
              Genel Bakış
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  label="Müşteri Adayı"
                  value={stats.leadsTotal}
                  icon={<PeopleAltIcon />}
                  color="#4A90A4"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  label="Müşteri Şirketi"
                  value={stats.customersTotal}
                  icon={<BusinessIcon />}
                  color="#1E3A5F"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  label="Açık Fırsat"
                  value={stats.dealsOpen}
                  icon={<TrendingUpIcon />}
                  color="#E9A23B"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  label="Kazanılan Fırsat"
                  value={stats.dealsWon}
                  icon={<EmojiEventsIcon />}
                  color="#2E7D32"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  label="Bekleyen Teklif"
                  value={stats.offersPending}
                  icon={<DescriptionIcon />}
                  color="#8E24AA"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  label="Toplam Kazanılan (₺)"
                  value={stats.totalWonValue.toLocaleString('tr-TR')}
                  icon={<PaidIcon />}
                  color="#C62828"
                />
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;