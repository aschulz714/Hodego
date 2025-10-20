import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import BlurOnTwoToneIcon from '@mui/icons-material/BlurOnTwoTone';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import './HodegoVideoCallPreview.css';
import AgoraRTC from 'agora-rtc-sdk-ng';

import VirtualBackgroundExtension from 'agora-extension-virtual-background';
import Main from 'layouts/Main';

const HodegoVideoCallPreview: React.FC<{ 
  onJoin: (audioMuted: boolean, videoMuted: boolean, blurOn: boolean) => void, 
  initialMuteAudio: boolean, 
  initialMuteVideo: boolean,
  initialBlurOn: boolean,
  localUser: { firstName: string; lastName: string; profilePictureUrl: string },
  remoteUser: { firstName: string; lastName: string; profilePictureUrl: string }
}> = ({ onJoin, initialMuteAudio, initialMuteVideo, initialBlurOn, localUser, remoteUser }) => {
  const [muteAudio, setMuteAudio] = useState(initialMuteAudio);
  const [muteVideo, setMuteVideo] = useState(initialMuteVideo);
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  const [joinStatus, setJoinStatus] = useState(false);
  const [isBlurred, setIsBlurred] = useState(initialBlurOn);
  const [virtualBackgroundProcessor, setVirtualBackgroundProcessor] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState(''); 
  const [micStatusMessage, setMicStatusMessage] = useState(''); 
  const [blurStatusMessage, setBlurStatusMessage] = useState('');

  useEffect(() => {
    const initPreview = async () => {
      try {
        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks(tracks);
  
        // Register & init virtual background
        const vbe = new VirtualBackgroundExtension();
        AgoraRTC.registerExtensions([vbe]);
        const processor = vbe.createProcessor();
        await processor.init('/assets/virtual-background');
        setVirtualBackgroundProcessor(processor);
  
        // Pipe & play
        tracks[1].pipe(processor).pipe(tracks[1].processorDestination);
        tracks[1].play('local-video');
        
        console.log('✅ Preview initialized');
      } catch (err: any) {
        if (err.message.includes('PERMISSION_DENIED')) {
          setJoinStatus(true);
          showStatusMessage(
            'Camera/mic access was blocked. Please enable permissions on "Settings → Safari (or Chrome) → Camera & Microphone → Allow"',
            false
          );
          // alert('Settings → Safari (or Chrome) → Camera & Microphone → Allow');
        } else {
          showStatusMessage('Failed to start preview.', false);
        }
      }
    };
  
    initPreview();
  
    return () => {
      localTracks.forEach(track => {
        try {
          track.stop();
          track.close?.();
        } catch (cleanupErr) {
          console.warn('Error stopping track:', cleanupErr);
        }
      });
      if (virtualBackgroundProcessor) {
        try {
          virtualBackgroundProcessor.disable();
        } catch (disableErr) {
          console.warn('Error disabling background processor:', disableErr);
        }
      }
    };
  }, []);  

  const showStatusMessage = (message: string, autoHide: boolean = true) => {
    setStatusMessage(message);
    if (autoHide) {
      setTimeout(() => setStatusMessage(''), 2000);
    }
  };

  const showMicStatusMessage = (message: string, autoHide: boolean = true) => {
    setMicStatusMessage(message);
    if (autoHide) {
      setTimeout(() => setMicStatusMessage(''), 2000);
    }
  };
  const showBlurStatusMessage = (message: string, autoHide: boolean = true) => {
    setBlurStatusMessage(message);
    if (autoHide) {
      setTimeout(() => setBlurStatusMessage(''), 2000);
    }
  };
  const toggleBlur = async () => {
    if (!virtualBackgroundProcessor) return;
  
    try {
      if (isBlurred) {
        await virtualBackgroundProcessor.disable();
        showBlurStatusMessage('Blur effect is off');
      } else {
        await virtualBackgroundProcessor.enable();
        await virtualBackgroundProcessor.setOptions({
          type: 'blur',
          blurDegree: 2,
        });
        showBlurStatusMessage('Blur effect is on');
      }
      setIsBlurred(!isBlurred);
    } catch (err: any) {
      console.error('❌ toggleBlur failed:', err);
      showBlurStatusMessage('Error applying blur');
    }
  };

  return (
    <Main>
      <Box
        sx={{
          bgcolor: '#1f1e1e',
          p: 2,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'white',
          position: 'relative'
        }}
        className="hodegoVideoPreview"
      >
        <Box className="hodegoVideoPreviewContent" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 2, position: 'relative' }}>
          <Box
            id="local-video"
            sx={{
              height: 400,
              width: 600,
              mb: 2,
              position: 'relative',
              backgroundColor: 'black'
            }}
          />
          {micStatusMessage && (
            <Typography
              sx={{
                position: 'absolute',
                top: 10,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '5px 10px',
                borderRadius: 1,
                fontSize: '16px',
              }}
            >
              <span style={{verticalAlign:'sub'}}>{muteAudio ? <MicOffIcon sx={{ fontSize: '20px' }} /> : <MicIcon sx={{ fontSize: '20px' }} />}</span> {micStatusMessage}
            </Typography>
          )}
          {statusMessage && (
            <Typography
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 1,
                fontSize: '24px',
              }}
              className="hodegoVideoPreviewCameraStatus"
            >
              {statusMessage}
            </Typography>
          )}
          {blurStatusMessage && (
            <Typography
              sx={{
                position: 'absolute',
                top: 10,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '5px 10px',
                borderRadius: 1,
                fontSize: '16px',
              }}
            >
              {blurStatusMessage}
            </Typography>
          )}
          <Box sx={{ position: 'absolute', bottom: '35px', display: 'flex', gap: '15px' }}>
            <IconButton
              onClick={toggleBlur}
              sx={{
                border: '2px solid white',
                borderRadius: '50%',
                padding: '10px',
                color: 'white',
                backgroundColor: isBlurred ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <BlurOnTwoToneIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                if (muteAudio) {
                  localTracks[0].setEnabled(true);
                  showMicStatusMessage('Microphone is on');
                } else {
                  localTracks[0].setEnabled(false);
                  showMicStatusMessage('Microphone is off');
                }
                setMuteAudio(!muteAudio);
              }}
              sx={{
                border: muteAudio ? 'none' : '2px solid white',
                borderRadius: '50%',
                padding: '10px',
                color: 'white',
                backgroundColor: muteAudio ? 'red' : 'transparent',
                '&:hover': {
                  backgroundColor: muteAudio ? 'red' : 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              {muteAudio ? <MicOffIcon /> : <MicIcon />}
            </IconButton>

            <IconButton
              onClick={() => {
                if (muteVideo) {
                  localTracks[1].setEnabled(true);
                  showStatusMessage('Camera is starting', true);
                } else {
                  localTracks[1].setEnabled(false);
                  showStatusMessage('Camera is off', false);
                }
                setMuteVideo(!muteVideo);
              }}
              sx={{
                border: muteVideo ? 'none' : '2px solid white',
                borderRadius: '50%',
                padding: '10px',
                color: 'white',
                backgroundColor: muteVideo ? 'red' : 'transparent',
                '&:hover': {
                  backgroundColor: muteVideo ? 'red' : 'rgba(255, 255, 255, 0.08)',
                }
              }}
            >
              {muteVideo ? <VideocamOffIcon /> : <VideocamIcon />}
            </IconButton>
          </Box>
        </Box>
        <Box className="hodegoVideoPreviewContentAlign" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Joining as</Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>{localUser ? `${localUser.firstName} ${localUser.lastName}` : `${remoteUser.firstName} ${remoteUser.lastName}`}</Typography>
          <Button
            variant="contained"
            disabled={joinStatus}
            onClick={() => {
              if (localUser && remoteUser) {
                localTracks.forEach(track => {
                  track.stop();
                  track.close();
                });
                onJoin(muteAudio, muteVideo, isBlurred);
              } else {
                console.error('User data not available. Ensure the API call is successful.');
              }
            }}
            sx={{
              width: '250px',
              padding: '10px 0',
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0C6697, #73A870)',
              }
            }}
          >
            Join
          </Button>
        </Box>
      </Box>
    </Main>
  );
};

export default HodegoVideoCallPreview;
