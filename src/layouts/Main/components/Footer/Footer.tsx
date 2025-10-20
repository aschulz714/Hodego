import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import hodegoLogo from 'assets/images/hodegoLogo.png';
// import TextField from '@mui/material/TextField';

const Footer = (): JSX.Element => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const { mode } = theme.palette;

  return (
    <Box bgcolor={theme.palette.background.paper} paddingY={2}>
      {/* <Grid container justifyContent="center" alignItems="center"> */}
      <Grid container justifyContent="space-between" alignItems="flex-start">
        {/* Logo */}
        <Grid item xs={12} sm={4} md={2}>
          <Box
            display={'flex'}
            component="a"
            href="/"
            title="Hodego"
            width={100}
            marginBottom={2}
          >
            <Box
              component={'img'}
              src={mode === 'light' ? hodegoLogo : hodegoLogo}
              alt="Hodego Logo"
              height={1}
              width={1}
            />
          </Box>
        </Grid>

        {/* Sitemap */}
        <Grid item xs={12} sm={8} md={4}>
          <Typography variant={'h6'} gutterBottom>
        Sitemap
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Link
              underline="none"
              component="a"
              href="/"
              color="text.primary"
              variant={'subtitle2'}
            >
          Home
            </Link>
            <Link
              underline="none"
              component="a"
              href="/explore"
              color="text.primary"
              variant={'subtitle2'}
            >
          Explore
            </Link>
            <Link
              underline="none"
              component="a"
              href="/about-us"
              color="text.primary"
              variant={'subtitle2'}
            >
          About Us
            </Link>
            <Box>
          Contact:
              <Link
                underline="always"
                component="a"
                href="mailto:support@hodego.com"
                color="text.primary"
                sx={{
                  marginLeft: 0.5,
                  textDecorationThickness: '2px', 
                  textDecorationColor: theme => theme.palette.primary.main,
                }}
              >
              support@hodego.com
              </Link>
            </Box>
          </Box>
        </Grid>

        {/* Resources */}
        <Grid item xs={12} sm={8} md={4}>
          <Typography variant={'h6'} gutterBottom>
        Resources
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
         
            <Link
              underline="none"
              component="a"
              href="/terms-of-service"
              color="text.primary"
              variant={'subtitle2'}
            >
          Terms of Service
            </Link>
            <Link
              underline="none"
              component="a"
              href="/privacy-policy"
              color="text.primary"
              variant={'subtitle2'}
            >
          Privacy Policy
            </Link>
            <Link
              underline="none"
              component="a"
              href="/cancellation-policy"
              color="text.primary"
              variant={'subtitle2'}
            >
          Cancellation Policy
            </Link>
          </Box>
        </Grid>
      </Grid>
      {/* <Grid item xs={12} sm={12} md={4}>
          <Typography variant={'h6'} gutterBottom>
        Stay in the loop
          </Typography>
          <Box display={'flex'} marginBottom={1}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Your email"
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                marginRight: 1,
              }}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                bgcolor: theme.palette.primary.main,
              }}
            >
          Subscribe
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
        By clicking "Subscribe" you're agreeing to receive emails from Hodego.
          </Typography>
        </Grid> */}
      {/* </Grid> */}
      <Box marginTop={4}>
        <Typography
          align={'center'}
          variant={'subtitle2'}
          color="text.secondary"
          gutterBottom
        >
      &copy; Hodego. {currentYear}, All rights reserved.
        </Typography>
        <Typography
          align={'center'}
          variant={'caption'}
          color="text.secondary"
          component={'p'}
        >
      When you visit or interact with our sites, services or tools, we or our authorised service providers may use cookies for storing information to help provide you with a better, faster and safer experience and for marketing purposes.
        </Typography>
      </Box>
    </Box>

  );
};

export default Footer;
