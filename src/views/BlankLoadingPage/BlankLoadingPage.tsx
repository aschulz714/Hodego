import React, { useEffect, useState } from 'react';
import Main from 'layouts/Main';
import HodegoFavicon from '../../assets/images/hodegoFavicon.png';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import CircularProgress from '@mui/material/CircularProgress';

const BlankLoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const { getIdTokenClaims } = useAuth0();
  const [isAPILoaded, setIsAPILoaded] = useState(false);

  // Simulate API handling completion from the Topbar or Main component
  useEffect(() => {
    // Simulate API call or any logic that `Main`/`Topbar` needs to handle
    const timeout = setTimeout(() => {
      setIsAPILoaded(true);
    }, 2000); // Replace this with the actual API call logic or event trigger

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleNavigation = async () => {
      if (isAPILoaded) {
        try {
          const tokenClaims = await getIdTokenClaims();
          const loginStatus = localStorage.getItem('hodego_login_status');
          const hodegoStatus = localStorage.getItem('hodegoStatus');
          if (loginStatus === 'new') {
            if (hodegoStatus === 'direct' && tokenClaims && tokenClaims.hodegoLoginsCount && tokenClaims.hodegoLoginsCount == 1) {
              navigate('/hodego-registration-form');
            } else {
              if (tokenClaims && tokenClaims.hodegoLoginsCount && tokenClaims.hodegoLoginsCount == 1) {
                navigate('/join');
              }else{
                if(hodegoStatus === 'direct' && tokenClaims && tokenClaims.hodegoLoginsCount && tokenClaims.hodegoLoginsCount == 1){
                  navigate('/hodego-registration-form');
                }else{
                  navigate('/');
                }
                
              }
            }
          } else {
            if (tokenClaims && tokenClaims.hodegoLoginsCount && tokenClaims.hodegoLoginsCount == 1) {
              navigate('/join');
            }else{
              navigate('/');
            }
          }
        } catch (error) {
          console.error('Error fetching token claims:', error);
        }
      }
    };

    handleNavigation();
  }, [isAPILoaded, navigate]);

  return (
    <Main>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f8f9fa',
        }}
      >
        <CircularProgress
          sx={{
            position: 'absolute',
          }}
          size={50}
        />
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

export default BlankLoadingPage;
