import React, { useState } from 'react';
import {
  Menu, MenuItem, Divider, IconButton, Tooltip, Badge, Box, Typography, Button, Avatar, Switch,Link,Dialog, DialogTitle, DialogContent,DialogActions
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CircleIcon from '@mui/icons-material/FiberManualRecord';
import { useNavigate } from 'react-router-dom';
import { getData, putData } from '../../../../../theme/Axios/apiService';
import siteConfig from '../../../../../theme/site.config';
import { useAuth0 } from '@auth0/auth0-react';
import CloseIcon from '@mui/icons-material/Close';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [readStatus, setReadStatus] = useState<'all' | 'unread'>('all');
  const { user } = useAuth0();
  const [openDialog, setOpenDialog] = useState(false);
  const [openFullDialog, setOpenFullDialog] = useState(false);
  const [selectedFullAnnouncement, setSelectedFullAnnouncement] = useState<any>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number>(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  // const [announcementList, setAnnouncementList] = useState<any[]>([]);


  // Fetch count of all unread
  const fetchUnreadCount = async () => {
    try {
      const response = await getData(`${siteConfig.hodegoUrl}user/notification?readStatus=unread`);
      const allUnread = response?.data?.data || [];
      setTotal(allUnread.length);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async (status: 'all' | 'unread' = readStatus) => {
    try {
      const response = await getData(
        `${siteConfig.hodegoUrl}user/notification?limit=4&offset=0&readStatus=${status}&notificationStatus=1`
      );
      const apiData = response?.data?.data || [];
      const apiRecentAnnouncement = response?.data?.recentAnnouncement || [];
      // const sortedData = apiData.sort((a: any, b: any) => a.isRead - b.isRead);
      if(apiRecentAnnouncement.length > 0){
        for(let i = 0; i < apiRecentAnnouncement.length; i++){
          if(apiRecentAnnouncement[i].notificationType === 'announcement' && apiRecentAnnouncement[i].isRead == 0){
            fetchAnnouncementDetails(apiRecentAnnouncement[i].id,'load');
            break;
          }
        }
      }
      setNotificationList(apiData);
  
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  const modalClose = async() =>{
    setOpenFullDialog(false);
    await markNotificationAsRead(selectedNotificationId);
  };

  const markAllAsRead = async () => {
    try {
      const response = await putData({}, `${siteConfig.hodegoUrl}user/notification`);
      if (response?.data === true) {
        // Update UI locally
        setNotificationList(prev =>
          prev.map(notif => ({ ...notif, isRead: 1 }))
        );
        fetchUnreadCount(); // ✅ Refresh unread count

      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, []);

  const markNotificationAsRead = async (id: number) => {
    try {
      const response = await putData({}, `${siteConfig.hodegoUrl}user/notification/${id}`);
      if(response?.data === true) {
        fetchNotifications();
        fetchUnreadCount();
      }
      // return response;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  };
  
  
  
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const fetchAnnouncementDetails = async (id: number,type: string) => {
    try {
      const response = await getData(`${siteConfig.hodegoUrl}user/notification/${id}`);
      const announcement = response?.data;
      if(type === 'click'){
        setSelectedAnnouncement(announcement);
        setOpenDialog(true);
        console.log('openFullDialog',openFullDialog);
      
        await markNotificationAsRead(id);
        fetchUnreadCount(); // ✅ update unread badge count
        fetchNotifications(); // Refresh UI list
      }
      else{
        setOpenFullDialog(true);
        setSelectedNotificationId(id);
        setSelectedFullAnnouncement(announcement);
      }
      
    } catch (error) {
      console.error('Error fetching announcement details:', error);
    }
  };
  const handleViewBookingClick = async (e: React.MouseEvent<HTMLButtonElement>, notificationId: number) => {
    e.stopPropagation(); // prevent parent click
    await markNotificationAsRead(notificationId);
    fetchUnreadCount(); // ✅ update unread badge count
    setNotificationList(prev =>
      prev.map(notif => notif.id === notificationId ? { ...notif, isRead: 1 } : notif)
    );
    window.location.href = '/account-settings?value=bookings';
  };
  const getNotificationMessage = (notification: any) => {
    const remoteUser = notification.remoteUser || {};
    const { firstName = '', lastName = '' } = remoteUser;
    const fullName = `${firstName} ${lastName}`.trim();
  
    let message = '';
    switch (notification.title) {
      case 'pending':
        message = 'requested booking';
        break;
      case 'confirmed':
        message = 'confirmed booking';
        break;
      case 'rescheduleRequested':
        message = 'requested reschedule for booking';
        break;
      case 'rescheduleRequestedByMentor':
        message = 'reschedule requested for booking';
        break;
      case 'rescheduled':
        message = 'rescheduled booking';
        break;
      case 'cancelled':
        message = 'cancelled the booking';
        break;
      case 'declined':
        message = 'declined the booking';
        break;
      case 'declinedReschedule':
        message = 'declined the reschedule';
        break;
      case 'accepted':
        message = 'accepted the booking';
        break;
      case 'acceptedReschedule':
        message = 'accepted the reschedule';
        break;
      default:
        message = 'has a booking update';
    }
  
    return { fullName, message };
  };
  
  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleNotificationClick} aria-label="Notifications">
          <Badge badgeContent={total} color="error">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Dialog
        open={openFullDialog}
        // onClose={(event, reason) => {
        //   if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
        //     setOpenFullDialog(false);
        //   }
        // }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 2,
            backgroundColor: '#ffffff',
            boxShadow: 'none',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: '18px',
            color: '#0C6697',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {selectedFullAnnouncement?.title}
          <IconButton onClick={modalClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ mb: 2 }} />

        {/* Replace this: */}
        {/* <DialogContent>...single announcement...</DialogContent> */}

        {/* With your new announcementList dialog here 👇 */}
        <DialogContent sx={{padding:0}}>
          <Typography
            // sx={{ fontSize: '16px', color: '#333' }}
            dangerouslySetInnerHTML={{ __html: selectedFullAnnouncement?.content || '' }}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'flex-end', padding: 2 }}>
          <Button
            onClick={modalClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              color: 'white',
              textTransform: 'none',
              px: 3,
            }}
          >
      Okay
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)', // ✅ Light dimming effect
          },
        }} 
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 2,
            backgroundColor: '#ffffff', // Pure white card
            boxShadow: 'none',
          },
        }}
      >
        {/* Title */}
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: '18px',
            color: '#0C6697',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {selectedAnnouncement?.title}
          <IconButton onClick={() => setOpenDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Divider */}
        <Divider sx={{ mb: 2 }} />

        {/* Content */}
        <DialogContent>
          <Typography
            sx={{ fontSize: '16px', color: '#333' }}
            dangerouslySetInnerHTML={{ __html: selectedAnnouncement?.content || '' }}
          />
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ justifyContent: 'flex-end', padding: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              color: 'white',
              textTransform: 'none',
              px: 3,
            }}
          >
      Okay
          </Button>
        </DialogActions>
      </Dialog>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ mt: 2, ml: -2 }}
        PaperProps={{
          sx: {
            width: isMobile ? '364px' : 540,
            borderRadius: 3,
            left: isMobile ? '10% !important' : '0%',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
            paddingBottom: 1,
            backgroundColor: '#fff',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="h6" fontWeight={600}>Notifications</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile ?
              ''
              :
              <Typography>Only show unread</Typography>
            }
           
            <Tooltip title= "Only show unread"  arrow
              disableInteractive={isMobile} // Only disable interactivity on mobile
              enterTouchDelay={0} // Ensures immediate display on touch
            >
              <Switch
                checked={readStatus === 'unread'}
                onChange={(e) => {
                  const newStatus = e.target.checked ? 'unread' : 'all';
                  setReadStatus(newStatus);
                  fetchNotifications(newStatus); // update list
                  fetchUnreadCount(); // keep unread count in sync
                }}
                
                color="primary"
              />
            </Tooltip>

            <Tooltip title="Open full notifications">
              <IconButton onClick={() => navigate('/notifications')}>
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        {notificationList.length === 0 ?  (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#999', fontSize: '16px', fontWeight: 500 }}>
              {readStatus === 'unread' ? 'No Unread to Show' : 'No Notifications Available'}
            </Typography>
          </Box>
        ) : (
          notificationList.map((notification) => {
            const isAnnouncement = notification.notificationType === 'announcement';
            const remoteUser = notification.remoteUser || {};
            const { profilePictureUrl = '' } = remoteUser;

            return (
              <MenuItem
                key={notification.id}
                onClick={async () => {
                  if (isAnnouncement) {
                    await markNotificationAsRead(notification.id);
                    fetchUnreadCount(); // ✅ update unread badge count
                    setNotificationList(prev =>
                      prev.map(notif => notif.id === notification.id ? { ...notif, isRead: 1 } : notif)
                    );
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: notification.notificationType === 'booking' ? 'flex-start' : 'center',
                  gap: 1.5,
                  p: 2,
                  borderBottom: '1px solid #eee',
                  marginBottom: 1,
                  cursor: 'initial',
                }}
              >
                {isAnnouncement ? (
                  <Avatar sx={{ bgcolor: '#ddd', width: 50, height: 50, minWidth: 50 }}>🔔</Avatar>
                ) : (
                  <Avatar
                    src={profilePictureUrl || undefined}
                    sx={{
                      width: 50,
                      height: 50,
                      minWidth: 50,
                      mt: '4px'
                    }}
                  />
                )}

                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    fontSize: '17px',
                    fontWeight: notification.isRead === 0 ? 600 : 400,
                  }}>
                    {isAnnouncement ? (
                      <>
                        <span style={{ color: '#525456', fontWeight:  notification.isRead === 0 ? 'bold' : 'normal', fontSize: '17px' }}>Announcement:</span>
                        <span style={{ fontWeight: notification.isRead === 0 ? 'bold' : 'normal', color: '#525456' }}> {notification.title}</span>
                        <Link
                          href="#"
                          sx={{ color: '#0C6697', fontWeight: 500, fontSize: '16px', marginLeft: 1 }}
                          onClick={(e) => {
                            e.preventDefault();
                            fetchAnnouncementDetails(notification.id,'click');
                          }}
                        >
              Read more
                        </Link>
                      </>
                    ) : (
                      <Box component="span">
                        <span style={{ color: '#0C6697', fontWeight: notification.isRead === 0 ? 'bold' : 'normal' }}>
                          {getNotificationMessage(notification).fullName}
                        </span>
                        <span style={{
                          fontWeight: notification.isRead === 0 ? 'bold' : 'normal',
                          color: '#525456',
                          marginLeft: 4
                        }}>
                          {getNotificationMessage(notification).message}<span style={{marginLeft:'5px',color: '#73A870', fontWeight:  notification.isRead === 0 ? 'bold' : 'normal'}}>(Booking ID:#{notification.bookingId})</span>
                        </span>
                      </Box>
                    )}
                  </Typography>

                  {!isAnnouncement && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        mt: 1,
                        textTransform: 'none',
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #0C6697, #73A870)',
                        fontWeight: 500,
                        color: '#fff',
                        width: 140,
                        height: 30,
                      }}
                      onClick={(e) => handleViewBookingClick(e, notification.id)}
                    >
         View booking
                    </Button>
                  )}
                </Box>

                {notification.isRead === 0 && (
                  <CircleIcon sx={{ color: 'red', fontSize: 10, alignSelf: 'center' }} />
                )}
              </MenuItem>
            );
          })
        )}


        {/* {notificationList.map((notification) => {
          const isAnnouncement = notification.notificationType === 'announcement';
          const remoteUser = notification.remoteUser || {};
          const { profilePictureUrl = '' } = remoteUser;

          return (
         
          );
        })} */}


        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
          <Button onClick={() => navigate('/notifications')} sx={{ textTransform: 'none', fontWeight: 500 }}>
            View all notifications
          </Button>
          <Button
            onClick={markAllAsRead}
            sx={{ textTransform: 'none', fontWeight: 500, color: 'blue' }}
          >
            Mark all as read
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationDropdown;