import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
  Alert, Snackbar,
  FormControlLabel,
  Chip,Link,
  Divider
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Main from 'layouts/Main';
import Cropper from 'react-easy-crop';
import { useFormik } from 'formik';
import { getData,putData,postData } from '../../theme/Axios/apiService';
import siteConfig from '../../theme/site.config';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import CancelIcon from '@mui/icons-material/Cancel';
import hodegoFavicon from '../../assets/images/hodegoFavicon.png';



const getValidationSchema = (userType: string) => {
  const ageStatus = localStorage.getItem('ageStatus');
  const baseSchema = {
    firstName: yup
      .string()
      .trim()
      .min(1, 'Please enter a valid name')
      .max(50, 'Please enter a valid name')
      .required(ageStatus === 'minor' ? 'Please specify your parent\'s first name' : 'Please specify your first name'),
    lastName: yup
      .string()
      .trim()
      .min(1, 'Please enter a valid name')
      .max(50, 'Please enter a valid name')
      .required(ageStatus === 'minor' ? 'Please specify your parent\'s last name' : 'Please specify your last name'), 
    email: yup
      .string()
      .trim()
      .email('Please enter a valid email address')
      .required('Email is required.'),
    phone: yup
      .string()
      .required('Please specify your phone number')
      .min(10, 'The phone number should have at least 10 digits'),
    country: yup.string().required('Please select a country'),
    languages: yup.array().min(1, 'At least one language is required'),
    terms: yup.bool().oneOf([true], 'Please accept the Terms and Conditions to proceed.'),
  };

  if (userType === 'mentor') {
    return yup.object({
      ...baseSchema,
      // title: yup.string().required('Please enter a title'),
      primarySports: yup.string().required('Please select a primary sport'),
      additionalSports: yup
        .array()
        .of(yup.string())
        .notRequired(),
      appSummary: yup.string().required('Please write a bit about yourself'),
    });
  } else if (userType === 'mentee') {
    return yup.object({
      ...baseSchema,
      interest: yup.array().min(1, 'At least one interest is required'),
      ...(ageStatus === 'minor'
        ? {
          youthAthleteName: yup.string().required('Youth athlete’s name is required'), // ✅ Only required for minors
        }
        : {}),
    });
  }

  return yup.object(baseSchema);
};

const RegistrationForm = (): JSX.Element => {
  interface UserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    childFirstName?:string;
  }
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [tempProfilePicture, setTempProfilePicture] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [defaultlanguages, setDefaultLanguages] = useState([]);
  const [defaultcountries, setDefaultcountries] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [defaultsports, setDefaultsports] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [formStatus, setFormStatus] = useState(false);
  const [currentCountryCode, setCurrentCountryCode] = useState('');
  // const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [userData, setUserData] = useState<Partial<UserData> | null>(null);
  const [defaultAddsports, setDefaultAddsports] = useState([]);
  const navigate = useNavigate();
  const userType = localStorage.getItem('selectedUserType');
  const userId = localStorage.getItem('userId');
  const timezoneMap = {
    'Asia/Calcutta': 'Asia/Kolkata',
    'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
    'Asia/Saigon': 'Asia/Ho_Chi_Minh',
    'Europe/Nicosia': 'Asia/Nicosia',
    'Pacific/Ponape': 'Pacific/Pohnpei',
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const parsedData = JSON.parse(userDataString);
        setUserData(parsedData); // Update userData state
      } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
        setUserData({}); // Fallback to an empty object
      }
    } else {
      setUserData({}); // Default empty object if localStorage is empty
    }
  }, []);
  useEffect(() =>{
    console.log('image');
  }, [tempProfilePicture]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await getData(`${siteConfig.hodegoUrl}user/identity/all`);
      if (response) {
        if (response.data) {
          if (response.data.language && response.data.language.length > 0) {
            setDefaultLanguages([...response.data.language.filter(lang => lang.languageName === 'English'),
              ...response.data.language.filter(lang => lang.languageName !== 'English')]);
          }
          if (response.data.country && response.data.country.length > 0) {
            setDefaultcountries([
              ...response.data.country.filter(country => country.countryName === 'United States'),
              ...response.data.country.filter(country => country.countryName !== 'United States')
            ]);
          }
          if (response.data.sport && response.data.sport.length > 0) {
            setDefaultsports(response.data.sport);
          }
          if (response.data.sport && response.data.sport.length > 0) {
            setDefaultAddsports(response.data.sport);
          }
        }
      }
      const formData = {
        'registrationType':{'type':userType,'regisStatus':true,'direct':localStorage.getItem('hodegoStatus') == 'direct'?true:false},
      };
      setTimeout(async() => {
        const responseData = await putData(formData, `${siteConfig.hodegoUrl}user/${localStorage.getItem('userId')}`);
        if (responseData?.data) {
          setLoading(false);
          console.log(responseData.data);
        }
      }, 2000);
      fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
          setCurrentCountryCode(data.country); // e.g., "US"
        })
        .catch(error => {
          console.error('Error getting country:', error);
        });
    };
    fetchData();
  }, []);

  // MenuProps for Select dropdowns
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
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: userData?.firstName && userData?.firstName != userData?.email ? userData?.firstName : '',
      lastName: userData?.lastName && userData?.lastName != userData?.email ? userData?.lastName : '',
      email: userData?.email || '',
      // childFirstName: userData?.childFirstName && userData?.childFirstName != userData?.childFirstName ? userData?.childFirstName : '',
      // under18: false,
      youthAthleteName: userData?.childFirstName || '', 
      // title: '',
      phone: '',
      languages: [] as string[],
      country: currentCountryCode,
      primarySports: '',
      additionalSports: [] as string[],
      interest: [] as string[],
      appSummary: '',
      terms: false,
    },
    validationSchema: getValidationSchema(userType),
    onSubmit: async (values) => {
      const formData = prepareFormData(values, userType);
      console.log('Submitting form with values:', values);
      console.log('FormData being sent:', formData);
      const response = await putData(formData, `${siteConfig.hodegoUrl}user/${userId}`);
      if (response?.data) {
        localStorage.removeItem('registrationType');
        localStorage.removeItem('hodego_login_status');
        localStorage.removeItem('hodegoStatus');
        console.log('response.data', response.data);
        // localStorage.removeItem('selectedUserType');
        setSnackbarOpen(true);
        setFormStatus(true);
        if (localStorage.getItem('bookingDetails') !== null) {
          createBooking(userId);
        }
        // if (activeStep === steps.length - 1) {
        //   navigate('/account-settings');
        // }
      }
    },
  });
  const createBooking = async (userId) => {

    if (localStorage.getItem('bookingDetails') !== null) {
      const formData = JSON.parse(localStorage.getItem('bookingDetails'));
      formData.bookedBy = parseInt(userId);
      const url = `${siteConfig.hodegoUrl}mentor/booking`;

      const response = await postData(formData,url);
      if (response?.data) {
        if (response.data.status == true && response.data.bookingId) {
          localStorage.removeItem('bookingDetails');
          // localStorage.setItem('bookingId',String(response.data.bookingId));
          navigate(`/book-now?id=${response.data.bookingId}&bookingStatus=${formData.bookingStatus}&isTodaySelected=${formData.isTodaySelected}&free=${formData.free}`);
        }
        else if(response.data.status == false){
          setErrorMessage(response.data.message);
          setNotificationOpen(true);
        }
      }

    }
  };
  const getUpdatedTimezone = (timezone: string) => {
    return timezoneMap[timezone] || timezone;
  };
  
  const handleBack = () =>{
    localStorage.removeItem('hodegoStatus');
    localStorage.removeItem('ageStatus'); 
    sessionStorage.setItem('isBackClicked', 'true');
    navigate('/join');
  };
 
  const prepareFormData = (values: any, userType: string) => {
    const baseData = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      languages: values.languages,
      terms: values.terms,
      timeZone: getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone),
      profilePictureUrl: profilePicture,
    };

    if (userType === 'mentor') {
      return {
        ...baseData,
        // title: values.title,
        primarySport: values.primarySports,
        additionalSports: values.additionalSports,
        appSummary: values.appSummary,
        isMentor: 1,
      };
    } 
    else if (userType === 'mentee') {
      const ageStatus = localStorage.getItem('ageStatus'); // ✅ Use localStorage to decide minor/adult
      if (ageStatus === 'minor') {
        localStorage.removeItem('ageStatus'); // ✅ Clear ageStatus after use
        return {
          ...baseData,
          interests: values.interest,
          isMentor: 0,
          ageStatus: 'minor',
          childFirstName: values.youthAthleteName,
        };
      } else {
        return {
          ...baseData,
          interests: values.interest,
          isMentor: 0,
          ageStatus: 'adult',
          childFirstName: '',

        };
      }
    }



    return baseData;
  };
  useEffect(() => {
    console.log('Formik errors:', formik.errors); // Check for validation errors
  }, [formik.errors]);
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfilePicture('');
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfilePicture(reader.result as string);
        setOpenCropDialog(true); // Open crop dialog
      };
      reader.readAsDataURL(file);
    }
  };
  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImage = async () => {
    if (!tempProfilePicture || !croppedAreaPixels) return;
  
    const image = new Image();
    image.src = tempProfilePicture;
  
    return new Promise<string>((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        if (!ctx) return reject('Canvas context not found');
  
        // Set higher resolution for HD output
        const HD_SCALE_FACTOR = 2; // Scale by 2x for HD output
        canvas.width = 257 * HD_SCALE_FACTOR;
        canvas.height = 257 * HD_SCALE_FACTOR;
  
        // Scale and crop the image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
  
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedUrl = URL.createObjectURL(blob);
              resolve(croppedUrl);
            }
          },
          'image/jpeg',
          1.0 // High-quality JPEG
        );
      };
    });
  };
  
  const handleCropSave = async () => {
    const croppedImage = await getCroppedImage();
    if (croppedImage) {
      setProfilePicture(croppedImage);
      setOpenCropDialog(false);

      // Upload cropped image to the server
      const formData = new FormData();
      const croppedBlob = await fetch(croppedImage).then(res => res.blob()); // Convert cropped URL to Blob
      formData.append('file', croppedBlob, 'cropped-image.webp');
      
      const get_access_token = localStorage.getItem('hodego_access_token');
      axios
        .post(`${siteConfig.hodegoUrl}user/profile-picture`, formData, {
          headers: {
            'hodego_access_token': get_access_token,
          },
        })
        .then((response) => {
          if (response.data && typeof response.data.url === 'string') {
            // setShowWarning(true);
            setProfilePicture(response.data.url);
          }
        })
        .catch((error) => {
          console.error('Error uploading cropped image', error);
        });
    }
  };
  return (
    <Main>
      <Dialog
        open={openCropDialog}
        onClose={() => setOpenCropDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            background: '#fff', // Dimmed background
            height: '350px',
            border: '1px solid #73a870',
            borderRadius: '4px'
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
    Crop Your Picture
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 24px',
            overflow: 'auto',
          }}
        >
          {tempProfilePicture && (
            <Cropper
              image={tempProfilePicture}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, zoom) => setZoom(zoom as number)}
            sx={{
              mt: 2,
              width: '80%',
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'space-between', // Ensure buttons are spaced out
            padding: '8px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Button
            onClick={() => {setOpenCropDialog(false);}}
            variant="outlined"
          >
      Cancel
          </Button>
          <Button
            onClick={handleCropSave}
            color="primary"
            sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
            variant="contained"
          >
      Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mb: '4%', ml: '6%' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Success! Your Hodego Journey Starts Now
        </Alert>
      </Snackbar>
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
      <Box
        sx={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        {/* Heading */}
        <Box sx={{ marginBottom: '7%', marginTop: '8%' }} textAlign={'initial'}>
          <Typography color="text.secondary" variant="h4" sx={{ fontWeight: 700 }}>
            {formStatus ? (
              userType === 'mentor' ? (
                <Box sx={{ textAlign: 'center' }}>
                  <span style={{ color: '#DD9D51' }}>Application Submitted</span>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <span style={{ color: '#DD9D51' }}>Registration Complete! Welcome to Hodego!</span>
                </Box>
              )
            ) : userType === 'mentor' ? (
              <>
                <Box sx={{ textAlign: 'left', marginBottom: '3%' }}>
                  <Link
                    onClick={handleBack}
                    sx={{
                      textDecoration: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <ArrowBackIcon sx={{ verticalAlign: 'middle' }} /> Back
                  </Link>
                </Box>
                <span style={{ color: '#DD9D51' }}>Hodego Expert Application</span>
              </>
            ) : (
              <>
                <Box sx={{ textAlign: 'left', marginBottom: '3%' }}>
                  <Link
                    onClick={handleBack}
                    sx={{
                      textDecoration: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <ArrowBackIcon sx={{ verticalAlign: 'middle' }} /> Back
                  </Link>
                </Box>
                <span style={{ color: '#DD9D51' }}>Sports Enthusiast Registration</span>
              </>
            )}
            {!formStatus && ' Starts Here!'}
          </Typography>

          {/* Sub-Heading - Only for mentors */}
          {!formStatus && userType === 'mentor' && (
            <Typography
              color="text.secondary"
              variant="subtitle1" // Adjust the size of the sub-heading
              sx={{
                marginTop: 1, // Add spacing below the main heading
                fontWeight: 500, // Slightly less bold for sub-heading
              }}
            >
      Do You Have What It Takes to Be a Hodego?
            </Typography>
          )}
        </Box>

        {/* Expert Registration Second Page */}
        {formStatus == true ?
          userType == 'mentor' ?
            <Grid item xs={12} sx={{ marginBottom: 5, textAlign: 'center' }}>
              <Box
                sx={{
                  maxWidth: '600px',
                  margin: '0 auto',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.1)',
                  background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
                }}
              >
                {/* Header with Logo */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <Typography
                    color="text.primary"
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: '#0C6697',
                      fontSize: '1.8rem',
                    }}
                  >
                Thank You for Applying
                  </Typography>
                  <img
                    src={hodegoFavicon}
                    alt="Hodego Logo"
                    style={{
                      width: '36px',
                      height: '36px',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
        
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{
                    marginBottom: '20px',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                  }}
                >
              Your application to become a Hodego Sports Expert is under review. We’re
              excited to have you join our global sports community. We’ll contact you
              if additional details are needed.
                </Typography>
        
                {/* What's Next Section */}
                <Box sx={{ textAlign: 'left' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <Box sx={{ fontSize: '1.5rem', color: '#73A870', marginRight: '10px' }}>
                  📋
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#0C6697',
                        fontSize: '1.1rem',
                      }}
                    >
                  What’s Next?
                    </Typography>
                  </Box>
        
                  <Divider sx={{ marginBottom: '16px' }} />
        
                  {/* Step 1 */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <Box sx={{ fontSize: '1.5rem', color: '#73A870', marginRight: '12px' }}>
                  📄
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, marginBottom: '4px', fontSize: '1rem' }}
                      >
                    Step 1: Application Review
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                    Our team will evaluate your application to ensure it meets Hodego’s
                    standards. Expect a response within <strong>48 hours</strong>.
                      </Typography>
                    </Box>
                  </Box>
        
                  {/* Step 2 */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <Box sx={{ fontSize: '1.5rem', color: '#73A870', marginRight: '12px' }}>
                  🔧
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, marginBottom: '4px', fontSize: '1rem' }}
                      >
                    Step 2: Expert Profile Setup
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                    Once approved, access your <strong>Expert Dashboard</strong> to:
                        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                          <li>Showcase your skills with a professional profile.</li>
                          <li>Set availability, pricing, and session preferences.</li>
                          <li>Customize your profile to connect with your ideal audience.</li>
                        </ul>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
        
                {/* Why Hodego Section */}
                <Box
                  sx={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    textAlign: 'left',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <Box sx={{ fontSize: '1.5rem', color: '#73A870', marginRight: '10px' }}>
                  🌟
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#0C6697',
                        fontSize: '1.1rem',
                      }}
                    >
                  Why Hodego?
                    </Typography>
                  </Box>
        
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                    <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                      <li>
                        <strong>Impact Lives:</strong> Inspire and guide sports enthusiasts with your expertise.
                      </li>
                      <li>
                        <strong>Flexibility:</strong> Work on your own schedule from anywhere in the world.
                      </li>
                      <li>
                        <strong>Growth Opportunity:</strong> Expand your personal brand and monetize your knowledge.
                      </li>
                    </ul>
                  </Typography>
                </Box>
        
                {/* CTA Button */}
                <Box sx={{ textAlign: 'center', marginTop: '24px' }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(90deg, #0C6697, #73A870)',
                      color: '#ffffff',
                      padding: '12px 24px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #073E6B, #5D8657)',
                      },
                    }}
                    href="/account-settings?value=dashboardAnalytics"
                  >
                Go to Dashboard
                  </Button>
                </Box>
              </Box>
            </Grid>
        

            :
            <Grid item xs={12} sx={{ marginBottom: 5, textAlign: 'center' }}>
              <Box
                sx={{
                  maxWidth: '600px',
                  margin: '0 auto',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                  background: '#ffffff',
                  animation: 'fadeIn 0.5s ease-in-out',
                }}
              >
                {/* Header */}
                <Typography
                  color="text.primary"
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#0C6697',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                🎉 Registration Complete
                </Typography>
          
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{
                    marginBottom: '24px',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  }}
                >
                Thank you for joining Hodego! Your account is now active, and you’re ready to explore the platform. Start connecting with sports experts today.
                </Typography>
          
                {/* What’s Next Section */}
                <Box sx={{ textAlign: 'left' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#0C6697',
                      marginBottom: '12px',
                    }}
                  >
                  What’s Next?
                  </Typography>
          
                  {/* Step 1 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '1.5rem',
                        color: '#73A870',
                        marginRight: '12px',
                      }}
                    >
                    🔍
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, marginBottom: '4px' }}
                      >
                      Explore Experts
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                      Browse profiles of sports experts and find the perfect match for your needs, whether it’s improving your game, learning strategies, or getting insights.
                      </Typography>
                    </Box>
                  </Box>
          
                  {/* Step 2 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '1.5rem',
                        color: '#73A870',
                        marginRight: '12px',
                      }}
                    >
                    📅
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, marginBottom: '4px' }}
                      >
                      Book Your First Session
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                      Use the easy scheduling tool to book a one-on-one session with a sports expert and take your game to the next level.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
          
                {/* CTA Button */}
                <Box sx={{ textAlign: 'center', marginTop: '24px' }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(90deg, #0C6697, #73A870)',
                      color: '#ffffff',
                      padding: '12px 24px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #073E6B, #5D8657)',
                      },
                    }}
                    href="/explore"
                  >
                  Explore Experts
                  </Button>
                </Box>
              </Box>
          
              {/* Fade-in Keyframes */}
              <style>
                {`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}
              </style>
            </Grid>

          :
          <>
            
            {/* Form Fields */}
            {loading ? (
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
                  src={hodegoFavicon}
                  alt="Logo"
                  sx={{
                    width: '18px',
                    height: '20px',
                  }}
                />
              </div>
            ):(
              <><Box sx={{ marginBottom: '20px', textAlign: 'left' }}>
                {/* <Typography variant="subtitle1">Upload your profile picture</Typography> */}
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                  <Box>
                    <img
                      src={profilePicture ||
                          'https://assets.calendly.com/assets/frontend/media/placeholder-ea493df6fe8d166856b3.png'}
                      alt="Profile"
                      style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                  </Box>
                  <Box sx={{ marginLeft: '20px' }}>
                    <Button variant="outlined" component="label">
                        Upload Profile Picture
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleProfilePictureChange} />
                    </Button>
                  </Box>
                </Box>
              </Box><Box
                component="form"
                noValidate
                onSubmit={formik.handleSubmit}
                sx={{
                  '& .MuiTextField-root': { marginBottom: '20px' },
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={userType === 'mentee' && localStorage.getItem('ageStatus') === 'minor' ? 'Parent\'s First Name' : 'First Name'}
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                      required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={userType === 'mentee' && localStorage.getItem('ageStatus') === 'minor' ? 'Parent\'s Last Name' : 'Last Name'}
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mobile"
                      name="phone"
                      value={formik.values.phone}
                      // onChange={formik.handleChange}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
                        formik.setFieldValue('phone', value);
                      } }
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      required />
                  </Grid>
                  {/* {userType == 'mentor' ?
    <><Grid item xs={12} sm={6}>
      <TextField
        label="Headline *"
        placeholder='E.g., Tennis Pro, PGA Golfer, Olympic Athlete'
        variant="outlined"
        fullWidth
        name={'title'}
        value={formik.values.title}
        onChange={formik.handleChange}
        error={formik.touched.title && Boolean(formik.errors.title)}
        helperText={formik.touched.title && typeof formik.errors.title === 'string' && formik.errors.title} />
    </Grid>
    </>
    :
    ''
  } */}
                  <Grid item xs={12} sm={6}>
                    <FormControl variant="outlined" sx={{ marginBottom: 2 }} fullWidth>
                      <InputLabel>Language *</InputLabel>
                      <Select
                        labelId="languages-label"
                        id="languages"
                        name="languages"
                        multiple
                        MenuProps={MenuProps}
                        value={formik.values.languages}
                        onChange={formik.handleChange}
                        error={formik.touched.languages && Boolean(formik.errors.languages)}
                        input={<OutlinedInput label="Languages *" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value: string) => (
                              <Chip
                                key={value}
                                label={value}
                                clickable
                                deleteIcon={<CancelIcon
                                  onMouseDown={(event) => event.stopPropagation()} />}
                                onDelete={() => formik.setFieldValue(
                                  'languages',
                                  formik.values.languages.filter((lang) => lang !== value)
                                )} />
                            ))}
                          </Box>
                        )}
                      >
                        {defaultlanguages.map((lang) => (
                          <MenuItem key={lang.id} value={lang.languageName}>
                            <Checkbox
                              checked={formik.values.languages.includes(lang.languageName)} />
                            {lang.languageName}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.languages && formik.errors.languages && (
                        <FormHelperText className='Mui-error'>{formik.errors.languages}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl variant="outlined" sx={{ marginBottom: 2 }} fullWidth>
                      <InputLabel sx={{ background: '#fff'}}>Country *</InputLabel>
                      <Select
                        labelId="country-label"
                        id="country"
                        MenuProps={MenuProps}
                        name="country"
                        sx={{ 'textAlign': 'left' }}
                        value={formik.values.country}
                        onChange={formik.handleChange}
                        error={formik.touched.country && Boolean(formik.errors.country)}
                      >
                        {defaultcountries.map((country) => (
                          <MenuItem key={country.countryCode} value={country.countryCode}>
                            {country.countryName}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.country && formik.errors.country && (
                        <FormHelperText className='Mui-error'>{formik.errors.country}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  {userType == 'mentor' ?
                    <><Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" sx={{ marginBottom: 2 }} fullWidth>
                        <InputLabel sx={{ background: '#fff'}}>Primary Sport *</InputLabel>
                        <Select
                          labelId="primary-sport-label"
                          id="primary-sport"
                          name="primarySports"
                          MenuProps={MenuProps}
                          sx={{ textAlign: 'left' }}
                          value={formik.values.primarySports}
                          onChange={formik.handleChange}
                          error={formik.touched.primarySports && Boolean(formik.errors.primarySports)}
                        >
                          {defaultsports.map((sport) => (
                            <MenuItem key={sport.id} value={sport.sportName}>
                              {sport.sportName}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.primarySports && formik.errors.primarySports && (
                          <FormHelperText className='Mui-error'>{formik.errors.primarySports}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid><Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" sx={{ marginBottom: 2 }} fullWidth>
                        <InputLabel>Additional Sports</InputLabel>
                        <Select
                          labelId="additional-sports-label"
                          id="additional-sports"
                          name="additionalSports"
                          multiple
                          MenuProps={MenuProps}
                          value={formik.values.additionalSports}
                          onChange={formik.handleChange}
                          input={<OutlinedInput label="Additional Sports" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value: string) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  clickable
                                  deleteIcon={<CancelIcon
                                    onMouseDown={(event) => event.stopPropagation()} />}
                                  onDelete={() => formik.setFieldValue(
                                    'additionalSports',
                                    formik.values.additionalSports.filter((sport) => sport !== value)
                                  )} />
                              ))}
                            </Box>
                          )}
                        >
                          {defaultAddsports.map((sport) => (
                            <MenuItem key={sport.id} value={sport.sportName}>
                              <Checkbox
                                checked={formik.values.additionalSports.includes(sport.sportName)} // Checkbox reflects selection
                              />
                              {sport.sportName}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.additionalSports && formik.errors.additionalSports && (
                          <FormHelperText className='Mui-error'>{formik.errors.additionalSports}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid></>
                    :
                    <Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" sx={{ marginBottom: 2 }} fullWidth>
                        <InputLabel>Sports of Interest *</InputLabel>
                        <Select
                          labelId="interest-label"
                          id="interest"
                          name="interest"
                          multiple
                          MenuProps={MenuProps}
                          value={formik.values.interest}
                          onChange={formik.handleChange}
                          input={<OutlinedInput label="Sports of Interest" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value: string) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  clickable
                                  deleteIcon={<CancelIcon
                                    onMouseDown={(event) => event.stopPropagation()} />}
                                  onDelete={() => formik.setFieldValue(
                                    'interest',
                                    formik.values.interest.filter((item) => item !== value)
                                  )} />
                              ))}
                            </Box>
                          )}
                        >
                          {defaultsports.map((sport) => (
                            <MenuItem key={sport.id} value={sport.sportName}>
                              <Checkbox
                                checked={formik.values.interest.includes(sport.sportName)} />
                              {sport.sportName}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.interest && formik.errors.interest && (
                          <FormHelperText className='Mui-error'>{formik.errors.interest}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>}
                  {userType === 'mentee' && localStorage.getItem('ageStatus') === 'minor' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Youth Athlete’s First Name"
                          name="youthAthleteName"
                          value={formik.values.youthAthleteName}
                          onChange={formik.handleChange}
                          error={formik.touched.youthAthleteName && Boolean(formik.errors.youthAthleteName)}
                          helperText={formik.touched.youthAthleteName && formik.errors.youthAthleteName}
                          required
                        />
                      </Grid>
                    </>
                  )
                  
                  }

                  {/* {userType == 'mentee' ? */}
                  {userType == 'mentor' ?
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          marginBottom: 2,
                          textAlign: 'left',
                        }}
                      >
                            This section of the Hodego application is used by our admins to evaluate your fit as an expert on Hodego. This is not your profile bio.
                      </Typography>

                      <TextField
                        fullWidth
                        label="Tell us a bit about yourself"
                        name="appSummary"
                        multiline
                        rows={4}
                        value={formik.values.appSummary}
                        onChange={formik.handleChange}
                        error={formik.touched.appSummary && Boolean(formik.errors.appSummary)}
                        helperText={formik.touched.appSummary && formik.errors.appSummary}
                        placeholder="Tell us about your expertise and why you want to join Hodego. Optional: Add a link to your website or social media."
                        required />
                    </Grid>
                    :
                    ''}
                </Grid>
                {/* Accept Terms and Submit Button */}
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} sx={{ textAlign: 'left' }}>
                    <FormControlLabel
                      className='termsContent'
                      control={<Checkbox
                        name="terms"
                        checked={formik.values.terms}
                        onChange={formik.handleChange}
                        required />}
                      label={<span>
                            Click here to accept our{' '}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'underline', color: 'inherit' }}
                        >
                              Terms and Conditions
                        </a>.
                      </span>} />
                    {formik.touched.terms && formik.errors.terms && (
                      <Typography variant="body2" color="error">
                        {formik.errors.terms}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'right', marginTop: '3%' }}>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ background: 'linear-gradient(90deg, #0C6697, #73A870)', color: '#fff' }}
                    >
                          Submit
                    </Button>
                  </Grid>
                </Grid>
              </Box></>)}
          </>
        }
      </Box>
    </Main>
  );
};

export default RegistrationForm;