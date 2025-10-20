import React, { useState,useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import {
  Card,
  CardActions,IconButton,
  Grid,Dialog, DialogTitle, Snackbar, Alert,TextField
} from '@mui/material';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import siteConfig from '../../../../theme/site.config';
import hodegoEmptyIcon from '../../../../assets/images/empty.png';
import { getData, putData } from '../../../../theme/Axios/apiService';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CancelMeetingPopup from './CancelMeetingPopup';
import CloseIcon from '@mui/icons-material/Close';
import BookingCard from '../../../MentorProfiles/MentorDetailed/BookingCard';
import Box from '@mui/material/Box';
// import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import Avatar from '@mui/material/Avatar';
import DepartureBoardTwoToneIcon from '@mui/icons-material/DepartureBoardTwoTone';
import AddBusinessTwoToneIcon from '@mui/icons-material/AddBusinessTwoTone';
import EventNoteTwoToneIcon from '@mui/icons-material/EventNoteTwoTone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const Pagination = ({ currentPage, upcomingCount, onPageChange }) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < upcomingCount) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= upcomingCount; i++) {
    if (i === 1 || i === upcomingCount || i === currentPage || i === currentPage + 1 || i === currentPage - 1) {
      pageNumbers.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      if (pageNumbers[pageNumbers.length - 1] !== '...') {
        pageNumbers.push('...');
      }
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
      <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
        <ArrowBackIosIcon />
      </IconButton>
      {pageNumbers.map((item, index) => (
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
          onClick={() => item !== '...' && onPageChange(item)}
        >
          {item}
        </Box>
      ))}
      <IconButton onClick={handleNextPage} disabled={currentPage === upcomingCount}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};
export default function UpcomingContent(props) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [mentorName, setMentorName] = useState('');
  const [mentorId, setMentorId] = useState(0);
  const [bookingId, setBookingId] = useState(0);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionTime, setSessionTime] = useState('0');
  const [sameDayBooking, setSameDayBooking] = useState(0);
  const [rescheduledBy, setRescheduledBy] = useState('');
  const [recurrenceEnds, setRecurrenceEnds] = useState('');
  const [rescheduleMessage, setRescheduleMessage] = useState(null);
  const [currencyId, setCurrencyId] = useState('USD');
  const [sessionRate, setSessionRate] = useState('0');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [triggerStatus, setTriggerStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [upcomingCount, setUpcomingCount] = useState(props.upcomingCount);
  const [upcomingContent, setUpcomingContent] = useState(props.upcomingContent);
  const [confirmRescheduleOpen, setConfirmRescheduleOpen] = useState(false);
  const [selectedRescheduleBookingId, setSelectedRescheduleBookingId] = useState(0);
  const [reason, setReason] = useState('');
  const sessions = [];
  const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, [bookingId,triggerStatus,currentPage,errorMessage,props.upcomingContent,props.currentTimeZone]);
  useEffect(() => {
    if (confirmRescheduleOpen) {
      setReason('');
    }
  }, [confirmRescheduleOpen]);
  const formattedDate = (selectedDate) =>{
    console.log('selectedDate',selectedDate);
    if(selectedDate){
      const [year, month, day] = selectedDate.split('-'); // Split the 'YYYY-MM-DD' string
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // Construct local date
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      });
    }
    else{
      return '';
    }
    
  };
  const formatTimeRange = (start, end) => {
    // Parse the input dates
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Helper function to format time
    function formatTime(date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutes} ${ampm}`;
    }

    // Format the times
    const startTime = formatTime(startDate);
    const endTime = formatTime(endDate);

    // Combine into the desired format
    const timeRange = `${startTime} - ${endTime}`;
    
    return timeRange;
  };
  const handleClickOpen = (rescheduleMessage,rescheduledBy,bookingId,id,name,selectedSessionTime,amount,selectedCurrencyId,zeroDayBook,recurrenceEnds) => {
    setBookingId(bookingId);
    setRescheduledBy(rescheduledBy);
    setRescheduleMessage(rescheduleMessage);
    setSameDayBooking(zeroDayBook);
    setRecurrenceEnds(recurrenceEnds);
    setMentorName(name);
    if(selectedSessionTime){
      setSessionTime((selectedSessionTime).toString());
    }
    setCurrencyId(selectedCurrencyId);
    setSessionRate(amount);
    setMentorId(id);
    setRescheduleOpen(true);
  };
  
  const handleClose = () => {
    setRescheduleOpen(false);
  };
  const handleOpenPopup = (date,time,bookingId,name) => {
    setMentorName(name);
    setSelectedDate(date);
    setSelectedTime(time);
    setBookingId(bookingId);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
  };
  const handleConfirmReschedule = (bookingId) => {
    setSelectedRescheduleBookingId(bookingId);
    setConfirmRescheduleOpen(true);
  };

  const handleCloseRescheduleConfirm = () => {
    setConfirmRescheduleOpen(false);
  };
  // const handleRequestSchedule = async(bookingId) =>{
  //   setConfirmRescheduleOpen(false);
  //   const updatedData = {
  //     'status':'reschedule',
  //     'updatedBy' : 'mentor',
  //   };
  //   const response = await putData(updatedData, `${siteConfig.hodegoUrl}mentor/booking/${bookingId}`);
  //   if (response) {
  //     if(response.data.status == true){
  //       setTriggerStatus('requestReschedule');
  //       setSnackbarOpen(true);
  //       props.fetchData(0);
  //     }else if(response.data.status == false){
  //       setErrorMessage(response.data.message);
  //       setNotificationOpen(true);
  //     }
  //   }
  // };
  const handleRequestSchedule = async () => {

    setConfirmRescheduleOpen(false);
    setConfirmRescheduleOpen(false);
    const updatedData = {
      status: 'reschedule',
      updatedBy: 'mentor',
      rescheduleMessage: reason,
    };
    const response = await putData(
      updatedData,
      `${siteConfig.hodegoUrl}mentor/booking/${selectedRescheduleBookingId}`
    );
    if (response) {
      if (response.data.status === true) {
        setTriggerStatus('requestReschedule');
        setSnackbarOpen(true);
        props.fetchData(0);
      } else if (response.data.status === false) {
        setErrorMessage(response.data.message);
        setNotificationOpen(true);
      }
    }
  };
  const handleAvatarClick = (userName: string) => {
    navigate(`/expert/${userName}`); // Navigate to the user's detailed page
  };
  const handleSubmit = async(reason: string,type: string) => {
    const status = type == 'cancel'? 'cancelled':'declined';
    const updatedBy = type == 'cancel'? 'user':'mentor';
    const updatedData = {
      'status':status,
      'updatedBy' : updatedBy,
      'reason' : reason
    };
    const response = await putData(updatedData, `${siteConfig.hodegoUrl}mentor/booking/${bookingId}`);
    if (response) {
      if(response.data.status == true){
        setTriggerStatus('cancel');
        setSnackbarOpen(true);
        props.fetchData(0);
      }
      else if(response.data.status == false){
        setErrorMessage(response.data.message);
        setNotificationOpen(true);
      }
    }
    // console.log('Meeting canceled for reason:', reason);
  };
  const onBookSession = (msg) =>{
    if(msg == ''){
      setRescheduleOpen(false);
      setTriggerStatus('reschedule');
      setSnackbarOpen(true);
      props.fetchData(0);
    }
    else{
      setErrorMessage(msg);
      setNotificationOpen(true);
      setRescheduleOpen(false);
    }
    
  };
  // const timeAgo = (dateString: string) => {
  //   // Replace the space with 'T' to create a valid ISO 8601 string
  //   const isoDateString = dateString.replace(' ', 'T');

  //   // Parse the ISO 8601 string into a Date object
  //   const tempDate = new Date(isoDateString);

  //   // Check if the parsed date is invalid
  //   if (isNaN(tempDate.getTime())) {
  //     return 'Invalid date';
  //   }

  //   const now = new Date();
  //   const secondsPast = Math.floor((now.getTime() - tempDate.getTime()) / 1000);
  //   if (secondsPast < 60) {
  //     return 'a seconds ago';
  //   }
  //   if (secondsPast < 3600) {
  //     const minutes = Math.floor(secondsPast / 60);
  //     return minutes === 1 ? 'a minute ago' : `${minutes} minutes ago`;
  //   }
  //   if (secondsPast < 86400) {
  //     const hours = Math.floor(secondsPast / 3600);
  //     return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  //   }
  //   if (secondsPast < 2592000) {
  //     const days = Math.floor(secondsPast / 86400);
  //     return days === 1 ? 'a day ago' : `${days} days ago`;
  //   }
  //   if (secondsPast < 31536000) {
  //     const months = Math.floor(secondsPast / 2592000);
  //     return months === 1 ? 'a month ago' : `${months} months ago`;
  //   }
  //   const years = Math.floor(secondsPast / 31536000);
  //   return years === 1 ? 'a year ago' : `${years} years ago`;
  // };
  if(upcomingContent.length > 0) {
    for(let i=0;i<upcomingContent.length;i++) {

      const isMinor = upcomingContent[i].bookedUser.ageStatus === 'minor';
      const childName = upcomingContent[i].bookedUser.childFirstName?.trim();
      let displayName = upcomingContent[i].bookedUser.firstName + ' ' + upcomingContent[i].bookedUser.lastName;

      if (isMinor && childName) {
        displayName += ` (${childName})`;
      }
      const name  = upcomingContent[i].type == 'user'?upcomingContent[i].mentor.firstName + ' ' + upcomingContent[i].mentor.lastName
        :displayName;
      const imageUrl = upcomingContent[i].type == 'user'?upcomingContent[i].mentor.profilePicture
        :upcomingContent[i].bookedUser.profilePictureUrl;
      const title = upcomingContent[i].type == 'user'?upcomingContent[i].mentor.title
        :'';

   
      sessions.push({
        status: 'Session with',
        name: name,
        isMinor, // add this
        childName,
        parentFullName: upcomingContent[i].bookedUser.firstName + ' ' + upcomingContent[i].bookedUser.lastName,
        userName:upcomingContent[i].mentor?.userName,
        amount: upcomingContent[i].amount,
        meetingLinkId: upcomingContent[i].meetingLinkId,
        sessionTime: upcomingContent[i].sessionTime,
        currencyId: upcomingContent[i].currencyId,
        type: upcomingContent[i].type,
        bookingId:upcomingContent[i].id,
        rescheduleMessage: upcomingContent[i].rescheduleMessage,
        rescheduledBy: upcomingContent[i].rescheduledBy?upcomingContent[i].rescheduledBy:upcomingContent[i].type,
        zeroDayBook: upcomingContent[i].mentor?.zeroDayBook,
        recurrenceEnds: upcomingContent[i].mentor?.recurrenceEnds,
        mentorId: upcomingContent[i].mentorId,
        canMentorResch: upcomingContent[i].canMentorResch,
        canUserResch: upcomingContent[i].canUserResch,
        date: formattedDate(upcomingContent[i].date),
        time: formatTimeRange(upcomingContent[i].fromTime, upcomingContent[i].toTime),
        menteeAccountStatus:upcomingContent[i].bookedUser.accountStatus,
        mentorAccountStatus:upcomingContent[i].mentor.accountStatus,
        // createdTime : timeAgo(upcomingContent[i].createdAt),
        details: {
          mentorName: name,
          mentorImage: imageUrl,
          mentorTitle: title,
          sessionName: 'Session',
          mentorTimezone: upcomingContent[i].timeZone,
          interest: 'General mentorship',
          notes: upcomingContent[i].meetingAgenda,
          created: formattedDate(upcomingContent[i].createdAt),
        }
      });
    }
  }
  const fetchData = async () => {
    const upcomingResponse = await getData(`${siteConfig.hodegoUrl}mentor/booking?bookedBy=${localStorage.getItem('userId')}&limit=5&offset=${(currentPage - 1) * 5}&status=upcoming&userTimeZone=${props.currentTimeZone}`);
    if(upcomingResponse){
      if(upcomingResponse.data){
        if(upcomingResponse.data.total){
          setUpcomingCount(upcomingResponse.data.total);
        }
        if(upcomingResponse.data.data.length>0){
          setUpcomingContent(upcomingResponse.data.data);
        }
        else{
          setUpcomingContent([]);
        }
      }
    }
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <Box>
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
          {triggerStatus == 'cancel' ?
            'Canceled Successfully!'
            :triggerStatus == 'requestReschedule' ?
              'Reschedule Request Sent Successfully!'
              :
              'Rescheduled Successfully!'
          }
        </Alert>
      </Snackbar>
      <CancelMeetingPopup
        statusType={'cancel'}
        open={isPopupOpen}
        onClose={handleClosePopup}
        onSubmit={handleSubmit}
        mentorName={mentorName}
        date={selectedDate}
        time={selectedTime}
      />
      <Dialog
        open={confirmRescheduleOpen}
        onClose={handleCloseRescheduleConfirm}
        aria-labelledby="reschedule-dialog-title"
      >
        <DialogTitle id="reschedule-dialog-title">Request to Reschedule</DialogTitle>
        <DialogContent>
          <Typography>
          Are you sure you want to request a reschedule for this session? Once confirmed, the session will move to the 'Pending' section for you and the sports enthusiast. The enthusiast can then select another available time slot from your calendar, and the new time will be added to your 'Upcoming' sessions. Please confirm your action.
          </Typography>
          <TextField
            sx={{marginTop:'4%'}}
            label="Reason for Rescheduling"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            error={!reason}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleRequestSchedule}
            sx={{
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #0C6697, #73A870)',
              },
            }}
          >
            Yes
          </Button>
          <Button onClick={handleCloseRescheduleConfirm} sx={{
            color: 'red',
            border: '1px solid red',
            '&:hover': {
              backgroundColor: 'rgba(255, 0, 0, 0.1)', // Optional hover effect
            },
          }}>
            No
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rescheduleOpen} onClose={handleClose} className="bookingReschedule" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <DialogTitle id="dialog-title" sx={{fontSize:'20px',fontWeight:'bold'}}>Reschedule Meeting
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
        <BookingCard rescheduledBy={rescheduledBy} accountStatus={'active'} menteeStatus={true} rescheduleMessage={rescheduleMessage} recurrenceEnds={recurrenceEnds} rescheduleRequest={0} preview={false} type={'manageBooking'} bookingStatus={'0'} mentorUserId={0} onBookSession={onBookSession} bookingId={bookingId} mentorId={mentorId} mentorName={mentorName} mentorSessions={[{'time': sessionTime, 'rate': sessionRate, 'discount': '0'} ]} currencyId={currencyId} sameDayBooking={sameDayBooking}/>
      </Dialog>
      <Grid container spacing={2} className='upcomingCard'>
        {sessions.length>0 ?
          sessions.map((session, index) => (
            <Grid item xs={12} key={index} sx={{paddingLeft:isMobile == true? '0 !important':'auto'}}>
              <Card
                variant="outlined"     sx={{
                  paddingBottom: '1%',
                  border: (session.type === 'mentor' && session.isMinor) ? '2px solid pink' : '',
                }}
              >
                <Accordion sx={{ boxShadow: 'none' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Box width="100%">
                        <Typography sx={{ fontSize:'18px',fontWeight: 'bold', color: session.statusColor }}>
                          {session.status} 
                          {/* <span style={{ color: '#73A870' }}>{session.name}</span> */}
                          {/* {session.isMinor && session.childName
                            ? <><span style={{ color: '#73A870',marginLeft:'0.5%' }}>{session.childName}</span></>
                            : <><span style={{ color: '#73A870',marginLeft:'0.5%' }}>{session.name}</span></>
                          // }        */}
                          <span style={{ color: '#73A870', marginLeft: '0.5%' }}>
                            {session.type === 'mentor' && session.isMinor && session.childName
                              ? session.childName
                              : session.name}
                          </span>

                          {(session.type === 'mentor' && session.isMinor && session.childName) && (
                            <span style={{
                              marginLeft: '10px',
                              padding: '2px 6px',
                              border: '1px solid deeppink',
                              borderRadius: '5px',
                              fontSize: '14px',
                              color: 'deeppink',
                              backgroundColor: '#ffe6f0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1',
                            }}>
  Youth
                            </span>
                            
                          )}
                          {/* {session.isMinor && session.childName && (
                            <Typography sx={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>
                           Under the supervision of {session.parentFullName}
                            </Typography>
                          )} */}
                          {session.type === 'mentor' && session.isMinor && session.childName && (
                            <Typography sx={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>
                             Under the supervision of {session.parentFullName}
                            </Typography>
                          )}

                        </Typography>
                        <Box display="inline-flex" sx={{marginRight:'10%'}} alignItems="center" mt={1}>
                          <CalendarTodayIcon fontSize="medium" sx={{ mr: 1 }} />
                          <Typography sx={{fontSize:'16px',marginTop:'4px'}} variant="body2">{session.date}</Typography>
                        </Box>
                        <Box display="inline-flex" sx={{marginRight:'10%'}} alignItems="center" mt={1}>
                          <AccessTimeIcon fontSize="medium" sx={{ mr: 1 }} />
                          <Typography sx={{fontSize:'16px',marginTop:'4px'}} variant="body2">{session.time}</Typography>
                        </Box>
                        {/* <Box display="inline-flex" alignItems="center" mt={1}>
                          <TimerOutlinedIcon fontSize="medium" sx={{ mr: 1 }} />
                          <Typography sx={{fontSize:'16px',marginTop:'4px'}} variant="body2">{session.createdTime}</Typography>
                        </Box> */}
                      </Box>
                      <Typography>Details</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold',fontSize:'16px' }}>{session.type == 'user'?'Expert:':'User:'}</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {session.type == 'user'?
                          <Avatar alt={session.details.mentorName} src={session.details.mentorImage}  onClick={() => handleAvatarClick(session.userName)} sx={{ mr: 2,width:'100px',height:'100px' }} />
                          :
                          <Avatar alt={session.details.mentorName} src={session.details.mentorImage} sx={{ mr: 2,width:'100px',height:'100px' }} />
                        }
                        <Box>
                          {/* <Typography sx={{fontSize:'18px',color:'#333'}}>{session.details.mentorName}</Typography> */}
                          <Typography sx={{ fontSize: '18px', color: '#333' }}>
                            {session.type === 'user'
                              ? session.details.mentorName // mentee side should see the mentor name
                              : session.isMinor && session.childName
                                ? session.childName
                                : session.details.mentorName}
                          </Typography>

                          {session.details.mentorTitle?
                            <Typography sx={{fontSize:'18px',color:'#333'}} variant="body2">{session.details.mentorTitle}</Typography>
                            :
                            ''
                          }
                        </Box>
                      </Box>
                      {/* <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>Session Name</Typography>
                      <Typography variant="body2">{session.details.sessionName}</Typography> */}
                      <Typography variant="body2" sx={{ fontSize:'16px',fontWeight: 'bold', mt: 2 }}><DepartureBoardTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> {session.type == 'mentor'?'User':'Expert'} Timezone:</Typography>
                      <Typography sx={{fontSize:'16px',color:'#333'}} variant="body2">{session.details.mentorTimezone}</Typography>
                      {/* <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>I am interested in</Typography>
                      <Typography variant="body2">{session.details.interest}</Typography> */}
                      <Typography variant="body2" sx={{ fontSize:'16px',fontWeight: 'bold', mt: 2 }}><EventNoteTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> Session Agenda:</Typography>
                      <Typography sx={{fontSize:'16px',color:'#333'}} variant="body2">{session.details.notes}</Typography>
                      <Typography variant="body2" sx={{ fontSize:'16px',fontWeight: 'bold', mt: 2 }}><AddBusinessTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> Created:</Typography>
                      <Typography sx={{fontSize:'16px',color:'#333'}} variant="body2">{session.details.created}</Typography>
                      <Typography variant="body2" sx={{ fontSize:'16px',fontWeight: 'bold', mt: 2 }}> Booking Id:</Typography>
                      <Typography sx={{fontSize:'16px',color:'#333'}} variant="body2">
                        <span style={{ fontWeight: 'normal', color: '#333' }}>#{session.bookingId}</span>
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                <CardActions style={{'display':'block'}}>
                  {/* {session.type == 'mentor' && session.rescheduleMessage?
                    <Box sx={{marginLeft:'1%'}}>
                      {session.rescheduleMessage.trim() !== '' && (
                        <Typography sx={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2,fontSize:'16px',color:'#0C6697' }}>Reschedule Request from User:</Typography> 
                          <Typography sx={{marginTop:'1%',marginBottom:'2%'}}>{session.rescheduleMessage}</Typography>
                        </Typography>
                      )}
                    </Box>
                    : 
                    ''
                  } */}
                  {session.type == 'mentor'?
                    <Box display="flex" justifyContent="flex-start" gap={isMobile == true?'8px':2} width="100%" sx={{marginLeft:'1%'}}>
                      <a href={`hodego-join?id=${session.meetingLinkId}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outlined"  sx={{
                          height:'44px',
                          background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          },
                        }} >Join</Button></a>
                      {session.canMentorResch <4 && session.canUserResch <= 1 && (session.menteeAccountStatus == 'active' || session.menteeAccountStatus == 'suspended') && (session.mentorAccountStatus == 'active' || session.mentorAccountStatus == 'suspended') ?
                        <Button variant="outlined" onClick={()=>handleConfirmReschedule(session.bookingId)} sx={{
                          height:'44px',
                          background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          },
                        }} >Request to Reschedule</Button>
                        : 
                        ''
                      }
                      <Button variant="outlined" onClick={()=>handleOpenPopup(session.date,session.time,session.bookingId,session.details.mentorName)} sx={{ borderColor: 'red',height:'44px', color: 'red' }}>Cancel</Button>
                      {/* <Button variant="outlined" sx={{ borderColor: 'red', color: 'red' }}>Cancel</Button> */}
                    </Box>
                    :
                    <Box display="flex" justifyContent="flex-start" gap={2} width="100%" sx={{marginLeft:'1%'}}>
                      <a href={`hodego-join?id=${session.meetingLinkId}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outlined"  sx={{
                          height:'44px',
                          background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          },
                        }} >Join</Button></a>
                      {session.canUserResch == 1 && session.canMentorResch == 1 && (session.menteeAccountStatus == 'active' || session.menteeAccountStatus == 'suspended') && (session.mentorAccountStatus == 'active' || session.mentorAccountStatus == 'suspended')  ?
                        <Button variant="outlined" onClick={() => handleClickOpen(session.rescheduleMessage,session.rescheduledBy,session.bookingId,session.mentorId,session.details.mentorName,session.sessionTime,session.amount,session.currencyId,session.zeroDayBook,session.recurrenceEnds)} sx={{
                          height:'44px',
                          background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          },
                        }} >Reschedule</Button> 
                        :
                        ''
                      }
                      <Button variant="outlined" onClick={()=>handleOpenPopup(session.date,session.time,session.bookingId,session.details.mentorName)} sx={{ borderColor: 'red',height:'44px', color: 'red' }}>Cancel</Button>
                    </Box>
                  }
                </CardActions>
                {/* <Box display="flex" alignItems="center" mt={1} sx={{marginLeft:'1%'}}>
                  <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ margin: '10px 0' }}>
        Your booking request will <span style={{ color: 'red' }}>expire in 3 days</span> if not accepted or declined.
                  </Typography>
                </Box> */}
              </Card>
            </Grid>
          ))
          :
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="350px" width="100%" textAlign="center">
            <Avatar
              variant="square"
              src={hodegoEmptyIcon}
              alt="Profile Image"
              className="profileImage"
              style={{
                width: '75px',
                height: '75px',
                objectFit: 'contain',
                marginBottom: '1rem', // Adjust as needed for spacing
              }}
            />
            <Box>No Upcoming Bookings</Box>
            {localStorage.getItem('userType') == 'mentee'?
              <Button variant="contained" color="primary" sx={{height:'44px',marginTop:'2%',background: 'linear-gradient(90deg, #0C6697, #73A870)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(90deg, #0C6697, #73A870)',
                }}}  href="/explore">Explore Experts</Button>
              :
              ''
            }
          </Box>
        }
          
      </Grid>
      <Box className='upcomingCardPagination' justifyContent="center" mt={2}>
        {upcomingCount > 0 ? <Pagination currentPage={currentPage} upcomingCount={Math.ceil(upcomingCount / 5)} onPageChange={handlePageChange} /> : ''}
      </Box>
    </Box>
  );
}

