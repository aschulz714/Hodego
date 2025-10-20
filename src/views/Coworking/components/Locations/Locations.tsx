import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PublicIcon from '@mui/icons-material/Public';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const BenefitsSection = (): JSX.Element => {
  return (
    <Box padding={3}>
      <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>
        Benefits of Using Hodego for Experts and Enthusiasts
      </Typography>
      <Grid container spacing={4}>
        {/* Benefits for Athletic Experts */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={4}
            sx={{
              background: 'linear-gradient(135deg, #73A870 30%, #8DC88F 100%)',
              padding: 2,
              borderRadius: 4,
              border: '1px solid #e0e0e0',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
              transition: 'box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }} gutterBottom>
                Why Become a Hodego Expert?
              </Typography>
              <List>
                {[
                  { icon: <MonetizationOnIcon sx={{ color: '#F1F9F7', transition: 'color 0.3s' }} />, title: 'Monetize Your Expertise', description: 'Turn your athletic knowledge into income, helping you cover training and travel expenses.' },
                  { icon: <ScheduleIcon sx={{ color: '#F1F9F7', transition: 'color 0.3s' }} />, title: 'Flexible Hours', description: 'Offer sessions when it suits your training schedule, giving you complete control over your time.' },
                  { icon: <PublicIcon sx={{ color: '#F1F9F7', transition: 'color 0.3s' }} />, title: 'Connect Globally', description: 'Reach a diverse audience of sports enthusiasts from around the world.' },
                  { icon: <StarIcon sx={{ color: '#F1F9F7', transition: 'color 0.3s' }} />, title: 'Grow Your Personal Brand', description: 'Gain visibility and increase your influence by connecting directly with fans and athletes.' },
                ].map((item, index) => (
                  <ListItem key={index}>
                    <Box display="flex" alignItems="center">
                      {item.icon}
                      <ListItemText
                        primaryTypographyProps={{ fontWeight: 'bold', color: '#FFFFFF' }}
                        primary={item.title}
                        secondary={item.description}
                        secondaryTypographyProps={{ color: '#F1F9F7' }}
                        sx={{ marginLeft: 2 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <Box sx={{ padding: 2 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#DD9D51',
                  color: 'white',
                  padding: '10px 20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': { backgroundColor: '#C68B45' },
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Join Hodego as an Expert Today
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Benefits for Sports Enthusiasts */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={4}
            sx={{
              background: 'linear-gradient(135deg, #0C6697 30%, #0F81B3 100%)',
              padding: 2,
              borderRadius: 4,
              border: '1px solid #e0e0e0',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
              transition: 'box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }} gutterBottom>
                Why Book Sessions on Hodego?
              </Typography>
              <List>
                {[
                  { icon: <PersonIcon sx={{ color: '#F1F9F7', transition: 'color 0.3s' }} />, title: 'Direct Access to Top Experts', description: 'Get 1:1 access to athletic experts that might otherwise be out of reach.' },
                  { icon: <FitnessCenterIcon sx={{ color: '#F1F9F7', transition: 'color 0.3s' }} />, title: 'Personalized Training and Guidance', description: 'Tailor sessions to fit your specific needs—improve your form, plan workouts, or ask burning questions.' },
                  { icon: <CalendarTodayIcon sx={{ color: '#F1F9F7', transition: 'color 0.3s' }} />, title: 'Flexible Scheduling', description: 'Choose a session length, from 15-60 minutes, that works for you.' },
                  { icon: <EmojiEventsIcon sx={{ color: '#F1F9F7', transition: 'color 0.3s' }} />, title: 'Achieve Your Goals', description: 'Gain expert advice to improve skills, refine techniques, and achieve your personal athletic objectives.' },
                ].map((item, index) => (
                  <ListItem key={index}>
                    <Box display="flex" alignItems="center">
                      {item.icon}
                      <ListItemText
                        primaryTypographyProps={{ fontWeight: 'bold', color: '#FFFFFF' }}
                        primary={item.title}
                        secondary={item.description}
                        secondaryTypographyProps={{ color: '#F1F9F7' }}
                        sx={{ marginLeft: 2 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <Box sx={{ padding: 2 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#DD9D51',
                  color: 'white',
                  padding: '10px 20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': { backgroundColor: '#C68B45' },
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Find Your Expert and Book a Session
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BenefitsSection;
