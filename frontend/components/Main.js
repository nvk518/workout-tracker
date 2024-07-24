import { Box, Typography, Toolbar, AppBar } from '@mui/material';
import React from 'react';
import EditableTable from './EditableTable';

const Main = () => {
  return (
    <Box sx={{ backgroundColor: '#dde6d5', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Gymkhana
                    </Typography>
                </Toolbar>
            </AppBar>
      <Box sx={{minWidth: "80%"}}>
        <EditableTable />
      </Box>
      <Box sx={{ backgroundColor: '#dde6d5', p: 2, mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          &copy; 8/4/2024 Neils. Made with ❤️, a brown sugar shaken espresso and a couple Fairlife shakes.
        </Typography>
      </Box>
    </Box>
  );
};

export default Main;
