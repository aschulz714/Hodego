import React, { useState, useEffect } from 'react';
import { Box,Typography } from '@mui/material';
import HodegoVideoCallPreview from './HodegoVideoCallPreview';
import AgoraVideoCall from './AgoraVideoCall';
import queryString from 'query-string';
import UnauthorizedIcon from '../../assets/images/unauthorized.png';
import VideoCallIcon from '../../assets/images/video-call.png';
import { putData } from '../../theme/Axios/apiService';
import CircularProgress from '@mui/material/CircularProgress';
import HodegoFavicon from '../../assets/images/hodegoFavicon.png';
import siteConfig from '../../theme/site.config';
import './AgoraVideoCall.css';
import { useNavigate,useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth0 } from '@auth0/auth0-react';

const HodegoJoin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queries = queryString.parse(location.search); 
  const meetingId = queries.id ? String(queries.id) : ''; 
  const userId = localStorage.getItem('userId');
  const [joinedStatus, setJoinedStatus] = useState('');
  const [joinedErrorStatus, setJoinedErrorStatus] = useState('');
  const [muteAudio, setMuteAudio] = useState(false); // Preserve audio state
  const [muteVideo, setMuteVideo] = useState(false); // Preserve video state
  const [blurOn, setBlurOn] = useState(false);
  const [token, setToken] = useState('');
  const [chatToken,setChatToken] = useState('');
  const [mentorProfilePicture,setMentorProfilePicture] = useState('');
  const [mentorName,setMentorName] = useState('');
  const [meetingAgenda,setMeetingAgenda] = useState('');
  const [meetUserType,setMeetUserType] = useState('');
  const [date,setDate] = useState('');
  const [toDate,setToDate] = useState('');
  const [menteeName,setMenteeName] = useState('');
  const [time,setTime] = useState('');
  const [bookingId,setBookingId] = useState(0);
  const [sessionTime, setSessionTime] = useState('');
  const [statusMessage, setStatusMessage] = useState(''); 
  const [mentorId, setmentorId] = useState<number | null>(null); // Initial state is number or null
  const [localUser, setLocalUser] = useState<{ firstName: string; lastName: string; profilePictureUrl: string; role: string; userId: number; } | null>(null);
  const [remoteUser, setRemoteUser] = useState<{ firstName: string; lastName: string; profilePictureUrl: string; role: string; userId: number; } | null>(null);
  const {loginWithRedirect} = useAuth0();
  const navigate = useNavigate();
  useEffect(() => {
    if(searchParams.has('source') && localStorage.getItem('hodego_access_token') == null){
      sessionStorage.setItem('source',searchParams.get('source'));
      localStorage.setItem('tempUrl',window.location.pathname + window.location.search);
      loginWithRedirect();
    }
    if(searchParams.has('source')){
      removeSpecificQueryParam('source');
    }
    const initPreview = async () => {
      try {
      // Retrieve userId from local storage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found in local storage');
        }
   
        // Convert userId to a number
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) {
          throw new Error('User ID is not a valid number');
        }
   
        // Prepare the form data for the API call
        const formData = {
          userId: numericUserId, // Pass the numeric userId
          meetingId: meetingId, // Passed from props
        };
        // API call
        const response = await putData(formData, `${siteConfig.hodegoUrl}meeting/join`);
      
        if (response && response.data) {
          if(response.data.status == true){
            setJoinedStatus('hodegoPreview');
            setToken(response.data.localUser.meetingToken); 
            setChatToken(response.data.localUser.chatToken); 
            setMeetingAgenda(response.data.meetingAgenda);
            setBookingId(response.data.bookingId);
            setMeetUserType(response.data.localUser.role);
            const fromTime = dayjs(response.data.fromTime).format('h:mm A');
            const toTime = dayjs(response.data.toTime).format('h:mm A');
            setToDate(response.data.toTime);
            setTime(`${fromTime} - ${toTime}`);
            setSessionTime(response.data.sessionTime);
            setDate(formattedDate(response.data.date));
            if(response.data.remoteUser.role == 'mentor'){
              setmentorId(Number(response.data.remoteUser.mentorId)); 
              setMentorProfilePicture(response.data.remoteUser.profilePictureUrl);
              setMentorName(response.data.remoteUser.firstName + ' ' + response.data.remoteUser.lastName);
            }
            else{
              setmentorId(Number(response.data.localUser.mentorId));
              setMentorProfilePicture(response.data.remoteUser.profilePictureUrl);
              setMentorName(response.data.remoteUser.firstName + ' ' + response.data.remoteUser.lastName); 
            }
            if(response.data.localUser.role == 'user'){
              setMenteeName(response.data.localUser.firstName + ' ' + response.data.localUser.lastName);
            }
            else{
              setMenteeName(response.data.localUser.firstName + ' ' + response.data.localUser.lastName); 
            }
            setLocalUser({
              firstName: response.data.localUser.firstName,
              lastName: response.data.localUser.lastName,
              profilePictureUrl: response.data.localUser.profilePictureUrl,
              role: response.data.localUser.role,
              userId: response.data.localUser.userId
            });
            setRemoteUser({
              firstName: response.data.remoteUser.firstName,
              lastName: response.data.remoteUser.lastName,
              profilePictureUrl: response.data.remoteUser.profilePictureUrl,
              role: response.data.remoteUser.role,
              userId: response.data.remoteUser.userId
            });
          }
          else if(response.data.status == false){
            if(response.data.message == 'Not Allowed'){
              setJoinedStatus('unauthorized');
            }
            else{
              setJoinedStatus('warning');
              setJoinedErrorStatus(response.data.message);
            }
            
          }
          else{
            setJoinedStatus('');
          }
          // Hide loader
         
          // seVerficationStatus(response.data.status);
        }
      } catch (error) {
        console.error('Failed to initialize video call preview:', error);
        setStatusMessage('Error initializing preview');
      }
    };
    initPreview();
  }, [meetingId,userId,mentorId]);
  const removeSpecificQueryParam = (paramName) => {
    const currentParams = queryString.parse(location.search);
    delete currentParams[paramName];
    const newSearchString = queryString.stringify(currentParams);
    navigate({ pathname: location.pathname, search: newSearchString });
  };
  const handleJoin = (audioMuted: boolean, videoMuted: boolean, blurOn: boolean) => {
    setMuteAudio(audioMuted);  // Pass mute audio state from preview
    setMuteVideo(videoMuted);  // Pass mute video state from preview
    setBlurOn(blurOn); // Pass blur state from preview
    setJoinedStatus('hodegoVideoCall');           // Switch to the Agora video call
  };
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
  return (
    <Box className={joinedStatus == '' || joinedStatus == 'unauthorized' || joinedStatus == 'warning'  ? 'hodegoPreloadStatus': ''} sx={{ height: '100vh',background: joinedStatus == 'unauthorized' || joinedStatus == 'warning'?'#0C6697':'#fff' }}>
      {statusMessage && (
        <Typography
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centering the message
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 1,
            fontSize: '24px', 
          }}
        >
          {statusMessage}
        </Typography>
      )}
      {joinedStatus === ''?(
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // height: '100vh',
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
      ):
        joinedStatus == 'unauthorized'? (
          <Box sx={{textAlign:'center'}}><img src={UnauthorizedIcon} style={{ width: '64px', height: '64px' }} />
            <Typography variant="h6" sx={{ marginBottom: '16px', textAlign: 'center',color: '#fff' }}>You are not authorized to join the call</Typography>
          </Box>
        ):
          joinedStatus == 'warning'? (
            <Box sx={{textAlign:'center'}}><img src={VideoCallIcon} style={{ width: '64px', height: '64px' }} />
              <Typography variant="h6" sx={{ marginBottom: '16px', textAlign: 'center',color: '#fff' }}>{joinedErrorStatus}</Typography>
            </Box>
          ):joinedStatus == 'hodegoPreview' ? (
            <HodegoVideoCallPreview 
              onJoin={handleJoin} 
              initialMuteAudio={muteAudio} 
              initialMuteVideo={muteVideo} 
              initialBlurOn={blurOn} 
              localUser={localUser}
              remoteUser={remoteUser}
            />
          ) : (
            <AgoraVideoCall 
              initialMuteAudio={muteAudio} 
              initialMuteVideo={muteVideo} 
              initialBlurOn={blurOn}
              localUser={localUser} // Pass the local user data
              remoteUser={remoteUser} // Pass the remote user data   // Pass the username to AgoraVideoCall
              token={token}
              chatToken={chatToken}
              meetingId={meetingId}
              userId={userId}
              mentorId={mentorId}
              mentorProfilePicture={mentorProfilePicture}
              toDate = {toDate}
              mentorName={mentorName}  // Pass the mentor name to AgoraVideoCall
              meetingAgenda={meetingAgenda}
              meetUserType={meetUserType}
              date={date}  // Pass the meeting date to AgoraVideoCall 
              menteeName={menteeName}  // Pass the mentee name to AgoraVideoCall  
              time={time}  // Pass the meeting time to AgoraVideoCall 
              sessionTime={sessionTime}  // Pass the meeting session time to AgoraVideoCall  
              bookingId={bookingId}  // Pass the bookingId to AgoraVideoCall
            />
          )}
    </Box>
  );
};

export default HodegoJoin;