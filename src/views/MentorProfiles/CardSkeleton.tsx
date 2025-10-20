import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const CardSkeleton: React.FC = () => {
  return (
    <Card sx={{marginBottom:'3%'}}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box ml={2}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={60} height={15} />
          </Box>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Skeleton variant="text" width={140} height={20} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Box mt={2}>
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
        <Box mt={2}>
          <Skeleton variant="rectangular" width={80} height={30} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardSkeleton;
