import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  TextField,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AgoraRTM from 'agora-rtm-sdk';

const { RTM } = AgoraRTM;

interface HodegoInCallChatProps {
  open: boolean;
  onClose: () => void;
  appId: string;
  meetingId: string;
  userId: string;
  tokenInChat: string;
  userName: string; // <-- Add this line
  onReceiveMessage?: (user: string, message: string) => void;
}


const HodegoInCallChat: React.FC<HodegoInCallChatProps> = ({ open, onClose, appId, meetingId, userId, tokenInChat,userName,onReceiveMessage }) => {
  const [rtmClient, setRtmClient] = useState<InstanceType<typeof RTM> | null>(null);
  const [messages, setMessages] = useState<Array<{ user: string; message: string; timestamp: string  }>>([]);
  const [inputValue, setInputValue] = useState<string>('');
  
  const displayRef = useRef<HTMLDivElement>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const initRTM = async () => {
      const rtm = new RTM(appId, userId);
      setRtmClient(rtm);

      // rtm.addEventListener('message', event => {
      //   const decodedMsg = typeof event.message === 'string'
      //     ? event.message
      //     : new TextDecoder().decode(event.message);
      //   setMessages(prev => [...prev, { user: event.publisher, message: decodedMsg }]);
      // });

      rtm.addEventListener('message', (event) => {
        if (event.publisher === userId) return; // Ignore own messages

        try {
          const decoded = typeof event.message === 'string'
            ? event.message
            : new TextDecoder().decode(event.message);

          const parsed = JSON.parse(decoded);
          console.log('Received message object:', parsed);

          if (parsed.type === 'text') {
            setMessages(prev => [...prev, { user: parsed.senderName, message: parsed.message, timestamp: formatTimestamp(new Date()) }]);
            if (onReceiveMessage) {
              onReceiveMessage(parsed.senderName, parsed.message);
            }
          }
        } catch (error) {
          console.error('Failed to parse incoming message:', event.message);
        }
      });





      console.log('Trying RTM login with:', {
        userId,
        tokenInChat,
      });

      await rtm.login({ token: tokenInChat });
      await rtm.subscribe(meetingId);
      console.log('Trying RTM login with:', {
        userId,
        tokenInChat,
      });
    };

    initRTM();
  }, [appId, userId, meetingId, tokenInChat]);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }
  }, [messages]);

  // const sendMessage = async () => {
  //   if (!rtmClient || !inputValue.trim()) return;
  //   const payload = inputValue;
  //   await rtmClient.publish(meetingId, payload, { channelType: 'MESSAGE' });
  //   setMessages(prev => [...prev, { user: userId, message: payload }]);
  //   setInputValue('');
  // };
  const sendMessage = async () => {
    if (!rtmClient || !inputValue.trim()) return;

    const payload = JSON.stringify({
      type: 'text',
      message: inputValue,
      senderName: userName,
    });

    await rtmClient.publish(meetingId, payload, { channelType: 'MESSAGE' });

    // Show "You" as sender
    setMessages(prev => [...prev, { user: 'You', message: inputValue, timestamp: formatTimestamp(new Date()) }]);
    setInputValue('');

    // Debug log
    console.log('Sent message payload:', payload);
  };


  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{
        sx: {
          // width: '25%',
          // maxWidth: '400px',
          // backgroundColor: '#f5f5f5',
          // borderRadius: '12px',
          // padding: '12px',
          // marginTop: '10px',
          // marginBottom: '10px',
          // marginRight: '10px',
          // height: '86vh',

          width: isMobile ? '100%' : '25%',
          maxWidth: isMobile ? '100vw' : '400px',
          backgroundColor: '#f5f5f5',
          color: 'inherit',
          padding: '12px',
          height: isMobile ? '100vh' : '86vh',
          borderRadius: isMobile ? 0 : '12px',
          marginTop: isMobile ? 0 : '10px',
          marginBottom: isMobile ? 0 : '10px',
        },
      }}
    >
      <Box sx={{ width: '100%', px: 2,marginBottom:'10%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'relative', mb: 2, pt: 1 }}>
          <Typography variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#01579b',
              pr: 4
            }}
          >
            In-call messages
          </Typography>
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 0, right: 0, padding: '8px' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          ref={displayRef}
          sx={{
            flex: 1,
            backgroundColor:'#f5f5f5',
            borderRadius: 1,
            padding: 1,
            overflowY: 'auto',
            mb: 2
          }}
        >
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold',color:'#73A870',fontSize:'14px' }}>{msg.user} <span style={{ color: 'gray', fontWeight: 'normal', marginLeft:'3%' }}> {msg.timestamp}</span>:</Typography>
                <Typography variant="body2" sx={{ marginLeft: '2px',mt:1 }}>{msg.message}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
              This chat is visible only during the session. If you leave or rejoin, chat messages won't be retained. Use it for sharing quick notes or important links.
            </Typography>
          )}
        </Box>

        <TextField
          placeholder="Send a message"
          fullWidth
          variant="outlined"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          // InputProps={{
          //   endAdornment: (
          //     <InputAdornment position="end">
          //       <IconButton onClick={sendMessage}>
          //         <SendIcon color="action" />
          //       </IconButton>
          //     </InputAdornment>
          //   )
          // }}
          InputProps={{
            sx: {
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#73A870',
                },
                '&:hover fieldset': {
                  borderColor: '#73A870',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#73A870',
                },
              },
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={sendMessage}>
                  <SendIcon color="action" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Drawer>
  );
};

export default HodegoInCallChat;
