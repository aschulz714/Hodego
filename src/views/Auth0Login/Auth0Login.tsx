// Auth0Login.tsx
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const Auth0Login: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <Dialog
      open={!isAuthenticated}
      aria-labelledby="login-dialog-title"
      aria-describedby="login-dialog-description"
    >
      <DialogTitle id="login-dialog-title">Login Required</DialogTitle>
      <DialogContent>
        <DialogContentText id="login-dialog-description">
          Please log in to continue
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => loginWithRedirect()} color="primary">
          Log In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Auth0Login;
