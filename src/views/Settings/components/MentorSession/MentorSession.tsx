import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Checkbox,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  InputAdornment,Typography
} from '@mui/material';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockClockIcon from '@mui/icons-material/LockClock';
import countryToCurrency from 'country-to-currency';
import { getData, putData } from '../../../../theme/Axios/apiService';
import siteConfig from '../../../../theme/site.config';
import './MentorSession.css';
interface Prices {
  '10 Min': string;
  '15 Min': string;
  '30 Min': string;
  '45 Min': string;
  '60 Min': string;
}

interface SelectedOptions {
  '10 Min': boolean;
  '15 Min': boolean;
  '30 Min': boolean;
  '45 Min': boolean;
  '60 Min': boolean;
}

interface MentorCallProps {
  countryCode: string;
  mentorId: number;
  handleSessionStatus: (status: boolean) => void;
  getProfileStrength: () => any;
  isVerifiedStatus: number;
}

const MentorCallPricing: React.FC<MentorCallProps> = ({ countryCode,mentorId,handleSessionStatus,getProfileStrength,isVerifiedStatus }) => {
  const [prices, setPrices] = useState<Prices>({
    '10 Min': '0',
    '15 Min': '',
    '30 Min': '',
    '45 Min': '',
    '60 Min': '',
  });
  const [currentPrices, setCurrentPrices] = useState<Prices>({
    '10 Min': '0',
    '15 Min': '',
    '30 Min': '',
    '45 Min': '',
    '60 Min': '',
  });
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    '10 Min': false,
    '15 Min': false,
    '30 Min': false,
    '45 Min': false,
    '60 Min': false,
  });
  const [selectedCurrentOptions, setSelectedCurrentOptions] = useState<SelectedOptions>({
    '10 Min': false,
    '15 Min': false,
    '30 Min': false,
    '45 Min': false,
    '60 Min': false,
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currencyId, setCurrencyId] = useState('USD');
  const [validationErrors, setValidationErrors] = useState<SelectedOptions>({
    '10 Min': false,
    '15 Min': false,
    '30 Min': false,
    '45 Min': false,
    '60 Min': false,
  });

  const [priceErrors, setPriceErrors] = useState<SelectedOptions>({
    '10 Min': false,
    '15 Min': false,
    '30 Min': false,
    '45 Min': false,
    '60 Min': false,
  });
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    // const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    //   if (isDirty) {
    //     event.preventDefault();
    //     event.returnValue = ''; // Required for some browsers to show the confirmation dialog
    //   }
    // };

    // window.addEventListener('beforeunload', handleBeforeUnload);

    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    // };
  }, [isDirty]);
  const areObjectsEqual = (
    obj1,
    obj2
  ): boolean => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // Check if both objects have the same keys
    if (keys1.length !== keys2.length) return false;

    // Check if all keys and values are the same
    return keys1.every((key) => obj1[key] === obj2[key]);
  };
  useEffect(() => {
    console.log('selectedOptions',selectedOptions);
    console.log('selectedCurrentOptions',selectedCurrentOptions);
    console.log('prices',prices);
    console.log('currentPrices',currentPrices);
    if(areObjectsEqual(selectedOptions,selectedCurrentOptions)){
      if(areObjectsEqual(prices,currentPrices)){
        handleSessionStatus(false);
      }
      else{
        handleSessionStatus(true);
      }
    }
    else{
      handleSessionStatus(true);
    }
   
  }, [selectedOptions,prices]);
  useEffect(() => {
    const fetchData = async () => {
      const currentMentorId = mentorId == 0 ? localStorage.getItem('mentorId'):mentorId;
      const response = await getData(`${siteConfig.hodegoUrl}mentor/${currentMentorId}/session`);
      if (response && response.data) {
        if (response.data.data.length > 0) {
          fetchCurrency();
          const fetchedData = response.data.data;
          const updatedPrices: Prices = {
            '10 Min': '0',
            '15 Min': '',
            '30 Min': '',
            '45 Min': '',
            '60 Min': '',
          };
          const updatedSelectedOptions: SelectedOptions = {
            '10 Min': false,
            '15 Min': false,
            '30 Min': false,
            '45 Min': false,
            '60 Min': false,
          };

          fetchedData.forEach((session: any) => {
            const timeLabel = `${session.time} Min` as keyof Prices;
            updatedPrices[timeLabel] = parseInt(session.rate).toString();
            updatedSelectedOptions[timeLabel] = true;
          });
          setCurrentPrices(updatedPrices);
          setPrices(updatedPrices);
          setSelectedCurrentOptions(updatedSelectedOptions);
          setSelectedOptions(updatedSelectedOptions);
        }
        if (response.data.currencyId) {
          setCurrencyId(response.data.currencyId);
        }
      }
    };
    const fetchCurrency = () => {
      const currencyCode = countryToCurrency[countryCode?countryCode:localStorage.getItem('countryCode')]; 
      if (currencyCode) {
        const formatter = new Intl.NumberFormat(navigator.language, {
          style: 'currency',
          currency: currencyCode,
        });
        const currency = formatter.resolvedOptions().currency;
        setCurrencyId(currency);
      } else {
        console.error(`Currency code for country ${countryCode} not found`);
      }
      
    };

    // Set user's currency
    // if (mentorId > 0) {
    fetchData();
    // }
  }, [mentorId]);
 
  const handleCheckboxChange = (callLength: keyof Prices) => {
    console.log('callLength',selectedOptions);
    setSelectedOptions((prev) => ({
      ...prev,
      [callLength]: !prev[callLength],
    }));
    setValidationErrors((prev) => ({
      ...prev,
      [callLength]: false,
    }));
    setPriceErrors((prev) => ({
      ...prev,
      [callLength]: false,
    }));
    console.log(selectedOptions,'selectedOptions');
  };

  const handlePriceChange = (callLength: keyof Prices, value: string) => {
    const parsedValue = value === '' ? '' : parseInt(value).toString();
    if (parsedValue === '' || (!isNaN(parseInt(parsedValue)) && parseInt(parsedValue) >= 0)) {
      setPrices({ ...prices, [callLength]: parsedValue });
      setPriceErrors((prev) => ({
        ...prev,
        [callLength]: false,
      }));
    }
  };

  const handleSave = async () => {
    setIsDirty(false);
    let hasError = false;
    const newValidationErrors: SelectedOptions = {
      '10 Min': false,
      '15 Min': false,
      '30 Min': false,
      '45 Min': false,
      '60 Min': false,
    };
    const newPriceErrors: SelectedOptions = {
      '10 Min': false,
      '15 Min': false,
      '30 Min': false,
      '45 Min': false,
      '60 Min': false,
    };

    // Validate that if a checkbox is selected, there must be a corresponding price
    Object.keys(prices).forEach((callLength) => {
      if (callLength === '10 Min') return; 
      if (selectedOptions[callLength as keyof Prices] && !prices[callLength as keyof Prices]) {
        newPriceErrors[callLength as keyof Prices] = true;
        hasError = true;
      }
    });

    // Validate that if there's a price, the checkbox must be selected
    Object.keys(prices).forEach((callLength) => {
      if (callLength === '10 Min') return; 
      if (prices[callLength as keyof Prices] && !selectedOptions[callLength as keyof Prices]) {
        newValidationErrors[callLength as keyof Prices] = true;
        hasError = true;
      }
    });

    setValidationErrors(newValidationErrors);
    setPriceErrors(newPriceErrors);

    if (hasError) {
      return; // Prevent form submission if validation fails
    }

    const formData = {
      data: [],
      currencyId: currencyId, // Use the dynamically set currencyId
    };

    Object.keys(prices).forEach((callLength) => {
      if (!callLength.includes('Min')) return; 
      if (selectedOptions[callLength as keyof Prices] && prices[callLength as keyof Prices]) {
        formData.data.push({
          mentorId: mentorId,
          time: callLength.split(' ')[0],
          // rate: parseInt(prices[callLength as keyof Prices]),
          rate: callLength === '10 Min' ? 0 : parseInt(prices[callLength as keyof Prices]),
          discount: 0,
        });
      }
    });

    const response = await putData(formData, `${siteConfig.hodegoUrl}mentor/${mentorId}/session`);
    if (response) {
      getProfileStrength();
      handleSessionStatus(false);
      setNotificationOpen(true);
    }
  };

  const callOptions = [
    { label: '10 Min', value: prices['10 Min'], checked: selectedOptions['10 Min'], disabled: true },
    { label: '15 Min', value: prices['15 Min'], checked: selectedOptions['15 Min'] },
    { label: '30 Min', value: prices['30 Min'], checked: selectedOptions['30 Min'] },
    { label: '45 Min', value: prices['45 Min'], checked: selectedOptions['45 Min'] },
    { label: '60 Min', value: prices['60 Min'], checked: selectedOptions['60 Min'] },
  ];

  function getCurrencySymbol(currencyId: string): React.ReactNode {
    console.log('currencyId',currencyId);
    return new Intl.NumberFormat('en', { style: 'currency', currency: currencyId })
      .formatToParts(1)
      .find((part) => part.type === 'currency')?.value;
  }

  return (
    <Container sx={{ margin: '0%', marginTop: '2%', padding:'0px' }}>
      {isVerifiedStatus === 0 && (
        <Box component="div" sx={{zIndex: 1,top: isMobile?'55vh':'calc(50vh - 100px)', left: '50%',transform: 'translate(-50%,-50%)',textAlign:'center',position:'absolute'}}>
          <LockClockIcon sx={{fontSize:'50px',color:'#677788'}} />
          <Typography variant="h5" sx={{paddingBottom:'2%'}}>
      Hodego Expert Application is Pending Approval.
          </Typography>
          <Typography variant="h6">
       You will receive notification via email once you've been approved.
          </Typography>
        </Box>
      )}
      <Grid container  sx={{ filter: isVerifiedStatus === 0 ? 'blur(22px)' : 'none', pointerEvents: isVerifiedStatus === 0 ? 'none' : 'auto' }}>
        {/* <Alert severity="info" sx={{ width: '100%',marginBottom:'2%' }}>
        Enable at Least One Session Length and Set Your Price to Publish Your Profile
        </Alert> */}
        {callOptions.map((option) => (
          <Grid container spacing={1} alignItems="center" key={option.label} sx={{ marginBottom: '3%' }}>
            <Grid 
              className="sessionOption" item xs={isMobile?1.5:0.5}>
              <Checkbox
                checked={option.checked}
                onChange={() => {
                  handleCheckboxChange(option.label as keyof Prices);
                  setIsDirty(true);
                }}
                sx={{
                  color: validationErrors[option.label as keyof Prices] ? 'red' : 'default', // Apply red color if validation fails
                  '&.Mui-checked': {
                    color: validationErrors[option.label as keyof Prices] ? 'red' : 'primary.main', // Color the checkbox when checked
                  },
                }}
              />
            </Grid>
            <Grid  item xs={isMobile?4.5:2.5} sx={{marginRight:isMobile?'3%':'0',display:'flex',alignItems:'center'}}>
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg, #73A870, #6FAA8E)',
                  color: '#fff',
                  borderRadius: '25px',
                  width: '100%',
                  fontSize: isMobile?'15px':'17px',
                  padding: '13px 16px',
                  pointerEvents: 'none',
                }}
              >
                {isMobile == true ? (option.label === '10 Min' ? '10 Min - Free' : option.label)
                  :
                  (option.label === '10 Min' ? '10 Min - Free Session' : option.label)
                }
              </Button>
              {/* {parseInt(option.value) === 0 && isMobile == true ?
                <Tooltip title="Free Session" placement='top' arrow enterTouchDelay={0}
                  leaveTouchDelay={2000} >
                  <InfoOutlinedIcon fontSize="small" sx={{ marginLeft: '4px', cursor: 'pointer' }} />
                </Tooltip>
                : 
                ''
              } */}
            </Grid>
            <Grid item xs={isMobile?5:5} sx={{ marginBottom: '1%' }}>
              <TextField
                variant="outlined"
                placeholder="Enter price"
                value={option.value}
                disabled={option.label === '10 Min'}
                onChange={(e) => {
                  const intValue = e.target.value.replace(/[^0-9]/g, ''); // Allow only digits
                  handlePriceChange(option.label as keyof Prices, intValue);
                  setIsDirty(true);
                }}
                type="text" // Set to 'text' to allow custom validation
                inputProps={{ min: 0 }}
                error={priceErrors[option.label as keyof Prices]} // Highlight price input if validation fails
                sx={{
                  marginBottom: '10px',
                  height: '35px',
                  '& .MuiInputBase-input': {
                    padding: '17px 12px',
                  },
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{getCurrencySymbol(currencyId)}</InputAdornment>,
                }}
                onKeyDown={(e) => {
                  if (e.key === '+' || e.key === '-' || e.key === '.' || e.key === 'e') {
                    e.preventDefault(); // Prevent unwanted keys including decimal point
                  }
                }}
              />
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12} sx={{ textAlign: 'center', marginTop: '2%' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              color: '#fff',
              width: '10%',
            }}
          >
          Save
          </Button>
        </Grid>
      </Grid>
      
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ marginTop: '5%', textAlign: 'center', padding: '0 5%',fontSize:'18px',filter: isVerifiedStatus === 0 ? 'blur(22px)' : 'none', pointerEvents: isVerifiedStatus === 0 ? 'none' : 'auto' }}
      >
        <strong>Note</strong>: Hodego allows athletic experts to retain <strong>100%</strong> of their listed session prices.
  Experts are responsible for setting their own schedules and rates, and for complying with any income tax obligations in their country of residence.
  A separate platform fee is added at checkout and paid by the sports enthusiast — <strong>there is no cost to the expert</strong>.
      </Typography>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={3000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ margintop: '10%' }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="success" sx={{ width: '100%' }}>
        Changes Saved Successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MentorCallPricing;