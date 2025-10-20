import React from 'react';
import Box from '@mui/material/Box';
import PageNotFound from '../assets/images/pageNotFound.png';
import { Button } from '@mui/material';

const NotFound = () => {
  return (
    <Box style={{ textAlign: 'center', marginTop: '10%' }}>
      <img src={PageNotFound} alt="404 Not Found" style={{ width: '200px' }} />
      <h2>Oops! Looks like you missed the goal.</h2>
      <p>We can't seem to find the page you're looking for. Just like in sports, sometimes we take a wrong turn, but don’t worry—we’ll guide you back to the right track.</p>
      <Button
        href={'/'}
        variant="contained"
        sx={{
          background: 'linear-gradient(90deg, #0C6697, #73A870)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(90deg, #0C6697, #73A870)',
          },
        }}
      >
      Back to home screen
      </Button>
    </Box>
  );
};

export default NotFound;