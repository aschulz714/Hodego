import React, { useEffect, useState  } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Container,
  Tooltip,
  IconButton,
  MenuItem,
  Select,
  Avatar,
  FormControl,
  InputLabel,
  Slider,
  OutlinedInput,
  Snackbar,
  Alert, Dialog, DialogTitle, DialogContent,TextField 
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import VerifiedIcon from '@mui/icons-material/Verified';
import GroupIcon from '@mui/icons-material/Group';
import './MentorProfiles.css';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Main from 'layouts/Main';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckIcon from '@mui/icons-material/Check';
import hodegoEmptyIcon from '../../assets/images/empty.png';
import hodegoLogo from '../../assets/images/hodegoLogo.png';
// import visibilityIcon from '../../assets/images/view.png';
// import { keyframes } from '@emotion/react';
import { getData, putData } from '../../theme/Axios/apiService';
import siteConfig from '../../theme/site.config';
import '../../../node_modules/flag-icons/css/flag-icons.min.css';
import CardSkeleton from './CardSkeleton';
// import ReactHtmlParser from 'react-html-parser';
// import sanitizeHtml from 'sanitize-html';
import instantBookingImg from '../../assets/images/lightning.png';
import requestBookingImg from '../../assets/images/booking.png'; // Import the CardSkeleton component
import ShareIcon from '@mui/icons-material/Share';
import { SelectChangeEvent } from '@mui/material';
import { debounce } from 'lodash';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';



// import { LazyLoadComponent } from 'react-lazy-load-image-component';


const userId = parseInt(localStorage.getItem('userId')); 
const timezoneMap = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Europe/Nicosia': 'Asia/Nicosia',
  'Pacific/Ponape': 'Pacific/Pohnpei',
};
// const hasFilters = language.length > 0 || selectedCountry.length > 0 || selectedSports.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 3000;
// const isMobileTouch = useMediaQuery('(max-width:600px)');
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const mobileTabContent = isMobile?'?mobileTab=1':'';
// const sessions = [
//   { value: 15, label: '15 min' },
//   { value: 30, label: '30 min' },
//   { value: 45, label: '45 min' },
//   { value: 60, label: '60 min' },
// ];

const dropdownStyle = {
  width: '100%',
  height: '60px',
  borderRadius: '28px',
  padding: '5px 10px',
};

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 200,
    },
  },
};
const MenuItemStyle = {
  padding: '4px 12px', // Adjust padding for a smaller clickable area
  fontSize: '14px', // Slightly smaller font size for compactness
};
// const rotate = keyframes`
//   from {
//     transform: rotate(0deg);
//   }
//   to {
//     transform: rotate(360deg);
//   }
// `;

const Pagination = ({ currentPage, mentorCount, onPageChange }) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < mentorCount) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= mentorCount; i++) {
    if (i === 1 || i === mentorCount || i === currentPage || i === currentPage + 1 || i === currentPage - 1) {
      pageNumbers.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      if (pageNumbers[pageNumbers.length - 1] !== '...') {
        pageNumbers.push('...');
      }
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
      <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
        <ArrowBackIosIcon />
      </IconButton>
      {pageNumbers.map((item, index) => (
        <Box
          key={index}
          sx={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 5px',
            borderRadius: '50%',
            background: currentPage === item ? 'linear-gradient(90deg, #0C6697, #73A870)' : 'transparent',
            color: currentPage === item ? '#fff' : '#000',
            cursor: item === '...' ? 'default' : 'pointer',
          }}
          onClick={() => item !== '...' && onPageChange(item)}
        >
          {item}
        </Box>
      ))}
      <IconButton onClick={handleNextPage} disabled={currentPage === mentorCount}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

const PlayerCard = ({ showFavoritesOnly = false }) => {
  // const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [language, setLanguage] = useState([]);
  // const [selectedTimezones, setSelectedTimezones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSports, setSelectedSports] = useState([]);
  // const [selectedSessions, setSelectedSessions] = useState([]);
  const [mentorList, setMentorList] = useState([]);
  const [mentorCount, setMentorCount] = useState(0);
  const [defaultLanguages, setDefaultLanguages] = useState([]);
  const [defaultSports, setDefaultSports] = useState([]);
  const [defaultCountries, setDefaultCountries] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [copyNotificationOpen, setCopyNotificationOpen] = useState(false);
  // const [defaultTimeZones, setDefaultTimeZones] = useState([]);
  const [favoriteStatus, setFavoriteStatus] = useState('');
  const [seed, setSeed] = useState('');
  const [currentCurrency, setCurrentCurrency] =useState('$');
  const [loading, setLoading] = useState(true); // Add loading state
  const [open, setOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isInteractingWithSlider, setIsInteractingWithSlider] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState('');

  const hasFilters =
  language.length > 0 ||
  selectedCountry.length > 0 ||
  selectedSports.length > 0 ||
  selectedMentor.length > 0 ||
  priceRange[0] !== 0 ||
  priceRange[1] !== 3000;

  const handleResetFilters = () => {
    setLanguage([]);
    setSelectedCountry([]);
    setSelectedSports([]);
    setSelectedMentor('');
    setPriceRange([0, 3000]);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleCopy = () => {
    if (currentPlayer) {
      const shareLink = `${window.location.origin}/expert/${currentPlayer.userName}`;
      navigator.clipboard.writeText(shareLink);
      setCopyNotificationOpen(true);
    }
  };
  const handleShareOpen = (player) => {
    setCurrentPlayer(player); // Set the current player for sharing
    setOpen(true); // Open the dialog
  };


  useEffect(() => {
    setMentorList([]);
    setLoading(true);
    setMentorCount(0);
    if (defaultLanguages.length === 0) {
      fetchData();
    }
    fetchMentorList();
  }, [favoriteStatus, currentPage, language, selectedSports, selectedCountry, priceRange,selectedMentor]);

  const getUpdatedTimezone = (timezone) => {
    return timezoneMap[timezone] || timezone;
  };
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setSelectedMentor('');  // Reset selected mentor when typing
    debouncedSearch(value);
  };
  
  
  const handleMentorSelect = (mentor) => {
    setSearchResults([]);
    if(mentor){
      setSelectedMentor(mentor); // Store selected mentor's name
      setSearchTerm(mentor); // Update search input field
    }
    else{
      setSelectedMentor(''); // Store selected mentor's name
      setSearchTerm(''); // Update search input field
    }
   
    
  };
  
  const fetchData = async () => {
    const response = await getData(`${siteConfig.hodegoUrl}user/identity/all`);
    if (response) {
      if (response.data) {
        if (response.data.language && response.data.language.length > 0) {
          // setDefaultLanguages(response.data.language);
          setDefaultLanguages([...response.data.language.filter(lang => lang.languageName === 'English'),
            ...response.data.language.filter(lang => lang.languageName !== 'English')]);
        }
        if (response.data.country && response.data.country.length > 0) {
          setDefaultCountries(response.data.country);
        }
        if (response.data.sport && response.data.sport.length > 0) {
          setDefaultSports(response.data.sport);
        }
        // if (response.data.timeZone && response.data.timeZone.length > 0) {
        //   console.log(response.data.timeZone,'response.data.timeZone');
        //   setDefaultTimeZones(response.data.timeZone);
        // }
      }
    }
  };
  const fetchMentorSearch = async (query) => {
    if (!query) {
      setSearchResults([]); // Reset results when input is empty
      return;
    }
  
    setIsSearching(true);
    
    try {
      const response = await getData(`${siteConfig.hodegoUrl}mentor/name-search?name=${query}`);
      
      if (response && response.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounce API calls to prevent excessive requests
  const debouncedSearch = debounce(fetchMentorSearch, 300);
  
  const getCurrencySymbol = (rate: number, currency: string) => {
    const currencyCode = currency;
    const locale = 'en-US';
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    });
    const formattedAmount = formatter.format(rate);
    return formattedAmount;
  };

  function getCurrencySymbolOnly(currencyId: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyId,
    }).formatToParts(1).find(part => part.type === 'currency')?.value || '';
  }
  

  // const timeAgo = (dateString: string) => {
  //   // Replace the space with 'T' to create a valid ISO 8601 string
  //   const isoDateString = dateString.replace(' ', 'T');

  //   // Parse the ISO 8601 string into a Date object
  //   const tempDate = new Date(isoDateString);

  //   // Check if the parsed date is invalid
  //   if (isNaN(tempDate.getTime())) {
  //     return 'Invalid date';
  //   }

  //   const now = new Date();
  //   const secondsPast = Math.floor((now.getTime() - tempDate.getTime()) / 1000);
  //   if (secondsPast < 0) {
  //     return 'Active Now';
  //   }
  //   if (secondsPast < 60) {
  //     return 'Active Now';
  //   }
  //   if (secondsPast < 3600) {
  //     const minutes = Math.floor(secondsPast / 60);
  //     return minutes === 1 ? 'Last seen a minute ago' : `Last seen  ${minutes} minutes ago`;
  //   }
  //   if (secondsPast < 86400) {
  //     const hours = Math.floor(secondsPast / 3600);
  //     return hours === 1 ? 'Last seen  an hour ago' : `Last seen  ${hours} hours ago`;
  //   }
  //   if (secondsPast < 2592000) {
  //     const days = Math.floor(secondsPast / 86400);
  //     return days === 1 ? 'Last seen  a day ago' : `Last seen  ${days} days ago`;
  //   }
  //   if (secondsPast < 31536000) {
  //     const months = Math.floor(secondsPast / 2592000);
  //     return months === 1 ? 'Last seen  a month ago' : `Last seen  ${months} months ago`;
  //   }
  //   const years = Math.floor(secondsPast / 31536000);
  //   return years === 1 ? 'Last seen  a year ago' : `Last seen  ${years} years ago`;
  // };
  const decodeHtmlEntities = (str) => {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.documentElement.textContent;
  };
  const fetchMentorList = async () => {

    const timeZone = getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    let filterQuery = `?userTimeZone=${timeZone}&limit=5&offset=${(currentPage - 1) * 5}`;
    if (showFavoritesOnly) {
      filterQuery += '&isUser=1';
    } else {
      if (language.length > 0) {
        filterQuery += '&language=' + language.join(',');
      }
      if (selectedSports.length > 0) {
        filterQuery += '&sport=' + selectedSports.join(',');
      }
      // if (selectedSessions.length > 0) {
      //   filterQuery += '&sessiontime=' + selectedSessions.join(',');
      // }
      // if (selectedTimezones.length > 0) {
      //   filterQuery += '&timeZone=' + selectedTimezones.join(',');
      // }
      if (selectedCountry.length > 0) {
        const getTempCode = [];
        for (let i = 0; i < selectedCountry.length; i++) {
          getTempCode.push(getCountryCode(selectedCountry[i]));
        }
        filterQuery += '&country=' + getTempCode.join(',');
      }
      if (priceRange.length > 0 && priceRange.length === 2) {
        let toPrice = priceRange[1];
        if(priceRange[1] == 3000){
          toPrice = 0;
        }
        filterQuery += `&fromPrice=${priceRange[0]}&toPrice=${toPrice}`;
      }
      // if(seed != '' && currentPage != 1){
      //   filterQuery += `&seed=${seed}`;
      // }
      if(seed != ''){
        filterQuery += `&seed=${seed}`;
      }
      if(selectedMentor != ''){
        filterQuery += `&name=${selectedMentor}`;
      }
    }

    const response = await getData(`${siteConfig.hodegoUrl}mentor/list${filterQuery}`);
    if (response) {
      if (response.data) {
        if (response.data.total) {
          setMentorCount(response.data.total);
        }
        if (response.data.seed) {
          setSeed(response.data.seed);
        }
        if (response.data.mentors && response.data.mentors.length > 0) {
          const tempMentor = [];
          setCurrentCurrency(getCurrencySymbolOnly(response.data.mentors[0].currencyId));
          response.data.mentors.forEach((mentor) => {
            const minRate = mentor.session.reduce((min, item) => Math.min(min, item.rate), Infinity);
            // const stringWithSpaces = mentor.bio?mentor.bio.replace(/<\/p>/g, ' </p>'):'';
            // const stringWithoutHtml = stringWithSpaces?stringWithSpaces.replace(/<\/?[^>]+(>|$)/g, ''):'';
            const stringWithoutHtml = decodeHtmlEntities(
              mentor.bio ? mentor.bio.replace(/<\/p>/g, ' </p>').replace(/<\/?[^>]+(>|$)/g, '') : ''
            );
            tempMentor.push({
              id: mentor.mentorId,
              userId:mentor.userId,
              userName:mentor.userName,
              verifiedStatus: mentor.stripeStatus,
              name: mentor.firstName + ' ' + mentor.lastName,
              country: mentor.country,
              flag: mentor.countryCode,
              lastSeen: mentor.lastSeen,
              isFavorite: mentor.isFavorite,
              mentoredCount: mentor.mentoredCount,
              mentoredSessionCount: mentor.mentoredSessionCount,
              rating: Math.min(5, Math.max(0, parseFloat(mentor.avgRating))).toFixed(1),
              reviews: mentor.totalRating,
              price: getCurrencySymbol(Math.ceil(minRate), mentor.currencyId),
              image: mentor.pic,
              icon: 'https://via.placeholder.com/16',
              students: 18,
              lessons: 720,
              languages: `Speaks ${mentor.languages?.join(',  ')}`,
              // sports: mentor.primarySport?`${mentor.primarySport}, ${mentor.additionalSports.length>0?mentor.additionalSports.join(',  '):''}`:'Not Inlcuded',
              sports: mentor.primarySport ?`${mentor.primarySport}${mentor.additionalSports.length > 0 ? ', ' + mentor.additionalSports.join(', ') : ''}` : 'Not Included',
              timezone: mentor.timeZone == null ? mentor.defaultTimeZone:mentor.timeZone,
              request:mentor.request,
              summary:mentor.summary,
              description: stringWithoutHtml,
            });
          });
          setMentorList(tempMentor);
        }
      }
    }
    setLoading(false); // Set loading to false after data is fetched
  };

  const handleFavoriteClick = async (mentorId: number, status: number) => {
    setLoading(true);
    const formData = {
      mentorId: mentorId,
      isFavorite: status === 0 ? 1 : 0,
    };
    const response = await putData(formData, `${siteConfig.hodegoUrl}user/favorite`);
    if (response) {
      if (response.data && response.data === true) {
        fetchMentorList();
        showNotification(status === 0 ? 1 : 0);
      }
    }
  };

  const showNotification = (status) => {
    if (status === 1) {
      setFavoriteStatus('Added to My Favorites List');
    } else {
      setFavoriteStatus('Removed From My Favorites List');
    }
    setNotificationOpen(true);
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };
  const handleCloseCopyNotification = () => {
    setCopyNotificationOpen(false);
  };
  // const handleExpandClick = (id: number) => {
  //   setExpandedPlayer(expandedPlayer === id ? null : id);
  // };

  const getCountryCode = (countryName: string) => {
    if (defaultCountries.length > 0) {
      return defaultCountries.find((c) => c.countryName === countryName)?.countryCode;
    }
  };

  // const handleLanguageChange = (event) => {
  //   setLanguage(event.target.value);
  //   setCurrentPage(1);
  // };
  const handleLanguageChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setLanguage(value.includes('None') ? [] : value); // Simplify condition
    setCurrentPage(1); // Ensure pagination updates
  };
  
  // const handleCountryChange = (event) => {
  //   setSelectedCountry(event.target.value);
  //   setCurrentPage(1);
  // };
  const handleCountryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedCountry(value.includes('None') ? [] : value);
    setCurrentPage(1); // Reset pagination to first page
  };
  
  const handlePageChange = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
  };

  // const handleTimezoneChange = (event) => {
  //   setSelectedTimezones(event.target.value);
  //   setCurrentPage(1);
  // };

  // const handleSportsChange = (event) => {
  //   setSelectedSports(event.target.value);
  //   setCurrentPage(1);
  // };
  const handleSportsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedSports(value.includes('None') ? [] : value);
    setCurrentPage(1); // Reset pagination to first page
  };
  // const handlePriceChange = (event: Event, newValue: number | number[]) => {
  //   setPriceRange(newValue as [number, number]);
  //   setCurrentPage(1);
  // };
  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue) && newValue.length === 2) {
      setPriceRange(newValue as [number, number]); // ✅ Explicitly cast newValue as a tuple
    }
    setCurrentPage(1);
  };
  

  const toggleDropdown = () => {
    if (!isInteractingWithSlider) {
      setDropdownOpen((prevOpen) => !prevOpen);
    }
  };

  const closeDropdown = () => {
    if (!isInteractingWithSlider) {
      setDropdownOpen(false);
    }
  };

  const handleSliderInteractionStart = () => {
    setIsInteractingWithSlider(true); // Mark interaction as started
  };

  const handleSliderInteractionEnd = () => {
    setTimeout(() => setIsInteractingWithSlider(false), 200); // Delay to prevent immediate closure
  };

  const preventClose = (event: React.MouseEvent | React.TouchEvent) => {
    event.stopPropagation(); // Stop event from propagating to dropdown's close handler
  };
  // const handleSessionChange = (event) => {
  //   setSelectedSessions(event.target.value);
  //   setCurrentPage(1);
  // };

  const renderValue = (selected, type) => {
    if (selected.length === 0) {
      return <em>{type}</em>;
    } else if (selected.length === 1) {
      return `${type}: ${selected[0]}`;
    } else {
      return `${type}: ${selected.length}`;
    }
  };

  return (
    <Main>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={1000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ marginLeft: '6%' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          {favoriteStatus}
        </Alert>
      </Snackbar>
      <Snackbar
        open={copyNotificationOpen}
        autoHideDuration={1000}
        onClose={handleCloseCopyNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ marginLeft: '6%' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
           Link copied to clipboard!
        </Alert>
      </Snackbar>
      {/* Dialog */}
      <Dialog 
        sx={{
          '& .MuiDialog-paper': {
            width: isMobile?'900px': '600px', // Set the desired width
            maxWidth: '90%', // Make it responsive for smaller screens
          },
        }}
        open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          Share Link
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: isMobile?'block':'flex',
              alignItems: 'center',
              paddingTop:'7px',
              gap: 1, // Space between the input and button
              mb: 2, // Margin bottom for spacing
            }}
          >
            <TextField
              label="Shareable Link"
              value={currentPlayer ? `${window.location.origin}/expert/${currentPlayer.userName}` : ''}
              fullWidth
              disabled
              InputLabelProps={{
                shrink: true, // Ensures the label stays visible and shrinks to the top
              }}
              InputProps={{
                sx: {
                  height: '45px', // Match the button height (adjust based on your button)
                  padding: '0', // Remove additional padding for alignment
                },
              }}
            />
            <Button
              startIcon={<ContentCopyIcon />}
              variant="contained"
              onClick={handleCopy}
              sx={{
                marginTop: isMobile ? '4%':'0',
                width:isMobile?'44%':'28%',
                background: 'linear-gradient(90deg, #0C6697, #73A870)',
                color: 'white',
                whiteSpace: 'nowrap', // Prevent button text from wrapping
                '&:hover': {
                  background: 'linear-gradient(90deg, #0C6697, #73A870)',
                },
              }}
            >
        Copy Link
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Typography variant="subtitle1" sx={{ margin: '1%', marginTop: '4%', marginLeft: '3%', textAlign: '-webkit-center', fontSize: '30px', fontWeight: 700 }} gutterBottom>
        {/* <EmojiEventsIcon
          sx={{
            fontSize: '30px',
            color: '#DD9D51',
            marginBottom: '-6px',
            marginRight: '10px',
            animation: `${rotate} 2s linear infinite`,
          }}
        /> */}
        <span style={{ color: '#DD9D51' }}>Connect with Top Sports Experts </span>to Elevate Your Game
        {hasFilters && (
          <span  style={{
            textDecoration: 'underline',
            color: '#73A870',
            cursor: 'pointer',
            fontWeight:'800',
            fontSize:'20px',
            marginLeft:'0.5%'
          }}
          onClick={handleResetFilters}> Reset Filters</span>
        )}
        {/* {hasFilters && (
          <Typography
            variant="body1"
            sx={{
              textDecoration: 'underline',
              color: '#0C6697',
              cursor: 'pointer',
              '&:hover': { color: '#073c5f' },
            }}
            onClick={handleResetFilters}
          >
      Reset Filters
          </Typography>
        )} */}
        
      </Typography>
     
      {!showFavoritesOnly && (
        <>
          <Box display="flex" justifyContent="center" sx={{ marginTop: '1.5%', marginLeft: '1%', marginBottom: '0.3%' }}>
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" sx={{ width: { xs: '94%', md: '56%' } }}>
              <FormControl sx={{ flex: '1 1 32%', m: 1, minWidth: 120 }}>
                <InputLabel id="language-select-label">Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  label="Language"
                  value={language}
                  multiple
                  onChange={handleLanguageChange}
                  input={<OutlinedInput label="Language" />}
                  renderValue={(selected) => renderValue(selected, 'Language')}
                  MenuProps={MenuProps}
                  sx={dropdownStyle}
                >
                  {/* Show "None" only if at least one option is selected */}
                  {language.length > 0 && (
                    <MenuItem value="None"
                      sx={MenuItemStyle}
                      disableRipple // Disable ripple for faster clicks
                    
                    >
                      <em>None</em>
                    </MenuItem>
                  )}

                  {defaultLanguages.map((lang) => (
                    <MenuItem key={lang.id} value={lang.languageName}
                      sx={MenuItemStyle}
                      disableRipple // Disable ripple for faster clicks
                    >
                      {lang.languageName}
                      {language.includes(lang.languageName) && <CheckIcon sx={{ ml: 'auto' }} />}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>


              <FormControl sx={{ flex: '1 1 32%', m: 1, minWidth: 120 }}>
                <InputLabel id="price-session-label">Price per session</InputLabel>
                <Select
                  labelId="price-session-label"
                  id="price-session-select"
                  label="Price per session"
                  open={dropdownOpen} // Controlled open state
                  onClose={closeDropdown} // Close when clicking outside
                  onOpen={toggleDropdown} // Toggle when clicking on dropdown
                  value={priceRange.join(' - ')}
                  renderValue={() => `${currentCurrency}${priceRange[0]} – ${currentCurrency}${priceRange[1]}+`}
                  sx={{ ...dropdownStyle, backgroundColor: 'white'}}
                  MenuProps={{
                    disableAutoFocusItem: true, // Prevent focusing on the first item automatically
                    PaperProps: {
                      onMouseDown: (event) => event.stopPropagation(), 
                      onMouseEnter: preventClose,
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                        width: 200,
                      },
                    },
                  }}
                >
                  {!(priceRange[0] === 0 && priceRange[1] === 3000) && (
                    <MenuItem
                      value="None"
                      sx={MenuItemStyle}
                      disableRipple 
                      onClick={() => {
                        setPriceRange([0, 3000]); 
                        setCurrentPage(1);
                      }}
                    >
                      <em>None</em>
                    </MenuItem>
                  )}

                  <MenuItem value={priceRange.join(' - ')}>
                    <Box sx={{ padding: 2 }}  onMouseDown={(event) => event.stopPropagation()} onMouseEnter={preventClose}
                      onTouchStart={handleSliderInteractionStart} // Detect touch interaction start
                      onTouchEnd={handleSliderInteractionEnd} // Detect touch interaction end
                      onMouseUp={handleSliderInteractionEnd} // Detect mouse interaction end
                      
                    >
                      <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
                        {currentCurrency}{priceRange[0]} – {currentCurrency}{priceRange[1]}
                      </Typography>
                      <Slider
                        value={priceRange}
                        onChange={handlePriceChange}
                        onMouseDown={handleSliderInteractionStart} 
                        onMouseUp={handleSliderInteractionEnd} 
                        onTouchStart={handleSliderInteractionStart} 
                        onTouchEnd={handleSliderInteractionEnd} 
                        valueLabelDisplay="auto"
                        min={0}
                        max={3000}
                        sx={{
                          color: '#0C6697',
                          '& .MuiSlider-thumb': {
                            boxShadow: 'none', 
                            '&:hover': {
                              boxShadow: 'none', 
                            },
                          },
                          '& .MuiSlider-track': {
                            transition: 'none',
                          },
                          '& .MuiSlider-rail': {
                            transition: 'none',
                          },
                        }}
                      />
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: '1 1 32%', m: 1, minWidth: 120 }}>
                <InputLabel id="country-select-label">Country</InputLabel>
                <Select
                  labelId="country-select-label"
                  id="country-select"
                  label="Country"
                  value={selectedCountry}
                  multiple
                  onChange={handleCountryChange}
                  input={<OutlinedInput label="Country" />}
                  renderValue={(selected) => renderValue(selected, 'Country')}
                  sx={dropdownStyle}
                  MenuProps={MenuProps}
                >
                  {/* Show "None" only if at least one option is selected */}
                  {selectedCountry.length > 0 && (
                    <MenuItem value="None"
                      sx={MenuItemStyle}
                      disableRipple // Disable ripple for faster clicks
                    >
                      <em>None</em>
                    </MenuItem>
                  )}

                  {defaultCountries.map((country) => (
                    <MenuItem 
                      key={country.countryCode} value={country.countryName}
                      sx={MenuItemStyle}
                      disableRipple // Disable ripple for faster clicks
                    >
                      {country.countryName}
                      {selectedCountry.includes(country.countryName) && <CheckIcon sx={{ ml: 'auto' }} />}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: '1 1 32%', m: 1, minWidth: 120 }}>
                <InputLabel id="sports-select-label">Sports</InputLabel>
                <Select
                  labelId="sports-select-label"
                  id="sports-select"
                  label="Sports"
                  value={selectedSports}
                  multiple
                  onChange={handleSportsChange}
                  input={<OutlinedInput label="Sports" />}
                  renderValue={(selected) => renderValue(selected, 'Sports')}
                  sx={dropdownStyle}
                  MenuProps={MenuProps}
                >
                  {/* Show "None" only if at least one option is selected */}
                  {selectedSports.length > 0 && (
                    <MenuItem value="None"   sx={MenuItemStyle}
                      disableRipple // Disable ripple for faster clicks
                    >
                      <em>None</em>
                    </MenuItem>
                  )}

                  {defaultSports.map((sport) => (
                    <MenuItem key={sport.id} value={sport.sportName}
                      sx={MenuItemStyle}
                      disableRipple // Disable ripple for faster clicks
                    
                    >
                      {sport.sportName}
                      {selectedSports.includes(sport.sportName) && <CheckIcon sx={{ ml: 'auto' }} />}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box display="flex" justifyContent="center" sx={{ marginTop: 2, flex: '1 1 32%', m: 1, minWidth: 120, position: 'relative' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Search Experts"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{
                    width: '100%',
                    height: '60px',
                    borderRadius: '28px',
                    '& .MuiOutlinedInput-root': { borderRadius: '28px' },
                  }}
                  InputProps={{
                    endAdornment: (
                      <>
                        {/* Show Close Icon when a Mentor is selected */}
                        {searchTerm && (
                          <IconButton
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedMentor('');
                              setSearchResults([]); // Clear results
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <CloseIcon />
                          </IconButton>
                        )}
                      </>
                    ),
                  }}
                />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && searchTerm && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                      background: '#fff',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    {searchResults.map((mentor, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => handleMentorSelect(mentor.name)}
                      >
                        {mentor.name}
                      </MenuItem>
                    ))}
                  </Box>
                )}

                {/* Loading Indicator */}
                {isSearching && (
                  <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)' }} />
                )}
              </Box>


            </Box>
          </Box>
          {/* <Box display="flex" justifyContent="center" sx={{ marginLeft: '1%', marginBottom: '0.1%', width: '100%' }}> */}
          {/* <Box display="flex" flexWrap="wrap" justifyContent="space-between" sx={{ width: { xs: '94%', md: '56%' } }}> */}
    
             

    
          {/* <FormControl sx={{ flex: '1 1 20%', m: 1, minWidth: 120 }}>
                <InputLabel id="timezone-select-label">Timezone</InputLabel>
                <Select
                  labelId="timezone-select-label"  
                  id="timezone-select"              
                  label="Timezone"
                  name="Timezone"
                  value={selectedTimezones}
                  onChange={handleTimezoneChange}
                  multiple
                  input={<OutlinedInput label="Timezone" />}
                  renderValue={(selected) => renderValue(selected, 'Timezone')}
                  sx={dropdownStyle}
                  MenuProps={MenuProps}
                >
                  {defaultTimeZones.map((timezone) => (
                    <MenuItem key={timezone.id} value={timezone.timeZoneName}>
                      {timezone.timeZoneName}
                      {selectedTimezones.includes(timezone.timeZoneName) && <CheckIcon sx={{ ml: 'auto' }} />}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}

          {/* <FormControl sx={{ flex: '1 1 20%', m: 1, minWidth: 120 }}>
                <InputLabel id="session-select-label">Session</InputLabel>
                <Select
                  labelId="session-select-label"   
                  id="session-select"             
                  label="Session"
                  name="Session"
                  value={selectedSessions}
                  onChange={handleSessionChange}
                  multiple
                  input={<OutlinedInput label="Session" />}
                  renderValue={(selected) => renderValue(selected, 'Session')}
                  sx={dropdownStyle}
                  MenuProps={MenuProps}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session.value} value={session.value}>
                      {session.label}
                      {selectedSessions.includes(session.value) && <CheckIcon sx={{ ml: 'auto' }} />}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}
          {/* </Box> */}
          {/* </Box> */}

        </>
      )}
      {loading ? ( // Conditionally render the skeleton loader
        <Container sx={{ padding: 3, marginTop: '0%', marginBottom: '3%', paddingLeft: '6.2% !important', width: '100%' }}>
          {[...Array(5)].map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </Container>
      ) : mentorList.length > 0 ? (
        <Container sx={{ padding: 3, marginTop: '0%', marginBottom: '3%', paddingLeft: '6.2% !important', width: '100%' }}>
          <Typography variant="h6" sx={{ marginBottom: '1%' }}>
            {mentorCount} Experts Available
          </Typography>
          {mentorList.map((player) => (
            <Card
              key={player.id}
              sx={{
                display: { xs: 'block', md: 'flex' },
                flexDirection: 'column',
                height: 'auto',
                maxWidth: '1000px',
                marginBottom: 5,
                padding: '10px',
                position: 'relative',
                border: '1px solid #ccc',
                '&:hover': {
                  border: '2px solid #5599be',
                },
                width: '100%',
              }}
            >
              <Box sx={{ display: { xs: 'block', md: 'flex' }, flexDirection: 'row', height: 'auto' }}>
            
                <Box
                  sx={{
                    width: { xs: '100%', md: '265px' },
                    height: { xs: '100%', md: '265px' },
                    borderRadius: '1px',
                    background: 'linear-gradient(90deg, #0C6697, #73A870)',
                    padding: '4px',
                    // height: 'auto',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '5px',
                      objectFit: player.image?'cover':'contain',
                    }}
                    image={player.image?player.image:hodegoLogo}
                    alt="Player Image"
                  />
                  {/* {player.lastSeen && (
                    <Tooltip title={timeAgo(player.lastSeen)} arrow 
                      disableInteractive={isMobile} // Only disable interactivity on mobile
                      enterTouchDelay={0} // Ensures immediate display on touch
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          width: '30px',
                          height: '30px',
                          backgroundColor: 'black',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <img src={visibilityIcon} style={{ width: '28px', height: '28px' }} alt={`Last seen ${timeAgo(player.lastSeen)}`}/>
                      </Box>
                    </Tooltip>
                  )} */}
                  <Tooltip
                    title={player.request === 0 ? 'Instant Booking' : 'By Request'}
                    arrow
                    disableInteractive={isMobile} // Only disable interactivity on mobile
                    enterTouchDelay={0} // Ensures immediate display on touch
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      aria-label={player.request === 0 ? 'Instant booking available' : 'Request to book'}
                      role="img" // Explicitly set role for accessibility
                    >
                      <img
                        src={player.request === 0 ? instantBookingImg : requestBookingImg}
                        style={{ width: '26px', height: '26px' }}
                        alt={player.request === 0 ? 'Instant booking available' : 'Request to book'}
                      />
                    </Box>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto', position: 'relative' }}>
                    <Box sx={{ display: { xs: 'block', md: 'flex' }, lineHeight: { xs: '45px', md: '0px' } }} alignItems="center" justifyContent="space-between">
                      <Box display="flex"  className="boxTopAdjust" sx={{ marginTop: '-3%',marginBottom:isMobile?'2%':'0' }} alignItems="center">
                        <Typography component="div" variant="h5">
                          {player.name}
                        </Typography>
                        {player.verifiedStatus === 'verified' ? (
                          <Tooltip title="Verified Hodego" arrow
                            disableInteractive={isMobile} // Only disable interactivity on mobile
                            enterTouchDelay={0} // Ensures immediate display on touch
                          
                          >
                            <VerifiedIcon color="primary" sx={{ ml: 1,mr: 1 }} />
                          </Tooltip>
                        ) : (
                          ''
                        )}

                        <Tooltip title={`${player.country}`} arrow
                          disableInteractive={isMobile} // Only disable interactivity on mobile
                          enterTouchDelay={0} // Ensures immediate display on touch
                        
                        >
                          <Box role="img" aria-label={`Flag of ${player.country}`}>
                            <span className={`fi fi-${player.flag?.toLowerCase()}`} />
                          </Box>
                        </Tooltip>
                      </Box>
                      <Box className="boxBottomAdjust" sx={{ width: { xs: '100%', md: '42%' }, padding:isMobile?'2% 0':'0', marginBottom:isMobile?'-4%':'0%' }} display="flex" justifyContent="space-between" alignItems="center">
                        <Box alignItems="center" sx={{ marginTop:'-6%' }}>
                          <Typography variant="h6" color="text.primary" display="flex" alignItems="center">
                            
                            {player.rating == '0.0'? 
                            
                              <Chip icon={<StarIcon sx={{ color: 'gold !important', mr: 0.5, verticalAlign: 'sub' }}/>} label="New Expert" variant="outlined" />
                            
                              :
                            
                              <Box>
                                <StarIcon sx={{ color: 'gold', mr: 0.5, verticalAlign: 'sub' }} />{`${player.rating}`}
                              </Box>
                            
                            }
                          </Typography>
                          {/* <Typography variant="subtitle1" sx={{ marginLeft: '5px' }} color="text.secondary">
                            {player.reviews == '0'? 'No Review':`${player.reviews} Reviews`}
                          </Typography> */}
                        </Box>
                        <Box sx={{ marginLeft: '1%',marginTop:'-6%' }}>
                          <Typography variant="h6" color="text.primary">
                            {player.price}
                          </Typography>
                          {/* <Typography variant="subtitle1" color="text.secondary" ml={'2px'}>
                            30-min sessions
                          </Typography> */}
                        </Box>
                        <Box sx={{ marginTop: '-6%' }}>
                          <Tooltip
                            title={
                              !localStorage.getItem('hodego_access_token')
                                ? 'Log in to Save to Favorites'
                                : userId === player.userId
                                  ? 'You can\'t favorite yourself'
                                  : player.isFavorite === 1
                                    ? 'Remove from my favorites list'
                                    : 'Save to my favorites list'
                            }
                            arrow
                            disableInteractive
                            enterTouchDelay={0} // Ensures immediate tooltip display on mobile touch
                            leaveTouchDelay={2000} // Keeps tooltip visible for a short period after touch
                          >
                            <span style={{ display: 'inline-block' }}> {/* Wrapper for disabled state */}
                              <IconButton
                                onClick={() => {
                                  if (localStorage.getItem('hodego_access_token')) {
                                    handleFavoriteClick(player.id, player.isFavorite);
                                  }
                                }}
                                aria-label={player.isFavorite === 1 ? 'Remove from favorites' : 'Save to favorites'}
                                disabled={!localStorage.getItem('hodego_access_token') || userId === player.userId} // Disable when token is missing
                                sx={{ pointerEvents: localStorage.getItem('hodego_access_token') ? 'auto' : 'none' }} // Ensure click doesn't interfere
                              >
                                {player.isFavorite === 1 ? (
                                  <FavoriteTwoToneIcon sx={{ color: '#dd9d51' }} />
                                ) : (
                                  <FavoriteBorderIcon />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>

                      </Box>
                    </Box>
                    <Typography className="playerStats" variant="body2" color="text.secondary" sx={{ fontSize: '16px', lineHeight: isMobile?'2':'1.5' }}>
                      <Box display="flex" alignItems="center" mt={1}>
                        <GroupIcon sx={{ mr: 1 }} />
                        {player.mentoredSessionCount} sessions completed
                        {!isMobile && (
                          <Box display="inline-flex" alignItems="center" sx={{ ml: 2 }}>
                            <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'top' }} />
                            <Typography component="span" sx={{ textDecoration: 'underline' }}>
                              {player.timezone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {isMobile && (
                        <Box display="block" alignItems="center" mt={1}>
                          <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          <span style={{textDecoration:'underline'}}>{player.timezone}</span>
                        </Box>
                      )}
                      <Box display={isMobile?'block':'inline-block'} alignItems="center" mt={1}>
                        <LanguageIcon sx={{ mr: 1, verticalAlign:isMobile?'middle':'top' }} />
                        {player.languages}
                      </Box>
                      {/* <Box display={isMobile?'block':'inline-block'} sx={{marginLeft:isMobile?'0':'2%'}} alignItems="center" mt={1}>
                        <AccessTimeIcon sx={{ mr: 1, verticalAlign:isMobile?'middle':'top' }} />
                        <Typography component="span" sx={{ textDecoration: 'underline' }}>
                          {player.timezone}
                        </Typography>
                      </Box> */}
                      <Box display={isMobile?'block':'inline-block'} sx={{marginLeft:isMobile?'0':'2%'}} alignItems="center" mt={1}>
                        <EmojiEventsIcon sx={{ mr: 1, verticalAlign:isMobile?'middle':'top' }} />
                        {player.sports}
                      </Box>
                      {/* {isMobile ? '' :
                        <Typography
                          variant="body2"
                          className="mentorBio"
                          color="text.primary"
                          mt={'3%'}
                          style={{ color: 'black', fontSize: '16px', marginLeft: '0.5%' }}
                        >
                          {player.summary && player.summary.length <= 185 ? (
                          // If the description is less than or equal to 185 characters, show the full description
                            player.summary
                          ) : (
                          // Otherwise, show truncated or full description based on the expanded state
                            <>
                              {expandedPlayer === player.id
                                ? player.summary
                                : player.summary.substring(0, 185) + '...'}
                              <Button
                                variant="text"
                                color="primary"
                                onClick={() => handleExpandClick(player.id)}
                              >
                                {expandedPlayer === player.id ? 'Show less' : 'Show more'}
                              </Button>
                            </>
                          )}
                        </Typography>
                      } */}
                      {isMobile ? '' : (
                        <Typography
                          variant="body2"
                          className="mentorBio"
                          color="text.primary"
                          mt={'3%'}
                          style={{ color: 'black', fontSize: '16px', marginLeft: '0.5%',overflowWrap:'anywhere' }}
                        >
                          {player.description && typeof player.description === 'string' && player.description.length > 185 ? (
                            <>
                              {player.description.substring(0, 185) + '...'}
                              <Button
                                variant="text"
                                color="primary"
                                href={`/expert/${player.userName}${mobileTabContent}`} // Redirect to the link
                                style={{ textTransform: 'none' }}
                              >
                             Show more
                              </Button>
                            </>
                          ) : (
                          // If description is less than or equal to 185 characters, display it as is
                            player.description
                          )}
                        </Typography>
                      )}

                    </Typography>
                  </CardContent>
                  <Box  className="cardAction" sx={{ display: 'flex', justifyContent: 'space-between', p: isMobile?0:2, marginTop: '-2.5%', gap: 1,alignItems: 'center' }}>
                    <Button
                      href={`/expert/${player.userName}`}
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(90deg, #0C6697, #73A870)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #0C6697, #73A870)',
                        },
                      }}
                    >
                      View Profile
                    </Button>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Button sx={{ fontSize: isMobile?'12px':'auto' }} variant="text" color="primary" href={`/expert/${player.userName}${mobileTabContent}`}>
                       See Pricing & Availability
                      </Button>
                      <Tooltip title="Share Profile" arrow
                        disableInteractive={isMobile} // Only disable interactivity on mobile
                        enterTouchDelay={0} // Ensures immediate display on touch
                      >
                        <IconButton onClick={() => handleShareOpen(player)} color="primary">
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          ))}
          {mentorCount > 0 ? <Pagination currentPage={currentPage} mentorCount={Math.ceil(mentorCount / 5)} onPageChange={handlePageChange} /> : ''}
        </Container>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="350px" width="100%" textAlign="center">
          <Avatar
            variant="square"
            src={hodegoEmptyIcon}
            alt="Profile Image"
            className="profileImage"
            style={{
              width: '75px',
              height: '75px',
              objectFit: 'contain',
              marginBottom: '1rem', // Adjust as needed for spacing
            }}
          />
          <Box>No Experts</Box>
        </Box>
      )}
    </Main>
  );
};

export default PlayerCard;