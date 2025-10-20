import React, { useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import HodegoFavicon from 'assets/images/hodegoFavicon.png';
import { useNavigate,useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import queryString from 'query-string';

const HodegoLoading: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {loginWithRedirect} = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if(searchParams.has('source') && localStorage.getItem('hodego_access_token') == null){
      sessionStorage.setItem('source',searchParams.get('source'));
      localStorage.setItem('tempUrl',window.location.pathname + window.location.search);
      loginWithRedirect();
    }
    if(searchParams.has('source')){
      removeSpecificQueryParam('source');
    }
  },[]);
  const removeSpecificQueryParam = (paramName) => {
    const currentParams = queryString.parse(location.search);
    delete currentParams[paramName];
    const newSearchString = queryString.stringify(currentParams);
    navigate({ pathname: location.pathname, search: newSearchString });
  };
  return (
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
  );
};

export default HodegoLoading;
