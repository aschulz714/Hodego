const { host, hostname, protocol, port, pathname } = window.location;
// const hodegoUrl = hostname === 'localhost' ? 'http://localhost:3001/' : hostname === 'app-dev.hodego.com' ? 'https://service-dev.hodego.com/' : 'https://service-dev.hodego.com/';
// const auth0Domain = hostname === 'localhost' ? 'dev-11jesnbucfgtvxhw.us.auth0.com' : hostname === 'app-dev.hodego.com' ? 'hodego-dev-auth.us.auth0.com' : 'hodego-dev-auth.us.auth0.com';
// const auth0ClientId = hostname === 'localhost' ? 'vdEI8sIitoLjzlpbEWuHfcTEohbVD6Hm' : hostname === 'app-dev.hodego.com' ? 'jbSRc3k5tymqmmWbTyhpkZnLDNddEsWd' : 'jbSRc3k5tymqmmWbTyhpkZnLDNddEsWd';
// const agoraAppId = 'e41babf6210d4cbe82a1e7c43c7f5e49';
// const stripeKey = 'pk_test_51PM1B7KsmA8HK3Nwza6bETCtil7lWLauFxLdWC21GwpH0jSk591mA2mfyyURO3oeqWzaQuUO7kzY2qmgbqgYe6dQ00n4R4pit4';
const hodegoUrl = process.env.REACT_APP_HODEGO_API_URL;
const auth0Domain = process.env.REACT_APP_AUTH0DOMAIN;
const auth0ClientId = process.env.REACT_APP_AUTH0CLIENTID;
const agoraAppId = process.env.REACT_APP_AGORA_APP_ID;
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISH_KEY;
export default {
  hostname,
  host,
  protocol,
  port,
  pathname,
  hodegoUrl,
  auth0Domain,
  auth0ClientId,
  agoraAppId,
  stripeKey,
};
