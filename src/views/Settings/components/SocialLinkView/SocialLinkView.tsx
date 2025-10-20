import React, { useState, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import axios from 'axios';
import siteConfig from '../../../../theme/site.config';
import InputAdornment from '@mui/material/InputAdornment';
import { Instagram, X, LinkedIn, YouTube } from '@mui/icons-material';

interface SocialLinksProps {
  socialLinks: {
    instagram: string;
    twitter: string;
    linkedIn: string;
    youtube: string;
    web: string;
  };
  getProfileStrength: () => any;
}

const SocialLinkView: React.FC<SocialLinksProps> = ({ socialLinks,getProfileStrength }) => {
  const [instagram, setInstagram] = useState('');
  const [web, setWeb] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [youtube, setYoutube] = useState('');

  const [instagramError, setInstagramError] = useState(false);
  const [instagramHelperText, setInstagramHelperText] = useState('');

  const [twitterError, setTwitterError] = useState(false);
  const [twitterHelperText, setTwitterHelperText] = useState('');

  const [linkedInError, setLinkedInError] = useState(false);
  const [linkedInHelperText, setLinkedInHelperText] = useState('');

  const [youtubeError, setYoutubeError] = useState(false);
  const [youtubeHelperText, setYoutubeHelperText] = useState('');

  // const [webError, setWebError] = useState(false);
  // const [webHelperText, setWebHelperText] = useState('');

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    setInstagram(socialLinks.instagram || '');
    setWeb(socialLinks.web || '');
    setTwitter(socialLinks.twitter || '');
    setLinkedIn(socialLinks.linkedIn || '');
    setYoutube(socialLinks.youtube || '');
  }, [socialLinks]);

  const validateInstagramInput = (input: string): boolean => {
    // const urlRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}$/;
    const urlRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}(\/\?.*)?$/;
    const idRegex = /^[a-zA-Z0-9._]{1,30}$/;
    return urlRegex.test(input) || idRegex.test(input);
  };
  
  const validateTwitterInput = (input: string): boolean => {
    // const urlRegex = /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/[a-zA-Z0-9_]{1,15}$/;
    const urlRegex = /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/[a-zA-Z0-9._]{1,30}(\/\?.*)?$/;
    const idRegex = /^[a-zA-Z0-9_]{1,30}$/;
    return urlRegex.test(input) || idRegex.test(input);
  };

  const validateLinkedInURL = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url.includes('://') ? url : `https://${url}`);
      return parsedUrl.hostname.toLowerCase().includes('linkedin.com');
    } catch (e) {
      return false;
    }
  };

  const validateYouTubeURL = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url.includes('://') ? url : `https://${url}`);
      const hostname = parsedUrl.hostname.toLowerCase();
      return hostname.includes('youtube.com') || hostname.includes('youtu.be');
    } catch (e) {
      return false;
    }
  };

  // const validateWebURL = (url: string): boolean => {
  //   try {
  //     new URL(url.includes('://') ? url : `https://${url}`);
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // };

  const handleUpdate = async () => {
    let valid = true;

    if (instagram && !validateInstagramInput(instagram)) {
      setInstagramError(true);
      setInstagramHelperText('Invalid Instagram URL or ID');
      valid = false;
    } else {
      setInstagramError(false);
      setInstagramHelperText('');
    }

    if (twitter && !validateTwitterInput(twitter)) {
      setTwitterError(true);
      setTwitterHelperText('Invalid Twitter URL or ID');
      valid = false;
    } else {
      setTwitterError(false);
      setTwitterHelperText('');
    }

    if (linkedIn && !validateLinkedInURL(linkedIn)) {
      setLinkedInError(true);
      setLinkedInHelperText('Invalid LinkedIn URL');
      valid = false;
    } else {
      setLinkedInError(false);
      setLinkedInHelperText('');
    }

    if (youtube && !validateYouTubeURL(youtube)) {
      setYoutubeError(true);
      setYoutubeHelperText('Invalid YouTube URL');
      valid = false;
    } else {
      setYoutubeError(false);
      setYoutubeHelperText('');
    }

    // if (web && !validateWebURL(web)) {
    //   setWebError(true);
    //   setWebHelperText('Invalid Website URL');
    //   valid = false;
    // } else {
    //   setWebError(false);
    //   setWebHelperText('');
    // }

    if (!valid) {
      return;
    }

    const formData = {
      socialLinks: {
        instagram: instagram,
        web: web,
        twitter: twitter,
        linkedIn: linkedIn,
        youtube: youtube,
      },
    };
    const get_access_token = localStorage.getItem('hodego_access_token');
    axios
      .put(`${siteConfig.hodegoUrl}user/${userId}`, formData, {
        headers: {
          hodego_access_token: get_access_token,
        },
      })
      .then((response) => {
        if (response.data) {
          console.log(response.data);
          getProfileStrength();
          setSnackbarOpen(true);
        }
      })
      .catch((error) => {
        console.log('Error fetching data', error);
      });
  };

  return (
    <Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mb: '4%', ml: '6%' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Updated Successfully!
        </Alert>
      </Snackbar>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TextField
            label="Instagram URL or ID"
            id="instagram"
            name="instagram"
            value={instagram}
            onChange={(e) => {
              setInstagram(e.target.value);
              if (e.target.value && !validateInstagramInput(e.target.value)) {
                setInstagramError(true);
                setInstagramHelperText('Invalid Instagram URL or ID');
              } else {
                setInstagramError(false);
                setInstagramHelperText('');
              }
            }}
            error={instagramError}
            helperText={instagramHelperText}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Instagram />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="X (Twitter) URL or ID"
            id="twitter"
            name="twitter"
            value={twitter}
            onChange={(e) => {
              setTwitter(e.target.value);
              if (e.target.value && !validateTwitterInput(e.target.value)) {
                setTwitterError(true);
                setTwitterHelperText('Invalid Twitter URL or ID');
              } else {
                setTwitterError(false);
                setTwitterHelperText('');
              }
            }}
            error={twitterError}
            helperText={twitterHelperText}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <X />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="LinkedIn URL"
            id="linkedin"
            name="linkedin"
            value={linkedIn}
            onChange={(e) => {
              setLinkedIn(e.target.value);
              if (e.target.value && !validateLinkedInURL(e.target.value)) {
                setLinkedInError(true);
                setLinkedInHelperText('Invalid LinkedIn URL');
              } else {
                setLinkedInError(false);
                setLinkedInHelperText('');
              }
            }}
            error={linkedInError}
            helperText={linkedInHelperText}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkedIn />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="YouTube URL"
            id="youtube"
            name="youtube"
            value={youtube}
            onChange={(e) => {
              setYoutube(e.target.value);
              if (e.target.value && !validateYouTubeURL(e.target.value)) {
                setYoutubeError(true);
                setYoutubeHelperText('Invalid YouTube URL');
              } else {
                setYoutubeError(false);
                setYoutubeHelperText('');
              }
            }}
            error={youtubeError}
            helperText={youtubeHelperText}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <YouTube />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {/* <Grid item xs={12}>
          <TextField
            label="Website URL"
            id="web"
            name="web"
            value={web}
            onChange={(e) => {
              setWeb(e.target.value);
              if (e.target.value && !validateWebURL(e.target.value)) {
                setWebError(true);
                setWebHelperText('Invalid Website URL');
              } else {
                setWebError(false);
                setWebHelperText('');
              }
            }}
            error={webError}
            helperText={webHelperText}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Web />
                </InputAdornment>
              ),
            }}
          />
        </Grid> */}
        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            type="submit"
            sx={{ background: 'linear-gradient(90deg, #0C6697, #73A870)' }}
            color="primary"
            onClick={handleUpdate}
            size="large"
          >
            Update
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SocialLinkView;