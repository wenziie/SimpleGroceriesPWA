import { createTheme } from '@mui/material/styles';

// Define a light theme configuration based on Material Design 3 principles
// We are explicitly setting the mode to 'light'.
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    // You can customize the M3 baseline palette here if desired
    // Example: Use default M3 light palette or define your own
    // primary: {
    //   main: '#6750A4', // Example M3 purple
    // },
    // secondary: {
    //   main: '#625B71', // Example M3 neutral
    // },
    // background: {
    //   default: '#FFFBFE', // Example M3 light background
    //   paper: '#FFFBFE',
    // },
    // text: {
    //   primary: '#1C1B1F', // Example M3 dark text
    // }
    // Using MUI's default light palette is often a good starting point
  },
  // You can also customize typography, spacing, component defaults here
  // typography: {
  //   fontFamily: 'Roboto, sans-serif', // Ensure a standard font
  // },
  // components: {
      // Example: Default props for MuiButton
      // MuiButton: {
      //   defaultProps: {
      //     disableElevation: true, // Common M3 style
      //   },
      //   styleOverrides: {
      //      root: {
      //        borderRadius: '20px', // Rounded corners are common in M3
      //      }
      //   }
      // },
  // }
});

export default lightTheme; 