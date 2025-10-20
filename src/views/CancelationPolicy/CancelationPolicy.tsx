import React from 'react';
import { Container } from '@mui/material';
import Main from 'layouts/Main';

const CancelationPolicy: React.FC = () => {
  return (
    <Main>
      <Container maxWidth='md' sx={{ padding: 4 }}>
        <h1><strong>Hodego Cancellation and Rescheduling Policy</strong></h1>
        <h2><strong>1. Introduction</strong></h2>
        <span>
            At Hodego, we strive to offer a seamless and enriching experience for both mentors and mentees. 
            However, we understand that plans may change. This Cancellation Policy outlines the terms and 
            conditions under which cancellations and rescheduling are handled.
        </span>
        <h2><strong>2. Cancellation and Rescheduling by Customers (Sports Enthusiasts)</strong></h2>

        <h2><strong>2.1 Cancellations or Rescheduling At Least 24 Hours Before the Session</strong></h2>
        <ul>
          <li>
          You can cancel or reschedule a session up to 24 hours before the scheduled start time and receive a 
          full refund, minus the Stripe processing fee associated with the payment.
          </li>
          <li>
          The processing fee will be automatically deducted, and the remainder will be refunded to your original 
          payment method.
          </li>
        </ul>

        <h2><strong>2.2 Cancellations or Rescheduling Less Than 24 Hours Before the Session</strong></h2>
        <ul>
          <li>
          If you cancel or reschedule a session with less than 24 hours' notice, no refund will be issued, and you 
          will be charged the full session fee.
          </li>
        </ul>

        <h2><strong>2.3 Sessions Priced Above $5,000</strong></h2>
        <ul>
          <li><strong>Customers (Sports Enthusiasts):</strong> For sessions priced above $5,000, you may cancel and receive a refund, minus Stripe fees.</li>
          <li><strong>Sports Experts (Hodegos):</strong> For sessions priced above $5,000, mentors cannot cancel the session and must reschedule it due to the larger Stripe fee involved with payments at or above this session price.</li>
        </ul>

        <ol>
          <h2><strong>3. Cancellation and Rescheduling by Sports Experts (Hodegos)</strong></h2>
        </ol>

        <h2><strong>3.1 Cancellations or Rescheduling by Sports Experts (Hodegos) (Sessions Priced Below $5,000)</strong></h2>
        <ul>
          <li>
          If a Sports Expert (Hodego) cancels a session priced below $5,000, the Customer (Sports Enthusiast) may choose to accept the Sports Expert's reschedule 
          request or receive a full refund.
          </li>
        </ul>

        <h2><strong>3.2 Cancellations or Rescheduling by Sports Experts (Hodegos) (Sessions Priced Above $5,000)</strong></h2>
        <ul>
          <li>
          For sessions priced above $5,000, Sports Experts (Hodegos) cannot cancel the session and must reschedule it up until the time of the session.
          </li>
        </ul>

        <h2><strong>3.3 No-Show by Sports Experts (Hodegos)</strong></h2>
        <ul>
          <li>
          If a Sports Experts (Hodego) does not attend the session and has not canceled in advance, the Customer (Sports Enthusiast) will receive a full refund.
          </li>
        </ul>

        <h2><strong>3.4 Two-Strike Rule for Sports Experts (Hodegos)</strong></h2>
        <ul>
          <li>
          Sports Experts (Hodegos) are allowed two cancellations or no-shows within a 6-month period. After the second cancellation or no-show, 
          the Sports Expert's (Hodego's) account will be suspended for review.
          </li>
          <li>
          The Hodego team will reach out to the Sports Expert (Hodego) to work on potentially reinstating the account after suspension.
          </li>
        </ul>
        <h2><strong>4. Rescheduling Sessions</strong></h2>

        <h2><strong>4.1 Rescheduling by Customers (Sports Enthusiasts)</strong></h2>
        <ul>
          <li>
          Customers (Sports Enthusiasts) are allowed to reschedule a session once, up to 24 hours before the scheduled start time, without any penalty.
          </li>
          <li>
          Rescheduling requests made less than 24 hours before the scheduled start time will be treated as cancellations 
          and subject to the same conditions outlined in sections 2.2 and 2.3.
          </li>
        </ul>

        <h2><strong>4.2 Rescheduling by Sports Experts (Hodegos)</strong></h2>
        <ul>
          <li>
          Sports Experts (Hodegos) can reschedule their sessions up to 24 hours before the scheduled start time without penalty.
          </li>
          <li>
          If a Sports Expert (Hodego) needs to reschedule a session with less than 24 hours' notice, they must provide a valid reason.
          </li>
        </ul>
        <h2><strong>5. Refund Policy</strong></h2>
        <h2><strong>5.1 Eligibility</strong></h2>
        <ul>
          <li>
          Refunds are only available for sessions canceled by the Sports Expert (Hodego) or if the Customer (Sports Enthusiast) cancels within the allowed timeframe.
          </li>
          <li>
          Refunds will be processed within 7-10 business days and credited to the original payment method, facilitated by Stripe, 
          or the Customer's (Sports Enthusiast) Hodego account.
          </li>
        </ul>

        <h2><strong>6. Exceptions</strong></h2>

        <h2><strong>6.1 Extenuating Circumstances</strong></h2>
        <ul>
          <li>
          In cases of emergency or extenuating circumstances, both Sports Experts (Hodegos) and Customers (Sports Enthusiasts) may appeal for a waiver of cancellation fees.
          </li>
          <li>
          Appeals must be submitted in writing to support@hodego.com and will be reviewed on a case-by-case basis.
          </li>
        </ul>

        <h2><strong>7. Amendments to the Cancellation Policy</strong></h2><br />
          Hodego reserves the right to amend this Cancellation Policy at any time. Changes will be communicated to users via email 
          and will take effect immediately upon notification.
         
        <h2><strong>8. Contact Information</strong></h2><br />
          For any questions or concerns regarding this Cancellation Policy, please contact Hodego Support at 
          support@hodego.com.
      </Container>
    </Main>
  );
};

export default CancelationPolicy;
