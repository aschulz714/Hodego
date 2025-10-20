import React, { lazy, Suspense } from 'react';
import HodegoLoading from '../components/HodegoLoader';
import NotFound from '../components/NotFound';


// Lazy load views
const AccountSettingsView = lazy(() => import('views/Settings/AccountSettings'));
const ScheduleView = lazy(() => import('views/Availability/Schedule'));
const Auth0LogoutView = lazy(() => import('views/Auth0Logout'));
const Auth0LoginView = lazy(() => import('views/Auth0Login'));
const MentorProfilesView = lazy(() => import('views/MentorProfiles'));
const AboutView = lazy(() => import('views/About'));
const MentorDetailedView = lazy(() => import('views/MentorProfiles/MentorDetailed'));
const MentorProfileFavView = lazy(() => import('views/MentorProfiles/MentorProfileFav'));
const BookingDetailsView = lazy(() => import('views/MentorProfiles/BookingDetails'));
const HodegoVideoCallReviewView = lazy(() => import('views/VideocallFeature/HodegoVideoCallReview'));
const TermsOfServiceView = lazy(() => import('views/TermsOfService'));
const PrivacyPolicyView = lazy(() => import('views/PrivacyPolicy'));
const CancelationPolicyView = lazy(() => import('views/CancelationPolicy'));
const NewLandingPageView = lazy(() => import('views/HodegoLandingPage'));
const NewRegistrationFormView = lazy(() => import('views/HodegoRegistrationPage'));
const BlankLoadingPageView = lazy(() => import('views/BlankLoadingPage'));
const CoworkingView = lazy(() => import('views/Coworking'));
const HodegoJoinView = lazy(() => import('views/VideocallFeature/HodegoJoin'));
const DetailedNotification  = lazy(() => import('../layouts/Main/components/Topbar/DetailedNotification/DetailedNotification'));
// import {
//   HodegoJoin as HodegoJoinView,
// } from 'views';

const routes = [
  { path: '/callback', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><BlankLoadingPageView {...params} /></Suspense> },
  { path: '/hodego-registration-form', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><NewRegistrationFormView {...params} /></Suspense> },
  { path: '/account-settings', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><AccountSettingsView {...params} /></Suspense> },
  { path: '/schedule', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><ScheduleView {...params} /></Suspense> },
  { path: '/logout', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><Auth0LogoutView {...params} /></Suspense> },
  { path: '/login', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><Auth0LoginView {...params} /></Suspense> },
  { path: '/explore', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><MentorProfilesView {...params} /></Suspense> },
  { path: '/join', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><NewLandingPageView {...params} /></Suspense> },
  { path: '/about-us', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><AboutView {...params} /></Suspense> },
  // { path: '/:mentorName', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><MentorDetailedView type='direct' userName='' {...params} /></Suspense> },
  { path: '/expert/fav-profiles', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><MentorProfileFavView {...params} /></Suspense> },
  { path: '/terms-of-service', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><TermsOfServiceView {...params} /></Suspense> },
  { path: '/privacy-policy', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><PrivacyPolicyView {...params} /></Suspense> },
  { path: '/cancellation-policy', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><CancelationPolicyView {...params} /></Suspense> },
  { path: '/book-now', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><BookingDetailsView {...params} /></Suspense>, protected: true },
  { path: '/notifications', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><DetailedNotification {...params} /></Suspense>},
  // { path: '/hodego-join', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><HodegoJoinView {...params} /></Suspense>, protected: true },
  {
    path: '/hodego-join',
    renderer: (params = {}): JSX.Element => <HodegoJoinView {...params} />,
  },
  { path: '/hodego-call-review', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><HodegoVideoCallReviewView {...params} /></Suspense> },
  { path: '/', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><CoworkingView {...params} /></Suspense> },
  // ✅ Move /:mentorName below all specific routes so it doesn’t catch everything
  { path: '/expert/:mentorName', renderer: (params = {}) => <Suspense fallback={<div><HodegoLoading/></div>}><MentorDetailedView type='direct' userName='' {...params} /></Suspense> },

  // ✅ 404 Page (must be the last route)
  { path: '*', renderer: () => <Suspense fallback={<div><HodegoLoading/></div>}><NotFound /></Suspense> }
];

export default routes;
