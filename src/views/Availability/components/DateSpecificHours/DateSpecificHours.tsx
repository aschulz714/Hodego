import React, { useState,useEffect } from 'react';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';
import DateSpecificHoursModal from './DateSpecificHoursModal';

interface DateHours {
  date: string;
  startTime: string;
  endTime: string;
}

const DateSpecificHours:  React.FC<{  selectedDate: any,customScheduleHours: any[],getScheduleHours: (params: any[]) => void,handleRulesChange:(params: any[]) => void }> = ({ selectedDate,customScheduleHours,getScheduleHours,handleRulesChange }) => {
  const [dateHours, setDateHours] = useState<DateHours[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentEditingDate, setCurrentEditingDate] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const currentFormatTime = (time) =>{
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedTime = date.toLocaleString('en-US', options);
    
    return formattedTime;
  };
  useEffect(() => {
    const tmpArray: DateHours[] = [];
    if(customScheduleHours.length>0){
      for(let i=0; i<customScheduleHours.length; i++){
        if(customScheduleHours[i].type == 'date'){
          const [year, month, day] = customScheduleHours[i].date.split('-');
          const date = new Date(`${year}-${month}-${day}T00:00:00`);
          const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
          if(customScheduleHours[i].intervals.length > 0){
            for(let j=0; j<customScheduleHours[i].intervals.length; j++){
              tmpArray.push({
                date: formattedDate,
                startTime: customScheduleHours[i].intervals[j].from,
                endTime: customScheduleHours[i].intervals[j].to,
              });
            }
          }else{
            tmpArray.push({
              date: formattedDate,
              startTime: '',
              endTime: '',
            });
          }
          
        }
      }
    }
    // const tempArr = dateHours.concat(tmpArray);
    // const uniqueArray = tempArr.filter((obj, index, self) =>
    //   index === self.findIndex((t) => (
    //     t.date === obj.date && t.startTime === obj.startTime && t.endTime === obj.endTime
    //   ))
    // );
    // console.log('uniqueArray',uniqueArray);
    setDateHours(tmpArray);
  }, [customScheduleHours]);
  const handleDelete = (date: string) => {
    const newDateHours = dateHours.filter(item => item.date !== date);
    setDateHours(newDateHours);
    const updatedRemHours = [];
    if(customScheduleHours.length>0){
      for(let i=0; i<customScheduleHours.length; i++){
        if(customScheduleHours[i].type == 'date'){
          const [year, month, day] = customScheduleHours[i].date.split('-');
          const date1 = new Date(`${year}-${month}-${day}T00:00:00`);
          const formattedDate = date1.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
          if(formattedDate != date){
            updatedRemHours.push(customScheduleHours[i]);
          }
        }
        else{
          updatedRemHours.push(customScheduleHours[i]);
        }
      }
    }
    mentorAvailabilityApi(updatedRemHours);
  };

  const handleAdd = () => {
    setCurrentEditingDate(null);
    setModalIsOpen(true);
  };

  const handleEdit = (date: string) => {
    setCurrentEditingDate(date);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };
  const mentorAvailabilityApi = async(updatedhours) => {
    getScheduleHours(updatedhours);
    if(updatedhours.length > 0){
      for(let i = 0; i <updatedhours.length; i++) {
        if(updatedhours[i].type == 'wday'){
          updatedhours[i].wday = (updatedhours[i].wday).toLowerCase();
        }
      }
    }
    handleRulesChange(updatedhours);
    // const formData = {
    //   'rules':updatedhours,
    //   'timeZone':timeZone,
    // };
    // const response = await putData(formData,`${siteConfig.hodegoUrl}mentor/${mentorId}/availability`);
    // //?timeZone=${timeZone}
    // if(response){
    //   if(response.data && response.data == true){
    //     showNotification();
    //   }
    // }
    
  };
  const handleApplyModal = (date: any, timeFields: { startTime: string; endTime: string }[]) => {
    const currentRules = timeFields.map((field) => ({
      from: field.startTime,
      to: field.endTime
    }));
    const tempDate = new Date(date);
    const offset = tempDate.getTimezoneOffset() * 60000;
    const localDate = new Date(date - offset);
    const formattedDate = localDate.toISOString().split('T')[0];
    const tempItem = customScheduleHours;
    const renderHours =[];
    let tempStatus = false;
    if(tempItem.length>0){
      for(let i=0;i<tempItem.length;i++){
        if(tempItem[i].type=='date'){
          if(tempItem[i].date == formattedDate){
            // const tempArr = (tempItem[i].intervals).concat(currentRules);
            const tempArr = currentRules;
            const uniqueArray = tempArr.filter((obj, index, self) =>
              index === self.findIndex((t) => (
                t.from === obj.from && t.to === obj.to
              ))
            );
            tempItem[i].intervals = uniqueArray;
            tempStatus = true;
            break;
          }
        }
      }
    }
    if(tempStatus == false){
      tempItem.push({ type: 'date', date: formattedDate, intervals:currentRules });
    }
    for(let m=0;m<tempItem.length;m++){
      if(tempItem[m].type=='date'){
        if(tempItem[m].intervals.length > 0){
          for(let n=0;n<tempItem[m].intervals.length;n++){
            renderHours.push({
              date: formatDate(tempItem[m].date),
              startTime: tempItem[m].intervals[n].from,
              endTime: tempItem[m].intervals[n].to,
            });
          }
        }
        else{
          renderHours.push({
            date: formatDate(tempItem[m].date),
            startTime: '',
            endTime: '',
          });
        }
      }
    }
    // const filteredDateHours = dateHours.filter((item) => item.date !== date.format('MMMM DD, YYYY'));
    setDateHours(renderHours);
    const updatedhours = tempItem;
    mentorAvailabilityApi(updatedhours);
  };
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    return formattedDate;
  };
  // const showNotification = () => {
  //   setNotificationOpen(true);
  // };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };
  const groupedDateHours = dateHours.reduce((acc: { [key: string]: DateHours[] }, current) => {
    if (!acc[current.date]) {
      acc[current.date] = [];
    }
    acc[current.date].push(current);
    return acc;
  }, {});
  return (
    <Box component="div">
      <h2>Date-Specific Hours</h2>
      <h4>Set custom availability for specific dates when your schedule differs from your regular weekly hours.</h4>
     
      <Button variant="contained" color="primary" onClick={handleAdd} sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}>
        + Add Date-Specific Hours
      </Button>
      <List>
        {Object.entries(groupedDateHours)
          .sort(([dateA], [dateB]) => dayjs(dateA).valueOf() - dayjs(dateB).valueOf()) // Sort dates chronologically
          .map(([date, times], index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={`${dayjs(date).format('ddd, MMMM D, YYYY')}`}
                secondary={times.map((time, idx) => (
                  time.startTime !== '' ? (
                    <Box component="div" key={idx}>
                      {`${currentFormatTime(time.startTime)} - ${currentFormatTime(time.endTime)}`}
                    </Box>
                  ) : (
                    <Box component="div" key={idx}>Unavailable</Box>
                  )
                ))}
              />
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(date)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(date)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}

      </List>
      <DateSpecificHoursModal
        selectedMaxDates={selectedDate}
        open={modalIsOpen}
        onClose={handleCloseModal}
        onApply={handleApplyModal}
        initialData={
          currentEditingDate &&
    groupedDateHours &&
    groupedDateHours[currentEditingDate]
            ? groupedDateHours[currentEditingDate].map((item) => ({
              date: item.date,
              startTime: item.startTime || '',
              endTime: item.endTime || '',
            }))
            : []
        }
      />

      <Snackbar
        open={notificationOpen}
        autoHideDuration={1000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ marginLeft: '6%' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
        Changes Saved
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DateSpecificHours;