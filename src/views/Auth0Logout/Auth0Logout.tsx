import { useAuth0 } from '@auth0/auth0-react';

import Main from 'layouts/Main';

const Auth0Logout = (): JSX.Element => {
  const { logout } = useAuth0();
  // localStorage.removeItem('hodego_access_token');
  // localStorage.removeItem('myTimeZone');
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
  logout({
    logoutParams: {
      returnTo: window.location.origin,
    }
  });

  return (
    <Main>
      ...
    </Main>
  );
};

export default Auth0Logout;
