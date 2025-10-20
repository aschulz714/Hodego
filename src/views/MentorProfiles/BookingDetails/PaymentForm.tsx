// src/components/PaymentForm.tsx
import React, {useState} from 'react';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import {TextField, Button, CircularProgress, Box} from '@mui/material';
import { getData } from '../../../theme/Axios/apiService';
import siteConfig from '../../../theme/site.config';

interface PaymentFormProps {
  clientSecret: string;
  requestStatus: string;
  id: number;
  status: string;
  handleBookNow: (intentId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({clientSecret,requestStatus,id,status,handleBookNow}) => {
  const stripe = useStripe();
  const elements = useElements();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    const statusResponse = await getData(`${siteConfig.hodegoUrl}mentor/booking/${id}/status`);
    if (statusResponse.data.status) {
      const cardElement = elements.getElement(CardElement);

      if (cardElement) {
        const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name,
            },
          },
        });

        if (error) {
          setError(error.message || 'Payment failed');
        } else if (paymentIntent && paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
          setError(null);
          setPaymentStatus(true);
          handleBookNow(paymentIntent.id);
        }
        
        setLoading(false);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handlePayment} sx={{width: '100%',margin: 'auto',textAlign:'center'}}>
      <TextField
        label="Name on Card"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        sx={{marginBottom: 2}}
      />
      <Box sx={{border: '1px solid rgba(0, 0, 0, 0.23)', padding: 2, borderRadius: 1, marginBottom: 2}}>
        <CardElement />
      </Box>
      {error && (
        <Box sx={{color: 'red', marginBottom: 2}}>
          {error}
        </Box>
      )}
      <Button
        variant="contained"
        color="primary"
        type="submit"
        sx={{ 
          height: '50px', 
          width: isMobile?'100%':'200px', 
          color: 'white', 
          backgroundColor: '#000',
          '&:hover': {
            backgroundColor: '#000'
          }
        }}
        disabled={!stripe || loading || paymentStatus == true || status != ''}
      >
        {loading ? <CircularProgress size={24} /> : requestStatus == '1'?'Request to Book':'Book Now'}
      </Button>
    </Box>
  );
};

export default PaymentForm;
