import React from 'react';
import { createRoot } from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import App from './App';
import siteConfig from './theme/site.config';

const root = createRoot(document.getElementById('root'));
root.render(<Auth0Provider 
  domain={siteConfig.auth0Domain}
  clientId={siteConfig.auth0ClientId}
  cacheLocation="localstorage" // Use localStorage to persist authentication across browser sessions
  useRefreshTokens={true} // Use refresh tokens for renewal
  authorizationParams={{ redirect_uri: `${window.location.origin}/callback`,audience:`https://${siteConfig.auth0Domain}/api/v2/`,scope: 'openid profile email offline_access'}}>
  <App />
</Auth0Provider>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
serviceWorkerRegistration.register();
reportWebVitals();
