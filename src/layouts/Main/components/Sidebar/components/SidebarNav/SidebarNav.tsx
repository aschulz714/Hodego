import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
// import { useAuth0 } from '@auth0/auth0-react';
import Link from '@mui/material/Link';
import { useAuth0 } from '@auth0/auth0-react';
import hodegoLogo from 'assets/images/hodegoLogo.png';
import NavItem from './components/NavItem';
import { useNavigate } from 'react-router-dom';

// interface Props {
//   pages: {
//     landings: Array<PageItem>;
//     company: Array<PageItem>;
//     account: Array<PageItem>;
//     secondary: Array<PageItem>;
//     blog: Array<PageItem>;
//     portfolio: Array<PageItem>;
//   };
// }

const SidebarNav = (): JSX.Element => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = theme.palette;
  const {
    isAuthenticated } = useAuth0();
  // const {
  //   landings: landingPages,
  //   secondary: secondaryPages,
  //   company: companyPages,
  //   account: accountPages,
  //   portfolio: portfolioPages,
  //   blog: blogPages,
  // } = pages;
  const onHodegoClick = ()=>{
    sessionStorage.setItem('tempHodegoStatus','direct');
    navigate('/join');
  };

  return (
    <Box>
      <Box width={1} paddingX={2} paddingY={1}>
        <Box
          display={'flex'}
          component="a"
          href="/"
          title="Hodego"
          width={{ xs: 100, md: 120 }}
        >
          <Box
            component={'img'}
            src={
              mode === 'light'
                ?  hodegoLogo
                :  hodegoLogo
            }
            alt="Hodego logo - Home"
            height={1}
            width={1}
          />
        </Box>
      </Box>
      <Box paddingX={2} paddingY={2}>
        <Box>
          {localStorage.getItem('hodego_login_status') === 'new' ? (
            <Typography sx={{textDecoration:'none', color: 'gray', cursor: 'not-allowed'}} color="inherit">
              <NavItem title={'Explore'}  />
            </Typography>
          ) : (
            <Link href="/explore" sx={{textDecoration:'none'}} color="inherit">
              <NavItem title={'Explore'}  />
            </Link>
          )}
        </Box>
        {!isAuthenticated && ( 
          <Box>
            <Box onClick={() => onHodegoClick()} sx={{textDecoration:'none'}} color="inherit">
              <NavItem title={'Join Hodego'}  />
            </Box>
          </Box>
        )}
        {/* <Box>
          {window.localStorage.getItem('userType') == 'mentee'?
            (<Box>
              <Link href="/registration-form?status=hodego" sx={{textDecoration:'none'}} color="inherit">
                <NavItem title="Join Hodego" />
              </Link>
            </Box>)
            :window.localStorage.getItem('userType') == 'mentor'?
              ''
              :(<Box>
                <Link onClick={() => loginWithRedirect()} sx={{textDecoration:'none'}} color="inherit">
                  <NavItem title="Join Hodego" />
                </Link>
              </Box>)
            
          }
        </Box> */}
        <Box>
          {localStorage.getItem('hodego_login_status') === 'new' ? (
            <Typography color="inherit" sx={{ textDecoration: 'none', color: 'gray', cursor: 'not-allowed' }}>
              <NavItem title={'About Us'}  />
            </Typography>
          ) : (
            <Link href="/about-us" sx={{textDecoration:'none'}} color="inherit">
              <NavItem title={'About Us'}  />
            </Link>
          )}
        </Box>
       
        {/* <Box>
          <NavItem title={'Account'} items={accountPages} />
        </Box>
        <Box>
          <NavItem title={'Blog'} items={blogPages} />
        </Box> */}
        {/* <Box>
          <NavItem title={'Portfolio'} items={portfolioPages} />
        </Box> */}
      </Box>
    </Box>
  );
};

export default SidebarNav;