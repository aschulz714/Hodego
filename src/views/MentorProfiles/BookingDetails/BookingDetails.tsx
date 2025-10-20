import { Box, Typography, Card, CardContent, TextField, Button, Divider, Snackbar,Tooltip, Alert, IconButton, CircularProgress, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from '@mui/material';
import Main from 'layouts/Main';
import { ExpandMore, AccessTime, Event, LocationOn, VideoCall, Close } from '@mui/icons-material';
import { keyframes } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { getData, putData } from '../../../theme/Axios/apiService';
import siteConfig from '../../../theme/site.config';
import queryString from 'query-string';
import HodegoFavicon from '../../../assets/images/hodegoFavicon.png';
import dayjs from 'dayjs';
import PaymentForm from './PaymentForm';
import StripeProvider from './StripeProvider';
import './BookingDetails.css';
import { useNavigate } from 'react-router-dom';
import { InfoOutlined } from '@mui/icons-material';


const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Box mb={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'black' }}>{question}</Typography>
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMore />
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Typography variant="body2" sx={{ pl: 2, fontSize: '1rem', mt: 1, color: 'black' }}>{answer}</Typography>
      </Collapse>
      <Divider sx={{ my: 2 }} />
    </Box>
  );
};

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const BookingDetailed: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [date, setDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [amount, setAmount] = useState(0);
  const [currencyId, setCurrencyId] = useState('');
  const [stripeIntentStatus, setStripeIntentStatus] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [status, setStatus] = useState('');
  const [agenda, setAgenda] = useState('');
  const [sameDayBooking, setSameDayBooking] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [timerActive, setTimerActive] = useState(true);
  const [userName,setUserName] = useState('');
  const [showTimer, setShowTimer] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [leaveTimeout, setLeaveTimeout] = useState(null);
  const [isFreeTrialConfirmed, setIsFreeTrialConfirmed] = useState(false);
  const [sessionAmount,setSessionAmount] = useState(0);
  const [platformFee,setPlatformFee]=  useState(0);

  // const today = dayjs().startOf('day');
  // const isToday = date && dayjs(date).startOf('day').isSame(today);
  const [showSnackbar, setShowSnackbar] = useState(false);
  let timerExpired = false;
  // let valueStatus = 4;

  const queries = queryString.parse(location.search); 
  const id = queries.id ? Number(queries.id) : 11;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const bookingStatus = queries.bookingStatus ? String(queries.bookingStatus) : '';
  const isTodaySelected = String(queries.isTodaySelected);
  const isFreeTrial = queries.free === 'true';

  const navigate = useNavigate();

  const handleTooltipOpen = () => {
    setTooltipOpen(true);

    // Clear any existing timeout to prevent premature closing
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }
  };

  const handleTooltipClose = () => {
    // Set a delay of 3 seconds before closing the tooltip
    const timeout = setTimeout(() => {
      setTooltipOpen(false);
    }, 5000); // Adjust the delay as needed (3000ms = 3 seconds)

    setLeaveTimeout(timeout);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setTimeout(() => {
      navigate(`/expert/${userName}`); // Redirect user to mentor's profile page
    }, 500); 
  };
  
  // if(localStorage.getItem('userType') == 'mentee'){
  //   valueStatus = 1;
  // }
  useEffect(() => {
    if(localStorage.getItem('bookingDetails')){
      localStorage.removeItem('bookingDetails');
      window.location.replace(window.location.href);
    }
    else{
      if(stripeIntentStatus == false){
        fetchBookingData();
      }
      // Skip payment loading spinner for free session
      if (isFreeTrial) {
        fetchBookingData();
        setLoading(false);
      }
    }
    // localStorage.removeItem('bookingId');
   

    // fetchClientSecret();
  }, []);
  useEffect(() => {
    const alreadyConfirmed = localStorage.getItem(`freeTrialConfirmed-${id}`) === 'true';
    setIsFreeTrialConfirmed(alreadyConfirmed);
  }, [id]);
  
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const timerElement = document.getElementById('sticky-timer');
  //     if (timerElement) {
  //       if (window.scrollY > 150) {
  //         timerElement.style.position = 'fixed';
  //         timerElement.style.top = '10px';
  //         timerElement.style.right = '10px';
  //         timerElement.style.zIndex = '1000';
  //       } else {
  //         timerElement.style.position = 'relative';
  //         timerElement.style.top = 'unset';
  //         timerElement.style.right = 'unset';
  //       }
  //     }
  //   };
  
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);
  // Fetch client secret from your backend API
  const fetchClientSecret = async (currency,status,amount) => {
    if (isFreeTrial) {
      console.log('Skipping payment intent creation for free session.');
      return;
    }
    try {
      const response = await fetch(`${siteConfig.hodegoUrl}create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100,
          currency: (currency).toLowerCase(),
          requestStatus: parseInt(status),
          bookingId:id
        }),
      });
      const data = await response.json();
      setStripeIntentStatus(true);
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error fetching client secret:', error);
    } finally {
      setLoading(false);
    }
  };
  // Add a useEffect to navigate when timeRemaining hits 0
 
  const fetchBookingData = async () => {
    try {
      const response = await getData(`${siteConfig.hodegoUrl}mentor/booking/${id}/summary`);
      const data = response.data;
      if (data) {
        console.log('Fetched data:', data); // Log the full response to debug
        const mentorUserName = data.mentorUserName || 'default-user';
        setUserName(mentorUserName); // Set the username
        const sessionDate = new Date(data.date);
        const today = new Date();
        const timeDiff = sessionDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        const sessionDateFormatted = 'by' +' '+ dayjs(new Date(data.date).toISOString().slice(0, 10)).format('dddd, MMMM D, YYYY');
        const reviewDays = daysDiff;
        setDialogMessage(
          isFreeTrial
            ? 'You have successfully booked a free session. No payment was required. A confirmation has been sent to your email. You can manage your booking from your Account Settings - Bookings.'
            : bookingStatus === '1' && data.zeroDayBook === 0
              ? `Your session request has been submitted and will be reviewed/approved by your Hodego ${reviewDays < 3 ? sessionDateFormatted : 'within 3 days'}. Check Account Settings - Bookings to monitor your pending request. You will receive an email notification when your request has been accepted.`
              :data.zeroDayBook === 1 && isTodaySelected == 'true'
                ? 'Please note, this is a same-day session, and Hodego’s policy for same-day sessions is by Request to Book. This helps to ensure your session does not result in a No Show. Check Account Settings - Bookings to monitor your pending request. You will also receive an email confirmation when the request has been accepted.'
                :bookingStatus === '1' && isTodaySelected == 'false' ?
                  `Your session request has been submitted and will be reviewed/approved by your Hodego  ${reviewDays < 3 ? sessionDateFormatted : 'within 3 days'}. Check Account Settings - Bookings to monitor your pending request. You will receive an email notification when your request has been accepted.`
                  : 'Your session has been confirmed. You will receive an email reminder and can see your upcoming session in Account Settings - Bookings.');
        setSameDayBooking(data.zeroDayBook);
        setDate(data.date);
        setFromTime(data.fromTime);
        setToTime(data.toTime);
        setRequestStatus(data.request);
        if(data.status){
          setStatus(data.status);
        }
        setSessionTime(data.sessionTime);
        setTimeZone(data.timeZone);
        setAmount(data.amount);
        setSessionAmount(data.sessionAmount);
        setPlatformFee(data.platformFee);
        if(data.currencyId){
          setCurrencyId(data.currencyId);
        }
        else{
          setCurrencyId('USD');
        }
        setProfilePictureUrl(data.profilePictureUrl);
        setMentorName(`${data.firstName} ${data.lastName}`);
        console.log('data.request',data.request);
        console.log('data.zeroDayBook',data.zeroDayBook);
        console.log('isTodaySelected',isTodaySelected);
        if (!isFreeTrial) {
          fetchClientSecret(data.currencyId?data.currencyId:'USD',(data.request === 1 || (data.zeroDayBook === 1 && isTodaySelected == 'true')) ? 1 : 0,parseInt(data.amount));
        }
        startTimer();
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    console.log('Updated userName:', userName);
  }, [userName]);
  useEffect(() => {
    // Show tooltip when component mounts
    setTooltipOpen(true);
    
    // Close tooltip after 5 seconds
    const timer = setTimeout(() => {
      setTooltipOpen(false);
    }, 5000); // Adjust time (in milliseconds) as needed

    return () => clearTimeout(timer);
  }, []); // Run only on mount

  const getCurrencySymbol = (rate: number, currency: string) => {
    if (!currency) return rate.toString();
    const currencyCode = currency;
    const locale = 'en-US';
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    });
    const formattedAmount = formatter.format(rate);
    return formattedAmount;
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          timerExpired = true;
          setShowSnackbar(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  useEffect(() => {
    if (timeRemaining === 0 && !openDialog) {
      if (userName) {
        navigate(`/expert/${userName}`);
      } else {
        console.error('No userName available, redirecting to home.');
        navigate('/'); // Fallback
      }
    }
  }, [timeRemaining, userName, navigate,openDialog]);
  
  
  const handleBookNow = async (intentId) => {
    if (timerExpired) return;
    try {
      if(agenda){
        // const statusResponse = await getData(`${siteConfig.hodegoUrl}mentor/booking/${id}/status`);
        // if (statusResponse.data.status) {
        const putDataPayload = {
          
          status: requestStatus == '1' || (requestStatus == '0' && sameDayBooking == 1 && isTodaySelected == 'true') ? 'pending' : 'confirmed',
          date: date,
          fromTime: fromTime,
          toTime: toTime,
          timeZone: timeZone,
          agenda: agenda,
          intentId: isFreeTrial ? '' : intentId,
        };

        const response = await putData(putDataPayload, `${siteConfig.hodegoUrl}mentor/booking/${id}`);
        if (response) {
          if (isFreeTrial) {
            localStorage.setItem(`freeTrialConfirmed-${id}`, 'true');
            setIsFreeTrialConfirmed(true); // Update UI immediately
          }
          handleDialogOpen();
          setShowTimer(false); 
          setTimerActive(false); // Disable timer when booking is made
          clearInterval(timeRemaining); //  Clear timer safely
          
        }
        // }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!date) return null;

  const startTimeFormatted = dayjs(fromTime).format('h:mm A');
  const endTimeFormatted = dayjs(toTime).format('h:mm A');
  
  const sessionDateFormatted = dayjs(new Date(date).toISOString().slice(0, 10)).format('dddd, MMMM D, YYYY');
  return (
    <Main>
      <Snackbar open={showSnackbar} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="info">Your time limit for this slot has expired.</Alert>
      </Snackbar>
      <Box 
        className="bookingConfirmDialog"
        sx={{ 
          maxWidth: 850, 
          mx: 'auto', 
          backgroundColor: 'white', 
          borderRadius: '30px',  
        }}
      >
        <Typography variant="subtitle1" sx={{ margin: '1%', marginTop: '4%', marginRight: '7%', textAlign: '-webkit-center', fontSize: '30px', fontWeight: 700 }} gutterBottom>
          <VideoCall
            sx={{
              fontSize: '35px',
              color: '#DD9D51',
              marginBottom: '-8px',
              marginRight: '10px',
              animation: `${bounceAnimation} 2s infinite`
            }}
          />
          <span style={{ color: '#DD9D51' }}> Meeting </span> with {mentorName}  
          {showTimer && (
            isMobile ? (
              <Typography>
                <Box>
             Time Remaining: ⏳ {timerActive && `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`} 
                  <Tooltip sx={{padding:'4px'}}
                    title="You have 5 minutes to complete your checkout. Your selected session time is reserved during this period. If time runs out, you’ll be redirected to the booking page to select the same slot again (if still available) or choose another time."
                    disableInteractive={isMobile} // Only disable interactivity on mobile
                    enterTouchDelay={0}  
                    arrow
                    open={tooltipOpen} // Control tooltip visibility
                    onMouseEnter={handleTooltipOpen} // Show tooltip when hovering
                    onMouseLeave={handleTooltipClose} // Keep tooltip open for a few seconds after hover
                  >
                    <InfoOutlined sx={{ fontSize: '1.4rem', color: '#555', cursor: 'pointer',marginLeft:'4px',verticalAlign:'sub' }} />
                  </Tooltip>
                </Box>
              </Typography>
        
            ) : (
              <Box 
                id="sticky-timer"
                sx={{
                  position: 'fixed',
                  right: '4%',
                  zIndex: 1000,
                  backgroundColor: 'white',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: timeRemaining <= 30 ? 'red' : 'black',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
Time Remaining: ⏳ {timerActive && `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`} 
                <Tooltip sx={{padding:'4px'}}
                  title="You have 5 minutes to complete your payment. If time runs out, you will be redirected to the booking page, where you can select the same slot again or choose another available slot." 
                  arrow
                  open={tooltipOpen} // Control tooltip visibility
                  onMouseEnter={handleTooltipOpen} // Show tooltip when hovering
                  onMouseLeave={handleTooltipClose} // Keep tooltip open for a few seconds after hover
                >
                  <InfoOutlined sx={{ fontSize: '1.4rem', color: '#555', cursor: 'pointer',marginLeft:'4px' }} />
                </Tooltip>
              </Box>
            )
          )}
        </Typography>
      
        <Card variant="outlined" sx={{ borderRadius: '30px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ display: isMobile?'block':'flex', alignItems: 'center' }}>
            {isMobile ? (
              <Typography variant="h5" gutterBottom sx={{ fontSize: '1.4rem',textAlign:'center' }}>
              Summary - Video Call
              </Typography>
            ):''
            }
            <Box sx={{ width: isMobile?'100%':'40%',textAlign: isMobile?'-webkit-center':'left', mr: 2, marginTop: isMobile?'2%':'0' }}>
              <Avatar
                src={profilePictureUrl} // Replace with the actual path to the mentor's image
                alt="Mentor"
                style={{ width: isMobile?'50%':'100%', height: 'auto', borderRadius: '4px' }}
              />
            </Box>
            <Box sx={{ width: isMobile?'100%':'60%' }}>
              {!isMobile ?
                <Typography variant="h5" gutterBottom sx={{ fontSize: '1.4rem' }}>
 Summary - Video Call
                </Typography>
                : 
                ''
              }
             
              {/* <Box sx={{ clear: 'both' }} />
              <Typography variant="body1" gutterBottom sx={{ fontSize: '1.2rem'}}>
                <strong>Video call</strong>
              </Typography> */}
              <Box display="flex" alignItems="center" sx={{ fontSize: '21px', mb: 1, color: 'black',marginTop: '2%' }}>
                <AccessTime sx={{ mr: 1, fontSize: '25px', color: '#677788' }} />
                <Typography variant="body2" sx={{ fontSize: isMobile?'16px':'19px', color: 'black' }}>
                  {startTimeFormatted} - {endTimeFormatted}, {sessionDateFormatted}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" sx={{ fontSize: '21px', mb: 1, color: 'black' }}>
                <Event sx={{ mr: 1, fontSize: '25px', color: '#677788' }} />
                <Typography variant="body2" sx={{ fontSize: isMobile?'16px':'19px', color: 'black' }}>
                  {parseInt(sessionTime) === 10 ? '10 minutes - Free Session' : `${sessionTime} minutes`}

                </Typography>
              </Box>
              <Box display="flex" alignItems="center" sx={{ fontSize: '21px', mb: 1, color: 'black' }}>
                <LocationOn sx={{ mr: 1, fontSize: '25px', color: '#677788' }} />
                <Typography variant="body2" sx={{ fontSize: isMobile?'16px':'19px', color: 'black' }}>
                  {timeZone}
                </Typography>
              </Box>
              <Divider sx={{ my: 1, marginLeft:'1%' }} />

              <Box sx={{ mt: 2 }}>
                {/* Session Amount Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pl: 1 }}>
                  <Typography sx={{ color: 'black', fontWeight: 400 }}>Session amount</Typography>
                  <Typography sx={{ color: 'black', fontWeight: 700 }}>
                    {getCurrencySymbol(Number(sessionAmount), currencyId)}
                  </Typography>
                </Box>

                {/* Platform Fee Row with Info Icon */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pl: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: 'black', fontWeight: 400, mr: 0.5 }}>Hodego platform fee</Typography>
                    <Tooltip title="15% Hodego Platform Fee-Helps us provide world-class athlete access, real-time scheduling, and secure payments."
                      disableInteractive={isMobile}
                      enterTouchDelay={0}
                      arrow
                    
                    
                    >
                      <InfoOutlined sx={{ fontSize: '1rem', color: '#666' }} />
                    </Tooltip>
                  </Box>
                  <Typography sx={{ color: 'black', fontWeight: 700 }}>
                    {getCurrencySymbol(Number(platformFee), currencyId)}
                  </Typography>
                </Box>

                {/* Total Due Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pl: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: isMobile ? '1.2rem' : '1.4rem', color: 'black', fontWeight: 700 }}>
                  Total due
                  </Typography>
                  <Typography variant="h6" sx={{ fontSize: isMobile ? '1.2rem' : '1.4rem', color: 'black', fontWeight: 700 }}>
                    {getCurrencySymbol(Number(amount), currencyId)}
                  </Typography>
                </Box>
              </Box>


              {/* <Typography variant="h6" sx={{ fontSize: isMobile?'1.2rem':'1.4rem', color: 'black' }}>
                Total due: {getCurrencySymbol(Number(amount), currencyId)}
              </Typography> */}
            </Box>
          </CardContent>
          <Divider />
          <Box sx={{margin: isMobile?'2%':'0', padding: '2%'}}>
            <TextField
              label={`Talking Points for Session with ${mentorName}`}
              placeholder= {'What do you hope to cover during your session?'}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              required
              error={!agenda}
              // helperText={!agenda && 'Talking Points is required'}
            />
          </Box>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <CircularProgress sx={{
                    position: 'absolute',
                  }}
                  size={50} />
                  <Box
                    component="img"
                    src={HodegoFavicon}
                    alt="Logo"
                    sx={{
                      width: '18px',
                      height: '20px',
                    }}
                  />
                </div>
              ) : isFreeTrial ? (
                <Box sx={{ textAlign: 'center',width:'30%' }}>
                  <Button
                    variant="contained"
                    onClick={() => handleBookNow('')}
                    disabled={isFreeTrialConfirmed || !agenda}
                    sx={{
                      width: isMobile ? '100%' : '72%',
                      borderRadius: '9px',
                      padding: '6px 0',
                      background: '#131728',
                      fontSize: '16px',
                      '&:hover': {
                        background: '#131728',
                      },
                    }}
                  >
                    {isFreeTrialConfirmed ? 'Free Session Confirmed' : 'Confirm Free Session'}
                  </Button>
                </Box>
              ) : clientSecret ? (
                <>
                  {/* <Typography variant="h4" sx={{ marginBottom: 4 }}>
          Complete Payment
        </Typography> */}
                  <StripeProvider>
                    <PaymentForm clientSecret={clientSecret} status={status} requestStatus={requestStatus} handleBookNow={handleBookNow} id={id}/>
                  </StripeProvider>
                </>
              ) : (
                <Typography color="error">Failed to load payment information.</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
        <Divider sx={{ mt: 7, mb: 7 }} />
        <Box sx={{ mt: 1, mb: 6 }}>
          <Typography variant="h4" sx={{ mb: 4, color: 'black', fontWeight: 'bold' }} gutterBottom>
            Hodego FAQs
          </Typography>
          {[
            { question: 'Who are Hodego sessions for?', answer: 'Hodego is designed for athletes and sports enthusiasts seeking advice from experienced athletic experts. Whether you need guidance on training strategies, mental preparation, or quick tips before a match, our experts are here to help you achieve your goals.' },
            { question: 'How does a Hodego session differ from general sports coaching?', answer: 'Hodego provides a platform for virtual consultations, allowing you to connect with experienced experts from anywhere in the world. Sessions are flexible and tailored to your specific needs, offering on-demand advice, whether it’s for training, competition, or personal growth.' },
            { question: 'Why can’t I find Hodego in the app store?', answer: 'Hodego is a web app accessible through any browser, such as Safari or Chrome. You can easily add Hodego to your iPhone or Android home screen by logging into your account on Hodego.com, tapping the "Share" icon, and selecting "Add to Home Screen."' },
            { question: 'I just have one or two questions. Is it worth booking a consultation?', answer: 'Absolutely! Hodego offers shorter 15-minute and 30-minute sessions, perfect for addressing specific questions or quick check-ins before a match, during a tournament, or even from the practice court.' },
            { question: 'When do experts typically add more sessions?', answer: 'Experts manage their own schedules, typically adding new sessions weekly or monthly based on their availability. Check back regularly on their profiles for updates.' },
            { question: 'Can I cancel or reschedule my session?', answer: 'Yes, you can cancel or reschedule sessions up to 24 hours before the scheduled time without any fees. However, cancellations made within 24 hours of the scheduled session will result in the session fee being charged to compensate the expert for their time.' },
            { question: 'How do payments work on Hodego?', answer: 'Payments are securely processed through Stripe at the time of booking. While payments are in USD, they are converted to your local currency during the transaction. You can pay using all major credit or debit cards for a smooth and secure checkout experience.' },
            { question: 'What should I do if Im dissatisfied with my consultation or the advice I receive??', answer: 'While Hodego ensures all experts are highly qualified, we understand that experiences can vary. If you are dissatisfied, please provide feedback so we can address your concerns. If an expert cancels or does not show up, you will receive a full refund.' },
            { question: 'How long are the sessions?', answer: 'Experts may offer sessions in various lengths, including 15, 30, 45, and 60 minutes. Users can filter sessions by length to find the option that best suits their needs. Shorter sessions are great for quick check-ins or specific questions, while longer sessions allow for more in-depth guidance.' },
            { question: 'Does Hodego support international athletes?', answer: 'Yes, Hodego is accessible worldwide. We accept all major credit cards, and payments are processed in USD, automatically converting to your local currency. Additionally, we are expanding our roster of experts from various countries and languages to better serve a global audience.' },
            { question: 'What timezone are the virtual consultations based in?', answer: 'All session times are displayed in your local timezone for convenience. For example, if you are in Los Angeles, the times will be shown in Pacific Standard Time (PST). Hodego automatically handles timezone differences to ensure seamless scheduling between you and your expert.' }
          ].map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </Box>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            width: '600px', // Set the width
            height: 'auto', // Set the height or adjust as needed
            borderRadius: '18px', // Set the border radius
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            p: 3,
            borderBottom: '1px solid #ccc',
          }}
        >
          <Typography variant="h5" sx={{ color: 'black', fontWeight: 'bold' }}>
            {bookingStatus === '0' ? (
            // Instant booking text
              <>
           Booking Confirmed!
              </>
            ) : (
            // Request to book text
              <>
           Request Confirmed
              </>
            )}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
          <Typography
            variant="body1"
            sx={{ mb: 3, mt: 3, fontSize: '1.2rem', color: 'black' }}
          > 
            {dialogMessage}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Avatar
            src={profilePictureUrl} // Replace with the actual path to the mentor's image
            alt="Mentor"
            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }} // Increased size
          />
          <Box sx={{ marginBottom:'-7%' }}>
            <Typography variant="h6" sx={{ mb: 1, fontSize: '1.4rem', color: 'black' }}>
              Session with {mentorName}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mb: 3, fontSize: '1.2rem' }}
            >
              <Event
                fontSize="large"
                sx={{ fontSize: '25px', verticalAlign: 'text-bottom', color: '#677788' }}
              />{' '}
              {sessionDateFormatted}
              <AccessTime
                fontSize="large"
                sx={{ ml: 1, fontSize: '25px', verticalAlign: 'text-bottom', color: '#677788' }}
              />{' '}
              {startTimeFormatted} - {endTimeFormatted} {timeZone}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', marginTop:'-1%', p: 3 }}>
          <Button
            href={`${window.location.origin}/account-settings?value=bookings`}
            onClick={handleDialogClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #0C6697, #73A870)',
              },
              fontSize: '1.2rem', padding: '10px 20px', marginBottom:'5%'
            }}
          >
            Manage booking
          </Button>
        </DialogActions>
      </Dialog>
    </Main>
  );
};

export default BookingDetailed;
