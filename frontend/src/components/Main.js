import { Box, Typography, AppBar, Toolbar, IconButton, Tooltip, Snackbar, Alert, Button } from '@mui/material';
import React, { useState } from 'react';
import EditableTable from './EditableTable';
import Header from './Header';

const Main = () => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('test!');
  const [alertSeverity, setAlertSeverity] = useState('success');

  const handleOpenAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Box sx={{ backgroundColor: '#dde6d5'}}>
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <Header/>
      <Box sx={{minWidth: "80%"}}>
        <EditableTable onShowAlert={handleOpenAlert} />
      </Box>
      <Box sx={{ backgroundColor: '#dde6d5', p: 2, mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          &copy; 8/4/2024 Neils. Made with ❤️, a brown sugar shaken espresso, and a couple Premier Protein shakes.
        </Typography>
      </Box>
    </Box>
  );
};

export default Main;
