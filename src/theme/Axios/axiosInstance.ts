/* eslint-disable no-case-declarations */
import axios from 'axios';
import siteConfig from '../site.config';
// import { useNavigate } from 'react-router-dom';
import { notificationService } from './notificationService'; // Import the notification service
import { authService } from './authService'; // Import the auth service
// const navigate = useNavigate();
const axiosInstance = axios.create({
  baseURL: siteConfig.hodegoUrl, // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the token to headers
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('hodego_access_token');
    if (token) {
      config.headers['hodego_access_token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Existing response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('Global Error:', error.response?.data?.error?.message || error.message);

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          console.log('Bad Request');
          const backend400ErrorMessage = extractErrorMessage(error.response.data);
          notificationService.notify(backend400ErrorMessage);
          break;
        case 401:
          console.log('Unauthorized');
          const sourceStatus = sessionStorage.getItem('source');
          if(sourceStatus == 'mail' || sourceStatus == 'calendar'){
            sessionStorage.removeItem('source');
            // window.location.href = '/';
          }
          else{
            const backend401ErrorMessage = extractErrorMessage(error.response.data);
            notificationService.notify(backend401ErrorMessage);
            setTimeout(() => {
              if(backend401ErrorMessage == 'Session Expired. Please Log In Again.'){
                localStorage.clear(); // or selectively clear keys
                authService.logout();
              }
              else{
                window.location.href = '/';
              }
            }, 2000); 
          }

                   
          break;
        case 403:
          console.log('Forbidden');
          const backend403ErrorMessage = extractErrorMessage(error.response.data);
          notificationService.notify(backend403ErrorMessage);
          break;
        case 404:
          console.log('Not Found');
          const backend404ErrorMessage = extractErrorMessage(error.response.data);
          if(backend404ErrorMessage == 'Account Details Not Found. Please Contact Support If You Believe This Is An Error.'){
            setTimeout(() => {
              localStorage.removeItem('hodego_access_token');
              // localStorage.removeItem('myTimeZone');
              localStorage.removeItem('hodego_login_status');
              localStorage.removeItem('firstLoad');
              localStorage.removeItem('selectedUserType');
              localStorage.removeItem('hodegoStatus');
              localStorage.removeItem('registrationType');
              localStorage.removeItem('mentorId');
              localStorage.removeItem('userData');
              localStorage.removeItem('userId');
              localStorage.removeItem('userType');
              localStorage.removeItem('provider');
              window.location.href = '/';
            }, 2000);
          } 
          else{
            notificationService.notify(backend404ErrorMessage);
          }
          break;
        case 422:
          console.log('Unprocessable Entity');
          const backend422ErrorMessage = extractErrorMessage(error.response.data);
          if(backend422ErrorMessage == 'Mentor Details Not Found'){
            window.location.href = '/expertnotfound';
          }else{
            notificationService.notify(backend422ErrorMessage);
          }
          
          break;
        case 500:
          console.log('Internal Server Error');
          const backend500ErrorMessage = extractErrorMessage(error.response.data);
          notificationService.notify(backend500ErrorMessage);
          break;
        case 502:
          console.log('Bad Gateway');
          const backend502ErrorMessage = extractErrorMessage(error.response.data);
          notificationService.notify(backend502ErrorMessage);
          break;
        case 503:
          console.log('Service Unavailable');
          const backend503ErrorMessage = extractErrorMessage(error.response.data);
          notificationService.notify(backend503ErrorMessage);
          break;
        default:
          console.log('An unexpected error occurred');
          const unexpectedErrorMessage = extractErrorMessage(error.response.data);
          notificationService.notify(unexpectedErrorMessage);
      }
    } else if (error.request) {
      console.log('Network Error');
      notificationService.notify('Network error. Please check your internet connection.');
    } else {
      console.log('An unexpected error occurred');
      notificationService.notify('An unexpected error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error message from backend response
const extractErrorMessage = (data) => {
  if (data && data.message) {
    return data.message;
  } else if (data && data.error && data.error.message) {
    return data.error.message;
  } else if (data && data.errors) {
    return Object.values(data.errors).join(' ');
  } else {
    return 'An error occurred. Please try again.';
  }
};

export default axiosInstance;
