import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import siteConfig from '../../../../theme/site.config';
import { getData } from '../../../../theme/Axios/apiService';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import hodegoEmptyIcon from '../../../../assets/images/empty.png';
import DepartureBoardTwoToneIcon from '@mui/icons-material/DepartureBoardTwoTone';
import AddBusinessTwoToneIcon from '@mui/icons-material/AddBusinessTwoTone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventNoteTwoToneIcon from '@mui/icons-material/EventNoteTwoTone';

const Pagination = ({ currentPage, historyCount, onPageChange }) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < historyCount) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= historyCount; i++) {
    if (i === 1 || i === historyCount || i === currentPage || i === currentPage + 1 || i === currentPage - 1) {
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
      <IconButton onClick={handleNextPage} disabled={currentPage === historyCount}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};
export default function HistoryContent(props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [historyCount, setHistoryCount] = useState(props.historyCount);
  const [historyContent, setHistoryContent] = useState(props.historyContent);
  const sessions = [];
  const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, [currentPage,props.currentTimeZone]);
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
  if(historyContent.length > 0) {
    for(let i=0;i<historyContent.length;i++) {
      const tempStatus = historyContent[i].status;
      let statusContent = '';
      if(tempStatus == 'cancelled'){
        statusContent = 'Cancelled session with';
      }
      else if(tempStatus == 'declined'){
        statusContent = 'Declined session with';
      }else if(tempStatus == 'expired'){
        statusContent = 'Expired session request with';
      }
      else if(tempStatus == 'pending'){
        statusContent = 'Pending session request with';
      }
      else if(tempStatus == 'noShow'){
        statusContent = 'No show session with';
      }
      else{
        statusContent = 'Session with';
      }
      const isMinor = historyContent[i].bookedUser.ageStatus === 'minor';
      const childName = historyContent[i].bookedUser.childFirstName?.trim();
      const parentFullName = historyContent[i].bookedUser.firstName + ' ' + historyContent[i].bookedUser.lastName;

      const name = historyContent[i].type === 'mentor'
        ? (isMinor && childName ? childName : parentFullName)
        : historyContent[i].mentor.firstName + ' ' + historyContent[i].mentor.lastName;
      sessions.push({
        status: statusContent,
        // name: historyContent[i].type == 'mentor'?historyContent[i].bookedUser.firstName + ' ' + historyContent[i].bookedUser.lastName:historyContent[i].mentor.firstName + ' ' + historyContent[i].mentor.lastName,
        isMinor,
        childName,
        parentFullName,
        name,
        type: historyContent[i].type,
        bookingId:historyContent[i].id,
        userName:historyContent[i].mentor.userName,
        date: formattedDate(historyContent[i].date),
        time: formatTimeRange(historyContent[i].fromTime,historyContent[i].toTime),
        statusColor: tempStatus == 'cancelled' || tempStatus == 'declined' || tempStatus == 'noShow'?'#D50000': tempStatus == 'pending'|| tempStatus == 'expired'?'#a7a3a3':'#73A870',
        details: {
          mentorName: historyContent[i].type == 'mentor'?historyContent[i].bookedUser.firstName + ' ' + historyContent[i].bookedUser.lastName:historyContent[i].mentor.firstName + ' ' + historyContent[i].mentor.lastName,
          mentorImage: historyContent[i].type == 'mentor'?historyContent[i].bookedUser.profilePictureUrl:historyContent[i].mentor.profilePicture,
          mentorTitle: historyContent[i].type == 'mentor'?'':historyContent[i].mentor.title,
          sessionName: 'Session',
          mentorTimezone: historyContent[i].timeZone,
          interest: 'General mentorship',
          notes: historyContent[i].meetingAgenda,
          status:historyContent[i].status,
          statusNote:historyContent[i].statusNote,
          created: formattedDate(historyContent[i].createdAt),
        }
      });
    }
  }
  const fetchData = async () => {
    const historyResponse = await getData(`${siteConfig.hodegoUrl}mentor/booking?bookedBy=${localStorage.getItem('userId')}&limit=5&offset=${(currentPage - 1) * 5}&status=history&userTimeZone=${props.currentTimeZone}`);
    if(historyResponse){
      if(historyResponse.data){
        if(historyResponse.data.total){
          setHistoryCount(historyResponse.data.total);
        }
        if(historyResponse.data.data.length>0){
          setHistoryContent(historyResponse.data.data);
        }
        else{
          setHistoryContent([]);
        }
      }
    }
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleAvatarClick = (userName: string) => {
    navigate(`/expert/${userName}`); // Navigate to the user's detailed page
  };
  return (
    <Box>
      <Grid container spacing={2} className='historyCard'>
        {sessions.length>0 ? 
          sessions.map((session, index) => (
            <Grid item xs={12} key={index}>
              <Card
                variant="outlined"
                sx={{
                  borderLeft: `4px solid ${session.statusColor}`,
                  borderTop: session.isMinor ? '2px solid pink' : '',
                  borderRight: session.isMinor ? '2px solid pink' : '',
                  borderBottom: session.isMinor ? '2px solid pink' : '',
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
                      <Box>
                        
                        <Typography  sx={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: session.statusColor,
                          whiteSpace: 'nowrap',
                          // overflow: 'hidden',
                          // textOverflow: 'ellipsis',
                          display: 'block',
                          maxWidth: '100%', // Optional: constrain to parent container
                        }}>
                          {session.status} 
                          {/* <span style={{ color: '#73A870' }}>{session.name}</span> */}
                          {/* {session.isMinor && session.childName
                            ? <><span style={{ color: '#73A870',marginLeft:'1.5%' }}>{session.childName}</span></>
                            : <><span style={{ color: '#73A870',marginLeft:'1.5%' }}>{session.name}</span></>
                          }  */}
                          <span style={{ color: '#73A870', marginLeft: '1.5%' }}>
                            {session.type === 'mentor' && session.isMinor && session.childName
                              ? session.childName
                              : session.name}
                          </span>
                          {session.type === 'mentor' && session.isMinor && session.childName && (
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
                              verticalAlign:'text-top'
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
                     
                        <Box display="flex" alignItems="center" mt={1}>
                          <CalendarTodayIcon fontSize="medium" sx={{ mr: 1 }} />
                          <Typography variant="body2" sx={{fontSize:'16px',marginTop:'4px'}}>{session.date}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mt={1}>
                          <AccessTimeIcon fontSize="medium" sx={{ mr: 1 }} />
                          <Typography variant="body2" sx={{fontSize:'16px',marginTop:'4px'}}>{session.time}</Typography>
                        </Box>
                      </Box>
                      <Typography>Details</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{session.type == 'mentor'?'User':'Expert'}:</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {session.type == 'user'?
                          <Avatar alt={session.details.mentorName} src={session.details.mentorImage}  onClick={() => handleAvatarClick(session.userName)} sx={{ mr: 2,width:'100px',height:'100px' }} />
                          :
                          <Avatar alt={session.details.mentorName} src={session.details.mentorImage} sx={{ mr: 2,width:'100px',height:'100px' }} />
                        }
                        <Box>
                          <Typography sx={{fontSize:'18px',color:'#333'}}>
                            {/* {session.details.mentorName} */}
                            {/* {session.isMinor && session.childName
                              ? session.childName
                              : session.details.mentorName} */}
                            {session.type === 'user'
                              ? session.details.mentorName // mentee side should see the mentor name
                              : session.isMinor && session.childName
                                ? session.childName
                                : session.details.mentorName}

                          </Typography>
                          
                          {session.type == 'mentor'? '':
                            <Typography sx={{fontSize:'18px',color:'#333'}}variant="body2">{session.details.mentorTitle}</Typography>
                          }
                        </Box>
                        {session.type == 'user'?
                          <Box sx={{marginLeft:'2%'}}>
                            <Button variant="outlined" 
                              href={`/expert/${session.userName}`}
                              sx={{
                                height:'44px',
                                background: 'linear-gradient(90deg, #0C6697, #73A870)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(90deg, #0C6697, #73A870)',
                                },
                              }} >Rebook</Button>
                          </Box>
                          :
                          ''}
                      </Box>
                      {/* <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>Session Name</Typography>
                    <Typography variant="body2">{session.details.sessionName}</Typography> */}
                      <Typography variant="body2" sx={{ fontSize:'16px',fontWeight: 'bold', mt: 2 }}><DepartureBoardTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> {session.type == 'mentor'?'User':'Expert'} Timezone:</Typography>
                      <Typography variant="body2" sx={{fontSize:'16px',color:'#333'}}>{session.details.mentorTimezone}</Typography>
                      {/* <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>I am interested in</Typography>
                    <Typography variant="body2">{session.details.interest}</Typography> */}
                      <Typography variant="body2" sx={{ fontSize:'16px',fontWeight: 'bold', mt: 2 }}><EventNoteTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> Session Agenda:</Typography>
                      <Typography variant="body2" sx={{fontSize:'16px',color:'#333'}}>{session.details.notes}</Typography>
                      {session.details.status == 'declined'?
                        <><Typography variant="body2" sx={{ fontSize: '16px', fontWeight: 'bold', mt: 2 }}><EventNoteTwoToneIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} /> Declined Reason:</Typography><Typography variant="body2" sx={{ fontSize: '16px', color: '#333' }}>{session.details.statusNote}</Typography></>
                        :session.details.status == 'cancelled'?
                          <><Typography variant="body2" sx={{ fontSize: '16px', fontWeight: 'bold', mt: 2 }}><EventNoteTwoToneIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} /> Cancelled Reason:</Typography><Typography variant="body2" sx={{ fontSize: '16px', color: '#333' }}>{session.details.statusNote}</Typography></>
                          :''
                      }
                      <Typography variant="body2" sx={{ fontSize:'16px',fontWeight: 'bold', mt: 2 }}><AddBusinessTwoToneIcon fontSize="medium" sx={{ verticalAlign:'middle' }} /> Created:</Typography>
                      <Typography variant="body2" sx={{fontSize:'16px',color:'#333'}}>{session.details.created}</Typography>
                      <Typography variant="body2" sx={{ fontSize:'16px',fontWeight: 'bold', mt: 2 }}>Booking Id:</Typography>
                      <Typography variant="body2" sx={{fontSize:'16px',color:'#333'}}>#{session.bookingId}</Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
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
            <Box>No Bookings</Box>
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
      <Box display="flex" justifyContent="center" className="historyCardPagination" mt={2}>
        {historyCount > 0 ? <Pagination currentPage={currentPage} historyCount={Math.ceil(historyCount / 5)} onPageChange={handlePageChange} /> : ''}
      </Box>
    </Box>
  );
}

