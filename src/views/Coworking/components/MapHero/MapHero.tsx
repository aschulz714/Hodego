import React, { useState } from 'react';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from 'components/Container';
// import worldImage from 'assets/images/map2.png';
// import PublicIcon from '@mui/icons-material/Public';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SecurityIcon from '@mui/icons-material/Security';

const stats = [
  {
    title: 135,
    subtitle: 'Countries supported by Stripe for payments and payouts.',
    suffix: '+',
    // Changed to match hero section colors
  },
  {
    title: 50,
    subtitle: 'Different sports disciplines covered by Hodego experts.',
    suffix: '+',
    icon: <SportsSoccerIcon fontSize="large" sx={{ color: '#73A870' }} />, // Changed to match hero section colors
  },
  {
    title: 100,
    subtitle: 'Percent secure payment processing for all transactions.',
    suffix: '%',
    icon: <SecurityIcon fontSize="large" sx={{ color: '#73A870' }} />, // Changed to match hero section colors
  },
];

const MapHero = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  const LeftSide = () => {
    const [viewPortEntered, setViewPortEntered] = useState(false);

    const setViewPortVisibility = (isVisible) => {
      if (viewPortEntered) {
        return;
      }
      setViewPortEntered(isVisible);
    };

    return (
      <Box data-aos={isMd ? 'fade-right' : 'fade-up'} sx={{ width: '100%', padding: 4, borderRadius: 2 }}>
        <Typography
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: '#0C6697', // Updated to match hero section colors
            fontSize: '2rem',
            // textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
          }}
          gutterBottom
        >
          Global Reach
        </Typography>
        <Box marginBottom={4}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#FFFFFF', // Changed to white for consistency with hero section
              fontSize: '2.75rem',
              textShadow: '2px 2px 3px rgba(0, 0, 0, 0.8)',
            }}
            gutterBottom
          >
            Unlock Your Athletic Potential with Hodego's Expert Consultations
          </Typography>
          <Typography sx={{ color: '#F1F9F7', fontSize: '1.5rem', marginBottom: 2 }}> {/* Black Squeeze */}
          Hodego is a global platform providing direct access to the world’s best athletes for personalized guidance, insight, and in-competition support. Whether you're seeking expert coaching, advice between matches, or remote training, our platform makes it easy to connect and learn from those who’ve competed at the highest levels.
          </Typography>
          <Box
            component="a"
            href="/explore"
            sx={{
              display: 'inline-block',
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none',
              border: '2px solid #000000',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            Find a Hodego
          </Box>
        </Box>
        <Grid container spacing={2} sx={{ marginTop: 4 }}>
          {stats.map((item, i) => (
            <Grid key={i} item xs={12} md={4}>
              <Box
                sx={{
                  padding: 4,
                  border: '1px solid #000000',
                  background: 'rgba(0, 0, 0, 0.6)', // Darker background for consistency with hero section
                  borderRadius: 4,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                  height: '250px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h3" gutterBottom>
                  <Box fontWeight={600} color="#73A870"> {/* Updated to match hero section colors */}
                    <VisibilitySensor onChange={(isVisible) => setViewPortVisibility(isVisible)} delayedCall>
                      <CountUp duration={2} end={viewPortEntered ? item.title : 0} start={0} suffix={item.suffix} />
                    </VisibilitySensor>
                  </Box>
                </Typography>
                <Typography sx={{ color: '#FFFFFF', textAlign: 'center' }} component="p"> {/* Changed to white for readability */}
                  {item.subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        // background: `url(${worldImage}) center center / cover no-repeat`,
        background: 'linear-gradient(135deg, #73A870 0%, #0C6697 100%)',
        position: 'relative',
      }}
    >
      <Container paddingX={0} paddingY={0} maxWidth={{ sm: 1, md: 1236 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} position="relative">
          <Box width={1}>
            <Container>
              <LeftSide />
            </Container>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MapHero;