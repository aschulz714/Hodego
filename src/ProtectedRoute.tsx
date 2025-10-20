import React, { useState,useEffect  } from 'react';
import Main from 'layouts/Main';
import { useAuth0 } from '@auth0/auth0-react';
import CircularProgress from '@mui/material/CircularProgress';
import HodegoFavicon from '../src/assets/images/hodegoFavicon.png';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
// import { useLocation, Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  component: React.ComponentType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  // const location = useLocation();
  const onHodegoClick = ()=>{
    setOpenModal(false);
    navigate('/join');
  };
  useEffect(() => {
    if (!isAuthenticated) {
      if(!localStorage.getItem('hodego_access_token')){
        if(localStorage.getItem('bookingDetails')){
          setOpenModal(true);
        }else{
          loginWithRedirect();
        }
        
      }
      
    }
  }, [isAuthenticated, loginWithRedirect]);

  return isAuthenticated ? (
    <Component />
  ) : (
    <Main>
      <Dialog
        open={openModal}
        // onClose={() => setOpenModal(false)}
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
      >
        <DialogTitle id="login-dialog-title">Connect with Hodego</DialogTitle>
        <DialogContent>
          {/* <DialogContentText id="login-dialog-description">
              Connect with Hodego
          </DialogContentText> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => loginWithRedirect()} color="primary">
                    Log In
          </Button>
          <Button onClick={() => onHodegoClick()} color="primary">
                    Create Account
          </Button>
        </DialogActions>
      </Dialog>;
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f8f9fa',
        }}
      >
        <CircularProgress sx={{
          position: 'absolute',
        }}
        size={50} />
        <Box
          component="img"
          src={HodegoFavicon}
          alt="Logo"
          sx={{
            width: '18px',
            height: '20px',
          }}
        />
      </div>
    </Main>
    
  );
};

export default ProtectedRoute;
