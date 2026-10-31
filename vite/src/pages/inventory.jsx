import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Avatar,
  Chip,
  Select,
  MenuItem,
  InputAdornment,
  Pagination,
  CircularProgress
} from '@mui/material';

import {
  InboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  HistoryOutlined,
  InboxOutlined as EmptyIcon
} from '@ant-design/icons';

const API_GET_INVENTORY = 'https://rms-backend-jeth.infy.click/rms_backend/api/inventory/get_inventory.php';
const API_UPDATE_STATUS = 'https://rms-backend-jeth.infy.click/rms_backend/api/inventory/update_status.php';
const API_ADD_REQUEST = 'https://rms-backend-jeth.infy.click/rms_backend/api/inventory/add_request.php';
const API_DELETE_REQUEST = 'https://rms-backend-jeth.infy.click/rms_backend/api/inventory/delete_request.php';
const API_GET_SUPPLIERS = 'https://rms-backend-jeth.infy.click/rms_backend/api/suppliers/get_suppliers.php';

export default function InventoryManagement() {
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [requestsList, setRequestsList] = useState([]);

  // Suppliers Dynamic State
  const [suppliersList, setSuppliersList] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');

  // Request Form State
  const [reqItem, setReqItem] = useState('');
  const [reqQty, setReqQty] = useState('');
  const [reqUnit, setReqUnit] = useState('Kg');
  const [reqPrice, setReqPrice] = useState('');
  const [reqSupplier, setReqSupplier] = useState('');
  const [reqNote, setReqNote] = useState('');

  const cardShadow = '0 2px 10px rgba(0,0,0,0.04)';

  // 1. Fetch Inventory Data from Database
  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_GET_INVENTORY);
      const data = await response.json();
      if (data.status === 'success') {
        setIngredients(data.ingredients || []);
        setRequestsList(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Suppliers List from API
  const fetchSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    try {
      const response = await fetch(API_GET_SUPPLIERS);
      const data = await response.json();
      if (data.status === 'success') {
        const activeSuppliers = (data.data || []).filter(s => s.status === 'Active');
        setSuppliersList(activeSuppliers);
        
        if (activeSuppliers.length > 0) {
          setReqSupplier(activeSuppliers[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
    fetchSuppliers();
  }, [fetchInventoryData, fetchSuppliers]);

  // 3. Change Status in Database
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(API_UPDATE_STATUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setIngredients(prev =>
          prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
        );
      } else {
        alert('បរាជ័យក្នុងការប្តូរ Status');
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  // 4. Send Request to Database
  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!reqItem || !reqQty || !reqSupplier) {
      alert('សូមបំពេញព័ត៌មានចាំបាច់ឱ្យបានគ្រប់គ្រាន់!');
      return;
    }

    const payload = {
      item: reqItem,
      qty: Number(reqQty),
      unit: reqUnit,
      price: reqPrice ? Number(reqPrice) : 0,
      supplier: reqSupplier,
      requestedBy: 'Kitchen Staff',
      note: reqNote
    };

    try {
      const response = await fetch(API_ADD_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === 'success') {
        setReqItem('');
        setReqQty('');
        setReqPrice('');
        setReqNote('');
        fetchInventoryData(); 
      } else {
        alert('បរាជ័យក្នុងការផ្ញើ Request');
      }
    } catch (error) {
      console.error('Add request error:', error);
    }
  };

  // 5. Delete Request from Database
  const handleDeleteRequest = async (requestCode) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុប Request ${requestCode} នេះមែនទេ?`)) return;

    try {
      const response = await fetch(API_DELETE_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_code: requestCode })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setRequestsList(prev => prev.filter(item => item.id !== requestCode));
      } else {
        alert('បរាជ័យក្នុងការលុប Request');
      }
    } catch (error) {
      console.error('Delete request error:', error);
    }
  };

  const totalIngredientsCount = ingredients.length;
  const inStockCount = ingredients.filter(i => i.status === 'In Stock').length;
  const lowStockCount = ingredients.filter(i => i.status === 'Low Stock').length;
  const expiredCount = ingredients.filter(i => i.status === 'Out of Stock').length;

  const filteredIngredients = ingredients.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = supplierFilter === 'All Suppliers' || item.supplier === supplierFilter;
    return matchesSearch && matchesSupplier;
  });

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* HEADER TITLE */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Inventory Management</Typography>
        <Typography variant="caption" color="text.secondary">Dashboard &gt; Inventory &amp; Requests</Typography>
      </Box>

      {/* TOP STATS CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Ingredients', value: totalIngredientsCount, sub: 'All items in DB', icon: <InboxOutlined />, color: '#2563eb', bg: '#dbeafe' },
          { title: 'In Stock', value: inStockCount, sub: 'Sufficient stock', icon: <CheckCircleOutlined />, color: '#16a34a', bg: '#dcfce7' },
          { title: 'Low Stock', value: lowStockCount, sub: 'Need to restock', icon: <WarningOutlined />, color: '#d97706', bg: '#fef3c7' },
          { title: 'Expired / Out', value: expiredCount, sub: 'Out of stock items', icon: <CalendarOutlined />, color: '#dc2626', bg: '#fee2e2' }
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ borderRadius: 3, boxShadow: cardShadow }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 48, height: 48, borderRadius: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>{stat.title}</Typography>
                    {totalIngredientsCount > 0 ? (
                      <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', my: 0.5 }}>
                        No Data
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">{stat.sub}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* INGREDIENTS LIST & REQUEST FORM SECTION */}
      <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="stretch">
        
        {/* LEFT: INGREDIENTS LIST TABLE */}
        <Grid item xs={12} md={7} lg={7.5} xl={8}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Ingredients List</Typography>
              <IconButton size="small" sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <DownloadOutlined />
              </IconButton>
            </Stack>

            {/* Filter Bar */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search ingredient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: { sm: 200 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined style={{ fontSize: 14 }} />
                    </InputAdornment>
                  )
                }}
              />
              <Select size="small" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} sx={{ minWidth: 140 }}>
                <MenuItem value="All Suppliers">All Suppliers</MenuItem>
                {suppliersList.map((sup) => (
                  <MenuItem key={sup.id} value={sup.name}>
                    {sup.name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            {/* Table */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress size={30} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>កំពុងទាញយកទិន្នន័យ...</Typography>
              </Box>
            ) : filteredIngredients.length > 0 ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>#</TableCell>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>IMAGE</TableCell>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>NAME</TableCell>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>UNIT</TableCell>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>QTY</TableCell>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>PRICE</TableCell>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>SUPPLIER</TableCell>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIngredients.map((item, index) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontSize: '12px' }}>{index + 1}</TableCell>
                        <TableCell>
                          <Avatar src={item.image} variant="rounded" sx={{ width: 28, height: 28 }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>{item.name}</TableCell>
                        <TableCell sx={{ fontSize: '12px' }}>{item.unit}</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 700 }}>{item.qty}</TableCell>
                        <TableCell sx={{ fontSize: '12px' }}>${item.price.toFixed(2)}</TableCell>
                        <TableCell sx={{ fontSize: '12px' }}>{item.supplier}</TableCell>
                        
                        <TableCell>
                          <Select
                            size="small"
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            sx={{
                              height: 26,
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: 1.5,
                              bgcolor:
                                item.status === 'In Stock' ? '#dcfce7' :
                                item.status === 'Low Stock' ? '#fef3c7' : '#fee2e2',
                              color:
                                item.status === 'In Stock' ? '#166534' :
                                item.status === 'Low Stock' ? '#92400e' : '#991b1b',
                              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                            }}
                          >
                            <MenuItem value="In Stock" sx={{ fontSize: '12px' }}>In Stock</MenuItem>
                            <MenuItem value="Low Stock" sx={{ fontSize: '12px' }}>Low Stock</MenuItem>
                            <MenuItem value="Out of Stock" sx={{ fontSize: '12px' }}>Out of Stock</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <EmptyIcon style={{ fontSize: 40, color: '#94a3b8' }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No ingredients found in database
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* RIGHT: REQUEST FORM (កាត់បន្ថយ Width ត្រឹមពាក់កណ្តាល 50%) */}
        <Grid item xs={12} md={5} lg={4.5} xl={4}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: cardShadow, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
              Request Ingredients
            </Typography>

            <form onSubmit={handleSendRequest}>
              <Stack spacing={1.5}>
                
                {/* Ingredient Name */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Ingredient Name *
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="e.g. Beef, Pork..."
                    value={reqItem}
                    onChange={(e) => setReqItem(e.target.value)}
                    required
                    sx={{ width: '50%' }}
                  />
                </Box>

                {/* Qty */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Qty *
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="0.00"
                    value={reqQty}
                    onChange={(e) => setReqQty(e.target.value)}
                    required
                    sx={{ width: '50%' }}
                  />
                </Box>

                {/* Unit */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Unit
                  </Typography>
                  <Select
                    size="small"
                    value={reqUnit}
                    onChange={(e) => setReqUnit(e.target.value)}
                    sx={{ width: '50%' }}
                  >
                    <MenuItem value="Kg">Kg</MenuItem>
                    <MenuItem value="Gram">Gram</MenuItem>
                    <MenuItem value="L">Liter</MenuItem>
                    <MenuItem value="Pack">Pack</MenuItem>
                  </Select>
                </Box>

                {/* Price ($) */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Price ($)
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="0.00"
                    value={reqPrice}
                    onChange={(e) => setReqPrice(e.target.value)}
                    sx={{ width: '50%' }}
                  />
                </Box>

                {/* Supplier */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Supplier *
                  </Typography>
                  <Select
                    size="small"
                    value={reqSupplier}
                    onChange={(e) => setReqSupplier(e.target.value)}
                    disabled={loadingSuppliers}
                    sx={{ width: '50%' }}
                  >
                    {loadingSuppliers ? (
                      <MenuItem disabled value="">
                        <CircularProgress size={14} sx={{ mr: 1 }} /> Loading...
                      </MenuItem>
                    ) : suppliersList.length === 0 ? (
                      <MenuItem disabled value="">No Suppliers</MenuItem>
                    ) : (
                      suppliersList.map((sup) => (
                        <MenuItem key={sup.id} value={sup.name}>
                          {sup.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </Box>

                {/* Note / Reason */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Note / Reason
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Note..."
                    value={reqNote}
                    onChange={(e) => setReqNote(e.target.value)}
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SendOutlined />}
                  fullWidth
                  sx={{ textTransform: 'none', borderRadius: 2, py: 0.8, bgcolor: '#2563eb', mt: 0.5 }}
                >
                  Submit Request
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>

      </Grid>

      {/* REQUEST HISTORY TABLE SECTION */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <HistoryOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                <Typography variant="subtitle1" fontWeight="bold">Request History</Typography>
              </Stack>
              {requestsList.length > 0 && (
                <Chip label={`${requestsList.length} Requests`} size="small" color="primary" />
              )}
            </Stack>

            {requestsList.length > 0 ? (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>REQUEST ID</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>DATE</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>INGREDIENT / MEAT</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>QUANTITY</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>TOTAL COST</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>SUPPLIER</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>REQUESTED BY</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>STATUS</TableCell>
                        <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 'bold' }}>ACTION</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requestsList.map((req) => (
                        <TableRow key={req.id} hover>
                          <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>{req.id}</TableCell>
                          <TableCell sx={{ fontSize: '12px' }}>{req.date}</TableCell>
                          <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>{req.item}</TableCell>
                          <TableCell sx={{ fontSize: '12px' }}>{req.qty} {req.unit}</TableCell>
                          <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                            ${req.price ? req.price.toFixed(2) : '0.00'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '12px' }}>
                            <Chip label={req.supplier} size="small" variant="outlined" sx={{ fontSize: '11px', height: 22 }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: '12px', color: 'text.secondary' }}>{req.requestedBy}</TableCell>
                          <TableCell>
                            <Chip
                              label={req.status}
                              size="small"
                              color={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'error'}
                              sx={{ height: 22, fontSize: '11px', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton size="small" color="primary">
                                <EyeOutlined style={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" color="warning">
                                <EditOutlined style={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteRequest(req.id)}>
                                <DeleteOutlined style={{ fontSize: 14 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" color="text.secondary">
                    Showing {requestsList.length} request entries
                  </Typography>
                  <Pagination count={1} page={1} size="small" color="primary" shape="rounded" />
                </Stack>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                <EmptyIcon style={{ fontSize: 36, color: '#94a3b8' }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                  មិនទាន់មានទិន្នន័យនៃការ Request នៅឡើយទេ (No requests submitted yet)
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  សូមបំពេញ Form ខាងលើដើម្បីផ្ញើការ Request គ្រឿងផ្សំ/សាច់ថ្មី
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
