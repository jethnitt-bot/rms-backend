import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack, Avatar, Chip, Select,
  MenuItem, Tabs, Tab, CircularProgress, Menu, ListItemIcon, ListItemText
} from '@mui/material';

import {
  DollarOutlined, ShoppingCartOutlined, UserOutlined, RiseOutlined,
  FileTextOutlined, DownloadOutlined, FilterOutlined, CalendarOutlined,
  FileExcelOutlined, FilePdfOutlined
} from '@ant-design/icons';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Import Libraries សម្រាប់ Export
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const API_GET_REPORTS = 'https://rms-backend-jeth.infy.click/rms_backend/api/reports/get_reports.php';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  
  // Filter States
  const [dateRange, setDateRange] = useState('This Month');
  const [outlet, setOutlet] = useState('All Outlets');
  const [table, setTable] = useState('All Tables');
  const [paymentFilter, setPaymentFilter] = useState('All Payment Methods');

  const [loading, setLoading] = useState(false);

  // Export Menu Dropdown Anchor
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // States សម្រាប់ទិន្នន័យពី Database / API
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [salesOverviewData, setSalesOverviewData] = useState({ labels: [], revenue: [], orderCounts: [] });
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Fetch API Report Data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        dateRange,
        outlet,
        table,
        paymentFilter
      });

      const response = await fetch(`${API_GET_REPORTS}?${queryParams.toString()}`);
      const data = await response.json();

      if (data.status === 'success') {
        setOrders(data.orders || []);
        setBills(data.bills || []);
        setTopSelling(data.topSelling || []);
        setSalesOverviewData(data.salesOverview || { labels: [], revenue: [], orderCounts: [] });
        setPaymentMethodsData(data.paymentMethods || []);
        setCategoryData(data.categorySales || []);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, outlet, table, paymentFilter]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // គណនា Summary Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = new Set(orders.map(o => o.customer_id).filter(Boolean)).size;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
  const totalBills = bills.length;

  const stats = [
    { title: 'Total Revenue', val: `$${totalRevenue.toFixed(2)}`, sub: totalOrders > 0 ? 'Live DB Data' : 'No Sales', icon: <DollarOutlined />, color: '#8b5cf6', bg: '#f3e8ff' },
    { title: 'Total Orders', val: totalOrders.toString(), sub: totalOrders > 0 ? 'Live DB Data' : 'No Orders', icon: <ShoppingCartOutlined />, color: '#10b981', bg: '#d1fae5' },
    { title: 'Total Customers', val: totalCustomers.toString(), sub: totalCustomers > 0 ? 'Live DB Data' : 'No Data', icon: <UserOutlined />, color: '#f59e0b', bg: '#fef3c7' },
    { title: 'Average Order Value', val: `$${avgOrderValue.toFixed(2)}`, sub: totalOrders > 0 ? 'Live DB Data' : 'No Data', icon: <RiseOutlined />, color: '#06b6d4', bg: '#cffaff' },
    { title: 'Total Bills', val: totalBills.toString(), sub: totalBills > 0 ? 'Live DB Data' : 'No Bills', icon: <FileTextOutlined />, color: '#ec4899', bg: '#fce7f3' },
  ];

  // ==================== EXPORT FUNCTIONS ====================
  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  // 1. Export to Excel (.xlsx)
  const exportToExcel = () => {
    handleCloseExportMenu();

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary Stats
    const summaryData = [
      { Metric: 'Date Filter', Value: dateRange },
      { Metric: 'Total Revenue', Value: `$${totalRevenue.toFixed(2)}` },
      { Metric: 'Total Orders', Value: totalOrders },
      { Metric: 'Total Customers', Value: totalCustomers },
      { Metric: 'Average Order Value', Value: `$${avgOrderValue.toFixed(2)}` },
      { Metric: 'Total Bills', Value: totalBills },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Recent Transactions
    const transactionsData = bills.map(b => ({
      'Order No': `#${b.no}`,
      'Date': b.date,
      'Table': b.table,
      'Amount ($)': b.amount,
      'Payment Method': b.pay,
      'Status': b.status
    }));
    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');

    // Sheet 3: Top Selling Items
    const topSellingData = topSelling.map((item, idx) => ({
      'Rank': idx + 1,
      'Item Name': item.name,
      'Category': item.category,
      'Quantity Sold': item.qty,
      'Revenue ($)': parseFloat(item.revenue || 0).toFixed(2)
    }));
    const topSellingSheet = XLSX.utils.json_to_sheet(topSellingData);
    XLSX.utils.book_append_sheet(workbook, topSellingSheet, 'Top Selling Items');

    // Save File
    XLSX.writeFile(workbook, `SalesReport_${dateRange.replace(/\s+/g, '_')}.xlsx`);
  };

  // 2. Export to PDF (.pdf)
  const exportToPDF = () => {
    handleCloseExportMenu();

    const doc = new jsPDF();

    // PDF Title
    doc.setFontSize(18);
    doc.text('Restaurant Sales & Operational Report', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Filter: ${dateRange} | Generated: ${new Date().toLocaleString()}`, 14, 22);

    // Summary Section Table
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Key Metrics', 14, 32);

    doc.autoTable({
      startY: 36,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
        ['Total Orders', `${totalOrders}`],
        ['Total Customers', `${totalCustomers}`],
        ['Average Order Value', `$${avgOrderValue.toFixed(2)}`],
        ['Total Bills', `${totalBills}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Recent Transactions Table
    const lastY = doc.lastAutoTable.finalY + 10;
    doc.text('Recent Transactions', 14, lastY);

    doc.autoTable({
      startY: lastY + 4,
      head: [['Order No', 'Date', 'Table', 'Amount', 'Payment', 'Status']],
      body: bills.map(b => [
        `#${b.no}`,
        b.date,
        b.table,
        `$${parseFloat(b.amount || 0).toFixed(2)}`,
        b.pay,
        b.status
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });

    // Top Selling Items Table
    const topSellingY = doc.lastAutoTable.finalY + 10;
    doc.text('Top Selling Items', 14, topSellingY);

    doc.autoTable({
      startY: topSellingY + 4,
      head: [['#', 'Item Name', 'Category', 'Qty Sold', 'Revenue']],
      body: topSelling.map((item, idx) => [
        idx + 1,
        item.name,
        item.category || 'N/A',
        item.qty,
        `$${parseFloat(item.revenue || 0).toFixed(2)}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
    });

    // Save File
    doc.save(`SalesReport_${dateRange.replace(/\s+/g, '_')}.pdf`);
  };

  // Sales Overview Line Chart Data
  const lineChartData = {
    labels: salesOverviewData.labels.length > 0 ? salesOverviewData.labels : ['No Data'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: salesOverviewData.revenue.length > 0 ? salesOverviewData.revenue : [0],
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: salesOverviewData.orderCounts.length > 0 ? salesOverviewData.orderCounts : [0],
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const paymentChartData = {
    labels: paymentMethodsData.length > 0 ? paymentMethodsData.map(p => p.name) : ['Cash', 'Card', 'ABA Pay', 'Other'],
    datasets: [{
      data: paymentMethodsData.length > 0 ? paymentMethodsData.map(p => p.amt) : [0, 0, 0, 0],
      backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
      borderWidth: 0,
    }],
  };

  const categoryChartData = {
    labels: categoryData.length > 0 ? categoryData.map(c => c.name) : ['Main Course', 'Beverages', 'Appetizers', 'Desserts', 'Others'],
    datasets: [{
      data: categoryData.length > 0 ? categoryData.map(c => c.amt) : [0, 0, 0, 0, 0],
      backgroundColor: ['#2563eb', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'],
      borderWidth: 0,
    }],
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Title & Header Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Reports</Typography>
          <Typography variant="caption" color="text.secondary">Dashboard &gt; Reports</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<CalendarOutlined />} size="small" sx={{ textTransform: 'none', bgcolor: '#fff' }}>
            {dateRange}
          </Button>

          {/* Export Dropdown Button */}
          <Button
            variant="contained"
            startIcon={<DownloadOutlined />}
            size="small"
            onClick={handleOpenExportMenu}
            sx={{ textTransform: 'none', bgcolor: '#2563eb' }}
          >
            Export Report
          </Button>

          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleCloseExportMenu}
            PaperProps={{ sx: { width: 180, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }}
          >
            <MenuItem onClick={exportToExcel}>
              <ListItemIcon><FileExcelOutlined style={{ color: '#10b981', fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary="Export Excel" primaryTypographyProps={{ fontSize: 13 }} />
            </MenuItem>
            <MenuItem onClick={exportToPDF}>
              <ListItemIcon><FilePdfOutlined style={{ color: '#ef4444', fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary="Export PDF" primaryTypographyProps={{ fontSize: 13 }} />
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: s.bg, color: s.color, width: 42, height: 42, borderRadius: 2 }}>
                  {s.icon}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.title}</Typography>
                  <Typography variant="h6" fontWeight="bold">{s.val}</Typography>
                  <Typography variant="caption" color="text.secondary" fontSize={10}>{s.sub}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Report Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Sales Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Menu Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Inventory Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Customer Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Staff Report" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Filter Control Bar */}
      <Paper sx={{ p: 1.5, borderRadius: 2, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Select size="small" value={dateRange} onChange={(e) => setDateRange(e.target.value)} sx={{ minWidth: 180, fontSize: 12 }}>
            <MenuItem value="Today">Today</MenuItem>
            <MenuItem value="This Week">This Week</MenuItem>
            <MenuItem value="This Month">This Month</MenuItem>
            <MenuItem value="This Year">This Year</MenuItem>
          </Select>

          <Select size="small" value={outlet} onChange={(e) => setOutlet(e.target.value)} sx={{ minWidth: 140, fontSize: 12 }}>
            <MenuItem value="All Outlets">All Outlets</MenuItem>
            <MenuItem value="Main Branch">Main Branch</MenuItem>
          </Select>

          <Select size="small" value={table} onChange={(e) => setTable(e.target.value)} sx={{ minWidth: 130, fontSize: 12 }}>
            <MenuItem value="All Tables">All Tables</MenuItem>
            <MenuItem value="Table 01">Table 01</MenuItem>
            <MenuItem value="Table 02">Table 02</MenuItem>
          </Select>

          <Select size="small" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} sx={{ minWidth: 170, fontSize: 12 }}>
            <MenuItem value="All Payment Methods">All Payment Methods</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="ABA Pay">ABA Pay</MenuItem>
          </Select>

          <Button variant="contained" startIcon={<FilterOutlined />} size="small" onClick={fetchReportData} sx={{ textTransform: 'none', bgcolor: '#2563eb' }}>
            Filter Report
          </Button>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Left Grid */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Sales Overview</Typography>
              <Box sx={{ height: 280 }}>
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { type: 'linear', position: 'left', beginAtZero: true },
                      y1: { type: 'linear', position: 'right', beginAtZero: true, grid: { drawOnChartArea: false } },
                    }
                  }}
                />
              </Box>
            </Paper>

            <Grid container spacing={2}>
              {/* Top Selling Items Table */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', height: '100%' }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Top Selling Items</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>#</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Menu Item</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Category</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Qty</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topSelling.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3, fontSize: 11, color: 'text.secondary' }}>
                              មិនទាន់មាន Order សម្រាប់មុខម្ហូបនៅឡើយទេ
                            </TableCell>
                          </TableRow>
                        ) : (
                          topSelling.map((row, idx) => (
                            <TableRow key={row.id || idx}>
                              <TableCell sx={{ fontSize: 11 }}>{idx + 1}</TableCell>
                              <TableCell sx={{ fontSize: 11 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar src={row.img} variant="rounded" sx={{ width: 22, height: 22 }} />
                                  <Typography variant="caption" fontWeight={600}>{row.name}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{row.category}</TableCell>
                              <TableCell sx={{ fontSize: 11 }}>{row.qty}</TableCell>
                              <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>${parseFloat(row.revenue || 0).toFixed(2)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Recent Transactions Table */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', height: '100%' }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Recent Transactions</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Order No.</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Table</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Amount</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Payment</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bills.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3, fontSize: 11, color: 'text.secondary' }}>
                              មិនទាន់មាន Transaction វិក្កយបត្រនៅឡើយទេ
                            </TableCell>
                          </TableRow>
                        ) : (
                          bills.slice(0, 5).map((row, i) => (
                            <TableRow key={i}>
                              <TableCell sx={{ fontSize: 10, fontWeight: 600 }}>#{row.no}</TableCell>
                              <TableCell sx={{ fontSize: 10 }}>{row.date}</TableCell>
                              <TableCell sx={{ fontSize: 10 }}>{row.table}</TableCell>
                              <TableCell sx={{ fontSize: 10, fontWeight: 600 }}>${parseFloat(row.amount || 0).toFixed(2)}</TableCell>
                              <TableCell sx={{ fontSize: 10 }}>{row.pay}</TableCell>
                              <TableCell>
                                <Chip label={row.status} size="small" color={row.status === 'Completed' ? 'success' : 'warning'} sx={{ fontSize: 9, height: 16 }} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Grid - ផ្នែកខាងស្តាំដែលបានកែសម្រួល */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              {/* Sales by Payment Method */}
              <Grid item xs={12} sm={6} lg={12}>
                <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Sales by Payment Method</Typography>
                  <Box sx={{ height: 160, display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Doughnut data={paymentChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </Box>
                  <Stack spacing={1}>
                    {(paymentMethodsData.length > 0 ? paymentMethodsData : [
                      { name: 'Cash', pct: '0%', amt: 0, color: '#2563eb' },
                      { name: 'Card', pct: '0%', amt: 0, color: '#10b981' },
                      { name: 'ABA Pay', pct: '0%', amt: 0, color: '#f59e0b' },
                      { name: 'Other', pct: '0%', amt: 0, color: '#8b5cf6' },
                    ]).map((item, idx) => (
                      <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography variant="caption">{item.name}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">{item.pct}</Typography>
                        <Typography variant="caption" fontWeight="bold">${Number(item.amt || 0).toFixed(2)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="body2" fontWeight="bold">Total</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">${totalRevenue.toFixed(2)}</Typography>
                  </Stack>
                </Paper>
              </Grid>

              {/* Sales by Category */}
              <Grid item xs={12} sm={6} lg={12}>
                <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Sales by Category</Typography>
                  <Box sx={{ height: 160, display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </Box>
                  <Stack spacing={1}>
                    {(categoryData.length > 0 ? categoryData : [
                      { name: 'Main Course', pct: '0%', amt: 0, color: '#2563eb' },
                      { name: 'Beverages', pct: '0%', amt: 0, color: '#06b6d4' },
                      { name: 'Appetizers', pct: '0%', amt: 0, color: '#f59e0b' },
                      { name: 'Desserts', pct: '0%', amt: 0, color: '#ec4899' },
                      { name: 'Others', pct: '0%', amt: 0, color: '#8b5cf6' },
                    ]).map((item, idx) => (
                      <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography variant="caption">{item.name}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">{item.pct}</Typography>
                        <Typography variant="caption" fontWeight="bold">${Number(item.amt || 0).toFixed(2)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="body2" fontWeight="bold">Total</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">${totalRevenue.toFixed(2)}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
