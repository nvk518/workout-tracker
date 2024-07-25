import { Box, Typography, AppBar, Toolbar, IconButton, Tooltip } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';import React from 'react';
import EditableTable from './EditableTable';


const Main = () => {
  return (
    <Box sx={{ backgroundColor: '#dde6d5'}}>
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
        <EditableTable />
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
