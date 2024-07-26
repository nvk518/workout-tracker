import { Box, Typography, AppBar, Toolbar, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import React, { useState } from 'react';
import EditableTable from './EditableTable';


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
      <AppBar position="static">
        <Toolbar sx={{ backgroundColor: '#dde6d5'}}>
          <IconButton
            size="large"
            edge="start"
            color="black"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <FitnessCenterIcon />
          </IconButton>
          
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color={"black"} fontSize={36}>
              <Tooltip fontSize={48} title="n. a British-colonial term for sports club" arrow>
                GymKhanna
              </Tooltip>
            </Typography>
          
        </Toolbar>
      </AppBar>
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
