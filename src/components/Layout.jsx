import React, { useState, useEffect } from 'react'; // Import useState/useEffect
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// MUI Imports
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper'; // Use Paper for elevation
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BookIcon from '@mui/icons-material/Book';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  // State to track the current navigation value
  const [value, setValue] = useState(location.pathname); // Initialize with current path

  // Update state if the path changes (e.g., browser back/forward)
  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue); // Update state
    navigate(newValue); // Navigate to the new path
  };

  return (
    // Use Box for overall flex container, height 100vh
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      
      {/* Main Content Area - Make this independently scrollable */}
      <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', pb: 7 /* Add padding-bottom for BottomNav height */ }}>
         {/* Container still useful for max-width and centering */}
         <Container sx={{ py: 3 }}> 
           <Outlet />
         </Container>
      </Box>

      {/* Bottom Navigation - Position fixed at the bottom */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 /* Ensure it's above content */ }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value} // Controlled component
          onChange={handleChange}
          // Style applied via theme components.MuiBottomNavigation
        >
          <BottomNavigationAction 
            label="Inköpslista"
            value="/" 
            icon={<ShoppingCartIcon />} 
          />
          <BottomNavigationAction 
            label="Recept"
            value="/recipes" 
            icon={<BookIcon />} 
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default Layout; 