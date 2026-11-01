import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Stack, Avatar, Chip, Select, MenuItem, InputAdornment, Pagination, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress, Grid
} from '@mui/material';

import {
  BankOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined, TruckOutlined,
  SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SaveOutlined, ReloadOutlined
} from '@ant-design/icons';

// កំណត់ API URLs (កែប្រែ path ឱ្យត្រូវតាម Folder backend របស់អ្នក)
const API_GET_SUPPLIERS = 'https://rms-backend-jeth.infy.click/rms_backend/api/suppliers/get_suppliers.php';
const API_SAVE_SUPPLIER = 'https://rms-backend-jeth.infy.click/rms_backend/api/suppliers/save_supplier.php';
const API_DELETE_SUPPLIER = 'https://rms-backend-jeth.infy.click/rms_backend/api/suppliers/delete_supplier.php';

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Form States
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active'
  });

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // មុខងារសម្រាប់ Fetch ទិន្នន័យចេញពី API
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_GET_SUPPLIERS);
      const data = await response.json();
      if (data.status === 'success') {
        setSuppliers(data.data || []);
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Filter logic
  const filteredSuppliers = suppliers.filter((sup) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (sup.name && sup.name.toLowerCase().includes(term)) ||
                          (sup.contact && sup.contact.toLowerCase().includes(term)) ||
                          (sup.phone && sup.phone.includes(term)) ||
                          (sup.email && sup.email.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'All Status' || sup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const paginatedSuppliers = filteredSuppliers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setEditId(null);
    setFormData({ companyName: '', contactPerson: '', phone: '', email: '', address: '', status: 'Active' });
  };

  const handleEdit = (sup) => {
    setEditId(sup.id);
    setFormData({
      companyName: sup.name || '',
      contactPerson: sup.contact || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      status: sup.status || 'Active'
    });
  };

  // មុខងារ Save (Insert / Update) ទៅ API
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.phone || !formData.address) {
      alert('សូមបំពេញព័ត៌មានចាំបាច់ (*) ឱ្យបានគ្រប់!');
      return;
    }

    const payload = {
      id: editId,
      name: formData.companyName,
      contact: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      status: formData.status
    };

    try {
      const response = await fetch(API_SAVE_SUPPLIER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === 'success') {
        handleResetForm();
        fetchSuppliers(); // Refresh ទិន្នន័យ
      } else {
        alert('បរាជ័យក្នុងការរក្សាទុក៖ ' + (data.message || ''));
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  // មុខងារ Delete ទៅ API
  const handleDelete = async (id) => {
    if (window.confirm('តើអ្នកប្រាកដជាចង់លុប Supplier នេះមែនទេ?')) {
      try {
        const response = await fetch(API_DELETE_SUPPLIER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.status === 'success') {
          if (editId === id) handleResetForm();
          fetchSuppliers(); // Refresh ទិន្នន័យ
        } else {
          alert('បរាជ័យក្នុងការលុប៖ ' + (data.message || ''));
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const activeCount = suppliers.filter(s => s.status === 'Active').length;
  const inactiveCount = suppliers.filter(s => s.status === 'Inactive').length;

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Supplier Management</Typography>
        <Typography variant="caption" color="text.secondary">Dashboard &gt; Suppliers</Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Suppliers', val: suppliers.length, icon: <BankOutlined />, color: '#2563eb', bg: '#dbeafe' },
          { title: 'Active Suppliers', val: activeCount, icon: <UsergroupAddOutlined />, color: '#16a34a', bg: '#dcfce7' },
          { title: 'Inactive Suppliers', val: inactiveCount, icon: <UsergroupDeleteOutlined />, color: '#dc2626', bg: '#fee2e2' },
          { title: 'Deliveries This Month', val: '0', icon: <TruckOutlined />, color: '#d97706', bg: '#fef3c7' }
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 44, height: 44, borderRadius: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{card.title}</Typography>
                    <Typography variant="h5" fontWeight="bold">{card.val}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Layout Flexbox */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
        
        {/* ផ្នែកឆ្វេង៖ Supplier List */}
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Supplier List</Typography>
            </Box>

            {/* Filter Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
              <TextField
                size="small"
                placeholder="Search supplier..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                sx={{ width: { xs: '100%', sm: 220 } }}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><SearchOutlined style={{ fontSize: 14 }} /></InputAdornment>)
                }}
              />
              <Select
                size="small"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="All Status">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </Stack>

            {/* Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>COMPANY NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>PHONE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ADDRESS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          មិនទាន់មានទិន្នន័យ Supplier នៅក្នុងប្រព័ន្ធនៅឡើយទេ
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSuppliers.map((row, index) => (
                        <TableRow key={row.id} hover selected={editId === row.id}>
                          <TableCell>{(page - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                          <TableCell>{row.phone}</TableCell>
                          <TableCell>{row.address}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                bgcolor: row.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                color: row.status === 'Active' ? '#166534' : '#991b1b',
                                fontWeight: 600,
                                fontSize: '10px'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton size="small" color="primary" onClick={() => setSelectedSupplier(row)}>
                                <EyeOutlined style={{ fontSize: 13 }} />
                              </IconButton>
                              <IconButton size="small" color="warning" onClick={() => handleEdit(row)}>
                                <EditOutlined style={{ fontSize: 13 }} />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                                <DeleteOutlined style={{ fontSize: 13 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
              <Typography variant="caption" color="text.secondary">
                Showing {filteredSuppliers.length === 0 ? 0 : (page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredSuppliers.length)} of {filteredSuppliers.length} entries
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                size="small"
                color="primary"
                shape="rounded"
              />
            </Stack>
          </Paper>
        </Box>

        {/* ផ្នែកស្តាំ៖ Form Add / Edit */}
        <Box sx={{ width: { xs: '100%', lg: '310px' }, flexShrink: 0 }}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {editId ? 'Edit Supplier' : 'Add Supplier'}
              </Typography>
              {editId && (
                <Button size="small" startIcon={<ReloadOutlined />} onClick={handleResetForm} sx={{ textTransform: 'none', fontSize: 11 }}>
                  Clear
                </Button>
              )}
            </Stack>

            <form onSubmit={handleSave}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" fontWeight={600}>Company Name *</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={600}>Contact Person *</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter contact person"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={600}>Phone Number *</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={600}>Email</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={600}>Address *</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={600}>Status *</Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    sx={{ mt: 0.5 }}
                  >
                    <MenuItem value="Active">• Active</MenuItem>
                    <MenuItem value="Inactive">• Inactive</MenuItem>
                  </Select>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    startIcon={<SaveOutlined />}
                    sx={{ textTransform: 'none', bgcolor: '#2563eb', borderRadius: 2 }}
                  >
                    {editId ? 'Update' : 'Save'}
                  </Button>
                  
                  {editId && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleResetForm}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Box>

      {/* Dialog Preview Details */}
      <Dialog open={Boolean(selectedSupplier)} onClose={() => setSelectedSupplier(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Supplier Details</DialogTitle>
        <DialogContent dividers>
          {selectedSupplier && (
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Company:</strong> {selectedSupplier.name}</Typography>
              <Typography variant="body2"><strong>Contact Person:</strong> {selectedSupplier.contact}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {selectedSupplier.phone}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {selectedSupplier.email || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Address:</strong> {selectedSupplier.address}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {selectedSupplier.status}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSupplier(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
