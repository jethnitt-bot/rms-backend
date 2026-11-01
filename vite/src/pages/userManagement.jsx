import React, { useState, useEffect } from 'react';
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
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  UserOutlined,
  UsergroupAddOutlined,
  UserDeleteOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  CloseOutlined
} from '@ant-design/icons';

const API_BASE_URL = 'https://rms-backend-jeth.infy.click/rms_backend/api/user';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    role: 'Administrator',
    status: 'Active'
  });

  // 1. Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_users.php`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Save / Update User
  const handleSaveUser = async () => {
    if (!formData.name || !formData.username) {
      alert('សូមបំពេញព័ត៌មាន Full Name និង Username!');
      return;
    }

    if (!editUserId && !formData.password) {
      alert('សូមបញ្ចូល Password សម្រាប់ User ថ្មី!');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Password និង Confirm Password មិនត្រូវគ្នានេះទេ!');
      return;
    }

    const endpoint = editUserId ? 'update_user.php' : 'create_user.php';
    const payload = editUserId
      ? {
          id: editUserId,
          fullname: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          ...(formData.password ? { password: formData.password } : {})
        }
      : {
          username: formData.username,
          fullname: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status
        };

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert(result.message);
        fetchUsers();
        resetForm();
      } else {
        alert(result.message || 'មានបញ្ហាក្នុងការរក្សាទុក!');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ!');
    }
  };

  // 3. Edit User
  const handleEditClick = (user) => {
    setShowAddForm(true);
    setEditUserId(user.id);
    setFormData({
      name: user.fullname || user.name || '',
      username: user.username || '',
      password: '',
      confirmPassword: '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'Administrator',
      status: user.status || 'Active'
    });
  };

  // 4. Delete User
  const handleDeleteClick = async (id) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុប User នេះមែនទេ?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete_user.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });

        const result = await response.json();

        if (result.status === 'success') {
          alert(result.message);
          fetchUsers();
          if (editUserId === id) resetForm();
        } else {
          alert(result.message || 'មិនអាចលុបបានទេ!');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const resetForm = () => {
    setEditUserId(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      phone: '',
      role: 'Administrator',
      status: 'Active'
    });
  };

  const getRoleColor = (role) => {
const formattedRole = role ? role.toLowerCase() : '';
    switch (formattedRole) {
      case 'administrator': return { bg: '#f3e5f5', color: '#7b1fa2' };
      case 'manager': return { bg: '#e3f2fd', color: '#1976d2' };
      case 'cashier': return { bg: '#fff3e0', color: '#e65100' };
      case 'waiter': return { bg: '#e0f2f1', color: '#00695c' };
      default: return { bg: '#fce4ec', color: '#c2185b' };
    }
  };

  return (
    <Box sx={{ p: 2, width: '100%', boxSizing: 'border-box' }}>
      {/* 1. Top Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Users', count: users.length, icon: <UserOutlined style={{ fontSize: '22px' }} />, color: '#7c4dff', bg: '#f3e8ff' },
          { title: 'Active Users', count: users.filter((u) => u.status === 'Active').length, icon: <UsergroupAddOutlined style={{ fontSize: '22px' }} />, color: '#2e7d32', bg: '#e8f5e9' },
          { title: 'Inactive Users', count: users.filter((u) => u.status === 'Inactive').length, icon: <UserDeleteOutlined style={{ fontSize: '22px' }} />, color: '#d32f2f', bg: '#ffebee' },
          { title: 'Administrators', count: users.filter((u) => u.role === 'Administrator').length, icon: <SafetyCertificateOutlined style={{ fontSize: '22px' }} />, color: '#ed6c02', bg: '#fff3e0' }
        ].map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: '90px' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* ប្រើ Stack ជំនួសរាល់ alignment លើ DOM ដើម្បីបាត់ Warning */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 48, height: 48, borderRadius: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">{card.title}</Typography>
                    <Typography variant="h4" fontWeight="bold">{card.count}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 2. Main Content Grid */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={showAddForm ? 8 : 12}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box' }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography variant="h6" fontWeight="bold">Users List</Typography>
              {!showAddForm && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => { setShowAddForm(true); resetForm(); }}>
                  Add User
                </Button>
              )}
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
              <TextField placeholder="Search by name, username..." size="small" fullWidth />
              <Select defaultValue="All" size="small" sx={{ minWidth: 120 }}>
                <MenuItem value="All">All Roles</MenuItem>
              </Select>
              <Select defaultValue="All" size="small" sx={{ minWidth: 120 }}>
                <MenuItem value="All">All Status</MenuItem>
              </Select>
              <Button variant="outlined" startIcon={<FilterOutlined />}>Filter</Button>
            </Stack>

            <TableContainer sx={{ minHeight: '320px' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>FULL NAME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>USERNAME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ROLE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                        មិនទាន់មានទិន្នន័យ User ឡើយ
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const roleStyle = getRoleColor(user.role);
                      const displayName = user.fullname || user.name;
                      return (
                        <TableRow key={user.id} hover>
                          <TableCell>#{user.id}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#bdbdbd', fontSize: '14px' }}>
                                {displayName ? displayName[0].toUpperCase() : 'U'}
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium">{displayName}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Chip label={user.role} size="small" sx={{ bgcolor: roleStyle.bg, color: roleStyle.color, fontWeight: 'bold', borderRadius: 1 }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={user.status} size="small" color={user.status === 'Active' ? 'success' : 'error'} sx={{ borderRadius: 1 }} />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton size="small" color="primary" onClick={() => setViewUser(user)}>
                                <EyeOutlined />
                              </IconButton>
                              <IconButton size="small" color="warning" onClick={() => handleEditClick(user)}>
                                <EditOutlined />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteClick(user.id)}>
                                <DeleteOutlined />
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Pagination count={1} color="primary" shape="rounded" size="small" />
            </Box>
          </Paper>
        </Grid>

        {/* 3. Add/Edit Form Area */}
        {showAddForm && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box' }}>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {editUserId ? 'Edit User' : 'Add New User'}
                </Typography>
                <IconButton size="small" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  <CloseOutlined />
                </IconButton>
              </Stack>

              <Stack spacing={2}>
                <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} size="small" fullWidth placeholder="Enter full name" />
                <TextField label="Username" name="username" value={formData.username} onChange={handleChange} size="small" fullWidth placeholder="Enter username" disabled={Boolean(editUserId)} />
                <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} size="small" fullWidth placeholder={editUserId ? "Leave blank if unchanged" : "Enter password"} />
                <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} size="small" fullWidth placeholder="Confirm password" />
                <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} size="small" fullWidth placeholder="Enter email address" />
                <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} size="small" fullWidth placeholder="Enter phone number" />

                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select label="Role" name="role" value={formData.role} onChange={handleChange}>
                    <MenuItem value="Administrator">Administrator</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Cashier">Cashier</MenuItem>
                    <MenuItem value="Waiter">Waiter</MenuItem>
                  </Select>
                </FormControl>

                <FormControl>
                  <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>Status</Typography>
                  <RadioGroup row name="status" value={formData.status} onChange={handleChange}>
                    <FormControlLabel value="Active" control={<Radio size="small" />} label="Active" />
                    <FormControlLabel value="Inactive" control={<Radio size="small" />} label="Inactive" />
                  </RadioGroup>
                </FormControl>

                <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                  <Button variant="contained" fullWidth startIcon={editUserId ? <EditOutlined /> : <PlusOutlined />} onClick={handleSaveUser}>
                    {editUserId ? 'Update User' : 'Save User'}
                  </Button>
                  <Button variant="outlined" color="secondary" fullWidth onClick={resetForm}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 4. Details Modal */}
      <Dialog open={Boolean(viewUser)} onClose={() => setViewUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>User Details</DialogTitle>
        <Divider />
        <DialogContent>
          {viewUser && (
            <Stack spacing={1.5}>
              <Typography variant="body2"><strong>ID:</strong> #{viewUser.id}</Typography>
              <Typography variant="body2"><strong>Full Name:</strong> {viewUser.fullname || viewUser.name}</Typography>
              <Typography variant="body2"><strong>Username:</strong> {viewUser.username}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {viewUser.email || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Role:</strong> {viewUser.role}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {viewUser.status}</Typography>
              <Typography variant="body2"><strong>Created At:</strong> {viewUser.created_at || 'N/A'}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUser(null)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
