import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Container, Grid, TextField, IconButton, Snackbar, Alert, InputAdornment, Accordion,
  AccordionSummary,
  AccordionDetails, CircularProgress } from '@mui/material';
import { Person, Email, AccountBalance, AccountBalanceWallet, Lock, AccessTime, BarChart } from '@mui/icons-material';
import siteConfig from '../../../../theme/site.config';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import HodegoFavicon from '../../../../assets/images/hodegoFavicon.png';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DeleteIcon from '@mui/icons-material/Delete';
import LockClockIcon from '@mui/icons-material/LockClock';
import stripeIcon from '../../../../assets/svg/stripe.svg';
import { getData, putData, postData } from '../../../../theme/Axios/apiService';

interface MentorCallProps {
  countryCode: string;
  currencyCode: string;
  mentorId: number;
  getProfileStrength: () => any;
  isVerifiedStatus: number;
}

const MentorPayment: React.FC<MentorCallProps> = ({ countryCode, currencyCode, mentorId,getProfileStrength,isVerifiedStatus }) => {
  const location = useLocation();
  const queries = queryString.parse(location.search); 
  const onBoardingAccountId = queries.accountId ? queries.accountId : '';
  const [accountEmail, setAccountEmail] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [stripeAccountStatus, setStripeAccountStatus] = useState(false);
  const [stripeConnectAccountData, setStripeConnectAccountData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [deleteNotificationOpen, setDeleteNotificationOpen] = useState(false); // Added delete notification state
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getData(`${siteConfig.hodegoUrl}get-stripe-account/${mentorId}`);
      if (response && response.data) {
        if (response.data?.status == 'false') {
          setStripeAccountStatus(false);
          setStripeConnectAccountData([]);
        } else {
          getProfileStrength();
          setStripeAccountStatus(true);
          setStripeConnectAccountData([response.data]);
        }
      }
    } catch (error) {
      console.error('Error fetching Stripe account data', error);
    } finally {
      setLoading(false);
    }
  };
  const storeAccountId = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${siteConfig.hodegoUrl}/add-onboarding-account`, {
        method: 'POST',
        body: JSON.stringify({
          mentorId: mentorId,
          accountId: onBoardingAccountId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        fetchData();
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to store account id. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (mentorId > 0) {
      if(countryCode != 'USA'){
        if(onBoardingAccountId){
          storeAccountId();
        }
        else{
          fetchData();
        }
      }
      else{
        fetchData();
      }
      
    }
  }, [mentorId]);

  const handleAccordionToggle = () => {
    setExpanded(!expanded);
  };

  const handleOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      // const response = await fetch(`${siteConfig.hodegoUrl}create-account-link`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     country: countryCode,
      //     hodegoPageUrl: window.location.href,
      //   }),
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });

      // const data = await response.json();
      // if (response.ok) {
      //   window.location.href = data.url; // Redirect to Stripe's hosted onboarding
      // } else {
      //   setError(data.error || 'An error occurred');
      // }
      const response = await postData({
        country: countryCode,
        hodegoPageUrl: window.location.href}, `${siteConfig.hodegoUrl}create-account-link`);
      if (response) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError('Failed to start onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await putData('', `${siteConfig.hodegoUrl}remove-external-account/${mentorId}`);
      if (response && response.data === true) {
        console.log('Bank account deleted');
        getProfileStrength();
        setStripeAccountStatus(false); // Clear account after deletion
        setStripeConnectAccountData([]);
        setDeleteNotificationOpen(true); // Show delete success notification
        const queryParams = queryString.parse(window.location.search); // Parse the query string into an object
        delete queryParams?.accountId; // Replace 'keyToRemove' with the key to remove

        const newQuery = queryString.stringify(queryParams); // Convert the object back to a query string
        const newUrl = `${window.location.pathname}${newQuery ? '?' + newQuery : ''}`;

        window.history.replaceState(null, '', newUrl); // Update the URL
      }
    } catch (error) {
      console.error('Error removing bank account:', error);
    }
  };

  const [errors, setErrors] = useState({
    email: '',
    routingNumber: '',
    accountNumber: '',
    accountHolderName: '',
    form: ''  // Added form error here
  });

  // const [notificationOpen, setNotificationOpen] = useState(false); // Added notification state

  const validateFields = () => {
    let isValid = true;
    const newErrors = { email: '', routingNumber: '', accountNumber: '', accountHolderName: '', form: '' };

    if (!accountEmail || !/\S+@\S+\.\S+/.test(accountEmail)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    if (!routingNumber || routingNumber.length !== 9) {
      newErrors.routingNumber = 'Routing number must be 9 digits';
      isValid = false;
    }
    // if (!ifscCode || ifscCode.length !== 11) {
    //   newErrors.ifscCode = 'IFSC Code must be 11 characters';
    //   isValid = false;
    // }
    if (!accountNumber || accountNumber.length < 6) {
      newErrors.accountNumber = 'Account number must be at least 6 digits';
      isValid = false;
    }
    if (!accountHolderName) {
      newErrors.accountHolderName = 'Please enter the account holder name';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateFields()) {
      return;
    }

    try {
      const response = await fetch(`${siteConfig.hodegoUrl}add-bank-account`, {
        method: 'POST',
        body: JSON.stringify({
          mentorId: mentorId,
          email: accountEmail,
          country: countryCode,
          currency: currencyCode,
          accountHolderName,
          accountNumber,
          routingNumber:routingNumber,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        // getProfileStrength();
        fetchData();
        setAccountHolderName('');
        setAccountEmail('');
        setRoutingNumber('');
        setAccountNumber('');
        setNotificationOpen(true);
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, form: data.error || 'An error occurred' }));
      }
    } catch (err) {
      setErrors((prevErrors) => ({ ...prevErrors, form: 'Failed to start onboarding. Please try again.' }));
    }
  };

  return (
    <>
      <Box>
        {isVerifiedStatus === 0 && (
          <Box component="div" sx={{ zIndex: 1, top: isMobile ? '55vh' : 'calc(50vh - 100px)', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', position: 'absolute' }}>
            <LockClockIcon sx={{ fontSize: '50px', color: '#677788',zIndex:'1111' }} />
            <Typography variant="h5" sx={{ paddingBottom: '2%' }}>
            Hodego Expert Application is Pending Approval.
            </Typography>
            <Typography variant="h6">
            You will receive notification via email once you've been approved.
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 4, textAlign: 'center', filter: isVerifiedStatus === 0 ? 'blur(22px)' : 'none', pointerEvents: isVerifiedStatus === 0 ? 'none' : 'auto' }}>

        {/* <Alert severity="info" sx={{ width: '100%',marginBottom:'2%' }}>
      Enable at Least One Session Length and Set Your Price to Publish Your Profile
      </Alert> */}
        <Typography variant="h6" gutterBottom>
  Connect Your Bank Account <span style={{ fontSize: '12px', color: '#73A870' }}>Powered by <img src={stripeIcon} style={{ width: '36px', verticalAlign: 'middle' }} /></span>
        </Typography>
        <Box sx={{ textAlign: 'left', margin: '20px auto', maxWidth: '600px',marginBottom:'-3%' }}>
          {!stripeAccountStatus ? (
            <>
              <Box
                sx={{
                  textAlign: 'left',
                  margin: '20px auto',
                  maxWidth: '600px',
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{marginBottom:'5%',textAlign:'center'}}>
      Things to Know About Payouts
                </Typography>
                <Box component="ul" sx={{ paddingLeft: '0', margin: '0', listStyleType: 'none' }}>
                  <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <AccountBalanceWallet sx={{ color: '#73A870', marginRight: '12px', fontSize: '28px' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px',color: '#73A870' }}>
            Linking Your Bank Account
                      </Typography>
                      <Typography variant="body2">
            You don’t need to link a bank account to start accepting bookings. However, linking your bank account is
            required to get paid for completed sessions.
                      </Typography>
                    </Box>
                  </Box>
                  <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <Lock sx={{ color: '#73A870', marginRight: '12px', fontSize: '28px' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px',color: '#73A870' }}>
            Data Security
                      </Typography>
                      <Typography variant="body2">
            Your private information is stored securely with Stripe. Hodego only receives a token ID from Stripe to link
            your bank account.
                      </Typography>
                    </Box>
                  </Box>
                  <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <AccessTime sx={{ color: '#73A870', marginRight: '12px', fontSize: '28px' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px',color: '#73A870' }}>
            Payout Schedule
                      </Typography>
                      <Typography variant="body2">
            Payouts are processed every 7 days.
                      </Typography>
                    </Box>
                  </Box>
                  <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <BarChart sx={{ color: '#73A870', marginRight: '12px', fontSize: '28px' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px',color: '#73A870' }}>
            Revenue Split
                      </Typography>
                      <Typography variant="body2">
                      Experts retain 100% of their listed session price. A separate platform fee is added at checkout and paid by the sports enthusiast – there is no cost to the expert.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ color: '#73A870', marginTop: '20px' }}>
      Your bank account is connected successfully! Payouts will now be processed every 7 days.
            </Typography>
          )}
        </Box>
        {errors.form && (
          <Typography variant="body2" color="error" gutterBottom>
            {errors.form}
          </Typography>
        )}
        <Container sx={{ marginTop: '1%' }}>
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
                }} />
            </div>
          ) : stripeAccountStatus && stripeConnectAccountData.length > 0 ? (
            <Accordion expanded={expanded} onChange={handleAccordionToggle} sx={{ border: '1px solid #e0e0e0', borderRadius: '8px',marginTop:'5%' }}>
              <AccordionSummary
                expandIcon={expanded ? <KeyboardArrowDownIcon sx={{ color: '#1976d2' }} /> : <ChevronRightIcon sx={{ color: '#1976d2' }} />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                sx={{
                  backgroundColor: '#f9f9f9',
                  borderBottom: expanded ? '1px solid #e0e0e0' : 'none',
                  padding: '12px 16px',
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-content': {
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                }}
              >
                <Box display="flex" alignItems="center" flexGrow={1}>
                  <Box sx={{ display: 'flex' }}>
                    <Box>
                      <AccountBalanceIcon sx={{ fontSize: '3rem', marginRight: 2, color: '#73A870' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {stripeConnectAccountData[0].bank_name}
                      </Typography>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold', color: '#6b6b6b', display: 'inline-block' }}>{stripeConnectAccountData[0].routing_number}</Typography>
                        <Typography sx={{ fontWeight: 'bold', marginLeft: 2, fontSize: '1rem', color: '#6b6b6b', display: 'inline-block' }}>
                          •••• {stripeConnectAccountData[0].last4}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <IconButton onClick={handleDelete} sx={{ marginRight: 1 }}>
                  <DeleteIcon sx={{ color: '#d32f2f' }} />
                </IconButton>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '16px', backgroundColor: '#fff' }}>
                <Box>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong>Type:</strong> {stripeConnectAccountData[0].object}
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong>Account holder:</strong> {stripeConnectAccountData[0].account_holder_name}
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong>Origin:</strong> {stripeConnectAccountData[0].country}
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong>Fingerprint:</strong> {stripeConnectAccountData[0].fingerprint}
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong>Routing number:</strong> {stripeConnectAccountData[0].routing_number}
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong>ID:</strong> {stripeConnectAccountData[0].id}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ) : countryCode == 'USA' ? (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <TextField
                    label="Account Holder Name"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    error={!!errors.accountHolderName}
                    helperText={errors.accountHolderName}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Account Holder Email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Routing Number"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    error={!!errors.routingNumber}
                    helperText={errors.routingNumber}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalance />
                        </InputAdornment>
                      ),
                    }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceWallet />
                        </InputAdornment>
                      ),
                    }} />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(90deg, #0C6697, #73A870)' }} color="primary">
                    Add Bank Account
                  </Button>
                </Grid>
              </Grid>
            </form>
          ) :
            (
              <Box sx={{ mt: 4 }}>
                {/* <Typography variant="h6" gutterBottom>
                Connect Your Bank Account
                </Typography> */}
                {error && (
                  <Typography variant="body2" color="error" gutterBottom>
                    {error}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: '3%', background: 'linear-gradient(90deg, #0C6697, #73A870)' }}
                  onClick={handleOnboarding}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Add Bank Account'}
                </Button>
              </Box>
            )}

        </Container>

        {/* Snackbar for showing success message */}
        <Snackbar
          open={notificationOpen}
          autoHideDuration={3000}
          onClose={() => setNotificationOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ margintop: '10%' }}
        >
          <Alert onClose={() => setNotificationOpen(false)} severity="success" sx={{ width: '100%' }}>
            Account Connected successfully!
          </Alert>
        </Snackbar>

        {/* Snackbar for showing delete success message */}
        <Snackbar
          open={deleteNotificationOpen}
          autoHideDuration={3000}
          onClose={() => setDeleteNotificationOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ margintop: '10%' }}
        >
          <Alert onClose={() => setDeleteNotificationOpen(false)} severity="success" sx={{ width: '100%' }}>
            Connected Account removed successfully!
          </Alert>
        </Snackbar>
      </Box></>
  );
};

export default MentorPayment;
