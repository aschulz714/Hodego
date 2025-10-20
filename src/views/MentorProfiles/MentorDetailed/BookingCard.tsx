import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Radio, RadioGroup, FormControlLabel, Button, Box, Snackbar, Alert} from '@mui/material';
import { StaticDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, endOfMonth, startOfToday, isBefore, addMonths, addDays, startOfMonth, parse  } from 'date-fns';
import siteConfig from '../../../theme/site.config';
import { getData,postData,putData } from '../../../theme/Axios/apiService';
// import queryString from 'query-string';
import { useNavigate } from 'react-router-dom';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';



interface BookingCardProps {
  accountStatus: string;
  recurrenceEnds: string;
  menteeStatus: boolean;
  rescheduleRequest: number;
  rescheduledBy: string;
  mentorName: string;
  mentorUserId: number;
  mentorSessions: Array<{ time: string; rate: string; discount: string }>;
  currencyId: string;
  sameDayBooking: number;
  mentorId: number;
  bookingId: number;
  type: string;
  preview: boolean;
  bookingStatus: string;
  rescheduleMessage: string;
  onBookSession: (status) => any;
}

const BookingCard: React.FC<BookingCardProps> = ({ rescheduledBy,accountStatus,recurrenceEnds,menteeStatus,rescheduleRequest,bookingStatus, mentorUserId, mentorSessions, currencyId,sameDayBooking, mentorId, type,preview, bookingId,rescheduleMessage,onBookSession }) => {
  const navigate = useNavigate();
  console.log('rescheduleMessage',rescheduleMessage);
  const [selectedService, setSelectedService] = useState<string>('1:1 mentorship');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentTimeZone, setCurrentTimeZone] = useState('');
  const [unavailableStatus,setUnavailableStatus] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [dateSlotsMap, setDateSlotsMap] = useState<{ [key: string]: string[] }>({});
  const [fromDate,setFromDate] = useState(startOfToday());
  const [toDate, setToDate] = useState(addDays(endOfMonth(fromDate),1));
  const [reason, setReason] = useState('');
  // const queries = queryString.parse(location.search);
  // const mentorId = queries.id ? Number(queries.id) : 0;
  const [startTime,setStartTime] = useState<Date | null>(null);
  const [endTime,setEndTime] = useState<Date | null>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const timezoneMap = {
    'Asia/Calcutta': 'Asia/Kolkata',
    'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
    'Asia/Saigon': 'Asia/Ho_Chi_Minh',
    'Europe/Nicosia': 'Asia/Nicosia',
    'Pacific/Ponape': 'Pacific/Pohnpei',
  };
  const today = startOfToday();
  const isTodaySelected = selectedDate && selectedDate.toDateString() === today.toDateString();
  const isFreeTrial = selectedOption === '10';
  const freeQuery = isFreeTrial ? 'true' : 'false';



  useEffect(() => {
    if (mentorId && mentorId !== 0 && mentorSessions.length > 0) {
      let slotDuration = parseInt(selectedOption);
      if(!selectedOption){
        slotDuration = parseInt(mentorSessions[0].time);
      }
      fetchAvailableSlotsData(slotDuration);
      if(selectedOption == ''){
        setSelectedOption(mentorSessions[0].time);
      }
    }
  }, [mentorId, mentorSessions, fromDate,toDate]);

  const getUpdatedTimezone = (timezone: string) => {
    return timezoneMap[timezone] || timezone;
  };

  const fetchAvailableSlotsData = async (slotDuration: number) => {
    const timeZone = getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setCurrentTimeZone(timeZone);
    
    const fromDateString = fromDate.toISOString();
    const toDateString = toDate.toISOString();

    const url = `${siteConfig.hodegoUrl}mentor/${mentorId}/availability/slots?timeZone=${encodeURIComponent(timeZone)}&fromDate=${encodeURIComponent(fromDateString)}&toDate=${encodeURIComponent(toDateString)}&slotDuration=${slotDuration}`;
    const response = await getData(url);
    if (response && response.data && response.data.days.length > 0) {
      // const availableTmpDates = response.data.days
      //   .filter(day => day.status === 'available' && day.slots.length > 0)
      //   .map(day => new Date(day.date));
      const availableTmpDates = response.data.days
        .filter(day => day.status === 'available' && day.slots.length > 0)
        .map(day => {
          // const dayDate = new Date(day.date);
          const [year, month, day1] = day.date.split('-').map(Number);
          const dayDate = new Date(year, month - 1, day1);
          const today = new Date();
          if(sameDayBooking != 1){
            if (dayDate.toDateString() === today.toDateString()) {
              return null; 
            }
          }
          return dayDate;
        })
        .filter(date => date !== null);
      setAvailableDates(availableTmpDates);
      const slotsMap = response.data.days.reduce((acc, day) => {
        if (day.status === 'available' && day.slots.length > 0) {
          // acc[format(new Date(day.date), 'yyyy-MM-dd')] = day.slots.map(slot => format(new Date(slot.startTime), 'hh:mm a').replace(/(AM|PM)/, ' $1'));
          acc[day.date] = day.slots.map(slot => ({
            time: format(new Date(slot.startTime), 'hh:mm a').replace(/(AM|PM)/, ' $1'),
            fromTime: slot.startTime,
            toTime: slot.endTime,
            status: slot.status
          }));
        }
        return acc;
      }, {});
      console.log('slotsMap',slotsMap);
      setDateSlotsMap(slotsMap);
    }
  };

  const handleServiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedService(event.target.value);
  };
  const buttonText = bookingStatus == '1' || (bookingStatus == '0' && sameDayBooking == 1 && isTodaySelected) ? 'Request to Book' : 'Book Now';
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(null);
    setAvailableTimes([]);
    setSelectedOption(event.target.value);
    const slotDuration = parseInt(event.target.value);
    fetchAvailableSlotsData(slotDuration);
  };
  const onMonthChange = (month: Date) =>{
    setSelectedDate(null);
    setUnavailableStatus(true);
    setAvailableTimes([]);
    setFromDate(startOfMonth(month));
    setToDate(addDays(endOfMonth(month),1));
  };
  const getRateByTime = (time) => {
    for (let i = 0; i < mentorSessions.length; i++) {
      if (mentorSessions[i].time === time) {
        return parseFloat(mentorSessions[i].rate);
      }
    }
    return 0;
  };
  const handleBookingClick = async() => {
    const isoDate = selectedDate;
    const date = new Date(isoDate);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    const formattedDate = localDate.toISOString().split('T')[0];
    const formData = {
      'mentorId': mentorId,
      'date': formattedDate,
      'fromTime': startTime,
      'toTime': endTime,
      'currencyId': currencyId,
      'bookedBy': parseInt(localStorage.getItem('userId')),
      'timeZone': currentTimeZone,
      'sessionTime': selectedOption,
      'amount': getRateByTime(selectedOption),
      'isTodaySelected': isTodaySelected,
      'bookingStatus': bookingStatus,
      'free': freeQuery,
    };
    let currentBookingId = 0;
    if(localStorage.getItem('userId')){
      if(type == 'manageBooking'){
        const updatedData = {
          'status':rescheduleRequest == 1 && rescheduledBy != 'user'? 'accept':'reschedule',
          // 'status': 'reschedule',
          'updatedBy' : 'user',
          'date': formattedDate,
          'fromTime': startTime,
          'toTime': endTime,
          'rescheduleMessage': reason,
          'timeZone': currentTimeZone, 
        };
        try{
          const response = await putData(updatedData, `${siteConfig.hodegoUrl}mentor/booking/${bookingId}`);
          if (response) {
            if(response.data.status == true){
              onBookSession('');
            }
            else if(response.data.status == false){
              onBookSession(response.data.message);
            }
          }
        } catch (error) {
          console.error('Error in handleBookingClick:', error);
        }
      }
      else{
        const response = await postData(formData, `${siteConfig.hodegoUrl}mentor/booking`);
        if (response) {
          if (response.data.status == true && response.data.bookingId) {
            currentBookingId = response.data.bookingId;
            if (localStorage.getItem('userType') !== null) {
              navigate(`/book-now?id=${response.data.bookingId}&bookingStatus=${bookingStatus}&isTodaySelected=${isTodaySelected}&free=${freeQuery}`);
            } else {
              // localStorage.setItem('bookingId',String(response.data.bookingId));
              navigate(`/book-now?id=${response.data.bookingId}&bookingStatus=${bookingStatus}&isTodaySelected=${isTodaySelected}&free=${freeQuery}`);
            }
          }
          else if(response.data.status == false){
            setErrorMessage(response.data.message);
            setNotificationOpen(true);
          }
        }
      }
    }
    else{
      localStorage.removeItem('bookingDetails');
      localStorage.setItem('bookingDetails',JSON.stringify(formData));
      navigate(`/book-now?id=${currentBookingId}&bookingStatus=${bookingStatus}&isTodaySelected=${isTodaySelected}&free=${freeQuery}`);
    }
    
    
  };
  const handleDateChange = (date: Date | null) => {
    console.log(date);
    setSelectedDate(date);
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      const isoDate = date;
      const date1 = new Date(isoDate);
      const offset = date1.getTimezoneOffset();
      const localDate = new Date(date1.getTime() - offset * 60 * 1000);
      console.log('date1',date1);
      const formattedDate = localDate.toISOString().split('T')[0];
      console.log('formattedDate',formattedDate);
      setAvailableTimes(dateSlotsMap[dateString] || []);
      setSelectedTime(null);
    } else {
      setAvailableTimes([]);
    }
  };

  const handleTimeClick = (time: any) => {
    setSelectedTime(time.time);
    if(time.status == 'unavailable' || parseInt(localStorage.getItem('userId')) == mentorUserId) {
      setUnavailableStatus(true);
    }
    else{
      if(preview == true){
        setUnavailableStatus(true);
      }else{
        setUnavailableStatus(false);
      }
    }
    setStartTime(time.fromTime);
    setEndTime(time.toTime);
    console.log('selectedTime',selectedTime);
  };

  const getCurrencySymbol = (rate: number, currency: string) => {
    if (!currency) return rate.toString();
    const currencyCode = currency;
    const locale = 'en-US';
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    });
    const formattedAmount = formatter.format(rate);
    return formattedAmount;
  };

  return (
    <Card sx={{ overflowY:'auto',borderRadius: '20px', width: '100%', marginBottom: '16px', boxShadow: type == 'manageBooking'?'':'0 -3px 10px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.1)' }}>
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
      <CardContent sx={{ padding: isMobile ? '2%' : '3%' }}>
        {/* Conditionally render the title based on screen size */}
        {type == 'manageBooking' && menteeStatus == true && rescheduledBy == 'user'?
          <TextField
            sx={{marginBottom:'4%'}}
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
          :
          ''
        }
        {!isMobile && type != 'manageBooking' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginBottom: '16px' }}>
            <Typography
              variant="h5"
              sx={{padding: isMobile ? '2%' : '0' , fontWeight: 'bold'}}
            >
        Book A Session
            </Typography>
          </Box>
        )}

        <Typography variant="h6" sx={{marginBottom: '8px', fontWeight: 'bold'}}>
          Select Service
        </Typography>
        <RadioGroup value={selectedService} onChange={handleServiceChange}>
          <FormControlLabel
            value="1:1 mentorship"
            control={<Radio />}
            label="1:1 Video Call"
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '8px 16px',
              margin: '8px 0',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: selectedService === '1:1 mentorship' ? '#131728' : '#fff',
              color: selectedService === '1:1 mentorship' ? '#fff' : '#131728',
            }}
          />
        </RadioGroup>

        <Typography variant="h6" sx={{marginTop: '16px',fontWeight: 'bold'}}>
          Select Session
        </Typography>
        <RadioGroup value={selectedOption} onChange={handleOptionChange}>
          {mentorSessions.map((session, index) => (
            <FormControlLabel
              key={index}
              value={session.time}
              control={<Radio />}
              label={
                <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>
                    {session.time === '10' ? '10 minutes - Free Session' : `${session.time} minutes`}
                  </span>

                  {session.time == '10' ? 
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', marginRight: '4px' }}>  
                        <Tooltip title="This free session is allowed only one time" placement='top' arrow
                          disableInteractive={isMobile} // Only disable interactivity on mobile
                          enterTouchDelay={0} // Ensures immediate display on touch 
                        >
                     
                          <InfoOutlinedIcon fontSize="small" sx={{ marginLeft: '4px', cursor: 'pointer' }} />
                        </Tooltip>
                      </span>
                    </Box>
                    :
                    <span>{getCurrencySymbol(Number(session.rate), currencyId)}</span>
                  }
                
                </Typography>
              }
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '8px 16px',
                margin: '8px 0',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: selectedOption === session.time ? '#131728' : '#fff',
                color: selectedOption === session.time ? '#fff' : '#131728',
              }}
            />
          ))}
        </RadioGroup>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ marginTop: '16px', fontWeight: 'bold', color: '#131728' }}>
            {currentTimeZone ? `In your local timezone (${currentTimeZone})` : ''}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{marginTop: '16px',fontWeight: 'bold'}}>
          Select Date
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticDatePicker
            className='hodegoCalendar'
            value={selectedDate}
            onMonthChange={onMonthChange}
            onChange={handleDateChange}
            shouldDisableDate={(date) => {
              const today = startOfToday();
              const isInCurrentMonth = date.getMonth() === today.getMonth();
              return (isInCurrentMonth && isBefore(date, today)) || !availableDates.some(availableDate => format(availableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
            }}
            displayStaticWrapperAs="desktop"
            slots={{ actionBar: null }}
            disablePast
            disableFuture={false}
            minDate={startOfToday()}
            maxDate={recurrenceEnds === 'never'
              ? endOfMonth(addMonths(startOfToday(), 3))
              : parse(recurrenceEnds, 'yyyy-MM-dd', new Date())}
            slotProps={{
              day: {
                sx: {
                  width: '80px',
                  height: '48px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '1rem',
                  borderRadius: '50%',
                },
                selected: true,
                today: true,
              },
            }}
            sx={{
              '&.hodegoCalendar .MuiDateCalendar-root': {
                width: '400px',
                height: '380px',
                minHeight: '380px',
              },
              '& .MuiPickersSlideTransition-root.MuiDayCalendar-slideTransition':{
                minHeight: '380px',
              },
              '& .MuiDayCalendar-header .MuiDayCalendar-weekDayLabel': {
                width: '44px',
                height: '32px',
                fontWeight: '800',
              },
              '&.hodegoCalendar .MuiPickersDay-root': {
                width: '44px',
                height: '44px',
                fontWeight: '700',
              },
              '&.hodegoCalendar .MuiPickersDay-root.Mui-selected': {
                backgroundColor: '#131728 !important',
                color: '#ffffff !important',
              },
              '&.hodegoCalendar .MuiPickersDay-root:not(.Mui-disabled)': {
                backgroundColor: '#eaf5fcb3',
                color: '#0C6697',
              },
              '& .MuiTypography-root': {
                fontSize: '1rem',
              },
              '& .MuiPickerStaticWrapper-root': {
                width: '100%',
                maxWidth: 'none',
                height: 'auto',
              },
              '& .MuiPickersCalendarHeader-root': {
                marginBottom: '16px',
              },
              '& .MuiPickersCalendarHeader-labelContainer': {
                fontSize: '1.2rem',
                pointerEvents: 'none'
              },
              '& .MuiPickersCalendar-weekContainer': {
                justifyContent: 'space-around',
              },
              '& .MuiPickersCalendarHeader-labelContainer .MuiButtonBase-root.MuiIconButton-root': {
                display: 'none', // This hides the dropdown arrow
              },
            }}
          />
        </LocalizationProvider>

        {selectedDate && availableTimes.length > 0 && (
          <>
            <Box sx={{ marginTop: '7%', marginBottom: '7%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginTop: '16px' }}>
                Available Times for {format(selectedDate, 'EEEE, MMMM d')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              {availableTimes.map((availableTime) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: isMobile?'45%':'35%',
                    borderRadius: '21px',
                  }}
                  key={availableTime.time}
                  onClick={() => handleTimeClick(availableTime)}
                >
                  <Button
                    variant="contained"
                    sx={{
                      opacity:availableTime.status == 'unavailable' ? '0.6' : '1',
                      pointerEvents:availableTime.status == 'unavailable' ? 'none' : 'cursor',
                      width: '100%',
                      borderRadius: '20px',
                      border: selectedTime === availableTime.time ? availableTime.status == 'unavailable' ? 'none': '3px solid #131728' : 'none',
                      padding: '8px 16px',
                      background: selectedTime === availableTime.time ? 'linear-gradient(90deg,#73A870, #0C6697)' : 'linear-gradient(90deg,#73A870, #0C6697)',
                    }}
                  >
                    {availableTime.time}
                  </Button>
                </Box>
              ))}
            </Box>
          </>
        )}

        <Box sx={{ marginTop: '6%', marginLeft: isMobile?'0':'14%', width: '100%' }}>
          <Button
            onClick={accountStatus == 'suspended'? null : handleBookingClick}
            variant="contained"
            disabled={!selectedTime || unavailableStatus}
            sx={{
              width: isMobile?'100%':'72%',
              borderRadius: '20px',
              padding: '12px 0',
              background: '#131728',
              fontSize: '1.2rem',
              '&:hover': {
                background: '#131728',
              },
            }}
          >
            {accountStatus == 'suspended'?'Temporarily Unavailable':buttonText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingCard;