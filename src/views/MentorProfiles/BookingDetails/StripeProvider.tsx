// src/StripeProvider.tsx
import React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import siteConfig from '../../../theme/site.config';

const stripePromise = loadStripe(siteConfig.stripeKey); // Replace with your Stripe public key

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({children}) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeProvider;
