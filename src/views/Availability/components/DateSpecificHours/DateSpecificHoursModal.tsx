import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LocalizationProvider, DateCalendar, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
dayjs.extend(customParseFormat);

interface TimeField {
  startTime: string;
  endTime: string;
  error?: string;
}

interface DateSpecificHoursModalProps {
  selectedMaxDates: any;
  open: boolean;
  onClose: () => void;
  onApply: (date: Dayjs | null, timeFields: TimeField[]) => void;
  initialData?: { date: string; startTime: string; endTime: string }[] | null;
}

const DateSpecificHoursModal: React.FC<DateSpecificHoursModalProps> = ({ selectedMaxDates,open, onClose, onApply, initialData }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [timeFields, setTimeFields] = useState<TimeField[]>([]);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const theme = useTheme();
  const today = dayjs();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
  useEffect(() => {
    console.log('initialData:', initialData);
  
    if (initialData && initialData.length > 0) {
      const parsedDate = dayjs(initialData[0]?.date, 'MMMM D, YYYY');
      if (parsedDate.isValid()) {
        setSelectedDate(parsedDate);
  
        // Check if all intervals are empty (i.e., date is unavailable)
        const isUnavailable = initialData.every((data) => !data.startTime || !data.endTime);
  
        if (isUnavailable) {
          setTimeFields([]); // Keep time fields empty
          setShowUnavailable(true); // Show "Unavailable" status
        } else {
          setTimeFields(
            initialData.map((data) => ({
              startTime: data.startTime || '',
              endTime: data.endTime || '',
              error: '',
            }))
          );
          setShowUnavailable(false);
        }
      } else {
        console.warn('Initial date parsing failed, setting default date');
        setSelectedDate(null);
        setTimeFields([]);
        setShowUnavailable(false);
      }
    } else {
      setSelectedDate(null);
      setTimeFields([]);
      setShowUnavailable(false);
    }
  }, [initialData]);
  
  
  

  const handleTimeFieldChange = (index: number, field: string, value: string) => {
    const newTimeFields = [...timeFields];
    newTimeFields[index][field] = value;
    newTimeFields[index].error = validateTimes(newTimeFields, index);
    setTimeFields(newTimeFields);
    updateAllFieldErrors(newTimeFields);
  };
  const currentFormatTime = (time) =>{
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const dateWithTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return dateWithTime;
  };
  const handleAddTimeField = () => {
    let newTimeFields;
    if(timeFields.length> 0) {
      
      const newStartTime = currentFormatTime(timeFields[timeFields.length - 1].endTime);
      newStartTime.setHours(newStartTime.getHours() + 1);
      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newEndTime.getHours() + 1);
      newTimeFields = [...timeFields, { startTime: dayjs(newStartTime).format('HH:mm'), endTime:dayjs(newEndTime).format('HH:mm'), error: '' }];
    }
    else{
      const newStartTime = dayjs().hour(9).minute(0).second(0).format('HH:mm');
      const newEndTime = dayjs().hour(17).minute(0).second(0).format('HH:mm');
      newTimeFields = [...timeFields, { startTime: newStartTime, endTime: newEndTime, error: '' }];
    }
    
    setTimeFields(newTimeFields);
    updateAllFieldErrors(newTimeFields);
    setShowUnavailable(false);
  };

  const handleRemoveTimeField = (index: number) => {
    const newTimeFields = [...timeFields];
    newTimeFields.splice(index, 1);
    setTimeFields(newTimeFields);
    updateAllFieldErrors(newTimeFields);
    if (newTimeFields.length === 0) {
      setShowUnavailable(true);
    }
  };

  const validateTimes = (fields: TimeField[], currentIndex: number) => {
    const { startTime, endTime } = fields[currentIndex];

    const crossesMidnight = startTime > endTime;

    if (!crossesMidnight && startTime === endTime) {
      return 'Start Time and End Time Cannot Be The Same.';
    }

    if (!crossesMidnight && startTime > endTime) {
      return 'Start Time Cannot Be Greater Than End Time.';
    }

    for (let i = 0; i < fields.length; i++) {
      if (i !== currentIndex) {
        const { startTime: otherStart, endTime: otherEnd } = fields[i];

        const otherCrossesMidnight = otherStart > otherEnd;

        if (!crossesMidnight && !otherCrossesMidnight) {
          if (
            (startTime >= otherStart && startTime < otherEnd) ||
                    (endTime > otherStart && endTime <= otherEnd) ||
                    (startTime <= otherStart && endTime >= otherEnd)
          ) {
            return 'Times Overlap with Another Set of Times.';
          }
        } else if (crossesMidnight && !otherCrossesMidnight) {
          if (
            (startTime < otherEnd) ||
                    (endTime > otherStart)
          ) {
            return 'Times Overlap with Another Set of Times.';
          }
        } else if (!crossesMidnight && otherCrossesMidnight) {
          if (
            (otherStart < endTime) ||
                    (otherEnd > startTime)
          ) {
            return 'Times Overlap with Another Set of Times.';
          }
        } else {
          return 'Times Overlap with Another Set of Times.';
        }
      }
    }

    return '';
  };


  const updateAllFieldErrors = (fields: TimeField[]) => {
    const updatedFields = fields.map((field, index) => ({
      ...field,
      error: validateTimes(fields, index),
    }));
    setTimeFields(updatedFields);
  };

  const handleApply = () => {
    if (selectedDate && timeFields.every((field) => field.startTime && field.endTime && !field.error)) {
      onApply(selectedDate, timeFields);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedDate(null);
    setTimeFields([]);
    setShowUnavailable(false);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleCloseModal} aria-labelledby="dialog-title" aria-describedby="dialog-description" sx={{ width: isMobileScreen?'100%':'500px', maxWidth: '480px', mx: 'auto' }}>
        <DialogTitle id="dialog-title">Select the Date(s) You Want to Assign Specific Hours</DialogTitle>
        <DialogContent dividers>
          <DateCalendar
            value={selectedDate || today} // Default to today if selectedDate is null
            minDate={today}
            maxDate={
              selectedMaxDates && dayjs(selectedMaxDates).isSame(dayjs().subtract(1, 'day'), 'day')
                ? undefined
                : selectedMaxDates && dayjs(selectedMaxDates).isSame(dayjs(), 'day')
                  ? dayjs()
                  : selectedMaxDates
                    ? dayjs(selectedMaxDates)
                    : undefined
            }
            onChange={(newValue) => {
              if (newValue && dayjs(newValue).isValid()) {
                setSelectedDate(dayjs(newValue));
                setTimeFields([{ startTime: '09:00', endTime: '17:00', error: '' }]);
                setShowUnavailable(false);
              } else {
                setSelectedDate(null);
                setTimeFields([]);
                setShowUnavailable(false);
              }
            }}
            sx={{ mb: 2, marginTop: '5%' }}
          />

          {selectedDate && (
            <Box sx={{ borderTop: '1px solid #ccc', pt: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontSize: '15px', marginBottom: '7%', marginTop: '5%' }}>
                What Hours Are You Available?
              </Typography>
              {showUnavailable ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body1">Unavailable</Typography>
                  <Tooltip title="New Interval">
                    <IconButton onClick={handleAddTimeField} size="small">
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Box>
                  {timeFields.map((field, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        width:isMobile && index != 0?'88%':'100%'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          width: '100%',
                        }}
                      >
                        <TimePicker
                          label="Start Time"
                          value={field.startTime ? dayjs(field.startTime, 'HH:mm') : null}
                          onChange={(newValue) => handleTimeFieldChange(index, 'startTime', newValue ? newValue.format('HH:mm') : '')}
                          sx={{ width: '126px', height: '45px', marginTop: index === 0 ? '4%' : '4%' }}
                        />
                        <Box>-</Box>
                        <TimePicker
                          label="End Time"
                          value={field.endTime ? dayjs(field.endTime, 'HH:mm') : null}
                          onChange={(newValue) => handleTimeFieldChange(index, 'endTime', newValue ? newValue.format('HH:mm') : '')}
                          sx={{ width: '126px', height: '45px', marginTop: index === 0 ? '4%' : '4%' }}
                        />
                        <Tooltip title={`Remove Interval ${index + 1}`}>
                          <IconButton onClick={() => handleRemoveTimeField(index)} size="small" sx={{ marginTop: '5%' }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {index === 0 && (
                          <Tooltip title="New Interval">
                            <IconButton onClick={handleAddTimeField} size="small" sx={{ marginTop: '5%' }}>
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      {field.error && (
                        <Typography variant="body2" color="error" sx={{ alignSelf: 'flex-start', fontSize: '17px', marginTop: '5%' }}>
                          {field.error}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pt: 2, display: 'flex', justifyContent: 'center', gap: 2, marginTop: '8%', marginBottom: '7%' }}>
          <Button onClick={handleCloseModal} variant="outlined" sx={{ width: '170px' }}>
            Cancel
          </Button>
          <Button onClick={handleApply} variant="contained" sx={{ width: '170px',background: 'linear-gradient(90deg, #0C6697, #73A870)' }}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default DateSpecificHoursModal;