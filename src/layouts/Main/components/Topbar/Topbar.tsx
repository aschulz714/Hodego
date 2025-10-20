import React, { useState,useEffect  } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth0 } from '@auth0/auth0-react';
import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Modal, Snackbar, Alert} from '@mui/material';
import { NavItem } from './components';
import hodegoLogo from 'assets/images/hodegoLogo.png';
import Menu from '@mui/material/Menu';
import { useSearchParams } from 'react-router-dom';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import siteConfig from '../../../../theme/site.config';
import { postData,getData } from '../../../../theme/Axios/apiService';
import CloseIcon from '@mui/icons-material/Close';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { List,
  ListItem,
  ListItemText,TextField, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Cancel } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
// import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { jwtDecode } from 'jwt-decode';
import Logout from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from 'axios';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HodegoNotification from './HodegoNotification/HodegoNotification'; 
// import useMediaQuery from '@mui/material/useMediaQuery';
interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSidebarOpen: () => void;
  colorInvert?: boolean;
}

const Topbar = ({
  onSidebarOpen,
  // pages,
  colorInvert = false,
}: Props): JSX.Element => {
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [loginMenuAnchor, setLoginMenuAnchor] = useState<null | HTMLElement>(null); 
  const [userEmail, setUserEmail] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [nickName, setNickName] = useState('');
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [errorMessage, setErrorMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [verifyOpen, setVerifyOpen] = useState({data:false});
  const [loadingStatus, setLoadingStatus] = useState(false);
  // const [notificationCount, setNotificationCount] = useState(3);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
  // const open = Boolean(anchorEl);
  const { user,
    getIdTokenClaims,
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
    logout } = useAuth0();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  console.log('isAuthenticated',isAuthenticated);
  // Validation criteria
  const criteria = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    specialChar: /[!@#$%^&*]/.test(newPassword),
  };
  
  // Check if at least 3 out of the 4 criteria are met
  // const validCriteriaCount = Object.values(criteria).filter(Boolean).length >= 3;
  const validCriteriaCount = Object.values(criteria).filter(Boolean).length == 5;
  const checkTokenExpiry = async () => {
    const token = localStorage.getItem('hodego_access_token');
    if (token) {
      try {
        const decodedToken: { exp: number } = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000); 
        if (decodedToken.exp < currentTime) {
          console.log('Token expired, logging out...');
          localStorage.removeItem('hodego_access_token');
          localStorage.removeItem('hodego_login_status');
          localStorage.removeItem('firstLoad');
          localStorage.removeItem('selectedUserType');
          localStorage.removeItem('hodegoStatus');
          localStorage.removeItem('registrationType');
          localStorage.removeItem('mentorId');
          localStorage.removeItem('userData');
          localStorage.removeItem('userId');
          localStorage.removeItem('userType');
          localStorage.removeItem('provider');
          localStorage.setItem('tempLogout','true');
          await logout({ logoutParams: { returnTo: window.location.origin } });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    else{
      if(localStorage.getItem('tempLogout') == 'true'){
        localStorage.removeItem('tempLogout');
        loginWithRedirect();
      }
    }
  };
  const fetchToken = async (registrationType, status, isMentor, phone) => {
    console.log('registrationType',registrationType);
    setLoadingStatus(true);
    const token = await getAccessTokenSilently();
    if(token){
      localStorage.setItem('hodego_access_token', token);
      if(localStorage.getItem('tempUrl')){
        navigate(localStorage.getItem('tempUrl'));
        localStorage.removeItem('tempUrl');
      }
    }
    const tokenClaims = await getIdTokenClaims();
    localStorage.setItem('provider', tokenClaims.sub.includes('auth0')?'auth0':'social');
    if(!phone){
      //  && !localStorage.getItem('registrationType')
      if(registrationType?.regisStatus == 'true' && tokenClaims && tokenClaims.hodegoLoginsCount == 1 && user.email_verified == true){
        if(localStorage.getItem('hodegoStatus') == 'direct'){
          localStorage.setItem('selectedUserType', registrationType?.type);
          localStorage.setItem('hodego_login_status','new');
          localStorage.setItem('userType', registrationType?.type);
          localStorage.setItem('registrationType', JSON.stringify(registrationType));
          navigate('/hodego-registration-form');
        }
        else{
          localStorage.setItem('hodego_login_status','new');
          navigate('/join');
        }
      }
      else{
        if(user.email_verified == true && registrationType?.regisStatus == 'true' && registrationType?.direct == 'false'){
          localStorage.setItem('hodego_login_status','new');
          navigate('/join');
        }
        else{
          if(localStorage.getItem('hodegoStatus') == 'direct' || registrationType?.direct == true){
            if(window.location.pathname != '/hodego-registration-form' && sessionStorage.getItem('isBackClicked') != 'true'){
              localStorage.setItem('selectedUserType', registrationType?.type);
              localStorage.setItem('hodego_login_status','new');
              localStorage.setItem('userType', registrationType?.type);
              localStorage.setItem('registrationType', JSON.stringify(registrationType));
              navigate('/hodego-registration-form');
            }
          }
          else{
            localStorage.setItem('hodego_login_status','new');
            navigate('/join');
          }
        }
      }
    }
    else{
      if (isMentor == 1) {
        localStorage.setItem('userType', 'mentor');
      } else {
        if (status != 'new') {
          localStorage.setItem('userType', 'mentee');
        }
      }
      const storedToken = localStorage.getItem('hodego_access_token');
      if (storedToken) {
        if (tokenClaims && tokenClaims.hodegoLoginsCount) {
        //&& tokenClaims.hodegoLoginsCount == 1
          if (status == 'new') {
            localStorage.setItem('hodego_login_status','new');
            console.log('New google account');
            // createUser();
            if(localStorage.getItem('hodegoStatus') == 'direct'){
              navigate('/hodego-registration-form');
            }
            else{
              navigate('/join');
            }
            
          }
          else{
            localStorage.removeItem('hodego_login_status');
            localStorage.removeItem('hodegoStatus');
          }
        } else {
          if(tokenClaims && tokenClaims.sub && tokenClaims.sub.includes('auth0')){
          // && tokenClaims.hodegoLoginsCount == 2 
            if (status == 'new') {
              localStorage.setItem('hodego_login_status','new');
              console.log('New Auth0');
              // createUser();
              if(localStorage.getItem('hodegoStatus') == 'direct'){
                navigate('/hodego-registration-form');
              }
              else{
                navigate('/join');
              }
            }
            else{
              localStorage.removeItem('hodego_login_status');
              localStorage.removeItem('hodegoStatus');
            }
          }
        }
        if(localStorage.getItem('bookingDetails') !== null && localStorage.getItem('hodegoStatus') != 'direct'){
          createBooking(localStorage.getItem('userId'));
        }
      }
    }
  };
  useEffect(() =>{
  },[oldPassword,newPassword]);
  useEffect(() => {
  }, [loadingStatus,nickName]);
  // useEffect(() => {
  //   if (error || success) {
  //     setTimeout(() => {
  //       setError('');
  //       setSuccess('');
  //     }, 3000);
  //   }
  // }, [error, success]);
  useEffect(() => {
    checkTokenExpiry();
  
    // const interval = setInterval(() => {
    //   checkTokenExpiry();
    // }, 5 * 60 * 1000); // Check every 5 minutes
  
    // return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  useEffect(() => {
    if (searchParams.has('supportSignUp')) {
      verifyOpen.data = false;
      loginWithRedirect();
    }
  }, [loginWithRedirect, searchParams]);
  const createBooking = async(userId) =>{
    if (localStorage.getItem('bookingDetails') !== null) {
      const formData = JSON.parse(localStorage.getItem('bookingDetails'));
      formData.bookedBy= parseInt(userId);
      const url = `${siteConfig.hodegoUrl}mentor/booking`;
      try {
        const response = await postData(
          formData,
          url
        );
        if (response?.data?.status == true) {
          if (response.data.status == true && response.data.bookingId) {
            setNotificationOpen(false);
            setErrorMessage('');
            localStorage.removeItem('bookingDetails');
            // localStorage.setItem('bookingId',String(response.data.bookingId));
            navigate(`/book-now?id=${response.data.bookingId}&bookingStatus=${formData.isTodaySelected}&isTodaySelected=${formData.isTodaySelected}&free=${formData.free}`);
          }
        } else {
          localStorage.removeItem('bookingDetails');
          setNotificationOpen(true);
          setErrorMessage(response?.data?.message || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        setErrorMessage('Please try again.');
      }
      
    }
  };

  const onHodegoClick = ()=>{
    sessionStorage.setItem('tempHodegoStatus','direct');
    // localStorage.setItem('hodego_login_status','new');
    navigate('/join');
  };
  const handleAccountSettings = () =>{
    setAccountMenuAnchor(null);
    window.location.href = '/account-settings?value=dashboardAnalytics';
    // navigate('/account-settings?value=0');
  };
  const handleBookingSettings = () =>{
    setAccountMenuAnchor(null);
    window.location.href = '/account-settings?value=bookings';
    // navigate(`/account-settings?value=${localStorage.getItem('userType') == 'mentee' ? 1 : 6 }`);
  };
  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };
  
  const handleLoginClick = (event: React.MouseEvent<HTMLElement>) => {
    setLoginMenuAnchor(event.currentTarget);
  };
  
  const handleAccountClose = () => {
    setAccountMenuAnchor(null);
  };
  
  const handleLoginClose = () => {
    setLoginMenuAnchor(null);
  };
  const handleVerifyClose = (event, reason) => {
    if (reason === 'backdropClick') {
      // Prevent closing when clicking outside
      return;
    }
    setVerifyOpen({ data: false }); 
  };
  const validateEmail = (email)=>{
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  const splitName = (name) => {
    const parts = name.split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : firstName;
    return { firstName: firstName, lastName: lastName };
  };
  useEffect(() => {
    if(user) {
      if(user.email){
        setUserEmail(user.email);
      }
      if(user.nickname){
        setNickName(user.nickname);
      }
    }else{
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const tempData = JSON.parse(userDataString);
        if(tempData.email){
          setUserEmail(tempData.email);
        }
        if(tempData.nickname){
          setNickName(tempData.nickname);
        }
      }
      const status = localStorage.getItem('hodegoStatus');
      const hasRedirected = sessionStorage.getItem('hasRedirected'); 
  
      if (status === 'direct' && !hasRedirected) {
        sessionStorage.setItem('hasRedirected', 'true');
        loginWithRedirect();
      }
    }
    if(!localStorage.getItem('userId') && user && !userEmail && user.name){
      let userData = {};
      if(validateEmail(user.name)){
        userData = {
          'firstName': user?.email,
          'lastName': user?.email,
          'email': user?.email,
          'registrationType': JSON.parse(localStorage.getItem('registrationType'))|| {'type':'mentor','regisStatus':false,'direct':false},
        };
        
      }
      else{
        const resultant = splitName(user.name);
        userData = {
          'firstName': resultant.firstName,
          'lastName': resultant.lastName,
          'email': user?.email,
          'registrationType': JSON.parse(localStorage.getItem('registrationType'))|| {'type':'mentor','regisStatus':false,'direct':false},
        };
      }
      
      console.log('userData',userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      try {
        axios.post(`${siteConfig.hodegoUrl}user`,userData)
          .then(response => {
            if(response.data){
              if (response.data.userData[0].id) {
                localStorage.setItem('userId', response.data.userData[0].id);
              }
              fetchToken(response.data.userData[0].registrationType,response.data.status,response.data.userData.length > 0?response.data.userData[0].isMentor:0,response.data.userData.length > 0?response.data.userData[0].phone:'');
            }
          })
          .catch(error => {
            console.log('Error fetching data',error);
          });
      } catch (error) {
        console.error('Error:', error);
      }
      if(user.email_verified == true){
        verifyOpen.data = false;
      }
      else{
        verifyOpen.data = true;
      }
      
    }
    else{
      if(user){
        if(user?.email_verified == true){
          verifyOpen.data = false;
        }
        else{
          verifyOpen.data = true;
        }
      }
    }
  },[]);
  
  // const handleClick = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };
  // const handleClose = () => {
  //   setAnchorEl(null);
  // };
  const theme = useTheme();
  const { mode } = theme.palette;

  const handleOpen = () => setOpenModal(true);
  const handlePasswordClose = () => {
    setOpenModal(false);
    setOldPassword('');
    setNewPassword('');
    setError('');
    setSuccess('');
  };
  const handleResendVerification = async() => {
    const response = await getData(`${siteConfig.hodegoUrl}user/auth/verification_mail`);
    if(response){
      if(response.data == true){
        // verifyOpen.data = false;
        setSnackbarOpen(true);
      }
    }
  };
  const handleForgotPassword = async() => {
    handleOpen();
  };
  const handleOldPasswordChange = (e) => {
    const value = e.target.value;
    setOldPassword(value);
  
    if (value === newPassword) {
      setError('New password must be different from old password.');
    } 
    else if (newPassword && value !== newPassword) { 
      setError('');
    }
  };
  
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
  
    if (value === oldPassword) {
      setError('New password must be different from old password.');
    } 
    else if (oldPassword && value !== oldPassword) { 
      setError('');
    }
  };
  
  const handleSubmit = async() => {
    setError('');

    if (!oldPassword || !newPassword) {
      setError('Both fields are required.');
      return;
    }

    const formData = { oldPassword, newPassword };

    try {
      const response = await postData(
        formData,
        `${siteConfig.hodegoUrl}user/auth/change_password`
      );
      console.log('response',response);
      if (response?.data?.status) {
        setSuccess('');
        setSuccess('Password changed successfully!');
        setTimeout(() => {
          handlePasswordClose();
          localStorage.removeItem('hodego_access_token');
          localStorage.removeItem('hodego_login_status');
          localStorage.removeItem('firstLoad');
          localStorage.removeItem('selectedUserType');
          localStorage.removeItem('hodegoStatus');
          localStorage.removeItem('registrationType');
          localStorage.removeItem('mentorId');
          localStorage.removeItem('userData');
          localStorage.removeItem('userId');
          localStorage.removeItem('userType');
          localStorage.removeItem('provider');
          loginWithRedirect();
        }, 3000);
      } else {
        setError(response?.data?.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to change password. Please try again.');
    }
  };

  const logoutWithRedirect = () =>{
    localStorage.removeItem('hodego_access_token');
    // localStorage.removeItem('myTimeZone');
    localStorage.removeItem('hodego_login_status');
    localStorage.removeItem('firstLoad');
    localStorage.removeItem('selectedUserType');
    localStorage.removeItem('hodegoStatus');
    localStorage.removeItem('registrationType');
    localStorage.removeItem('mentorId');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('provider');
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      }
    });
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
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mb: '4%', ml: '6%' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
        Verification Link sent to your mail
        </Alert>
      </Snackbar>
      
      <Modal open={openModal} onClose={handlePasswordClose} aria-labelledby="change-password-modal">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handlePasswordClose}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Reset Password
          </Typography>

          <TextField
            fullWidth
            type={showOldPassword ? 'text' : 'password'}
            label="Old Password"
            value={oldPassword}
            onChange={handleOldPasswordChange}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            type={showNewPassword ? 'text' : 'password'}
            label="New Password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && <Typography color="error">{error}</Typography>}
          {success && <Typography color="success.main">{success}</Typography>}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)', color:'#fff'}}
            onClick={handleSubmit}
            disabled={!!error}
          >
            Change Password
          </Button>
          {isFocused && !validCriteriaCount && (
            <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, background: '#f9f9f9' }}>
              <Typography variant="subtitle2" gutterBottom>
          Your password must contain:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {criteria.length ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="At least 8 characters" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {criteria.lowercase ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Lowercase letters (a-z)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {criteria.uppercase ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Uppercase letters (A-Z)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {criteria.number ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Numbers (0-9)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {criteria.specialChar ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Special characters (e.g. !@#$%^&*)" />
                </ListItem>
              </List>
              <Typography
                variant="caption"
                color={validCriteriaCount ? 'success.main' : 'error'}
              >
                {validCriteriaCount
                  ? 'Password meets the requirements'
                  : 'Password does not meet the requirements'}
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
      <Dialog 
        open={verifyOpen.data} 
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleVerifyClose(event, reason);
          }
        }} 
        aria-labelledby="verification-dialog-title"
      >
        <DialogTitle id="verification-dialog-title">
    Verification Sent
        </DialogTitle>
        <DialogContent>
          <Typography>
      A verification link has been sent to your email. Please check your inbox and <strong>log in again</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            sx={{ background: 'linear-gradient(90deg, #0C6697, #73A870)', color: '#fff' }} 
            onClick={logoutWithRedirect}
          >
      Ok
          </Button>
          <Button 
            sx={{ background: 'linear-gradient(90deg, #F57C00, #FFA726)', color: '#fff' }} 
            onClick={handleResendVerification}
          >
      Resend Verification
          </Button>
        </DialogActions>
      </Dialog>


      <Box
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width={1}
      >
        <Box sx={{ display: { xs: 'flex', md: 'none' } }} alignItems={'center'}>
          <Button
            onClick={() => onSidebarOpen()}
            aria-label="Menu"
            variant={'outlined'}
            sx={{
              borderRadius: 2,
              minWidth: 'auto',
              padding: 1,
              borderColor: alpha(theme.palette.divider, 0.2),
            }}
          >
            <MenuIcon />
          </Button>
        </Box>
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
              mode === 'light' && !colorInvert
                ?  hodegoLogo
                :  hodegoLogo
            }
            alt="Hodego logo"
            height={1}
            width={1}
          />
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems={'center'}>
          <Box>
            {localStorage.getItem('hodego_login_status') === 'new' ? (
              <Typography 
                sx={{ textDecoration: 'none', color: 'gray', cursor: 'not-allowed',marginRight: 3 }}
              >
                <NavItem title={'Explore'} id={'explore'} colorInvert={colorInvert} />
              </Typography>
            ) : (
              <Link href="/explore" sx={{ textDecoration: 'none' }}>
                <NavItem title={'Explore'} id={'explore'} colorInvert={colorInvert} />
              </Link>
            )}
          </Box>
          {!isAuthenticated && ( 
            <Box marginLeft={4}>
              <Box onClick={() => onHodegoClick()} sx={{textDecoration:'none'}}>
                <NavItem
                  title={'Join Hodego'}
                  id={'joinHodego'}
                  colorInvert={colorInvert}
                />
              </Box>
            </Box>
          )}
        
          {/* {window.localStorage.getItem('userType') == 'mentee'?
            (<Box marginLeft={4}>
              <Link href="/registration-form?status=hodego" color="inherit">
                <NavItem title="Join Hodego" id="become-a-hodego" colorInvert={colorInvert} />
              </Link>
            </Box>)
            :window.localStorage.getItem('userType') == 'mentor'?
              ''
              :(<Box marginLeft={4}>
                <Link onClick={() => loginWithRedirect()} color="inherit">
                  <NavItem title="Join Hodego" id="become-a-hodego" colorInvert={colorInvert} />
                </Link>
              </Box>)
            
          } */}
          
          
          <Box marginLeft={4}>
            {localStorage.getItem('hodego_login_status') === 'new' ? (
              <Typography
                sx={{ textDecoration: 'none', color: 'gray', cursor: 'not-allowed',marginRight: 3 }}
              >
                <NavItem title={'About Us'} id={'account-pages'} colorInvert={colorInvert} />
              </Typography>
            ) : (
              <Link href="/about-us" sx={{ textDecoration: 'none' }}>
                <NavItem title={'About Us'} id={'account-pages'} colorInvert={colorInvert} />
              </Link>
            )}
          </Box>
          {isAuthenticated && !localStorage.getItem('hodego_login_status') &&( 
            <Box marginLeft={4} sx={{marginRight: 3}}>
              <Link href="/expert/fav-profiles">
                <IconButton aria-label="Your Favorites List">
                  <Tooltip title="Your Favorites List" arrow>
                    <FavoriteBorderIcon />
                  </Tooltip>
                </IconButton>
              </Link>
            </Box>
          )} 
          {/* 🔔 Notification Dropdown Component */}
          {isMobile == false && isAuthenticated && !localStorage.getItem('hodego_login_status') && localStorage.getItem('hodego_access_token') &&  (
            <Box sx={{marginRight: 3}}>
              <HodegoNotification />
            </Box>
          )}
          {isAuthenticated && !localStorage.getItem('hodego_login_status') && (
            <Box sx={{marginLeft:'-1%'}}>
              <Tooltip title="Account Settings">
                <IconButton
                  onClick={handleAccountClick}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <PersonOutlineOutlinedIcon color="primary" sx={{ width: 32, height: 32}}/>
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {(isAuthenticated && localStorage.getItem('hodego_login_status') === 'new')  && (
            <Box marginLeft={4}>
              <IconButton
                onClick={handleAccountClick}
                size="small"
                sx={{ ml: 2 }}
                aria-label="Log in to Hodego" //Accessible label
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <PersonOutlineOutlinedIcon color="primary" sx={{ width: 32, height: 32 }} />
              </IconButton>
            </Box>
          )}
        
          {(!isAuthenticated && (
            <Box marginLeft={4}>
              {/* <Tooltip title='Click to log in to Hodego'> */}
              <IconButton
                // onClick={(event) => {
                //   const hodegoStatus = localStorage.getItem('hodego_login_status');
                //   if (hodegoStatus !== 'new') {
                //     loginWithRedirect();
                //   }
                //   else{
                //     handleAccountClick(event);
                //   }
                // } }
                onClick={handleLoginClick}
                size="small"
                sx={{ ml: 2 }}
                aria-label="Log in to Hodego" //Accessible label
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <PersonOutlineOutlinedIcon color="primary" sx={{ width: 32, height: 32 }} />
              </IconButton>
              {/* </Tooltip> */}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }} alignItems={'center'}>
          {isAuthenticated && !localStorage.getItem('hodego_login_status') && ( 
            <Box sx={{display:'inline-block'}}>
              <Link href="/expert/fav-profiles">
                <IconButton aria-label="Your Favorites List">
                  <Tooltip title="Your Favorites List" arrow>
                    <FavoriteBorderIcon />
                  </Tooltip>
                </IconButton>
              </Link>
            </Box>
          )} 
          {/* 🔔 Notification Dropdown Component */}
          {isMobile == true && isAuthenticated &&  !localStorage.getItem('hodego_login_status') && localStorage.getItem('hodego_access_token') && (
            <HodegoNotification />
          )}
          {isAuthenticated && !localStorage.getItem('hodego_login_status') && (
            <Box sx={{display:'inline-block'}}>
              <Tooltip title="Account Settings">
                <IconButton
                  onClick={handleAccountClick}
                  size="small"
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <PersonOutlineOutlinedIcon color="primary" sx={{ width: 32, height: 32}}/>
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Menu
            // anchorEl={anchorEl}
            anchorEl={accountMenuAnchor}
            id="account-menu"
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountClose}
            onClick={handleAccountClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem sx={{
              pointerEvents:'none'
            }}>
              {userEmail ?
                <>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#DD9D51','marginRight':'5px' }}>{nickName? nickName.charAt(0).toUpperCase():''}</Avatar>
                  {userEmail}
                </>
                :
                ''
              }
           
            </MenuItem>
            <Divider />
            {/* {window.localStorage.getItem('userType') != 'mentor'?
              <MenuItem onClick={handleClose} sx={{
                '&:hover': {
                  color: '#73A870',
                },
              }}>
                <ListItemIcon>
                  <PersonAdd fontSize="small" />
                </ListItemIcon>
                <Link href="/registration-form?status=hodego" sx={{textDecoration:'none'}} color="inherit">
              Join Hodego
                </Link>
              </MenuItem>
              :''} */}
            <MenuItem  onClick={handleAccountSettings} sx={{
              display: localStorage.getItem('hodego_login_status') !== 'new' ? 'block' : 'none',
              '&:hover': {
                color: '#73A870',
              },
            }}>
              <ListItemIcon sx={{'verticalAlign':'sub'}}>
                <Settings fontSize="small" />
              </ListItemIcon>
              {/* <Link href="/account-settings" sx={{textDecoration:'none'}} color="inherit"> */}
            Dashboard
              {/* </Link> */}
            </MenuItem>
            <MenuItem onClick={handleBookingSettings} sx={{
              display: localStorage.getItem('hodego_login_status') !== 'new' ? 'block' : 'none',
              '&:hover': {
                color: '#73A870',
              },
            }}>
              <ListItemIcon sx={{'verticalAlign':'sub'}}>
                <ScheduleIcon fontSize="small" />
              </ListItemIcon>
              {/* <Link href={`/account-settings?value=${localStorage.getItem('userType') == 'mentee' ? 1 : 6 }`} sx={{textDecoration:'none'}} color="inherit"> */}
             Bookings
              {/* </Link> */}
            </MenuItem>

            {localStorage.getItem('provider') == 'auth0'?
              <MenuItem onClick={handleForgotPassword} sx={{
                display: localStorage.getItem('hodego_login_status') !== 'new' ? 'block' : 'none',
                '&:hover': {
                  color: '#73A870',
                },
              }}>
                <ListItemIcon sx={{'verticalAlign':'sub'}}>
                  <LockResetIcon fontSize="small" />
                </ListItemIcon>
              Change Password
              </MenuItem>
              :''}
            
            <MenuItem onClick={logoutWithRedirect} sx={{
              '&:hover': {
                color: '#73A870',
              },
            }}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
            Logout
            </MenuItem>
          </Menu>
          {(!isAuthenticated || localStorage.getItem('hodego_login_status') === 'new') && (
            <Box>
              {/* <Tooltip title="Log in to Hodego"> */}
              <IconButton
                // onClick={(event) => {
                //   const hodegoStatus = localStorage.getItem('hodego_login_status');
                //   if (hodegoStatus !== 'new') {
                //     loginWithRedirect();
                //   }
                //   else{
                //     handleClick(event);
                //   }
                // }}
                onClick={handleLoginClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <PersonOutlineOutlinedIcon color="primary" sx={{ width: 32, height: 32}}/>
              </IconButton>
              {/* </Tooltip> */}
            </Box>
          )}
          <Menu
            anchorEl={loginMenuAnchor}
            id="account-menu"
            open={Boolean(loginMenuAnchor)}
            onClose={handleLoginClose}
            onClick={handleLoginClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem  onClick={onHodegoClick} sx={{
              display: localStorage.getItem('hodego_login_status') !== 'new' ? 'block' : 'none',
              '&:hover': {
                color: '#73A870',
              },
            }}>
              <ListItemIcon sx={{'verticalAlign':'sub'}}>
                <PersonAddIcon fontSize="small" />
              </ListItemIcon>
              {/* <Link href="/account-settings" sx={{textDecoration:'none'}} color="inherit"> */}
            Create Account
              {/* </Link> */}
            </MenuItem>
            <MenuItem  onClick={()=>loginWithRedirect()} sx={{
              display: localStorage.getItem('hodego_login_status') !== 'new' ? 'block' : 'none',
              '&:hover': {
                color: '#73A870',
              },
            }}>
              <ListItemIcon sx={{'verticalAlign':'sub'}}>
                <LoginIcon fontSize="small" />
              </ListItemIcon>
              {/* <Link href="/account-settings" sx={{textDecoration:'none'}} color="inherit"> */}
            Login
              {/* </Link> */}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default Topbar;