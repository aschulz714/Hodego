import React from 'react';
import { Box } from '@mui/material';
import MentorProfiles from '../MentorProfiles';

const MentorProfilesFav = () => {


  return (
    <Box>
      <MentorProfiles showFavoritesOnly />
    </Box>
  );
};

export default MentorProfilesFav;
