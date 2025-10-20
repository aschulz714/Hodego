/* eslint-disable no-irregular-whitespace */
import React  from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
// import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Main from 'layouts/Main';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import axios from 'axios';
// import siteConfig from '../theme/site.config';
// import './LandingPage.css';
import StarIcon from '@mui/icons-material/Star';
import SportsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth0 } from '@auth0/auth0-react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import LoginIcon from '@mui/icons-material/Login';
import CheckIcon from '@mui/icons-material/Check';
import Dialog from '@mui/material/Dialog'; // new
import DialogTitle from '@mui/material/DialogTitle'; // new
import DialogContent from '@mui/material/DialogContent'; // new
import DialogActions from '@mui/material/DialogActions'; // new
import Checkbox from '@mui/material/Checkbox'; // new
import FormControlLabel from '@mui/material/FormControlLabel'; // new
import Tooltip from '@mui/material/Tooltip'; // new
import Alert from '@mui/material/Alert'; // new
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // ✅ newly added
import IconButton from '@mui/material/IconButton'; // ✅ NEW
import CloseIcon from '@mui/icons-material/Close'; // ✅ NEW


export default function DevLandingPage() {
  
  const [openDialog, setOpenDialog] = React.useState(false); // new
  const [isAdultChecked, setIsAdultChecked] = React.useState(false); // new
  const [isYouthChecked, setIsYouthChecked] = React.useState(false); // new
  const [errorMessage, setErrorMessage] = React.useState(''); // new
  const navigate = useNavigate();
  const { 
    // user,
    // getIdTokenClaims,
    // isAuthenticated,
    loginWithRedirect,
    // getAccessTokenSilently,
    // logout 
  } = useAuth0();
  const handleSignup = async (type) => {
    localStorage.setItem('selectedUserType', type);
    localStorage.setItem('userType', type);
    localStorage.setItem('registrationType', JSON.stringify({'type':type,'regisStatus':false,'direct':sessionStorage.getItem('tempHodegoStatus')?true:false}));
    if(sessionStorage.getItem('tempHodegoStatus')){
      localStorage.setItem('hodegoStatus', 'direct');
      localStorage.setItem('hodego_login_status','new');
    }
    sessionStorage.removeItem('isBackClicked');
    if(sessionStorage.getItem('tempHodegoStatus') == 'direct'){
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
    }
    else{
      if(localStorage.getItem('userId') == null){
        localStorage.setItem('registrationType', JSON.stringify({'type':type,'regisStatus':false,'direct':true}));
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
      }
      else{
        if(localStorage.getItem('hodego_login_status') == 'new'){
          navigate('/hodego-registration-form');
        }
        else{
          localStorage.setItem('registrationType', JSON.stringify({'type':type,'regisStatus':false,'direct':true}));
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
        }
      }
        

    }
    sessionStorage.removeItem('tempHodegoStatus');
  };
  // const [selected, setSelected] = useState('');
  // const [error, setError] = useState(false);
  // const handleSelect = (option) => {
  //   setSelected(option);
  //   setError(false);
  // };
  //   const navigate = useNavigate();

  //   const handleSignUp = async (userType) => {
  //     localStorage.setItem('userType', userType);
  //     if (userType === 'mentor') {
  //       const formData = {
  //         isMentor: 1,
  //       };
  //       const get_access_token = localStorage.getItem('hodego_access_token');
  //       try {
  //         const response = await axios.put(`${siteConfig.hodegoUrl}user/${localStorage.getItem('userId')}`, formData, {
  //           headers: {
  //             hodego_access_token: get_access_token,
  //           },
  //         });
  //         if (response.data) {
  //           navigate('/registration-form?status=new');
  //         }
  //       } catch (error) {
  //         console.log('Error submitting data', error);
  //       }
  //     } else {
  //       navigate('/registration-form?status=new');
  //     }
  //   };

  return (
    <Main>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // ✅ space out title and icon
            pr: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    Before You Continue
            <Tooltip
              title="Why do we ask your age? — Due to legal requirements, only adults can create accounts. Parents may create accounts on behalf of youth athletes."
              arrow
            >
              <InfoOutlinedIcon sx={{ fontSize: 20, color: '#555', cursor: 'pointer' }} />
            </Tooltip>
          </Box>

          <IconButton
            onClick={() => {
              setOpenDialog(false); // ✅ close
              setIsAdultChecked(false); // ✅ clear
              setIsYouthChecked(false); // ✅ clear
              setErrorMessage(''); // ✅ clear
            }}
            size="small"
            aria-label="close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>



        <DialogContent dividers>
          {/* 🔹 Error message display (only when validation fails) */}
          {errorMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>{errorMessage}</Alert>
          )}

          {/* 🔹 Confirm Age Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isAdultChecked}
                onChange={(e) => {
                  setIsAdultChecked(e.target.checked);
                  // if (e.target.checked) setIsYouthChecked(false); // mutually exclusive
                  setErrorMessage(''); 
                }}
              />
            }
            label={
          
              <span><strong>Confirm Your Age</strong></span>
            }
          />
          {/* 🔹 Explanation text below Confirm Age */}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
      You must be at least 18 years old to create a Hodego account. Please confirm you meet this requirement.
          </Typography>

          {/* 🔹 Youth Athlete Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isYouthChecked}
                onChange={(e) => {
                  setIsYouthChecked(e.target.checked);
                  setErrorMessage(''); 
                }}
              />
            }
            label={
              <span><strong>Creating an Account for a Youth Athlete?</strong></span>
            }
          />
          {/* 🔹 Explanation text below Youth Checkbox */}
          <Typography variant="body2" color="textSecondary">
      If you would like to create an account for a Youth Athlete, please check this box to confirm you are a parent or guardian creating the account on behalf of your Youth Athlete.
          </Typography>
        </DialogContent>

        {/* 🔹 Continue Button with validation and localStorage logic */}
        <DialogActions>
          <Button
            onClick={async () => {
              if (!isAdultChecked && !isYouthChecked) {
                setErrorMessage(
                  'Select whether you are 18+ to create an adult account, or if you want to create a youth account, please confirm that you are 18+ as well.'
                );
                return;
              }

              if (!isAdultChecked && isYouthChecked) {
                setErrorMessage(
                  'You must confirm you are at least 18 years old to create an account for a youth athlete.'
                );
                return;
              }

              setOpenDialog(false);
              setErrorMessage('');

              if (isYouthChecked) {
                localStorage.setItem('ageStatus', 'minor'); // ✅ only for youth
              } else {
                localStorage.removeItem('ageStatus');
              }

              await handleSignup('mentee'); // your existing signup function
            }}
            variant="contained"
            sx={{ backgroundColor: 'linear-gradient(90deg, #0C6697, #73A870)', color: '#fff' }}
          >
  Continue to Registration
          </Button>

        </DialogActions>
      </Dialog>

      {/* Step Guide */}
      <Box sx={{ width: '100%', background: 'linear-gradient(90deg, #0C6697, #73A870)', paddingY: 0.5, marginBottom: 1,marginTop:'2%' }}>
        <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '1%',marginTop:'2%', fontWeight: 700, color: '#F1F9F7' }}>
            Get Started in 3 Simple Steps
        </Typography>
        <Grid container spacing={2} sx={{ marginBottom: '2%' }}>
          <Grid item xs={12} sm={4} textAlign='center'>
            <Box>
              <AccessibilityNewIcon sx={{ fontSize: 50, color: '#F1F9F7' }} aria-label="Step 1 Icon - Choose Your Role" />
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#F1F9F7' }}>Step 1: Choose Your Role</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} textAlign='center'>
            <Box>
              <LoginIcon sx={{ fontSize: 50, color: '#F1F9F7' }} aria-label="Step 2 Icon - Authenticate" />
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#F1F9F7' }}>Step 2: Authenticate</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} textAlign='center'>
            <Box>
              <CheckIcon sx={{ fontSize: 50, color: '#F1F9F7' }} aria-label="Step 3 Icon - Complete Registration" />
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#F1F9F7' }}>Step 3: Complete Registration</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Sign Up Options Section */}
      <Box
        padding={3}
        sx={{
          marginTop: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          width: '95%',
          margin: '0 auto',
          paddingX: { xs: 2, sm: 5, md: 10, lg: 15 },
        }}
      >
        <Grid container spacing={4} alignItems='stretch'>
          {/* For Athlete Experts */}
          <Grid item xs={12} md={6} display='flex'>
            <Card
              elevation={4}
              sx={{
                width: '100%',
                backgroundColor: '#f1f9f7',
                borderRadius: 12,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                padding: 3,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #E0E0E0',
              }}
              aria-label="Benefits for Athlete Experts"
            >
              <CardContent style={{'width':'100%'}}>
                <Box display='flex' justifyContent='center' alignItems='center' marginBottom={2}>
                  <StarIcon sx={{ fontSize: 60, color: '#0C6697' }} aria-label="Star Icon" />
                </Box>
                <CardContent sx={{textAlign:'center','width':'100%'}}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#0C6697' }}>
            Hodego Sports Expert
                  </Typography>
                  <Typography variant="body1" sx={{ marginTop: 1, color: '#0C6697' }}>
            Share your expertise and earn extra income by inspiring others.
                  </Typography>
                </CardContent>
                <Box sx={{ paddingTop: 1, textAlign: 'center', marginBottom: '5%' }}>
                  <Button
                    // href={'/new-registration-form'}
                    variant="contained"
                    // onClick={()=>handleSignup('mentor')}
                    onClick={() => {
                      localStorage.removeItem('ageStatus'); // ✅ Clear any youth age status if switching to Expert
                      handleSignup('mentor');
                    }}
                    sx={{
                      minWidth: '200px', // Ensures all buttons have the same minimum width
                      backgroundColor: '#0F81B3',
                      color: 'white',
                      padding: '8px 16px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
                      transition: 'transform 0.2s',
                      textAlign: 'center', // Centers the text
                      '&:hover': {
                        backgroundColor: '#0C6697',
                        transform: 'scale(1.05)',
                      },
                    }}
                    aria-label="Apply to Become a Hodego"
                  >
                    {sessionStorage.getItem('tempHodegoStatus') == 'direct'?'Apply to Become a Hodego' :'Apply to Become a Hodego'} 
                  </Button>
                </Box>
                {[
                  'Earn Extra Income: Monetize your skills while inspiring others.',
                  'Flexible Scheduling: Work when it fits your schedule.',
                  'Grow Your Personal Brand: Increase visibility by sharing your expertise.',
                ].map((benefit, index) => (
                  <Typography key={index} sx={{ color: '#131728', marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#0C6697', marginRight: 1 }} aria-label="Check Circle Icon" />
                    {benefit}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* For Sports Enthusiasts */}
          <Grid item xs={12} md={6} display='flex'>
            <Card
              elevation={4}
              sx={{
                width: '100%',
                backgroundColor: '#f1f9f7',
                borderRadius: 12,
                boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
                padding: 3,
                // flexGrow: 1,
                display: 'flex',
                // flexDirection: 'column',
                border: '1px solid #E0E0E0',
              }}
              aria-label="Benefits for Sports Enthusiasts"
            >
              <CardContent style={{'width':'100%'}}>
                <Box display='flex' justifyContent='center' alignItems='center' marginBottom={2}>
                  <SportsIcon sx={{ fontSize: 60, color: '#0C6697' }} aria-label="Trophy Icon" />
                </Box>
                <CardContent sx={{textAlign:'center','width':'100%'}}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#0C6697' }}>
            Sports Enthusiast
                  </Typography>
                  <Typography variant="body1" sx={{ marginTop: 1, color: '#0C6697' }}>
            Connect with experts to achieve your sports goals.
                  </Typography>
                </CardContent>
                <Box sx={{ paddingTop: 1, textAlign: 'center', marginBottom: '5%' }}>
                  <Button
                    variant="contained"
                    // href={'/new-registration-form'}
                    onClick={() => {
                      setIsAdultChecked(false); // ✅ clear
                      setIsYouthChecked(false); // ✅ clear
                      setErrorMessage(''); // ✅ clear
                      setOpenDialog(true);
                    }}

                    sx={{
                      minWidth: '200px', // Ensures all buttons have the same minimum width
                      backgroundColor: '#0C6697',
                      color: 'white',
                      padding: '8px 16px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
                      transition: 'transform 0.2s',
                      textAlign: 'center', // Centers the text
                      '&:hover': {
                        backgroundColor: '#0F81B3',
                        transform: 'scale(1.05)',
                      },
                    }}
                    aria-label="Sign Up as a Sports Enthusiast"
                  >
                    {sessionStorage.getItem('tempHodegoStatus') == 'direct'?'Sign Up as a Sports Enthusiast' :'Register as a Sports Enthusiast'} 
                  </Button>
                </Box>
                {[
                  '1:1 Coaching: Personalized advice from top experts.',
                  'Set Your Own Goals: Sessions tailored to your unique objectives.',
                  'Achieve More: Get the support you need to excel in your sport.',
                ].map((benefit, index) => (
                  <Typography key={index} sx={{ color: '#131728', marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#0C6697', marginRight: 1 }} aria-label="Check Circle Icon" />
                    {benefit}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box
        sx={{
          width: '80%',
          backgroundColor: '#ffffff',
          paddingY: 3,
          paddingX: 4,
          margin: '0 auto',
          marginBottom: 4,
          borderRadius: '8px',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            marginBottom: 3,
            fontWeight: 700,
            color: '#0C6697'
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Accordion sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="faq-content-1"
            id="faq-header-1"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>What is Hodego?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              Hodego is a platform that connects sports enthusiasts with athlete experts for one-on-one video sessions. Whether you’re looking for expert advice, personalized training, or inspiration, Hodego helps you reach your goals.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="faq-content-2"
            id="faq-header-2"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Who can become a Sports Expert?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
             Athletes, coaches, and experts with skills and experience at the highest level in their respective sports can become Sports Experts on Hodego. It's an opportunity to share your knowledge and earn additional income.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="faq-content-3"
            id="faq-header-3"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>How do I join as a Sports Expert?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
             To join as a Sports Expert, click "Apply to Become a Hodego" and complete the simple registration process. Once your profile is approved, you can start offering sessions.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="faq-content-4"
            id="faq-header-4"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>What types of sports are available on Hodego?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
            Hodego supports a wide range of sports, from tennis and golf to niche disciplines like archery and snowboarding. Explore the platform to find experts in your area of interest.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="faq-content-5"
            id="faq-header-5"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>How much does a session cost?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              Session prices vary depending on the expert's experience, availability, and the duration of the session. You’ll see the price clearly listed on each expert’s profile.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="faq-content-6"
            id="faq-header-6"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Can I cancel or reschedule a session?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              Yes, you can cancel or reschedule a session based on Hodego's cancellation policies. Details will be provided during the booking process or can be found in our terms of service.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="faq-content-7"
            id="faq-header-7"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>How do Sports Experts get paid?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
           Experts earn 80% of the session fees. Payments are securely processed and deposited directly into their accounts through our trusted payment system.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="faq-content-8"
            id="faq-header-8"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>What tools do I need for a session?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
            All you need is a stable internet connection, a device with a camera (such as a smartphone or computer), and the Hodego web app. You’ll receive a session link when you book.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

    </Main>
  );
}