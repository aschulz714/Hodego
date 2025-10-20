import React, { useState,useEffect } from 'react';
import { Container, Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton, Button, Box, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// import Divider from '@mui/material/Divider';
import queryString from 'query-string';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useNavigate, useLocation } from 'react-router-dom';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import googleCalendarIcon from '../../../../assets/images/googleCalendar.png';
import outlookCalendarIcon from '../../../../assets/images/outookCalendar.png';
import { getData, deleteData, putData } from '../../../../theme/Axios/apiService';
import siteConfig from '../../../../theme/site.config';
import { useMediaQuery, useTheme } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';

const SyncCalendar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [syncConfirm, setSyncConfirm] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [syncMail, setSyncMail] = useState('');
  const [googleCalendar, setGoogleCalendar] = useState(0);
  const [msCalendar, setMsCalendar] = useState(0);
  const queries = queryString.parse(location.search);
  const [enabledStatus, setEnabledStatus] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(queries.calendar == 'true' ? true : false);
  const userId = localStorage.getItem('userId');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile

  useEffect(() => {
    fetchUserData();
  }, []);
  useEffect(() => {
  }, [notificationMsg,syncConfirm]);
  
  useEffect(() => {
    const connected = googleCalendar === 1 || msCalendar === 1;
  
    setIsCalendarConnected(connected);
  
    if (connected && queries.calendar === 'true') {
      removeSpecificQueryParam('calendar');
      setSyncConfirm(true);
      if (googleCalendar === 1) {
        setNotificationMsg('Google Calendar connected successfully!');
        setNotificationOpen(true);
      }
      if (msCalendar === 1) {
        setNotificationMsg('Microsoft Calendar connected successfully!');
        setNotificationOpen(true);
      }
    }
  
    if (queries.calendar === 'false') {
      removeSpecificQueryParam('calendar');
      setNotificationMsg('Please try later!');
      setNotificationOpen(true);
    }
    if (queries.scope === 'false') {
      removeSpecificQueryParam('scope');
      setNotificationMsg('Calendar permission is required!');
      setNotificationOpen(true);
    }
    if (queries.email === 'false') {
      removeSpecificQueryParam('scope');
      setNotificationMsg('Only one email can be linked to one account!');
      setNotificationOpen(true);
    }
  }, [googleCalendar, msCalendar]);
  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSyncClose = () => setSyncConfirm(false);

  const fetchUserData = async () => {
    const response = await getData(`${siteConfig.hodegoUrl}user/${userId}`);
    if(response){
      if(response.data){
        if(response.data.length>0){
          if(response.data[0].calendarEmail){
            setSyncMail(response.data[0].calendarEmail);
          }
          if(response.data[0].googleCalendar){
            setGoogleCalendar(response.data[0].googleCalendar);
            setEnabledStatus(true);
          }
          if(response.data[0].msCalendar){
            setMsCalendar(response.data[0].msCalendar);
            setEnabledStatus(true);
          }
        }
      }
    }
  };

  const removeSpecificQueryParam = (paramName) => {
    const currentParams = queryString.parse(location.search);
    delete currentParams[paramName];
    const newSearchString = queryString.stringify(currentParams);
    navigate({ pathname: location.pathname, search: newSearchString });
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      const response = await getData(`${siteConfig.hodegoUrl}auth/google?id=${userId}`);
      if (response && response.data) {
        window.location.href = response.data;
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };
  const handleConnectMicrosoftCalendar = async () => {
    try {
      const response = await getData(`${siteConfig.hodegoUrl}auth/microsoft?id=${userId}`);
      if (response && response.data) {
        window.location.href = response.data;
      }
    } catch (error) {
      console.error('Error connecting to Microsoft Calendar:', error);
    }
  };
  const handleDisconnectCalendar = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }
    
      const response = await deleteData(`${siteConfig.hodegoUrl}auth/google/unlink?id=${userId}`);
      if (response && response?.data == true) {
        setIsCalendarConnected(false);
        setNotificationMsg('Google Calendar disconnected successfully!');
        removeSpecificQueryParam('calendar');
        setEnabledStatus(false);
        setSyncMail('');
        setGoogleCalendar(0);
        setMsCalendar(0);
        setNotificationOpen(true);
      }
      // Update UI after successful unlink
      // setConnectedCalendar(null);
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
    }
  };
  const handleSyncCalendar = async () => {
    handleSyncClose();
    let provider = 'outlook';
    if (googleCalendar === 1) {
      provider = 'google';
    }
    showNotification('Syncing with your calendar...');
    try {
      const response = await putData({}, `${siteConfig.hodegoUrl}calendar/events?provider=${provider}`);
      if (response && response?.data === true) {
        showNotification('Your bookings are being synced!');
      } else {
        showNotification('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to sync calendar. Please try again later.');
    }
  };
  const showNotification = (msg: string) => {
    setNotificationOpen(false);
    setTimeout(() => {
      setNotificationMsg(msg);
      setNotificationOpen(true);
    }, 100); // small delay ensures snackbar resets
  };
  const handleDisconnectMicrosoftCalendar = async () => {
    try {
      const response = await deleteData(`${siteConfig.hodegoUrl}auth/microsoft/unlink?id=${userId}`);
      if (response && response.data === true) {
        setIsCalendarConnected(false);
        setNotificationMsg('Microsoft Calendar disconnected successfully!');
        removeSpecificQueryParam('calendar');
        setEnabledStatus(false);
        setSyncMail('');
        setGoogleCalendar(0);
        setMsCalendar(0);
        setNotificationOpen(true);
      }
    } catch (error) {
      console.error('Error disconnecting Microsoft Calendar:', error);
    }
  };
  return (
    <>
      {/* Connect Your Calendar Button */}
      <Container sx={{ margin: '0%', marginTop: '2%', padding:'0px' }}>
        <Dialog
          open={syncConfirm}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              handleSyncClose();
            }
          }}
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          PaperProps={{
            sx: {
              borderRadius: 2,
              padding: 2,
              backgroundColor: '#ffffff',
              boxShadow: 'none',
            },
          }}
        >
          <DialogTitle id="dialog-title">Calendar Sync Confirmation</DialogTitle>
          <DialogContent>
            <Typography sx={{ paddingBottom: '2%' }}>
            Do you want to sync with your previous bookings?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSyncCalendar} variant="contained" sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}>
                    Yes
            </Button>
            <Button onClick={handleSyncClose} variant="contained" sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}>
                    No
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={notificationOpen}
          autoHideDuration={3000}
          onClose={() => setNotificationOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ margintop: '10%' }}
        >
          <Alert onClose={() => setNotificationOpen(false)} severity={queries.calendar == 'false'?'error':'success'} sx={{ width: '100%' }}>
            {notificationMsg}
          </Alert>
        </Snackbar>
        <Typography variant="h5" sx={{paddingBottom:'2%'}}>
        Sync Your Hodego Bookings with Your Calendar <Tooltip title="Only one calendar can be synced at a time." placement='top'  enterTouchDelay={0} 
            leaveTouchDelay={3000}>
            <InfoIcon sx={{ marginLeft: '0%', cursor: 'pointer',verticalAlign:'text-bottom' }} />
          </Tooltip>
        </Typography>
        {isCalendarConnected == false && enabledStatus == false && (
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              color: '#fff',
              fontWeight: 'bold',
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              marginTop:isMobile?'4%':'1%',
            }}
            onClick={handleOpen}
          >
            <CalendarTodayIcon />
          Connect Your Calendar
          </Button>)}
        {isCalendarConnected && enabledStatus == true &&(
          <><Box sx={{marginTop:'-1%', color:'#686464'}}>
            <Typography sx={{fontSize:'18px'}}>Your calendar is connected. New bookings will automatically sync. View upcoming sessions anytime in your Bookings tab.</Typography>
          </Box>
          <Box display="flex" sx={{marginTop:'1%',marginLeft:'-1%'}}>
            <List
              sx={{ bgcolor: 'background.paper' }}
            >
              {/* Google Calendar List Item */}
              {googleCalendar == 1 && (
                <ListItem>
                  <ListItemIcon>
                    <img src={googleCalendarIcon}
                      alt="Google Calendar" width={30} height={30} />
                  </ListItemIcon>
                  <ListItemText primary={syncMail} />
                  <a
                    style={{
                      color: 'red',
                      cursor: 'pointer',
                      marginRight:'-5%',
                    }}
                    onClick={handleDisconnectCalendar} // Google Disconnect
                  >
                      Disconnect
                  </a>
                </ListItem>
              )}

              {/* Microsoft Calendar List Item */}
              {msCalendar == 1 && (
                <ListItem>
                  <ListItemIcon>
                    <img src={outlookCalendarIcon}
                      alt="Outlook Calendar" width={30} height={30} />
                  </ListItemIcon>
                  <ListItemText primary={syncMail} />
                  <a
                    style={{
                      color: 'red',
                      cursor: 'pointer',
                      marginRight:'-5%',
                    }}
                    onClick={handleDisconnectMicrosoftCalendar} // Microsoft Disconnect
                  >
                      Disconnect
                  </a>
                </ListItem>
              )}
            </List>
          </Box></>
        )}

        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ marginTop: '5%', textAlign: 'center', padding: '0 4%', fontSize: '18px', lineHeight: 1.6 }}
        >
          <strong>⚠️ Calendar Sync Tip:</strong> Don’t edit session times directly in your Google or Outlook calendar — changes won’t sync back to Hodego.<br />
          <strong>To make changes, use the "Request to Reschedule" button in your Bookings tab.</strong>
        </Typography>
      </Container>
      {/* Calendar Connection Dialog */}
      <Dialog open={open} onClose={handleClose} aria-labelledby="connect-calendar-dialog"
        PaperProps={{ sx: { width:isMobile?'90%':'30%', margin: '0 auto' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
          Select calendar to connect 
          <Typography sx={{marginTop:'2%'}}>Only one calendar can be synced at a time.</Typography>
          <IconButton aria-label="close" onClick={handleClose} sx={{ position: 'absolute', right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Google Calendar Option */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" >
                <img src={googleCalendarIcon}
                  alt="Google Calendar" width={30} height={30} style={{ marginRight: 10 }} 
                />
                <Typography variant="body1" fontWeight="500">Google Calendar</Typography>
              </Box>
              {/* Show "Connect" Button or "Connected" Message */}
              {isCalendarConnected ? (
                <Typography color="success.main">Calendar Connected!</Typography>
              ) : (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ fontWeight: 'bold' }} 
                  onClick={handleConnectGoogleCalendar} // Call function on click
                >
          Connect
                </Button>
              )}
            </Box>
            {/* <Divider/> */}
            {/* Outlook Calendar Option */}
            <Box
              display="none"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center">
                <img src={outlookCalendarIcon}
                  alt="Outlook" width={30} height={30} style={{ marginRight: 10 }} 
                />

           
                <Typography variant="body1" fontWeight="500">Outlook</Typography>
              </Box>
              {isCalendarConnected ? (
                <Typography color="success.main">Calendar Connected!</Typography>
              ) : (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ fontWeight: 'bold' }} 
                  onClick={handleConnectMicrosoftCalendar}
                >
                      Connect
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SyncCalendar;