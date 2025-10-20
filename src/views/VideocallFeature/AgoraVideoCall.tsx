import React, { useEffect, useState, useRef } from 'react';
import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack, ILocalAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack,ScreenVideoTrackInitConfig } from 'agora-rtc-sdk-ng';
import { Box, IconButton, Typography, Tooltip, Avatar, Drawer,Snackbar } from '@mui/material';
import VirtualBackgroundExtension from 'agora-extension-virtual-background';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import BlurOnTwoToneIcon from '@mui/icons-material/BlurOnTwoTone';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import CircularProgress from '@mui/material/CircularProgress';
import HodegoFavicon from '../../assets/images/hodegoFavicon.png';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import TimerIcon from '@mui/icons-material/Timer';
import CloseIcon from '@mui/icons-material/Close';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import InfoIcon from '@mui/icons-material/Info';
import CameraswitchOutlinedIcon from '@mui/icons-material/CameraswitchOutlined';
import siteConfig from '../../theme/site.config';
import { getData,putData } from '../../theme/Axios/apiService';
import './AgoraVideoCall.css';
import { useNavigate } from 'react-router-dom';
import  HodegoConnectTone  from '../../tone/hodegocall-sounds.mp3';
import HodegoInCallChat from './HodegoInCallChat';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import Badge from '@mui/material/Badge';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';


// import AgoraRTM from 'agora-rtm-sdk';
// const { RTM } = AgoraRTM;

// const TextChat = ({ appId, meetingId,userId,token } ) => {
//   const [rtmClient, setRtmClient] = useState<InstanceType<typeof RTM> | null>(null);
//   const [messages, setMessages] = useState<Array<{ user: string; message: string }>>([]);
//   const [inputValue, setInputValue] = useState<string>('');
//   const displayRef = useRef<HTMLDivElement>(null);

// useEffect(() => {
//   const initRTM = async () => {
//     const rtm = new RTM(appId, userId);
//     setRtmClient(rtm);

//     rtm.addEventListener('message', event => {
//       setMessages(prev => [...prev, { user: event.publisher, message: typeof event.message === 'string' ? event.message : new TextDecoder().decode(event.message) }]);
//     });

//     rtm.addEventListener('presence', event => {
//       const info =
//         event.eventType === 'SNAPSHOT'
//           ? 'I Join'
//           : `${event.publisher} is ${event.eventType}`;
//       setMessages(prev => [...prev, { user: 'INFO', message: info }]);
//     });

//     rtm.addEventListener('status', event => {
//       setMessages(prev => [...prev, { user: 'INFO', message: JSON.stringify(event) }]);
//     });

//     await rtm.login({ token: token });
//     await rtm.subscribe(meetingId);
//   };

//   initRTM();
// }, []);

// useEffect(() => {
//   if (displayRef.current) {
//     displayRef.current.scrollTop = displayRef.current.scrollHeight;
//   }
// }, [messages]);

// const sendMessage = async () => {
//   if (!rtmClient || !inputValue.trim()) return;
//   const payload = JSON.stringify({ type: 'text', message: inputValue });
//   await rtmClient.publish(meetingId, payload, { channelType: 'MESSAGE' });
//   setMessages(prev => [...prev, { user: userId, message: payload }]);
//   setInputValue('');
// };

//   return (
//     <div style={{ width: 800, margin: '0 auto', padding: 20 }}>
//       <h1>Hello RTM!</h1>
//       <div
//         ref={displayRef}
//         style={{
//           width: '100%',
//           height: 300,
//           border: '1px solid #b0b0b0',
//           marginBottom: 20,
//           overflow: 'auto',
//           textAlign: 'left',
//           padding: 10,
//           boxSizing: 'border-box',
//         }}
//       >
//         {messages.map((msg, idx) => (
//           <div key={idx}>
//             <strong>{msg.user}:</strong> {msg.message}
//           </div>
//         ))}
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center' }}>
//         <input
//           type="text"
//           value={inputValue}
//           onChange={e => setInputValue(e.target.value)}
//           placeholder="Enter text"
//           style={{ width: 'calc(100% - 100px)', padding: 5, marginRight: 10 }}
//         />
//         <button style={{ width: 90, padding: 5 }} onClick={sendMessage}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

const NetworkBar: React.FC<{ level: number }> = ({ level }) => {
  // Inverted color mapping:
  // High levels → red; mid → orange; low → green
  const getColor = (lvl: number) => {
    if (lvl >= 4) return '#f44336';  // Poor
    if (lvl === 2 || lvl === 3) return '#ff9800'; // Okay
    if (lvl === 1) return '#4caf50';  // Good
    return '#9e9e9e';                // Unknown
  };

  const fillCount = 6 - level; // 5,4,3,2,1

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: '8px' }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < fillCount;

        return (
          <div
            key={i}
            style={{
              width: 4,
              height: (i + 1) * 4,
              marginRight: 2,
              background: filled ? getColor(level) : '#ddd',
              transition: 'background 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
};



// const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const AgoraVideoCall: React.FC<{ initialBlurOn: boolean, initialMuteAudio: boolean, initialMuteVideo: boolean,  localUser: { firstName: string, lastName: string;profilePictureUrl: string;role: string; userId: number; },remoteUser: { firstName: string, lastName: string;profilePictureUrl: string;role: string; userId: number; },token: string,chatToken: string,meetingId: string,userId:string,mentorId:number,mentorProfilePicture:string,mentorName:string,meetingAgenda:string,meetUserType:string,date:string,toDate:string,menteeName:string,time:string,sessionTime:string,bookingId:number }> = ({initialBlurOn,initialMuteAudio,initialMuteVideo, localUser, remoteUser, token,chatToken, meetingId,userId,mentorId,mentorProfilePicture,mentorName,meetingAgenda,meetUserType,date,toDate,menteeName,time,sessionTime,bookingId }) => {
  const [muteAudio, setMuteAudio] = useState(initialMuteAudio);
  const [muteVideo, setMuteVideo] = useState(initialMuteVideo);
  const [blurOn, setBlurOn] = useState(initialBlurOn);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [joinedStatus, setJoinedStatus] = useState(true);
  const [fullScreenOn, setFullScreenOn] = useState(false);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localTracks, setLocalTracks] = useState<[ILocalAudioTrack, ILocalVideoTrack] | []>([]);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [meetingInfoOpen, setMeetingInfoOpen] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const navigate = useNavigate();
  // const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Seconds left in session
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false); // For snackbar alert
  const [isSnackbarOpenEnd, setIsSnackbarOpenEnd] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false); // Track if the session has ended
  const shouldPlaySoundRef = useRef(true);
  const [mentorJoined, setMentorJoined] = useState(false);
  const [joineeDetails, setJoineeDetails] = useState([]);
  const [connectionDetails, setConnectionDetails] = useState([]);
  const [userLeftMessage, setUserLeftMessage] = useState<string | null>(null);
  const [currentCameraFacing, setCurrentCameraFacing] = useState<'user' | 'environment'>('user'); // Track front or back camera
  // const [userNames, setUserNames] = useState<{ [uid: string]: string }>({});
  const [remoteMuteAudio, setRemoteMuteAudio] = useState(false); // State to track remote user's mute status
  // const [localMuteAudio, setLocalMuteAudio] = useState(muteAudio); // State to track local user's mute status
  const processorRef = useRef<any>(null); // Holds the processor instance
  const isProcessorInitializedRef = useRef(false); // Tracks initialization state
  const [localNetworkQuality, setLocalNetworkQuality] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatNotification, setChatNotification] = useState<{ message: string; user: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatNotificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

 
  // const tempTime = 0;
  const joinSound = new Audio(HodegoConnectTone);
  const leaveSound = new Audio(HodegoConnectTone);
  const isMobile = /iPhone|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes('iPad') ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document));
  console.log('isMobile',isMobile);
  const screenTrackConfig: ScreenVideoTrackInitConfig = {
    encoderConfig: { width: 1280,
      height: 720,
      frameRate: 30,
      bitrateMin: 1200,
      bitrateMax: 2500 },

    screenSourceType: 'screen'
  };

   
  // const toggleChatDrawer = () => {
  //   setChatOpen(prev => !prev);
  // };
  // const toggleChatDrawer = () => {
  //   const newOpen = !chatOpen;
  //   setChatOpen(newOpen);

  //   if (newOpen) {
  //     setUnreadCount(0);
  //   }
  // };

  // const toggleChatDrawer = () => {
  //   const newOpen = !chatOpen;
  //   setChatOpen(newOpen);

  //   if (newOpen) {
  //     setUnreadCount(0);
  //     setChatNotification(null);

  //     // Clear the notification timeout if it exists
  //     if (chatNotificationTimeoutRef.current) {
  //       clearTimeout(chatNotificationTimeoutRef.current);
  //       chatNotificationTimeoutRef.current = null;
  //     }
  //   }
  // };
  const toggleChatDrawer = () => {
    const newOpen = !chatOpen;
    setChatOpen(newOpen);

    if (newOpen) {
      setUnreadCount(0);           // Reset count
      setChatNotification(null);   // Clear preview
      if (chatNotificationTimeoutRef.current) {
        clearTimeout(chatNotificationTimeoutRef.current);
      }
    }
  };

  // Convert sessionTime (e.g., "30 mins") to seconds
  // const sessionDurationInSeconds = parseInt(sessionTime) * 60;

  const updateTimerToDb = async (time) =>{
    if(localUser.role == 'mentor'){
      const formData = {
        'setup': 'connection',
        'data': [{
          'role': 'mentor',
          'userId': localStorage.getItem('userId'),
          'timeLeft': time,
          'joinStatus': 'end'
        }],
        'bookingId': bookingId
      };
      const response = await putData(formData, `${siteConfig.hodegoUrl}meeting`);
      console.log(response);
    }
  };

  useEffect(() => {
    if(localUser.role == 'mentor'){
      const getTimerLeft = localStorage.getItem('timerLeft');
      if(getTimerLeft && localStorage.getItem('bookingId') == bookingId.toString()) {
        updateTimerToDb(parseInt(getTimerLeft));
      }
      const sessionDurationInSeconds = getTimerLeft && localStorage.getItem('bookingId') == bookingId.toString()?parseInt(getTimerLeft):timeLeft == 0?parseInt(sessionTime) * 60:timeLeft;
      setTimeLeft(sessionDurationInSeconds);
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      // }
      return () => clearInterval(timer);
    }
  }, []);
  useEffect(() => {
    if(localUser.role == 'mentor'){
      localStorage.setItem('timerLeft',timeLeft.toString());
      localStorage.setItem('bookingId',bookingId.toString());
    }
  },[timeLeft]);

  // const handlePause = () => setIsPaused(true);

  // const handleResume = () => setIsPaused(false);

  const initAgora = async () => {
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264'});
    setClient(agoraClient);
    agoraClient.on('user-joined', (user) => {
      console.log('User joined:', user.uid);
      setRemoteUserJoined(true);
      setRemoteMuteAudio(true);
      if(isMobile == true){
        const element = document.querySelector('.hodegoCallLayout');
        element.classList.add('hodegoMobileJoined');
      }
      const remoteContainerParent = document.getElementById('remote-video');
      remoteContainerParent.style.display = 'block';
    });
    agoraClient.on('network-quality', ({ uplinkNetworkQuality }) => {
      setLocalNetworkQuality(uplinkNetworkQuality);
   
      // if screen sharing is active, drop or bump resolution dynamically:
      if (screenTrack) {
        const cfg = uplinkNetworkQuality <= 3
          ? { width: 854,  height: 480,  frameRate: 30,  bitrateMin: 800,  bitrateMax: 1200 }
          : { width: 1280, height: 720, frameRate: 30, bitrateMin: 1200, bitrateMax: 2500 };
        screenTrack.setEncoderConfiguration(cfg);
      }
    });
   
    agoraClient.on('user-published', async (user, mediaType) => {
      const getCameraData = await getData(`${siteConfig.hodegoUrl}meeting?bookingId=${bookingId}&setup=video`);
      let cameraType = 'user';
      let screenShare = false;
      if(getCameraData){
        // const remoteUser = getCameraData.data.video_setup.find((user) => user.userId !== localStorage.getItem('userId'));
        // if (remoteUser && remoteUser.isMobile) {
        //   console.log('Remote user is on mobile:', remoteUser);
        // }
        if(getCameraData?.data && getCameraData?.data?.video_setup){
          setJoineeDetails(getCameraData.data.video_setup);
          // alert(JSON.stringify(getCameraData.data.video_setup, null, 2));
          if(getCameraData.data.video_setup.length>0){
            for(let i=0;i<getCameraData.data.video_setup.length;i++){
              if(getCameraData.data.video_setup[i].userId != localStorage.getItem('userId')){
                cameraType = getCameraData.data.video_setup[i].cameraType;
                screenShare = getCameraData.data.video_setup[i].screenShareStatus;
              }
            }
          }
        }
      }
      const getConnectionData = await getData(`${siteConfig.hodegoUrl}meeting?bookingId=${bookingId}&setup=connection`);
      if(getConnectionData){
        if(getConnectionData?.data && getConnectionData?.data?.connection_details){
          setConnectionDetails(getConnectionData.data.connection_details);
        }
      }
     
      const element = document.querySelector('.hodegoCallLayout');
      element.classList.add('hodegoMobileJoined');
      await agoraClient.subscribe(user, mediaType);
      // setUserNames(prev => ({ ...prev, [user.uid]: `${remoteUser.firstName} ${remoteUser.lastName}` }));
      setRemoteUserJoined(true);
      const remoteContainerParent = document.getElementById('remote-video');
      remoteContainerParent.style.display = 'flex';
      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
        const remoteContainerId = user.uid.toString();
        const oldRemoteContainer= document.getElementById(remoteContainerId);

        // If the container already exists, remove it
        if (oldRemoteContainer) {
          oldRemoteContainer.remove();
        }
        const remoteContainer = document.createElement('div');
        remoteContainer.id = user.uid.toString();
        remoteContainer.style.width = '100%';
        remoteContainer.style.height = '100%';
        if(cameraType == 'environment' || screenShare == true){
          document.getElementById('remote-video').classList.add('hodego-environment-container');
        }
        else{
          document.getElementById('remote-video').classList.remove('hodego-environment-container');
        }
        // remoteContainer.style.backgroundColor = 'black';
        const remoteContainerParent = document.getElementById('remote-video');
        remoteContainerParent.style.display = 'block';
        if (remoteContainerParent) {
          remoteContainerParent.appendChild(remoteContainer);
        }
        remoteVideoTrack.play(remoteContainer.id);
      }

      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
        remoteAudioTrack.play();
        setRemoteMuteAudio(false); // Remote user has unmuted
      }
      // client.on('user-published', (mediaType: 'audio') => {
      //   if (mediaType === 'audio') {
      //     setRemoteMuteAudio(false); // Remote user has published their audio track (unmuted)
      //   }
      // });
     
      agoraClient.on('user-unpublished', (user, mediaType) => {
        // const element = document.querySelector('.hodegoCallLayout');
        // element.classList.remove('hodegoMobileJoined');
        if (mediaType === 'audio') {
          setRemoteMuteAudio(true); // Remote user has muted
        }
        if (mediaType === 'video') {
          const remoteContainer = document.getElementById(user.uid.toString());
          if (remoteContainer) {
            remoteContainer.innerHTML = ''; // Clear the video container when the remote user stops video
          }
        }
      });
      if(isMobile == false){
        const element = document.querySelector('[id*="agora-video-player-track-cam"]') as HTMLElement;
        const element2 = document.querySelector('[id*="agora-video-player-track-video"]') as HTMLElement;
        // element2.style.backgroundColor = '#202124';
        if (element2 && isMobile == false) {
          element2.style.borderRadius = '9px';
        }
        if (element) {
          if(isMobile == false){
            element.style.borderRadius = '9px';
          }
          element.classList.add('addRemoteUser');
        }
      }
    });

    agoraClient.on('user-left', async(user) => {
      if (localUser.role === 'user') {
        // handlePause();
        setTimeout(async() => {
          const getConnectionData = await getData(`${siteConfig.hodegoUrl}meeting?bookingId=${bookingId}&setup=connection`);
          if(getConnectionData){
            if(getConnectionData.data && getConnectionData.data.connection_details){
              setConnectionDetails(getConnectionData.data.connection_details);
              if(getConnectionData.data.connection_details.length>0){
                for(let i=0;i<getConnectionData.data.connection_details.length;i++){
                // if(getConnectionData.data.connection_details[i].role == 'mentor'){
                  if(getConnectionData.data.connection_details[i].joinStatus == 'end' && getConnectionData.data.connection_details[i].timeLeft == -180){
                    handleEndCall();
                  }
                }
              }
            }
          }

        }, 3000);
       
      }
      if(isMobile == false){
        const element = document.querySelector('[id*="agora-video-player-track-cam"]');
        if (element && remoteUserJoined == false) {
          element.classList.remove('addRemoteUser');
          element.classList.add('addSingleUser');
        }
      }
     
      const remoteContainerParent = document.getElementById('remote-video');
      remoteContainerParent.style.display = 'none';
      const element = document.querySelector('.hodegoCallLayout');
      element.classList.remove('hodegoMobileJoined');
      const userNameLeft = `${remoteUser.firstName} ${remoteUser.lastName}`;
      console.log('userNames',userNameLeft);
      setUserLeftMessage(`${userNameLeft} has left the call`);
      setRemoteUserJoined(false);
      const remoteContainer = document.getElementById(user.uid.toString());
      if (remoteContainer) {
        remoteContainer.innerHTML = '';// Clear the container when the remote user leaves
        remoteContainer.remove();
      }
      leaveSound.play();
      setTimeout(() => setUserLeftMessage(null), 7000);
      const tempArr = joineeDetails;
      if(tempArr.length > 0) {
        for(let i=0;i<tempArr.length;i++){
          if(tempArr[i].userId == localStorage.getItem('userId')){
            tempArr[i].screenShareStatus = false;
            tempArr[i].isMobile = isMobile == true?true:false;
            break;
          }
        }
      }
      setJoineeDetails(tempArr);
      const formData = {
        'setup': 'video',
        'data': joineeDetails,
        'bookingId': bookingId
      };
      const response = await putData(formData, `${siteConfig.hodegoUrl}meeting`);
      if (response && response.data) {
        if(response.data.status == true){
          console.log(response.data.status);
        }
      }
      // console.log('user.uid',user.uid);
      // if(remoteUser.role == 'mentor' && remoteUser.userId == user.uid){
      //   const tempArr = connectionDetails;
      //   if(tempArr.length>0){
      //     for(let i=0;i<tempArr.length;i++){
      //       if(tempArr[i].role == 'mentor'){
      //         tempArr[i].joinStatus = 'userLeft';
      //         tempArr[i].timeLeft = timeLeft;
      //         break;
      //       }
      //     }
      //   }
      //   setConnectionDetails(tempArr);
      //   const formData = {
      //     'setup': 'connection',
      //     'data': connectionDetails,
      //     'bookingId': bookingId,
      //   };
      //   const response = await putData(formData, `${siteConfig.hodegoUrl}meeting`);
      //   if (response && response.data) {
      //     if(response.data.status == true){
      //       console.log(response.data.status);
      //     }
      //   }
      // }
    });

    // Call joinCall on page load after initializing the client
    await joinChannel(agoraClient);
  };

  useEffect(() => {
    if (client) {
      // Cleanup previous client if any
      client.leave().then(() => {
        console.log('Agora client successfully left the channel.');
        setClient(null);  // Clean up the client state
        initAgora();  // Optionally reinitialize Agora if needed
      }).catch((error) => {
        console.error('Error during client leave:', error);
      });
     
    } else {
      const existingTimerLeft = localStorage.getItem('timerLeft');
      if (existingTimerLeft && localStorage.getItem('bookingId') == bookingId.toString()) {
        setTimeout(initAgora, 200);
      }
      else{
        initAgora();
      }
    }
  }, []);
  const loadBlurRender = async() =>{
    if (initialBlurOn) {
      console.log('Enabling blur effect...');
      initializeExtension();
 
      if (!processorRef.current) {
        console.log('Creating new processor...');
        processorRef.current = virtualBackgroundExtension.createProcessor();
      }
 
      if (!isProcessorInitializedRef.current) {
        try {
          console.log('Initializing processor...');
          await processorRef.current.init('/virtual-background.wasm'); // Adjust the path as needed
          isProcessorInitializedRef.current = true; // Mark processor as initialized
          console.log('Processor initialized successfully');
        } catch (error) {
          console.error('Error initializing blur processor:', error);
          return;
        }
      }
 
      if (virtualBackgroundExtension.checkCompatibility()) {
        try {
          console.log('Applying blur effect...');
          processorRef.current.setOptions({ type: 'blur', blurDegree: 1 });
 
          if (localTracks[1]) {
            console.log('Resetting video track pipeline...');
            // Ensure any existing pipeline is cleared
            await localTracks[1].unpipe();
 
            // Enable the processor
            await processorRef.current.enable();
 
            // Pipe processor to the video track
            localTracks[1]
              .pipe(processorRef.current)
              .pipe(localTracks[1].processorDestination);
            console.log('Processor:', processorRef.current);
            console.log('Blur effect applied successfully');
          } else {
            console.warn('No valid video track to apply blur effect');
          }
        } catch (error) {
          console.error('Error enabling blur effect:', error);
        }
      } else {
        console.warn('Virtual background is not supported on this browser/device');
      }
    }
  };
  useEffect(() =>{
    if(localTracks && initialBlurOn){
      loadBlurRender();
    }
  },[localTracks]);
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      handleEndCall();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    };
 
    window.addEventListener('beforeunload', handleBeforeUnload);
 
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  useEffect(() => {
  },[currentCameraFacing,joineeDetails,screenTrack,connectionDetails,mentorJoined,remoteUserJoined,timeLeft,fullScreenOn,muteAudio]);
  useEffect(() => {
    if (client) {
      client.enableAudioVolumeIndicator();
      client.on('volume-indicator', (volumes) => {
        let speaking = false;

        volumes.forEach((volume) => {
          if (volume.level > 50 && !muteAudio) {
            speaking = true;
          }
        });

        setIsSpeaking(speaking);
      });
    }
  }, [client, muteVideo,remoteMuteAudio,muteAudio]);
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTimeLeft((prevTime) => prevTime - 1);
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);



  // Show a snackbar when there are 5 minutes left
  useEffect(() => {
    if(localUser.role == 'mentor'){
      if (timeLeft === 5 * 60) {
        setIsSnackbarOpen(true);
      }
      if(timeLeft == 0 && sessionEnded){
        setIsSnackbarOpenEnd(true);
      }
      if(timeLeft == -180){
        handleEndCall();
      }
      if (timeLeft <= 0 && !sessionEnded) {
        setSessionEnded(true);
      }
    }
  }, [timeLeft, sessionEnded]);
 

  const rtcProps = {
    appId: siteConfig.agoraAppId,
    channel: meetingId,
    token: token,
    uid:userId,
  };

  const joinChannel = async (clientInstance: IAgoraRTCClient) => {
    // Fetch the current video setup before updating it
    // const existingVideoSetup = await getData(`${siteConfig.hodegoUrl}meeting?bookingId=${bookingId}&setup=video`);
    // const tempArrVideo = existingVideoSetup?.data?.video_setup || [];
 
    // const existingUserIndex = tempArrVideo.findIndex(user => user.userId == localStorage.getItem('userId'));
    // if (existingUserIndex !== -1) {
    //   tempArrVideo[existingUserIndex].isMobile = isMobile;
    // } else {
    //   tempArrVideo.push({
    //     role: localUser.role,
    //     userId: localUser.userId,
    //     cameraType: 'user',
    //     screenShareStatus: false,
    //     isMobile: isMobile,
    //   });
    // }
    // setJoineeDetails(tempArrVideo);
    // const formData = {
    //   setup: 'video',
    //   data: tempArrVideo,
    //   bookingId: bookingId,
    // };
 
    // const response = await putData(formData, `${siteConfig.hodegoUrl}meeting`);
    // if (response?.data) {
    //   console.log('Updated video setup:', tempArrVideo);
    // }
 
    console.log('Joining the channel...');
    if(localUser.role == 'mentor'){
      const getConnectionData = await getData(`${siteConfig.hodegoUrl}meeting?bookingId=${bookingId}&setup=connection`);
      if(getConnectionData){
        if(getConnectionData.data && getConnectionData.data.connection_details){
          setConnectionDetails(getConnectionData.data.connection_details);
          console.log('connectionDetails',connectionDetails);
          if (getConnectionData?.data?.connection_details) {
            const mentorDetail = getConnectionData.data.connection_details.find((detail) => detail.role === 'mentor');
            if (mentorDetail) {
              setTimeLeft(mentorDetail.timeLeft); // Use API-provided timeLeft
              setMentorJoined(true);
            }
          }
        }
      }
      const tempArr = connectionDetails;
      if(tempArr.length == 0 || tempArr == null){
        tempArr.push({
          'role': localUser.role,
          'userId': localUser.userId,
          'joinStatus': 'joined',
          'timeLeft': timeLeft == 0?parseInt(sessionTime) * 60:timeLeft,
        });
      }
      setConnectionDetails(tempArr);
      const formData = {
        'setup': 'connection',
        'data': connectionDetails,
        'bookingId': bookingId
      };
      const response = await putData(formData, `${siteConfig.hodegoUrl}meeting`);
      if (response && response.data) {
        if(response.data.status == true){
          console.log('response.data');
          // await client.publish(screenTracks);
        }
      }
    }
    // const getChannelData = await getData(`${siteConfig.hodegoUrl}meeting?bookingId=${bookingId}&setup=video`);
    // if(getChannelData){
    //   const remoteUser = getChannelData.data.video_setup.find((user) => user.userId !== localStorage.getItem('userId'));
    //   if (remoteUser && remoteUser.isMobile) {
    //     console.log('Remote user is on mobile:', remoteUser);
    //   }
    // }
    try {
      if (clientInstance) {
        // Join the channel
        await clientInstance.join(rtcProps.appId, rtcProps.channel, rtcProps.token, rtcProps.uid);
        console.log('Successfully joined the channel:', rtcProps.channel);
   
        // Unpublish and stop any previously published tracks to prevent duplicates
        if (localTracks) {
          await clientInstance.unpublish(localTracks);
          // Use type assertion to ensure tracks are of the correct type
          localTracks.forEach((track) => {
            (track as ILocalAudioTrack | ILocalVideoTrack).stop();
            (track as ILocalAudioTrack | ILocalVideoTrack).close();
          });
        }
   
        // Create new audio and video tracks
        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks() as [ILocalAudioTrack, ILocalVideoTrack];
        if (!blurOn && shouldPlaySoundRef.current) {
          joinSound.play();
        }
        shouldPlaySoundRef.current = true;
        setLocalTracks(tracks);
   
        // if (blurOn) {
        //   const virtualBackgroundExtension = new VirtualBackgroundExtension();
        //   AgoraRTC.registerExtensions([virtualBackgroundExtension]);
   
        //   const processor = virtualBackgroundExtension.createProcessor();
        //   try {
        //     await processor.init('/path/to/wasm/files');
        //     if (virtualBackgroundExtension.checkCompatibility()) {
        //       processor.setOptions({ type: 'blur', blurDegree: 1 });
        //       await processor.enable();
        //       tracks[1].pipe(processor).pipe(tracks[1].processorDestination);
        //     } else {
        //       console.warn('Virtual background is not supported on this browser/device.');
        //     }
        //   } catch (error) {
        //     console.error('Error initializing virtual background processor:', error);
        //   }
        // }
   
        // Control audio and video based on mute settings
        if (!muteVideo) {
          tracks[1].setEnabled(true);
          tracks[1].play('local-video');
          tracks[1].setEncoderConfiguration({
            width: 1280,
            height: 720,
            frameRate: 30,
            bitrateMin: 1200,
            bitrateMax: 2500
          });
          setJoinedStatus(false);
        } else {
          tracks[1].setEnabled(false);
          tracks[1].stop();
          setJoinedStatus(false);
        }
   
        if (muteAudio) {
          tracks[0].setEnabled(false);
        }
        else{
          tracks[0].setEnabled(true);
        }
   
        // Publish the new tracks
        await clientInstance.publish(tracks);
        console.log('Tracks published successfully');
   
        // Set user information if necessary
        // setUserNames(prev => ({ ...prev, [clientInstance.uid]: `${localUser.firstName} ${localUser.lastName}` }));
        if(localUser.role == 'user'){
          const getConnectionData = await getData(`${siteConfig.hodegoUrl}meeting?bookingId=${bookingId}&setup=connection`);
          if(getConnectionData){
            if(getConnectionData.data && getConnectionData.data.connection_details){
              setConnectionDetails(getConnectionData.data.connection_details);
              console.log(connectionDetails);
              if (getConnectionData?.data?.connection_details) {
                const mentorDetail = getConnectionData.data.connection_details.find((detail) => detail.role === 'mentor');
                if (mentorDetail) {
                  // setTimeLeft(mentorDetail.timeLeft); // Use API-provided timeLeft
                  setMentorJoined(true);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to join the channel:', error);
    }
    if(isMobile == false){
      const element = document.querySelector('[id*="agora-video-player-track-cam"]');
      if (element && remoteUserJoined == false) {
        // (element as HTMLElement).style.width = '75%';
        element.classList.add('addSingleUser');
      }
    }
   
  };
  // useEffect(() => {
  //   const initAgora = async () => {
  //     const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  //     setClient(agoraClient);
  //     await joinChannel(agoraClient);
  //   };
 
  //   initAgora();
  // }, [rtcProps.token]);
 
  const handleAudioToggle = () => {
    if (localTracks.length > 0) {
      localTracks[0].setEnabled(muteAudio);
      setMuteAudio(!muteAudio);
      // const element = document.querySelector('.hodegoCallLayout');
      // element.classList.add('hodegoMobileJoined');
      // Notify other users about local mute/unmute status
      // client?.muteLocalAudio(muteAudio); // Custom event or use Agora's API
    }
    // if (localTracks.length > 0) {
    //   const isAudioEnabled = localTracks[0].enabled;
    //   localTracks[0].setEnabled(isAudioEnabled); // Mute/unmute the local user's audio
    //   setMuteAudio(isAudioEnabled); // Update the mute state
    // }

  };
  const handleSwitchCamera = async () => {
    try {
      setBlurOn(false); // Disable blur when switching cameras
 
      if (!localTracks[1]) return;
 
      // Stop and clean up the existing video track
      await client?.unpublish(localTracks[1]);
      localTracks[1].stop();
      localTracks[1].close();
 
      // Verify available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('devices',devices);
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      console.log('videoDevices',videoDevices);
      if (videoDevices.length < 2) {
        alert('Your device does not support camera switching.');

        // return;
      }
 
      // Toggle camera facing mode
      const nextFacingMode = currentCameraFacing === 'user' ? 'environment' : 'user';
 
      // Create a new video track with the desired facing mode
      const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
        facingMode: nextFacingMode,
      });
 
      // Play the new video track in the local container
      const localContainer = document.getElementById('local-video');
      if (localContainer) {
        const videoElements = localContainer.querySelectorAll('video'); // Find all <video> tags
        videoElements.forEach((video) => {
          video.remove(); // Remove each <video> tag (if needed)
        });
 
        // Assuming you want to apply scaleX to the <video> tags dynamically
        videoElements.forEach((video) => {
          if (videoDevices.length < 2) {
            video.style.transform = nextFacingMode === 'environment' ? 'scaleX(1)' : 'scaleX(-1)';
          } else {
            video.style.transform = nextFacingMode === 'environment' ? 'scaleX(-1)' : 'scaleX(1)';
          }
        });
        if(videoDevices.length >=2){
          if(nextFacingMode == 'environment'){
            document.getElementById('local-video').classList.add('hodego-environment-local');
          }
          else{
            document.getElementById('local-video').classList.remove('hodego-environment-local');
          }
        }
       
      }
      newVideoTrack.play('local-video');
      // Update joinee details
      const tempArr = [...joineeDetails];
      const existingUserIndex = tempArr.findIndex(
        (item) => item.userId === localUser.userId && item.role === localUser.role
      );
 
      if (existingUserIndex !== -1) {
        tempArr[existingUserIndex].cameraType = nextFacingMode;
      } else {
        tempArr.push({
          role: localUser.role,
          userId: localUser.userId,
          cameraType: nextFacingMode,
          screenShareStatus: false,
        });
      }
 
      setJoineeDetails(tempArr);
 
      // Send updated details to your backend
      const formData = {
        setup: 'video',
        data: tempArr,
        bookingId: bookingId,
      };
      const response = await putData(formData, `${siteConfig.hodegoUrl}meeting`);
 
      if (response?.data?.status) {
        // Publish the new video track
        await client?.publish(newVideoTrack);
 
        // Update local tracks
        setLocalTracks([localTracks[0], newVideoTrack]);
 
        // Update current camera facing mode
        setCurrentCameraFacing(nextFacingMode);
      }
 
      // Add class for UI adjustment if a remote user joined
      if (remoteUserJoined) {
        const element = document.querySelector('.hodegoCallLayout');
        element?.classList.add('hodegoMobileJoined');
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      alert(
        'Your device may not support camera switching. Please email support@hodego.com with your device details so we can look into it. Thank you!'
      );
    }
  };
 
 
  const handleEndCall = async () => {
    console.log('end call');
    if (client) {
      // Play the leave sound
      leaveSound.play();
     
      // Stop and close all local audio and video tracks
   
      if (localTracks.length > 0) {
        localTracks.forEach((track) => {
          // if ('stop' in track) {
          //   track.stop();// Close the track to release resources (only for local tracks)
          // }
     
          // if ('close' in track) {
          //   track.close(); // Close the track to release resources (only for local tracks)
          // }
     
          client?.unpublish(track); // Unpublish the track from Agora
        });
        setLocalTracks([]); // Clear the local tracks after stopping
      }
      // Leave the Agora channel
      await client.leave();
      client.removeAllListeners();  // Remove any event listeners
      setClient(null);  // Reset client state
 
      // Stop screen sharing track if it's active
      if (screenTrack) {
        screenTrack.stop(); // Stop screen sharing
        client.unpublish(screenTrack); // Unpublish the screen sharing
        setScreenTrack(null);
      }
 
      // Manually stop all video input streams (this ensures the camera is completely off)
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.getTracks().forEach((track) => {
        track.stop(); // Stop each video track explicitly
      });
 
      // Ensure audio is also stopped
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach((track) => {
        track.stop(); // Stop each audio track explicitly
      });
    }
    localStorage.removeItem('firstLoad');
    if(localUser.role == 'mentor'){
      const tempArr = connectionDetails;
      if(tempArr.length>0){
        for(let i=0;i<tempArr.length;i++){
          if(tempArr[i].role == 'mentor'){
            tempArr[i].joinStatus = 'end';
            tempArr[i].timeLeft = localStorage.getItem('timerLeft');
            break;
          }
        }
      }
      setConnectionDetails(tempArr);
      const formData = {
        'setup': 'connection',
        'data': connectionDetails,
        'bookingId': bookingId
      };
      const response = await putData(formData, `${siteConfig.hodegoUrl}meeting`);
      if (response && response.data) {
        if(response.data.status == true){
          localStorage.removeItem('timerLeft');
          localStorage.removeItem('bookingId');
          navigate(`/hodego-call-review/?id=${meetingId}&bookingId=${bookingId}&mentorId=${mentorId}&mentorProfilePicture=${mentorProfilePicture}&mentorName=${mentorName}&meetingAgenda=${meetingAgenda}&meetUserType=${meetUserType}&date=${date}&toDate=${toDate}`);
        }
      }
    }
    else{
      localStorage.removeItem('timerLeft');
      localStorage.removeItem('bookingId');
      navigate(`/hodego-call-review/?id=${meetingId}&bookingId=${bookingId}&mentorId=${mentorId}&mentorProfilePicture=${mentorProfilePicture}&mentorName=${mentorName}&meetingAgenda=${meetingAgenda}&meetUserType=${meetUserType}&date=${date}&toDate=${toDate}`);
    }
   
  };
 
 
 
 
  const handleVideoToggle = () => {
    if (localTracks.length > 0) {
      if (muteVideo) {
        // Unmute video: enable the video track and play it
        localTracks[1].setEnabled(true);
        localTracks[1].play('local-video'); // Ensure it plays in the container
        // await client.publish(localTracks[1]);
      } else {
        // Mute video: disable the video track and stop it
        // await client.unpublish(localTracks[1]);
        localTracks[1].setEnabled(false);
        localTracks[1].stop(); // Stop the track when muted
      }
      setMuteVideo(!muteVideo); // Toggle the muteVideo state
    }
    if(isMobile == false){
      const element = document.querySelector('[id*="agora-video-player-track"]');
      if (element && remoteUserJoined == false) {
        // (element as HTMLElement).style.width = '75%';
        element.classList.add('addSingleUser');
      }
    }
  };
  let virtualBackgroundExtension: any = null; // Keep extension reference

  // let isProcessorInitialized: boolean = false; // Track initialization state

  const initializeExtension = () => {
    if (!virtualBackgroundExtension) {
      virtualBackgroundExtension = new VirtualBackgroundExtension();
      AgoraRTC.registerExtensions([virtualBackgroundExtension]);
      console.log('VirtualBackgroundExtension initialized and registered.');
    }
  };

  // Declare processor and isProcessorInitialized outside the function
  // let processor: any = null; // Declare globally at the component level
  // Also declare this at the same level
 
  const handleBlur = async () => {
    shouldPlaySoundRef.current = false;
 
    if (blurOn) {
      // Disable blur
      console.log('Disabling blur effect...');
      if (isProcessorInitializedRef.current) {
        try {
          console.log('Unbinding processor and resetting pipeline...');
          // Unpipe existing processor
          await localTracks[1]?.unpipe();
          await processorRef.current?.disable();
          isProcessorInitializedRef.current = false; // Reset initialization flag
          console.log('Processor unpiped and disabled successfully');
        } catch (error) {
          console.error('Error disabling blur processor:', error);
        }
      } else {
        console.warn('Processor was not initialized or already disabled');
      }
      setBlurOn(false);
    } else {
      // Enable blur
      console.log('Enabling blur effect...');
      initializeExtension();
 
      if (!processorRef.current) {
        console.log('Creating new processor...');
        processorRef.current = virtualBackgroundExtension.createProcessor();
      }
 
      if (!isProcessorInitializedRef.current) {
        try {
          console.log('Initializing processor...');
          await processorRef.current.init('/virtual-background.wasm'); // Adjust the path as needed
          isProcessorInitializedRef.current = true; // Mark processor as initialized
          console.log('Processor initialized successfully');
        } catch (error) {
          console.error('Error initializing blur processor:', error);
          return;
        }
      }
 
      if (virtualBackgroundExtension.checkCompatibility()) {
        try {
          console.log('Applying blur effect...');
          processorRef.current.setOptions({ type: 'blur', blurDegree: 1 });
 
          if (localTracks[1]) {
            console.log('Resetting video track pipeline...');
            // Ensure any existing pipeline is cleared
            await localTracks[1].unpipe();
 
            // Enable the processor
            await processorRef.current.enable();
 
            // Pipe processor to the video track
            localTracks[1]
              .pipe(processorRef.current)
              .pipe(localTracks[1].processorDestination);
            console.log('Processor:', processorRef.current);
            console.log('Blur effect applied successfully');
          } else {
            console.warn('No valid video track to apply blur effect');
          }
        } catch (error) {
          console.error('Error enabling blur effect:', error);
        }
      } else {
        console.warn('Virtual background is not supported on this browser/device');
      }
      setBlurOn(true);
    }
    if(isMobile == false){
      const element = document.querySelector('[id*="agora-video-player-track-cam"]');
      if (element && remoteUserJoined == false) {
        element.classList.add('addSingleUser');
      }
    }
  };
 

 
  const handleFullScreen = () => {
    const element = document.getElementById('local-video');
    const remoteVideoElement = document.getElementById('remote-video');
    const remoteScreenShareElement = document.getElementById('screen-share-video');
    if (remoteVideoElement || remoteScreenShareElement) {
      // const hasVideoTag = remoteVideoElement.querySelector('video') !== null;
      // const hasScreenVideoTag = remoteScreenShareElement.querySelector('video') !== null;
      // if (hasVideoTag || hasScreenVideoTag) {

      if(fullScreenOn == true){
        if (element) {
          element.style.display = 'block';
        }
        setFullScreenOn(false);
      }
      else{
        if (element) {
          element.style.display = 'none';
        }
        setFullScreenOn(true);
      }
      // }
    } else {
      console.log('Element with ID \'remote-video\' not found.');
    }
   
  };

  const handleScreenSharing = async () => {
    if (!screenTrack) {
      try {
        const screenTracks = await AgoraRTC.createScreenVideoTrack(screenTrackConfig, 'auto');
        if (client) {
          if (Array.isArray(screenTracks)) {
            const [screenVideoTrack] = screenTracks;
            setScreenTrack(screenVideoTrack);
 
            // Ensure the camera track is enabled before unpublishing
            if (localTracks[1]) {
              await localTracks[1].setEnabled(true);
            }
            await client.unpublish(localTracks[1]); // Unpublish camera before sharing screen
 
            await client.publish(screenVideoTrack);
            screenVideoTrack.play('screen-share-video');
          } else {
            setScreenTrack(screenTracks);
 
            // Ensure the camera track is enabled before unpublishing
            if (localTracks[1]) {
              await localTracks[1].setEnabled(true);
            }
            await client.unpublish(localTracks[1]); // Unpublish camera before sharing screen
            await client.publish(screenTracks);
            screenTracks.play('screen-share-video');
          }
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      // Stop screen sharing
      if (screenTrack) {
        await client.unpublish(screenTrack);
        screenTrack.stop();
        setScreenTrack(null);
 
        // Re-enable and publish the camera track
        if (localTracks[1]) {
          await localTracks[1].setEnabled(true);
          await client.publish(localTracks[1]);
        }
      }
    }
  };
 
 
 
  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setIsSnackbarOpen(false);
  };
  const handleCloseSnackbarEnd = () => {
    setIsSnackbarOpenEnd(false);
  };

  // Format the time to display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  useEffect(() => {
    // joinChannel();
    return () => {
      if(client){
 
        client.leave();
        if (screenTrack) {
          screenTrack.stop();
          client.unpublish(screenTrack);
        }
        if (localTracks.length > 0) {
          // localTracks.forEach(track => track.stop());
        }
      }
    };
  }, []);


  const toggleMeetingInfo = () => {
    setMeetingInfoOpen(!meetingInfoOpen);
  };

  return (
    <>
      {joinedStatus == true ?
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
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
        :
        ''
      }
      <Box className="hodegoCallLayout">
        <Box sx={{ position: 'relative', width: '100%', height: 'calc(100% - 8%);' }}>
          <Box
            id="screen-share-video"
            sx={{
              position: 'absolute', /* Ensure it stays within the boundaries */
              transform: 'translate(-50%, -50%) scaleX(-1)', /* Center and flip */
              width: '70%', /* Adjust this width as needed */
              height: '100%', /* Adjust this height as needed */
              maxWidth:'100vw',
              marginLeft:'0.5%',
              maxHeight:'100vh',
              overflow: 'hidden',/* Prevents any overflow issues */
              objectFit: 'contain',
            }}
          />
          <Box
            id="remote-video"
            className={`${screenTrack ? 'remote-screen-share' : ''} ${isMobile == false ? 'desktopMode' : 'mobileMode'}`.trim()}
            sx={{
              display: 'none',
              position: 'relative',
              width: remoteUserJoined ? isMobile == false ? '75%' : '100%' : '0',
              height: remoteUserJoined ? '95%' : '0',
              marginLeft: remoteUserJoined ? isMobile == false ? '2%' : '0' : '0',
              marginTop: remoteUserJoined ? isMobile == false ? '0.5%' : '0' : '0',
              borderRadius:remoteUserJoined ? isMobile == false ? '9px' : '0' : '0',
              backgroundColor:
            localTracks[1] // If the camera is enabled
              ? muteVideo
                ? '#282626' // If the video is muted and the camera is enabled, show black background
                : '#282626'// If both video and camera are enabled, show transparent background
              :'#282626' ,
            }}
          >
            <Typography
              variant="body2"
              className="remoteTypography"
              sx={{
                bottom: remoteUserJoined ? '3%' : undefined,
                top: !remoteUserJoined ? '78%' : undefined,
              }}
            >
              {remoteMuteAudio ?
                <MicOffIcon sx={{color: 'red', fontSize: '20px',zIndex:'20',verticalAlign:'middle',marginRight:'3px' }} />
                :
                <MicIcon sx={{color: '#73A870', fontSize: '20px',zIndex:'20',verticalAlign:'middle',marginRight:'3px' }} />
              }
              {remoteUser.firstName} {remoteUser.lastName}
            </Typography>
            {remoteUser && (
              remoteUser.profilePictureUrl ? (
                <Avatar
                  className="avatar-wave"
                  sx={{
                    width: isMobile?'100px':'120px',
                    height: isMobile?'100px':'120px',
                    backgroundColor: '#0C6697',
                    color: '#FFF',
                    fontSize: '4rem',
                  }}
                  src={remoteUser.profilePictureUrl}
                />
              ) : (
                <Avatar
                  className="avatar-wave"
                  sx={{
                    width: isMobile?'100px':'120px',
                    height: isMobile?'100px':'120px',

                    backgroundColor: '#0C6697',
                    color: '#FFF',
                    fontSize: '4rem',
                  }}
                >
                  {remoteUser.firstName.charAt(0).toUpperCase()}
                </Avatar>
              )
            )}
          </Box>  
       
          <Box
            id="local-video"
            className={screenTrack ? 'local-screen-share' : ''}
            sx={{
              position: 'absolute',
              width: remoteUserJoined ? '20%' : '100%',
              height: remoteUserJoined ? '30%' : '100%',
              bottom: remoteUserJoined ? '5%' : '0',
              right: remoteUserJoined ? '1.5%' : '0',
              borderRadius: remoteUserJoined ? '9px':'none',
              zIndex: 10,
              border: '1px solid #73a870',
              backgroundColor:
            localTracks[1] // If the camera is enabled
              ? muteVideo
                ? '#282626' // If the video is muted and the camera is enabled, show black background
                : '#282626'// If both video and camera are enabled, show transparent background
              :'#282626' ,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                position: 'absolute',
                bottom: remoteUserJoined ? '10px' : undefined,
                top: !remoteUserJoined ? '90%' : undefined,
                left: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                zIndex: 20,
              // transform: currentCameraFacing == 'environment' ? 'scaleX(-1)':'scaleX(1)',
              }}
            >
         
              {muteAudio ?
                <MicOffIcon sx={{color: 'red', fontSize: '20px',zIndex:'20',verticalAlign:'middle',marginRight:'3px' }} />
                :
                <MicIcon sx={{color: '#73A870', fontSize: '20px',zIndex:'20',verticalAlign:'middle',marginRight:'3px' }} />
              }
              {isMobile == true ? `${localUser.firstName}` : `${localUser.firstName} ${localUser.lastName}`
              }
            </Typography>
         
            {muteVideo && localUser && (
              localUser.profilePictureUrl ? (
                <Avatar
                  className={`avatar-wave ${muteAudio ? '' : 'avatar-speaking'}`}
                  sx={{
                    margin: 'auto',
                    width: isMobile?'100px':'120px',
                    height: isMobile?'100px':'120px',
                    backgroundColor: '#0C6697',
                    color: '#FFF',
                    fontSize: '4rem',
                  }}
                  src={localUser.profilePictureUrl}
                />
              ) : (
                <Avatar
                  className={`avatar-wave ${muteAudio ? '' : 'avatar-speaking'}`}
                  sx={{
                    margin: 'auto',
                    width: isMobile?'100px':'120px',
                    height: isMobile?'100px':'120px',
                    backgroundColor: '#0C6697',
                    color: '#FFF',
                    fontSize: '4rem',
                  }}
                >
                  {localUser.firstName.charAt(0).toUpperCase()}
                </Avatar>
              )
            )}

            {isSpeaking && !muteAudio && (
              <div id="signal-dots" className="signal-dots active">
                <div className="signal-dot small"></div>
                <div className="signal-dot middle"></div>
                <div className="signal-dot small"></div>
              </div>
            )}
            {userLeftMessage && (
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  bottom: '5%',
                  right: '1%',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  zIndex: 30, // Higher than video
                }}
              >
                {userLeftMessage}
              </Typography>
            )}
         
          </Box>
        </Box>
        {localUser.role == 'mentor'?
          <Box
            className="hodego-timer"
            sx={{
              position: 'absolute',
              top: 10,
              right: '1%',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '2px 8px',
              borderRadius: '4px',
              color: sessionEnded ? 'white' : 'red', // Red color after session ends
            }}
          >
            <TimerIcon sx={{ mr: 1,color:'#73A870' }} />
            <Typography variant="body2">
              {sessionEnded ? formatTime(Math.abs(timeLeft)) : formatTime(timeLeft)}
            </Typography>
          </Box>
          :
          ''
        }
     
        {/* Snackbar to alert user of 5 minutes left */}
        <Box >
          <Snackbar
            ContentProps={{
              sx: { backgroundColor: '#73A870', textAlign:'center' },
            }}
            open={isSnackbarOpen}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            message="5 minutes remaining. The timer is visible only to you. Please notify when time is nearly up"
            autoHideDuration={12000}
          />
          <Snackbar
            ContentProps={{
              sx: { backgroundColor: '#73A870', textAlign:'center' },
            }}
            open={isSnackbarOpenEnd}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            onClose={handleCloseSnackbarEnd}
            message="Meeting room will close automatically in 3 minutes. Only you see the timer, so please notify accordingly"
            autoHideDuration={12000}
          />
        </Box>
        <Box className="agora-controls">
          <Box className="agora-controls-center">
            <Tooltip title={muteAudio ? 'Unmute' : 'Mute'}>
              <IconButton
                className={`agora-button ${muteAudio ? 'muted' : ''}`}
                onClick={handleAudioToggle}
                sx={{ color:'white' }}
              >
                {muteAudio ? <MicOffIcon sx={{background:'#3d3a3a',color:'red',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}} /> : <MicIcon sx={{background:'#73A870',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}} />}
                <Typography variant="caption">Mic {muteAudio ? 'Off' : 'On'}</Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title={muteVideo ? 'Start Video' : 'Stop Video'}>
              <IconButton
                className={`agora-button ${muteVideo ? 'muted' : ''}`}
                onClick={handleVideoToggle}
                sx={{ color:'white' }}
              >
                {muteVideo ? <VideocamOffIcon sx={{background:'#3d3a3a',color:'red',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}} /> : <VideocamIcon sx={{background:'#73A870',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}}  />}
                <Typography variant="caption">Video {muteVideo ? 'Off' : 'On'}</Typography>
              </IconButton>
            </Tooltip>
            {/* {isMobile == true ?
              <Tooltip title={fullScreenOn ? 'Min' : 'Max'}>
                <IconButton
                  className='agora-button'
                  disabled={remoteUserJoined == false}
                  onClick={handleFullScreen}
                  // sx={{ color: blurOn ? 'red' : 'white' }}
                >
                  {fullScreenOn ?
                    <OpenInFullIcon sx={{background:'#3d3a3a',color:'white',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}}/>
                    :
                    <CloseFullscreenIcon sx={{background:'#3d3a3a',color:'white',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}} />
                  }
                  <Typography sx={{color: '#fff'}} variant="caption">{fullScreenOn ? 'Max' : 'Min'}</Typography>
                </IconButton>
              </Tooltip>:
              ''
            } */}
           
            <Tooltip title={blurOn ? 'Blur Off' : 'Blur On'}>
              <IconButton
                className='agora-button'
                onClick={handleBlur}
              // sx={{ color: blurOn ? 'red' : 'white' }}
              >
                <BlurOnTwoToneIcon sx={{background:'#3d3a3a',color:'white',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}}/>
                <Typography variant="caption">Blur {blurOn ? 'On' : 'Off'}</Typography>
              </IconButton>
            </Tooltip>
            {isMobile == false ?
              <Tooltip title={screenTrack ? 'Stop Sharing' : 'Share Screen'}>
                <IconButton className="agora-button" onClick={handleScreenSharing}>
                  {screenTrack ? <StopScreenShareIcon  sx={{background:'#3d3a3a',color:'white',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}}/> : <ScreenShareIcon sx={{background:'#3d3a3a',color:'white',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}} />}
                  <Typography variant="caption">Share</Typography>
                </IconButton>
              </Tooltip>
              :
              ''
            }
            {isMobile && (
              <Tooltip   title={unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : ''}
                placement="top"
                disableHoverListener={false} >
                <IconButton onClick={() => setMobileDrawerOpen(true)} className="agora-button">
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    overlap="circular"
                  >
                    <MoreVertIcon sx={{ background: '#3d3a3a', color: '#fff', borderRadius: '50%', padding: '10px', width: '50px', height: '50px' }} />
                  </Badge>
                  <Typography variant="caption">More</Typography>
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="End Call">
              <IconButton className="agora-button end-call"  onClick={handleEndCall}>
                <CallEndIcon sx={{background:'red',color:'white',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}} />
                <Typography variant="caption">End Call</Typography>
              </IconButton>
            </Tooltip>
            {/* <Tooltip title="Meeting Info">
            <IconButton className="agora-button agora-info-mobile" onClick={toggleMeetingInfo}>
              <InfoIcon />
              <Typography variant="caption">Meeting Info</Typography>
            </IconButton>
          </Tooltip> */}
          </Box>
          <Box className="agora-switch-camera" sx={{display:!muteVideo && isMobile?'block':'none'}}>
            <Tooltip title="Switch Camera">
              <IconButton className="agora-camera-switch-iconbutton" onClick={handleSwitchCamera}>
                <CameraswitchOutlinedIcon sx={{background:'#3d3a3a',color:'#fff',borderRadius:'50px',padding:'10px',width:'50px',height:'50px'}} />
                {/* <Typography variant="caption">Switch</Typography> */}
              </IconButton>
            </Tooltip>
          </Box>
          {/* <Box>
            <TextChat appId={siteConfig.agoraAppId} meetingId={meetingId} userId={userId} token={'007eJxSYJiaeb76Y8OMMKdbfVr5gkozeVQCT7x8HC0mceadTkN41TIFhlQTw6TEpDQzI0ODFJPkpFQLo0TDVPNkE+Nk8zTTVBPLtNtqGQ2BjAybEv8yMTIwMTAyMDKA+AwMgAAAAP//l+weRQ=='} />
          </Box> */}
          <Box className="agora-controls-right">
            {/* Network strength bar for local user */}
            <Tooltip title={`Your Network: ${localNetworkQuality}/5`}>
              <Box className="agora-button" sx={{marginTop:'11%'}}>
                <NetworkBar level={localNetworkQuality} />
              </Box>
            </Tooltip>
            <Tooltip title="Open Chat">
              <IconButton className="agora-button" onClick={toggleChatDrawer}>
                {/* <Badge badgeContent={unreadCount} color="error"></Badge>
                <ChatBubbleIcon sx={{ color: '#06C997', padding: '10px', width: '50px', height: '50px' }} />
     */}
    
                <Badge badgeContent={unreadCount} color="error" overlap="circular" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                  <ChatBubbleIcon sx={{ color: '#06C997', padding: '10px', width: '50px', height: '50px' }} />
                </Badge>

                <Typography variant="caption">Chat</Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title="Meeting Info">
              <IconButton className="agora-button" onClick={toggleMeetingInfo}>
                <InfoIcon />
                <Typography variant="caption">Meeting Info</Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Drawer
          anchor="right"
          open={meetingInfoOpen}
          onClose={toggleMeetingInfo}
          PaperProps={{
            sx: {
              width: '25%',
              maxWidth: '400px',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
              padding: '12px',
              marginTop: '10px',
              marginBottom: '10px',
              marginRight: '10px',
              height: '86vh',
            },
          }}
        >
          <Box sx={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', pb: 1 }}>
          Hodego Session Overview
              <IconButton onClick={toggleMeetingInfo}>
                <CloseIcon />
              </IconButton>
            </Typography>

            <Box sx={{ backgroundColor: '#e9ecef', padding: '8px', margin: '16px 0', borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
              This is your scheduled session. Please check the session details below:
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Session</Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                {date} {'  ' + time}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Sports Expert: {mentorName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Sports Enthusiast: {menteeName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
            Notes: {meetingAgenda}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Session Duration: {sessionTime} Minutes
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
             Join via Hodego Platform
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
              Meeting ID: {meetingId}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                support@hodego.com
              </Typography>
            </Box>
          </Box>
        </Drawer>
        <HodegoInCallChat
          open={chatOpen}
          onClose={toggleChatDrawer}
          appId={siteConfig.agoraAppId}
          meetingId={meetingId}
          userId={userId}
          tokenInChat={chatToken}
          userName={`${localUser.firstName} ${localUser.lastName}`}
          // onReceiveMessage={(user, message) => {
          //   setChatNotification({ user, message });
          //   if (!chatOpen) {
          //     setUnreadCount(prev => prev + 1);
          //   }
          //   setTimeout(() => setChatNotification(null), 10000); // 20 seconds
          // }}
          onReceiveMessage={(user, message) => {
            setChatNotification({ user, message });

            if (!chatOpen) {
              setUnreadCount(prev => prev + 1);
            }

            // Clear any previous timer
            if (chatNotificationTimeoutRef.current) {
              clearTimeout(chatNotificationTimeoutRef.current);
            }

            // Set a new timeout to auto-dismiss after 10 seconds
            chatNotificationTimeoutRef.current = setTimeout(() => {
              setChatNotification(null);
            }, 10000);
          }}

        />

        {/* <Snackbar
          open={!!chatNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          message={
            chatNotification
              ? `${chatNotification.user}: ${chatNotification.message.slice(0, 100)}`
              : ''
          }
          sx={{
            backgroundColor: '#323232',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: 3,
            '& .MuiSnackbarContent-root': {
              backgroundColor: '#323232',
            },
          }}
        /> */}
        <SwipeableDrawer
          anchor="bottom"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          onOpen={() => setMobileDrawerOpen(true)}
          ModalProps={{
            keepMounted: true, // For better performance on mobile
          }}
          PaperProps={{
            sx: {
              backgroundColor: '#1c1c1c',
              padding: 3,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 6,
              backgroundColor: '#aaa',
              borderRadius: 3,
              mx: 'auto',
              marginTop: '-9px',
              mb: 2,
              cursor: 'grab',
            }}
            onMouseDown={() => setMobileDrawerOpen(false)}
            onTouchStart={() => setMobileDrawerOpen(false)}
          />


          <Box mt={4} display="flex" justifyContent="space-around" alignItems="center" sx={{marginBottom:'5%'}}>
            <Tooltip title={fullScreenOn ? 'Min' : 'Max'}>
              <IconButton
                className='agora-button'
                disabled={remoteUserJoined == false}
                // onClick={handleFullScreen}
                onClick={() => {
                  handleFullScreen();
                  setMobileDrawerOpen(false);
                }}
                sx={{ background: '#2b2b2b', color: '#fff', width: '48%', borderRadius: '12px',padding: 1, justifyContent: 'center' }}
      
                // sx={{ color: blurOn ? 'red' : 'white' }}
              >
                {fullScreenOn ?
                  <OpenInFullIcon sx={{background:'#2b2b2b',color:'white',padding: 1,width: '48%',justifyContent: 'center'}}/>
                  :
                  <CloseFullscreenIcon sx={{background:'#2b2b2b',color:'white',padding: 1,width: '48%',justifyContent: 'center'}} />
                }
                <Typography sx={{color: '#fff'}} variant="caption">{fullScreenOn ? 'Max' : 'Min'}</Typography>
              </IconButton>
            </Tooltip>
            {/* Chat Button */}
            <IconButton
              className='agora-button'
              onClick={() => {
                toggleChatDrawer();
                setMobileDrawerOpen(false);
              }}
              sx={{ background: '#2b2b2b', color: '#fff', width: '48%', borderRadius: '12px',padding: 1, justifyContent: 'center' }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                overlap="circular"
              >
                <ChatBubbleIcon sx={{ fontSize: 32, mb: 0.5 }}/>
              </Badge>
              <Typography variant="body2" align="center">
                In-call messages
              </Typography>
            </IconButton>
         
          
           
          </Box>
        </SwipeableDrawer>

        <Snackbar
          open={!!chatNotification}
          onClick={toggleChatDrawer}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: '#0C6697',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              boxShadow: 3,
              width: '320px',
              position: 'relative', 
              mb: isMobile ? '90px' : 0, // 👈 Push notification above buttons on mobile only
            },
          }}
          message={
            chatNotification ? (
              <Box display="flex" flexDirection="column">
                <Typography variant="subtitle2" fontWeight="bold">
                  <ChatBubbleIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                  New message from {chatNotification.user}
                </Typography>
                <Typography variant="body2" sx={{marginLeft:'1%',marginTop:'2%'}}>{chatNotification.message.slice(0, 100)}</Typography>
              </Box>
            ) : ''
          }

          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={(e) => {
                e.stopPropagation(); // ✅ Prevent parent click
                setChatNotification(null); // ✅ Close the Snackbar
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#fff',
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />


      </Box>
    </>
  );
};

export default AgoraVideoCall;