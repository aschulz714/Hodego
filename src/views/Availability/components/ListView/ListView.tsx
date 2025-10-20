import React, { useState, useEffect } from 'react';
import { Box, Grid, Tooltip, Divider, Checkbox, IconButton, Button, Popover, Typography, FormControlLabel, FormGroup, Snackbar, Alert, Tabs, Tab } from '@mui/material';
import { Close, ContentCopy, Add } from '@mui/icons-material';
import DateSpecificHours from '../DateSpecificHours';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RemoveIcon from '@mui/icons-material/Remove';
import './ListView.css';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
// import siteConfig from '../../../../theme/site.config';
// import { putData } from '../../../../theme/Axios/apiService';
// import { areIntervalsOverlapping } from 'date-fns';

interface DayHours {
 day: string;
 startTime: Date;
 endTime: Date;
 enabled: boolean;
 additionalTimes?: { startTime: Date; endTime: Date; error?: string }[];
 error?: string;
}
interface DayRules {
 type: string;
 wday:string;
 intervals?: { to: string; from: string;}[];
}
const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const fullDayNames = {
  SUN: 'Sunday',
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday'
};
const customDayNames = {
  'Sunday':'SUN',
  'Monday': 'MON',
  'Tuesday':'TUE', 
  'Wednesday':'WED',
  'Thursday':'THU',
  'Friday':'FRI',
  'Saturday':'SAT',
};

const WeeklyHours: React.FC<{ isSmallScreen: boolean, isMobileScreen: boolean,mentorId:number,timeZone:string,getScheduleHours: (params: any[]) => void,customScheduleHours: any[],handleRulesChange:(params: any[]) => void,onUnsavedChanges: (hasChanges: boolean) => void }> = ({ isSmallScreen,mentorId,timeZone,getScheduleHours,customScheduleHours,handleRulesChange,onUnsavedChanges }) => {
  const initialHours: DayHours[] = daysOfWeek.map(day => ({
    day,
    startTime: new Date(2023, 0, 1, 9, 0),
    endTime: new Date(2023, 0, 1, 17, 0),
    enabled: true,
    additionalTimes: [],
  }));
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const rules:DayRules[] = daysOfWeek.map(day => ({
    type:'wday',
    wday:fullDayNames[day],
    intervals:[{ from:formatTime(new Date(2023, 0, 1, 9, 0)),to:formatTime(new Date(2023, 0, 1, 17, 0)) }],
  }));
  console.log(mentorId);
  const theme = useTheme();
  const [hours, setHours] = useState<DayHours[]>(initialHours);
  const [ruleHours,setRuleHours] = useState<DayRules[]>(rules);
  const [ruleCustomHours,setRuleCustomHours] = useState<DayRules[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copyFromDay, setCopyFromDay] = useState<string>('');
  const [copyToDays, setCopyToDays] = useState<{ [key: string]: boolean }>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  // const timer = useRef<number | null>(null);
  const currentFormatTime = (time) =>{
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const dateWithTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return dateWithTime;
  };
  useEffect(() => {
    if (initialLoad && customScheduleHours.length > 0) {
      const getHours: DayHours[] = [];
      const getTempHours: DayRules[] = [];
      const getCustomTempHours: DayRules[] = [];
  
      customScheduleHours.forEach((schedule) => {
        if (schedule.type === 'wday') {
          const additionalTimes = schedule.intervals
            .slice(1)
            .map((interval) => ({
              startTime: currentFormatTime(interval.from),
              endTime: currentFormatTime(interval.to),
              error: '',
            }));
          if(schedule.intervals.length > 0){
            getHours.push({
              day: customDayNames[schedule.wday.charAt(0).toUpperCase() + schedule.wday.slice(1)],
              startTime: currentFormatTime(schedule.intervals[0].from),
              endTime: currentFormatTime(schedule.intervals[0].to),
              enabled: schedule.intervals.length > 0,
              additionalTimes,
            });
          }else{
            getHours.push({
              day:customDayNames[(schedule.wday).charAt(0).toUpperCase() + (schedule.wday).slice(1)],
              startTime: currentFormatTime('09:00'),
              endTime: currentFormatTime('17:00'),
              enabled: schedule.intervals.length > 0 ? true : false,
              additionalTimes: [],
            });
          }
          
  
          getTempHours.push(schedule);
        } else {
          getCustomTempHours.push(schedule);
        }
      });
  
      setRuleHours(getTempHours);
      setHours(getHours);
      setRuleCustomHours(getCustomTempHours);
      setInitialLoad(false); // Prevent resetting on tab switch
    }
  }, [customScheduleHours]);
  
  
  const mentorAvailabilityApi = async (updatedValue) => {
    const concatArray = updatedValue.concat(ruleCustomHours);
    getScheduleHours(concatArray);
    const allErrorsCleared = hours.every(
      ({ error, additionalTimes }) => !error && (!additionalTimes || additionalTimes.every(time => !time.error))
    );
    if (allErrorsCleared) {
      if(concatArray.length > 0){
        for(let i = 0; i <concatArray.length; i++) {
          if(concatArray[i].type == 'wday'){
            concatArray[i].wday = (concatArray[i].wday).toLowerCase();
          }
        }
      }
      // const formData = {
      //   'rules':concatArray,
      //   'timeZone':timeZone,
      // };
      handleRulesChange(concatArray);
      localStorage.setItem('myTimeZone',timeZone);
      // const response = await putData(formData,`${siteConfig.hodegoUrl}mentor/${mentorId}/availability`);
      // if(response){
      //   if(response.data && response.data == true){
      //     if (timer.current) {
      //       clearTimeout(timer.current);
      //     }
      //     timer.current = window.setTimeout(() => {
      //       setSnackbarOpen(true);
      //     }, 500);
          
      //   }
      // }
    
    } else {
      if (snackbarOpen) {
        setSnackbarOpen(false);
      }
    }
    
  };
  // if ('myTimeZone' in localStorage) {
  //   if(localStorage.getItem('myTimeZone') != timeZone) {
  //     console.log('qqq1');
  //     mentorAvailabilityApi(ruleHours);
  //   }
  // }
  // else{
  //   window.localStorage.setItem('myTimeZone', timeZone);
  // }
  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: Date, index: number = 0) => {
    const newHours = hours.map(h => {
      if (h.day === day) {
        let updatedDayHours;
        if (index === 0) {
          updatedDayHours = { ...h, [field]: value };
          const error = validateTimes(updatedDayHours, index);
          return { ...updatedDayHours, error: error || undefined };
        } else {
          const additionalTimes = h.additionalTimes?.map((t, i) => i === index - 1 ? { ...t, [field]: value } : t) || [];
          updatedDayHours = { ...h, additionalTimes };
          const newError = validateTimes(updatedDayHours, index);
          additionalTimes[index - 1].error = newError || undefined;
          return { ...updatedDayHours, additionalTimes };
        }
      }
      return h;
    });
  
    const newRule = ruleHours.map(h => {
      if ((h.wday).charAt(0).toUpperCase() + (h.wday).slice(1) === fullDayNames[day]) {
        if (h.intervals.length > 0) {
          const tmpArray = h.intervals;
          if (field === 'startTime') {
            tmpArray[index].from = formatTime(value);
          } else {
            tmpArray[index].to = formatTime(value);
          }
          return { ...h, intervals: tmpArray };
        }
      }
      return h;
    });
  
    setRuleHours(newRule);
    setHours(newHours);
  
    // Check if there are errors
    const hasErrors = newHours.some(h => h.error || h.additionalTimes.some(t => t.error));
  
    // Notify `LabTabs.tsx` about unsaved changes
    onUnsavedChanges(!hasErrors);
  
    if (!hasErrors) {
      mentorAvailabilityApi(newRule);
    }
  };
  

  const validateTimes = (dayHours: DayHours, index: number) => {
    const times = [{ startTime: dayHours.startTime, endTime: dayHours.endTime }, ...(dayHours.additionalTimes || [])];
    const time = times[index];

    if (time.startTime.getTime() === time.endTime.getTime()) {
      return 'Start time and end time cannot be the same.';
    }
    if (time.startTime.getTime() > time.endTime.getTime()) {
      return 'Start time cannot be greater than end time.';
    }
    for (let i = 0; i < times.length; i++) {
      if (i !== index) {
        const other = times[i];
        if (
          (time.startTime >= other.startTime && time.startTime < other.endTime) ||
                (time.endTime > other.startTime && time.endTime <= other.endTime) ||
                (time.startTime <= other.startTime && time.endTime >= other.endTime)
        ) {
          return 'Times Overlap with Another Set of Times.';
        }
      }
    }
    return '';
  };


  const handleEnabledChange = (day: string) => {
    const newHours = hours.map(h => h.day === day ? { ...h, additionalTimes:[],enabled: !h.enabled, error: validateTimes(h, 0) } : h);
    console.log('hours',hours);
    const newRules = ruleHours.map(h =>{
      if (h.type === 'wday' && (h.wday).charAt(0).toUpperCase() + (h.wday).slice(1) === fullDayNames[day]) {
        if(h.intervals.length > 0){
          return {...h,intervals:[]};
        }
        else{
          return {...h, intervals:[{from:'09:00',to:'17:00'}]};
        }
      }
      return h;

    });
    console.log('newHours',newHours);
    setRuleHours(newRules);
    setHours(newHours);
    mentorAvailabilityApi(newRules);
  };

  const handleRemove = (day: string, index: number = 0) => {
    // Clone the current hours to avoid direct state mutation
    const newHours = hours.map(h => {
      if (h.day === day) {
        // Create a deep copy of additional times to ensure immutability
        const newAdditionalTimes = h.additionalTimes ? [...h.additionalTimes] : [];
  
        if (index === 0) {
          // Case: Removing the main time slot
          if (newAdditionalTimes.length > 0) {
            // Promote the first additional time to be the new main slot
            const [newMain, ...rest] = newAdditionalTimes;
            const updatedDayHours = {
              ...h,
              startTime: newMain.startTime,
              endTime: newMain.endTime,
              additionalTimes: rest,
            };
  
            // Re-validate the new main slot
            const error = validateTimes(updatedDayHours, 0);
            return {
              ...updatedDayHours,
              error: error || h.error, // Preserve existing error if validation fails
            };
          } else {
            // No additional times left, disable the time slot
            return { ...h, enabled: false, additionalTimes: [], error: '' };
          }
        } else {
          // Case: Removing an additional time slot
          const filteredAdditionalTimes = newAdditionalTimes.filter((_, i) => i !== index - 1);
  
          // Re-validate each remaining additional time slot and retain errors
          const updatedDayHours = { ...h, additionalTimes: filteredAdditionalTimes };
          filteredAdditionalTimes.forEach((time, i) => {
            const validationError = validateTimes(updatedDayHours, i);
            filteredAdditionalTimes[i].error = validationError;
          });
  
          // Re-validate the main time slot
          const mainError = validateTimes(updatedDayHours, 0);
          return {
            ...updatedDayHours,
            additionalTimes: filteredAdditionalTimes,
            error: mainError || h.error, // Preserve existing error if validation fails
          };
        }
      }
      return h; // Return other hours unchanged
    });
    // else if (tmpArr[i].type === 'date') {
    //   if (!tmpArr[i].intervals || tmpArr[i].intervals.length === 0) {
    //     tmpArr.splice(i, 1);
    //   }
    // }
    // Update the rule hours accordingly
    const newRules = ruleHours.map(h => {
      if (h.type === 'wday' && (h.wday).charAt(0).toUpperCase() + (h.wday).slice(1) === fullDayNames[day]) {
        const newIntervals = h.intervals?.filter((_, i) => i !== index);
        return { ...h, intervals: newIntervals };
      }
      return h;
    });
    // Update the state and API
    setHours(newHours);
    setRuleHours(newRules);
    mentorAvailabilityApi(newRules);
  };
  
  

  const handleOpenCopyDialog = (event: React.MouseEvent<HTMLElement>, day: string) => {
    setCopyFromDay(day);
    const newCopyToDays = daysOfWeek.reduce((acc, d) => {
      acc[d] = false;
      return acc;
    }, {} as { [key: string]: boolean });
    setCopyToDays(newCopyToDays);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyApply = () => {
    const fromDayHours = hours.find(h => h.day === copyFromDay);
    const customDayHours = ruleHours.find(h => (h.wday).charAt(0).toUpperCase() + (h.wday).slice(1) === fullDayNames[copyFromDay]);
  
    if (fromDayHours) {
      const newHours = hours.map(h => {
        if (copyToDays[h.day]) {
          return {
            ...h,
            enabled: fromDayHours.enabled,
            startTime: new Date(fromDayHours.startTime),  // Deep copy
            endTime: new Date(fromDayHours.endTime),  // Deep copy
            additionalTimes: fromDayHours.additionalTimes.map(time => ({
              startTime: new Date(time.startTime), // Deep copy
              endTime: new Date(time.endTime), // Deep copy
              error: time.error || ''
            })),
            error: validateTimes(h, 0)
          };
        }
        return h;
      });
      setHours(newHours);
    }
  
    if (customDayHours) {
      const newRules = ruleHours.map(h => {
        if (copyToDays[customDayNames[(h.wday).charAt(0).toUpperCase() + (h.wday).slice(1)]]) {
          return {
            ...h,
            intervals: customDayHours.intervals.map(interval => ({
              from: interval.from,
              to: interval.to
            }))
          };
        }
        return h;
      });
      setRuleHours(newRules);
      mentorAvailabilityApi(newRules);
    }
  
    handleClose();
  };
  

  const handleAddTime = (day: string) => {
    let hasError = false;
  
    const newHours = hours.map(h => {
      if (h.day === day) {
        if (!h.enabled) {
          const error = validateTimes(h, 0);
          if (error) {
            hasError = true;
          }
          return { ...h, enabled: true, error };
        } else {
          let newStartTime;
          if (h.additionalTimes.length > 0) {
            newStartTime = new Date(h.additionalTimes[h.additionalTimes.length - 1].endTime);
          } else {
            newStartTime = new Date(h.endTime);
          }
          newStartTime.setHours(newStartTime.getHours() + 1);
          const newEndTime = new Date(newStartTime);
          newEndTime.setHours(newEndTime.getHours() + 1);
  
          const newAdditionalTimes = [...(h.additionalTimes || []), { startTime: newStartTime, endTime: newEndTime, error: '' }];
          const updatedDayHours = { ...h, additionalTimes: newAdditionalTimes };
  
          for (let i = 0; i < newAdditionalTimes.length; i++) {
            const validationError = validateTimes(updatedDayHours, i);
            newAdditionalTimes[i].error = validationError;
            if (validationError) {
              hasError = true;
            }
          }
  
          return { ...updatedDayHours, additionalTimes: newAdditionalTimes };
        }
      }
      return h;
    });
  
    if (hasError) {
      return;
    }
  
    const newRule = ruleHours.map(h => {
      if ((h.wday).charAt(0).toUpperCase() + (h.wday).slice(1) === fullDayNames[day]) {
        if (h.intervals.length > 0) {
          const newStartTime = getRuleHours(h.intervals[h.intervals.length - 1].to);
          newStartTime.setHours(newStartTime.getHours() + 1);
          const newEndTime = new Date(newStartTime);
          newEndTime.setHours(newEndTime.getHours() + 1);
          const tmpArr = h.intervals;
          tmpArr.push({ from: formatTime(newStartTime), to: formatTime(newEndTime) });
          return { ...h, intervals: tmpArr };
        } else {
          return { ...h, intervals: [{ from: '09:00', to: '17:00' }] };
        }
      }
      return h;
    });
  
    setHours(newHours);
    setRuleHours(newRule);
    const concatArray = newRule.concat(ruleCustomHours);
    getScheduleHours(concatArray);
    mentorAvailabilityApi(newRule);
  };
  const getRuleHours = (value) => {
    const [hours,minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const open = Boolean(anchorEl);
  const id = open ? 'copy-popover' : undefined;

  return (
    <Box marginTop={'2%'}>
      <h2>Recurring Weekly Hours</h2>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {hours.map(({ day, startTime, endTime, enabled, additionalTimes, error }) => (
          <><Grid container sx={{ display: { xs: 'none', md: 'flex' } }} alignItems="center" spacing={1} key={day} marginBottom={'3%'}>
            <Grid item xs={1}>
              <Checkbox checked={enabled} onChange={() => handleEnabledChange(day)} sx={{
                transform: 'scale(0.8)',
                fontSize: '12px',
              }} />
            </Grid>
            <Grid item xs={1}>
              <Box sx={{ fontWeight: enabled ? 'bold' : 'bold', fontSize: '11.5px', letterSpacing: '0.1em' }}>{day}</Box>
            </Grid>
            {enabled ? (
              <>
                <Grid item className="startTextField" mt={isSmallScreen ? '2%' : '3%'} spacing={isSmallScreen ? '1.5' : '2'}>
                  <TimePicker
                    value={startTime}
                    onChange={(newValue) => handleTimeChange(day, 'startTime', newValue || new Date())}
                    sx={{ mb: 6, height: '30px', width: '130px' }} />
                </Grid>
                <Box mx={1}>-</Box>
                <Grid item className="endTextField" mt={isSmallScreen ? '2%' : '3%'} spacing={isSmallScreen ? '1.5' : '2'}>
                  <TimePicker
                    value={endTime}
                    onChange={(newValue) => handleTimeChange(day, 'endTime', newValue || new Date())}
                    sx={{ mb: 6, height: '30px', width: '130px' }} />
                </Grid>
                <Grid item xs={1}>
                  <Tooltip
                    title={`Remove ${fullDayNames[day]} Interval 1`}
                    sx={{
                      '& .MuiTooltip-tooltip': {
                        backgroundColor: 'black',
                        color: 'white'
                      }
                    }}
                  >
                    <IconButton onClick={() => handleRemove(day)} sx={{ padding: '5px' }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip
                    title={`New Interval for ${fullDayNames[day]}`}
                    sx={{
                      '& .MuiTooltip-tooltip': {
                        backgroundColor: 'black',
                        color: 'white'
                      }
                    }}
                  >
                    <IconButton onClick={() => handleAddTime(day)} sx={{ padding: '5px' }}>
                      <Add fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip
                    title="Copy to Other Days"
                    sx={{
                      '& .MuiTooltip-tooltip': {
                        backgroundColor: 'black',
                        color: 'white'
                      }
                    }}
                  >
                    <IconButton onClick={(e) => handleOpenCopyDialog(e, day)} sx={{ padding: '5px' }}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {error && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="error" sx={{ marginLeft: '17%', fontSize: '18px' }}>
                      {error}
                    </Typography>
                  </Grid>
                )}
              </>
            ) : (
              <>
                <Grid item xs={isSmallScreen ? 7.3 : 6}>
                  <Box sx={{ color: 'gray', fontStyle: 'italic' }}>Unavailable</Box>
                </Grid>
                {/* <Grid item xs={1.5}></Grid> */}
                <Grid item xs={1}>
                  <Tooltip
                    title={`New Interval for ${fullDayNames[day]}`}
                    sx={{
                      '& .MuiTooltip-tooltip': {
                        backgroundColor: 'black',
                        color: 'white'
                      }
                    }}
                  >
                    <IconButton onClick={() => handleAddTime(day)} sx={{ padding: '5px' }}>
                      <Add fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip
                    title="Copy to Other Days"
                    sx={{
                      '& .MuiTooltip-tooltip': {
                        backgroundColor: 'black',
                        color: 'white'
                      }
                    }}
                  >
                    <IconButton onClick={(e) => handleOpenCopyDialog(e, day)} sx={{ padding: '5px' }}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </>
            )}
            {enabled && additionalTimes?.map((time, index) => (
              <Grid container alignItems="center" spacing={1} key={`${day}-${index}`} mt={'1%'}>
                <Grid item xs={0.6} />
                <Grid item xs={1.5} mt={isSmallScreen ? '1%' : '0.5%'} />
                <Grid item spacing={isSmallScreen ? '2.5' : '2'} mt={isSmallScreen ? '1%' : '0.5%'}>
                  <TimePicker
                    value={time.startTime}
                    onChange={(newValue) => handleTimeChange(day, 'startTime', newValue || new Date(), index + 1)}
                    sx={{ mb: 3, height: '30px', width: '130px' }} />
                </Grid>
                <Box mx={1}>-</Box>
                <Grid item spacing={isSmallScreen ? '2.5' : '2'} mt={isSmallScreen ? '1%' : '0.5%'}>
                  <TimePicker
                    value={time.endTime}
                    onChange={(newValue) => handleTimeChange(day, 'endTime', newValue || new Date(), index + 1)}
                    sx={{ mb: 3, height: '30px', width: '130px' }} />
                </Grid>
                <Grid item xs={1}>
                  <Tooltip
                    title={`Remove ${fullDayNames[day]} Interval ${index + 2}`}
                    sx={{
                      '& .MuiTooltip-tooltip': {
                        backgroundColor: 'black',
                        color: 'white'
                      }
                    }}
                  >
                    <IconButton onClick={() => handleRemove(day, index + 1)} sx={{ padding: '5px' }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {time.error && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="error" sx={{ marginLeft: '17%', fontSize: '18px' }}>
                      {time.error}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ))}
          </Grid><Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Box component="div" sx={{display:'block'}}>
              <Box component="div" sx={{display:'inline-block'}}>
                <Checkbox checked={enabled} onChange={() => handleEnabledChange(day)} sx={{
                  transform: 'scale(0.8)',
                  fontSize: '12px',
                }} />
              </Box>
              <Box component="div" sx={{display:'inline-block'}}>
                <Box sx={{ fontWeight: enabled ? 'bold' : 'normal', fontSize: '11.5px', letterSpacing: '0.1em' }}>{day}</Box>
              </Box>
            </Box>
            <Box component="div" sx={{display:'block'}}>
              {enabled ? (
                <>
                  <Box component="div" sx={{display:'table',margin:'2%'}}>
                    <Box component="div" sx={{display:'table-cell','paddingRight':'3px'}}>
                      <TimePicker
                        value={startTime}
                        onChange={(newValue) => handleTimeChange(day, 'startTime', newValue || new Date())}
                        sx={{ width: '130px' }} />
                    </Box>
                    <Box component="div" sx={{display:'table-cell',verticalAlign:'middle'}}><RemoveIcon fontSize="small" /></Box>
                    <Box component="div" sx={{display:'table-cell','paddingLeft':'3px'}}>
                      <TimePicker
                        value={endTime}
                        onChange={(newValue) => handleTimeChange(day, 'endTime', newValue || new Date())}
                        sx={{ width: '130px' }} />
                    </Box>
                    <Box component="div" sx={{display:'table-cell',verticalAlign:'middle','paddingLeft':'2%'}}>
                      <Tooltip
                        title={`Remove ${fullDayNames[day]} Interval 1`}
                        sx={{
                          '& .MuiTooltip-tooltip': {
                            backgroundColor: 'black',
                            color: 'white'
                          }
                        }}
                      >
                        <IconButton onClick={() => handleRemove(day)} sx={{ padding: '5px' }}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {additionalTimes?.map((time, index) => (
                    <><Box component="div" sx={{ display: 'table', margin: '2%' }}>
                      <Box component="div" sx={{ display: 'table-cell', 'paddingRight': '3px' }}>
                        <TimePicker
                          value={time.startTime}
                          onChange={(newValue) => handleTimeChange(day, 'startTime', newValue || new Date(), index + 1)}
                          sx={{ mb: 3, height: '30px', width: '130px' }} />
                      </Box>
                      <Box component="div" sx={{ display: 'table-cell', verticalAlign: 'middle' }}><RemoveIcon fontSize="small" /></Box>
                      <Box component="div" sx={{ display: 'table-cell', 'paddingLeft': '3px' }}>
                        <TimePicker
                          value={time.endTime}
                          onChange={(newValue) => handleTimeChange(day, 'endTime', newValue || new Date(), index + 1)}
                          sx={{ mb: 3, height: '30px', width: '130px' }} />
                      </Box>
                      <Box component="div" sx={{ display: 'table-cell', verticalAlign: 'middle', 'paddingLeft': '2%' }}>
                        <Tooltip
                          title={`Remove ${fullDayNames[day]} Interval ${index + 2}`}
                          sx={{
                            '& .MuiTooltip-tooltip': {
                              backgroundColor: 'black',
                              color: 'white'
                            }
                          }}
                        >
                          <IconButton onClick={() => handleRemove(day, index + 1)} sx={{ padding: '5px' }}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box><Box component="div" sx={{ display: 'block', marginLeft: '4%' }}>
                      {time.error && (
                        <Box component="div" sx={{ display: 'block' }}>
                          <Typography variant="body2" color="error">
                            {time.error}
                          </Typography>
                        </Box>
                      )}
                    </Box></>
                  ))}
                  <Box component="div" sx={{display:'block',margin:'3% 0'}}>
                    <Box component="div" sx={{display:'inline-block'}}>
                      <Tooltip
                        title={`New Interval for ${fullDayNames[day]}`}
                        sx={{
                          '& .MuiTooltip-tooltip': {
                            backgroundColor: 'black',
                            color: 'white'
                          }
                        }}
                      >
                        <IconButton onClick={() => handleAddTime(day)} sx={{ padding: '5px' }}>
                          <Add fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box component="div" sx={{display:'inline-block'}}>
                      <Tooltip
                        title="Copy to Other Days"
                        sx={{
                          '& .MuiTooltip-tooltip': {
                            backgroundColor: 'black',
                            color: 'white'
                          }
                        }}
                      >
                        <IconButton onClick={(e) => handleOpenCopyDialog(e, day)} sx={{ padding: '5px' }}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box component="div" sx={{display:'block',marginLeft:'4%'}}>
                    {error && (
                      <Box component="div" sx={{display:'block'}}>
                        <Typography variant="body2" color="error">
                          {error}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Divider />
                </>
              ) : (
                <>
                  <Box component="div" sx={{display:'block',marginLeft:'4%'}}>
                    <Box sx={{ color: 'gray', fontStyle: 'italic' }}>Unavailable</Box>
                  </Box>
                  <Box component="div" sx={{display:'block',margin:'3% 0'}}>
                    <Box component="div" sx={{display:'inline-block'}}>
                      <Tooltip
                        title={`New Interval for ${fullDayNames[day]}`}
                        sx={{
                          '& .MuiTooltip-tooltip': {
                            backgroundColor: 'black',
                            color: 'white'
                          }
                        }}
                      >
                        <IconButton onClick={() => handleAddTime(day)} sx={{ padding: '5px' }}>
                          <Add fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box component="div" sx={{display:'inline-block'}}>
                      <Tooltip
                        title="Copy to Other Days"
                        sx={{
                          '& .MuiTooltip-tooltip': {
                            backgroundColor: 'black',
                            color: 'white'
                          }
                        }}
                      >
                        <IconButton onClick={(e) => handleOpenCopyDialog(e, day)} sx={{ padding: '5px' }}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Divider />
                </>
              )}
            </Box>
          </Box></>
        ))}
      </LocalizationProvider>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            boxShadow: 'none',
            border: '1px solid #ccc',
          },
        }}
      >
        <Box p={2}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
 Copy Times to
          </Typography>
          <FormGroup>
            {daysOfWeek.map(day => (
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    checked={copyToDays[day] || false}
                    onChange={(e) => setCopyToDays({ ...copyToDays, [day]: e.target.checked })}
                    disabled={day === copyFromDay}
                    sx={{
                      fontSize: '12px',
                      '&.MuiCheckbox-root': {
                        color: theme.palette.grey[500],
                      },
                      '&.Mui-checked': {
                        color: '#73A870',
                      },
                      '&.Mui-disabled': {
                        color: theme.palette.grey[300],
                        '&.Mui-checked': {
                          color: theme.palette.grey[500],
                          backgroundColor: theme.palette.grey[300],
                        },
                      },
                    }}
                  />
                }
                label={
                  <span style={{ fontSize: '13px' }}>{day}</span>
                }
              />
            ))}
          </FormGroup>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleCopyApply} color="primary">Apply</Button>
          </Box>
        </Box>
      </Popover>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mb: '4%', ml: '6%' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
        Changes Saved
        </Alert>
      </Snackbar>
    </Box>
  );
};


export default function ListView({onUnsavedChanges,selectedDate,handleRulesChange,availabilityResponse,mentorId,timeZone}) {
  console.log('selectedDate',selectedDate);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery('(max-width:1536px)');
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [customScheduleHours,setCustomScheduleHours] = useState([]);
  // const [internalState, setInternalState] = useState(props.availabilityResponse);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const getScheduleHours = (schedule) => {
    setCustomScheduleHours((prevState) => {
      // Filter out any entries that are not in the new schedule
      const updatedSchedule = prevState.filter((prevItem) =>
        schedule.some((newItem) => {
          if (prevItem.type === 'wday' && newItem.type === 'wday') {
            return prevItem.wday === newItem.wday;
          } else if (prevItem.type === 'date' && newItem.type === 'date') {
            return prevItem.date === newItem.date;
          }
          return false;
        })
      );
  
      // Add or update entries from the new schedule
      schedule.forEach((newItem) => {
        const index = updatedSchedule.findIndex(
          (item) =>
            (item.type === 'wday' && item.wday === newItem.wday) ||
            (item.type === 'date' && item.date === newItem.date)
        );
  
        if (index !== -1) {
          // Update existing entry
          updatedSchedule[index] = newItem;
        } else {
          // Add new entry
          updatedSchedule.push(newItem);
        }
      });
  
      return updatedSchedule;
    });
  };
  
  
  // useEffect(() => {
  //   setInternalState(props.availabilityResponse);
  // }, [props.availabilityResponse]);
  useEffect(() => {
    const fetchData = () => {
      // console.log('internalState',internalState);
      if(availabilityResponse.length > 0){
        const getDataHours = availabilityResponse;
        for(let i = 0; i <getDataHours.length; i++) {
          if(getDataHours[i].type == 'wday'){
            getDataHours[i].wday =  (getDataHours[i].wday).charAt(0).toUpperCase() + (getDataHours[i].wday).slice(1);
          }
        }
        setCustomScheduleHours(getDataHours);
      }
    };
    if(mentorId && mentorId != 0){
      fetchData();
    }
  }, [mentorId,availabilityResponse]);
  return (
    <Box>
      {isMobileScreen ? (
        <>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Weekly Hours" />
            <Tab label="Date Specific Hours" />
          </Tabs>
          <Box mt={2}>
            {activeTab === 0 && (
              <Box width="100%">
                <WeeklyHours isSmallScreen={isSmallScreen} onUnsavedChanges={onUnsavedChanges} handleRulesChange={handleRulesChange} getScheduleHours={getScheduleHours}  mentorId={mentorId} customScheduleHours={customScheduleHours} timeZone={timeZone} isMobileScreen={isMobileScreen} />
              </Box>
            )}
            {activeTab === 1 && (
              <Box width="100%">
                <DateSpecificHours selectedDate={selectedDate} handleRulesChange={handleRulesChange} getScheduleHours={getScheduleHours} customScheduleHours={customScheduleHours} />
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Box display="flex">
          <Box
            width="60%"
            sx={{
              borderRight: '1px solid #e0e0e0',
              paddingRight: '10px'
            }}
          >
            <WeeklyHours isSmallScreen={isSmallScreen} onUnsavedChanges={onUnsavedChanges} handleRulesChange={handleRulesChange} getScheduleHours={getScheduleHours} mentorId={mentorId} customScheduleHours={customScheduleHours} timeZone={timeZone} isMobileScreen={isMobileScreen} />
          </Box>
          <Box width="37%" paddingLeft="3%">
            <DateSpecificHours selectedDate={selectedDate} handleRulesChange={handleRulesChange} getScheduleHours={getScheduleHours} customScheduleHours={customScheduleHours}/>
          </Box>
        </Box>
      )}
    </Box>
  );
}