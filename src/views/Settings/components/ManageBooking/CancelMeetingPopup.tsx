import React, { useState,useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CancelMeetingPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string,type: string) => void;
  mentorName: string;
  date: string;
  time: string;
  statusType: string;
}

const CancelMeetingPopup: React.FC<CancelMeetingPopupProps> = ({ open, onClose, onSubmit, mentorName, date, time, statusType }) => {
  const [reason, setReason] = useState('');
  console.log('mentorName',mentorName);

  // Reset reason when popup is closed
  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  const handleCancel = () => {
    // if (reason) {
    //   onSubmit(reason);
    //   onClose();
    // } else {
    //   alert('Reason is required');
    // }
    if(reason){
      onSubmit(reason,statusType);
      handleClose(); // Clear text and close popup
      onClose();
    }
  };

  // Clear the text when closing the popup
  const handleClose = () => {
    setReason(''); // Reset text input
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className='bookingCancelDialog'
      sx={{ '& .MuiDialog-paper': { width: '600px', maxWidth: '600px' } }} // Customize width here
    >
      <DialogTitle sx={{fontSize:'20px',fontWeight:'bold'}}>
        {statusType == 'cancel' ? 'Cancel Meeting': 'Decline Meeting'}
        <IconButton
          aria-label="close"
          onClick={onClose}
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
      <DialogContent>
        <Typography variant="body1">
          {statusType == 'cancel' ? 'Cancel': 'Decline'} your session with <strong>{mentorName}</strong>
        </Typography>
        <Typography variant="body2">
          <span style={{ marginRight: '8px' }}>{date}</span> {time}
        </Typography>
        <Box mt={2}>
          <TextField
            label={`Send a personal message to ${mentorName}`}
            placeholder= {`Let them know why you are ${statusType == 'cancel'?'canceling':'declining'} the session with them`}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            error={!reason}
            // helperText={!reason && 'Reason is required'}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{margin:'0 2% 2% 0'}}>
        <Button onClick={handleCancel} sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(90deg, #0C6697, #73A870)',
          }}} variant="contained">
          {statusType == 'cancel' ? 'Cancel': 'Decline'} This Meeting
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelMeetingPopup;
