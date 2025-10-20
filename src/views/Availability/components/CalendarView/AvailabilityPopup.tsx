import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Box,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RemoveIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface AvailabilityPopupProps {
  open: boolean;
  onClose: () => void;
  onApply: (availability: { startTime: string; endTime: string }[]) => void;
  day: string;
  selectedDayValues: any;
}

const AvailabilityPopup: React.FC<AvailabilityPopupProps> = ({
  open,
  onClose,
  onApply,
  day,
  selectedDayValues,
}) => {
  const initialStartTime = new Date(2023, 0, 1, 9, 0);
  const initialEndTime = new Date(2023, 0, 1, 17, 0);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [availabilities, setAvailabilities] = useState([
    {
      startTime: initialStartTime,
      endTime: initialEndTime,
      main: true,
      available: true,
      error: '',
    },
  ]);

  useEffect(() => {
    if (open) {
      const tempValue = [];
      selectedDayValues.forEach((interval) => {
        const [startHour, startMinute] = interval.startTime.split(':').map(Number);
        const [endHour, endMinute] = interval.endTime.split(':').map(Number);
        tempValue.push({
          startTime: new Date(0, 0, 0, startHour, startMinute),
          endTime: new Date(0, 0, 0, endHour, endMinute),
          main: true,
          available: true,
          error: '',
        });
      });
      setAvailabilities(tempValue);
    }
  }, [open, day, selectedDayValues]);

  const generateNewTimeInterval = () => {
    if (availabilities.length === 0) {
      // Default times when no availabilities exist
      const startTime = new Date(2023, 0, 1, 9, 0);
      const endTime = new Date(2023, 0, 1, 10, 0);
      return { startTime, endTime };
    } else {
      const lastEndTime = new Date(availabilities[availabilities.length - 1].endTime);
      const startTime = new Date(lastEndTime);
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      return { startTime, endTime };
    }
  };

  // const checkForOverlap = (newAvailabilities: any) => {
  //   let hasOverlap = false;
  //   for (let i = 0; i < newAvailabilities.length; i++) {
  //     for (let j = i + 1; j < newAvailabilities.length; j++) {
  //       if (
  //         newAvailabilities[i].available &&
  //         newAvailabilities[j].available &&
  //         newAvailabilities[i].startTime < newAvailabilities[j].endTime &&
  //         newAvailabilities[i].endTime > newAvailabilities[j].startTime
  //       ) {
  //         newAvailabilities[i].error = 'Times overlap with another set of times.';
  //         newAvailabilities[j].error = 'Times overlap with another set of times.';
  //         hasOverlap = true;
  //       }
  //     }
  //   }
  //   return hasOverlap;
  // };

  // Improved validateAvailabilities function
  const validateAvailabilities = (newAvailabilities: any) => {
    let hasError = false;

    newAvailabilities.forEach((availability: any) => {
      if (availability.available) {
        if (availability.startTime >= availability.endTime) {
          availability.error = 'Choose an end time later than the start time.';
          hasError = true;
        } else {
          availability.error = '';
        }
      } else {
        availability.error = '';
      }
    });

    // Check for overlap errors separately
    if (checkForOverlap(newAvailabilities)) {
      hasError = true;
    }

    return hasError;
  };

  // Example overlap validation function
  const checkForOverlap = (availabilities: any) => {
    for (let i = 0; i < availabilities.length; i++) {
      for (let j = i + 1; j < availabilities.length; j++) {
        if (
          availabilities[i].startTime < availabilities[j].endTime &&
        availabilities[i].endTime > availabilities[j].startTime
        ) {
          availabilities[i].error = 'Times overlap with another set of times.';
          availabilities[j].error = 'Times overlap with another set of times.';
          return true;
        }
      }
    }
    return false;
  };

  const handleApply = () => {
    const newAvailabilities = [...availabilities];

    if (validateAvailabilities(newAvailabilities)) {
      setAvailabilities(newAvailabilities);
      return;
    }
    const formattedAvailabilities = availabilities
      .filter((a) => a.available)
      .map(({ startTime, endTime }) => ({
        startTime: startTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        endTime: endTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      }));
    onApply(formattedAvailabilities);
    onClose();
  };

  const handleAdd = () => {
    const { startTime, endTime } = generateNewTimeInterval();
    const newAvailabilities = [
      ...availabilities,
      { startTime, endTime, main: true, available: true, error: '' },
    ];
    validateAvailabilities(newAvailabilities);
    setAvailabilities(newAvailabilities);
  };

  const handleRemove = (index: number) => {
    const newAvailabilities = [...availabilities];
    // if (newAvailabilities[index].main) {
    //   newAvailabilities[index].available = false;
    //   newAvailabilities[index].error = '';
    // } else {
    newAvailabilities.splice(index, 1);
    // }
    validateAvailabilities(newAvailabilities);
    setAvailabilities(newAvailabilities);
  };

  // const handleReactivate = () => {
  //   const newAvailabilities = [...availabilities];
  //   const mainIndex = newAvailabilities.findIndex((a) => a.main);
  //   if (mainIndex !== -1) {
  //     const { startTime, endTime } = generateNewTimeInterval();
  //     newAvailabilities[mainIndex].startTime = startTime;
  //     newAvailabilities[mainIndex].endTime = endTime;
  //     newAvailabilities[mainIndex].available = true;
  //     validateAvailabilities(newAvailabilities);
  //   }
  //   setAvailabilities(newAvailabilities);
  // };

  const handleTimeChange = (
    index: number,
    type: 'startTime' | 'endTime',
    newValue: Date | null
  ) => {
    const newAvailabilities = [...availabilities];
  
    if (newValue) {
      newAvailabilities[index][type] = newValue;
  
      // Validate time comparison and set error message accordingly
      if (
        (type === 'startTime' && newAvailabilities[index].endTime <= newValue) ||
        (type === 'endTime' && newAvailabilities[index].startTime >= newValue)
      ) {
        newAvailabilities[index].error = 'Choose an end time later than the start time.';
      } else {
        newAvailabilities[index].error = '';
      }
  
      // Validate all availabilities to check for other errors like overlap
      const hasError = validateAvailabilities(newAvailabilities);
  
      // Update state only after full validation
      if (!hasError) {
        setAvailabilities(newAvailabilities);
      } else {
        setAvailabilities(newAvailabilities);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          minWidth: isMobileScreen ? '95%' : '450px',
          borderRadius: '10px',
        },
      }}
    >
      <DialogTitle>
        <span style={{ fontSize: '25px', fontWeight: 500 }}>{`${day} availability`}</span>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Typography variant="subtitle1" gutterBottom sx={{ marginBottom: '5%', pb: 1 }}>
            What hours are you available?
          </Typography>
          {availabilities.length > 0 ? (
            availabilities.map((availability, index) => (
              <Box key={index} display="flex" flexDirection="column" mb={2}>
                <Box display="flex" alignItems="center" position="relative">
                  {availability.available ? (
                    <>
                      <TimePicker
                        label="Start Time"
                        value={availability.startTime}
                        onChange={(newValue) => handleTimeChange(index, 'startTime', newValue)}
                        sx={{
                          width: '125px',
                          '& .MuiInputBase-root': {
                            height: 50,
                          },
                        }}
                      />
                      <Box mx={1}>-</Box>
                      <TimePicker
                        label="End Time"
                        value={availability.endTime}
                        onChange={(newValue) => handleTimeChange(index, 'endTime', newValue)}
                        sx={{
                          width: '125px',
                          '& .MuiInputBase-root': {
                            height: 50,
                          },
                        }}
                      />
                      <Tooltip title={`Remove Interval ${index + 1}`}>
                        <IconButton onClick={() => handleRemove(index)} style={{ marginLeft: 6 }}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {availability.main && (
                        <Tooltip title="New Interval">
                          <IconButton onClick={handleAdd} style={{ position: 'relative', left: '15%' }}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  ) : ''}
                </Box>
                {availability.available && availability.error && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {availability.error}
                  </Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 2 }}>
              No availabilities set.
            </Typography>
          )}
          {/* Add Button for Empty Availabilities */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{display:availabilities.length > 0?'none':'flex'}} // Optional: Limit the number of availabilities
            >
              Add Availability
            </Button>
          </Box>
          <Divider sx={{ my: 2, mt: 4 }} />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ padding: '0 24px 24px' }}>
        <Button onClick={onClose} variant="outlined" sx={{ flex: 1, marginRight: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            flex: 1,
            backgroundColor: '#73A870',
            background: 'linear-gradient(90deg, #0C6697, #73A870)',
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvailabilityPopup;
