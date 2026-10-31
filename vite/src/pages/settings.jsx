import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Switch,
  Stack,
  Avatar,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  SettingOutlined,
  ShopOutlined,
  DesktopOutlined,
  FileTextOutlined,
  BellOutlined,
  TeamOutlined,
  CloudUploadOutlined,
  SafetyOutlined,
  UploadOutlined,
  CheckCircleFilled
} from '@ant-design/icons';

const menuItems = [
  { id: 'general', title: 'General Settings', sub: 'Basic system settings', icon: <SettingOutlined /> },
  { id: 'restaurant', title: 'Restaurant Information', sub: 'Manage restaurant details', icon: <ShopOutlined /> },
  { id: 'system', title: 'System Settings', sub: 'System preferences', icon: <DesktopOutlined /> },
  { id: 'receipt', title: 'Receipt Settings', sub: 'Receipt & invoice settings', icon: <FileTextOutlined /> },
  { id: 'notification', title: 'Notification Settings', sub: 'Email & alert settings', icon: <BellOutlined /> },
  { id: 'roles', title: 'User & Role Settings', sub: 'Manage users and roles', icon: <TeamOutlined /> },
  { id: 'backup', title: 'Backup & Restore', sub: 'Backup and restore data', icon: <CloudUploadOutlined /> },
  { id: 'security', title: 'Security Settings', sub: 'Password & security', icon: <SafetyOutlined /> }
];

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('general');
  const [toast, setToast] = useState({ open: false, message: '' });

  // General Settings State
  const [general, setGeneral] = useState({
    systemName: 'RMS System',
    maintenanceMode: false
  });

  // Restaurant Information
  const [restaurant, setRestaurant] = useState({
    name: 'Good Food Restaurant',
    phone: '012 345 678',
    email: 'info@goodfood.com',
    address: 'Street 27, Wat Bo Village, Siem Reap, Cambodia',
    website: 'www.goodfood.com',
    logoPreview: ''
  });

  // System Settings (បានដក timezone ออกแล้ว)
  const [system, setSystem] = useState({
    currency: 'USD - US Dollar ($)',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12 Hours (AM/PM)',
    language: 'English',
    taxPercentage: '10',
    serviceCharge: '5'
  });

  // Receipt Settings
  const [receipt, setReceipt] = useState({
    showLogo: true,
    showThankYou: true,
    showTax: true,
    showServiceCharge: true,
    footerMessage: 'Thank you and visit again!'
  });

  // Notification Settings
  const [notification, setNotification] = useState({
    emailNotifications: true,
    lowStockAlert: true,
    expiringItemsAlert: true,
    dailySalesSummary: false,
    emailForNotifications: 'admin@goodfood.com'
  });

  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState('30 Minutes');

  const showToast = (message) => setToast({ open: true, message });

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setRestaurant((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRestaurant((prev) => ({ ...prev, logoPreview: url }));
    }
  };

  const handleSystemChange = (e) => {
    const { name, value } = e.target;
    setSystem((prev) => ({ ...prev, [name]: value }));
  };

  const handleReceiptToggle = (name) => (e) => {
    setReceipt((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  const handleReceiptText = (e) => {
    setReceipt((prev) => ({ ...prev, footerMessage: e.target.value }));
  };

  const handleNotificationToggle = (name) => (e) => {
    setNotification((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  const handleNotificationEmail = (e) => {
    setNotification((prev) => ({ ...prev, emailForNotifications: e.target.value }));
  };

  const cardShadow = '0 2px 10px rgba(0,0,0,0.04)';

  return (
    <Box sx={{ p: 1 }}>
      {/* 🟢 SETTINGS MENU - Horizontal Scroll */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: cardShadow, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
          Settings Menu
        </Typography>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 3 }
          }}
        >
          {menuItems.map((item) => {
            const isActive = item.id === activeItem;
            return (
              <Box
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  bgcolor: isActive ? 'primary.main' : '#f8fafc',
                  color: isActive ? '#fff' : 'text.primary',
                  '&:hover': { bgcolor: isActive ? 'primary.main' : '#f1f5f9' }
                }}
              >
                <Box sx={{ fontSize: 16, display: 'flex' }}>{item.icon}</Box>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary', lineHeight: 1.2 }}
                  >
                    {item.sub}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      {/* 🟡 DYNAMIC CONTENT DISPLAY - បង្ហាញតាម activeItem */}
      <Grid container spacing={3}>
        {/* 1. General Settings */}
        {activeItem === 'general' && (
          <Grid item xs={12} md={8} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                General Settings
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                    System Name
                  </Typography>
                  <TextField
                    value={general.systemName}
                    onChange={(e) => setGeneral({ ...general, systemName: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight="medium">Maintenance Mode</Typography>
                    <Typography variant="caption" color="text.secondary">Disable access for non-admin users</Typography>
                  </Box>
                  <Switch
                    checked={general.maintenanceMode}
                    onChange={(e) => setGeneral({ ...general, maintenanceMode: e.target.checked })}
                  />
                </Stack>
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<FileTextOutlined />}
                    onClick={() => showToast('General settings saved!')}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* 2. Restaurant Information */}
        {activeItem === 'restaurant' && (
          <Grid item xs={12} md={8} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Restaurant Information
              </Typography>

              <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Avatar
                  variant="rounded"
                  src={restaurant.logoPreview || undefined}
                  sx={{ width: 100, height: 100, bgcolor: '#111827', fontSize: 12 }}
                >
                  {!restaurant.logoPreview && (
                    <Stack alignItems="center" spacing={0.5}>
                      <ShopOutlined style={{ fontSize: 22, color: '#facc15' }} />
                      <Typography variant="caption" sx={{ color: '#facc15', fontWeight: 'bold' }}>
                        GOOD FOOD
                      </Typography>
                    </Stack>
                  )}
                </Avatar>
                <Button component="label" size="small" variant="outlined" startIcon={<UploadOutlined />}>
                  Change Logo
                  <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG up to 2MB
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                    Restaurant Name <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField name="name" value={restaurant.name} onChange={handleRestaurantChange} size="small" fullWidth />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                    Phone Number <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField name="phone" value={restaurant.phone} onChange={handleRestaurantChange} size="small" fullWidth />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                    Email
                  </Typography>
                  <TextField name="email" value={restaurant.email} onChange={handleRestaurantChange} size="small" fullWidth />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                    Address
                  </Typography>
                  <TextField name="address" value={restaurant.address} onChange={handleRestaurantChange} size="small" fullWidth multiline rows={2} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                    Website
                  </Typography>
                  <TextField name="website" value={restaurant.website} onChange={handleRestaurantChange} size="small" fullWidth />
                </Box>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<FileTextOutlined />}
                    onClick={() => showToast('Restaurant information saved!')}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* 3. System Settings (បានដក Time Zone ចេញរួចរាល់) */}
        {activeItem === 'system' && (
          <Grid item xs={12} md={8} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                System Settings
              </Typography>

              <Stack spacing={2}>
                {[
                  { key: 'currency', label: 'Currency', hint: 'Select system currency', options: ['USD - US Dollar ($)', 'KHR - Cambodian Riel (៛)', 'EUR - Euro (€)'] },
                  { key: 'dateFormat', label: 'Date Format', hint: 'Select date format', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
                  { key: 'timeFormat', label: 'Time Format', hint: 'Select time format', options: ['12 Hours (AM/PM)', '24 Hours'] },
                  { key: 'language', label: 'Language', hint: 'Select system language', options: ['English', 'ភាសាខ្មែរ'] }
                ].map((field) => (
                  <Stack key={field.key} direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{field.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{field.hint}</Typography>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 190 }}>
                      <Select name={field.key} value={system[field.key]} onChange={handleSystemChange}>
                        {field.options.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                ))}

                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" fontWeight="medium">Tax Percentage</Typography>
                    <Typography variant="caption" color="text.secondary">Set default tax percentage</Typography>
                  </Box>
                  <TextField
                    name="taxPercentage"
                    value={system.taxPercentage}
                    onChange={handleSystemChange}
                    size="small"
                    sx={{ width: 100 }}
                    InputProps={{ endAdornment: '%' }}
                  />
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" fontWeight="medium">Service Charge</Typography>
                    <Typography variant="caption" color="text.secondary">Set default service charge</Typography>
                  </Box>
                  <TextField
                    name="serviceCharge"
                    value={system.serviceCharge}
                    onChange={handleSystemChange}
                    size="small"
                    sx={{ width: 100 }}
                    InputProps={{ endAdornment: '%' }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<FileTextOutlined />}
                    onClick={() => showToast('System settings saved!')}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* 4. Receipt Settings */}
        {activeItem === 'receipt' && (
          <Grid item xs={12} md={8} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Receipt Settings
              </Typography>

              <Stack spacing={1.5}>
                {[
                  { key: 'showLogo', label: 'Show Logo on Receipt', hint: 'Display restaurant logo on receipt' },
                  { key: 'showThankYou', label: 'Show Thank You Message', hint: 'Display thank you message on receipt' },
                  { key: 'showTax', label: 'Show Tax', hint: 'Display tax amount on receipt' },
                  { key: 'showServiceCharge', label: 'Show Service Charge', hint: 'Display service charge on receipt' }
                ].map((item) => (
                  <Stack key={item.key} direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{item.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.hint}</Typography>
                    </Box>
                    <Switch checked={receipt[item.key]} onChange={handleReceiptToggle(item.key)} />
                  </Stack>
                ))}

                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>Footer Message</Typography>
                  <TextField value={receipt.footerMessage} onChange={handleReceiptText} size="small" fullWidth />
                </Box>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<FileTextOutlined />}
                    onClick={() => showToast('Receipt settings saved!')}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* 5. Notification Settings */}
        {activeItem === 'notification' && (
          <Grid item xs={12} md={8} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Notification Settings
              </Typography>

              <Stack spacing={1.5}>
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', hint: 'Receive email notifications' },
                  { key: 'lowStockAlert', label: 'Low Stock Alert', hint: 'Get notified for low stock items' },
                  { key: 'expiringItemsAlert', label: 'Expiring Items Alert', hint: 'Get notified for expiring items' },
                  { key: 'dailySalesSummary', label: 'Daily Sales Summary', hint: 'Receive daily sales summary' }
                ].map((item) => (
                  <Stack key={item.key} direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{item.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.hint}</Typography>
                    </Box>
                    <Switch checked={notification[item.key]} onChange={handleNotificationToggle(item.key)} />
                  </Stack>
                ))}

                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>Email for Notifications</Typography>
                  <TextField value={notification.emailForNotifications} onChange={handleNotificationEmail} size="small" fullWidth />
                </Box>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<FileTextOutlined />}
                    onClick={() => showToast('Notification settings saved!')}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* 6. User & Role Settings */}
        {activeItem === 'roles' && (
          <Grid item xs={12} md={8} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                User & Role Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage user access levels, permissions, and roles.
              </Typography>
              <Button variant="outlined" startIcon={<TeamOutlined />} onClick={() => showToast('Manage Roles clicked')}>
                Manage Roles & Permissions
              </Button>
            </Paper>
          </Grid>
        )}

        {/* 7. Backup & Restore */}
        {activeItem === 'backup' && (
          <Grid item xs={12} md={8} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Backup & Restore
              </Typography>

              <Stack spacing={1.2} sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Last Backup</Typography>
                  <Typography variant="body2" fontWeight="medium">27 May 2024 10:30 AM</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Backup Size</Typography>
                  <Typography variant="body2" fontWeight="medium">45.6 MB</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Backup Location</Typography>
                  <Typography variant="body2" fontWeight="medium">Local Storage</Typography>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadOutlined />}
                  onClick={() => showToast('Backup started...')}
                >
                  Backup Now
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  fullWidth
                  onClick={() => {
                    if (window.confirm('តើអ្នកពិតជាចង់ Restore ទិន្នន័យចុងក្រោយមែនទេ?')) {
                      showToast('Backup restored!');
                    }
                  }}
                >
                  Restore Backup
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* 8. Security Settings */}
        {activeItem === 'security' && (
          <Grid item xs={12} md={8} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Security Settings
              </Typography>

              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  onClick={() => showToast('បើក Change Password ...')}
                  sx={{ cursor: 'pointer', p: 1, borderRadius: 1, '&:hover': { bgcolor: '#f8fafc' } }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="medium">Change Password</Typography>
                    <Typography variant="caption" color="text.secondary">Update your password regularly</Typography>
                  </Box>
                  <Typography variant="h6" color="text.secondary">›</Typography>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight="medium">Session Timeout</Typography>
                    <Typography variant="caption" color="text.secondary">Auto logout after inactivity</Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                      <MenuItem value="15 Minutes">15 Minutes</MenuItem>
                      <MenuItem value="30 Minutes">30 Minutes</MenuItem>
                      <MenuItem value="1 Hour">1 Hour</MenuItem>
                      <MenuItem value="Never">Never</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Footer note */}
      <Paper
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          boxShadow: cardShadow,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleFilled style={{ color: '#2e7d32' }} />
          <Typography variant="body2" color="text.secondary">
            Keep your system settings up to date for better security and performance.
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">RMS Version 1.0.0</Typography>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast({ open: false, message: '' })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
