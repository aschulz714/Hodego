import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Container, Grid, TextField, Snackbar, Alert, InputAdornment, Accordion,
  AccordionSummary,
  AccordionDetails, CircularProgress } from '@mui/material';
import { Person, Email, AccountBalance, AccountBalanceWallet } from '@mui/icons-material';
import siteConfig from '../../../../theme/site.config';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HodegoFavicon from '../../../../assets/images/hodegoFavicon.png';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getData } from '../../../../theme/Axios/apiService';

interface MentorCallProps {
  mentorId: number;
}

const MentorPayment: React.FC<MentorCallProps> = ({ mentorId }) => {
  const [accountEmail, setAccountEmail] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [stripeAccountStatus, setStripeAccountStatus] = useState(false);
  const [stripeConnectAccountData, setStripeConnectAccountData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getData(`${siteConfig.hodegoUrl}get-stripe-account/${mentorId}`);
      if (response && response.data) {
        if (response.data?.status == 'false') {
          setStripeAccountStatus(false);
          setStripeConnectAccountData([]);
        } else {
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

  useEffect(() => {
    if (mentorId > 0) {
      fetchData();
    }
  }, [mentorId]);

  const handleAccordionToggle = () => {
    setExpanded(!expanded);
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

  const handleSubmiting = async (event: React.FormEvent) => {
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
          country: 'US',
          currency: 'usd',
          accountHolderName,
          accountNumber,
          routingNumber,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        fetchData();
        setNotificationOpen(true);
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, form: data.error || 'An error occurred' }));
      }
    } catch (err) {
      setErrors((prevErrors) => ({ ...prevErrors, form: 'Failed to start onboarding. Please try again.' }));
    }
  };

  return (
    <Box sx={{ mt: 4, height: '450px' }}>
      <Typography variant="h6" gutterBottom>
        Connect Your Bank Account
      </Typography>
      {errors.form && (
        <Typography variant="body2" color="error" gutterBottom>
          {errors.form}
        </Typography>
      )}
      <Container sx={{ margin: '0%', marginTop: '3%' }}>
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
        ) : stripeAccountStatus && stripeConnectAccountData.length > 0 ? (
          <Accordion expanded={expanded} onChange={handleAccordionToggle} sx={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
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
        ) : (
          <form onSubmit={handleSubmiting}>
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
                  }}
                />
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
                  }}
                />
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
                  }}
                />
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
                  }}
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(90deg, #0C6697, #73A870)' }} color="primary">
                  Add Bank Account
                </Button>
              </Grid>
            </Grid>
          </form>
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
    </Box>
  );
};

export default MentorPayment;
