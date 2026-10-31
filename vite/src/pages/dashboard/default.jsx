import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import ReportAreaChart from 'sections/dashboard/default/ReportAreaChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import SaleReportCard from 'sections/dashboard/default/SaleReportCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';

// assets
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import CoffeeOutlined from '@ant-design/icons/CoffeeOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import TableOutlined from '@ant-design/icons/TableOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import InboxOutlined from '@ant-design/icons/InboxOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';

// ==============================|| API CONFIG ||============================== //
const API_BASE = 'https://rms-backend-jeth.infy.click/rms_backend/api/dashboard';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function dayLabel(dateStr) {
  const d = new Date(dateStr);
  return WEEKDAY_LABELS[d.getDay()];
}

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| EMPTY STATE ||============================== //
function EmptyState({ message = 'No data yet', height = 220 }) {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        color: 'text.secondary'
      }}
    >
      <InboxOutlined style={{ fontSize: '1.75rem' }} />
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}

// ==============================|| DASHBOARD - RMS ||============================== //

export default function DashboardDefault() {
  const navigate = useNavigate();
  const [orderMenuAnchor, setOrderMenuAnchor] = useState(null);
  const [analyticsMenuAnchor, setAnalyticsMenuAnchor] = useState(null);

  const handleOrderMenuClick = (event) => setOrderMenuAnchor(event.currentTarget);
  const handleOrderMenuClose = () => setOrderMenuAnchor(null);
  const handleAnalyticsMenuClick = (event) => setAnalyticsMenuAnchor(event.currentTarget);
  const handleAnalyticsMenuClose = () => setAnalyticsMenuAnchor(null);

  const [stats, setStats] = useState({
    totalMenuItems: 0,
    totalCategories: 0,
    totalCustomers: 0,
    todaysOrders: 0,
    todaysReservations: 0,
    availableTables: 0
  });

  const [orders, setOrders] = useState([]);

  const [orderStatus, setOrderStatus] = useState({ pending: 0, preparing: 0, completedToday: 0 });
  const [orderStatusTrendData, setOrderStatusTrendData] = useState([]);
  const [orderStatusTrendLabels, setOrderStatusTrendLabels] = useState([]);

  const [todaysRevenue, setTodaysRevenue] = useState(0);
  const [weeklyRevenueData, setWeeklyRevenueData] = useState([]);
  const [weeklyRevenueLabels, setWeeklyRevenueLabels] = useState([]);

  const [bestSelling, setBestSelling] = useState([]);

  // Unique Visitor State
  const [visitorData, setVisitorData] = useState({ monthly: [], weekly: [] });
  // Sales Report State
  const [salesReportData, setSalesReportData] = useState({ today: [], month: [], year: [] });

  const hasOrderStatus = orderStatus.pending + orderStatus.preparing + orderStatus.completedToday > 0;
  const hasRevenueData = todaysRevenue > 0;
  const hasBestSelling = bestSelling.length > 0;

  useEffect(() => {
    // Stat Cards
    fetch(`${API_BASE}/stats.php`)
      .then((res) => res.json())
      .then(setStats)
      .catch((err) => console.error('Failed to load stats:', err));

    // Recent Orders
    fetch(`${API_BASE}/recent_orders.php`)
      .then((res) => res.json())
      .then(setOrders)
      .catch((err) => console.error('Failed to load recent orders:', err));

    // Order Status Overview
    fetch(`${API_BASE}/order_status.php`)
      .then((res) => res.json())
      .then((data) => {
        setOrderStatus({
          pending: data.pending ?? 0,
          preparing: data.preparing ?? 0,
          completedToday: data.completedToday ?? 0
        });
        const trend = data.trend ?? [];
        setOrderStatusTrendData(trend.map((t) => t.total));
        setOrderStatusTrendLabels(trend.map((t) => dayLabel(t.day)));
      })
      .catch((err) => console.error('Failed to load order status:', err));

    // Revenue
    fetch(`${API_BASE}/revenue.php`)
      .then((res) => res.json())
      .then((data) => {
        setTodaysRevenue(data.todaysRevenue ?? 0);
        const weekly = data.weekly ?? [];
        setWeeklyRevenueData(weekly.map((w) => w.total));
        setWeeklyRevenueLabels(weekly.map((w) => dayLabel(w.day)));
      })
      .catch((err) => console.error('Failed to load revenue:', err));

    // Best Selling Menu
    fetch(`${API_BASE}/best_selling.php`)
      .then((res) => res.json())
      .then(setBestSelling)
      .catch((err) => console.error('Failed to load best selling:', err));

    // Unique Visitor Data
    fetch(`${API_BASE}/visitors.php`)
      .then((res) => res.json())
      .then(setVisitorData)
      .catch((err) => console.error('Failed to load visitors data:', err));

    // Sales Report Data
    fetch(`${API_BASE}/sales_report.php`)
      .then((res) => res.json())
      .then(setSalesReportData)
      .catch((err) => console.error('Failed to load sales report data:', err));
  }, []);

  const quickActions = [
    { label: 'New Order', icon: <ShoppingCartOutlined />, color: 'primary', to: '/orders/new' },
    { label: 'New Reservation', icon: <CalendarOutlined />, color: 'warning', to: '/reservations/new' },
    { label: 'Add Menu', icon: <FileTextOutlined />, color: 'error', to: '/menu/new' },
    { label: 'Add Table', icon: <TableOutlined />, color: 'secondary', to: '/tables/new' },
    { label: 'Add Customer', icon: <UserAddOutlined />, color: 'warning', to: '/users/new' },
    { label: 'Generate Report', icon: <FileTextOutlined />, color: 'success', to: '/reports' }
  ];

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>

      {/* Quick stat cards */}
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <AnalyticEcommerce
          title="Total Menu Items"
          count={String(stats.totalMenuItems)}
          percentage={0}
          extra="Items"
          icon={<CoffeeOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <AnalyticEcommerce
          title="Total Categories"
          count={String(stats.totalCategories)}
          percentage={0}
          extra="Categories"
          color="success"
          icon={<AppstoreOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <AnalyticEcommerce
          title="Total Customers"
          count={String(stats.totalCustomers)}
          percentage={0}
          extra="Customers"
          color="secondary"
          icon={<UserAddOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <AnalyticEcommerce
          title="Today's Orders"
          count={String(stats.todaysOrders)}
          percentage={0}
          extra="Orders"
          color="warning"
          icon={<ShoppingCartOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <AnalyticEcommerce
          title="Today's Reservations"
          count={String(stats.todaysReservations)}
          percentage={0}
          extra="Reservations"
          color="error"
          icon={<CalendarOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <AnalyticEcommerce
          title="Available Tables"
          count={String(stats.availableTables)}
          percentage={0}
          extra="Tables"
          color="info"
          icon={<TableOutlined />}
        />
      </Grid>

      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard data={visitorData} />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Today&apos;s Revenue</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          {hasRevenueData ? (
            <>
              <Box sx={{ p: 3, pb: 0 }}>
                <Stack sx={{ gap: 2 }}>
                  <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                    This Week Statistics
                  </Typography>
                  <Typography variant="h3">${todaysRevenue.toFixed(2)}</Typography>
                </Stack>
              </Box>
              <MonthlyBarChart data={weeklyRevenueData} labels={weeklyRevenueLabels} />
            </>
          ) : (
            <Box sx={{ p: 3 }}>
              <EmptyState message="No revenue yet" height={180} />
            </Box>
          )}
        </MainCard>
      </Grid>

      {/* row 3 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Recent Orders</Typography>
          </Grid>
          <Grid>
            <IconButton onClick={handleOrderMenuClick}>
              <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
            </IconButton>
            <Menu
              id="fade-menu"
              slotProps={{ list: { 'aria-labelledby': 'fade-button' } }}
              anchorEl={orderMenuAnchor}
              onClose={handleOrderMenuClose}
              open={Boolean(orderMenuAnchor)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleOrderMenuClose}>Export as CSV</MenuItem>
              <MenuItem onClick={handleOrderMenuClose}>Export as Excel</MenuItem>
              <MenuItem onClick={handleOrderMenuClose}>Print Table</MenuItem>
            </Menu>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable rows={orders} />
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Order Status Overview</Typography>
          </Grid>
          <Grid>
            <IconButton onClick={handleAnalyticsMenuClick}>
              <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
            </IconButton>
            <Menu
              id="fade-menu"
              slotProps={{ list: { 'aria-labelledby': 'fade-button' } }}
              anchorEl={analyticsMenuAnchor}
              open={Boolean(analyticsMenuAnchor)}
              onClose={handleAnalyticsMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleAnalyticsMenuClose}>Today</MenuItem>
              <MenuItem onClick={handleAnalyticsMenuClose}>This Week</MenuItem>
              <MenuItem onClick={handleAnalyticsMenuClose}>This Month</MenuItem>
            </Menu>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          {hasOrderStatus ? (
            <>
              <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
                <ListItemButton divider>
                  <ListItemText primary="Pending Orders" />
                  <Typography variant="h5">{orderStatus.pending}</Typography>
                </ListItemButton>
                <ListItemButton divider>
                  <ListItemText primary="Preparing" />
                  <Typography variant="h5">{orderStatus.preparing}</Typography>
                </ListItemButton>
                <ListItemButton>
                  <ListItemText primary="Completed Today" />
                  <Typography variant="h5">{orderStatus.completedToday}</Typography>
                </ListItemButton>
              </List>
              <ReportAreaChart data={orderStatusTrendData} labels={orderStatusTrendLabels} />
            </>
          ) : (
            <EmptyState message="No order status data yet" />
          )}
        </MainCard>
      </Grid>

      {/* row 4 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <SaleReportCard data={salesReportData} />
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Best Selling Menu</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          {hasBestSelling ? (
            <List
              component="nav"
              sx={{
                px: 0,
                py: 0,
                '& .MuiListItemButton-root': {
                  py: 1.5,
                  px: 2,
                  '& .MuiAvatar-root': avatarSX,
                  '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                }
              }}
            >
              {bestSelling.map((item, idx) => (
                <ListItem
                  key={item.name}
                  component={ListItemButton}
                  divider={idx !== bestSelling.length - 1}
                  secondaryAction={
                    <Stack sx={{ alignItems: 'flex-end' }}>
                      <Typography variant="subtitle1" noWrap>
                        {item.revenue}
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'secondary.main' }} noWrap>
                        {item.pct}
                      </Typography>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ color: 'success.main', bgcolor: 'success.lighter' }}>
                      <CoffeeOutlined />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle1">{item.name}</Typography>}
                    secondary={`${item.orders} orders`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <EmptyState message="No orders yet to rank best sellers" />
          )}
        </MainCard>

        {/* Quick Actions */}
        <MainCard sx={{ mt: 2 }}>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="h5">Quick Actions</Typography>
            <Grid container spacing={1.5}>
              {quickActions.map((action) => (
                <Grid key={action.label} size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color={action.color}
                    onClick={() => navigate(action.to)}
                    sx={{
                      textTransform: 'none',
                      flexDirection: 'column',
                      gap: 0.5,
                      py: 1.5,
                      fontSize: '0.7rem'
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
