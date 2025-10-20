import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';
import Page from './components/Page';
import { authService } from './theme/Axios/authService'; // Import the auth service
import { useAuth0 } from '@auth0/auth0-react';
import { Snackbar, Alert } from '@mui/material';
import { notificationService } from './theme/Axios/notificationService'; 
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'aos/dist/aos.css';

const App = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { logout } = useAuth0();

  useEffect(() => {
    authService.setLogout(() => {
      logout({
        logoutParams: {
          returnTo: window.location.origin,
        }
      });
    });
  }, [logout]);
  useEffect(() => {
    const subscription = notificationService.onNotify().subscribe((notification) => {
      console.log('Notification received:', notification);
      setMessage(notification.message);
      setOpen(true);
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <Page>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
      <Snackbar open={open} autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mb: '4%', ml: '6%' }} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="error"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Page>
  );
};

export default App;
