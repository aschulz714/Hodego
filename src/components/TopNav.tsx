import React from 'react';
import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
// import Typography from '@mui/material/Typography';

// import ThemeModeToggler from 'components/ThemeModeToggler';

// interface Props {
//   colorInvert?: boolean;
// }

const TopNav = (): JSX.Element => {
  return (
    <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} marginBottom={'2%'}>
      {/* <Box marginRight={{ xs: 1, sm: 2 }}>
        <Link
          underline="none"
          component="a"
          // href="/demos"
          color={colorInvert ? 'common.white' : 'text.primary'}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
         Welcome to Hodego
          <Box
            padding={0.5}
            display={'inline-flex'}
            borderRadius={1}
            bgcolor={'primary.main'}
            marginLeft={1}
          >
            <Typography
              variant={'caption'}
              sx={{ color: 'common.white', lineHeight: 1 }}
            >
              new
            </Typography>
          </Box>
        </Link>
      </Box> */}
      {/* <Box marginRight={{ xs: 1, sm: 2 }}>
        <Link
          underline="none"
          component="a"
          // href="/blocks"
          color={colorInvert ? 'common.white' : 'text.primary'}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Components
        </Link>
      </Box> */}
      {/* <Box marginRight={{ xs: 1, sm: 2 }}>
        <Link
          underline="none"
          component="a"
          href="https://thefront.maccarianagency.com/docs/introduction"
          target={'blank'}
          color={colorInvert ? 'common.white' : 'text.primary'}
        >
          Logout
        </Link>
      </Box> */}
      <Box>
        {/* <ThemeModeToggler /> */}
      </Box>
    </Box>
  );
};

export default TopNav;
