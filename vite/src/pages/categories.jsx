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
  IconButton,
  Stack,
  Box,
  InputAdornment,
  Avatar,
  Divider
} from '@mui/material';
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  CloseOutlined,
  SearchOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TagsOutlined
} from '@ant-design/icons';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');

  // Form State (មាន name និង imageFile)
  const [formData, setFormData] = useState({
    name: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Base Server URL & API URL
const SERVER_URL = 'http://localhost/rms_backend/';
const API_URL = 'http://localhost/rms_backend/api/categories/categories.php';

  const cardShadow = '0 2px 10px rgba(0,0,0,0.04)';

  // Fetch Categories ពី PHP Backend
  const fetchCategories = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Text Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Change (input ឬ drag & drop ហៅមកដូចគ្នា)
  const applySelectedFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសតែឯកសាររូបភាព (JPG, PNG, GIF, WEBP)!');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    applySelectedFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applySelectedFile(e.dataTransfer.files[0]);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save / Update Category ប្រើ FormData
  const handleSaveCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('សូមបញ្ចូលឈ្មោះ Category!');
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);

    if (editingId) {
      dataToSend.append('id', editingId);
    }

    if (selectedFile) {
      dataToSend.append('image', selectedFile);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: dataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || 'មានបញ្ហាកើតឡើង!');
        return;
      }

      alert(result.message || 'រក្សាទុកជោគជ័យ!');
      fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error connecting to API:', error);
      alert('មិនអាចតភ្ជាប់ទៅកាន់ API បានទេ!');
    }
  };

  // Edit Action
  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || ''
    });
    setSelectedFile(null);
    if (category.image) {
      setImagePreview(SERVER_URL + category.image);
    } else {
      setImagePreview(null);
    }
    setShowAddForm(true);
  };

  // Reset Form
  const resetForm = () => {
    setFormData({ name: '' });
    setSelectedFile(null);
    setImagePreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter Logic
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const catName = cat.name || '';
      return catName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [categories, searchTerm]);

  // Calculated Stats
  const totalCategories = categories.length;
  // สมมติฐานตัวเลขจำลองสำหรับ Stat Cards อื่นๆ 
  const activeCount = totalCategories; 
  const featuredCount = Math.min(totalCategories, 3);
  const recentCount = categories.filter(cat => {
    if (!cat.created_at) return false;
    const createdDate = new Date(cat.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  return (
    <Box sx={{ p: 1 }}>
      {/* 1. Stat Cards (4 ប្រអប់ផ្សេងគ្នា)[cite: 10] */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: cardShadow, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ bgcolor: '#eff6ff', color: '#2563eb', p: 1.5, borderRadius: 3, display: 'flex' }}>
                  <AppstoreOutlined style={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Total Categories
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {totalCategories}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: cardShadow, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ bgcolor: '#f0fdf4', color: '#16a34a', p: 1.5, borderRadius: 3, display: 'flex' }}>
                  <CheckCircleOutlined style={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Active Categories
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {activeCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: cardShadow, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ bgcolor: '#fef3c7', color: '#d97706', p: 1.5, borderRadius: 3, display: 'flex' }}>
                  <TagsOutlined style={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Featured Groups
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {featuredCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: cardShadow, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ bgcolor: '#f3e8ff', color: '#9333ea', p: 1.5, borderRadius: 3, display: 'flex' }}>
                  <ClockCircleOutlined style={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Added This Week
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {recentCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2. Main Area */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* Table Section */}
        <Grid item xs={12} md={showAddForm ? 8 : 12}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: cardShadow }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Categories List
              </Typography>
              {!showAddForm && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setShowAddForm(true)}>
                  Add Category
                </Button>
              )}
            </Stack>

            {/* Filter Bar */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                placeholder="Search category name..."
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
            </Stack>

            {/* Categories Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Category Name</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        ពុំមានទិន្នន័យ Category ឡើយ
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((cat) => (
                      <TableRow key={cat.id} hover>
                        <TableCell>#{cat.id}</TableCell>
                        <TableCell>
                          <Avatar
                            variant="rounded"
                            src={cat.image ? `${SERVER_URL}${cat.image}` : ''}
                            alt={cat.name}
                            sx={{ width: 45, height: 45, bgcolor: '#f1f5f9' }}
                          >
                            <AppstoreOutlined />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {cat.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {cat.created_at || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton size="small" color="primary" onClick={() => handleEdit(cat)}>
                              <EditOutlined />
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
        </Grid>

        {/* 3. Add / Edit Category Form Panel */}
        {showAddForm && (
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: cardShadow,
                position: 'sticky',
                top: 20
              }}
            >
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingId ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មាន Category' : 'បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើត Category ថ្មី'}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  <CloseOutlined />
                </IconButton>
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              <form onSubmit={handleSaveCategory}>
                <Stack spacing={3}>
                  {/* Category Name Input */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Category Name <span style={{ color: '#d32f2f' }}>*</span>
                    </Typography>
                    <TextField
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Soups, Beverages, Desserts"
                      size="medium"
                      fullWidth
                    />
                  </Box>

                  {/* Category Image — Dropzone Upload */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Category Image
                    </Typography>

                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      sx={{
                        position: 'relative',
                        border: '2px dashed',
                        borderColor: isDragging ? 'primary.main' : 'divider',
                        bgcolor: isDragging ? 'primary.lighter' : '#fafafa',
                        borderRadius: 3,
                        p: imagePreview ? 1.5 : 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: '#f5f8ff'
                        }
                      }}
                    >
                      <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />

                      {imagePreview ? (
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                          <Box
                            component="img"
                            src={imagePreview}
                            alt="Preview"
                            sx={{
                              width: '100%',
                              maxWidth: 260,
                              height: 160,
                              borderRadius: 2,
                              objectFit: 'cover',
                              display: 'block',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={handleRemoveImage}
                            sx={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              bgcolor: 'rgba(0,0,0,0.55)',
                              color: '#fff',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }
                            }}
                          >
                            <DeleteOutlined style={{ fontSize: 14 }} />
                          </IconButton>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {selectedFile ? selectedFile.name : 'ចុចដើម្បីប្តូររូបភាព'}
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: '50%',
                              bgcolor: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <CloudUploadOutlined style={{ fontSize: 26 }} />
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            ចុច ឬអូសរូបភាពមកដាក់ត្រង់នេះ
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            JPG, PNG, GIF, WEBP — មិនលើស 2MB
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Box>

                  {/* Submit / Cancel Buttons */}
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Button type="submit" variant="contained" size="large" fullWidth startIcon={<PlusOutlined />}>
                      {editingId ? 'Update Category' : 'Save Category'}
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

export default Categories;
