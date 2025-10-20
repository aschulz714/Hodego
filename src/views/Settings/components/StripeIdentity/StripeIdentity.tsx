import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import siteConfig from '../../../../theme/site.config';
import { postData,getData } from '../../../../theme/Axios/apiService';
import { styled } from '@mui/system';
import LockClockIcon from '@mui/icons-material/LockClock';
import WorkspacePremiumTwoToneIcon from '@mui/icons-material/WorkspacePremiumTwoTone';
import './StripeIdentity.css';

const Iframe = styled('iframe')({
  width: '100%',
  height: '100%',
  border: 'none',
  display: 'block',
  overflowY: 'scroll', 
});

interface StripeIdentityProps {
  stripeStatus: string;
  mentorId: number;
  isVerifiedStatus: number;
  getProfileStrength: () => any;
  handleVerificationStatus: (status: boolean) => void;
}


const StripeIdentity: React.FC<StripeIdentityProps> = ({ stripeStatus, mentorId, isVerifiedStatus, getProfileStrength, handleVerificationStatus }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorStatusInfo, setErrorStatusInfo] = useState('');
  const [error, setError] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const userId = localStorage.getItem('userId');
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (stripeStatus === 'verified') {
      setIsVerified(true);
      handleVerificationStatus(true);
    }
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === 'https://verify.stripe.com') {
        if (event.data === 'verification_complete') {
          setOpen(false);
          checkVerificationStatus();
        } else if (event.data.type === 'STRIPE_IDENTITY_CLOSE') {
          setOpen(false);
          checkVerificationStatus();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [mentorId, handleVerificationStatus]);

  const handleVerify = async() => {
    const response = await postData(
      { userId },
      `${siteConfig.hodegoUrl}create-verification-session`
    );
    console.log('response',response);
    if (response.data.sessionUrl) {
      setIframeUrl(response.data.sessionUrl);
      setOpen(true);
    }
    // if (response.data.sessionId) {
    //   sessionId = response.data.sessionId;
    // }
  };

  const checkVerificationStatus = async() => {
    const response = await getData(`identity/verification_status?mentorId=${mentorId}`);
    if(response){
      if(response.data?.identityStatus == 'verified'){
        setIsVerified(true);
        handleVerificationStatus(true);
        getProfileStrength();
      }
      else{
        if(response.data?.statusInfo){
          console.log('Verification status info', response.data?.statusInfo);
          setErrorStatusInfo(response.data?.statusInfo);
          setError(response.data?.statusInfo);
          setNotificationOpen(true);
        }
      }
    }
  };

  const handleClose = () => {
    checkVerificationStatus();
    setOpen(false);
  };

  return (
    <>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={3000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ margintop: '10%' }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="error" sx={{ width: '100%' }}>
          {errorStatusInfo}
        </Alert>
      </Snackbar>
      {isVerifiedStatus === 0 ? (
        <Box component="div" className="stripeUnVerified" sx={{ zIndex: 1, top: isMobile ? '55vh' : 'calc(50vh - 100px)' }}>
          <LockClockIcon sx={{ fontSize: '50px', color: '#677788' }} />
          <Typography variant="h5" sx={{ paddingBottom: '2%' }}>
            Hodego Expert Application is Pending Approval.
          </Typography>
          <Typography variant="h6">
            You will receive notification via email once you've been approved.
          </Typography>
        </Box>
      ) : (
        ''
      )}

      {/* Desktop View */}
      {!isVerified && (
        <Box
          className={isVerifiedStatus === 0 ? 'verificationDisabled' : ''}
          sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', marginTop: '2%' }}
        >
          <Typography sx={{ fontSize: '18px', marginLeft: '3%', marginBottom: '1rem', fontWeight: 500 }}>
      What Does Verify ID Mean?
          </Typography>
          <Typography sx={{ fontSize: '16px', marginLeft: '3%', lineHeight: 1.6 }}>
      Verifying your ID is an important step to ensure a secure and trusted platform for everyone. This process confirms your identity using Stripe, a global payments provider trusted by millions of businesses worldwide. Stripe handles the verification securely, and no sensitive information is stored on Hodego.
          </Typography>
          <Typography sx={{ fontSize: '16px', marginLeft: '3%', lineHeight: 1.6, marginTop: '1rem' }}>
      By clicking 'Verify,' you'll be redirected to Stripe to complete the identity verification process. Once verified, you'll have full access to the Dashboard to set your availability and pricing.
          </Typography>

        </Box>
      )}
      {/* Mobile View */}
      {!isVerified && (
        <Box
          className={isVerifiedStatus === 0 ? 'verificationDisabled' : ''}
          sx={{ marginLeft: '2%', display: { xs: 'flex', md: 'none' }, flexDirection: 'column', marginTop: '2%' }}
        >
          <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>What Does Verify ID Mean?</Typography>
          <Typography sx={{ fontSize: '14px', lineHeight: 1.5, marginTop: '0.5rem' }}>
          Verifying your ID helps confirm your identity and unlocks the availability and pricing features, so you can start offering
      sessions on Hodego. <br/> <br/>By clicking "Verify," you'll be securely redirected to Stripe, a trusted global payments
      provider, to complete the process.
          </Typography>
        </Box>
      )}

      <Box
        className={isVerifiedStatus === 0 ? 'verificationDisabled' : ''}
        sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        {isVerified ? (
          <Box sx={{ margin: '5%' }}>
            <Typography variant="h6" color="success.main" sx={{ marginTop: '-2%' }}>
              <WorkspacePremiumTwoToneIcon sx={{ verticalAlign: 'middle' }} /> Your identity has been successfully verified! You’re now ready to set up your
      availability and start accepting bookings.
            </Typography>
          </Box>
        ) : (
          <Box sx={{marginTop: '3%', marginLeft: '3%'}}>
            {error && <Typography sx={{marginBottom:'1%'}} color="error">{error}</Typography>}
            <Button
              variant="contained"
              sx={{ width: '10%', background: 'linear-gradient(90deg, #0C6697, #73A870)' }}
              onClick={handleVerify}
            >
      Verify
            </Button>
          </Box>
        )}

        <Dialog fullScreen open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h6">Identity Verification</Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ height: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <Iframe src={iframeUrl} allow="camera" />
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default StripeIdentity;
