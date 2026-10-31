import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Stack, Select, MenuItem, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, CircularProgress
} from '@mui/material';

import {
  SearchOutlined, EyeOutlined, ReloadOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  PlusOutlined, DeleteOutlined, ShoppingCartOutlined, SyncOutlined
} from '@ant-design/icons';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State សម្រាប់ Modal បង្កើត Order ថ្មី
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(1);

  // State សម្រាប់បញ្ជីមុខម្ហូបដែលបានជ្រើសក្នុង Order
  const [selectedItems, setSelectedItems] = useState([]);

  // 🟢 ១. ទាញយក Categories, Menu Items និង Orders ពី Backend API
  const fetchData = async () => {
    setLoading(true);
    try {
      const resOrders = await fetch('https://rms-backend-jeth.infy.click/rms_backend/api/orders/get_orders.php');
      const dataOrders = await resOrders.json();
      if (Array.isArray(dataOrders)) setOrders(dataOrders);

      const resCat = await fetch('https://rms-backend-jeth.infy.click/rms_backend/api/orders/get_categories.php');
      const dataCat = await resCat.json();
      if (Array.isArray(dataCat)) setCategories(dataCat);

      const resMenu = await fetch('https://rms-backend-jeth.infy.click/rms_backend/api/orders/get_menu_items.php');
      const dataMenu = await resMenu.json();
      if (Array.isArray(dataMenu)) setMenuItems(dataMenu);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🟢 ២. Function សម្រាប់លុប Order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុប Order ID: ORD-${orderId} នេះមែនទេ?`)) {
      try {
        const res = await fetch(`https://rms-backend-jeth.infy.click/rms_backend/api/orders/delete_order.php?id=${orderId}`, {
          method: 'DELETE',
        });
        const result = await res.json();

        if (result.status === 'success') {
          alert('លុប Order បានជោគជ័យ!');
          fetchData();
        } else {
          alert('មិនអាចលុបបានទេ៖ ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!');
      }
    }
  };

  // 🟢 ៣. នៅពេលបើក Modal ឱ្យវា Setup Item ដំបូងដោយស្វ័យប្រវត្តិ
  const handleOpenModal = () => {
    if (categories.length > 0) {
      const firstCatId = categories[0].id;
      const filtered = menuItems.filter(m => Number(m.category_id) === Number(firstCatId));
      
      if (filtered.length > 0) {
        setSelectedItems([{
          category_id: firstCatId,
          menu_item_id: filtered[0].id,
          name: filtered[0].name,
          price: Number(filtered[0].price),
          qty: 1
        }]);
      } else {
        setSelectedItems([{
          category_id: firstCatId,
          menu_item_id: '',
          name: '',
          price: 0,
          qty: 1
        }]);
      }
    } else {
      setSelectedItems([]);
    }
    setOpenCreateModal(true);
  };

  // បន្ថែមជួរ Item ថ្មី
  const handleAddItem = () => {
    const firstCatId = categories.length > 0 ? categories[0].id : '';
    const filtered = menuItems.filter(m => Number(m.category_id) === Number(firstCatId));
    const firstMenu = filtered.length > 0 ? filtered[0] : null;

    setSelectedItems([
      ...selectedItems,
      {
        category_id: firstCatId,
        menu_item_id: firstMenu ? firstMenu.id : '',
        name: firstMenu ? firstMenu.name : '',
        price: firstMenu ? Number(firstMenu.price) : 0,
        qty: 1
      }
    ]);
  };

  // លុប Item ក្នុង Modal Create
  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  // ផ្លាស់ប្តូរ Category ឬ Menu Item
  const handleItemChange = (index, field, value) => {
    const updated = [...selectedItems];

    if (field === 'category_id') {
      const catId = Number(value);
      updated[index].category_id = catId;
      const availableMenus = menuItems.filter(m => Number(m.category_id) === catId);

      if (availableMenus.length > 0) {
        updated[index].menu_item_id = availableMenus[0].id;
        updated[index].name = availableMenus[0].name;
        updated[index].price = Number(availableMenus[0].price);
      } else {
        updated[index].menu_item_id = '';
        updated[index].name = '';
        updated[index].price = 0;
      }
    } 
    else if (field === 'menu_item_id') {
      const itemId = Number(value);
      const selectedMenu = menuItems.find(m => Number(m.id) === itemId);

      if (selectedMenu) {
        updated[index].menu_item_id = selectedMenu.id;
        updated[index].name = selectedMenu.name;
        updated[index].price = Number(selectedMenu.price);
      }
    } 
    else if (field === 'qty') {
      updated[index].qty = Math.max(1, parseInt(value) || 1);
    }

    setSelectedItems(updated);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  // បញ្ជូន Order ទៅ API
  const handleCreateOrder = async () => {
    const validItems = selectedItems.filter(i => i.menu_item_id !== '');
    if (validItems.length === 0) {
      alert('សូមជ្រើសរើសមុខម្ហូបយ៉ាងហោចណាស់ ១!');
      return;
    }

    const payload = {
      table_id: selectedTableId,
      customer_id: null,
      total_amount: calculateTotal(),
      items: validItems.map(item => ({
        menu_item_id: item.menu_item_id,
        quantity: item.qty,
        unit_price: item.price
      }))
    };

    try {
      const res = await fetch('https://rms-backend-jeth.infy.click/rms_backend/api/orders/create_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === 'success') {
        alert('បង្កើត Order ជោគជ័យ!');
        setOpenCreateModal(false);
        fetchData();
      } else {
        alert('កំហុស៖ ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('មិនអាចទាក់ទង Server បានទេ!');
    }
  };

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'Preparing').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;

  const filteredOrders = orders.filter(order => {
    const orderNo = order.order_no || `ORD-${order.id}`;
    const tableStr = `Table ${order.table_id || ''}`;
    const matchesSearch = orderNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tableStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'Completed':
        return <Chip icon={<CheckCircleOutlined />} label="Completed" color="success" size="small" />;
      case 'Preparing':
        return <Chip icon={<ClockCircleOutlined />} label="Preparing" color="warning" size="small" />;
      case 'Pending':
        return <Chip icon={<ClockCircleOutlined />} label="Pending" color="info" size="small" />;
      case 'Cancelled':
        return <Chip icon={<CloseCircleOutlined />} label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status || 'Pending'} size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      
      {/* 🟢 Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, width: '100%' }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e293b' }}>
            Orders Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Dashboard &gt; Orders
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={handleOpenModal}
          sx={{ 
            textTransform: 'none', 
            bgcolor: '#1677ff', 
            fontWeight: 'bold', 
            px: 3, 
            py: 1.2, 
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(22, 119, 255, 0.2)',
            '&:hover': { bgcolor: '#0958d9' }
          }}
        >
          Create New Order
        </Button>
      </Box>

      {/* 🟢 Summary Cards Section (ប្តូរដាក់ Border ព័ទ្ធជុំវិញកាត) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Orders", count: totalOrdersCount, icon: <ShoppingCartOutlined />, color: '#1677ff', bg: '#e6f4ff', border: '#93c5fd' },
          { title: "Pending Orders", count: pendingOrdersCount, icon: <ClockCircleOutlined />, color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc' },
          { title: "Preparing Orders", count: preparingOrdersCount, icon: <SyncOutlined spin />, color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
          { title: "Completed Orders", count: completedOrdersCount, icon: <CheckCircleOutlined />, color: '#16a34a', bg: '#dcfce7', border: '#86efac' }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: `1.5px solid ${item.border}`, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Box sx={{ pr: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    {item.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#0f172a' }}>
                    {item.count}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    bgcolor: item.bg, 
                    color: item.color, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 54, 
                    height: 54, 
                    borderRadius: 2.5,
                    fontSize: 24,
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 🟢 Filter and Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #f0f0f0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Order ID or Table..."
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
          <Grid item xs={12} sm={3}>
            <Select
              fullWidth
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Preparing">Preparing</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={5} sx={{ textAlign: { sm: 'right' } }}>
            <Button
              variant="outlined"
              startIcon={<ReloadOutlined />}
              onClick={() => { setSearchTerm(''); setStatusFilter('All'); fetchData(); }}
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              Refresh Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 🟢 Orders Table */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ORDER ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>TABLE</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ITEMS OVERVIEW</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>CREATED AT</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>TOTAL AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    មិនទាន់មានទិន្នន័យ Order ឡើយ
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.order_no || `ORD-${row.id}`}</TableCell>
                    <TableCell>Table {row.table_id || 'N/A'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {row.items ? row.items.map(i => `${i.quantity}x ${i.item_name || 'Item'}`).join(', ') : 'N/A'}
                    </TableCell>
                    <TableCell>{row.created_at || 'N/A'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      ${Number(row.total_amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => setSelectedOrder(row)}
                          title="View Details"
                        >
                          <EyeOutlined />
                        </IconButton>
                        
                        {/* 🟢 ប៊ូតុងលុប Order */}
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteOrder(row.id)}
                          title="Delete Order"
                        >
                          <DeleteOutlined />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 🟢 Modal View Order Details */}
      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
          Order Details - {selectedOrder?.order_no || `ORD-${selectedOrder?.id}`}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {selectedOrder && (
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Table:</Typography>
                <Typography fontWeight="bold">Table {selectedOrder.table_id || 'N/A'}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Status:</Typography>
                <Box>{getStatusChip(selectedOrder.status)}</Box>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Created At:</Typography>
                <Typography>{selectedOrder.created_at || 'N/A'}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight="bold">Ordered Items:</Typography>
              <Stack spacing={1}>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        {item.quantity}x {item.item_name || 'Item'}
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        ${(Number(item.unit_price || 0) * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">គ្មានព័ត៌មាន Item</Typography>
                )}
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold">Total Amount:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ${Number(selectedOrder.total_amount || 0).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
          <Button onClick={() => setSelectedOrder(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* 🟢 Modal Create New Order */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
          Create New Order
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                SELECT TABLE
              </Typography>
              <Select
                fullWidth
                size="medium"
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {[...Array(10)].map((_, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    Table {String(index + 1).padStart(2, '0')}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Ordered Items
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PlusOutlined />}
                onClick={handleAddItem}
                sx={{ borderRadius: 2, textTransform: 'none', px: 2 }}
              >
                Add Item
              </Button>
            </Box>

            <Stack spacing={2}>
              {selectedItems.map((item, index) => {
                const availableMenus = menuItems.filter(m => Number(m.category_id) === Number(item.category_id));

                return (
                  <Stack key={index} direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                    <Select
                      size="small"
                      sx={{ width: 180, borderRadius: 1 }}
                      value={item.category_id || ''}
                      onChange={(e) => handleItemChange(index, 'category_id', e.target.value)}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      fullWidth
                      sx={{ borderRadius: 1 }}
                      value={item.menu_item_id || ''}
                      onChange={(e) => handleItemChange(index, 'menu_item_id', e.target.value)}
                    >
                      {availableMenus.length === 0 ? (
                        <MenuItem value="" disabled>គ្មានមុខម្ហូបក្នុងប្រភេទនេះទេ</MenuItem>
                      ) : (
                        availableMenus.map((menu) => (
                          <MenuItem key={menu.id} value={menu.id}>
                            {menu.name} (${Number(menu.price).toFixed(2)})
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <TextField
                      size="small"
                      type="number"
                      label="Qty"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      sx={{ width: 80 }}
                    />

                    <Typography variant="body2" fontWeight="bold" sx={{ width: 80, textAlign: 'right' }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </Typography>

                    <IconButton color="error" size="small" onClick={() => handleRemoveItem(index)}>
                      <DeleteOutlined />
                    </IconButton>
                  </Stack>
                );
              })}
            </Stack>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography variant="subtitle1" fontWeight="bold">Total Amount:</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #f0f0f0' }}>
          <Button onClick={() => setOpenCreateModal(false)} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateOrder} sx={{ bgcolor: '#1677ff', borderRadius: 2, px: 3 }}>
            Submit Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
