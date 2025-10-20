// src/ProfileCompletionWidget.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse
} from '@mui/material';
import { CheckCircle, Circle, ExpandMore, ExpandLess } from '@mui/icons-material';

interface ProfileCompletionWidgetProps {
  completion: {
    profilePic: boolean;
    basicInfo: boolean;
    stripeIdentity: boolean;
    socialLinks: boolean;
    pricing: boolean,
    availability: boolean;
    payment: boolean;
  };
}

const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({ completion }) => {
  const [expanded, setExpanded] = useState(false);
  const { profilePic,basicInfo, stripeIdentity, socialLinks, pricing, availability, payment } = completion;
  console.log('completion',completion);

  // const calculateCompletionPercentage = () => {
  //   const totalItems = 6;
  //   const completedItems = [basicInfo, stripeIdentity, socialLinks, pricing, availability, payment].filter(item => item).length;
  //   const resultant = (Number(completedItems) / Number(totalItems)) * 100;
  //   return resultant > 0 ? Math.round(resultant) : 0;
  // };
  const calculateCompletionPercentage = () => {
    const totalItems = 7;
    const completedItems = [profilePic,basicInfo, stripeIdentity, socialLinks, pricing, availability, payment].filter(item => item).length;
    return { completedItems, totalItems };
  };

  const handleToggle = () => {
    setExpanded(prev => !prev);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 300,
        padding: 2,
        borderRadius: 2,
        boxShadow: '0 3px 6px 0 rgba(140, 152, 164, 0.25)',
        border:'1px solid #ccc',
        'zIndex':1111
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Account Setup: {calculateCompletionPercentage().completedItems}/{calculateCompletionPercentage().totalItems}</Typography>
        <IconButton onClick={handleToggle} sx={{ cursor: 'pointer' }}>
          {expanded ? <ExpandMore /> : <ExpandLess />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <LinearProgress
          variant="determinate"
          // value={calculateCompletionPercentage()}
          value={(calculateCompletionPercentage().completedItems / calculateCompletionPercentage().totalItems) * 100}
          sx={{ marginY: 2 }}
        />
        <List>
          <ListItem sx={{justifyContent:'space-between'}}>
            {profilePic?
              <ListItemText sx={{'textDecoration':'line-through'}} primary="Upload Profile Pic*" />
              :
              <a style={{textDecoration:'none',color:'#0C6697'}} href={`${window.location.origin}/account-settings?value=editProfile`}><ListItemText primary="Upload Profile Pic*" /></a>
            }
            {profilePic ? <CheckCircle color="success" /> : <Circle color="disabled" />}
          </ListItem>
          <ListItem sx={{justifyContent:'space-between'}}>
            {basicInfo?
              <ListItemText sx={{'textDecoration':'line-through'}} primary="Complete Basic/Profile Info*" />
              :
              <a style={{textDecoration:'none',color:'#0C6697'}} href={`${window.location.origin}/account-settings?value=editProfile`}><ListItemText primary="Complete Basic/Profile Info*" /></a>
            }
            {basicInfo ? <CheckCircle color="success" /> : <Circle color="disabled" />}
          </ListItem>
          <ListItem sx={{justifyContent:'space-between'}}>
            {stripeIdentity?
              <ListItemText sx={{'textDecoration':'line-through'}} primary="Verify Your Identity*" />
              :
              <a style={{textDecoration:'none',color:'#0C6697'}} href={`${window.location.origin}/account-settings?value=hodegoVerify`}><ListItemText primary="Verify Your Identity*" /></a>
            }
            {stripeIdentity ? <CheckCircle color="success" /> : <Circle color="disabled" />}
          </ListItem>
          <ListItem sx={{justifyContent:'space-between'}}>
            {availability?
              <ListItemText sx={{'textDecoration':'line-through'}} primary="Set Your Availability*" />
              :
              <a style={{textDecoration:'none',color:'#0C6697'}} href={`${window.location.origin}/account-settings?value=availability`}><ListItemText primary="Set Your Availability*" /></a>
            }
            {availability ? <CheckCircle color="success" /> : <Circle color="disabled" />}
          </ListItem>
          <ListItem sx={{justifyContent:'space-between'}}>
            {pricing?
              <ListItemText sx={{'textDecoration':'line-through'}} primary="Add Your Pricing*" />
              :
              <a style={{textDecoration:'none',color:'#0C6697'}} href={`${window.location.origin}/account-settings?value=pricing`}><ListItemText primary="Add Your Pricing*" /></a>
            }
            {pricing ? <CheckCircle color="success" /> : <Circle color="disabled" />}
          </ListItem>
          <ListItem sx={{justifyContent:'space-between'}}>
            {socialLinks?
              <ListItemText sx={{'textDecoration':'line-through'}} primary="Add Social Links (Optional)" />
              :
              <a style={{textDecoration:'none',color:'#0C6697'}} href={`${window.location.origin}/account-settings?value=editProfile`}><ListItemText primary="Add Social Links (Optional)" /></a>
            }
            {socialLinks ? <CheckCircle color="success" /> : <Circle color="disabled" />}
          </ListItem>
          <ListItem sx={{justifyContent:'space-between'}}>
            {payment?
              <ListItemText sx={{'textDecoration':'line-through'}} primary="Connect Bank Account (Required for Payouts)" />
              :
              <a style={{textDecoration:'none',color:'#0C6697'}} href={`${window.location.origin}/account-settings?value=payouts`}><ListItemText primary="Connect Bank Account (Required for Payouts)" /></a>
            }
            {payment ? <CheckCircle color="success" /> : <Circle color="disabled" />}
          </ListItem>
        </List>
      </Collapse>
    </Paper>
  );
};

export default ProfileCompletionWidget;
