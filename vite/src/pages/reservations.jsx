import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Stack,
  MenuItem,
  Select,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Pagination,
  Divider,
  Tooltip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  DollarOutlined,
  PrinterOutlined,
  SearchOutlined,
  CloseOutlined
} from '@ant-design/icons';

// 🟢 កែប្រែ URL មកកាន់ Localhost
const API_BASE_URL = 'http://localhost/rms_backend/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmed': return { bg: '#e0f2fe', color: '#0369a1' };
    case 'Pending': return { bg: '#fef3c7', color: '#b45309' };
    case 'Seated': return { bg: '#dcfce7', color: '#15803d' };
    case 'Cancelled': return { bg: '#fee2e2', color: '#b91c1c' };
    default: return { bg: '#f1f5f9', color: '#475569' };
  }
};

const getPaymentColor = (paymentStatus) =>
  paymentStatus === 'Pay Ready' ? { bg: '#dcfce7', color: '#15803d' } : { bg: '#fee2e2', color: '#b91c1c' };

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [panelMode, setPanelMode] = useState('add');
  const [showForm, setShowForm] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [invoiceReservationId, setInvoiceReservationId] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState('All');

  const [formData, setFormData] = useState({
    table_id: '',
    customerName: '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    specialRequests: '',
    status: 'Confirmed'
  });

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tables/get_tables.php`);
      const data = await res.json();
      if (Array.isArray(data)) setTables(data);
      else setTables([]);
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reservations/get_reservations.php`);
      const data = await res.json();
      if (Array.isArray(data)) setReservations(data);
      else setReservations([]);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      table_id: '',
      customerName: '',
      phone: '',
      date: '',
      time: '',
      guests: '',
      specialRequests: '',
      status: 'Confirmed'
    });
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setPanelMode('add');
    setShowInvoice(false);
    setShowForm(true);
  };

  const openInvoice = (reservation) => {
    setInvoiceReservationId(reservation.id);
    setShowForm(false);
    setShowInvoice(true);
  };

  const handleSaveReservation = async (e) => {
    e.preventDefault();
    if (!formData.table_id || !formData.date || !formData.time) {
      alert('សូមជ្រើសរើស Table និងបំពេញ Date & Time!');
      return;
    }

    const payload = {
      id: editingId,
      table_id: formData.table_id,
      customer_name: formData.customerName,
      phone: formData.phone,
      date: formData.date,
      time: formData.time,
      guests: parseInt(formData.guests, 10) || 1,
      status: formData.status
    };

    try {
      const endpoint = editingId ? 'update_reservation.php' : 'create_reservation.php';
      const res = await fetch(`${API_BASE_URL}/reservations/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.status === 'success' || res.ok) {
        alert(editingId ? 'កែប្រែបានជោគជ័យ!' : 'បង្កើតការកក់បានជោគជ័យ!');
        fetchReservations();
        resetForm();
        setShowForm(false);
      } else {
        alert(result.message || 'មានបញ្ហាក្នុងการរក្សាទុក!');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ!');
    }
  };

  const handleEdit = (e, reservation) => {
    e.stopPropagation();
    setEditingId(reservation.id);
    setFormData({
      table_id: reservation.table_id || '',
      customerName: reservation.customer_name || '',
      phone: reservation.phone || '',
      date: reservation.date || '',
      time: reservation.time || '',
      guests: String(reservation.guests || ''),
      specialRequests: '',
      status: reservation.status || 'Confirmed'
    });
    setPanelMode('edit');
    setShowInvoice(false);
    setShowForm(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('តើអ្នកពិតជាចង់លុប Reservation នេះមែនទេ?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/reservations/delete_reservation.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const result = await res.json();
        if (result.status === 'success' || res.ok) {
          fetchReservations();
          if (invoiceReservationId === id) setShowInvoice(false);
        } else {
          alert(result.message || 'មិនអាចលុបបានទេ!');
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const markAsPaid = (id) => {
    setReservations(reservations.map((r) => (r.id === id ? { ...r, paymentStatus: 'Pay Ready' } : r)));
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        String(r.id).toLowerCase().includes(search) ||
        (r.table_name && r.table_name.toLowerCase().includes(search)) ||
        (r.customer_name && r.customer_name.toLowerCase().includes(search)) ||
        (r.phone && r.phone.includes(search));

      const matchesTable = selectedTable === 'All' || String(r.table_id) === String(selectedTable);
      return matchesSearch && matchesTable;
    });
  }, [reservations, searchTerm, selectedTable]);

  const totalReservations = reservations.length;
  const confirmedCount = reservations.filter((r) => r.status === 'Confirmed').length;
  const pendingCount = reservations.filter((r) => r.status === 'Pending').length;
  const cancelledCount = reservations.filter((r) => r.status === 'Cancelled').length;

  const invoiceReservation = reservations.find((r) => r.id === invoiceReservationId);
  const invoiceTotal = invoiceReservation && invoiceReservation.orderItems
    ? invoiceReservation.orderItems.reduce((sum, item) => sum + item.qty * item.price, 0)
    : 0;

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { title: 'Total Reservations', count: totalReservations, sub: `Total: ${totalReservations}`, icon: <BellOutlined />, color: '#2563eb', bg: '#dbeafe' },
          { title: 'Confirmed', count: confirmedCount, sub: 'Confirmed', icon: <CheckCircleOutlined />, color: '#16a34a', bg: '#dcfce7' },
          { title: 'Pending', count: pendingCount, sub: 'Pending', icon: <ClockCircleOutlined />, color: '#d97706', bg: '#fef3c7' },
          { title: 'Cancelled', count: cancelledCount, sub: 'Cancelled', icon: <CloseCircleOutlined />, color: '#dc2626', bg: '#fee2e2' }
        ].map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', height: '100%' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 44, height: 44 }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">{card.title}</Typography>
                    <Typography variant="h5" fontWeight="bold">{card.count}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">{card.sub}</Typography>
                  <Button size="small" sx={{ p: 0, textTransform: 'none', fontSize: '0.75rem' }}>View all &gt;</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Area */}
      <Grid container spacing={2}>
        {/* LEFT: RESERVATION TABLE */}
        <Grid item xs={12} md={showForm || showInvoice ? 6 : 12}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">Reservations List</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<PlusOutlined />}
                onClick={() => {
                  if (showForm) {
                    setShowForm(false);
                  } else {
                    openAddForm();
                  }
                }}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                {showForm ? 'Hide Form' : 'Add Reservation'}
              </Button>
            </Stack>

            {/* Filter Bar */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4.5}>
                <TextField
                  placeholder="Search..."
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4.5}>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                  >
                    <MenuItem value="All">All Tables</MenuItem>
                    {tables.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.table_number || t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button fullWidth variant="outlined" startIcon={<CalendarOutlined />} size="small" sx={{ height: '100%', textTransform: 'none', borderColor: '#cbd5e1', color: '#475569', fontSize: '11px' }}>
                  Filter
                </Button>
              </Grid>
            </Grid>

            {/* Reservations Table */}
            <TableContainer sx={{ borderRadius: 2, border: '1px solid #f1f5f9' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', py: 1, px: 1, fontSize: '12px' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 1, px: 1, fontSize: '12px' }}>Table</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 1, px: 1, fontSize: '12px' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 1, px: 1, fontSize: '12px' }}>Date & Time</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', py: 1, px: 1, fontSize: '12px' }}>Guests</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 1, px: 1, fontSize: '12px' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', py: 1, px: 1, fontSize: '12px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary', fontSize: '12px' }}>
                        ពុំមានទិន្នន័យឡើយ
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((r) => {
                      const statusStyle = getStatusColor(r.status);
                      const isSelected = (showInvoice && invoiceReservationId === r.id);

                      return (
                        <TableRow
                          key={r.id}
                          hover
                          onClick={() => openInvoice(r)}
                          selected={isSelected}
                          sx={{ cursor: 'pointer', '& td': { py: 1, px: 1, fontSize: '12px' } }}
                        >
                          <TableCell sx={{ fontWeight: '500' }}>#{r.id}</TableCell>
                          <TableCell>
                            <Chip label={r.table_name || 'N/A'} size="small" sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 'bold', height: 20, fontSize: '11px' }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: '500' }}>{r.customer_name || 'Walk-in'}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>{r.phone}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '11px' }}>{r.date}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>{r.time}</Typography>
                          </TableCell>
                          <TableCell align="center">{r.guests}</TableCell>
                          <TableCell>
                            <Chip label={r.status} size="small" sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 'bold', height: 20, fontSize: '10px' }} />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.2} justifyContent="center">
                              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); openInvoice(r); }}>
                                <EyeOutlined style={{ fontSize: '14px' }} />
                              </IconButton>
                              <IconButton size="small" color="warning" onClick={(e) => handleEdit(e, r)}>
                                <EditOutlined style={{ fontSize: '14px' }} />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={(e) => handleDelete(e, r.id)}>
                                <DeleteOutlined style={{ fontSize: '14px' }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Total: {filteredReservations.length} items
              </Typography>
              <Pagination count={Math.max(1, Math.ceil(filteredReservations.length / 5))} color="primary" shape="rounded" size="small" />
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT SIDEBAR: NEW / EDIT RESERVATION FORM */}
        {showForm && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', position: 'sticky', top: 20 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {panelMode === 'edit' ? 'Edit Reservation' : 'New Reservation'}
                </Typography>
                <IconButton size="small" onClick={() => setShowForm(false)}>
                  <CloseOutlined />
                </IconButton>
              </Stack>

              <Box component="form" onSubmit={handleSaveReservation}>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.2, display: 'block' }}>
                      Select Table <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        name="table_id"
                        value={formData.table_id}
                        onChange={handleChange}
                        displayEmpty
                        MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                      >
                        <MenuItem value="" disabled>Choose a table</MenuItem>
                        {loadingTables ? (
                          <MenuItem disabled>កំពុងទាញយក...</MenuItem>
                        ) : (
                          tables.map((t) => (
                            <MenuItem key={t.id} value={t.id}>
                              {t.table_number || t.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.2, display: 'block' }}>Customer Name</Typography>
                    <TextField
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.2, display: 'block' }}>Phone Number</Typography>
                    <TextField
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 012 345 678"
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.2, display: 'block' }}>
                      Date <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.2, display: 'block' }}>
                      Time <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.2, display: 'block' }}>Guests (Pax)</Typography>
                    <TextField
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      placeholder="Number of guests"
                      type="number"
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.1, display: 'block' }}>
                      Status <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <RadioGroup row name="status" value={formData.status} onChange={handleChange}>
                      <FormControlLabel value="Confirmed" control={<Radio size="small" />} label={<Typography variant="caption">Confirmed</Typography>} />
                      <FormControlLabel value="Pending" control={<Radio size="small" />} label={<Typography variant="caption">Pending</Typography>} />
                    </RadioGroup>
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.2, display: 'block' }}>Special Requests</Typography>
                    <TextField
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      placeholder="Notes..."
                      multiline
                      rows={2}
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      fullWidth
                      onClick={() => { resetForm(); setShowForm(false); }}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={<PlusOutlined />}
                      sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}
                    >
                      {panelMode === 'edit' ? 'Update' : 'Save'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* RIGHT SIDEBAR: INVOICE VIEW */}
        {showInvoice && invoiceReservation && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', position: 'sticky', top: 20 }}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">Invoice Summary</Typography>
                <IconButton size="small" onClick={() => setShowInvoice(false)}>
                  <CloseOutlined />
                </IconButton>
              </Stack>

              <Box sx={{ mb: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Chip label={invoiceReservation.table_name || 'N/A'} size="small" sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 'bold', mb: 0.5, height: 20, fontSize: '11px' }} />
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '13px' }}>
                  {invoiceReservation.customer_name || 'Walk-in Customer'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '11px' }}>
                  {invoiceReservation.phone || 'No phone number'}
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, fontSize: '12px' }}>Order Details</Typography>

              {!invoiceReservation.orderItems || invoiceReservation.orderItems.length === 0 ? (
                <Box sx={{ py: 2, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2, mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    មិនទាន់មានការកម្ម៉ង់ម្ហូបទេ
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1} sx={{ mb: 1.5, maxHeight: 150, overflowY: 'auto', pr: 1 }}>
                  {invoiceReservation.orderItems.map((item, idx) => (
                    <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: '500' }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>${item.price.toFixed(2)} x {item.qty}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '12px' }}>${(item.qty * item.price).toFixed(2)}</Typography>
                    </Stack>
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">Total Amount</Typography>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">${invoiceTotal.toFixed(2)}</Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                {invoiceReservation.paymentStatus === 'Not Pay' || !invoiceReservation.paymentStatus ? (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    fullWidth
                    startIcon={<DollarOutlined />}
                    onClick={() => markAsPaid(invoiceReservation.id)}
                    sx={{ textTransform: 'none', borderRadius: 2, fontSize: '12px' }}
                  >
                    Mark as Pay Ready
                  </Button>
                ) : (
                  <Button variant="contained" size="small" fullWidth startIcon={<PrinterOutlined />} sx={{ textTransform: 'none', borderRadius: 2, fontSize: '12px' }}>
                    Print Invoice
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ReservationsPage;