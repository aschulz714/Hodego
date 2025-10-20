import React, { useState,useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput,DayCellContentArg   } from '@fullcalendar/core';
import { Popover, MenuItem, ListItemIcon, ListItemText, Typography, Tooltip, IconButton, Box } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import NoPhoneIcon from '../../../../assets/images/no-phone.png';
import EventTwoToneIcon from '@mui/icons-material/EventTwoTone';
import RefreshTwoToneIcon from '@mui/icons-material/RefreshTwoTone';
import Snackbar from '@mui/material/Snackbar';
// import RepeatIcon from '@mui/icons-material/Repeat';
import EventIcon from '@mui/icons-material/Event';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';
import { getData } from '../../../../theme/Axios/apiService';
import siteConfig from '../../../../theme/site.config';
import AvailabilityPopup from './AvailabilityPopup';
import DateSpecificHoursModal from '../DateSpecificHours/DateSpecificHoursModal';
import './Calendar.css';
// import { format } from 'date-fns';
// import { INITIAL_EVENTS } from './EventUtils';

interface Interval {
  to: string;
  from: string;
}

interface DaySchedule {
  type: 'wday' | 'date';
  wday?: string;
  date?: string;
  intervals: Interval[];
}
interface DateHours {
  date: string;
  startTime: string;
  endTime: string;
}
const CalendarView: React.FC<{selectedMaxDate: any,mentorId:number,handleRulesChange:(params: any[]) => void}> = ({ selectedMaxDate,mentorId,handleRulesChange }) => {
  // const today = dayjs();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuInfo, setMenuInfo] = useState<DateClickArg | null>(null);
  const [menuEventInfo, setMenuEventInfo] = useState<EventClickArg | null>(null);
  const [menuInfoType, setMenuInfoType] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [dateHours, setDateHours] = useState<DateHours[]>([]);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [scheduleHours,setScheduleHours] = useState([]);
  const [customDateStatus, setCustomDateStatus] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDayValue, setSelectedDayValue] = useState([]);
  const [dateSpecificHoursModalOpen, setDateSpecificHoursModalOpen] = useState<boolean>(false);
  const [currentEditingDate, setCurrentEditingDate] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const defaultRules: DaySchedule[] = [
    { type: 'wday', wday: 'Sunday', intervals: [{ to: '17:00', from: '09:00' }] },
    { type: 'wday', wday: 'Monday', intervals: [{ to: '17:00', from: '09:00' }] },
    { type: 'wday', wday: 'Tuesday', intervals: [{ to: '17:00', from: '09:00' }] },
    { type: 'wday', wday: 'Wednesday', intervals: [{ to: '17:00', from: '09:00' }] },
    { type: 'wday', wday: 'Thursday', intervals: [{ to: '17:00', from: '09:00' }] },
    { type: 'wday', wday: 'Friday', intervals: [{ to: '17:00', from: '09:00' }] },
    { type: 'wday', wday: 'Saturday', intervals: [{ to: '17:00', from: '09:00' }] },
  ];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  useEffect(() => {
 
    if(mentorId && mentorId != 0){
      fetchData();
    }
  }, [mentorId]);
  useEffect(() => {
  }, [popoverOpen]);
  const fetchData = async () => {
    const response = await getData(`${siteConfig.hodegoUrl}mentor/${mentorId}/availability`);
    //?timeZone=${timeZone}
    if(response){
      if(response.data && response.data.rules){
        if(response.data.rules.length > 0){
          const tempArr=[];
          for(let i = 0; i < response.data.rules.length; i++){
            if(response.data.rules[i].type === 'date'){
              if(response.data.rules[i].intervals.length>0){
                for(let j=0;j<response.data.rules[i].intervals.length;j++){
                  const startTime = response.data.rules[i].intervals[j].from;
                  const endTime = response.data.rules[i].intervals[j].to;
                  tempArr.push({ date: formatDate(response.data.rules[i].date), startTime, endTime });
                }
              }
            }
          }
          const getAllHours = response.data.rules;
          if(getAllHours.length > 0){
            for(let i = 0; i <getAllHours.length; i++) {
              if(getAllHours[i].type == 'wday'){
                getAllHours[i].wday = (getAllHours[i].wday).charAt(0).toUpperCase() + (getAllHours[i].wday).slice(1);
              }
            }
          }
          setDateHours(tempArr);
          setScheduleHours(getAllHours);
          setEvents(convertToEvents(getAllHours));
        }
      }
      else{
        setScheduleHours(defaultRules);
        setEvents(convertToEvents(defaultRules));
      }
    }
  };
  const groupedDateHours = dateHours.reduce((acc: { [key: string]: DateHours[] }, current) => {
    if (!acc[current.date]) {
      acc[current.date] = [];
    }
    acc[current.date].push(current);
    return acc;
  }, {});

  // Get the day of the week from a formatted date string
  function getDayOfWeek(formattedDate: string): string {
    // Convert 'January 23, 2025' to a Date object
    const date = new Date(formattedDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format. Please use a valid date like "YYYY-MM-DD" or "January 23, 2025".');
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  function getIntervalsForDate(formattedDate: string): { startTime: string; endTime: string; date: string }[] {
    const dayOfWeek = getDayOfWeek(formattedDate);
    const schedule = scheduleHours.find((sh) => sh.wday === dayOfWeek);
  
    if (schedule && schedule.intervals && schedule.intervals.length > 0) {
      // If intervals exist, return them
      return schedule.intervals.map((interval) => ({
        startTime: interval.from || '',
        endTime: interval.to || '',
        date: formattedDate,
      }));
    }
    return [];
  }
  
  
  const handleModalClose = () => {
    setDateSpecificHoursModalOpen(false);
    setPopoverOpen(false);
  };
  const mentorAvailabilityApi = async(updatedhours) => {
    // getScheduleHours(updatedhours);
    if(updatedhours.length > 0){
      for(let i = 0; i <updatedhours.length; i++) {
        if(updatedhours[i].type == 'wday'){
          updatedhours[i].wday = (updatedhours[i].wday).toLowerCase();
        }
      }
    }
    const getAllHours = updatedhours;
    const tempArr=[];
    for(let i = 0; i < updatedhours.length; i++){
      if(updatedhours[i].type === 'date'){
        if(updatedhours[i].intervals.length>0){
          for(let j=0;j<updatedhours[i].intervals.length;j++){
            const startTime = updatedhours[i].intervals[j].from;
            const endTime = updatedhours[i].intervals[j].to;
            tempArr.push({ date: formatDate(updatedhours[i].date), startTime, endTime });
          }
        }
      }
    }
    if(getAllHours.length > 0){
      for(let i = 0; i <getAllHours.length; i++) {
        if(getAllHours[i].type == 'wday'){
          getAllHours[i].wday = (getAllHours[i].wday).charAt(0).toUpperCase() + (getAllHours[i].wday).slice(1);
        }
      }
    }
    setDateHours(tempArr);
    setScheduleHours(getAllHours);
    setEvents(convertToEvents(getAllHours));
    handleRulesChange(updatedhours);
    // const formData = {
    //   'rules':updatedhours,
    //   'timeZone':timeZone,
    // };
    // const response = await putData(formData,`${siteConfig.hodegoUrl}mentor/${mentorId}/availability`);
    // if(response){
    //   if(response.data && response.data == true){
    //     fetchData();
    //     showNotification();
    //   }
    // }
    
  };
  // const showNotification = () => {
  //   setNotificationOpen(true);
  // };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };
  const convertToHoursUsingDate = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
  
    let hours24 = parseInt(hours, 10);
    if (period === 'PM' && hours24 !== 12) {
      hours24 += 12;
    } else if (period === 'AM' && hours24 === 12) {
      hours24 = 0;
    }
    const formattedHours = hours24.toString().padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}`;
  };
  const convertToEvents = (schedules: DaySchedule[]): EventInput[] => {
    const events: EventInput[] = [];
    const processedDates = new Set<string>();
    const dayOfWeekMap: { [key: string]: number } = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,

      'Sun': 0,
      'Mon': 1,
      'Tue': 2,
      'Wed': 3,
      'Thu': 4,
      'Fri': 5,
      'Sat': 6
    };

    function formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function formatTime(time: string): string {
      const [hourStr, minute] = time.split(':');
      let hour = parseInt(hourStr, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12; // Adjust midnight and noon
      return `${hour}:${minute} ${ampm}`;
    }

    schedules.forEach(schedule => {
      if (schedule.type === 'date' && schedule.date) {
        processedDates.add(schedule.date);
        schedule.intervals.forEach(interval => {
          const startTime = interval.from;
          const endTime = interval.to;
          const formattedTitle = `${formatTime(startTime)} - ${formatTime(endTime)}`;
          events.push({
            start: `${schedule.date}T${startTime}:00`,
            end: `${schedule.date}T${endTime}:00`,
            title: formattedTitle,
            classNames: ['custom-event']
          });
        });
        if(schedule.intervals.length == 0){
          const startTime = '09:00';
          const endTime = '17:00';
          events.push({
            start: `${schedule.date}T${startTime}:00`,
            end: `${schedule.date}T${endTime}:00`,
            title: 'Unavailable',
            classNames: ['custom-event']
          });
        }
      }
    });

    schedules.forEach(schedule => {
      if (schedule.type === 'wday' && schedule.wday) {
        const dayOfWeekIndex = dayOfWeekMap[schedule.wday];

        if (dayOfWeekIndex === undefined) {
          return;
        }

        schedule.intervals.forEach(interval => {
          const startTime = interval.from;
          const endTime = interval.to;
          const formattedTitle = `${formatTime(startTime)} - ${formatTime(endTime)}`;

          const startDate = new Date(); // Start from today
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 36); // Adjust the number of months as needed

          const currentDate = new Date(startDate);

          const currentDay = currentDate.getDay();
          const daysUntilNext = (dayOfWeekIndex - currentDay + 7) % 7;
          currentDate.setDate(currentDate.getDate() + daysUntilNext);

          while (currentDate <= endDate) {
            const dateStr = formatDate(currentDate);

            if (!processedDates.has(dateStr)) {
              events.push({
                start: `${dateStr}T${startTime}:00`,
                end: `${dateStr}T${endTime}:00`,
                title: formattedTitle
              });

            } else {
              console.log(`Excluded recurring event on: ${dateStr} due to custom event`);
            }

            currentDate.setDate(currentDate.getDate() + 7);
          }
        });
      }
    });
    return events;
  };
  const handleDateClick = (arg: DateClickArg) => {
    setMenuInfoType('date');
    const tempDate = new Date(arg.date);
    const offset = tempDate.getTimezoneOffset() * 60000;
    const localDate = new Date(arg.date.getTime() - offset);
    const formattedDate = localDate.toISOString().split('T')[0];
    const status = checkCustomDate(formattedDate);
    setSelectedDate(formattedDate);
    setCustomDateStatus(status);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to midnight
    const argDate = new Date(arg.date);
    argDate.setHours(0, 0, 0, 0); // Reset to midnight
    if (argDate >= today) {
      setAnchorEl(arg.dayEl);
      setMenuInfo(arg);
      setPopoverOpen(true);
    } else {
      setAnchorEl(null);
      setMenuInfo(null);
      setPopoverOpen(false);
    }
  };
  const handleEventClick = (arg: EventClickArg) => {
    setMenuInfoType('event');
    const tempDate = new Date(arg.event.start);
    const offset = tempDate.getTimezoneOffset() * 60000;
    const localDate = new Date(arg.event.start.getTime() - offset);
    const formattedDate = localDate.toISOString().split('T')[0];
    const status = checkCustomDate(formattedDate);
    setSelectedDate(formattedDate);
    setCustomDateStatus(status);
    const today = new Date();
    if (arg.event.start >= today) {
      setAnchorEl(arg.el);
      const dateClickArg: DateClickArg = {
        dayEl: arg.el, // HTMLElement
        date: arg.event.start, // Date
        dateStr: formattedDate, // string (formatted date)
        allDay: arg.event.allDay || false, // boolean
        jsEvent: arg.jsEvent, // MouseEvent
        view: arg.view, // Calendar view object
      };
      setMenuInfo(dateClickArg);
      setMenuEventInfo(arg);
      setPopoverOpen(true);
    } else {
      setAnchorEl(null);
      setMenuInfo(null);
      setPopoverOpen(false);
    }
  };
  const checkCustomDate=(selectedDate)=>{
    if(scheduleHours.length>0){
      for(let i=0;i<scheduleHours.length;i++){
        if(scheduleHours[i].type === 'date'){
          if(scheduleHours[i].date === selectedDate){
            return true;
          }
        }
      }
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
    setMenuInfo(null);
    setPopoverOpen(false);
  };

  const handleEditAllClick = () => {
    let selectedDay = '';
    if(menuInfoType=='event'){
      selectedDay = menuEventInfo?.event.start.toLocaleString('en-us', { weekday: 'long' });
    }else{
      selectedDay = menuInfo?.date.toLocaleString('en-us', { weekday: 'long' });
    }
    const getDayValue=[];
    if(scheduleHours.length>0){
      for(let i=0;i<scheduleHours.length;i++){
        if(scheduleHours[i].wday == selectedDay){
          scheduleHours[i].intervals.forEach((interval) => {
            getDayValue.push({
              startTime:interval.from,
              endTime:interval.to
            });
          });
        }
      }
    }
    setSelectedDayValue(getDayValue);
    setPopoverOpen(false);
    setPopupOpen(true);
  };

  const handleResetClick = () =>{
    setPopoverOpen(false);
    const updatedRules=[];
    if(scheduleHours.length>0){
      for(let i=0; i<scheduleHours.length; i++){
        if(scheduleHours[i].type == 'date'){
          if(scheduleHours[i].date != selectedDate){
            updatedRules.push(scheduleHours[i]);
          }
        }
        else{
          updatedRules.push(scheduleHours[i]);
        }
      }
    }
    setScheduleHours(updatedRules);
    setEvents(convertToEvents(updatedRules));
    mentorAvailabilityApi(updatedRules);
  };

  const handlePopupClose = () => {
    setPopupOpen(false);
  };

  const handleApply = (availabilities: { startTime: string, endTime: string }[]) => {
    if (!menuInfo) return;

    const dayOfWeek = menuInfo.date.getDay();
    const updatedEvents = [];
    availabilities.forEach(({ startTime, endTime }) => {
      const newEvent = {
        from: convertToHoursUsingDate(startTime),
        to: convertToHoursUsingDate(endTime),
      };
      updatedEvents.push(newEvent);
    });
    const updatedRules=scheduleHours;
    if(updatedRules.length>0){
      // updatedRules[dayOfWeek].intervals = updatedRules[dayOfWeek].intervals.concat(updatedEvents);
      updatedRules[dayOfWeek].intervals = updatedEvents;
    }
    // setEvents(updatedEvents);
    setScheduleHours(updatedRules);
    setEvents(convertToEvents(updatedRules));
    mentorAvailabilityApi(updatedRules);
  };

  const handleDateSpecificHoursApply = (date: any, timeFields: { startTime: string; endTime: string }[]) => {
    setPopoverOpen(false);
    const newDateHours = timeFields.map((field) => ({
      date: date.format('MMMM DD, YYYY'),
      startTime: field.startTime,
      endTime: field.endTime
    }));
    const currentRules = timeFields.map((field) => ({
      from: field.startTime,
      to: field.endTime
    }));
    const tempDate = new Date(date);
    const offset = tempDate.getTimezoneOffset() * 60000;
    const localDate = new Date(date - offset);
    const formattedDate = localDate.toISOString().split('T')[0];
    // const newItem = [{ type: 'date', date: formattedDate, intervals:currentRules }];
    setEvents([...events, ...newDateHours]);
    setDateSpecificHoursModalOpen(false);
    let tempStatus = false;
    if(scheduleHours.length>0){
      for(let i=0;i<scheduleHours.length;i++){
        if(scheduleHours[i].type=='date'){
          if(scheduleHours[i].date == formattedDate){
            const tempArr = currentRules;
            const uniqueArray = tempArr.filter((obj, index, self) =>
              index === self.findIndex((t) => (
                t.from === obj.from && t.to === obj.to
              ))
            );
            scheduleHours[i].intervals = uniqueArray;
            tempStatus = true;
            break;
          }
        }
      }
    }
    if(tempStatus == false){
      scheduleHours.push({ type: 'date', date: formattedDate, intervals:currentRules });
    }
    // const updatedhours = scheduleHours.concat(newItem);
    // const updatedhours = newItem;
    mentorAvailabilityApi(scheduleHours);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  const renderDayCellContent = (dayCellContent: DayCellContentArg) => {
    const getSelectedDate = monthNames[dayCellContent.date.getMonth()]+' '+dayCellContent.date.getDate()+', '+dayCellContent.date.getFullYear();
    const customSelectedStatus = dateHours.some(value => value.date == getSelectedDate);
    return (
      <div className={customSelectedStatus?'custom-day-cell specific-day-cell':'custom-day-cell'}>
        <div className="date-number">{dayCellContent.date.getDate()}</div>
        {customSelectedStatus?
          <Tooltip title="Your Availability For This Day Is Date-Specific">
            <IconButton size="small">
              <EventIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          :
          <Tooltip title="Your Availability For This Day Repeats Weekly">
            <a style={{textDecoration:'underline'}}>
              {/* <RepeatIcon sx={{ fontSize: 18 }} /> */}
              <div style={{ fontSize: 15, color: '#73A870'}}>Edit</div>
            </a>
          </Tooltip>
        }
        
      </div>
    );
  };
  const handleEditClick = (date) => {
    // setCurrentEditingDate(formatDate(date));
    setCurrentEditingDate(formatDate(date));
    setDateSpecificHoursModalOpen(true);
    // currentEditingDate ? groupedDateHours[currentEditingDate].map((item) => ({
    //   date: item.date,
    //   startTime: item.startTime,
    //   endTime: item.endTime,
    // })) : null
  };
  // const dayRender = (info: any) => {
  //   const today = new Date();
  //   if (info.date < today) {
  //     info.el.style.backgroundColor = '#f0f0f0';
  //     info.el.style.pointerEvents = 'none';
  //     const timingDiv = document.createElement('div');
  //     timingDiv.innerHTML = `
  //       <div style="margin-left: 10px; color: #8d8888;">8:45am - 4:30pm</div>
  //       <div style="margin-left: 10px; color: #8d8888;">6:00pm - 7:00pm</div>
  //     `;
  //     info.el.appendChild(timingDiv);
  //   } else {
  //     info.el.style.backgroundColor = 'white';
  //     info.el.classList.add('future-date');
  //   }
  // };
  const firstDayOfCurrentMonth = new Date(new Date().getFullYear(), new Date(




    
  ).getMonth(), 1);
  return (
    <>
      {isMobile?
        (
          <Box sx={{textAlign:'center',marginTop: '20%'}}><img src={NoPhoneIcon} style={{ width: '64px', height: '64px' }} />
            <Typography variant="h6" sx={{ marginBottom: '16px', textAlign: 'center' }}>Calendar View Available on Desktop</Typography>
          </Box>):
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev',
            center: 'title',
            right: 'next',
          }}
          initialView='dayGridMonth'
          editable={false}
          selectable={false}
          dayMaxEvents={4}
          events={events}
          dateClick={handleDateClick}
          // dayCellDidMount={dayRender}
          contentHeight="auto"
          eventClick={handleEventClick}
          dayCellContent={renderDayCellContent}
          validRange={{
            start: firstDayOfCurrentMonth,
            end: selectedMaxDate &&
                 dayjs(selectedMaxDate).isSame(dayjs().subtract(1, 'day'), 'day')
              ? undefined
              : selectedMaxDate
                ? dayjs(selectedMaxDate).add(1, 'day').format('YYYY-MM-DD')
                : undefined
          }}
        />
      }
      
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div style={{ padding: '10px' }}>
          <Typography variant="subtitle1" style={{ marginBottom: '10px' }}>Edit Options</Typography>
          <MenuItem onClick={() => handleEditClick(menuInfoType=='event'?menuEventInfo?.event.start:menuInfo?.date)}>
            <ListItemIcon>
              <EventTwoToneIcon style={{ color: '#73A870' }} />
            </ListItemIcon>
            <ListItemText primary="Edit This Date" />
          </MenuItem>
          {customDateStatus?
            <MenuItem onClick={handleResetClick}>
              <ListItemIcon>
                <RefreshTwoToneIcon style={{ color: '#73A870' }} />
              </ListItemIcon>
              <ListItemText primary="Reset to Weekly Hours" />
            </MenuItem>
            :
            <MenuItem onClick={handleEditAllClick}>
              <ListItemIcon>
                <EditTwoToneIcon style={{ color: '#73A870' }} />
              </ListItemIcon>
              <ListItemText primary={`Edit All ${menuInfoType=='event'?menuEventInfo?.event.start.toLocaleString('en-us', { weekday: 'long' }):menuInfo?.date.toLocaleString('en-us', { weekday: 'long' })}s`} />
            </MenuItem>
          }
          
        </div>
      </Popover>
      <AvailabilityPopup
        open={popupOpen}
        selectedDayValues={selectedDayValue}
        onClose={handlePopupClose}
        onApply={handleApply}
        day={menuInfoType=='event'?menuEventInfo?.event.start.toLocaleString('en-us', { weekday: 'long' }):menuInfo?.date.toLocaleString('en-us', { weekday: 'long' })}
      />
      <DateSpecificHoursModal
        selectedMaxDates={selectedMaxDate}
        open={dateSpecificHoursModalOpen}
        onClose={handleModalClose}
        onApply={handleDateSpecificHoursApply}
        initialData={
          currentEditingDate && groupedDateHours?.[currentEditingDate]
            ? groupedDateHours[currentEditingDate].map((item) => ({
              date: item.date,
              startTime: item.startTime || '',
              endTime: item.endTime || '',
            }))
            : getIntervalsForDate(currentEditingDate).length > 0 &&
        getIntervalsForDate(currentEditingDate)[0].startTime !== ''
              ? [{
                date: currentEditingDate,
                startTime: '',
                endTime: '',
              }]
              : [] // 🔥 If no intervals, pass an empty array
        }
      />



      <Snackbar
        open={notificationOpen}
        autoHideDuration={1000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ marginLeft: '6%' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
        Changes Saved
        </Alert>
      </Snackbar>
    </>
  );
};

export default CalendarView;