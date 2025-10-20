import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, Rating, TextField, Snackbar, Alert, Avatar, FormHelperText } from '@mui/material';
import queryString from 'query-string';
import siteConfig from '../../../theme/site.config';
import { getData,postData,putData } from '../../../theme/Axios/apiService';
import { useNavigate } from 'react-router-dom'; 

const MeetingLeftPage: React.FC = () => {
  const navigate = useNavigate(); 
  const queries = queryString.parse(location.search);
  const meetingId = queries.id ? String(queries.id) : '';
  const mentorId = queries.mentorId ? Number(queries.mentorId) : 0;
  const bookingId = queries.bookingId ? Number(queries.bookingId) : 0;
  const mentorProfilePicture = queries.mentorProfilePicture ? String(queries.mentorProfilePicture) : '';
  const mentorName = queries.mentorName ? String(queries.mentorName) : '';
  // const meetingAgenda = queries.meetingAgenda ? String(queries.meetingAgenda) : '';
  const date = queries.date ? String(queries.date) : '';
  const toDate = queries.toDate ? String(queries.toDate) : '';
  const meetUserType = queries.meetUserType ? String(queries.meetUserType) : '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const adjustedToDateString = toDate.replace(' ', '+');
  const toCurrentDate = new Date(adjustedToDateString);
  const now = new Date();
  const isOld = toCurrentDate < now;
  if(meetingId){
    if( window.localStorage )
    {
      if( !localStorage.getItem('firstLoad') )
      {
        localStorage['firstLoad'] = true;
        window.location.reload();
      }
    }
  }
  // let valueStatus = 4;
  // if(localStorage.getItem('userType') == 'mentee'){
  //   valueStatus = 1;
  // }
  // const userId = localStorage.getItem('userId');
  // const numericUserId = userId ? Number(userId) : 0;

  const [rating, setRating] = useState<number | null>(0);
  const [ratingId, setRatingId] = useState<number | null>(0);
  const [review, setReview] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState(false);
  // const [reviewStatus, setReviewStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false); 
  const [ratingError, setRatingError] = useState<string>(''); 
  const [reviewError, setReviewError] = useState<string>('');
  const [formDisabled, setFormDisabled] = useState<boolean>(false); 
  
  useEffect(() => {
    initRating();
    if (isOld) { 
      if (meetUserType === 'mentor') {
        setTimeout(() => {
          navigate('/account-settings?value=bookings', { replace: true });
        }, 3000); 
      }
    }
  }, [mentorId]);

  // Handle Snackbar close
  const initRating = async () =>{
    const ratingResponse = await getData(`${siteConfig.hodegoUrl}rating?mentorId=${mentorId}&bookingId=${bookingId}`);
    if(ratingResponse){
      if(ratingResponse.data){
        if(ratingResponse.data.data.length > 0){
          setReviewStatus(true);
          setRatingId(ratingResponse.data.data[0].ratingId);
          setRating(ratingResponse.data.data[0].rating);
          setReview(ratingResponse.data.data[0].review);
          setFormDisabled(true); // Disable form if review already exists
        }
      }
    }
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    let hasError = false;

    // Validation for rating
    if (!rating) {
      setRatingError('Please provide a rating');
      hasError = true;
    } else {
      setRatingError('');
    }

    // Validation for review
    if (!review) {
      setReviewError('Please provide a review');
      hasError = true;
    } else {
      setReviewError('');
    }

    if (!hasError) {
      setIsSubmitting(true);
      setFormDisabled(true); 
      const formData = {
        // mentorId: mentorId, 
        // userId: numericUserId, 
        bookingId: bookingId,
        rating: rating, 
        review: review, 
      };

      try {
        if(reviewStatus == true){
          const response = await putData(formData, `${siteConfig.hodegoUrl}rating/${ratingId}`);
          if(response?.data == true){
            // setReviewStatus(true);
            setSnackbarOpen(true);  
            setFormDisabled(true);
            if (isOld) { 
              if (meetUserType === 'mentor') {
                setTimeout(() => {
                  navigate('/account-settings?value=bookings', { replace: true });
                }, 3000); 
              } else if (meetUserType === 'user' && reviewStatus == true) {
                setTimeout(() => {
                  if(localStorage.getItem('userType') == 'mentee'){
                    navigate('/account-settings?value=bookings', { replace: true });
                  }
                  else{
                    navigate('/account-settings?value=bookings', { replace: true });
                  }
                }, 3000); 
              }
            }
            // setRating(0); 
            // setReview(''); 
          }
        }
        else{
          const response = await postData(formData, `${siteConfig.hodegoUrl}rating`);
          if(response?.data == true){
            console.log('Response:', response);
            // setReviewStatus(true);
            setSnackbarOpen(true);  
            // setRating(0); 
            // setReview(''); 
            if (isOld) { 
              if (meetUserType === 'mentor') {
                setTimeout(() => {
                  navigate('/account-settings?value=bookings', { replace: true });
                }, 3000); 
              } else if (meetUserType === 'user') {
                setTimeout(() => {
                  if(localStorage.getItem('userType') == 'mentee'){
                    navigate('/account-settings?value=bookings', { replace: true });
                  }
                  else{
                    navigate('/account-settings?value=bookings', { replace: true });
                  }
                }, 3000); 
              }
            }
          }
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
        setFormDisabled(false); 
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#0C6697"
      padding={3}
    >
      {/* Rejoin and Back to Home screen buttons */}
      <Box display="flex" gap={'9px'} marginBottom={4}  sx={{ marginTop: isMobile ? '-9%' : '' }}>
        { !isOld && (
          <Button
            variant="contained"
            href={`/hodego-join?id=${meetingId}`}
            sx={{
              background: '#73A870',
              color: '#fff',
            }}
          >
          Rejoin
          </Button>
        )};
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#131728',
            color: '#fff',
          }}
          href={`${window.location.origin}/account-settings?value=bookings`}
        >
          Back to Home Screen
        </Button>
      </Box>
      {meetUserType == 'user' ?
        (
          <Card
            variant="outlined"
            sx={{
              padding: 4,
              backgroundColor: '#fff',
              maxWidth: '600px',
              paddingBottom: { xs: 4, sm: 6 }, 
              marginTop:{xs:'-1%',sm:'-1%'},
              width: '100%',
              height: 'auto',
              minHeight: { xs: '500px', sm: '624px' },
            }}
          >
            {/* Mentor Profile Section */}
            <Box display="flex" flexDirection="column" alignItems="center" marginBottom={1}>
              <Box display="flex" alignItems="center" marginBottom={1}>
                <Avatar
                  src={mentorProfilePicture}
                  alt={mentorName}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%', 
                    marginRight: 2, 
                  }}
                />
                <Box>
                  <Typography variant="h6" sx={{ color: '#0C6697', fontWeight: 'bold' }}>
                    {mentorName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {date}
                  </Typography>
                  {/* <Typography variant="body1" sx={{ color: '#333', textAlign: 'justify' }}>
                    {meetingAgenda}
                  </Typography> */}
                </Box>
              </Box>
            </Box>

            {/* First Heading - Bold */}
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                textAlign: 'center',
                color: '#0C6697',
                fontWeight: 'bold',
                marginBottom: 2,
              }}
            >
           Share your experience! Feedback helps experts improve and may be displayed publicly on their profile for others to see.
            </Typography>

            {/* Second Heading */}
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                marginBottom: 1,
                textAlign: 'center',
                color: '#333',
              }}
            >
          Please rate your session and share any thoughts you’d like the expert to see.
            </Typography>

            {/* Rating Component */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ marginBottom: 3 }}
            >
              <Box display="flex" alignItems="center" gap={isMobile? 0:3}>
                <Rating
                  name="mentor-rating"
                  className="test"
                  value={rating}
                  onChange={(event, newValue) => {
                    setRating(newValue);
                  }}
                  disabled={formDisabled}
                  size="large"
                  precision={1}
                  max={5}
                  sx={{
                    fontSize: '3rem', 
                    gap: isMobile ? '0' : '20px', 
                  }}
                />
              </Box>
             
              {ratingError && <FormHelperText error>{ratingError}</FormHelperText>}
              {/* Text below the rating */}
              {/* <Box display="flex" justifyContent="space-between" width="100%" paddingX={isMobile ? 0 : 5}>
                <Typography variant="body2" sx={{ color: '#333' }}>
              Terrible
                </Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
              Amazing
                </Typography>
              </Box> */}
            </Box>

            {/* Review Input */}
            <TextField
              label=""
              // placeholder="Describe your experience"
              fullWidth
              multiline
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              error={Boolean(reviewError)} 
              helperText={reviewError} 
              sx={{ marginBottom: 1 }}
              disabled={formDisabled}
            />

            {/* Submit Button */}
            <Box display="block" sx={{'textAlign':'right',marginTop:'1%',marginBottom: '2%'}}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting || formDisabled}
                sx={{
                  background: 'linear-gradient(90deg, #73A870, #0C6697)',
                  color: '#fff',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </Card>
        ):
        ''
      }
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Review submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingLeftPage;
