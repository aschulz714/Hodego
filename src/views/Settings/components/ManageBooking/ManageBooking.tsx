/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useEffect} from 'react';
import { Tabs, Tab, Box, Typography, Button, Badge } from '@mui/material';
import HistoryContent from './HistoryContent';
import PendingContent from './PendingContent';
import UpcomingContent from './UpcomingContent';
import { getData } from '../../../../theme/Axios/apiService';
import './ManageBooking.css';
import siteConfig from '../../../../theme/site.config';
import UpcomingTwoToneIcon from '@mui/icons-material/UpcomingTwoTone';
import PendingActionsTwoToneIcon from '@mui/icons-material/PendingActionsTwoTone';
import HistoryTwoToneIcon from '@mui/icons-material/HistoryTwoTone';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ManageBooking: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const userId = localStorage.getItem('userId');
  const [pendingContent, setPendingContent] = React.useState([]);
  const [upcomingContent, setUpcomingContent] = React.useState([]);
  const [upcomingCount, setUpcomingCount] = React.useState(0);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [historyCount, setHistoryCount] = React.useState(0);
  const [currentTimeZone, setCurrentTimeZone] = React.useState('');
  const [historyContent, setHistoryContent] = React.useState([]);
  const timezoneMap = {
    'Asia/Calcutta': 'Asia/Kolkata',
    'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
    'Asia/Saigon': 'Asia/Ho_Chi_Minh',
    'Europe/Nicosia': 'Asia/Nicosia',
    'Pacific/Ponape': 'Pacific/Pohnpei',
  };
  useEffect(() => {
    if(currentTimeZone == ''){
      setCurrentTimeZone(getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone));
    }
    if (userId) {
      fetchData(value,getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone));
    }
  }, [userId,value]);
  useEffect(() =>{

  },[upcomingCount,pendingCount,historyCount]);
  const fetchData = async (value,timeZone) => {
    if(value == 0 || value == 1){
      const upComingResponse = await getData(`${siteConfig.hodegoUrl}mentor/booking?bookedBy=${userId}&limit=5&offset=0&status=upcoming&userTimeZone=${timeZone}`);
      if(upComingResponse){
        if(upComingResponse.data){
          setUpcomingCount(upComingResponse.data.total);
          if(upComingResponse.data.data.length>0){
            setUpcomingContent(upComingResponse.data.data);
          }
        }
      }
      const pendingResponse = await getData(`${siteConfig.hodegoUrl}mentor/booking?bookedBy=${userId}&limit=5&offset=0&status=pending&userTimeZone=${timeZone}`);
      if(pendingResponse){
        if(pendingResponse.data){
          setPendingCount(pendingResponse.data.total);
          if(pendingResponse.data.data.length>0){
            setPendingContent(pendingResponse.data.data);
          }
        }
      }
    }
    else{
      const historyResponse = await getData(`${siteConfig.hodegoUrl}mentor/booking?bookedBy=${userId}&limit=5&offset=0&status=history&userTimeZone=${timeZone}`);
      if(historyResponse){
        if(historyResponse.data){
          if(historyResponse.data.total){
            setHistoryCount(historyResponse.data.total);
          }
          if(historyResponse.data.data.length>0){
            setHistoryContent(historyResponse.data.data);
          }
        }
      }
    }
    
    
  };

  const getUpdatedTimezone = (timezone) => {
    return timezoneMap[timezone] || timezone;
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom sx={{marginLeft:'2%'}}>
        The session timings are following your local timezone <strong>{currentTimeZone}</strong> 
        {/* <a href="#update">Update</a> */}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="booking tabs"  variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile>
          <Tab sx={{fontSize:'16px'}} 
            label={upcomingCount > 0?<Badge badgeContent={upcomingCount} color="primary" className='hodegoTabSection'><Box sx={{ display: 'flex', alignItems: 'center' }}>
              <UpcomingTwoToneIcon sx={{ marginRight: 1 }} />
        Upcoming
            </Box></Badge>:<Box sx={{ display: 'flex', alignItems: 'center' }}>
              <UpcomingTwoToneIcon sx={{ marginRight: 1 }} />
        Upcoming
            </Box>} {...a11yProps(0)} />
          <Tab sx={{fontSize:'16px'}} 
            label={pendingCount > 0?<Badge badgeContent={pendingCount} color="primary" className='hodegoTabSection'><Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PendingActionsTwoToneIcon sx={{ marginRight: 1 }} />
        Pending
            </Box></Badge>:<Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PendingActionsTwoToneIcon sx={{ marginRight: 1 }} />
        Pending
            </Box>} {...a11yProps(1)} />
          <Tab sx={{fontSize:'16px'}} 
            label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryTwoToneIcon sx={{ marginRight: 1 }} />
        History
            </Box>} {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <UpcomingContent currentTimeZone={currentTimeZone} fetchData={fetchData} upcomingCount={upcomingCount} upcomingContent={upcomingContent}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PendingContent currentTimeZone={currentTimeZone} fetchData={fetchData} pendingCount={pendingCount} pendingContent={pendingContent}/>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <HistoryContent currentTimeZone={currentTimeZone} historyCount={historyCount} historyContent={historyContent}/>
      </TabPanel>
    </Box>
  );
};

export default ManageBooking;
