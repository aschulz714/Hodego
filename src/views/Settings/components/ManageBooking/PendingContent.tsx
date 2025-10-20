import React, { useState,useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import {
  Card,
  CardActions,IconButton,
  Grid,Dialog, DialogTitle, Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import siteConfig from '../../../../theme/site.config';
import { getData, putData } from '../../../../theme/Axios/apiService';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import hodegoEmptyIcon from '../../../../assets/images/empty.png';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CancelMeetingPopup from './CancelMeetingPopup';
import CloseIcon from '@mui/icons-material/Close';
import BookingCard from '../../../MentorProfiles/MentorDetailed/BookingCard';
// import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import Avatar from '@mui/material/Avatar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DepartureBoardTwoToneIcon from '@mui/icons-material/DepartureBoardTwoTone';
import AddBusinessTwoToneIcon from '@mui/icons-material/AddBusinessTwoTone';
import EventNoteTwoToneIcon from '@mui/icons-material/EventNoteTwoTone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Pagination = ({ currentPage, pendingCount, onPageChange }) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pendingCount) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= pendingCount; i++) {
    if (i === 1 || i === pendingCount || i === currentPage || i === currentPage + 1 || i === currentPage - 1) {
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
      <IconButton onClick={handleNextPage} disabled={currentPage === pendingCount}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};


export default function MentorshipAccordion(props) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [mentorName, setMentorName] = useState('');
  const [mentorId, setMentorId] = useState(0);
  const [bookingId, setBookingId] = useState(0);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rescheduledBy, setRescheduledBy] = useState('');
  const [rescheduleRequest, setRescheduleRequest] = useState(0);
  const [rescheduleMessage, setRescheduleMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sameDayBooking, setSameDayBooking] = useState(0);
  const [recurrenceEnds, setRecurrenceEnds] = useState('');
  const [sessionTime, setSessionTime] = useState('0');
  const [currencyId, setCurrencyId] = useState('USD');
  const [sessionRate, setSessionRate] = useState('0');
  const [triggerStatus, setTriggerStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingCount, setPendingCount] = useState(props.pendingCount);
  const [pendingContent, setPendingContent] = useState(props.pendingContent);
  const navigate = useNavigate();
  const sessions = [];
  useEffect(() => {
    fetchData();
  }, [bookingId,triggerStatus,currentPage,errorMessage,rescheduleRequest,props.pendingContent,props.currentTimeZone]);
  const formattedDate = (selectedDate) =>{
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
  const onBookSession = (msg) =>{
    if(msg == ''){
      setRescheduleOpen(false);
      setTriggerStatus('reschedule');
      // if(rescheduleRequest == 1){
      //   handleAcceptReschedule();
      // }
      setSnackbarOpen(true);
      props.fetchData(1);
      
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
  if(pendingContent.length > 0) {
    for(let i=0;i<pendingContent.length;i++) {
      const isMinor =  pendingContent[i].bookedUser.ageStatus === 'minor';
      const childName =  pendingContent[i].bookedUser.childFirstName?.trim();
      let displayName =  pendingContent[i].bookedUser.firstName + ' ' +  pendingContent[i].bookedUser.lastName;

      if (isMinor && childName) {
        displayName += ` (${childName})`;
      }
      const name  = pendingContent[i].type == 'user' || localStorage.getItem('userType') == 'mentee'?pendingContent[i].mentor.firstName + ' ' + pendingContent[i].mentor.lastName
        :displayName;
      const imageUrl = pendingContent[i].type == 'user' || localStorage.getItem('userType') == 'mentee'?pendingContent[i].mentor.profilePicture
        :pendingContent[i].bookedUser.profilePictureUrl;
      const title = pendingContent[i].type == 'user' || localStorage.getItem('userType') == 'mentee'?pendingContent[i].mentor.title
        :'';
      let currentExptime = '';
      if (pendingContent[i].expirationTime) {
        const givenDate = new Date(pendingContent[i].expirationTime);
        const currentDate = new Date();
        const timeDifference = givenDate.getTime() - currentDate.getTime();
        if (timeDifference > 0) { // Ensure it's a future date
          const secondsRemaining = Math.floor(timeDifference / 1000);
          const minutesRemaining = Math.floor(secondsRemaining / 60);
          const hoursRemaining = Math.floor(minutesRemaining / 60);
          const daysRemaining = Math.floor(hoursRemaining / 24);
        
          if (daysRemaining > 0) {
            currentExptime = `${daysRemaining} day(s)`;
          } else if (hoursRemaining > 0) {
            currentExptime = `${hoursRemaining} hour(s)`;
          } else if (minutesRemaining > 0) {
            currentExptime = `${minutesRemaining} minute(s)`;
          } else {
            currentExptime = `${secondsRemaining} second(s)`;
          }
        } else {
          console.log('Expired');
        }
      }
      sessions.push({
        status: 'Session with',
        bookingId:pendingContent[i].id,
        mentorId: pendingContent[i].mentorId,
        name: name,
        isMinor, // add this
        childName,
        parentFullName: pendingContent[i].bookedUser.firstName + ' ' + pendingContent[i].bookedUser.lastName,
        userName:pendingContent[i].mentor?.userName,
        zeroDayBook: pendingContent[i].mentor?.zeroDayBook,
        recurrenceEnds: pendingContent[i].mentor?.recurrenceEnds,
        expirationTime: currentExptime,
        amount: pendingContent[i].amount,
        rescheduleMessage: pendingContent[i].rescheduleMessage,
        sessionTime: pendingContent[i].sessionTime,
        currencyId: pendingContent[i].currencyId,
        canUserResch: pendingContent[i].canUserResch,
        rescheduleRequest: pendingContent[i].rescheduleRequest,
        menteeAccountStatus:pendingContent[i].bookedUser.accountStatus,
        mentorAccountStatus:pendingContent[i].mentor.accountStatus,
        rescheduledBy: pendingContent[i].rescheduledBy?pendingContent[i].rescheduledBy:pendingContent[i].type,
        date: formattedDate(pendingContent[i].date),
        type: pendingContent[i].type,
        time: formatTimeRange(pendingContent[i].fromTime, pendingContent[i].toTime),
        // createdTime : timeAgo(pendingContent[i].createdAt),
        details: {
          mentorName: name,
          mentorImage: imageUrl,
          mentorTitle: title,
          sessionName: 'Session',
          mentorTimezone: pendingContent[i].timeZone,
          interest: 'General mentorship',
          notes: pendingContent[i].meetingAgenda,
          created: formattedDate(pendingContent[i].createdAt),
        }
      });
      

    }
    
  }
  const handleClickOpen = (rescheduledBy,rescheduleMessage,rescheduleRequest,bookingId,id,name,selectedSessionTime,amount,selectedCurrencyId,zeroDayBook,recurrenceEnds) => {
    setRescheduleRequest(rescheduleRequest);
    setRescheduledBy(rescheduledBy);
    setBookingId(bookingId);
    setRescheduleMessage(rescheduleMessage);
    if(selectedSessionTime){
      setSessionTime((selectedSessionTime).toString());
    }
    setSameDayBooking(zeroDayBook);
    setRecurrenceEnds(recurrenceEnds);
    setCurrencyId(selectedCurrencyId);
    setSessionRate(amount);
    setMentorName(name);
    setMentorId(id);
    setRescheduleOpen(true);
  };

  const handleClose = () => {
    setRescheduleOpen(false);
  };
  const handleOpenPopup = (date,time,bookingId,type,name) => {
    setMentorName(name);
    setSelectedDate(date);
    setSelectedTime(time);
    setBookingId(bookingId);
    setStatusType(type);
    setPopupOpen(true);
  };
  const handleAvatarClick = (userName: string) => {
    navigate(`/expert/${userName}`); // Navigate to the user's detailed page
  };
  const handleClosePopup = () => {
    setPopupOpen(false);
  };
  const handleAccept = async(bookingId) =>{
    const updatedData = {
      'status':'accept',
      'updatedBy' : 'mentor',
    };
    const response = await putData(updatedData, `${siteConfig.hodegoUrl}mentor/booking/${bookingId}`);
    if (response) {
      if(response.data.status == true){
        setTriggerStatus('accept');
        setSnackbarOpen(true);
        props.fetchData(1);
      }
      else if(response.data.status == false){
        setErrorMessage(response.data.message);
        setNotificationOpen(true);
      }
    }
  };
  // const handleAcceptReschedule = async() =>{
  //   const updatedData = {
  //     'status':'accept',
  //     'updatedBy' : 'user',
  //   };
  //   const response = await putData(updatedData, `${siteConfig.hodegoUrl}mentor/booking/${bookingId}`);
  //   if (response) {
  //     if(response.data.status == true){
  //       setTriggerStatus('reschedule');
  //       setSnackbarOpen(true);
  //       props.fetchData(1);
  //     }
  //     else if(response.data.status == false){
  //       setErrorMessage(response.data.message);
  //       setNotificationOpen(true);
  //     }
  //   }
  // };

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
        if(type == 'cancel'){
          setTriggerStatus('cancel');
        }
        else{
          setTriggerStatus('decline');
        }
        setSnackbarOpen(true);
        props.fetchData(1);
      }
      else if(response.data.status == false){
        setErrorMessage(response.data.message);
        setNotificationOpen(true);
      }
    }
  };
  const fetchData = async () => {
    const pendingResponse = await getData(`${siteConfig.hodegoUrl}mentor/booking?bookedBy=${localStorage.getItem('userId')}&limit=5&offset=${(currentPage - 1) * 5}&status=pending&userTimeZone=${props.currentTimeZone}`);
    if(pendingResponse){
      if(pendingResponse.data){
        if(pendingResponse.data.total){
          setPendingCount(pendingResponse.data.total);
        }
        if(pendingResponse.data.data.length>0){
          setPendingContent(pendingResponse.data.data);
        }
        else{
          setPendingContent([]);
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
            : triggerStatus == 'decline' ?
              'Declined Successfully!'
              : triggerStatus == 'accept' ?
                'Confirmed Successfully!'
                :
                'Rescheduled Successfully!'
          }
        </Alert>
      </Snackbar>
      <CancelMeetingPopup
        open={isPopupOpen}
        statusType={statusType}
        onClose={handleClosePopup}
        onSubmit={handleSubmit}
        mentorName={mentorName}
        date={selectedDate}
        time={selectedTime}
      />
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
        <BookingCard rescheduledBy={rescheduledBy} accountStatus={'active'} menteeStatus={true} rescheduleMessage={rescheduleMessage} recurrenceEnds={recurrenceEnds} rescheduleRequest={rescheduleRequest} preview={false} type={'manageBooking'} bookingStatus={'0'} onBookSession={onBookSession} bookingId={bookingId} mentorId={mentorId} mentorUserId={0}  mentorName={mentorName} sameDayBooking={sameDayBooking} mentorSessions={[{'time': sessionTime, 'rate': sessionRate, 'discount': '0'} ]} currencyId={currencyId} />
      </Dialog>
      <Grid container spacing={2} sx={{width:'80%'}} className='pendingCard'>
        {sessions.length>0 ?
          sessions.map((session, index) => (
            <Grid item xs={12} key={index}>
              <Card
                variant="outlined"   sx={{
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
                          } */}
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
                      <Typography variant="body2" sx={{ fontWeight: 'bold',fontSize:'16px' }}>{session.type == 'mentor'?'User:':'Expert:'}</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {session.type == 'user'?
                          <Avatar alt={session.details.mentorName} src={session.details.mentorImage}  onClick={() => handleAvatarClick(session.userName)} sx={{ mr: 2,width:'100px',height:'100px' }} />
                          :
                          <Avatar alt={session.details.mentorName} src={session.details.mentorImage} sx={{ mr: 2,width:'100px',height:'100px' }} />
                        }
                        <Box>
                          <Typography sx={{fontSize:'18px',color:'#333'}}>
                            {/* {session.details.mentorName} */}
                            {session.type === 'user'
                              ? session.details.mentorName // mentee side should see the mentor name
                              : session.isMinor && session.childName
                                ? session.childName
                                : session.details.mentorName}

                          </Typography>
                          {session.details.mentorTitle?
                            <Typography sx={{fontSize:'18px',color:'#333'}} variant="body2">{session.details.mentorTitle}</Typography>
                            :''
                          }
                          
                        </Box>
                      </Box>
                      {/* <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>Session Name</Typography>
                      <Typography variant="body2">{session.details.sessionName}</Typography> */}
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2,fontSize:'16px' }}><DepartureBoardTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> {session.type == 'mentor'?'User':'Expert'} Timezone:</Typography>
                      <Typography variant="body2" sx={{fontSize:'16px',color:'#333'}}>{session.details.mentorTimezone}</Typography>
                      {/* <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>I am interested in</Typography>
                      <Typography variant="body2">{session.details.interest}</Typography> */}
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2,fontSize:'16px' }}><EventNoteTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> Session Agenda:</Typography>
                      <Typography variant="body2" sx={{fontSize:'16px',color:'#333'}}>{session.details.notes}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2,fontSize:'16px' }}><AddBusinessTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> Created:</Typography>
                      <Typography variant="body2" sx={{fontSize:'16px',color:'#333'}}>{session.details.created}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2,fontSize:'16px' }}><AddBusinessTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> Booking Id:</Typography>
                      <Typography variant="body2" sx={{fontSize:'16px',color:'#333'}}>#{session.bookingId}</Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                <CardActions>
                  {session.type == 'mentor' ?
                    <Box sx={{marginLeft:'1%'}}>
                      {session.rescheduleMessage && session.rescheduleMessage.trim() !== '' && session.rescheduledBy == 'user' &&(
                        <Typography sx={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2,fontSize:'16px',color:'#0C6697' }}>Reschedule Request – Reason:</Typography> 
                          <Typography sx={{marginTop:'2%',marginBottom:'2%'}}>{session.rescheduleMessage}</Typography>
                        </Typography>
                      )}
                      <Box display="flex" justifyContent="flex-start" gap={2} width="100%" sx={{marginLeft:'1%'}}>
                        {session.rescheduleRequest == 1 && session.rescheduledBy == 'mentor' ?
                          <>
                            <Button variant="outlined" disabled sx={{ borderColor: 'red', height: '44px' }}>Reschedule Requested</Button>
                            <Button variant="outlined" onClick={() => handleOpenPopup(session.date, session.time, session.bookingId, 'cancel', session.details.mentorName)} sx={{ height: '44px', borderColor: 'red', color: 'red' }}>Cancel</Button>
                          </>
                          :
                          <>
                            {(session.menteeAccountStatus == 'active' || session.menteeAccountStatus == 'suspended') && (session.mentorAccountStatus == 'active' || session.mentorAccountStatus == 'suspended')  ?
                              <Button variant="outlined"  onClick={() =>handleAccept(session.bookingId)} sx={{
                                height:'44px',
                                background: 'linear-gradient(90deg, #0C6697, #73A870)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(90deg, #0C6697, #73A870)',
                                },
                              }} >Accept</Button>
                              :''}
                            <Button variant="outlined" onClick={()=>handleOpenPopup(session.date,session.time,session.bookingId,'decline', session.details.mentorName)} sx={{ borderColor: 'red', height:'44px',color: 'red' }}>Decline</Button>
                          </>
                        }
                      
                      </Box>
                    </Box>
                    :
                    <Box display="flex" justifyContent="flex-start" gap={2} width="100%" sx={{marginLeft:'1%'}}>
                      {/* {session.canUserResch == 1 && session.menteeAccountStatus == 'active' && session.mentorAccountStatus == 'active'  ?
                        <Button onClick={() => handleClickOpen(session.rescheduleRequest,session.bookingId,session.mentorId,session.details.mentorName,session.sessionTime,session.amount,session.currencyId,session.zeroDayBook)} variant="outlined"  sx={{
                          background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          color: 'white',
                          height:'44px',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                          },
                        }} >Reschedule</Button>
                        :''} */}
                      {(session.menteeAccountStatus == 'active' || session.menteeAccountStatus == 'suspended') && (session.mentorAccountStatus == 'active' || session.mentorAccountStatus == 'suspended')   ? (
                        <Box sx={{width:'100%'}}>
                          
                          {session.rescheduleMessage && session.rescheduleMessage.trim() !== '' && session.rescheduledBy != 'user' &&(
                            <Typography sx={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2,fontSize:'16px',color:'#0C6697' }}>Reschedule Request from Expert:</Typography> 
                              <Typography sx={{marginTop:'2%',marginBottom:'2%'}}>{session.rescheduleMessage}</Typography>
                            </Typography>
                          )}
    
                          <Button onClick={() => handleClickOpen(session.rescheduledBy,session.rescheduleMessage,session.rescheduleRequest,session.bookingId,session.mentorId,session.details.mentorName,session.sessionTime,session.amount,session.currencyId,session.zeroDayBook,session.recurrenceEnds)}
                            variant="outlined"  
                            sx={{
                              background: 'linear-gradient(90deg, #0C6697, #73A870)',
                              color: 'white',
                              height: '44px',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #0C6697, #73A870)',
                              },
                            }} 
                          >
                        Reschedule
                          </Button>
                          {/* {session.rescheduleRequest == 1 && session.rescheduledBy == 'mentor' ?
                        ''
                        : */}
                          <Button variant="outlined" onClick={()=>handleOpenPopup(session.date,session.time,session.bookingId,'cancel',session.details.mentorName)} sx={{ height:'44px',borderColor: 'red', color: 'red',marginLeft:'2%' }}>Cancel</Button>
                          {/* } */}
                        </Box>
                      ) : 
                        <Button variant="outlined" onClick={()=>handleOpenPopup(session.date,session.time,session.bookingId,'cancel',session.details.mentorName)} sx={{ height:'44px',borderColor: 'red', color: 'red' }}>Cancel</Button>
                      }
                      
                      
                    </Box>
                  }
                  
                </CardActions>
                <Box display="flex" alignItems="center" mt={1} sx={{marginLeft:'1%'}}>
                  <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                  {session.rescheduleRequest == 1 && session.rescheduledBy == 'mentor' ?
                    <Typography variant="body2" color="textSecondary" sx={{ margin: '10px 0' }}>
                      {session.type == 'mentor'?
                        <>Your request to reschedule will <span style={{ color: 'red' }}>expire in {session.expirationTime}</span></>
                        :
                        <>Your Reschedule option will <span style={{ color: 'red' }}>expire in {session.expirationTime}</span>, please reschedule.</>
                      }
                    
                    </Typography>
                    :
                    <Typography variant="body2" color="textSecondary" sx={{ margin: '10px 0' }}>
                      {session.type == 'mentor' ?'User':'Your'} booking request will <span style={{ color: 'red' }}>expire in {session.expirationTime}</span> if not accepted or declined.
                    </Typography>

                  }
                  
                </Box>
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
            <Box>No Pending Bookings</Box>
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
      <Box className='pendingCardPagination' sx={{width:'80%'}} justifyContent="center" mt={2}>
        {pendingCount > 0 ? <Pagination currentPage={currentPage} pendingCount={Math.ceil(pendingCount / 5)} onPageChange={handlePageChange} /> : ''}
      </Box>
    </Box>
  );
}