import React, { useState,useEffect,useRef } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import { useNavigate } from 'react-router-dom';
import TabPanel from '@mui/lab/TabPanel';
import LockClockIcon from '@mui/icons-material/LockClock';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListView from './components/ListView';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import HodegoFavicon from '../../assets/images/hodegoFavicon.png';
import { Tooltip, IconButton } from '@mui/material';
import CalendarView from './components/CalendarView';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CalendarTodayTwoToneIcon from '@mui/icons-material/CalendarTodayTwoTone';
import ListTwoToneIcon from '@mui/icons-material/ListTwoTone';
import { Button, InputLabel, Snackbar, Alert, OutlinedInput, Switch, Modal,FormControlLabel,Grid,FormControl } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import siteConfig from '../../theme/site.config';
import dayjs from 'dayjs';
import { getData,putData } from '../../theme/Axios/apiService';
import './Schedule.css';

const timezoneMap = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Europe/Nicosia': 'Asia/Nicosia',
  'Pacific/Ponape': 'Pacific/Pohnpei',
};
export default function LabTabs(props) {
  interface DayRules {
    type: string;
    wday:string;
    intervals?: { to: string; from: string;}[];
   }
  const fullDayNames = {
    SUN: 'sunday',
    MON: 'monday',
    TUE: 'tuesday',
    WED: 'wednesday',
    THU: 'thursday',
    FRI: 'friday',
    SAT: 'saturday'
  };
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const currentMentorId = props.mentorId == 0 ? localStorage.getItem('mentorId'):props.mentorId;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const getUpdatedTimezone = (timezone) => {
    return timezoneMap[timezone] || timezone;
  };
  const navigate = useNavigate();
  const [value, setValue] = useState('1');
  const [loading, setLoading] = useState(true);
  const timer = useRef<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [endsOption, setEndsOption] = useState('never');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [changeStatus, setChangeStatus] = useState(false);
  const [timeZoneList, setTimeZoneList] = useState([]);
  const [availabilityResponse, setAvailabilityResponse] = useState([]);
  const [instantJoining, setInstantJoining] = useState(false);
  const [sameDayBooking, setSameDayBooking] = useState(false);
  const [timeZone, setTimeZone] = useState(getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone));
  const [initialState, setInitialState] = useState({
    instantJoining: false,
    sameDayBooking: false,
    recurrenceEnds: 'never',
    timeZone: getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    rules: [],
  });
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await getData(`${siteConfig.hodegoUrl}user/identity/timeZone`);
      if(response){
        if(response.data){
          if(response.data.length>0){
            setTimeZoneList(response.data);
          }
        }
      }
    };
    const fetchAvailabilityData = async () => {
      const response = await getData(`${siteConfig.hodegoUrl}mentor/${currentMentorId}/availability`);
      //?timeZone=${timeZone}
      
      if(response?.data){
        let fetchedRules = [];
        if(response.data && response.data.rules && response.data.rules.length > 0){
          fetchedRules = response.data.rules;
          setAvailabilityResponse(fetchedRules);
        }
        else{
          const rules:DayRules[] = daysOfWeek.map(day => ({
            type:'wday',
            wday:fullDayNames[day],
            intervals:[{ from:formatTime(new Date(2023, 0, 1, 9, 0)),to:formatTime(new Date(2023, 0, 1, 17, 0)) }],
          }));
          fetchedRules = rules;
          setAvailabilityResponse(rules);
          // const formData = {
          //   'rules':rules,
          //   'timeZone':timeZone,
          // };
          // const response = await putData(formData,`${siteConfig.hodegoUrl}mentor/${currentMentorId}/availability`);
          // if(response){
          //   if(response.data && response.data == true){
          //     console.log(response.data);
          //     props.getProfileStrength();
          //   }
          // }
        }
        if(response.data.timeZone){
          setTimeZone(response.data.timeZone);
        }
        else{
          setTimeZone(getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone));
        }
        if (response.data.recurrenceEnds) {
          setEndsOption(response.data.recurrenceEnds === 'never' ? 'never' : 'on');
          if (response.data.recurrenceEnds !== 'never') {
            setSelectedDate(dayjs(response.data.recurrenceEnds, 'YYYY-MM-DD'));
          }
        }
        if(response.data.request == 1){
          setInstantJoining(false);
        }else{
          setInstantJoining(true);
        }
        if(response.data.zeroDayBook == 0){
          setSameDayBooking(false);
        }else{
          setSameDayBooking(true);
        }
        const tmpArr = fetchedRules;
        if (tmpArr.length > 0) {
          for (let i = 0; i < tmpArr.length; i++) {
            if (tmpArr[i].type === 'wday') {
              tmpArr[i].wday = capitalize(tmpArr[i].wday); // Capitalize wday
            }
          }
        }
        setInitialState({
          instantJoining: response.data.request !== 1,
          sameDayBooking: response.data.zeroDayBook === 1,
          recurrenceEnds: response.data.recurrenceEnds == 'never'?'never':dayjs(response.data.recurrenceEnds).format('MM-DD-YYYY'),
          timeZone: response.data.timeZone || getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone),
          rules: _.cloneDeep(tmpArr),
        });
      }
      else{
        setDefaultStatus(true);
        const rules:DayRules[] = daysOfWeek.map(day => ({
          type:'wday',
          wday:fullDayNames[day],
          intervals:[{ from:formatTime(new Date(2023, 0, 1, 9, 0)),to:formatTime(new Date(2023, 0, 1, 17, 0)) }],
        }));
        setAvailabilityResponse(rules);
      }
      // else{
      //   if(response.data == null){
      //     const rules:DayRules[] = daysOfWeek.map(day => ({
      //       type:'wday',
      //       wday:fullDayNames[day],
      //       intervals:[{ from:formatTime(new Date(2023, 0, 1, 9, 0)),to:formatTime(new Date(2023, 0, 1, 17, 0)) }],
      //     }));
      //     setAvailabilityResponse(rules);
      //     const formData = {
      //       'rules':rules,
      //       'timeZone':timeZone,
      //     };
      //     const response = await putData(formData,`${siteConfig.hodegoUrl}mentor/${currentMentorId}/availability`);
      //     if(response){
      //       if(response.data && response.data == true){
      //         console.log(response.data);
      //         props.getProfileStrength();
      //       }
      //     }
      //   }
      // }
    };
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    fetchData();
    if(props.isVerifiedStatus == 1 && props.stripeStatus =='verified'){
      fetchAvailabilityData();
    }
    return () => clearTimeout(timer);
  }, [props.isVerifiedStatus,value]);
  const capitalize = (word) => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };
  const handleUnsavedChanges = (hasChanges) => {
    setUnsavedChanges(hasChanges);
    props.savedStatus(hasChanges);
  };
  
  useEffect(() => {
    const currentStatus = defaultStatus == false ?checkUnsavedChanges():false;
    setUnsavedChanges(currentStatus);
    props.savedStatus(currentStatus);
  }, [instantJoining, sameDayBooking, timeZone, availabilityResponse, changeStatus, defaultStatus, endsOption, selectedDate]);

  const handleEndsChange = (event: SelectChangeEvent<string>) => {
    setDefaultStatus(false);
    const value = event.target.value;
    setEndsOption(value);
    console.log('value',value);
    if (value === 'on') {
      setModalOpen(true);
    }
    else if(value === 'never') {
      setSelectedDate(dayjs());
    }
  };
  const handleCloseModal = () => setModalOpen(false);

  const handleConfirmDate = () => {
    setModalOpen(false);
  };
  const checkUnsavedChanges = () => {
    const hasErrors = availabilityResponse.some((rule) =>
      rule.intervals.some((interval) => interval.error) // Check if any interval has errors
    );
  
    return (
      !hasErrors && // Prevent save button from showing if errors exist
      (
        initialState.instantJoining !== instantJoining ||
        initialState.sameDayBooking !== sameDayBooking ||
        initialState.timeZone !== timeZone ||
        !areRulesEqual(initialState.rules, availabilityResponse) ||
        initialState.recurrenceEnds !== (endsOption === 'never' ? 'never' : selectedDate.format('MM-DD-YYYY'))
      )
    );
  };
  
  const areRulesEqual = (rules1, rules2) => {
    if (rules1.length !== rules2.length) return false;
  
    return rules1.every((rule1, index) => {
      const rule2 = rules2[index];
  
      // Check type and wday/date
      if (rule1.type !== rule2.type) return false;
      if (rule1.type === 'wday' && rule1.wday !== rule2.wday) return false;
      if (rule1.type === 'date' && rule1.date !== rule2.date) return false;
  
      // Check intervals
      if (rule1.intervals.length !== rule2.intervals.length) return false;
      return rule1.intervals.every((interval1, idx) => {
        const interval2 = rule2.intervals[idx];
        return interval1.from === interval2.from && interval1.to === interval2.to;
      });
    });
  };
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const handleRulesChange = (newRules) => {
    setChangeStatus(true);
    setDefaultStatus(false);
    const clonedRules = _.cloneDeep(newRules);
    setAvailabilityResponse(clonedRules);
    console.log(initialState.rules, clonedRules);
  };
  const handleSaveChanges = async () => {
    const tmpArr = JSON.parse(JSON.stringify(availabilityResponse));
    if(tmpArr.length > 0){
      for(let i = 0; i <tmpArr.length; i++) {
        if(tmpArr[i].type == 'wday'){
          tmpArr[i].wday = (tmpArr[i].wday).toLowerCase();
        }
      }
    }
    const requestStatus = instantJoining ? 0 : 1;
    const bookingStatus = sameDayBooking ? 1 : 0;
    const formData = {
      rules: tmpArr,
      timeZone: timeZone,
      request: requestStatus,
      zeroDayBook: bookingStatus,
      recurrenceEnds: endsOption == 'never'?'never':selectedDate.format('MM-DD-YYYY'),
    };
    const response = await putData(formData, `${siteConfig.hodegoUrl}mentor/${currentMentorId}/availability`);
    if (response?.data === true) {
      props.getProfileStrength();
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = window.setTimeout(() => {
        setInitialState({
          instantJoining,
          sameDayBooking,
          recurrenceEnds: endsOption === 'never' ? 'never' : selectedDate.format('MM-DD-YYYY'),
          timeZone,
          rules: tmpArr,
        });
        props.savedStatus(false);
        setUnsavedChanges(false);
        setSnackbarOpen(true);
      }, 500);
      
    }
  };
  const handleInstantJoiningChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultStatus(false);
    setInstantJoining(event.target.checked);
  };
  const handleSameDayBookingChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultStatus(false);
    setSameDayBooking(event.target.checked);
  };
  
  
  const handleTabChange = (event, newValue) => {
    if (unsavedChanges) {
      const confirmSwitch = window.confirm('You have unsaved changes. Do you want to save them before switching?');
      if (confirmSwitch) {
        handleSaveChanges(); // Save changes
      } else {
        return; // Prevent tab switch
      }
    }
    setValue(newValue);
  };

  const handleTimezoneChange = async(event) => {
    setDefaultStatus(false);
    setTimeZone(event.target.value);
    localStorage.setItem('myTimeZone', event.target.value);
  };
  const handleChange = () => {
    navigate('?value=hodegoVerify', { replace: true });
    window.location.reload();
  };

  if (loading) {
    return <Box>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
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
    </Box>;
  }

  return (
    <>
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
      {props.isVerifiedStatus == 0?
        <Box component="div" sx={{zIndex: 1,top: isMobile?'55vh':'calc(50vh - 100px)', left: '50%',transform: 'translate(-50%,-50%)',textAlign:'center',position:'absolute'}}>
          <LockClockIcon sx={{fontSize:'50px',color:'#677788'}} />
          <Typography variant="h5" sx={{paddingBottom:'2%'}}>
         Hodego Expert Application is Pending Approval.
          </Typography>
          <Typography variant="h6">
         You will receive notification via email once you've been approved.
          </Typography>
        </Box>:''}
      {props.isVerifiedStatus == 1 && props.stripeStatus !='verified'?
        <Box component="div" sx={{zIndex: 1,top: isMobile?'55vh':'calc(50vh - 100px)', left: '50%',transform: 'translate(-50%,-50%)',textAlign:'center',position:'absolute'}}>
          <LockPersonIcon sx={{fontSize:'50px',color:'#677788'}} />
          <Typography variant="h5" sx={{paddingBottom:'2%'}}>
          Access to this page is temporarily unavailable due to pending identity verification.
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={handleChange}
              sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
              size="large"
            >
               Verify Your Account
            </Button>
          </Box>
        </Box>:''}
      <Box sx={{ width: '100%', typography: 'body1' }} className={props.isVerifiedStatus==0||props.stripeStatus !='verified'?'verificationDisabled':''}>
      
        <Box sx={{ marginLeft: '1.5%' }}>
          <Typography variant="body2" sx={{ mb: 2,fontSize:'18px' }}>
          Set Your Availability
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }} className="sticky-save-strip">
          {unsavedChanges && (
            <Alert
              severity="warning"
              className="scheduleWarning fixed-save-strip"
              action={
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ background: 'linear-gradient(90deg, #0C6697, #73A870)' }}
                  disabled={!unsavedChanges || availabilityResponse.some(rule => rule.intervals.some(interval => interval.error))}
                  onClick={handleSaveChanges}
                >
  Save Changes
                </Button>
              }
            >
       You have unsaved changes!
            </Alert>
          )}
        </Box>
        <Box sx={{ marginBottom: 2, marginLeft: '1.5%' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <InputLabel sx={{ marginBottom: '1%' }}>Time Zone</InputLabel>
              <Select
                input={<OutlinedInput label="Time zone" />}
                labelId="demo-simple-select-standard-label"
                name="timeZone"
                sx={{ textAlign: 'left', width: '100%' }}
                value={timeZone}
                MenuProps={MenuProps}
                onChange={handleTimezoneChange}
              >
                {timeZoneList.map((timezone) => (
                  <MenuItem key={timezone.id} value={timezone.timeZoneName}>
                    {timezone.timeZoneName}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item>
                <InputLabel sx={{ marginBottom: '1%' }}>Ends</InputLabel>
                <FormControl sx={{ width: '200px' }}>
                  <Select
                    input={<OutlinedInput label="Ends" />}
                    labelId="demo-simple-select-standard-label"
                    value={endsOption}
                    name="ends"
                    sx={{ textAlign: 'left', width: '100%' }}
                    MenuProps={MenuProps}
                    onChange={handleEndsChange}
                  >
                    <MenuItem value="never">Never</MenuItem>
                    <MenuItem value="on" onClick={() => {
                      if (endsOption === 'on') {
                        setModalOpen(true); // Force open modal on clicking "On"
                      }
                    }}>
                      {endsOption === 'on' ? `On: ${selectedDate.format('MMM D, YYYY')}` : 'On'}
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Modal for Date Picker */}
                <Modal open={modalOpen} onClose={handleCloseModal}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: 'background.paper',
                      p: 3,
                      borderRadius: 2,
                      boxShadow: 3,
                      textAlign: 'center',
                    }}
                  >
                    <StaticDatePicker
                      displayStaticWrapperAs="desktop"
                      value={selectedDate}
                      onChange={(newValue) => {
                        setSelectedDate(newValue);
                        setDefaultStatus(false);
                      }}
                      minDate={dayjs()}
                    />
                    <Box mt={2} sx={{display:'flex',justifyContent:'space-between'}}>
                      <Button onClick={handleCloseModal} variant="outlined">
                                Cancel
                      </Button>
                      <Button onClick={handleConfirmDate} variant="contained" sx={{ background: 'linear-gradient(90deg, #0C6697, #73A870)' }}>
                                Apply
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </Grid>
            </LocalizationProvider>
            <Grid item>
              <FormControlLabel
                control={<Switch checked={instantJoining} onChange={handleInstantJoiningChange} />}
                label="Instant Booking"
              />
              <Tooltip 
                arrow
                disableInteractive={isMobile} // Only disable interactivity on mobile
                enterTouchDelay={0} // Ensures immediate display on touch
                title={instantJoining == false?(<Box sx={{fontSize:'20px',fontFamily:'Bliss Regular',padding:'5px'}}>Enable to confirm session requests automatically. Disable to review and approve requests within 72 hours.</Box>):(<Box sx={{fontSize:'20px'}}>Enable to confirm session requests automatically. Disable to review and approve requests within 72 hours.</Box>)}>
                <IconButton>
                  <InfoOutlinedIcon color="action" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Switch checked={sameDayBooking} onChange={handleSameDayBookingChange} />}
                label="Same Day Booking"
              />
              <Tooltip 
                arrow
                disableInteractive={isMobile} // Only disable interactivity on mobile
                enterTouchDelay={0} // Ensures immediate display on touch
                title={sameDayBooking == false?(<Box sx={{fontSize:'20px',fontFamily:'Bliss Regular',padding:'5px'}}>Enable to allow same-day sessions. Approval of same-day session requests is required in the Bookings tab. Sessions within 3 hours of start time won’t appear on your calendar. </Box>):(<Box sx={{fontSize:'20px'}}>Enable to allow same-day sessions. Approval of same-day session requests is required in the Bookings tab. Sessions within 3 hours of start time won’t appear on your calendar. .</Box>)}>
                <IconButton>
                  <InfoOutlinedIcon color="action" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>
        
        <TabContext value={value}>
          <Box sx={{ marginLeft:'1.5%',borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleTabChange} aria-label="tablist">
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListTwoToneIcon sx={{ marginRight: 1 }} />
                  List View
                  </Box>
                }
                value="1"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayTwoToneIcon sx={{ marginRight: 1 }} />
                  Calendar View
                  </Box>
                }
                value="2"
              />
            </TabList>
          </Box>
          <TabPanel value="1"><ListView onUnsavedChanges={handleUnsavedChanges} selectedDate={endsOption == 'never'?selectedDate.subtract(1, 'day') :selectedDate} mentorId={currentMentorId} handleRulesChange={handleRulesChange} availabilityResponse={availabilityResponse} timeZone={timeZone} /></TabPanel>
          <TabPanel value="2"><CalendarView selectedMaxDate={endsOption == 'never'?selectedDate.subtract(1, 'day') :selectedDate} mentorId={currentMentorId} handleRulesChange={handleRulesChange}/></TabPanel>
        </TabContext>
      </Box>
    </>
  );
}
