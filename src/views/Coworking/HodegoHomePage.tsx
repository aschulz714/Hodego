
import React, {useState} from 'react';
import Main from 'layouts/Main';
import Container from 'components/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// import Avatar from '@mui/material/Avatar';
import 'react-lazy-load-image-component/src/effects/blur.css'; 
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import { useAuth0 } from '@auth0/auth0-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HodegoHomePage.css';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VideoCallIcon from '@mui/icons-material/VideoCall';
// import { Divider, Grid, CardContent, CardActions, AvatarGroup, Box, Button, Typography } from '@mui/material';


const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const HodegoHomePage = (): JSX.Element => {
  const [loadState, setLoadState] = useState({ image: false, overlay: false });

  const theme = useTheme();
  const {loginWithRedirect,isAuthenticated} = useAuth0();
  const handleSignup = async () => {
    localStorage.setItem('selectedUserType', 'mentor');
    localStorage.setItem('userType', 'mentor');
    localStorage.setItem('registrationType', JSON.stringify({'type':'mentor','regisStatus':false,'direct':true}));
    localStorage.setItem('hodegoStatus', 'direct');
    localStorage.setItem('hodego_login_status','new');
    try {
      await loginWithRedirect({
        appState: { returnTo: '/hodego-registration-form' }, // Redirect path
        authorizationParams: {
          screen_hint: 'signup', // Pass screen_hint here
        },
      });
    } catch (error) {
      console.error('Signup failed', error);
    }
  
  };
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });




  return (
    <Main> 
      <Box sx={{ width: 'auto', height: '100vh', position: 'relative' }}>
      
        <img
          src={isMobile 
            ? 'https://media-dev.hodego.com/Hodego/hero-mobile.webp' 
            : 'https://media-dev.hodego.com/Hodego/hero.webp'}
          width="100%"
          height="auto"
          alt="Hodego Hero"
          {...({ fetchpriority: 'high' } as any)}
          style={{
            objectFit: 'cover',
            height: '100vh',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          onLoad={() => {
            setLoadState({ image: true, overlay: true });
          }}
        />

        {/* Overlay */}
        {loadState.overlay && (
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              top: 0,
              left: 0,
              zIndex: 1,
              transition: 'opacity 0.3s ease-in',
              opacity: loadState.image ? 1 : 0, // Fade in effect
            }}
          />
        )}

        {/* Hero Text */}
        {loadState.image && (
          <Box
            className='hodego-hero-image'
            sx={{
              position: 'absolute',
              top: { xs: '15%', md: '20%' },
              right: '5%',
              transform: 'translateY(-20%)',
              color: 'white',
              zIndex: 2,
              textAlign: 'right',
              width: { xs: '80%', md: '35%' },
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              padding: 2,
              borderRadius: 2,
              opacity: loadState.overlay ? 1 : 0,
              transition: 'opacity 0.5s ease-in',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3.5rem' },
              }}
            >
            Unlock Your Athletic Potential with a Hodego{' '}
              <Typography color="primary" component="span" variant="inherit">
              Expert Consultation
              </Typography>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 2,
                color: 'white',
                fontSize: '1.25rem',
                textAlign: 'right',
                lineHeight: 1.6,
              }}
            >
            Connect 1:1 with world-class athletes and coaches from around the world over a video call.
            </Typography>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} mt={3} justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                href="/explore"
                sx={{
                  background: 'linear-gradient(90deg, #0C6697, #73A870)',
                  color: 'white',
                  paddingX: 5,
                  marginRight: { sm: 2 },
                  marginBottom: { xs: 2, sm: 0 },
                  transition: 'transform 0.2s, background-color 0.2s',
                  boxShadow: '0px 4px 20px rgba(0, 200, 83, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0A4D71, #578B5C)',
                    transform: 'scale(1.05)',
                  },
                }}
                fullWidth={isMd ? false : true}
              >
              Find a Hodego
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    
      <Divider />
      <Box bgcolor={theme.palette.alternate.main}>
        <Container>
          <Box>
            {/* What Is Hodego Section */}
            <Box marginBottom={4}>
              <Typography
                variant="h3"
                align="center"
                sx={{
                  fontWeight: 700,
                  marginBottom: '16px',
                  fontSize: '3.2rem',
                  background: 'linear-gradient(90deg, #73A870, #0C6697)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
          What is a Hodego?
              </Typography>
              <Typography
                variant="h4"
                align="center"
                data-aos="fade-up"
                sx={{
                  fontWeight: 700,
                  marginBottom: '8px',
                  fontSize: '1.8rem',
                }}
              >
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                sx={{ fontStyle: 'italic', fontSize: '1.1rem', color:'#0C6697'}}
              >
         [<u>hoh-DEH-go</u>] Greek, noun: A leader, guide, or instructor of the inexperienced.
              </Typography>
              <Typography
                variant="h5"
                align="center"
                color="text.secondary"
                sx={{
                  marginTop: '16px',
                  marginBottom: '32px',
                  fontSize: '1.4rem',
                }}
              >
          A Hodego is someone with elite expert status in their sport, who empowers others by sharing their hard-earned knowledge and experience. From world-class current and former players to top coaches, unique insights from a wide array of carefully vetted Hodegos across multiple sports is now accessible with the click of a button.
              </Typography>
              <Box textAlign="center" marginBottom={4}>
                <Button
                  variant="contained"
                  component="a"
                  href="/explore"
                  sx={{
                    background: 'linear-gradient(90deg, #0C6697, #73A870)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#578B5C', // Darker green on hover
                    },
                  }}
                >
            Explore Now
                </Button>
              </Box>
            </Box>

            {/* 1:1 Video Calls Section - Use Cases */}
            <Box mb={1} mt={'4%'} textAlign="center">
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: 700,
                  marginBottom: '16px',
                  fontSize: '2.2rem',
                  background: 'linear-gradient(90deg, #73A870, #0C6697)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
          How It Works
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', borderRadius: '16px', textAlign: 'center', padding: '16px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                      <SearchIcon sx={{ fontSize: '3rem', color: '#73A870', marginBottom: '12px' }} />
                      <Typography variant="h6" gutterBottom>
                  Find an Expert
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                  Browse and select from a curated list of top sports professionals ready to share their insights.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', borderRadius: '16px', textAlign: 'center', padding: '16px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                      <CalendarTodayIcon sx={{ fontSize: '3rem', color: '#73A870', marginBottom: '12px' }} />
                      <Typography variant="h6" gutterBottom>
                  Book a Video Call
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                  Pick a time that fits both your and the expert’s schedule, easily managed through our built-in calendar feature.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', borderRadius: '16px', textAlign: 'center', padding: '16px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                      <VideoCallIcon sx={{ fontSize: '3rem', color: '#73A870', marginBottom: '12px' }} />
                      <Typography variant="h6" gutterBottom>
                  Virtual Consultation
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                  Join a personalized video session, ask questions, and receive guidance from a seasoned expert in real-time all within our web app.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>
      <Divider />

      {/* Why Hodego Section */}
      <Container>
        <Box textAlign="center" mt={4}>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
      Why Hodego?
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            {[
              {
                title: 'Stay on Track with Pro-Level Accountability',
                description:
            'Your chances of achieving a goal increase to 95% with regular check-ins. Work with world-class athletes to refine strategy, technique, and mindset—keeping you focused and progressing.',
              },
              {
                title: 'Train Anytime with World-Class Experts',
                description:
            'Break geographical barriers—connect instantly with elite athletes and coaches worldwide.',
              },
              {
                title: 'Screen Share for Expert Video Analysis',
                description:
            'Replay your match or practice footage live with an expert, breaking down every movement for rapid improvement.',
              },
              {
                title: 'Real-Time Coaching While You Train',
                description:
            'Set up your phone or tablet on the court, field, or gym for real-time expert feedback—just like having a coach right there with you.',
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
                    textAlign: 'center',
                    backgroundColor: '#fff',
                  }}
                >
                  <Typography variant="h6" fontWeight={700} mb={1}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Divider />

      <Container>
        <Box>
          <Box
            textAlign="center"
            mt={4}
            sx={{
              display: 'flex', // Use flexbox for layout
              flexDirection: isMobile ? 'column' : 'row', // Stack vertically on mobile
              justifyContent: 'center', // Center horizontally
              alignItems: 'center', // Align items properly
              gap: isMobile ? '10px' : '20px', // Add spacing between buttons
            }}
          >
            <Button
              component="a"
              href="/explore"
              sx={{
                padding: '10px 20px',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                background: 'linear-gradient(90deg, #0C6697, #73A870)',
                minWidth: '200px', // Ensure both buttons are the same size
              }}
            >
    Find a Hodego
            </Button>
            {!isAuthenticated && (
              <Button
                component="a"
                onClick={() => handleSignup()}
                sx={{
                  padding: '10px 20px',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  background: 'linear-gradient(90deg, #0C6697, #73A870)',
                  minWidth: '200px', // Ensure both buttons are the same size
                }}
              >
      Become a Hodego
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Main>
  );
};

export default HodegoHomePage;
