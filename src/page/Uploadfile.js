import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Input, CircularProgress } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

const API_BASE = 'http://192.168.6.30:3000/r2';


function Uploadfile() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const isFetching = useRef(false)
  const navigate = useNavigate();

  const fetchFiles = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await axios.get(`${API_BASE}/files`);
      setFiles(res.data);
    } catch (err) {
      alert('Error fetching files');
      console.error(err);
    }
    finally {
      isFetching.current = false;
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFile(selectedFiles);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || file.length === 0) {
      return alert('Please select files to upload.');
    }
    setLoading(true);
    const formData = new FormData();
    file.forEach(f => formData.append('file', f));

    try {
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('Upload successful');
      setFiles([]);
      fetchFiles();
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileKey) => {
    if (!window.confirm(`Are you sure you want to delete "${fileKey}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/delete/${fileKey}`);
      setFiles((prevFiles) => prevFiles.filter((file) => file.Key !== fileKey));
      fetchFiles();
    } catch (err) {
      alert('Delete failed');
      console.error(err);
    }
  };


  const handleEdit = (file) => {
    setSelectedFile(file);
    setEditModalVisible(true);
  };

  const handleFileReplace = async (e) => {

    e.preventDefault();

    if (!file || file.length === 0) {
      return alert('Please select a new file to upload.');
    }
    setLoadings(true);
    const formData = new FormData();
    Array.from(file).forEach(f => {
      formData.append('file', f);
    });

    try {
      await axios.post(`${API_BASE}/replace/${selectedFile.Key}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('File replaced successfully');
      setFile([]);
      setEditModalVisible(false);
      fetchFiles();
    } catch (err) {
      alert('Replace failed');
      console.error(err);
    } finally {
      setLoadings(false);
    }
  };

  const columns = [
    { field: 'Key', headerName: 'File Name', flex: 1 },
    {
      field: 'Size',
      headerName: 'Size (MB)',
      flex: 1,
      renderCell: (params) => {
        const sizeInMB = (params.value / (1024 * 1024)).toFixed(2);
        return `${sizeInMB} MB`;
      },
    },
    {
      field: 'LastModified',
      headerName: 'Last Modified',
      flex: 1,
      renderCell: (params) => moment(params.value).format('DD/MM/YY HH:mm:ss')
    },
    {
      field: 'View',
      headerName: 'View',
      flex: 1,
      renderCell: (params) => {
        const fileUrl = `https://pub-93e523ba1abf4142abe39a964ef1769e.r2.dev/${params?.row?.Key}`;

        return (
          <a
            onClick={(event) => {
              event.stopPropagation();
            }}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Video Link
          </a>
        );
      },
    },
    {
      field: 'Actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', marginTop: '5px' }}>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleEdit(params.row)}
            startIcon={<Edit />}
            sx={{ marginRight: 1 }}
          >
            Edit
          </Button>


          {/* <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleDelete(params.row.Key)}
              startIcon={<Delete />}
            >
              Delete
            </Button> */}

        </Box>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('loggedIns');
    navigate('/');
  };

  return (
    <div style={{ padding: '10px', maxWidth: '1200px', margin: 'auto', width: '100%' }}>
      <Button
       variant="outlined"
        onClick={handleLogout}
        startIcon={<LogoutIcon />}
        color="error"
        sx={{ margin: '30px 0 20px auto', width:"fit-content",display:"flex" }}
      >
        Logout
      </Button>
      <h1>Cloudflare R2 File Upload</h1>

      <Box component="form" onSubmit={handleUpload} sx={{ marginBottom: '10px', border: '1px solid #000', borderRadius: '10px', padding: '20px' }}>
        <Input
          type="file"
          inputProps={{ multiple: true, accept: 'video/*' }}
          onChange={handleFileChange}
          sx={{ marginRight: '5px' }}

        />
        <Button
          type="submit"
          variant="contained"
          sx={{ marginLeft: '5px' }}
          disabled={loading}
        >
          Upload
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                color: 'green',
                position: 'absolute',
                right: '50%',
              }}
            />
          )}
        </Button>
      </Box>

      <h2>Files</h2>
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={files}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          getRowId={(row) => row.Key}
        />
      </Box>
      <Dialog open={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <DialogTitle>Upload a New File to Replace "{selectedFile?.Key}"</DialogTitle>
        <DialogContent>
          <TextField
            type="file"
            onChange={handleFileChange}
            fullWidth
            margin="dense"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFileReplace} color="primary">
            Upload New File
            {loadings && (
              <CircularProgress
                size={24}
                sx={{
                  color: 'green',
                  position: 'absolute',
                  right: '50%',
                }}
              />
            )}
          </Button>
          <Button onClick={() => setEditModalVisible(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Uploadfile;