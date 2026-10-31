import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  InputAdornment
} from '@mui/material';
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CloudUploadOutlined,
  UpOutlined
} from '@ant-design/icons';

// ---- ពណ៌ Chip សម្រាប់ Category ----
const CATEGORY_PALETTE = [
  { bg: '#f3e8ff', color: '#7c3aed' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#fef3c7', color: '#b45309' },
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#e0f2fe', color: '#0369a1' }
];

const getCategoryColor = (categoryId) => {
  if (!categoryId) return { bg: '#f1f5f9', color: '#475569' };
  return CATEGORY_PALETTE[categoryId % CATEGORY_PALETTE.length];
};

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const fileInputRef = useRef(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    status: '1' // 1: Available, 0: Unavailable
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // ---------------- API Endpoint Config ----------------
  const SERVER_URL = 'https://rms-backend-jeth.infy.click/rms_backend/';
  const MENU_API = 'https://rms-backend-jeth.infy.click/rms_backend/api/menu/menu_items.php';
  const CATEGORIES_API = 'https://rms-backend-jeth.infy.click/rms_backend/api/categories/categories.php';

  const cardShadow = '0 2px 10px rgba(0,0,0,0.04)';

  // ---------------- Fetch ពី Backend ----------------
  const fetchMenuItems = async () => {
    try {
      const res = await fetch(MENU_API);
      const data = await res.json();
      if (Array.isArray(data)) setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_API);
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  // ---------------- Form Handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applySelectedFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសតែឯកសាររូបភាព!');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('សូមជ្រើសរើសរូបភាពដែលមានទំហំតូចជាង 2MB!');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => applySelectedFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    applySelectedFile(e.dataTransfer.files[0]);
  };

  const resetForm = () => {
    setFormData({ name: '', category_id: '', price: '', status: '1' });
    setSelectedFile(null);
    setImagePreview('');
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  // ---------------- Save (Create/Update) ----------------
  const handleSaveMenu = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category_id || !formData.price) {
      alert('សូមបំពេញ Menu Name, Category និង Price!');
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('category_id', formData.category_id);
    dataToSend.append('price', formData.price);
    dataToSend.append('status', formData.status === '1' ? 'Available' : 'Unavailable');
    if (editingId) dataToSend.append('id', editingId);
    if (selectedFile) dataToSend.append('image', selectedFile);

    try {
      const res = await fetch(MENU_API, { method: 'POST', body: dataToSend });
      const result = await res.json();

      if (!res.ok) {
        alert(result.message || 'មានបញ្ហាកើតឡើង!');
        return;
      }

      alert(result.message || 'រក្សាទុកជោគជ័យ!');
      fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('មិនអាចតភ្ជាប់ទៅកាន់ API បានទេ!');
    }
  };

  // ---------------- Edit ----------------
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      category_id: item.category_id || '',
      price: String(item.price ?? ''),
      status: Number(item.is_available) === 1 || item.status === 'Available' ? '1' : '0'
    });
    setSelectedFile(null);
    setImagePreview(item.image ? (item.image.startsWith('http') ? item.image : `${SERVER_URL}${item.image}`) : '');
    setShowAddForm(true);
  };

  // ---------------- Delete ----------------
  const handleDelete = async (id) => {
    if (!window.confirm('តើអ្នកពិតជាចង់លុប Menu នេះមែនទេ?')) return;

    try {
      const res = await fetch(`${MENU_API}?id=${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (!res.ok) {
        alert(result.message || 'មិនអាចលុបបានទេ!');
        return;
      }

      alert(result.message || 'លុបជោគជ័យ!');
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('មិនអាចតភ្ជាប់ទៅកាន់ API បានទេ!');
    }
  };

  // ---------------- Filter Logic ----------------
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' ||
        item.category === selectedCategory ||
        item.category_id === Number(selectedCategory);

      const isAvailable = Number(item.is_available) === 1 || item.status === 'Available';
      const itemStatusLabel = isAvailable ? 'Available' : 'Unavailable';
      const matchesStatus = selectedStatus === 'All' || itemStatusLabel === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [menuItems, searchTerm, selectedCategory, selectedStatus]);

  const pagedMenuItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredMenuItems.slice(start, start + itemsPerPage);
  }, [filteredMenuItems, page]);

  // ---------------- Stat Cards ----------------
  const totalMenuItems = menuItems.length;
  const availableMenu = menuItems.filter(
    (m) => Number(m.is_available) === 1 || m.status === 'Available'
  ).length;
  const unavailableMenu = menuItems.filter(
    (m) => Number(m.is_available) === 0 || m.status === 'Unavailable'
  ).length;
  const totalCategories = categories.length;

  return (
    <Box sx={{ p: 1 }}>
      {/* 1. Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Menu Items', count: totalMenuItems, sub: 'All menu items', icon: <BellOutlined />, color: '#2563eb', bg: '#dbeafe' },
          { title: 'Available Menu', count: availableMenu, sub: 'Currently available', icon: <CheckCircleOutlined />, color: '#16a34a', bg: '#dcfce7' },
          { title: 'Unavailable Menu', count: unavailableMenu, sub: 'Not available', icon: <CloseCircleOutlined />, color: '#dc2626', bg: '#fee2e2' },
          { title: 'Categories', count: totalCategories, sub: 'Total categories', icon: <FolderOpenOutlined />, color: '#d97706', bg: '#fef3c7' }
        ].map((card, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: cardShadow }}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 48, height: 48, borderRadius: '50%' }}>{card.icon}</Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {card.count}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {card.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 2. Main Area (Table + Form) */}
      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        {/* Table Section */}
        <Grid item xs={12} md={showAddForm ? 8 : 12}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Menu Items
              </Typography>
              {!showAddForm && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setShowAddForm(true)}>
                  Add Menu
                </Button>
              )}
            </Stack>

            {/* Filter Bar */}
            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search menu name..."
                size="small"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 200, flex: 1 }}
              />
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              <Select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                size="small"
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Unavailable">Unavailable</MenuItem>
              </Select>
              <Button variant="outlined" startIcon={<ReloadOutlined />} onClick={resetFilters}>
                Reset
              </Button>
            </Stack>

            {/* Menu Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Menu Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedMenuItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        ពុំមានទិន្នន័យ Menu ត្រូវបានរកឃើញឡើយ
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedMenuItems.map((item, index) => {
                      const catStyle = getCategoryColor(item.category_id);
                      const isAvailable = Number(item.is_available) === 1 || item.status === 'Available';
                      const imageUrl = item.image
                        ? item.image.startsWith('http')
                          ? item.image
                          : `${SERVER_URL}${item.image}`
                        : '';

                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>{(page - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>
                            <Avatar
                              src={imageUrl}
                              variant="rounded"
                              sx={{ width: 42, height: 42, bgcolor: '#f1f5f9' }}
                            >
                              <BellOutlined />
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {item.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.category_name || item.category || 'Uncategorized'}
                              size="small"
                              sx={{ bgcolor: catStyle.bg, color: catStyle.color, fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={isAvailable ? 'Available' : 'Unavailable'}
                              size="small"
                              sx={{
                                bgcolor: isAvailable ? '#dcfce7' : '#fee2e2',
                                color: isAvailable ? '#15803d' : '#b91c1c',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton size="small" color="warning" onClick={() => handleEdit(item)}>
                                <EditOutlined />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {pagedMenuItems.length} of {filteredMenuItems.length} items
              </Typography>
              <Pagination
                count={Math.max(1, Math.ceil(filteredMenuItems.length / itemsPerPage))}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </Paper>
        </Grid>

        {/* 3. Add / Edit Menu Form Panel */}
        {showAddForm && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: cardShadow, position: 'sticky', top: 20 }}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {editingId ? 'Edit Menu' : 'Add New Menu'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingId ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានមុខម្ហូប' : 'បំពេញព័ត៌មានដើម្បីបង្កើតមុខម្ហូបថ្មី'}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  <UpOutlined />
                </IconButton>
              </Stack>

              <form onSubmit={handleSaveMenu}>
                <Stack spacing={2.5} sx={{ mt: 2 }}>
                  {/* Image Upload — Dropzone */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Food Image
                    </Typography>
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        bgcolor: '#fafafa',
                        borderRadius: 2,
                        p: imagePreview ? 1.5 : 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': { borderColor: 'primary.main', bgcolor: '#f5f8ff' }
                      }}
                    >
                      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
                      {imagePreview ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box
                            component="img"
                            src={imagePreview}
                            alt="Preview"
                            sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mb: 1 }}
                          />
                          <Typography variant="caption" color="primary">
                            ចុចដើម្បីប្តូររូបភាព
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <CloudUploadOutlined style={{ fontSize: 32, color: '#64748b' }} />
                          <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                            ចុច ឬអូសរូបភាពមកដាក់ត្រង់នេះ
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            JPG, PNG, GIF, WEBP — មិនលើស 2MB
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Menu Name */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Menu Name <span style={{ color: '#d32f2f' }}>*</span>
                    </Typography>
                    <TextField name="name" value={formData.name} onChange={handleChange} placeholder="Enter menu name" size="medium" fullWidth />
                  </Box>

                  {/* Category */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Category <span style={{ color: '#d32f2f' }}>*</span>
                    </Typography>
                    <FormControl fullWidth>
                      <Select name="category_id" value={formData.category_id} onChange={handleChange} displayEmpty>
                        <MenuItem value="" disabled>
                          Select category
                        </MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {categories.length === 0 && (
                      <Typography variant="caption" color="error">
                        មិនទាន់មាន Category ទេ — សូមទៅបង្កើតនៅទំព័រ Categories មុនសិន
                      </Typography>
                    )}
                  </Box>

                  {/* Price */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Price <span style={{ color: '#d32f2f' }}>*</span>
                    </Typography>
                    <TextField
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      type="number"
                      size="medium"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                    />
                  </Box>

                  {/* Status */}
                  <FormControl>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Status <span style={{ color: '#d32f2f' }}>*</span>
                    </Typography>
                    <RadioGroup row name="status" value={formData.status} onChange={handleChange}>
                      <FormControlLabel value="1" control={<Radio size="small" />} label="Available" />
                      <FormControlLabel value="0" control={<Radio size="small" />} label="Unavailable" />
                    </RadioGroup>
                  </FormControl>

                  {/* Buttons */}
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Button type="submit" variant="contained" size="large" fullWidth startIcon={<PlusOutlined />}>
                      {editingId ? 'Update Menu' : 'Save Menu'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="large"
                      fullWidth
                      onClick={() => {
                        resetForm();
                        setShowAddForm(false);
                      }}
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

export default MenuPage;
