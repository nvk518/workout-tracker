import { Box, Typography } from '@mui/material';
import React from 'react';
import EditableTable from './EditableTable';

const Main = () => {
  return (
    <Box sx={{ backgroundColor: '#dde6d5', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box sx={{fontSize: "36px"}} mb={3} ml={10} textAlign="left">
        Gymkhanna
      </Box>
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
