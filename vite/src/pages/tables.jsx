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
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Pagination,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  TableOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
  UpOutlined
} from '@ant-design/icons';

const capacityOptions = ['2 Seater', '4 Seater', '6 Seater', '8 Seater'];
const zoneOptions = ['Main Floor', 'Window', 'Garden', 'Private Room'];

const getStatusColor = (status) => {
  switch (status) {
    case 'Available': return { bg: '#dcfce7', color: '#15803d' };
    case 'Occupied': return { bg: '#dbeafe', color: '#1d4ed8' };
    case 'Reserved': return { bg: '#fef3c7', color: '#b45309' };
    case 'Cleaning': return { bg: '#f1f5f9', color: '#475569' };
    default: return { bg: '#f1f5f9', color: '#475569' };
  }
};

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // State សម្រាប់ Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    zone: '',
    location: '',
    status: 'Available'
  });

  // 🟢 ១. ទាញយកទិន្នន័យ Tables ពី Backend API
  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://rms-backend-jeth.infy.click/rms_backend/api/tables/get_tables.php');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTables(data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '',
      zone: '',
      location: '',
      status: 'Available'
    });
    setEditingId(null);
  };

  // 🟢 ២. Function បង្កើត ឬ កែប្រែទិន្នន័យ Table (Save / Update)
  const handleSaveTable = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.capacity || !formData.zone) {
      alert('សូមបំពេញ Table Name, Capacity និង Zone!');
      return;
    }

    try {
      const url = editingId
        ? 'https://rms-backend-jeth.infy.click/rms_backend/api/tables/update_table.php'
        : 'https://rms-backend-jeth.infy.click/rms_backend/api/tables/create_table.php';

      const payload = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === 'success') {
        alert(editingId ? 'កែប្រែ Table ជោគជ័យ!' : 'បង្កើត Table ថ្មីជោគជ័យ!');
        resetForm();
        fetchTables(); // Refresh List
      } else {
        alert('មានបញ្ហា៖ ' + result.message);
      }
    } catch (error) {
      console.error('Error saving table:', error);
      alert('មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ!');
    }
  };

  const handleEdit = (table) => {
    setEditingId(table.id);
    setFormData({
      name: table.name || '',
      capacity: table.capacity || '',
      zone: table.zone || '',
      location: table.location || '',
      status: table.status || 'Available'
    });
    setShowAddForm(true);
  };

  // 🟢 ៣. គណនា Stat Cards តាមរៀលថែម
  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === 'Available').length;
  const occupiedTables = tables.filter((t) => t.status === 'Occupied').length;
  const reservedCleaningTables = tables.filter((t) => t.status === 'Reserved' || t.status === 'Cleaning').length;

  // 🟢 ៤. Filter & Search Logic
  const filteredTables = tables.filter((t) => {
    const matchesSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(t.id).includes(searchTerm);
    const matchesZone = selectedZone === 'All' || t.zone === selectedZone;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    
    return matchesSearch && matchesZone && matchesStatus;
  });

  return (
    <Box sx={{ p: 1 }}>
      {/* 1. Stat Cards Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Tables', count: totalTables, sub: 'Total Tables', icon: <TableOutlined />, color: '#2563eb', bg: '#dbeafe' },
          { title: 'Available Tables', count: availableTables, sub: 'Available Tables', icon: <CheckCircleOutlined />, color: '#16a34a', bg: '#dcfce7' },
          { title: 'Occupied Tables', count: occupiedTables, sub: 'Occupied Tables', icon: <TeamOutlined />, color: '#d97706', bg: '#fef3c7' },
          { title: 'Reserved/Cleaning', count: reservedCleaningTables, sub: 'Reserved/Cleaning', icon: <CalendarOutlined />, color: '#7c3aed', bg: '#f3e8ff' }
        ].map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 48, height: 48, borderRadius: '50%' }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">{card.title}</Typography>
                    <Typography variant="h4" fontWeight="bold">{card.count}</Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {card.sub}
                </Typography>
                <Button size="small" sx={{ p: 0 }}>View all &gt;</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 2. Main Area (Table + Form) */}
      <Grid container spacing={3}>
        {/* Table Section */}
        <Grid item xs={12} md={showAddForm ? 8 : 12}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">Tables List</Typography>
              {!showAddForm && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setShowAddForm(true)}>
                  Add Table
                </Button>
              )}
            </Stack>

            {/* Filter Bar */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                placeholder="Search by table name or ID..."
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  )
                }}
              />
              <Select 
                value={selectedZone} 
                onChange={(e) => setSelectedZone(e.target.value)} 
                size="small" 
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="All">All Zones</MenuItem>
                {zoneOptions.map((z) => (
                  <MenuItem key={z} value={z}>{z}</MenuItem>
                ))}
              </Select>
              <Select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)} 
                size="small" 
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Occupied">Occupied</MenuItem>
                <MenuItem value="Reserved">Reserved</MenuItem>
                <MenuItem value="Cleaning">Cleaning</MenuItem>
              </Select>
              <Button variant="outlined" startIcon={<FilterOutlined />} onClick={fetchTables}>
                Refresh
              </Button>
            </Stack>

            {/* Tables Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Table ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Table Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Zone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : filteredTables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        ពុំទាន់មានទិន្នន័យតុនៅឡើយទេ
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTables.map((table) => {
                      const statusStyle = getStatusColor(table.status);
                      return (
                        <TableRow key={table.id} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>#{table.id}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">{table.name}</Typography>
                          </TableCell>
                          <TableCell>{table.capacity}</TableCell>
                          <TableCell>{table.zone}</TableCell>
                          <TableCell>
                            <Chip
                              label={table.status}
                              size="small"
                              sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton size="small" color="primary" title="View">
                                <EyeOutlined />
                              </IconButton>
                              <IconButton size="small" color="warning" onClick={() => handleEdit(table)} title="Edit">
                                <EditOutlined />
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredTables.length > 0 ? 1 : 0} to {filteredTables.length} of {filteredTables.length} items
              </Typography>
              <Pagination count={Math.max(1, Math.ceil(filteredTables.length / 8))} color="primary" shape="rounded" />
            </Box>
          </Paper>
        </Grid>

        {/* 3. Add / Edit Table Form Panel */}
        {showAddForm && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {editingId ? 'Edit Table' : 'Add New Table'}
                </Typography>
                <IconButton size="small" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  <UpOutlined />
                </IconButton>
              </Stack>

              <form onSubmit={handleSaveTable}>
                <Stack spacing={2}>
                  {/* Table Name */}
                  <Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Table Name <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter table name (e.g. Table 01)"
                      size="small"
                      fullWidth
                    />
                  </Box>

                  {/* Capacity */}
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Capacity <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Select name="capacity" value={formData.capacity} onChange={handleChange} displayEmpty>
                      <MenuItem value="" disabled>Select capacity</MenuItem>
                      {capacityOptions.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Zone */}
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Zone <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Select name="zone" value={formData.zone} onChange={handleChange} displayEmpty>
                      <MenuItem value="" disabled>Select zone</MenuItem>
                      {zoneOptions.map((z) => (
                        <MenuItem key={z} value={z}>{z}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Location */}
                  <Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Location
                    </Typography>
                    <TextField
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter location detail"
                      size="small"
                      fullWidth
                    />
                  </Box>

                  {/* Status */}
                  <FormControl>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Status <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <RadioGroup row name="status" value={formData.status} onChange={handleChange}>
                      <FormControlLabel value="Available" control={<Radio size="small" />} label="Available" />
                      <FormControlLabel value="Occupied" control={<Radio size="small" />} label="Occupied" />
                    </RadioGroup>
                  </FormControl>

                  {/* Buttons */}
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Button type="submit" variant="contained" fullWidth startIcon={<PlusOutlined />}>
                      {editingId ? 'Update Table' : 'Save Table'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => { resetForm(); setShowAddForm(false); }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TablesPage;
