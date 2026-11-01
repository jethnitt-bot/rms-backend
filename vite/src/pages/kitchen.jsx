import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  SearchOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const API_BASE_URL = 'http://localhost/rms_backend/api/kitchen';
export default function Kitchen() {
  const [tickets, setTickets] = useState([]);
  const [readyList, setReadyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_kitchen_orders.php`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        const activeQueue = [];
        const readyQueue = [];

        data.forEach((order) => {
          // 🟢 បំប្លែង Status ពី Database ដែលជាលេខ (INT) មកជា String ងាយស្រួលគ្រប់គ្រង
          const rawStatus = String(order.order_status ?? order.status ?? '').trim();

          let mappedStatus = 'new';
          if (rawStatus === '1' || rawStatus.toLowerCase() === 'preparing') {
            mappedStatus = 'preparing';
          } else if (rawStatus === '2' || rawStatus.toLowerCase() === 'ready') {
            mappedStatus = 'ready';
          } else if (rawStatus === '3' || rawStatus.toLowerCase() === 'completed') {
            mappedStatus = 'completed';
          } else {
            mappedStatus = 'new'; // 0 ឬតម្លៃផ្សេងទៀតចាត់ទុកជា New Order
          }

          const formattedTicket = {
            id: `ORD-${String(order.order_id).padStart(3, '0')}`,
            rawId: order.order_id,
            status: mappedStatus,
            table: order.table_number ? `តុ ${order.table_number}` : '(Dine-in)',
            time: order.created_at
              ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            items: order.items || []
          };

          if (mappedStatus === 'ready') {
            readyQueue.push({
              id: formattedTicket.id,
              rawId: order.order_id,
              table: formattedTicket.table,
              status: 'រួចរាល់'
            });
          } else {
            // បង្ហាញเฉพาะ Order ណាដែលនៅ Status 'new' ឬ 'preparing'
            if (mappedStatus !== 'completed') {
              activeQueue.push(formattedTicket);
            }
          }
        });

        setTickets(activeQueue);
        setReadyList(readyQueue);
        setError('');
      } else {
        setError(data.message || 'ទិន្នន័យដែលទទួលបានមិនត្រឹមត្រូវ');
      }
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
      setError(`មិនអាចទាញទិន្នន័យបានទេ: ${err.message}`);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateBackendStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update_order_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });

      const resData = await response.json();
      if (!response.ok || resData.status === 'error') {
        throw new Error(resData.message || 'Update failed');
      }
      fetchOrders(false);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(`ប្តូរ status មិនបានទេ: ${err.message}`);
    }
  };

  const matchesSearch = (ticket) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = ticket.id.toLowerCase().includes(q);
    const tableMatch = ticket.table.toLowerCase().includes(q);
    const itemMatch = ticket.items.some((item) =>
      (item.item_name || '').toLowerCase().includes(q)
    );
    return idMatch || tableMatch || itemMatch;
  };

  const newOrdersCount = tickets.filter((t) => t.status === 'new').length;
  const inProgressCount = tickets.filter((t) => t.status === 'preparing').length;
  const cardShadow = '0 2px 10px rgba(0,0,0,0.04)';

  return (
    <Box sx={{ p: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* STAT CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'New Orders', count: newOrdersCount, sub: 'Active Tickets', icon: <FileTextOutlined />, color: '#1976d2', bg: '#e3f2fd' },
          { title: 'In Progress', count: inProgressCount, sub: 'Under Preparation', icon: <HourglassOutlined />, color: '#ed6c02', bg: '#fff3e0' },
          { title: 'Ready to Serve', count: readyList.length, sub: 'Action Required', icon: <CheckCircleOutlined />, color: '#2e7d32', bg: '#e8f5e9' },
          { title: 'Average Prep Time', count: tickets.length > 0 ? '15 min' : '0 min', sub: 'Today', icon: <ClockCircleOutlined />, color: '#0288d1', bg: '#e1f5fe' }
        ].map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: cardShadow, height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 48, height: 48, borderRadius: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>{card.title}</Typography>
                    <Typography variant="h4" fontWeight="bold">{card.count}</Typography>
                    <Typography variant="caption" color="text.secondary">{card.sub}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* QUEUE */}
      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">Active Order Queue</Typography>
                <Button size="small" startIcon={<ReloadOutlined />} onClick={() => fetchOrders(true)} disabled={loading}>
                  Refresh
                </Button>
              </Stack>
              <TextField
                size="small"
                placeholder="ស្វែងរក ID, តុ, ឬ មុខម្ហូប..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined style={{ fontSize: 16 }} />
                    </InputAdornment>
                  )
                }}
                sx={{ width: { xs: '100%', sm: 280 } }}
              />
            </Stack>

            {loading && tickets.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {['new', 'preparing'].map((columnKey) => {
                  const columnTitle = columnKey === 'new' ? 'ថ្មី (រង់ចាំ)' : 'កំពុងធ្វើ';

                  const filteredTickets = tickets
                    .filter((t) => t.status === columnKey)
                    .filter(matchesSearch);

                  return (
                    <Grid item xs={12} sm={6} key={columnKey}>
                      <Box sx={{ bgcolor: '#fafafa', p: 1.5, borderRadius: 2, minHeight: 400, maxHeight: 650, overflowY: 'auto' }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
                          {columnTitle} ({filteredTickets.length})
                        </Typography>

                        <Stack spacing={2}>
                          {filteredTickets.map((ticket) => (
                            <Card key={ticket.id} variant="outlined" sx={{ borderRadius: 2 }}>
                              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">{ticket.id}</Typography>
                                    <Typography variant="caption" color="text.secondary">{ticket.table}</Typography>
                                  </Box>
                                  <Chip
                                    icon={<FieldTimeOutlined style={{ fontSize: 14 }} />}
                                    label={ticket.time}
                                    size="small"
                                    sx={{ bgcolor: '#fff8e1', color: '#b78103', fontWeight: 'bold' }}
                                  />
                                </Stack>

                                <Divider sx={{ my: 1 }} />

                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', p: 0.5 }}>ចំនួន</TableCell>
                                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', p: 0.5 }}>មុខម្ហូប</TableCell>
                                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', p: 0.5 }}>ចំណាំ</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {ticket.items.map((item, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell sx={{ fontSize: '12px', p: 0.5 }}>{item.quantity}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', p: 0.5, fontWeight: 500 }}>{item.item_name}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', p: 0.5, color: 'error.main', fontWeight: 'bold' }}>
                                          {item.notes || '-'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>

                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                  {ticket.status === 'new' ? (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      fullWidth
                                      color="primary"
                                      onClick={() => updateBackendStatus(ticket.rawId, 'preparing')}
                                    >
                                      ចាប់ផ្តើមធ្វើ
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      fullWidth
                                      color="success"
                                      onClick={() => updateBackendStatus(ticket.rawId, 'ready')}
                                    >
                                      ធ្វើរួចរាល់
                                    </Button>
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          ))}

                          {filteredTickets.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                              មិនមានការកុម្ម៉ង់ទេ
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* READY TO SERVE QUEUE */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow, position: 'sticky', top: 20 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>មុខម្ហូបធ្វើរួចរាល់</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>បញ្ជីរង់ចាំលើកជូនភ្ញៀវ</Typography>

            {readyList.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  មិនទាន់មានមុខម្ហូបរួចរាល់ទេ។
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5} sx={{ maxHeight: 550, overflowY: 'auto' }}>
                {readyList.map((item) => (
                  <Card key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>{item.id}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">{item.table}</Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => updateBackendStatus(item.rawId, 'completed')}
                        sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        បានលើកជូន
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
