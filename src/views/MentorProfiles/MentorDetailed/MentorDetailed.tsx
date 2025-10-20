import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Avatar,
  Link,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails, Snackbar,
  Alert,DialogTitle,TextField
} from '@mui/material';
// import { Insights, Event } from '@mui/icons-material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  QueryBuilder as QueryBuilderIcon,
  // Visibility as VisibilityIcon,
  // CalendarToday as CalendarTodayIcon,
  Verified as VerifiedIcon,
  Language as LanguageIcon,
  Star as StarIcon,
  // Flag as FlagIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import Main from 'layouts/Main';
import './MentorDetailed.css';
import BookingCard from './BookingCard';
import TwitterLogo from '../../../assets/images/twitter.png';
import InstagramLogo from '../../../assets/images/instagram.png';
import LinkedInLogo from '../../../assets/images/linkedin.png';
import YouTubeLogo from '../../../assets/images/youtube.png';
import WebsiteLogo from '../../../assets/images/website.png';
import noReviews from '../../../assets/images/noReviews.png';
import { getData } from '../../../theme/Axios/apiService';
import { putData } from '../../../theme/Axios/apiService';
import siteConfig from '../../../theme/site.config';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import ReactHtmlParser from 'react-html-parser';
import sanitizeHtml from 'sanitize-html';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import '../../../../node_modules/flag-icons/css/flag-icons.min.css';
import instantBookingImg from '../../../assets/images/lightning.png';
import requestBookingImg from '../../../assets/images/booking.png';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Chip from '@mui/material/Chip';
import { Helmet } from 'react-helmet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const timezoneMap = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Europe/Nicosia': 'Asia/Nicosia',
  'Pacific/Ponape': 'Pacific/Pohnpei',
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box p={2.5}>{children}</Box>}
    </Box>
  );
}

interface Review {
  author: string;
  date: string;
  rating: number;
  content: string;
}
interface MentorDetailedProps {
  type: string;
  userName: string;
}

const MentorDetailPage: React.FC<MentorDetailedProps> = ({type,userName}) => {
  console.log('type',type);

  const location = useLocation();
  const navigate = useNavigate();
  const queries = queryString.parse(location.search);
  const selectedUserName = userName?userName:window.location.pathname.replace('/expert/','');
  // const mentorId = queries.id ? Number(queries.id) : 0;
  const [tabValue, setTabValue] = useState(queries.mobileTab ? Number(queries.mobileTab) : 0);
  const [tabMobileValue, setTabMobileValue] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mentorName, setMentorName] = useState('');
  const [mentorId,setMentorId] = useState(0);
  const [mentorUserId,setMentorUserId] = useState(0);
  const [accountStatus, setAccountStatus] = useState('');
  const [mentorPicture, setMentorPicture] = useState('');
  const [verifiedStatus, setVerifiedStatus] = useState('');
  const [language, setLanguage] = useState([]);
  const [socialLinks, setSocialLinks] = useState<any>('');
  // const [careerHighlights, setCareerHighlights] = useState('');
  // const [specialities, setSpecialities] = useState('');
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [showAllSpecialities, setShowAllSpecialities] = useState(false);
  const [sports,setSports] = useState('');

  const [country, setCountry] = useState('');
  const [flag, setFlag] = useState('');
  const [faq, setFaq] = useState([]);
  // const [tabSessionValue, setTabSessionValue] = useState(queries.mobileTab ? Number(queries.mobileTab) : 0);
  const [authors, setAuthors] = useState([]);
  const [dates, setDates] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingValue, setRatingValue] = useState('');
  const [reviewsCount, setReviewsCount] = useState('');
  const [contents, setContents] = useState([]);
  // const [mentorTitle, setMentorTitle] = useState('');
  // const [specification, setSpecification] = useState('');
  const [atheletesMentored, setAtheletesMentored] = useState('');
  const [mentoredSessionCount, setMentoredSessionCount] = useState('');
  const [mentoredResponseTime, setMentoredResponseTime] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  // const [lastSeen, setLastSeen] = useState('');
  const [sameDayBooking, setSameDayBooking] = useState(0);
  const [copyNotificationOpen, setCopyNotificationOpen] = useState(false);
  const [mentorBio, setMentorBio] = useState('');
  const [recurrenceEnds, setRecurrenceEnds] = useState('');
  const [mentorSessions, setMentorSessions] = useState([]);
  const [currencyId, setCurrencyId] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [isFavorite, setIsFavorite] = useState<number>(0); // Default to 0 (not favorite)
  const [isLive, setIsLive] = useState<number>(0);
  const [expandedBio, setExpandedBio] = useState(false);
  console.log('reviewsCount',reviewsCount);
  const [open, setOpen] = useState(false);
  const userId = parseInt(localStorage.getItem('userId'));
  const isDisabled =
  !localStorage.getItem('hodego_access_token') || userId === mentorUserId || type === 'preview';
  const handleCopy = () => {
    const shareLink = `${window.location.origin}/expert/${selectedUserName}`;
    navigator.clipboard.writeText(shareLink);
    setCopyNotificationOpen(true);
  };
  const handleShareOpen = () => {
    console.log('test');
    setOpen(true); // Open the dialog
  };
  const handleCloseCopyNotification = () => {
    setCopyNotificationOpen(false);
  };
  const handleToggleBio = () => {
    setExpandedBio(!expandedBio);
  };
  useEffect(() => {
    // console.log('Type is preview:', type === 'preview');
    // console.log('Mentor UserId matches:', mentorUserId === Number(localStorage.getItem('userId')));
   
    if (selectedUserName) {
      fetchData();
      fetchFaqData();
    }
    if(mentorId != 0){
      fetchReviewData();
    }
  }, [selectedUserName,mentorId]);

  const fetchData = async () => {
    const timeZone = getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    let previewState= '';
    if(type == 'preview'){
      previewState = '&preview=true';
    }
    const response = await getData(`${siteConfig.hodegoUrl}mentor/${selectedUserName}?userTimeZone=${timeZone}${previewState}`);

    // const formatRelativeTime = (dateString: string) => {
    //   const isoDateString = dateString.replace(' ', 'T');
    //   const tempDate = new Date(isoDateString);
   
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
    //     return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
    //   }
    //   if (secondsPast < 86400) {
    //     const hours = Math.floor(secondsPast / 3600);
    //     return hours === 1 ? '1 hr ago' : `${hours} hrs ago`;
    //   }
    //   if (secondsPast < 2592000) {
    //     const days = Math.floor(secondsPast / 86400);
    //     return days === 1 ? '1 day ago' : `${days} days ago`;
    //   }
    //   if (secondsPast < 31536000) {
    //     const months = Math.floor(secondsPast / 2592000);
    //     return months === 1 ? '1 month ago' : `${months} months ago`;
    //   }
    //   const years = Math.floor(secondsPast / 31536000);
    //   return years === 1 ? '1 year ago' : `${years} years ago`;
    // };

    // const formatDate = (isoDate: string): string => {
    //   const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    //   return new Date(isoDate).toLocaleDateString(undefined, options);
    // };

   
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    if (response) {
      if (response.data) {
        setMentorName(response.data.firstName + ' ' + response.data.lastName);
        setMentorPicture(response.data.pic);
        setRecurrenceEnds(response.data.recurrenceEnds);
        setMentorId(response.data.mentorId);
        setMentorUserId(response.data.userId);
        setSports(response.data.primarySport);
        // setMentorTitle(response.data.title);
        setSameDayBooking(response.data.zeroDayBook);
        setIsFavorite(response.data.isFavorite);
        setIsLive(response.data.isLive);
        setAccountStatus(response.data.accountStatus);
        // setSpecification(response.data.specification);
        setVerifiedStatus(response.data.stripeStatus);
        setAtheletesMentored(response.data.mentoredCount);
        setMentoredSessionCount(response.data.mentoredSessionCount);
        setMentoredResponseTime(response.data.responseTime?response.data.responseTime<1?'2':response.data.responseTime:'2');
        setJoinedDate(formatDate(response.data.joinedDate));
        // setLastSeen(formatRelativeTime(response.data.lastSeen));
        if(response.data.bio){
          // const sanitizedBioContent = sanitizeHtml((response.data.bio).replaceAll('<p><br></p>',''));
          const sanitizedBioContent = sanitizeHtml(response.data.bio);
          setMentorBio(sanitizedBioContent);
        }
        if (response.data.specialities) {
          setSpecialities(response.data.specialities);
        }
       
       
        // setMentorBio(response.data.bio);
        // const sanitizedContent = sanitizeHtml(response.data.specialities);
        // setSpecialities(sanitizedContent);
        // const sanitizedCareerContent = sanitizeHtml(response.data.careerHighlights);
        // setCareerHighlights(sanitizedCareerContent);
        const tempLinks = response.data.socialLinks;
        if(response.data.socialLinks){
          console.log('tempLinks.instagram',tempLinks.instagram);
          if(tempLinks.instagram){
            tempLinks.instagram = isValidURL(tempLinks.instagram) ? tempLinks.instagram :`https://www.instagram.com/${tempLinks.instagram}`;
          }
          if(tempLinks.twitter){
            tempLinks.twitter = isValidURL(tempLinks.twitter) ? tempLinks.twitter: `https://x.com/${tempLinks.twitter}`;
          }
        }
       
        setSocialLinks(tempLinks);
        setCountry(response.data.country);
        setFlag(response.data.countryCode);
        setBookingStatus(response.data.request);
        if(response.data.languages && response.data.languages.length > 0){
          setLanguage(response.data.languages.join(', '));
        }
        if(response.data.mentorSession) {
          setMentorSessions(response.data.mentorSession);
        }
        setCurrencyId(response.data.currencyId);
      }
    }
  };
  const formatResponseTime = (time) => {
    if (!time || time === 0) {
      return '15 mins'; // Default time if null or 0
    }
    const mins = Math.abs(parseInt(time));
    if (mins < 60) {
      return `${mins} mins`; // Display in minutes
    } else if (mins < 1440) {
      const hours = Math.floor(mins / 60);
      return `${hours} hrs`; // Convert to hours if 60-1439 mins
    } else {
      const days = Math.floor(mins / 1440);
      return `${days} days`; // Convert to days if 1440 mins or more
    }
  };
  const isValidURL = (string) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)' + // protocol (http or https required)
      '(([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,})' + // domain name
      '(\\:[0-9]{1,5})?' + // port (optional)
      '(\\/.*)?$', // path (optional)
      'i'
    );
    return pattern.test(string);
  };
 
  const handleBack = () =>{
    navigate('/explore');
  };
  const fetchFaqData = async () => {
    const response = await getData(`${siteConfig.hodegoUrl}faqs`);
    if (response) {
      setFaq(response.data);
    }
  };
  const getUpdatedTimezone = (timezone) => {
    return timezoneMap[timezone] || timezone;
  };
  const fetchReviewData = async () => {
    const response = await getData(`${siteConfig.hodegoUrl}rating?mentorId=${mentorId}`);
    if (response) {
      const formattedRating = parseFloat(response.data.avgRating).toFixed(1);
      // const displayRating = formattedRating === '5.0' ? '5' : formattedRating === '0.0' ? '0' : formattedRating;
      setRatingValue(formattedRating);
      setReviewsCount(response.data.totalRating);
      const reviewsData = response.data.data;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
      const authorsName = reviewsData.map(review => {
        const { userFirstName, userLastName } = review;
     
        if (emailRegex.test(userFirstName)) {
          return userFirstName.split('@')[0];
        }
     
        if (emailRegex.test(userLastName)) {
          return userLastName.split('@')[0];
        }
        return userFirstName == null && userLastName == null ? 'Anonymous User' : `${userFirstName}`;
      });
     
      setAuthors(authorsName);
      setDates(reviewsData.map(review => new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })));
      setRatings(reviewsData.map(review => review.rating));
      setContents(reviewsData.map(review => review.review));
    }
  };

  const onBookSession = () =>{
    console.log('Mentor');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  // const handleTabSessionChange = (event: React.SyntheticEvent, newValue: number) => {
  //   setTabSessionValue(newValue);
  // };
  const handleMobileTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabMobileValue(newValue);
  };
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 2 >= authors.length ? 0 : prevIndex + 2));
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 2 < 0 ? authors.length - 2 : prevIndex - 2));
  };

  const handleClose = () => {
    setSelectedReview(null);
  };

  const extractFirstName = (email: string) => {
    const atIndex = email.indexOf('@');
    return atIndex !== -1 ? email.substring(0, atIndex) : email;
  };
  const handleFavoriteClick = async (mentorId: number, currentStatus: number) => {
    if (!userId || userId === mentorUserId) return;
    const newStatus = currentStatus === 0 ? 1 : 0; // Toggle between 0 and 1
    const formData = {
      mentorId,
      isFavorite: newStatus,
    };
 
    const response = await putData(formData, `${siteConfig.hodegoUrl}user/favorite`);
    if (response && response.data) {
      setIsFavorite(newStatus); // Update the state locally
    }
  };
 
  const renderReviewContent = (content: string, index: number) => {
    const firstLineEndIndex = content.indexOf('.') + 1;
    const firstLine = content.substring(0, firstLineEndIndex);
    const remainingContent = content.substring(firstLineEndIndex);
    const authorName = authors[index];
 
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Box>
          <Typography variant="h6" style={{ whiteSpace: 'pre-wrap', fontSize: '20px', color: 'black' }}>
            {firstLine}
          </Typography>
          {remainingContent.length > 0 && (
            <Typography variant="h6" style={{ whiteSpace: 'pre-wrap', fontSize: '20px', color: 'black' }}>
              {remainingContent.length > 100
                ? `${remainingContent.substring(0, 100)}...`
                : remainingContent}
              {remainingContent.length > 100 && (
                <Button
                  onClick={() => setSelectedReview({
                    author: authorName,
                    date: dates[index],
                    rating: ratings[index],
                    content,
                  })}
                >
                more
                </Button>
              )}
            </Typography>
          )}
        </Box></>
    );
  };

  const isMobile = window.innerWidth <= 820; // Define mobile view threshold
  const content = (
    <Box>
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
              value={`${window.location.origin}/expert/${selectedUserName}`}
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
      {isMobile ? (
        <Box>
          {type != 'preview'?
            <Box sx={{textAlign:'left',margin:'0 4%'}}>
              <Link
                onClick={handleBack}
                sx={{textDecoration:'none',cursor:'pointer'}}
              >
                <ArrowBackIcon sx={{verticalAlign:'middle'}}/> Back
              </Link>
            </Box>
            :
            ''
          }
          <Box
            display="flex"
            flexDirection="column"
            height="100vh"
            overflow="hidden"
          >
            <Box
              position="sticky"
              top="0"
              zIndex="1000"
              bgcolor="white"
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="mentor details tabs"
                style={{ borderBottom: '1px solid #e0e0e0'}}
                // variant="fullWidth"
              >
                <Tab value={0} label="Expert Insights" className="mentorDetailedTab" style={{ fontSize: type == 'preview'?'17px':'18px',width: '50%' }} />
                <Tab value={1} label="Book a Session" className="mentorDetailedTab" style={{ fontSize: type == 'preview'?'17px':'18px',width: '50%' }} />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <Box className="profileContainer" style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
                <Avatar
                  variant="square"
                  src={mentorPicture}
                  alt="Profile Image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
                <CardContent
                  className="profileDetails"
                  style={{
                    padding: '16px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                  }}
                >
                  <Typography variant="h4" style={{ fontSize: '24px', marginBottom: '5%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      {/* Left side: Mentor name and verified badge */}
                      <Box display="flex" sx={{width:isMobile?'75%':'auto'}} alignItems="center">
                        <Typography variant="h6" sx={{fontSize:'21px',fontWeight:'900'}}>{mentorName}</Typography>
                        {verifiedStatus === 'verified' && (
                          <Tooltip
                            title="Verified Hodego"
                            arrow
                            disableHoverListener
                            enterTouchDelay={0} // Show tooltip immediately on touch
                            leaveTouchDelay={2000}
                          >
                            <VerifiedIcon style={{ color: '#73A870', marginLeft: '8px' }} />
                          </Tooltip>
                        )}
                      </Box>

                      {/* Right side: Heart Icon */}
                       

                      <Tooltip
                        title={
                          type === 'preview'
                            ? 'Users can favorite your profile once it\'s published'
                            : !localStorage.getItem('hodego_access_token')
                              ? 'Log in to Save to Favorites'
                              : userId === mentorUserId
                                ? 'You can\'t favorite yourself'
                                : isFavorite === 1
                                  ? 'Remove from my favorites list'
                                  : 'Save to my favorites list'
                        }
                        arrow
                        disableHoverListener={false} // Enable hover
                        enterTouchDelay={0}
                        leaveTouchDelay={2000}
                      >
                        {/* Wrapping in span to ensure cursor works properly on disabled button */}
                        <span
                          style={{
                            display: 'inline-block',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <IconButton
                            onClick={() => {
                              if (!isDisabled) {
                                handleFavoriteClick(mentorId, isFavorite);
                              }
                            }}
                            aria-label={isFavorite === 1 ? 'Remove from favorites' : 'Save to favorites'}
                            disabled={isDisabled} // Fully disables the button
                          >
                            {isFavorite === 1 ? (
                              <FavoriteTwoToneIcon sx={{ color: '#dd9d51' }} />
                            ) : (
                              <FavoriteBorderIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>









                      {/* <Tooltip
                        title={localStorage.getItem('hodego_access_token')
                          ? isFavorite === 1
                            ? 'Remove from my favorites list'
                            : 'Save to my favorites list'
                          : 'Log in to Save to Favorites'}
                        arrow
                        disableHoverListener={false} // Enable hover
                        enterTouchDelay={0} // Show tooltip immediately on touch
                        leaveTouchDelay={2000}
                      >
                        <IconButton
                          onClick={() => {
                            if (localStorage.getItem('hodego_access_token')) {
                              handleFavoriteClick(mentorId, isFavorite);
                            }
                          }}
                          aria-label={isFavorite === 1 ? 'Remove from favorites' : 'Save to favorites'}
                          disabled={!localStorage.getItem('hodego_access_token')}
                        >
                          {isFavorite === 1 ? (
                            <FavoriteTwoToneIcon sx={{ color: '#dd9d51' }} />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                      </Tooltip> */}


                      {isLive == 1 ?
                        <Tooltip title="Share Profile" arrow
                          disableInteractive={isMobile} // Only disable interactivity on mobile
                          enterTouchDelay={0} // Ensures immediate display on touch
                        >
                          <IconButton onClick={handleShareOpen} color="primary">
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                        :''
                      }
                     
                    </Box>
                  </Typography>
                  <Box display="flex" alignItems="center" sx={{marginTop:'1%',marginBottom:'5%'}}>
                    <EmojiEventsIcon style={{ marginRight: '8px', fontSize: '30px' }} />
                    <Typography variant="body2" style={{ fontSize: '18px' }}>
                   Sports: {sports}
                    </Typography>
                  </Box>
                  {/* <Typography variant="body2" style={{ fontSize: '17px', color: '#73A870', marginBottom: '8px' }}>
                    {reviewsCount == '0'? 'No Review' : `${reviewsCount} Reviews`}
                  </Typography>
                  <Box sx={{WebkitJustifyContent:'left'}}>
                 
                  </Box> */}
                  {/* <Typography variant="subtitle1" style={{ fontSize: '18px', marginBottom: '8px' }}>
                    {mentorTitle}
                  </Typography> */}
                  {/* {specification && (
                    <Typography variant="body1" style={{ fontSize: '18px', marginBottom: '8px' }}>
                  Specification: {specification}
                    </Typography>
                  )} */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <span className={`fi fi-${flag.toLowerCase()}`} style={{ marginRight: '3px',marginLeft:'3px', fontSize: '19px'  }}></span>
                    <Typography variant="body2" style={{ fontSize: '18px',paddingLeft: '8px' }}>
                      {country}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" sx={{marginTop:'1%'}}>
                    <LanguageIcon style={{ marginRight: '8px', fontSize: '30px' }} />
                    <Typography variant="body2" style={{ fontSize: '18px' }}>
                   Speaks: {language}
                    </Typography>
                  </Box>
                  {ratingValue && (
                    <Box display="flex" alignItems="center" sx={{marginBottom:'2%'}}>
                      {/* <StarIcon style={{ marginRight: '8px', color: 'gold', fontSize: '30px' }} /> */}
                      <Typography variant="body2" style={{ fontSize: '18px' }}>
                        {
                          ratingValue == '0.0' ?
                            <Box sx={{marginTop:'12%'}}>
                              <Chip sx={{marginLeft:'1%'}} icon={<StarIcon sx={{ color: 'gold !important', mr: 0.5, verticalAlign: 'sub' }}/>} label="New Expert" variant="outlined" />
                            </Box>
                            :ratingValue == '1' ?
                         
                              <Box display="flex" alignItems="center" mt={2}>
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    sx={{
                                      color: i < Math.round(Number(ratingValue)) ? 'gold' : '#e0e0e0',
                                      // fontSize: '12px',
                                      marginRight: '2px',
                                    }}
                                  />
                                ))}
                                <Typography variant="body2" style={{ fontSize: '18px', marginLeft: '1px' }}>
                                  {ratingValue}<span style={{color:'#b4b0b0',marginLeft: '1px'}}>({authors.length})</span>
                                </Typography>
                              </Box>
                              :
                         
                              <Box display="flex" alignItems="center" mt={2}>
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    sx={{
                                      color: i < Math.round(Number(ratingValue)) ? 'gold' : '#e0e0e0',
                                      // fontSize: '12px',
                                      marginRight: '2px',
                                    }}
                                  />
                                ))}
                                <Typography variant="body2" style={{ fontSize: '18px', marginLeft: '1px' }}>
                                  {ratingValue}<span style={{color:'#b4b0b0',marginLeft: '1px'}}>({authors.length})</span>
                                </Typography>
                              </Box>
                             
                        }
                      </Typography>
                    </Box>
                  )}
                  <Box display="flex" alignItems="center" mt={2} sx={{justifyContent:'space-between',marginLeft:'1%'}}>
                    <Box display="flex" alignItems="center">
                      {socialLinks?.twitter && (
                        <a href={socialLinks?.twitter} target="_blank" rel="noopener noreferrer">
                          <img src={TwitterLogo} alt="Twitter" style={{ marginRight: '8px', fontSize: '30px', width: '28px', height: '28px' }} />
                        </a>
                      )}
                      {socialLinks?.instagram && (
                        <a href={socialLinks?.instagram} target="_blank" rel="noopener noreferrer">
                          <img src={InstagramLogo} alt="Instagram" style={{ marginRight: '8px', fontSize: '26px', width: '26px', height: '26px' }} />
                        </a>
                      )}
                      {socialLinks?.linkedIn && (
                        <a href={socialLinks?.linkedIn} target="_blank" rel="noopener noreferrer">
                          <img src={LinkedInLogo} alt="LinkedIn" style={{ marginRight: '8px', fontSize: '30px', width: '26px', height: '26px' }} />
                        </a>
                      )}
                      {socialLinks?.web && (
                        <a href={socialLinks?.web} target="_blank" rel="noopener noreferrer">
                          <img src={WebsiteLogo} alt="Website" style={{ marginRight: '8px', fontSize: '30px', width: '28px', height: '28px' }} />
                        </a>
                      )}
                      {socialLinks?.youtube && (
                        <a href={socialLinks?.youtube} target="_blank" rel="noopener noreferrer">
                          <img src={YouTubeLogo} alt="YouTube" style={{ fontSize: '30px', width: '28px', height: '30px' }} />
                        </a>
                      )}
                    </Box>
                    <Box
                      // className="mentorBookingStatus"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor:bookingStatus == '0' || bookingStatus == '1'  ? '#131728': '', // Black with light opacity
                        padding: '7px',
                        borderRadius: '10px',
                      }}
                    >
                      {bookingStatus == '0'  ? (
                        <Tooltip
                          title="Instant Booking"
                          arrow
                          disableHoverListener
                          enterTouchDelay={0} // Show tooltip immediately on touch
                          leaveTouchDelay={2000}
                        >
                          <img src={instantBookingImg} style={{ cursor: 'pointer', width: '20px', height: '20px'}} />
                        </Tooltip>
                      ) : (
                        bookingStatus == '1' ? (
                          <Tooltip
                            title="Booking by Request"
                            arrow
                            disableHoverListener
                            enterTouchDelay={0} // Show tooltip immediately on touch
                            leaveTouchDelay={2000}
                          >
                            <img src={requestBookingImg} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                          </Tooltip>
                        ) : (
                          ''
                        )
                      )}
                    </Box>
                  </Box>
               
                </CardContent>
 
                <Box className="statsCard" style={{ margin: '4% 0',padding: '5% 0', width: '100%' }}>
                  <Grid container justifyContent="center">
                    <Grid item xs={6} style={{ textAlign: 'center', padding: '8px' }}>
                      <Typography variant="body2" style={{ fontSize: '18px',marginBottom:'4%' }}>Athletes</Typography>
                      <Tooltip title="Number of athletes mentored" placement="top" arrow>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <PeopleIcon className="stat-icon" style={{ color: 'white', fontSize: '30px', marginBottom: '4px' }} />
                          <Typography variant="body2" style={{ fontSize: '18px' }}>{atheletesMentored}</Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'center', padding: '8px' }}>
                      <Typography variant="body2" style={{ fontSize: '18px',marginBottom:'4%' }}>Sessions</Typography>
                      <Tooltip title="Number of sessions conducted" placement="top" arrow>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <EventIcon className="stat-icon" style={{ color: 'white', fontSize: '30px', marginBottom: '4px' }} />
                          <Typography variant="body2" style={{ fontSize: '18px' }}>{mentoredSessionCount}</Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'center', padding: '8px' }}>
                      <Typography variant="body2" style={{ fontSize: '18px',marginBottom:'4%' }}>Responds</Typography>
                      <Tooltip title="Average response time" placement="top" arrow>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <QueryBuilderIcon className="stat-icon" style={{ color: 'white', fontSize: '30px', marginBottom: '4px' }} />
                          <Typography variant="body2" style={{ fontSize: '18px' }}>{Math.abs(parseInt(mentoredResponseTime)) == 0?'15 mins':Math.abs(parseInt(mentoredResponseTime)).toFixed(0) + ' mins'}</Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'center', padding: '8px' }}>
                      <Typography variant="body2" style={{ fontSize: '18px',marginBottom:'4%' }}>Joined</Typography>
                      <Tooltip title="Joined" placement="top" arrow>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <CalendarMonthIcon className="stat-icon" style={{ color: 'white', fontSize: '30px', marginBottom: '4px' }} />
                          <Typography variant="body2" style={{ fontSize: '18px' }}>{joinedDate}</Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    {/* <Grid item xs={12} style={{ textAlign: 'center', padding: '8px' }}>
                      <Tooltip title="Date joined" placement="top" arrow>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <CalendarTodayIcon className="stat-icon" style={{ color: 'white', fontSize: '30px', marginBottom: '4px' }} />
                          <Typography variant="body2" style={{ fontSize: '18px' }}>{joinedDate}</Typography>
                          <Typography variant="body2" style={{ fontSize: '18px' }}>Joined date</Typography>
                        </Box>
                      </Tooltip>
                    </Grid> */}
                  </Grid>
                </Box>
                {specialities.length > 0 && (
                  <Card
                    className="tagsCard"
                    style={{
                      marginTop: '16px',
                      padding: '20px',
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      borderRadius: '16px',
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{ fontWeight: 'bold', marginBottom: '12px', color: '#73A870' }}
                    >
                    Areas of Expertise
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        overflow: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',   // two equal columns
                        gap: 1,
                      }}
                    >
                      {(showAllSpecialities ? specialities : specialities.slice(0, 10)).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          sx={{
                            fontSize: '13px',
                            fontWeight: 'bold',
                            padding: '2px 8px',
                            borderRadius: '7px',
                            background:
          index % 3 === 0
            ? '#cbe3fb'
            : index % 3 === 1
              ? '#d4ead4'
              : '#e9c9ea',
                            border: `1.9px solid ${
                              index % 3 === 0
                                ? '#64b5f6'
                                : index % 3 === 1
                                  ? '#81c784'
                                  : '#ba68c8'
                            }`,
                            color: '#000',
                          }}
                        />
                      ))}

                      {specialities.length > 10 && (
                        <Typography
                          variant="body2"
                          onClick={() => setShowAllSpecialities(!showAllSpecialities)}
                          sx={{
                            gridColumn: 'span 2',     // make the “Show More” span both columns
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: '#0C6697',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {showAllSpecialities
                            ? 'Show Less'
                            : `Show More (+${specialities.length - 10})`}
                        </Typography>
                      )}
                    </Box>


                  </Card>
                )}
                <Card className="tabsCard" style={{ margin: '16px 0', backgroundColor: 'white', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '100%' }}>
                  <Tabs value={tabMobileValue} onChange={handleMobileTabChange} aria-label="mentor details tabs" style={{ borderBottom: '1px solid #e0e0e0', fontSize: '20px' }} variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile>
                    <Tab label="Bio" style={{ fontSize: '20px' }} />
                    {/* <Tab label="Specialities" style={{ fontSize: '20px' }} />
                    <Tab label="Career Highlights" style={{ fontSize: '20px' }} /> */}
                  </Tabs>
                  {/* <TabPanel value={tabMobileValue} index={0}>
                    <Typography variant="body1" style={{ color: '#333',fontSize: '20px' }} className="mentorBioContent">
                      {mentorBio != null || mentorBio != '' ? ReactHtmlParser(mentorBio) : 'No Bio Added'}
                    </Typography>
                  </TabPanel> */}
                  <TabPanel value={tabMobileValue} index={0}>
                    <Typography
                      variant="body1"
                      style={{ color: '#333', fontSize: '20px', display: 'inline' }} // Keeps content inline
                      className="mentorBioContent"
                    >
                      {mentorBio && mentorBio.trim() !== '' ? (
                        <>
                          {ReactHtmlParser(
                            expandedBio || mentorBio.length <= 1000
                              ? mentorBio
                              : mentorBio.substring(0, 1000).trim()
                          )}
                          {mentorBio.length > 1000 && (
                            <span style={{ whiteSpace: 'nowrap' }}>
            ...<Button
                                onClick={handleToggleBio}
                                style={{
                                  textTransform: 'none',
                                  color: '#0C6697',
                                  fontSize: '18px',
                                  padding: 0,
                                  minWidth: 'auto',
                                  display: 'inline',
                                  verticalAlign: 'baseline',
                                }}
                              >
                                {expandedBio ? 'Read Less' : 'Read More'}
                              </Button>
                            </span>
                          )}
                        </>
                      ) : (
                        'No Bio Added'
                      )}
                    </Typography>
                  </TabPanel>


                  {/* <TabPanel value={tabMobileValue} index={1}>
                    <Typography variant="body1" style={{ marginBottom: '16px', color: '#333' }}>
                      {specialities != '' ? ReactHtmlParser(specialities) : ReactHtmlParser('<p>No Specialities Added</p>')}
                    </Typography>
                  </TabPanel> */}
                  {/* <TabPanel value={tabMobileValue} index={2}>
                    <Typography variant="body1" style={{ marginBottom: '16px', color: '#333' }}>
                      {careerHighlights != '' ? ReactHtmlParser(careerHighlights) : ReactHtmlParser('<p>No Career Highlights Added</p>')}
                    </Typography>
                  </TabPanel> */}
                </Card>

                <Card className="reviewsCard" style={{ margin: '16px 0', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" style={{ fontWeight: 'bold', color: 'black', marginBottom: '16px' }}>
                      {authors.length} Review(s)
                    </Typography>
                    {authors.length > 0 ? (
                      authors.map((author, index) => (
                        <Box key={index} style={{ marginBottom: '16px' }}>
                          <Typography variant="h6" style={{ fontSize: '20px',textTransform: 'capitalize', fontWeight: 'bold', color: '#0C6697', marginBottom: '8px' }}>
                            {author}
                          </Typography>
                          <Typography variant="body2" style={{ fontSize: '19px', color: 'black', marginBottom: '8px' }}>
                            {dates[index]}
                          </Typography>
                          <Box className="stars" style={{ fontSize: '19px', color: 'gold', display: 'flex', marginBottom: '8px' }}>
                            {Array.from({ length: ratings[index] }).map((_, i) => (
                              <StarIcon key={i} />
                            ))}
                            {Array.from({ length: 5 - ratings[index] }).map((_, i) => (
                              <StarIcon key={i} style={{ color: '#e0e0e0' }} />
                            ))}
                          </Box>
                          <Typography variant="body2" style={{ fontSize: '19px', color: 'black' }}>
                            {contents[index]}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="350px" width="100%" textAlign="center">
                        <Avatar
                          variant="square"
                          src={noReviews}
                          alt="No Reviews Image"
                          className="no-reviews-image"
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'contain',
                            marginBottom: '1rem',
                          }}
                        />
                        <Typography variant="body2" style={{ fontSize: '28px' }}>No Reviews</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
 
                <Card className="faqCard" style={{ margin: '16px 0', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" style={{ fontWeight: 'bold', color: 'black', marginBottom: '3%' }}>
                    Expert FAQs
                    </Typography>
                    {faq.map((faq, index) => (
                      <Accordion
                        key={index}
                        sx={{
                          '&.MuiPaper-root': {
                            boxShadow: 'none',
                          },
                          '& .MuiPaper-root-MuiAccordion-root': {
                            border: 'none',
                            borderTopLeftRadius: '0',
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`panel${index}-content`}
                          id={`panel${index}-header`}
                        >
                          <Typography variant="subtitle1" sx={{ fontSize: '16px' }}>
                            {faq.question}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" sx={{ fontSize: '16px' }}>
                            {faq.answer}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Box style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
                <BookingCard rescheduledBy={''} accountStatus={accountStatus} rescheduleMessage={''} menteeStatus={false} recurrenceEnds={recurrenceEnds} rescheduleRequest={0} preview={type == 'preview'?true:false} type={'mentorDetails'} bookingStatus={bookingStatus} bookingId={0} onBookSession={onBookSession} mentorName={mentorName} mentorUserId={mentorUserId} mentorId={mentorId} mentorSessions={mentorSessions} currencyId={currencyId} sameDayBooking={sameDayBooking}/>
              </Box>
            </TabPanel>
          </Box>
        </Box>
      ) : (
        <Box>
          {type != 'preview'?
            <Box sx={{textAlign:'left',margin:'0 4%'}}>
              <Link
                onClick={handleBack}
                sx={{textDecoration:'none',cursor:'pointer'}}
              >
                <ArrowBackIcon sx={{verticalAlign:'middle'}}/> Back
              </Link>
            </Box>
            :
            ''
          }
         
          <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box className="profileContainer">
              <Card
                className="profileCard"
                sx={{ boxShadow: 'none', display: 'flex', alignItems: 'center' }}
              >
                <Avatar
                  variant="square"
                  src={mentorPicture}
                  alt="Profile Image"
                  className="profileImage"
                  style={{
                    width: '340px',
                    height: '340px',
                    objectFit: 'contain',
                    marginRight: '0.5%',
                  }}
                />
                <CardContent
                  className="profileDetails"
                  style={{
                    width: '340px',
                    height: '340px',
                    flex: 1,
                    borderTopRightRadius: '20px',
                    borderBottomRightRadius: '20px',
                    padding: '24px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderTop: '2px solid #e0e0e0',
                    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    lineHeight: '1.6',
                  }}
                >
                  <Typography
                    variant="h4"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '24px',
                      lineHeight: '1.6',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {mentorName}
                      {verifiedStatus === 'verified' ? (
                        <Tooltip title="Verified Hodego" arrow>
                          <VerifiedIcon style={{ color: '#73A870', marginLeft: '8px' }} />
                        </Tooltip>
                      ) : (
                        ''
                      )}
                    </span>
                  </Typography>
                  {/* <Typography
                    variant="body2"
                    style={{
                      position: 'absolute',
                      top: '10%',
                      right: '16%', // Adjust this value to leave space for the favorite icon
                      cursor: 'pointer',
                      fontSize: '17px',
                      color: '#73A870',
                    }}
                  >
                    {reviewsCount == '0'? 'No Review' : `${reviewsCount} Reviews`}
                  </Typography> */}
                  <Box
                    className="detailedViewIcons"
                    component={'div'}
                    style={{
                      position: 'absolute',
                      right: '7%', // Aligns near the review text
                      cursor: 'pointer',
                    }}
                  >

                    <Tooltip
                      title={
                        type === 'preview'
                          ? 'Users can favorite your profile once it\'s published'
                          : !localStorage.getItem('hodego_access_token')
                            ? 'Log in to Save to Favorites'
                            : userId === mentorUserId
                              ? 'You can\'t favorite yourself'
                              : isFavorite === 1
                                ? 'Remove from my favorites list'
                                : 'Save to my favorites list'
                      }
                      arrow
                      disableHoverListener={false} // Enable hover
                      enterTouchDelay={0}
                      leaveTouchDelay={2000}
                    >
                      {/* Wrapping in span to ensure cursor works properly on disabled button */}
                      <span
                        style={{
                          display: 'inline-block',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            if (!isDisabled) {
                              handleFavoriteClick(mentorId, isFavorite);
                            }
                          }}
                          aria-label={isFavorite === 1 ? 'Remove from favorites' : 'Save to favorites'}
                          disabled={isDisabled} // Fully disables the button
                        >
                          {isFavorite === 1 ? (
                            <FavoriteTwoToneIcon sx={{ color: '#dd9d51' }} />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>

                    {/* <Tooltip
                      title={localStorage.getItem('hodego_access_token')
                        ? isFavorite === 1
                          ? 'Remove from my favorites list'
                          : 'Save to my favorites list'
                        : 'Log in to Save to Favorites'}
                      arrow
                      disableHoverListener={false} // Enable hover
                      enterTouchDelay={0} // Show tooltip immediately on touch
                      leaveTouchDelay={2000}
                    >
                      <IconButton
                        onClick={() => {
                          if (localStorage.getItem('hodego_access_token')) {
                            handleFavoriteClick(mentorId, isFavorite);
                          }
                        }}
                        aria-label={isFavorite === 1 ? 'Remove from favorites' : 'Save to favorites'}
                        disabled={!localStorage.getItem('hodego_access_token')}
                      >
                        {isFavorite === 1 ? (
                          <FavoriteTwoToneIcon sx={{ color: '#dd9d51' }} />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Tooltip> */}
                    {isLive == 1 ?
                      <Tooltip title="Share Profile" arrow
                        disableInteractive={isMobile} // Only disable interactivity on mobile
                        enterTouchDelay={0} // Ensures immediate display on touch
                      >
                        <IconButton onClick={handleShareOpen} color="primary">
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                      :''}
                  </Box>
                  {/* <Box
                    display="flex"
                    alignItems="center"
                    mb={'1%'}
                    sx={{ fontSize: '22px', lineHeight: '1.6' }}
                  >
                    <Typography variant="subtitle1">{mentorTitle}</Typography>
                  </Box> */}
                  {/* {specification && (
                    <Box
                      display="flex"
                      alignItems="center"
                      mb={2}
                      sx={{ fontSize: '22px', lineHeight: '1.6' }}
                    >
                      <Typography variant="body1">Specification: {specification}</Typography>
                    </Box>
                  )} */}
                  <Box display="flex" alignItems="center" mt={2}>
                    <EmojiEventsIcon style={{ marginRight: '8px', fontSize: '30px' }} />
                    <Typography variant="body2" style={{ fontSize: '18px' }}>
                      Sports: {sports}
                    </Typography>
                  </Box>
                  <Box
                    style={{
                      borderBottom: '1px solid #ccc',
                    // width: '714px',
                    // marginLeft: '-3%',
                    }}
                  ></Box>
                  <Box component={'div'} sx={{ marginLeft: '-0.4%' }}>
                    <Box display="flex" alignItems="center" mb={'-1%'} mt={'2%'}>
                      {/* <FlagIcon style={{ marginRight: '8px', fontSize: '30px' }} /> */}
                      <Typography
                        variant="body2"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '18px',
                        }}
                      >
                        <Tooltip title={`${country}`} arrow>
                          <span
                            style={{ paddingLeft: '35px' }}
                            className={`fi fi-${flag.toLowerCase()}`}
                          ></span>
                        </Tooltip>
                        <Box>
                          <Typography variant="body2" style={{ fontSize: '18px',paddingLeft: '8px' }}>
                            {country}
                          </Typography>
                        </Box>
                       
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mt={2}>
                      <LanguageIcon style={{ marginRight: '8px', fontSize: '30px' }} />
                      <Typography variant="body2" style={{ fontSize: '18px' }}>
                      Speaks: {language}
                      </Typography>
                    </Box>
                    {ratingValue && (
                      <Box display="flex" alignItems="center" sx={{marginTop:'0.3%'}}>
                        {/* <StarIcon
                          style={{ marginRight: '1%', color: 'gold', fontSize: '30px' }}
                        /> */}
                        <Typography variant="body2" style={{ fontSize: '18px' }}>
                          {
                            ratingValue == '0.0' ?
                              <Box sx={{marginTop:'12%'}}>
                                <Chip sx={{marginLeft:'1%'}} icon={<StarIcon sx={{ color: 'gold !important', mr: 0.5, verticalAlign: 'sub' }}/>} label="New Expert" variant="outlined" />
                              </Box>
                              :ratingValue == '1' ?
                         
                                <Box display="flex" alignItems="center" mt={2}>
                                  {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                      key={i}
                                      sx={{
                                        color: i < Math.round(Number(ratingValue)) ? 'gold' : '#e0e0e0',
                                        marginRight: '2px',
                                      }}
                                    />
                                  ))}
                                  <Typography variant="body2" style={{ fontSize: '18px', marginLeft: '1px' }}>
                                    {ratingValue}<span style={{color:'#b4b0b0',marginLeft: '1px'}}>({authors.length})</span>
                                  </Typography>
                                </Box>
                                :
                         
                                <Box display="flex" alignItems="center" mt={2}>
                                  {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                      key={i}
                                      sx={{
                                        color: i < Math.round(Number(ratingValue)) ? 'gold' : '#e0e0e0',
                                        marginRight: '2px',
                                      }}
                                    />
                                  ))}
                                  <Typography variant="body2" style={{ fontSize: '18px', marginLeft: '1px' }}>
                                    {ratingValue} <span style={{color:'#b4b0b0',marginLeft: '1px'}}>({authors.length})</span>
                                  </Typography>
                                </Box>
                             
                          }
                        </Typography>
                      </Box>
                    )}
                    <Box className="mentorBookingInfo" display="flex" alignItems="center" mt={2} sx={{ marginLeft: '0.4%' }}>
                      <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
                        {socialLinks?.twitter && (
                          <a href={socialLinks?.twitter} target="_blank" rel="noopener noreferrer">
                            <img
                              src={TwitterLogo}
                              alt="Twitter"
                              style={{
                                marginRight: '8px',
                                fontSize: '30px',
                                width: '28px',
                                height: '28px',
                              }}
                            />
                          </a>
                        )}
                        {socialLinks?.instagram && (
                          <a href={socialLinks?.instagram} target="_blank" rel="noopener noreferrer">
                            <img
                              src={InstagramLogo}
                              alt="Instagram"
                              style={{
                                marginRight: '8px',
                                fontSize: '26px',
                                width: '26px',
                                height: '26px',
                              }}
                            />
                          </a>
                        )}
                        {socialLinks?.linkedIn && (
                          <a href={socialLinks?.linkedIn} target="_blank" rel="noopener noreferrer">
                            <img
                              src={LinkedInLogo}
                              alt="LinkedIn"
                              style={{
                                marginRight: '8px',
                                fontSize: '30px',
                                width: '26px',
                                height: '26px',
                              }}
                            />
                          </a>
                        )}
                        {socialLinks?.web && (
                          <a href={socialLinks?.web} target="_blank" rel="noopener noreferrer">
                            <img
                              src={WebsiteLogo}
                              alt="Website"
                              style={{
                                marginRight: '8px',
                                fontSize: '30px',
                                width: '28px',
                                height: '28px',
                              }}
                            />
                          </a>
                        )}
                        {socialLinks?.youtube && (
                          <a href={socialLinks?.youtube} target="_blank" rel="noopener noreferrer">
                            <img
                              src={YouTubeLogo}
                              alt="YouTube"
                              style={{ fontSize: '30px', width: '28px', height: '30px' }}
                            />
                          </a>
                        )}
                      </Box>
                      <Box
                        className="mentorBookingStatus"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor:bookingStatus == '0' || bookingStatus == '1'  ? '#131728': '', // Black with light opacity
                          padding: '10px',
                          borderRadius: '10px',
                          pointerEvents:'none',
                        }}
                      >
                        {bookingStatus == '0'  ? (
                          <>
                            <img src={instantBookingImg} style={{ cursor: 'pointer', width: '25px', height: '25px', marginRight: '8px', filter: 'brightness(1.2)' }} />
                            <Typography sx={{ color: '#77f39b', fontWeight: 'bold' }}>Instant Booking</Typography>
                          </>
                        ) : (
                          bookingStatus == '1' ? (
                            <>
                              <img src={requestBookingImg} style={{ cursor: 'pointer', width: '25px', height: '25px', marginRight: '8px', filter: 'brightness(1.2)' }} />
                              <Typography sx={{ color: 'gold', fontWeight: 'bold' }}>Booking by Request</Typography>
                            </>
                          ) : (
                            ''
                          )
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
           
              <Card
                className="statsCard"
                style={{
                  background: 'linear-gradient(90deg, #dd9d51, #0C6697)',
                  color: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                <CardContent style={{ padding: '1.4% 0' }}>
                  <Grid container spacing={6} sx={{ marginTop: '0' }} justifyContent="center" className='mentorStats'>
                    <Grid item xs={12} md={2.2} style={{ textAlign: 'center', padding: '8px' }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="body2" style={{ color: 'white' }}>
                        Athlete Connections
                        </Typography>
                        <Tooltip title="Number of athletes mentored" placement="top" arrow>
                          <Box
                            display="flex"
                            alignItems="center"
                            style={{ fontSize: '1.7rem', marginBottom: '4px', height: '36px' }}
                          >
                            <PeopleIcon
                              className="stat-icon"
                              style={{ color: 'white', fontSize: '1.7rem', marginRight: '4px' }}
                            />
                            <Box className='statsCount' style={{ fontSize: '1.7rem' }}>{atheletesMentored}</Box>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2.2} style={{ textAlign: 'center', padding: '8px' }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="body2" style={{ color: 'white' }}>
                        Sessions Completed
                        </Typography>
                        <Tooltip title="Number of sessions conducted" placement="top" arrow>
                          <Box
                            display="flex"
                            alignItems="center"
                            style={{ fontSize: '1.7rem', marginBottom: '4px', height: '36px' }}
                          >
                            <EventIcon
                              className="stat-icon"
                              style={{ color: 'white', fontSize: '1.7rem', marginRight: '4px' }}
                            />
                            <Box className='statsCount' style={{ fontSize: '1.7rem' }}>{mentoredSessionCount}</Box>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2.5} style={{ textAlign: 'center', padding: '8px' }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="body2" style={{ color: 'white' }}>
                        Usually Responds In
                        </Typography>
                        <Tooltip title="Average response time" placement="top" arrow>
                          <Box
                            display="flex"
                            alignItems="center"
                            style={{ fontSize: '1.7rem', marginBottom: '4px', height: '36px' }}
                          >
                            <QueryBuilderIcon
                              className="stat-icon"
                              style={{ color: 'white', fontSize: '1.7rem', marginRight: '4px' }}
                            />
                            <Box className='statsCount' style={{ fontSize: '1.5rem' }}>{formatResponseTime(mentoredResponseTime)}</Box>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2.6} style={{ textAlign: 'center', padding: '8px' }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="body2" style={{ color: 'white' }}>
                        Joined
                        </Typography>
                        <Tooltip title="Joined" placement="top" arrow>
                          <Box
                            display="flex"
                            alignItems="center"
                            style={{ fontSize: '1.7rem', marginBottom: '4px', height: '36px' }}
                          >
                            <CalendarMonthIcon
                              className="stat-icon"
                              style={{ color: 'white', fontSize: '1.7rem', marginRight: '4px' }}
                            />
                            <Box className='statsCount' style={{ fontSize: '1.5rem' }}>{joinedDate}</Box>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Grid>
                    {/* <Grid item xs={12} md={2.5} style={{ textAlign: 'center', padding: '8px' }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Tooltip title="Date joined" placement="top" arrow>
                          <Box
                            display="flex"
                            alignItems="center"
                            style={{ fontSize: '1.7rem', marginBottom: '4px', height: '36px' }}
                          >
                            <CalendarTodayIcon
                              className="stat-icon"
                              style={{ color: 'white', fontSize: '1.7rem', marginRight: '4px' }}
                            />
                            <Box style={{ fontSize: '1.5rem' }}>{joinedDate}</Box>
                          </Box>
                        </Tooltip>
                        <Typography variant="body2" style={{ color: 'white' }}>
                        Joined date
                        </Typography>
                      </Box>
                    </Grid> */}
                  </Grid>
                </CardContent>
              </Card>
              {specialities.length > 0 && (
                <Card
                  className="tagsCard"
                  style={{
                    marginTop: '16px',
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{ fontWeight: 'bold', marginBottom: '12px', color: '#73A870' }}
                  >
                   Areas of Expertise
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {(showAllSpecialities ? specialities : specialities.slice(0, 10)).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        sx={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '7px',
                          background:
      index % 3 === 0
        ? '#cbe3fb'
        : index % 3 === 1
          ? '#d4ead4'
          : '#e9c9ea',
                          border: `1.9px solid ${
                            index % 3 === 0
                              ? '#64b5f6'
                              : index % 3 === 1
                                ? '#81c784'
                                : '#ba68c8'
                          }`,
                          color: '#000',
                        }}
                      />
                    ))}

                    {specialities.length > 10 && (
                      <Typography
                        variant="body2"
                        onClick={() => setShowAllSpecialities(!showAllSpecialities)}
                        sx={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#0C6697',
                          cursor: 'pointer',
                          marginLeft: '8px',
                          alignSelf: 'center',
                          textDecoration: 'underline',
                        }}
                      >
                        {showAllSpecialities
                          ? 'Show Less'
                          : `Show More (+${specialities.length - 10})`}
                      </Typography>
                    )}
                  </Box>

                </Card>
              )}
              {/* Tabs Section */}
              <Card
                className="tabsCard"
                style={{
                  borderRadius: '20px',
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="mentor details tabs"
                  style={{ borderBottom: '1px solid #e0e0e0', fontSize: '20px' }}
                >
                  <Tab label="Bio" style={{ fontSize: '20px' }} />
                  {/* <Tab label="Specialities" style={{ fontSize: '20px' }} />
                  <Tab label="Career Highlights" style={{ fontSize: '20px' }} /> */}
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                  <Typography
                    variant="body1"
                    style={{ color: '#333', fontSize: '20px' }}
                    className="mentorBioContent"
                  >
                    {mentorBio && mentorBio.trim() !== '' ? (
                      <>
                        {ReactHtmlParser(
                          expandedBio || mentorBio.length <= 1000
                            ? mentorBio
                            : mentorBio.substring(0, 1000).trim()
                        )}
                        {mentorBio.length > 1000 && (
                          <span style={{ whiteSpace: 'nowrap' }}>
            ...<Button
                              onClick={handleToggleBio}
                              style={{
                                textTransform: 'none',
                                color: '#0C6697',
                                fontSize: '18px',
                                padding: 0,
                                minWidth: 'auto',
                                display: 'inline',
                                verticalAlign: 'baseline',
                              }}
                            >
                              {expandedBio ? 'Read Less' : 'Read More'}
                            </Button>
                          </span>
                        )}
                      </>
                    ) : (
                      'No Bio Added'
                    )}
                  </Typography>
                </TabPanel>
                {/* <Box style={{ fontSize: '20px' }}>
                  <TabPanel value={tabValue} index={1}>
                    <Typography
                      variant="body1"
                      style={{ marginBottom: '16px',color:'#333' }}
                    >
                      {specialities != '' ? ReactHtmlParser(specialities) : ReactHtmlParser('<p>No Specialities Added</p>')}
                    </Typography>
                  </TabPanel>
                </Box> */}
                {/* <TabPanel value={tabValue} index={2}>
                  <Typography
                    variant="body1"
                    style={{ marginBottom: '16px',color:'#333' }}
                  >
                    {careerHighlights != '' ? ReactHtmlParser(careerHighlights) : ReactHtmlParser('<p>No Career Highlights Added</p>')}
                  </Typography>
                </TabPanel> */}
              </Card>
             

              {/* Reviews Card */}
              <Card
                className="reviewsCard"
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '20px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                }}
              >
                <CardContent sx={{position: 'relative'}}>
               
                  {authors.length > 0 && authors  ? (
                    <>
                      <Typography variant="h6" style={{ fontWeight: 'bold', color: 'black' }}>
                        {authors.length} Review(s)
                      </Typography>
                      <Box className="review-container" style={{ display: 'flex' }}>
                        {authors.slice(currentIndex, currentIndex + 2).map((author, index) => (
                          <Box
                            className="review"
                            key={index}
                            style={{
                              width: '50%',
                              paddingRight: index % 2 === 0 ? '24px' : '0px',
                              borderRight: index % 2 === 0 ? '1px solid #e0e0e0' : 'none',
                              paddingLeft: '16px',
                            }}
                          >
                            <Typography variant="h6" style={{ fontSize: '20px',textTransform: 'capitalize',fontWeight: 'bold', color: '#0C6697' }}>
                              {authors.includes('@') ? extractFirstName(author) : author}
                            </Typography>
                            <Typography variant="body2" style={{ fontSize: '19px', color: 'black' }}>
                              {dates[currentIndex + index]}
                            </Typography>
                            <Box className="stars" style={{ fontSize: '19px', color: 'gold', display: 'flex' }}>
                              {Array.from({ length: ratings[currentIndex + index] }).map((_, i) => (
                                <StarIcon key={i} />
                              ))}
                              {Array.from({ length: 5 - ratings[currentIndex + index] }).map((_, i) => (
                                <StarIcon key={i} style={{ color: '#e0e0e0' }} />
                              ))}
                            </Box>
                            <Box style={{ fontSize: '19px' }}>{renderReviewContent(contents[currentIndex + index], currentIndex + index)}</Box>
                          </Box>
                        ))}
                        {authors.length > 2 && (
                          <Box>
                            <IconButton
                              className="slider-button"
                              onClick={handlePrev}
                              style={{ position: 'absolute', top: '2%', right: '80px', zIndex: 1 }}
                            >
                              <ArrowBackIcon />
                            </IconButton>
                            <IconButton
                              className="slider-button"
                              onClick={handleNext}
                              style={{ position: 'absolute', top: '2%', right: '3%', zIndex: 1 }}
                            >
                              <ArrowForwardIcon />
                            </IconButton>
                          </Box>
                        )}
                        <Button
                          className="see-all-reviews"
                          style={{ position: 'absolute', bottom: '0%', fontSize: '17px', right: 16 }}
                          onClick={() => setSelectedReview({ author: '', date: '', rating: 0, content: '' })}
                        >
                        See all reviews
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="350px" width="100%" textAlign="center">
                      <Avatar
                        variant="square"
                        src={noReviews}
                        alt="No Reviews Image"
                        className="no-reviews-image"
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'contain',
                          marginBottom: '1rem',
                        }}
                      />
                      <Box sx={{fontSize:'28px'}}>No Reviews</Box>
                    </Box>
                  )}
               
                </CardContent>
              </Card>
              <Dialog open={!!selectedReview} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ style: { borderRadius: 16, padding: '20px', width: '600px' } }}>
                <DialogContent>
                  <IconButton aria-label="close" onClick={handleClose} style={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                  </IconButton>
                  {selectedReview && (
                    <>
                      <Typography variant="h6" style={{ fontSize: '24px',textTransform: 'capitalize', color: '#0C6697', marginBottom: '8px' }}>
                        {selectedReview.author}
                      </Typography>
                      <Typography variant="body2" style={{ fontSize: '20px', color: 'black', marginBottom: '8px' }}>
                        {selectedReview.date}
                      </Typography>
                      <Box className="stars" style={{ fontSize: '30px', color: 'gold', display: 'flex', marginBottom: '8px' }}>
                        {Array.from({ length: selectedReview.rating }).map((_, i) => (
                          <StarIcon key={i} />
                        ))}
                        {Array.from({ length: 5 - selectedReview.rating }).map((_, i) => (
                          <StarIcon key={i} style={{ color: '#e0e0e0' }} />
                        ))}
                      </Box>
                      <Typography variant="body2" style={{ fontSize: '24px', color: 'black' }}>
                        {selectedReview.content}
                      </Typography>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              {/* All Reviews Dialog */}
              <Dialog open={selectedReview && selectedReview.content === ''} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ style: { borderRadius: 16, padding: '20px' } }}>
                <DialogContent style={{ overflowY: 'auto', maxHeight: '500px', marginTop: '4%' }}>
                  <IconButton aria-label="close" onClick={handleClose} style={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                  </IconButton>
                  <Box>
                    <Typography variant="h6" style={{ fontSize: '20px', color: 'black', marginTop: '-2%', fontWeight: 'bold', marginBottom: '16px' }}>
                      {authors.length} Reviews
                    </Typography>
                  </Box>
                  {authors.map((author, index) => (
                    <Box key={index} style={{ marginBottom: '16px' }}>
                      <Typography variant="h6" style={{ fontSize: '20px' ,textTransform: 'capitalize',color: '#0C6697', marginBottom: '8px' }}>
                        {author}
                      </Typography>
                      <Typography variant="body2" style={{ fontSize: '18px', color: 'black', marginBottom: '8px' }}>
                        {dates[index]}
                      </Typography>
                      <Box className="stars" style={{ fontSize: '30px', color: 'gold', display: 'flex', marginBottom: '8px' }}>
                        {Array.from({ length: ratings[index] }).map((_, i) => (
                          <StarIcon key={i} />
                        ))}
                        {Array.from({ length: 5 - ratings[index] }).map((_, i) => (
                          <StarIcon key={i} style={{ color: '#e0e0e0' }} />
                        ))}
                      </Box>
                      <Typography variant="body2" style={{ fontSize: '20px', color: 'black' }}>
                        {contents[index]}
                      </Typography>
                    </Box>
                  ))}
                </DialogContent>
                <Box style={{ height: '40px' }} /> {/* Space for the close icon */}
              </Dialog>

              {/* FAQ Card */}
              <Card
                className="faqCard"
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent>
                  <Typography variant="h6" style={{ fontWeight: 'bold', color: 'black', marginBottom: '3%' }}>
                  FAQ
                  </Typography>
                  {faq.map((faq, index) => (
                    <Accordion
                      key={index}
                      sx={{
                        '&.MuiPaper-root': {
                          boxShadow: 'none',
                        },
                        '& .MuiPaper-root-MuiAccordion-root': {
                          border: 'none',
                          borderTopLeftRadius: '0',
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${index}-content`}
                        id={`panel${index}-header`}
                      >
                        <Typography variant="subtitle1" sx={{ fontSize: '16px' }}>
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ fontSize: '16px' }}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Box>
            <Box className="bookingContainer">
              <BookingCard rescheduledBy={''} accountStatus={accountStatus} rescheduleMessage={''} menteeStatus={false} recurrenceEnds={recurrenceEnds} rescheduleRequest={0} preview={type == 'preview'?true:false} type={'mentorDetails'} bookingStatus={bookingStatus} bookingId={0} onBookSession={onBookSession} mentorName={mentorName} mentorUserId={mentorUserId} mentorId={mentorId} mentorSessions={mentorSessions} currencyId={currencyId} sameDayBooking={sameDayBooking}/>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
  return type === 'preview' ? content : <Main>{content}</Main>;
};

export default MentorDetailPage;