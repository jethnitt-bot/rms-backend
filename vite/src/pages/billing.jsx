import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  CircularProgress
} from '@mui/material';

import {
  FileTextOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  SaveOutlined,
  InboxOutlined
} from '@ant-design/icons';

// នាំចូលរូបភាព QR Code ថេរពីថត src/assets/images/qr.jpg
import qrImage from '../assets/images/users/qr.jpg';

const API_GET_ORDERS = 'https://rms-backend-jeth.infy.click/rms_backend/api/billing/get_billing_orders.php';
const API_PROCESS_PAYMENT = 'https://rms-backend-jeth.infy.click/rms_backend/api/billing/process_payment.php';
const API_CLEAR_ORDER = 'https://rms-backend-jeth.infy.click/rms_backend/api/billing/cancel_order.php';

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [ordersByTable, setOrdersByTable] = useState({});

  const [completedRevenue, setCompletedRevenue] = useState(() => {
    const saved = localStorage.getItem('todays_revenue');
    return saved ? parseFloat(saved) : 0.00;
  });

  const [completedCount, setCompletedCount] = useState(() => {
    const saved = localStorage.getItem('todays_completed_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('todays_revenue', completedRevenue.toString());
  }, [completedRevenue]);

  useEffect(() => {
    localStorage.setItem('todays_completed_count', completedCount.toString());
  }, [completedCount]);

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedCashier, setSelectedCashier] = useState('Admin');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');

  // State រក្សាទុកទិន្នន័យសម្រាប់ Print
  const [printInvoiceData, setPrintInvoiceData] = useState(null);

  const fetchActiveOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_GET_ORDERS);
      const data = await response.json();

      if (data.status === 'success' && Array.isArray(data.data)) {
        const mappedOrders = {};
        data.data.forEach((order) => {
          const tableName = order.table_number || `Table ${order.table_id}`;

          mappedOrders[tableName] = {
            order_id: order.order_id,
            table_id: order.table_id,
            table_number: tableName,
            items: (order.items || []).map((item) => ({
              id: item.order_item_id,
              item_id: item.item_id,
              name: item.item_name,
              price: parseFloat(item.price) || 0,
              qty: parseInt(item.quantity, 10) || 1,
              image: item.image || ''
            }))
          };
        });

        setOrdersByTable(mappedOrders);

        const availableTables = Object.keys(mappedOrders);
        setSelectedTable((prevTable) => {
          if (prevTable && mappedOrders[prevTable]) {
            return prevTable;
          }
          return availableTables.length > 0 ? availableTables[0] : '';
        });
      } else {
        setOrdersByTable({});
        setSelectedTable('');
      }
    } catch (error) {
      console.error('Error fetching billing orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrders();
  }, [fetchActiveOrders]);

  const currentTableOrder = useMemo(() => {
    return ordersByTable[selectedTable] || { items: [] };
  }, [ordersByTable, selectedTable]);

  const currentTableItems = currentTableOrder.items || [];
  const hasActiveOrder = currentTableItems.length > 0;

  const handleTableChange = (table) => {
    setSelectedTable(table);
    setAmountReceived('');
    setDiscount(0);
    setNote('');
  };

  const handleQtyChange = (id, delta) => {
    setOrdersByTable((prev) => {
      const currentOrder = prev[selectedTable];
      if (!currentOrder) return prev;

      const updatedItems = currentOrder.items
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      if (updatedItems.length === 0) {
        const copy = { ...prev };
        delete copy[selectedTable];
        return copy;
      }

      return {
        ...prev,
        [selectedTable]: { ...currentOrder, items: updatedItems }
      };
    });
  };

  const handleRemoveItem = (id) => {
    setOrdersByTable((prev) => {
      const currentOrder = prev[selectedTable];
      if (!currentOrder) return prev;

      const updatedItems = currentOrder.items.filter((i) => i.id !== id);

      if (updatedItems.length === 0) {
        const copy = { ...prev };
        delete copy[selectedTable];
        return copy;
      }

      return {
        ...prev,
        [selectedTable]: { ...currentOrder, items: updatedItems }
      };
    });
  };

  const handleClearAll = async () => {
    if (!selectedTable) return;

    const confirmClear = window.confirm(`តើអ្នកពិតជាចង់លុប Order ទាំងអស់របស់តុ ${selectedTable} មែនទេ?`);
    if (!confirmClear) return;

    if (currentTableOrder.order_id) {
      try {
        const response = await fetch(API_CLEAR_ORDER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: currentTableOrder.order_id })
        });

        const resData = await response.json();

        if (resData.status !== 'success') {
          alert('មិនអាចលុប Order ពី Database បានទេ៖ ' + (resData.message || 'មានបញ្ហា'));
          return;
        }
      } catch (error) {
        console.error('Clear Order Error:', error);
        alert('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!');
        return;
      }
    }

    setOrdersByTable((prev) => {
      const copy = { ...prev };
      delete copy[selectedTable];
      return copy;
    });

    setAmountReceived('');
    setDiscount(0);
    setNote('');
    fetchActiveOrders();
  };

  const { subtotal, tax, serviceCharge, totalAmount, change } = useMemo(() => {
    const sub = currentTableItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tx = sub * 0.1;
    const sc = sub * 0.05;
    const calculatedTotal = Math.max(0, sub - Number(discount) + tx + sc);
    const numReceived = Number(amountReceived) || 0;
    const chg = numReceived > calculatedTotal ? numReceived - calculatedTotal : 0;

    return {
      subtotal: sub,
      tax: tx,
      serviceCharge: sc,
      totalAmount: calculatedTotal,
      change: chg
    };
  }, [currentTableItems, discount, amountReceived]);

  const triggerPrintWindow = useCallback(() => {
    setTimeout(() => {
      const qrImg = document.getElementById('receipt-qr-code-img');
      if (qrImg && !qrImg.complete) {
        qrImg.onload = () => window.print();
        qrImg.onerror = () => window.print();
      } else {
        window.print();
      }
    }, 200);
  }, []);

  const handleDirectPrint = () => {
    if (!hasActiveOrder) {
      alert("សូមជ្រើសរើសតុដែលមាន Order ដើម្បី Print Invoice!");
      return;
    }

    setPrintInvoiceData({
      table: selectedTable,
      cashier: selectedCashier,
      date: `${invoiceDate} ${new Date().toLocaleTimeString()}`,
      items: [...currentTableItems],
      subtotal,
      discount: Number(discount),
      tax,
      serviceCharge,
      totalAmount,
      paymentMethod,
      amountReceived: Number(amountReceived) || totalAmount,
      change
    });

    triggerPrintWindow();
  };

  const handleCompleteBilling = async (shouldPrint = false) => {
    if (!hasActiveOrder) return;

    try {
      const payload = {
        order_id: currentTableOrder.order_id,
        table_id: currentTableOrder.table_id,
        subtotal: subtotal,
        tax: tax,
        service_charge: serviceCharge,
        discount: discount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        amount_received: Number(amountReceived) || totalAmount,
        change_amount: change,
        note: note
      };

      const response = await fetch(API_PROCESS_PAYMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('PHP Backend Error Detail:', responseText);
        alert(`Server Error (Status ${response.status}): សូមពិនិត្យមើល Console សម្រាប់ព័ត៌មានលម្អិតពី PHP Error`);
        return;
      }

      let resData;
      try {
        resData = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON Parsing Error. Server Output:', responseText);
        alert('Server មិនបានបោះ Response ជា JSON ត្រឹមត្រូវទេ។');
        return;
      }

      if (resData.status === 'success') {
        setCompletedRevenue((prev) => prev + totalAmount);
        setCompletedCount((prev) => prev + 1);

        const snapshot = {
          table: selectedTable,
          cashier: selectedCashier,
          date: `${invoiceDate} ${new Date().toLocaleTimeString()}`,
          items: [...currentTableItems],
          subtotal,
          discount: Number(discount),
          tax,
          serviceCharge,
          totalAmount,
          paymentMethod,
          amountReceived: Number(amountReceived) || totalAmount,
          change
        };

        setPrintInvoiceData(snapshot);

        if (shouldPrint) {
          triggerPrintWindow();
        }

        alert(`ការទូទាត់ប្រាក់សម្រាប់តុ ${selectedTable} ចំនួន $${totalAmount.toFixed(2)} ជោគជ័យ!`);

        const tableToClear = selectedTable;
        setOrdersByTable((prev) => {
          const updated = { ...prev };
          delete updated[tableToClear];
          return updated;
        });

        setAmountReceived('');
        setDiscount(0);
        setNote('');
        setSelectedTable('');

        fetchActiveOrders();
      } else {
        alert('បរាជ័យក្នុងការទូទាត់ប្រាក់៖ ' + (resData.message || 'មានបញ្ហា'));
      }
    } catch (err) {
      console.error('Payment Error:', err);
      alert('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!');
    }
  };

  const activeOrderTables = useMemo(() => {
    return Object.keys(ordersByTable)
      .filter((tableKey) => ordersByTable[tableKey]?.items?.length > 0)
      .map((tableKey) => {
        const items = ordersByTable[tableKey].items;
        const sub = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const tx = sub * 0.1;
        const sc = sub * 0.05;
        const total = sub + tx + sc;
        return {
          table: tableKey,
          itemCount: items.reduce((sum, item) => sum + item.qty, 0),
          totalAmount: total
        };
      });
  }, [ordersByTable]);

  const cardShadow = '0 2px 10px rgba(0,0,0,0.04)';

  return (
    <Box sx={{ p: 2.5, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-receipt-container, .printable-receipt-container * {
            visibility: visible !important;
          }
          .printable-receipt-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            padding: 8px !important;
            font-family: 'Courier New', monospace, sans-serif !important;
            color: #000 !important;
          }
          .printable-receipt-container img {
            display: block !important;
            margin: 0 auto !important;
            max-width: 140px !important;
            height: auto !important;
          }
        }
        @media screen {
          .printable-receipt-container {
            display: none;
          }
        }
        .dashed-line {
          border-bottom: 1px dashed #000;
          margin: 8px 0;
        }
      `}</style>

      {/* 1. TOP STATS CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: "Today's Orders", value: (activeOrderTables.length + completedCount).toString(), sub: 'Total Tables', icon: <FileTextOutlined />, color: '#7c3aed', bg: '#f3e8ff' },
          { title: "Today's Revenue", value: `$${completedRevenue.toFixed(2)}`, sub: 'Paid Total', icon: <DollarCircleOutlined />, color: '#16a34a', bg: '#dcfce7' },
          { title: 'Pending Billing', value: activeOrderTables.length.toString(), sub: 'Unpaid Tables', icon: <ClockCircleOutlined />, color: '#2563eb', bg: '#dbeafe' },
          { title: 'Completed Invoices', value: completedCount.toString(), sub: 'Invoices Paid', icon: <CheckCircleOutlined />, color: '#d97706', bg: '#fef3c7' }
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: cardShadow }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 44, height: 44, borderRadius: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>{stat.title}</Typography>
                    <Typography variant="h5" fontWeight="bold">{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{stat.sub}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 2. MAIN BILLING SECTION */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow, mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <TextField size="small" fullWidth type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Select Table</Typography>
                <Select size="small" fullWidth value={selectedTable} onChange={(e) => handleTableChange(e.target.value)}>
                  {Object.keys(ordersByTable).length === 0 ? (
                    <MenuItem value=""><em>គ្មានតុដែលមាន Order ទេ</em></MenuItem>
                  ) : (
                    Object.keys(ordersByTable).map((t) => (
                      <MenuItem key={t} value={t}>
                        តុ {t} • (Has Active Order)
                      </MenuItem>
                    ))
                  )}
                </Select>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Cashier</Typography>
                <Select size="small" fullWidth value={selectedCashier} onChange={(e) => setSelectedCashier(e.target.value)}>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Cashier 01">Cashier 01</MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Order Items ({selectedTable ? `តុ ${selectedTable}` : 'No Table Selected'})
              </Typography>
            </Stack>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress size={30} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>កំពុងទាញយកទិន្នន័យ...</Typography>
              </Box>
            ) : !hasActiveOrder ? (
              <Stack alignItems="center" spacing={1.5} sx={{ py: 6, my: 1, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 2 }}>
                <Avatar sx={{ bgcolor: '#e2e8f0', color: '#64748b', width: 52, height: 52 }}>
                  <InboxOutlined style={{ fontSize: 26 }} />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                  {selectedTable ? `តុ ${selectedTable} មិនទាន់មានការកុម្ម៉ង់ (No active order)` : 'គ្មានតុដែលត្រូវបង្ហាញទេ'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 380 }}>
                  រាល់ Order ទាំងអស់ដែលបានកម្មង់ពី Table នឹងមកបង្ហាញត្រង់នេះដោយស្វ័យប្រវត្តិ
                </Typography>
              </Stack>
            ) : (
              <>
                <TableContainer sx={{ maxHeight: 320, mb: 2, border: '1px solid #f1f5f9', borderRadius: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold', bgcolor: '#f8fafc' }}>Item</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold', bgcolor: '#f8fafc' }}>Price</TableCell>
                        <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 'bold', bgcolor: '#f8fafc' }}>Qty</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold', bgcolor: '#f8fafc' }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 'bold', bgcolor: '#f8fafc' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentTableItems.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell sx={{ fontSize: '13px', py: 1.2 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              {item.image && <Avatar src={item.image} variant="rounded" sx={{ width: 32, height: 32 }} />}
                              <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>${item.price.toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                              <IconButton size="small" onClick={() => handleQtyChange(item.id, -1)} sx={{ p: 0.3, border: '1px solid #e2e8f0' }}>
                                <MinusOutlined style={{ fontSize: 10 }} />
                              </IconButton>
                              <Typography variant="body2" fontWeight={600} sx={{ px: 1 }}>{item.qty}</Typography>
                              <IconButton size="small" onClick={() => handleQtyChange(item.id, 1)} sx={{ p: 0.3, border: '1px solid #e2e8f0' }}>
                                <PlusOutlined style={{ fontSize: 10 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 700, color: 'primary.main' }}>
                            ${(item.price * item.qty).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.id)}>
                              <DeleteOutlined style={{ fontSize: 14 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Note (Optional)</Typography>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Enter note or special request..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Box>

                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlined />}
                    size="small"
                    onClick={handleClearAll}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Clear Order
                  </Button>
                </Stack>
              </>
            )}
          </Paper>

          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Recent Active Orders (Unpaid Tables)</Typography>
              <Chip label={`${activeOrderTables.length} Tables`} color="primary" size="small" />
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>Table</TableCell>
                    <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>Items Ordered</TableCell>
                    <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>Total Bill (With Tax)</TableCell>
                    <TableCell sx={{ fontSize: '11px', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeOrderTables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        គ្មានតុដែលកំពុងកុម្ម៉ង់ ឬមិនទាន់គិតលុយទេ
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeOrderTables.map((ord) => (
                      <TableRow key={ord.table} selected={ord.table === selectedTable}>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>តុ {ord.table}</TableCell>
                        <TableCell sx={{ fontSize: '12px' }}>{ord.itemCount} Items</TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: 'primary.main' }}>
                          ${ord.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip label="Unpaid" size="small" color="warning" sx={{ height: 20, fontSize: '10px' }} />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant={ord.table === selectedTable ? "contained" : "outlined"}
                            onClick={() => handleTableChange(ord.table)}
                            sx={{ fontSize: '11px', py: 0.2, textTransform: 'none' }}
                          >
                            {ord.table === selectedTable ? 'Selected' : 'Select Table'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Bill Summary</Typography>
              <Chip label={selectedTable ? `តុ ${selectedTable}` : 'N/A'} color="secondary" size="small" variant="outlined" />
            </Stack>

            {!hasActiveOrder ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
                <InboxOutlined style={{ fontSize: 36, color: '#cbd5e1' }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  សូមជ្រើសរើសតុដែលមាន Order ដើម្បីមើល Bill Summary
                </Typography>
              </Stack>
            ) : (
              <>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Subtotal ({currentTableItems.reduce((acc, i) => acc + i.qty, 0)} items)
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>${subtotal.toFixed(2)}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Discount ($)</Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                      sx={{ width: 80, '& input': { p: '4px 8px', fontSize: '12px', textAlign: 'right' } }}
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Tax (10%)</Typography>
                    <Typography variant="body2" fontWeight={600}>${tax.toFixed(2)}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Service Charge (5%)</Typography>
                    <Typography variant="body2" fontWeight={600}>${serviceCharge.toFixed(2)}</Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">${totalAmount.toFixed(2)}</Typography>
                </Stack>

                <Typography variant="caption" fontWeight="bold" color="text.secondary">Payment Method</Typography>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={{ my: 1 }}>
                  {[
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Credit / Debit Card' },
                    { value: 'bank', label: 'Bank Transfer / KHQR' }
                  ].map((pm) => (
                    <Paper
                      key={pm.value}
                      variant="outlined"
                      sx={{
                        p: 0.5,
                        px: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        borderColor: paymentMethod === pm.value ? '#2563eb' : '#e2e8f0',
                        bgcolor: paymentMethod === pm.value ? '#eff6ff' : 'transparent'
                      }}
                    >
                      <FormControlLabel
                        value={pm.value}
                        control={<Radio size="small" />}
                        label={<Typography variant="body2" fontWeight={500}>{pm.label}</Typography>}
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>Amount Received</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }
                    }}
                    sx={{ width: 110, '& input': { p: '4px 8px', fontSize: '13px', textAlign: 'right' } }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight={600}>Change</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">${change.toFixed(2)}</Typography>
                </Stack>

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<SaveOutlined />}
                      onClick={() => handleCompleteBilling(false)}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Save Invoice
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<PrinterOutlined />}
                      onClick={() => handleCompleteBilling(true)}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Pay & Print
                    </Button>
                  </Stack>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PrinterOutlined />}
                    onClick={handleDirectPrint}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Print Pre-Receipt (បោះពុម្ពមុនគិតលុយ)
                  </Button>
                </Stack>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* PRINT TEMPLATE */}
      <div className="printable-receipt-container">
        {printInvoiceData && (
          <>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>RESTAURANT INVOICE</h2>
              <p style={{ fontSize: '12px', margin: 0 }}>វិក្កយបត្រទូទាត់ប្រាក់</p>
              <div className="dashed-line"></div>
            </div>

            <div style={{ fontSize: '12px' }}>
              <p style={{ margin: '2px 0' }}><strong>តុ:</strong> {printInvoiceData.table}</p>
              <p style={{ margin: '2px 0' }}><strong>បេឡាករ:</strong> {printInvoiceData.cashier}</p>
              <p style={{ margin: '2px 0' }}><strong>កាលបរិច្ឆេទ:</strong> {printInvoiceData.date}</p>
            </div>

            <div className="dashed-line"></div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px dashed #000' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '4px 0' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {printInvoiceData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '4px 0' }}>{item.name}</td>
                    <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty}</td>
                    <td style={{ textAlign: 'right', padding: '4px 0' }}>${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="dashed-line"></div>

            <div style={{ fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>Subtotal:</span>
                <span>${printInvoiceData.subtotal.toFixed(2)}</span>
              </div>
              {printInvoiceData.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                  <span>Discount:</span>
                  <span>-${printInvoiceData.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>Tax (10%):</span>
                <span>${printInvoiceData.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>Service Charge (5%):</span>
                <span>${printInvoiceData.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="dashed-line"></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', margin: '4px 0' }}>
                <span>Total Amount:</span>
                <span>${printInvoiceData.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>Payment Method:</span>
                <span style={{ textTransform: 'uppercase' }}>{printInvoiceData.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>Amount Received:</span>
                <span>${printInvoiceData.amountReceived.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>Change:</span>
                <span>${printInvoiceData.change.toFixed(2)}</span>
              </div>
            </div>

            {/* បង្ហាញរូបភាព QR Code ធនាគារ (Static QR Image) */}
            <div style={{ textAlign: 'center', marginTop: '12px', pageBreakInside: 'avoid' }}>
              <img
                id="receipt-qr-code-img"
                src={qrImage}
                alt="Bank KHQR Code"
                style={{ width: '130px', height: '130px', margin: '0 auto', display: 'block', objectFit: 'contain' }}
              />
              <p style={{ fontSize: '10px', margin: '4px 0 0 0', fontWeight: 'bold' }}>Scan to pay via KHQR</p>
            </div>

            <div className="dashed-line"></div>
            <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '10px' }}>
              <p style={{ margin: '2px 0' }}>សូមអរគុណ! អញ្ជើញមកពិសាម្តងទៀត!</p>
              <p style={{ margin: '2px 0' }}>Thank you for visiting!</p>
            </div>
          </>
        )}
      </div>
    </Box>
  );
}
