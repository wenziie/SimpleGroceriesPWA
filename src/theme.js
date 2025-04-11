import { createTheme } from '@mui/material/styles';
import { amber, grey } from '@mui/material/colors'; // Import some colors

// Define a light theme configuration based on Material Design 3 principles
// We are explicitly setting the mode to 'light'.
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      // Let's use a nice green as primary, aligning with your existing accent
      main: '#4CAF50', // Standard Material green
      contrastText: '#ffffff',
    },
    secondary: {
      main: grey[800], // Dark grey for secondary elements
    },
    background: {
      default: grey[100], // Light grey background
      paper: '#ffffff',    // White for paper elements like Cards, Modals
    },
    text: {
      primary: grey[900],
      secondary: grey[700],
    },
    divider: grey[300], // Lighter divider
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    // You can define h1, h2, button, etc. styles here
    h4: {
      fontWeight: 500, // Make modal titles a bit bolder
    }
  },
  shape: {
    borderRadius: 12, // More rounded corners, common in M3
  },
  components: {
    // Consistent elevation for Paper/Card elements
    MuiPaper: {
      styleOverrides: {
        root: {
          // Use a subtle shadow, adjust as needed
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', 
        }
      }
    },
    MuiButton: {
      defaultProps: {
         // disableElevation: true, // Optional: flatter buttons
      },
      styleOverrides: {
         root: {
           borderRadius: '24px', // Pill shape common in M3
           textTransform: 'none' // Keep button text case as is
         },
         // Contained buttons use primary color
         containedPrimary: {
           color: '#ffffff' 
         }
      }
    },
    MuiIconButton: {
       styleOverrides: {
         root: {
           borderRadius: '12px' // Consistent rounding
         }
       }
    },
    MuiAppBar: {
       styleOverrides: {
         root: {
           backgroundColor: 'background.paper', // Use paper color
           color: 'text.primary' // Ensure text color contrasts
         }
       }
    },
    MuiBottomNavigation: {
        styleOverrides: {
            root: {
                backgroundColor: 'background.paper', // Use paper color
            }
        }
    },
    MuiBottomNavigationAction: {
       defaultProps: {
         disableRipple: true, // Disable ripple effect on click/tap
       },
       styleOverrides: {
         root: {
           // Remove default focus outline more aggressively
           outline: 'none !important', 
           '&:focus': {
             outline: 'none !important', 
           },
           '&.Mui-focusVisible': { 
             outline: 'none !important', 
             backgroundColor: 'action.hover' // Optional: subtle background on focus
           },
           // Ensure selected state doesn't add an outline either
           '&.Mui-selected': {
             outline: 'none !important',
           },
           '&.Mui-selected:focus': {
             outline: 'none !important',
           },
           '&.Mui-selected.Mui-focusVisible': { 
             outline: 'none !important', 
             backgroundColor: 'action.hover' // Optional: subtle background on focus
           }
         }
       }
    },
    MuiListItem: {
       styleOverrides: {
         root: {
            // Remove default padding if we wrap in Paper
            // paddingLeft: 0,
            // paddingRight: 0,
         }
       }
    },
    MuiCheckbox: {
        styleOverrides: {
            root: {
                color: 'primary.main', // Use primary color for checkbox
                // Increase size - adjust value as needed
                transform: 'scale(1.2)', 
            }
        }
    }
    // ... add more component customizations as needed
  }
});

export default lightTheme; 