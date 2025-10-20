import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import useScrollTrigger from '@mui/material/useScrollTrigger';

import Container from 'components/Container';
// import TopNav from 'components/TopNav';

import { Topbar, Sidebar, Footer } from './components';

import pages from '../navigation';

interface Props {
  children: React.ReactNode;
  colorInvert?: boolean;
  bgcolor?: string;
}

const Main = ({
  children,
  colorInvert = false,
  bgcolor = 'transparent',
}: Props): JSX.Element => {
  const theme = useTheme();
  const location = useLocation();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  const [openSidebar, setOpenSidebar] = useState(false);

  const handleSidebarOpen = (): void => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = (): void => {
    setOpenSidebar(false);
  };

  const open = isMd ? false : openSidebar;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 38,
  });
  const isAccountSettingsPage = location.pathname === '/account-settings';
  return (
    <Box>
      <Box bgcolor={bgcolor} position={'relative'} zIndex={theme.zIndex.appBar}>
        {/* <Container paddingTop={'8px !important'} paddingBottom={'0 !important'}> */}
        {/* <TopNav colorInvert={colorInvert} /> */}
        {/* </Container> */}
      </Box>
      <AppBar
        position={'sticky'}
        sx={{
          top: 0,
          backgroundColor: trigger ? theme.palette.background.paper : bgcolor,
        }}
        elevation={trigger ? 1 : 0}
      >
        <Container sx={{maxWidth:'100% !important',margin:'0%'}} paddingY={1}>
          <Topbar
            onSidebarOpen={handleSidebarOpen}
            colorInvert={trigger ? false : colorInvert}
          />
        </Container>
      </AppBar>
      <Sidebar
        onClose={handleSidebarClose}
        onOpen={handleSidebarOpen}
        open={open}
        variant="temporary"
        pages={pages}
      />
      <main>
        {children}
        {!isAccountSettingsPage && (
          <Divider />
        )}
      </main>
      {!isAccountSettingsPage && (
        <Container paddingY={4}>
          <Footer />
        </Container>
      )}
    </Box>
  );
};

export default Main;
