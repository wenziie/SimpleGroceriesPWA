import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
// MUI Imports
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Icon for Grocery List (Cart)
import BookIcon from '@mui/icons-material/Book'; // Icon for Recipes (Symmetrical Book)

function Layout() {
  const location = useLocation(); // Hook to get the current path

  const getLinkStyle = (path) => ({
    display: 'flex', // Needed for column layout
    flexDirection: 'column',
    alignItems: 'center',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    // Use active color, or inactive grey color
    color: location.pathname === path ? 'var(--link-active-color)' : 'var(--navbar-inactive-color)',
    textDecoration: 'none',
    // Adjust padding for icon layout
    padding: '5px 10px',
    flexGrow: 1, 
    textAlign: 'center',
    fontSize: '0.8rem' // Smaller base font size for the link container
  });

  const iconStyle = { marginBottom: '2px' }; // Small space between icon and text
  const labelStyle = { fontSize: '0.75rem' }; // Even smaller font size for the label itself

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h1>Simple Groceries</h1>
      </header>
      */}

      <main style={{ flexGrow: 1, padding: '1rem' }}>
        {/* Outlet renders the matched child route component (GroceryPage or RecipesPage) */}
        <Outlet />
      </main>

      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '5px 0',
        // backgroundColor: 'var(--navbar-bg)', // REMOVE THIS
        // Make navbar sticky
        position: 'sticky',
        bottom: 0,
        width: '100%', // Ensure it spans the full width
        borderTop: '1px solid', // Add a top border for separation
        borderColor: 'divider' // Use theme divider color
      }}>
        <Link to="/" style={getLinkStyle('/')}>
          <ShoppingCartIcon />
          <span style={labelStyle}>Inköpslista</span>
        </Link>
        <Link to="/recipes" style={getLinkStyle('/recipes')}>
          <BookIcon />
          <span style={labelStyle}>Recept</span>
        </Link>
      </nav>
    </div>
  );
}

export default Layout; 