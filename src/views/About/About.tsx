import React from 'react';
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import headerImage from 'assets/images/world.webp';
import Main from 'layouts/Main';
import { useAuth0 } from '@auth0/auth0-react';
import Sam from '../../assets/images/Sam.png';
import Alex from '../../assets/images/Alex.jpg';


// interface Props {}

const About = (): JSX.Element => {
  const navigate = useNavigate();
  const {isAuthenticated} = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile
  const onHodegoClick = ()=>{
    sessionStorage.setItem('tempHodegoStatus','direct');
    navigate('/join');
  };

  return (
    <><>
      <meta name="robots" content="noindex, nofollow" />
    </><Main>
      <Box>
        {/* Header Section */}
        <Box
          sx={{
            width: '100%',
            height: { xs: '300px', sm: '400px' },
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.4)), url(${headerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            color: '#fff',
            textAlign: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          <Typography
            variant="h3"
            component="div"
            sx={{ position: 'relative', zIndex: 1, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)', fontWeight: 'bold' }}
          >
              About Us
          </Typography>
        </Box>

        <Container
          maxWidth="xl"
          sx={{
            overflow: 'hidden',
            borderRadius: 2,
            padding: { xs: 2, sm: 6 },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            mt: -7,
          }}
        >
          {/* Mission Statement Section */}
          <Card sx={{ mb: 4,padding:'14px'  }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#73A870', textAlign: 'center', fontWeight: 'bold',marginTop:isMobile?'7%':'0%' }}>
                About Us
              </Typography>
              <Typography   variant="body1"
                align="center"
                color="text.secondary"
                sx={{
                  marginTop: '2%',
                  fontSize: '1.1rem',
                }}>
              At Hodego, we connect elite sports experts with sports enthusiasts through paid conversations. Our platform creates a marketplace where knowledge and passion meet, providing a new way for experienced athletes, coaches, and trainers to support their careers financially, while offering sports enthusiasts access to exclusive knowledge directly from the source—information that is otherwise difficult to attain. Hodego strives to seamlessly facilitate long-term mentorship, informational interviews, and real-time support during practice or competition; empowering both sports experts and enthusiasts to grow and succeed together.
              </Typography>
            </CardContent>
          </Card>
          {/* Core Values Section */}
          <Container maxWidth="xl" sx={{ padding: '1px',paddingLeft:'0px !important',paddingRight:'0px !important', marginTop:isMobile?'9%':'-3%' }}>
            <Box sx={{marginTop:isMobile?'-3%':'3%'}}>
              <Typography variant="h5" gutterBottom sx={{ color: '#73A870', textAlign: 'center', fontWeight: 'bold' }}>
          Our Core Values
              </Typography>

              {[  
                {
                  title: 'Accessibility',
                  description: 'Making elite sports knowledge available to everyone.',
                  icon: <AccessibilityIcon />,
                  details: 'Providing in-depth sports expertise through a convenient platform accessible to everyone, anywhere.',
                },
                {
                  title: 'Empowerment',
                  description: 'Providing athletes with new income opportunities.',
                  icon: <MonetizationOnIcon />,
                  details: 'Offering a platform where athletes can monetize their experience and knowledge while focusing on their careers.',
                },
                {
                  title: 'Community',
                  description: 'Building a space where sports enthusiasts and athletes learn from each other.',
                  icon: <PeopleIcon />,
                  details: 'Creating an inclusive environment where experts and learners can grow, share, and support each other.',
                },
              ].map(({ title, description, icon, details }) => (
                <Accordion key={title} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ paddingLeft: 2 }}>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                      {icon} <strong style={{ marginLeft: '8px' }}>{title}</strong>
                      {!isMobile && <span style={{ marginLeft: '8px', fontSize: '1.1rem' }}>{description}</span>}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {isMobile && <Typography sx={{ fontWeight: 'bold' }}>{description}</Typography>}
                    <Typography>{details}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Container>
          {/* Leadership Section */}
          <Card
            sx={{
              mb: 4,
              backgroundColor: '#ffffff',
              backgroundImage: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.8), rgba(240, 240, 240, 0.5))',
              boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '16px',
              padding: isMobile ?'10px':'20px',
              marginTop:'-1%',
            }}
          >
            <CardContent sx={{padding:'0px',marginTop:isMobile?'3%':'1%'}}>
              <Typography variant='h5' gutterBottom sx={{ color: '#73A870', textAlign: 'center', fontWeight: 'bold' }}>
                  Our Leadership
              </Typography>
              <Typography variant="body1" align="center"  color="text.secondary" sx={{ fontSize: '1.1rem',marginBottom:isMobile?'4%' :'2%' }}>
                  Our leadership team brings a wealth of experience across various industries, combining athletic, financial, and business expertise to drive Hodego's mission forward.
              </Typography>
              <Grid container spacing={4} justifyContent='center'>
                <Grid item xs={12} md={6} textAlign='center'>
                  <Box sx={{
                    backgroundColor: '#0C6697',
                    padding: '35px',
                    borderRadius: 2,
                    boxShadow: 1,
                    transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
                  }}>
                    <Avatar
                      alt='Sam Iftikhar'
                      src={Sam}
                      sx={{
                        width: { xs: 80, sm: 120 },
                        height: { xs: 80, sm: 120 },
                        mb: 2,
                        mx: 'auto',
                        border: '4px solid #73A870',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      }} />
                    <Typography variant='h6' sx={{ color: '#F1F9F7' }}>Sam Iftikhar</Typography>
                    <Typography variant='body2' sx={{ color: '#F1F9F7' }}>Founder and CEO</Typography>
                    <Typography variant='body2' sx={{ color: '#F1F9F7', mt: 1 }}>
                        Former ATP ranked, Davis Cup player, and Division 1 college player, Sam combines deep athletic knowledge with coaching expertise to lead Hodego.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} textAlign='center'>
                  <Box sx={{
                    backgroundColor: '#0C6697',
                    padding: '35px',
                    borderRadius: 2,
                    boxShadow: 1,
                    transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
                  }}>
                    <Avatar
                      alt='Alex Schulz'
                      src={Alex}
                      sx={{
                        width: { xs: 80, sm: 120 },
                        height: { xs: 80, sm: 120 },
                        mb: 2,
                        mx: 'auto',
                        border: '4px solid #73A870',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      }} />
                    <Typography variant='h6' sx={{ color: '#F1F9F7' }}>Alex Schulz</Typography>
                    <Typography variant='body2' sx={{ color: '#F1F9F7'}}>Co-founder</Typography>
                    <Typography variant='body2' sx={{ color: '#F1F9F7', mt: 1 }}>
                    CPA with expertise in technology, finance, and entertainment, Alex brings strategic and operational leadership to Hodego, helping athletes seamlessly monetize their knowledge.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* Call to Action Section */}
          {!isAuthenticated && ( 
            <Box display='flex' justifyContent='center' mt={4}>
              <Button
                variant='contained'
                sx={{
                  background: 'linear-gradient(90deg, #0C6697, #73A870)',
                  color: '#fff',
                  boxShadow: '0px 5px 15px rgba(0, 102, 151, 0.4)',
                  padding: '12px 24px',
                  '&:hover': {
                    backgroundColor: 'linear-gradient(to right, #073f5e, #5a8f62)',
                    boxShadow: '0px 8px 20px rgba(0, 102, 151, 0.6)',
                  },
                  transition: 'box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out',
                }}
                onClick={() => onHodegoClick()}
              >
                  Ready to elevate your game? Join Hodego today and connect with an athletic expert!
              </Button>
            </Box>
        
          )}
        
          <Typography variant='body2' sx={{ color: '#0C6697', textAlign: 'center', mt: 2 }}>
              Gain exclusive insights from the best in sports.
          </Typography>
        </Container>
      </Box>
    </Main></>
  );
};

export default About;
