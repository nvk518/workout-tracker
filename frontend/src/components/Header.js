import React, { useState } from 'react';
import { Typography, useMediaQuery, Box, useTheme, AppBar, Toolbar, IconButton, Tooltip, Button, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuIcon from '@mui/icons-material/Menu';

const Header = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ backgroundColor: '#dde6d5' }}>
                <IconButton
                    size="large"
                    edge="start"
                    color="black"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={() => navigate('/')}
                >
                    <FitnessCenterIcon />
                </IconButton>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color="black" fontSize={36}>
                    <Tooltip title="n. a British-colonial term for sports club" arrow>
                        GymKhanna
                    </Tooltip>
                </Typography>

                
                {
                  isMobile ? (<Box><IconButton
                    size="large"
                    edge="end"
                    color="black"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={handleClick}
                >
                    <MenuIcon />
                </IconButton><Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => { handleClose(); navigate('/'); }}>Home</MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate('/rewards'); }}>Rewards</MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate('/history'); }}>History</MenuItem>
                </Menu></Box>) : (<Box><Button onClick={() => navigate('/')}>Home</Button>
          <Button onClick={() => navigate('/rewards')}>Rewards</Button>
          <Button onClick={() => navigate('/history')}>History</Button></Box>)
                }
                
            </Toolbar>
        </AppBar>
    );
}

export default Header;
