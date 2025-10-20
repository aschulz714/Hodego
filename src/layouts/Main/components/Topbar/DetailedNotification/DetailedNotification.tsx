import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  Avatar,
  Link,
  IconButton,Dialog, DialogTitle, DialogContent,DialogActions,Switch,Tooltip
} from '@mui/material';
import CircleIcon from '@mui/icons-material/FiberManualRecord';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Main from 'layouts/Main';
import { getData,putData } from '../../../../../theme/Axios/apiService';
import siteConfig from '../../../../../theme/site.config';
// import './DetailedNotification.css';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth0 } from '@auth0/auth0-react';
import { useTheme, useMediaQuery } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';



const DetailedNotificationsPage: React.FC = () => {

  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [readStatus, setReadStatus] = useState<'all' | 'unread'>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const { user } = useAuth0();
  const perPage = 10;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchUnreadCount = async () => {
    try {
      const response = await getData(`${siteConfig.hodegoUrl}user/notification?readStatus=unread`);
      const unreadData = response?.data?.data || [];
      setTotalUnread(unreadData.length);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotificationsWithStatus = async (page: number, status: 'all' | 'unread') => {
    const offset = (page - 1) * perPage;
    try {
      const response = await getData(
        `${siteConfig.hodegoUrl}user/notification?limit=${perPage}&offset=${offset}&readStatus=${status}`
      );
      const apiData = response?.data?.data || [];
      const total = response?.data?.total || 0;
  
      setNotifications(apiData);
      if (status === 'unread') {
        setTotalPages(Math.ceil(total / perPage)); // fallback to length if unread
      } else {
        setTotalPages(Math.ceil(total / perPage));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  const fetchNotifications = async (page: number) => {
    const offset = (page - 1) * perPage;

    try {
      const response = await getData(
        `${siteConfig.hodegoUrl}user/notification?limit=${perPage}&offset=${offset}&readStatus=${readStatus}`
      );
      
      const apiData = response?.data?.data || [];
      const total = response?.data?.total || 0;

      setNotifications(apiData);
      setTotalPages(Math.ceil(total / perPage));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  const fetchAnnouncementDetails = async (id: number) => {
    try {
      const response = await getData(`${siteConfig.hodegoUrl}user/notification/${id}`);
      const announcement = response?.data;
      setSelectedAnnouncement(announcement);
      setOpenDialog(true);
  
      await markNotificationAsRead(id); // ✅ Mark as read after opening
      // Refresh notifications to reflect read state
      fetchNotifications(currentPage);
    } catch (error) {
      console.error('Error fetching announcement details:', error);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchNotificationsWithStatus(currentPage, readStatus);
      fetchUnreadCount();
    }
  }, [user, currentPage, readStatus]); // ✅ Include readStatus here
  
  

  const markNotificationAsRead = async (id: number) => {
    try {
      const response = await putData({}, `${siteConfig.hodegoUrl}user/notification/${id}`);
      await fetchUnreadCount(); // ✅ Refresh the unread count
      return response;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  };
  const markAllAsRead = async () => {
    try {
      const response = await putData({}, `${siteConfig.hodegoUrl}user/notification`);
      if (response?.data === true) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: 1 })) // ✅ Update correct state
        );
        await fetchUnreadCount(); // ✅ Refresh unread count after updating state
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  const handleAnnouncementBookingClick = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      window.location.href = `${window.location.origin}/account-settings?value=bookings`;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  // ✅ Notification message logic

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
        break;
    }

    return { fullName, message };
  };


  return (
    <Main>
      <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 3 }}>
        {/* <Typography variant="h5" fontWeight={600} gutterBottom>Notifications</Typography> 
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="text"
            sx={{ fontWeight: 500 }}
            onClick={markAllAsRead} // ✅ Hook it up
          >
    Mark all as read
          </Button>
        </Box> */}

        {isMobile ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications{' '}
              <span style={{ color: '#73A870', fontWeight: 'normal', fontSize: '14px' }}>
                {totalUnread > 0 ? `(${totalUnread} Unread)` : '(All Read)'}
              </span>
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Only show unread notifications">
                <Switch
                  checked={readStatus === 'unread'}
                  onChange={(e) => {
                    const newStatus = e.target.checked ? 'unread' : 'all';
                    setReadStatus(newStatus);
                    setCurrentPage(1); // ✅ Reset to page 1 when switching status
                    fetchNotificationsWithStatus(1, newStatus); // ✅ Always fetch with new page and new status
                    fetchUnreadCount();
                  }}
                  size="small"
                  color="primary"
                />
              </Tooltip>

              <Tooltip title="Mark all as read">
                <IconButton onClick={markAllAsRead}>
                  <DoneAllIcon sx={{ fontSize: 22, color: '#0C6697' }} />
                </IconButton>
              </Tooltip>

            </Box>
          </Box>
        ) : (
        // Keep your desktop layout as it is here
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={600}>
  Notifications <span style={{color:'#73A870',fontWeight:'normal'}}>{totalUnread > 0 ? `(${totalUnread} Unread)` : '(All Read)'}</span>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography fontSize="14px">Only show unread</Typography>
              <Switch
                checked={readStatus === 'unread'}
                onChange={(e) => {
                  const newStatus = e.target.checked ? 'unread' : 'all';
                  setReadStatus(newStatus);
                  setCurrentPage(1); // ✅ Reset to page 1 when switching status
                  fetchNotificationsWithStatus(1, newStatus); // ✅ Always fetch with new page and new status
                  fetchUnreadCount();
                }}
            
                color="primary"
              />
              <Button
                variant="text"
                onClick={markAllAsRead}
                sx={{ fontWeight: 500 }}
              >
    Mark all as read
              </Button>
            </Box>
          </Box>
        )}



        <Divider sx={{ marginBottom: 2 }} />

        {/* Notifications list */}
        {notifications.map((notification) => {
          const { fullName, message } = getNotificationMessage(notification);
          const isAnnouncement = notification.notificationType === 'announcement';
          const remoteUser = notification.remoteUser || {};
          const profilePictureUrl = remoteUser.profilePictureUrl;

          return (
            <>
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


              {isMobile ? (
              // 🔹 MOBILE LAYOUT 🔹
              
                <Box
                  key={notification.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 2,
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: notification.isRead === 0 ? '#f9f9f9' : 'white',
                    borderRadius: 2,
                    marginBottom: 2,
                  }}
                >
                  {/* First Row: Avatar + Text + Red Dot */}
                  <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative',marginLeft:'-6%' }}>
                    <Avatar
                      src={!isAnnouncement && profilePictureUrl ? profilePictureUrl : ''}
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: isAnnouncement || !profilePictureUrl ? '#ddd' : 'transparent',
                      }}
                    >
                      {isAnnouncement || profilePictureUrl != null ? '🔔' : ''}
                    </Avatar>

                    <Box sx={{ paddingLeft: 2 }}>
                      {!isAnnouncement ? (
                        <Box>
                          <span
                            style={{
                              color: '#0C6697',
                              fontWeight: notification.isRead === 0 ? 'bold' : 'normal',
                            }}
                          >
                            {fullName}
                          </span>
                          <span
                            style={{
                              fontWeight: notification.isRead === 0 ? 'bold' : 'normal',
                              color: '#525456',
                              marginLeft: 4,
                            }}
                          >
                            {message} <span style={{color:'#73A870',fontWeight: notification.isRead === 0 ? 'bold' : 'normal'}}>(Booking ID:#{notification.bookingId})</span>
                          </span>
                        </Box>
                      ) : (
                        <>
                          <span style={{ color: '#0C6697', fontWeight: notification.isRead === 0 ? 'bold' : 'normal', fontSize: '17px' }}>Announcement:</span>
                          <span style={{ fontWeight: notification.isRead === 0 ? 'bold' : 'normal', color: '#525456' }}> {notification.title}</span>
                          <Link
                            href="#"
                            sx={{ color: '#0C6697', fontWeight: 500, fontSize: '16px', marginLeft: 1 }}
                            onClick={(e) => {
                              e.preventDefault();
                              fetchAnnouncementDetails(notification.id);
                            }}
                          >
              Read more
                          </Link>
                        </>
                      )}
                    </Box>
                    <Box sx={{ position: 'static',marginLeft:'1%',marginTop:'-11%' }}>
                      {notification.isRead === 0 && (
                        <CircleIcon sx={{ color: 'red', fontSize: 12, position: 'absolute' }} />
                      )}
                    </Box>
                  </Box>

                  {/* Second Row: Button */}
                  {notification.notificationType === 'booking' && (
                    <Box sx={{ marginTop: 2,marginLeft:'16%' }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          },
                        }}
                        onClick={() => handleAnnouncementBookingClick(notification.id)}
                      >
                      View booking
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
              // 🖥️ DESKTOP LAYOUT (Your current design)
                <Box
                  key={notification.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 2,
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: notification.isRead === 0 ? '#f9f9f9' : 'white',
                    borderRadius: 2,
                    marginBottom: 2,
                  }}
                >
                  {/* Profile Picture or Bell Icon */}
                  <Avatar
                    src={!isAnnouncement && profilePictureUrl ? profilePictureUrl : ''}
                    sx={{
                      width: 50,
                      height: 50,
                      minWidth: 50,
                      backgroundColor: isAnnouncement || !profilePictureUrl ? '#ddd' : 'transparent',
                    }}
                  >
                    {isAnnouncement || profilePictureUrl != null ? '🔔' : ''}
                  </Avatar>

                  {/* Notification Content */}
                  <Box sx={{ flex: 1, paddingLeft: 2 }}>
                    {isAnnouncement ? (
                      <>
                        <span style={{ color: '#0C6697', fontWeight: notification.isRead === 0 ? 'bold' : 'normal', fontSize: '17px' }}>Announcement:</span>
                        <span style={{ fontWeight: notification.isRead === 0 ? 'bold' : 'normal', color: '#525456' }}> {notification.title}</span>
                      </>
                    ) : (
                      <Box>
                        <span style={{ color: '#0C6697', fontWeight: notification.isRead === 0 ? 'bold' : 'normal' }}>
                          {fullName}
                        </span>
                        <span
                          style={{
                            fontWeight: notification.isRead === 0 ? 'bold' : 'normal',
                            color: '#525456',
                            marginLeft: 4,
                          }}
                        >
                          {message}<span style={{ marginLeft: '5px', color:'#73A870',fontWeight: notification.isRead === 0 ? 'bold' : 'normal' }}>(Booking ID:#{notification.bookingId})</span>
                        </span>
                      </Box>

                    )}

                    {/* Read More for Announcements */}
                    {isAnnouncement && (
                      <Link
                        href="#"
                        sx={{ color: '#0C6697', fontWeight: 500, fontSize: '16px', marginLeft: 1 }}
                        onClick={(e) => {
                          e.preventDefault();
                          fetchAnnouncementDetails(notification.id); // 👈 Pass the notification ID
                        }}
                      >
                Read more
                      </Link>
              

                
                    )}
                  </Box>

                  <Box>
                    {notification.notificationType === 'booking' && (
                      <Box sx={{ position: 'relative', width: 'fit-content', minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #0C6697, #73A870)',
                            },
                          }}
                          onClick={async () => {
                            try {
                              await markNotificationAsRead(notification.id);
                              window.location.href = `${window.location.origin}/account-settings?value=bookings`;
                            } catch (error) {
                              console.error('Failed to mark notification as read:', error);
                            }
                          } }
                        >
                      View booking
                        </Button>
                      </Box>
                    )}

                    {notification.isRead === 0 && (
                      <Box className="dot"  sx={{
                        position: 'absolute',
                        right: '18%',
                        marginTop:'-1%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CircleIcon sx={{ color: 'red', fontSize: 12,position:'absolute' }} />
                      </Box>
                    )}
                  </Box>
              

                </Box>
              )}























              {/* <Box
                key={notification.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 2,
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: notification.isRead === 0 ? '#f9f9f9' : 'white',
                  borderRadius: 2,
                  marginBottom: 2,
                }}
              >
                <Avatar
                  src={!isAnnouncement && profilePictureUrl ? profilePictureUrl : ''}
                  sx={{
                    width: 50,
                    height: 50,
                    minWidth: 50,
                    backgroundColor: isAnnouncement || !profilePictureUrl ? '#ddd' : 'transparent',
                  }}
                >
                  {isAnnouncement || !profilePictureUrl ? '🔔' : ''}
                </Avatar>

                <Box sx={{ flex: 1, paddingLeft: 2 }}>
                  {isAnnouncement ? (
                    <>
                      <span style={{ color: '#0C6697', fontWeight: notification.isRead === 0 ? 'bold' : 'normal', fontSize: '17px' }}>Announcement:</span>
                      <span style={{ fontWeight: notification.isRead === 0 ? 'bold' : 'normal', color: '#525456' }}> {notification.title}</span>
                    </>
                  ) : (
                    <Box>
                      <span style={{ color: '#0C6697', fontWeight: notification.isRead === 0 ? 'bold' : 'normal' }}>
                        {fullName}
                      </span>
                      <span
                        style={{
                          fontWeight: notification.isRead === 0 ? 'bold' : 'normal',
                          color: '#525456',
                          marginLeft: 4,
                        }}
                      >
                        {message}<span style={{ marginLeft: '5px', color: '#525456', fontWeight: notification.isRead === 0 ? 'bold' : 'normal' }}>(#{notification.bookingId})</span>
                      </span>
                    </Box>

                  )}
                  {isAnnouncement && (
                    <Link
                      href="#"
                      sx={{ color: '#0C6697', fontWeight: 500, fontSize: '16px', marginLeft: 1 }}
                      onClick={(e) => {
                        e.preventDefault();
                        fetchAnnouncementDetails(notification.id); 
                      }}
                    >
                  Read more
                    </Link>
                

                  
                  )}
                </Box>

                <Box>
                  {notification.notificationType === 'booking' && (
                    <Box sx={{ position: 'relative', width: 'fit-content', minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          },
                        }}
                        onClick={async () => {
                          try {
                            await markNotificationAsRead(notification.id);
                            window.location.href = `${window.location.origin}/account-settings?value=bookings`;
                          } catch (error) {
                            console.error('Failed to mark notification as read:', error);
                          }
                        } }
                      >
                        View booking
                      </Button>
                    </Box>
                  )}

                  {notification.isRead === 0 && (
                    <Box className="dot"  sx={{
                      position: 'absolute',
                      right: '18%',
                      marginTop:'-1%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CircleIcon sx={{ color: 'red', fontSize: 12,position:'absolute' }} />
                    </Box>
                  )}
                </Box>
                

              </Box> */}
            </>
          );
        })}
        {notifications.length === 0 && (
          <Box sx={{ textAlign: 'center', padding: 2 }}>
            <Typography variant="body1" color="textSecondary">
              No notifications available.
            </Typography>
          </Box>
        )}
        <Divider sx={{ marginTop: 2 }} />

        {/* Pagination */}
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
            <ArrowBackIosIcon />
          </IconButton>

          {getPageNumbers().map((item, index) => (
            <Box
              key={index}
              sx={{
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 5px',
                borderRadius: '50%',
                background: currentPage === item ? 'linear-gradient(90deg, #0C6697, #73A870)' : 'transparent',
                color: currentPage === item ? '#fff' : '#000',
                cursor: item === '...' ? 'default' : 'pointer',
              }}
              onClick={() => item !== '...' && onPageChange(Number(item))}
            >
              {item}
            </Box>
          ))}

          <IconButton onClick={handleNextPage} disabled={currentPage === totalPages}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

      </Box>
    </Main>
  );
};

export default DetailedNotificationsPage;
