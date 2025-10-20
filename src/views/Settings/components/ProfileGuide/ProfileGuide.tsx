import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  Edit as EditIcon,
  Verified as VerifiedIcon, 
  EventAvailable as EventAvailableIcon, 
  Settings as SettingsIcon,
  Link as LinkIcon, 
  Schedule as ScheduleIcon,
  AccountBalance as AccountBalanceIcon,
  HelpCenter as HelpCenterIcon,
} from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
const sections = [
  {
    title: 'Profile Setup',
    description: 'Instructions for the Personal Info Tab',
    icon: <EditIcon />, 
    details: [
      { key: 'Profile Picture', text: 'Upload a professional, high-quality photo.' },
      { key: 'Name', text: 'Enter your first and last name as you want it to appear on your profile.' },
      { key: 'Mobile Number', text: 'Input for verification purposes; it won’t be displayed publicly.' },
      { key: 'Email', text: 'Used for notifications related to sessions, bookings, and payments.' },
      { key: 'Language', text: 'Choose the languages in which you’re comfortable conducting sessions.' },
      { key: 'Country', text: 'Indicate your primary location.' },
      { key: 'Sport', text: 'Select the main sport you coach or consult on.' },
      { key: 'Additional Sports', text: 'Add other sports if qualified in multiple areas.' },
      { key: 'Headline', text: 'Create a compelling headline to summarize your role or expertise.' },
      { key: 'Bio', text: 'Describe your experience and skills, mentioning highlights, specialties, etc.' },
    ],
  },
  {
    title: 'Verify ID',
    description: 'Verify Your Identity Using Stripe Identity',
    icon: <VerifiedIcon />, 
    details: [
      { key: 'Required Documents', text: 'Government-issued ID (e.g., passport, driver’s license).' },
      { key: 'Step-by-Step Process', text: 'Upload your ID, take a live selfie (if prompted), and complete the verification.' },
      { key: 'Privacy and Security', text: 'Stripe securely handles your data for verification purposes only.' },
    ],
  },
  {
    title: 'Availability',
    description: 'Manage Your Schedule',
    icon: <EventAvailableIcon />,
    details: [
      { 
        key: 'Select Your Time Zone', 
        text: 'Defaulted to your browser’s time zone. Update if needed to ensure accurate scheduling.'
      },
      { 
        key: 'Instant Booking Toggle', 
        text: 'Manage how session requests are approved.\n' +
              '- ON: Users can instantly book open time slots without requiring approval.\n' +
              '- OFF: Session requests require your approval before being added to the calendar.\n' +
              '- Requests will *expire after 72 hours* if no action is taken.'
      },
      { 
        key: 'Same-Day Booking Toggle', 
        text: 'Control availability for same-day bookings.\n' +
              '- ON: Allows users to request sessions on the same day.\n' +
              '- Same-day requests appear in your *Pending Bookings* tab and require approval.\n' +
              '- No session times will display less than *3 hours* before the session start time.'
      },
      { 
        key: 'List View and Calendar View', 
        text: 'Organize and customize your availability.\n' +
              '- List View: Manage your weekly availability in a clear list format.\n' +
              '- Calendar View: Add or adjust date-specific hours with a calendar-based interface.'
      },
    ],
  },
  {
    title: 'Pricing',
    description: 'Configure Your Pricing and Session Lengths',
    icon: <SettingsIcon />, 
    details: [
      { key: 'Enable Session Lengths', text: 'Select desired session lengths to offer.' },
      { key: 'Set Pricing for Each Length', text: 'Enter rates for each duration.' },
      { key: 'Platform Fee', text: 'Hodego retains 20%, and you receive 80% of net earnings.' },
    ],
  },
  {
    title: 'Social Links (Optional)',
    description: 'Add Your Social Media Profiles',
    icon: <LinkIcon />, 
    details: [
      { key: 'Enter Social Media URLs', text: 'Instagram, Twitter, LinkedIn, YouTube.' },
      { key: 'Ensure URLs are Accurate', text: 'Verify links start with "https://www.".' },
    ],
  },
  {
    title: 'Bookings',
    description: 'View Upcoming, Pending and Completed Sessions',
    icon: <ScheduleIcon />, 
    details: [
      { key: 'Upcoming', text: 'View confirmed sessions, including details and join links.' },
      { key: 'Pending', text: 'Review and accept or decline booking requests.' },
      { key: 'History', text: 'Contains records of past sessions, both completed and cancelled.' },
    ],
  },
  {
    title: 'Payouts',
    description: 'Connect Your Bank Account for Secure Payouts with Stripe',
    icon: <AccountBalanceIcon />, 
    details: [
      { key: 'Start Setup', text: 'Go to the Payouts tab and click "Connect Your Bank Account".' },
      { key: 'Provide Business and Personal Details', text: 'Enter your country, business type (individual), website (hodego.com) and personal information.' },
      { key: 'Payout Timing', text: 'Payouts are processed within 7 days of session completion.' },
    ],
  },
  {
    title: 'Questions',
    description: 'Contact Support',
    icon: <HelpCenterIcon />, 
    details: [
      { key: 'Support', text: 'support@hodego.com.' },
    ],
  },
];

const AccordionComponent = (): JSX.Element => {

  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Box>
      <Box
        sx={{
          mb: 6,
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.8), rgba(240, 240, 240, 0.5))',
          //   boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.1)',
          //   borderRadius: '16px',
          padding: 4,
        }}
      >
        <Typography variant='h6' gutterBottom sx={{ color: '#73A870', textAlign: 'left', fontWeight: 'bold',mb:2 }}>
          Hodego User Guide
        </Typography>
        {sections.map(({ title, description, icon, details }) => (
          <Accordion key={title} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'rgba(12, 102, 151, 0.05)',
                // '&:hover': {
                //   backgroundColor: 'rgba(12, 102, 151, 0.1)',
                //   transform: 'scale(1.01)',
                //   transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                // },
                '&:hover': {
                  backgroundColor: 'rgba(12, 102, 151, 0.05)', // Maintain the same color on hover
                  boxShadow: 'none', // Remove shadow on hover
                  transform: 'scale(1.0111)',
                  transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                },
                borderRadius: '8px',
                paddingLeft: 2,
                fontSize: '1.1rem', 
              }}>
              <Typography sx={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                {icon} <strong style={{ marginLeft: '8px' }}>{title}</strong>:
                {!isMobile && <span style={{ marginLeft: '8px' }}>{description}</span>} {/* Show description next to title on larger screens */}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {isMobile && (
                <Typography sx={{ mb: 2, color: '#73A870', textAlign: 'left' }}>
                  {description}
                </Typography>
              )}
              <Box component='ul' sx={{ listStyleType: 'disc', pl: 4 }}>
                {details.map(({ key, text }) => (
                  <Box component='li' key={key} sx={{ mb: 2, textAlign: 'left' }}>
                    <Typography>
                      <strong>{key}:</strong>
                    </Typography>
                    {text.split('\n').map((line, index) => {
                      if (line.startsWith('-')) {
                        return (
                          <Box component="ul" key={index} sx={{ listStyleType: 'circle', pl: 4 }}>
                            <li>{line.replace('- ', '')}</li>
                          </Box>
                        );
                      }
                      return (
                        <Typography key={index} component="span" sx={{ display: 'block' }}>
                          {line}
                        </Typography>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default AccordionComponent;
