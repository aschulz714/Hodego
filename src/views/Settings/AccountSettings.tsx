import React, { useEffect, useState } from 'react';
import { Slider,List,ListItem,ListItemText,ListItemIcon, Box, Typography, Tooltip, Tabs, Tab,Button, IconButton, Avatar,TextField,Checkbox,DialogContentText, Grid, Select,Popover, MenuItem, FormControl, InputLabel, Alert, Snackbar } from '@mui/material';
import Main from 'layouts/Main';
import { Circle } from '@mui/icons-material';
import { useLocation,useNavigate } from 'react-router-dom';
import Schedule from '../Availability';
// import SocialLinkView from './components/SocialLinkView';
// import ReactDOM from 'react-dom';
import Badge from '@mui/material/Badge';
import ManageBooking from './components/ManageBooking';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditIcon from '@mui/icons-material/Edit';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth0 } from '@auth0/auth0-react';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
// import LinkIcon from '@mui/icons-material/Link';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Chip,OutlinedInput } from '@mui/material';
import HodegoFavicon from '../../assets/images/hodegoFavicon.png';
import Cropper from 'react-easy-crop';
import CircularProgress from '@mui/material/CircularProgress';
import CancelIcon from '@mui/icons-material/Cancel';
import './AccountSettings.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MentorDetailPage from '../MentorProfiles/MentorDetailed/MentorDetailed';
import ProfileCompletionWidget from './ProfileCompletionWidget';
import axios from 'axios';
import { ListSubheader } from '@mui/material';

import ShareIcon from '@mui/icons-material/Share';
import { getData,postData,deleteData} from '../../theme/Axios/apiService';
import hodegoAiHelp from '../../assets/images/aiTechnology.png';
import queryString from 'query-string';
import siteConfig from '../../theme/site.config';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import StripeIdentity from './components/StripeIdentity';
import MentorSession from './components/MentorSession';
import MentorPayment from './components/MentorPayment';
import ProfileGuide from './components/ProfileGuide';
import InputAdornment from '@mui/material/InputAdornment';
import { Instagram, X, LinkedIn, YouTube } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SyncCalendar from './components/SyncCalendar';
import DashboardAnalytics from './components/DashboardAnalytics';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// Define the custom AI button
console.log('updated on: 26/02/25 12:15');
class CustomAIButton {
  quill;
  currentStep = 0;
  questions = [
    {
      prompt: 'What are your most notable achievements or milestones in your sports career? (1 of 5)',
      placeholder: 'E.g., Olympic-level swimmer with 20 international medals and a world championship finalist.'
    },
    {
      prompt: 'Tell us more about your background including primary sport, any certifications, or other relevant details (2 of 5)',
      placeholder: 'E.g., I’ve competed in 50+ international cycling races, including UCI World Tour events, and am certified in sports performance coaching.'
    },
    {
      prompt: 'Describe your coaching style. What should people expect in your sessions? Who are your sessions intended for? (3 of 5) ',
      placeholder: 'E.g., My coaching is highly personalized, blending technical analysis and mental strategies to help athletes reach their full potential. My sessions are intended for experienced athletes.'
    },
    {
      prompt: 'What types of coaching services would you like to offer on Hodego? (e.g., ongoing coaching, Q&A sessions, video analysis, live match support, specific skill training) (4 of 5)',
      placeholder: 'E.g., My services include tactical game preparation, fitness and conditioning plans, and comprehensive strategy sessions tailored to your competition schedule.'
    },
    {
      prompt: 'What hobbies, interests, or fun facts about you might help others connect with you on a personal level? (5 of 5)',
      placeholder: 'E.g., Outside of basketball, I’m passionate about photography and traveling to explore cultures around the world, which keeps me inspired.'
    }
  ];
  answers = [];
  latestResponse = '';
  constructor(quill, options) {
    console.log(options);
    this.quill = quill;

    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      const button = toolbar.container.querySelector('.ql-ai-button');
      if (button) {
        const iconContainer = document.createElement('div');
        button.appendChild(iconContainer);

        const imgElement = document.createElement('img');
        imgElement.src = hodegoAiHelp;
        imgElement.alt = 'AI Help';
        imgElement.style.width = '20px';
        imgElement.style.height = '20px';
        imgElement.style.cursor = 'pointer';
        imgElement.title = 'Generate AI-powered bio';
        iconContainer.appendChild(imgElement);

        button.addEventListener('click', this.handleClick.bind(this));
      }
    }
  }

  async handleClick() {
    const editorContainer = this.quill.container;

    if (editorContainer.querySelector('.ai-dialog')) return;

    const dialog = document.createElement('div');
    dialog.className = 'ai-dialog';
    dialog.innerHTML = `
      <div class="ai-dialog-header" style="font-family: 'Bliss Regular';font-size: 14px;margin-top:-6%">Generate Your Bio and Showcase Your Expertise</div>
      <div class="ai-dialog-body">
        <div id="ai-question" style="font-size: 16px; color:#0C6697;">
          ${this.questions[this.currentStep].prompt}
        </div>
        <textarea id="ai-answer" placeholder="${this.questions[this.currentStep].placeholder}" style="; height: '150px !important';font-size: 16px;margin-top:3%"></textarea>
        <div id="ai-loading" style="display: none; margin-top: 10px;">
          <div class="spinner"></div>
        </div>
        <div id="ai-response" style="display: none; margin-top: 10px; max-height: 200px; overflow-y: auto;"></div>
        <div class="ai-dialog-footer">
          <button id="ai-back" disabled style="color: lightgray;">Back</button>
          <button id="ai-next" style="color: white;">Next</button>
          <button id="ai-generate" disabled style="background: lightgray; color: white;">Generate</button>
          <button id="ai-cancel">Cancel</button>
          <button id="ai-insert" style="display: none;">Insert</button>
        </div>
      </div>
    `;

    editorContainer.appendChild(dialog);

    const backButton = dialog.querySelector('#ai-back') as HTMLButtonElement;
    const nextButton = dialog.querySelector('#ai-next') as HTMLButtonElement;
    const generateButton = dialog.querySelector('#ai-generate') as HTMLButtonElement;
    const cancelButton = dialog.querySelector('#ai-cancel') as HTMLButtonElement;
    const insertButton = dialog.querySelector('#ai-insert') as HTMLButtonElement;
    const questionContainer = dialog.querySelector('#ai-question') as HTMLElement;
    const answerInput = dialog.querySelector('#ai-answer') as HTMLTextAreaElement;
    const responseContainer = dialog.querySelector('#ai-response') as HTMLElement;
    const loadingIndicator = dialog.querySelector('#ai-loading') as HTMLElement;

    // Style the text area
    answerInput.style.width = '100%';
    answerInput.style.height = '100px';
    answerInput.style.marginBottom = '20px';

    const resetDialog = () => {
      this.currentStep = 0;
      this.answers = [];
      updateDialog();
    };

    const updateDialog = () => {
      questionContainer.textContent = this.questions[this.currentStep].prompt;
      questionContainer.style.fontFamily = 'Bliss Regular';
      questionContainer.style.fontSize = '16px';
      questionContainer.style.fontWeight = 'bold';
      questionContainer.style.marginBottom = '2%';

      answerInput.placeholder = this.questions[this.currentStep].placeholder;
      answerInput.style.fontFamily = 'Bliss Regular';
      answerInput.style.fontSize = '16px';
      answerInput.value = this.answers[this.currentStep] || '';
      backButton.disabled = this.currentStep === 0;
      backButton.style.color = backButton.disabled ? 'lightgray' : 'black';
      nextButton.disabled = !answerInput.value.trim() || this.currentStep === this.questions.length - 1;
      nextButton.style.background = nextButton.disabled ? 'lightgray' : 'linear-gradient( #73A870, #0C6697)';
      generateButton.disabled = !(this.currentStep === this.questions.length - 1 && answerInput.value.trim());
      generateButton.style.background = generateButton.disabled
        ? 'lightgray'
        : 'linear-gradient( #73A870, #0C6697)';
    };

    backButton.addEventListener('click', () => {
      this.answers[this.currentStep] = answerInput.value;
      this.currentStep -= 1;
      updateDialog();
    });

    nextButton.addEventListener('click', () => {
      this.answers[this.currentStep] = answerInput.value;
      if (this.currentStep < this.questions.length - 1) {
        this.currentStep += 1;
        updateDialog();
      }
    });

    generateButton.addEventListener('click', async () => {
      loadingIndicator.style.display = 'block';
      responseContainer.style.display = 'none';
      responseContainer.innerHTML = '';

      try {
        const payload = {
          type: 'QnA',
          data: this.questions.map((question, index) => ({
            question: question.prompt,
            answer: this.answers[index]
          }))
        };

        const response = await postData(payload, `${siteConfig.hodegoUrl}mentor/info/generate-ai`);
        if (response && response.data && response.data.res) {
          this.latestResponse = response.data.res; // Store the latest response
          responseContainer.style.display = 'block';
          responseContainer.style.whiteSpace = 'pre-wrap';
          responseContainer.innerHTML = response.data.res;

          insertButton.style.display = 'inline-block';

          insertButton.onclick = () => {
            this.quill.clipboard.dangerouslyPasteHTML(this.latestResponse);
            dialog.remove();
          };
        }
      } catch (error) {
        responseContainer.style.display = 'block';
        responseContainer.innerHTML = 'Failed to generate content. Please try again.';
      } finally {
        loadingIndicator.style.display = 'none';
      }
    });

    cancelButton.addEventListener('click', () => {
      dialog.remove();
      resetDialog();
    });

    answerInput.addEventListener('input', () => {
      nextButton.disabled = !answerInput.value.trim() || this.currentStep === this.questions.length - 1;
      nextButton.style.background = nextButton.disabled ? 'lightgray' : 'linear-gradient(#73A870, #0C6697)';
      generateButton.disabled = !(this.currentStep === this.questions.length - 1 && answerInput.value.trim());
      generateButton.style.background = generateButton.disabled
        ? 'lightgray'
        : 'linear-gradient(#73A870, #0C6697)';
    });

    updateDialog();
  }
}

Quill.register('modules/customAIButton', CustomAIButton);


const modules = {
  toolbar: {
    container: [ // Keep toolbar buttons structured properly
      ['ai-button'],
      [{ 'font': ['sans-serif'] }],
      [{ size: ['normal'] }], // Restrict size to Normal
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link'],
      ['clean'],

    ],
    handlers: {
      clean: function () {
        const range = this.quill.getSelection();
        if (range) {
          this.quill.removeFormat(range.index, range.length);
        }
      }
    }
  },
  customAIButton: true,
  keyboard: {
    bindings: {
      handleEnter: {
        key: 13, // Enter key
        handler: function (range, context) {
          if (context.offset === 0) {
            this.quill.insertText(range.index, '\n');
          }
          this.quill.insertText(range.index, '\n');
          this.quill.setSelection(range.index + 1, null); // Use null instead of Quill.sources.SILENT
        }
      }
    }
  }
};
const CustomTxButton = () => {
  const button = document.createElement('button');
  button.innerHTML = 'Tx';
  button.setAttribute('title', 'Toggle bold formatting for the selected text'); // Tooltip
  button.classList.add('ql-Tx');

  button.onclick = function () {
    const quill = Quill.find(document.querySelector('.ql-container'));
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.formatText(range.index, range.length, { bold: !quill.getFormat(range).bold });
      }
    }
  };

  return button;
};

// Register the button in Quill
Quill.register('modules/customTxButton', CustomTxButton);

// Add clean functionality and tooltip
modules.toolbar.handlers = {
  clean: function () {
    const range = this.quill.getSelection();
    if (range) {
      // Remove all formatting in the selected range
      this.quill.removeFormat(range.index, range.length);
    }
  }
};

// Add tooltip dynamically on hover
document.addEventListener('mouseover', (event) => {
  const cleanButton = document.querySelector('.ql-clean');
  if (event.target === cleanButton && !cleanButton.getAttribute('title')) {
    cleanButton.setAttribute('title', 'Clear all formatting from the selected text');
  }
});
document.addEventListener('mouseover', () => {
  const toolButtons = document.querySelectorAll('.ql-toolbar button, .ql-toolbar select');

  toolButtons.forEach((button) => {
    if (!button.getAttribute('title')) {
      const buttonClass = button.classList[0]; // Get the first class name

      const tooltips = {
        'ql-bold': 'Bold the selected text. Click to toggle bold or press Ctrl + B',
        'ql-italic': 'Italicize the selected text. Click to toggle italic or press Ctrl + I',
        'ql-underline': 'Underline the selected text. Click to toggle underline or press Ctrl + U',
        'ql-strike': 'Strikethrough the selected text. Click to toggle strikethrough',
        'ql-blockquote': 'Format the text as a blockquote',
        'ql-list': 'Create an ordered (numbered) or unordered (bulleted) list',
        'ql-indent': 'Increase or decrease text indentation',
        'ql-link': 'Insert or edit a hyperlink in the text',
        'ql-clean': 'Remove all formatting from the selected text',
        'ql-Tx': 'Toggle bold formatting for the selected text',
        'ql-font':'Default font family is sans-serif set for all bios.',
        'ql-size':'Default font size is Normal.',
      };
      if (button.tagName === 'SELECT' && button.classList.contains('ql-header')) {
        button.setAttribute('title', 'H1 and H2 are disabled for bio formatting');
      } else if (tooltips[buttonClass]) {
        button.setAttribute('title', tooltips[buttonClass]);
      }
    }
  });
});



const AccountSettings = () => {
  const { logout } = useAuth0();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const location = useLocation();
  const navigate = useNavigate();
  const queries = queryString.parse(location.search);
  const initialTabValue = queries.value ? queries.value : 0;
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');
  const [value, setValue] = useState(initialTabValue);
  const [newValue, setNewValue] = useState(0);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [tempProfilePicture, setTempProfilePicture] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTimeZone, setSelectedTimeZone] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState('');
  const [stripeStatus, setStripeStatus] = useState('');
  const [isVerified, setIsVerified] = useState(0);
  const [defaultlanguages, setDefaultLanguages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [defaultcountries, setDefaultcountries] = useState([]);
  const [defaultsports, setDefaultsports] = useState([]);
  const [defaultTimeZone, setDefaultTimeZone] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  // const [showWarning, setShowWarning] = useState<boolean>(false);
  const [specification, setSpecification] = useState('');
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  // const [specialities, setSpecialities] = useState('');
  const [careerHighlights, setCareerHighlights] = useState('');
  const [completion,setCompletion] = useState({
    profilePic:false,
    basicInfo: false,
    stripeIdentity: false,
    socialLinks: false,
    pricing: false,
    availability: false,
    payment: false,
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deletionSuccessStatus,setDeletionSuccessStatus] = useState<string | null>(null);
  const [openImageValidationSnackbar,setOpenImageValidationSnackbar] = useState(false);
  const [deleteSuccessSnackbar,setDeleteSuccessSnackbar] = useState(false);
  const [shortBio,setShortBio] = useState('');
  const [shortBioMobile,setShortBioMobile] = useState('');
  const [bio, setBio] = useState('');
  const [bioMobile, setBioMobile] = useState('');
  const [profileData, setProfileData] = useState({firstName: '', lastName: '', bio:'',shortBio:'',profilePicture: null,email:'',phone: '',title: '',selectedLanguage:[],selectedSpecialities:[],selectedAddSport:[],selectedSport:'',selectedCountry:'',selectedTimeZone:'',selectedInterest:[]});
  const [sessionData, setSessionData] = useState(false);
  const [unSavedOpen, setUnSavedOpen] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(false);
  const [mentorId, setMentorId] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedAddSport, setSelectedAddSport] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState([]);
  const [socialLinks, setSocialLinks] = useState({'instagram':'','twitter':'','linkedIn':'','web':'','youtube':''});
  const [anchorEl, setAnchorEl] = useState(null);
  const [isVerifiedOnTab, setIsVerifiedOnTab] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [missingFieldsDialog, setMissingFieldsDialog] = useState(false);
  const [pendingFields, setPendingFields] = useState<{ name: string; url: string }[]>([]);
  const [isProfileLive,setIsProfileLive] = useState(false);
  const [snackbarOpenPublish, setSnackbarOpenPublish] = useState(false);
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
  const [bioUpdateStatus, setBioUpdateStatus] = useState(false);
  const [youtubeError, setYoutubeError] = useState(false);
  const [youtubeHelperText, setYoutubeHelperText] = useState('');
  const [openShare, setOpenShare] = useState(false);
  const [copyNotificationOpen, setCopyNotificationOpen] = useState(false);
  const [mandatoryCompleteDialog, setMandatoryCompleteDialog] = useState(false);
  const [bioError, setBioError] = useState(false);
  const [bioHelperText, setBioHelperText] = useState('');
  const [accountStatus,setAccountStatus] = useState('');
  const [ageStatus, setAgeStatus] = useState('');

  // const [firstNameError, setFirstNameError] = useState(false);
  // const [firstNameHelperText, setFirstNameHelperText] = useState('');
  // const [lastNameError, setLastNameError] = useState(false);
  // const [lastNameHelperText, setLastNameHelperText] = useState('');
  // const [under18, setUnder18] = useState(false);
  const [childFirstName, setChildFirstName] = useState('');

  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [defaultSpecialities, setDefaultSpecialities] = useState<any[]>([]);

  const [snackbarMessage,setSnackbarMessage]= useState('');
  const [childFirstNameError, setChildFirstNameError] = useState(false);
  const [childFirstNameHelperText, setChildFirstNameHelperText] = useState('');

  const fullName = `${firstName} ${lastName}`.trim();


  const getServiceNameById = (id: string) => {
    for (const speciality of defaultSpecialities) {
      const service = speciality.services?.find((s) => String(s.service_id) === id);
      if (service) return service.service_name;
    }
    return id;
  };
  const handleCopy = () => {
    const shareLink = `${window.location.origin}/expert/${userName}`;
    navigator.clipboard.writeText(shareLink);
    setCopyNotificationOpen(true);
  };
  const handleShareOpen = () => {
    setOpenShare(true); // Open the dialog
  };
  const handleCloseCopyNotification = () => {
    setCopyNotificationOpen(false);
  };
  // const prevStateRef = useRef<{ firstName: string; lastName: string } | null>(null);
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  // useEffect(() => {
  //   console.log('Is bioField rendering?', document.querySelector('.bioField'));
  // }, []);
  useEffect(() => {
    if (stripeStatus === 'verified') {
      setIsVerifiedOnTab(true);
    } else {
      setIsVerifiedOnTab(false);
    }
    // const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    //   if (isDirty) {
    //     event.preventDefault();
    //     event.returnValue = ''; // Required for some browsers to show the confirmation dialog
    //   }
    // };

    // window.addEventListener('beforeunload', handleBeforeUnload);

    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    // };
  }, [isDirty,stripeStatus]);
  useEffect(() =>{
    console.log('image');
  }, [tempProfilePicture]);

  useEffect(() =>{
    if (socialLinks) {
      setInstagram(socialLinks.instagram || '');
      setWeb(socialLinks.web || '');
      setTwitter(socialLinks.twitter || '');
      setLinkedIn(socialLinks.linkedIn || '');
      setYoutube(socialLinks.youtube || '');
    }
  }, [socialLinks]);
  useEffect(() => {
    setTimeout(() => {
      document.body.style.display = 'none';
      document.body.offsetHeight; // Force reflow
      document.body.style.display = 'block';
    }, 0);
  }, []);
  const validateInstagramInput = (input: string): boolean => {
    const urlRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}(\/\?.*)?$/;
    const idRegex = /^[a-zA-Z0-9._]{1,30}$/;
    return urlRegex.test(input) || idRegex.test(input);
  };

  const validateTwitterInput = (input: string): boolean => {
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
  useEffect(() => {
    handleMandatoryFieldsCheck(); // Run this function after fetching data
  }, [completion, isProfileLive]); // Re-run if completion or profile status changes



  const handleVerificationStatus = (status: boolean) => {
    setIsVerifiedOnTab(status);
    if (status) {
      setStripeStatus('verified');
    }
  };
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  useEffect(() =>{
  },[sessionData,availabilityStatus,isProfileLive,bioUpdateStatus]);
  useEffect(() => {
 
    const fetchData = async () => {
      const response = await getData(`${siteConfig.hodegoUrl}user/identity/all`);
      if(response){
        if(response.data){
          if(userType == 'mentor'){
            fetchMentorData();
          }
          if(response.data.language && response.data.language.length>0){
            setDefaultLanguages([...response.data.language.filter(lang => lang.languageName === 'English'),
              ...response.data.language.filter(lang => lang.languageName !== 'English')]);
          }
          if(response.data.country && response.data.country.length>0){
            setDefaultcountries(response.data.country);
          }
          if(response.data.timeZone && response.data.timeZone.length>0){
            setDefaultTimeZone(response.data.timeZone);
          }
          if(response.data.sport && response.data.sport.length>0){
            setDefaultsports(response.data.sport);
          }
          if (response.data.specialities && response.data.specialities.length > 0) {
            setDefaultSpecialities(response.data.specialities);
          }
          fetchUserData();
        }
      }
      getCount();

     
    };
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    fetchData();
    getProfileStrength();
 
    return () => clearTimeout(timer);
  }, []);
  const getCount=async()=>{
    const countResonse = await getData(`${siteConfig.hodegoUrl}mentor/booking/count?userId=${userId}`);
    if(countResonse){
      if(countResonse.data){
        setTotalCount(countResonse.data?.pending+countResonse.data?.upcoming);
        setUpcomingCount(countResonse.data?.upcoming);
        setPendingCount(countResonse.data?.pending);
      }
    }
  };
  const getProfileStrength = async () => {
    if(userType == 'mentor'){
      fetchMentorData();
    }
    const profileStrength = await getData(`${siteConfig.hodegoUrl}/user/${userId}/profile_strength`);
    if(profileStrength){
      if(profileStrength.data){
        setCompletion({
          profilePic: Boolean(profileStrength.data.profilePic),
          basicInfo: Boolean(profileStrength.data.basics),
          stripeIdentity: Boolean(profileStrength.data.stripeIdentity),
          socialLinks: Boolean(profileStrength.data.social),
          availability: Boolean(profileStrength.data.availability),
          payment: Boolean(profileStrength.data.bankAccount),
          pricing: Boolean(profileStrength.data.pricing)
        });
       
      }
    }
  };
  const fetchUserData = async () => {
    const response = await getData(`${siteConfig.hodegoUrl}user/${userId}`);
    if(response){
      if(response.data){
        if(response.data.length>0){
          if(response.data[0].firstName){
            setFirstName(response.data[0].firstName != response.data[0].email ? response.data[0].firstName: '');
            setProfileData(prevProfile => ({
              ...prevProfile,
              firstName: response.data[0].firstName != response.data[0].email ? response.data[0].firstName: ''
            }));
          }
          if(response.data[0].createdAt){
            setCreatedAt(response.data[0].createdAt);
          }
          if(response.data[0].lastName){
            setLastName(response.data[0].lastName != response.data[0].email ? response.data[0].lastName: '');
            setProfileData(prevProfile => ({
              ...prevProfile,
              lastName: response.data[0].lastName != response.data[0].email ? response.data[0].lastName: ''
            }));
          }
          if(response.data[0].phone){
            setPhone(response.data[0].phone);
            setProfileData(prevProfile => ({
              ...prevProfile,
              phone: response.data[0].phone
            }));
          }
          if(response.data[0].email){
            setEmail(response.data[0].email);
            setProfileData(prevProfile => ({
              ...prevProfile,
              email: response.data[0].email
            }));
          }
          if(response.data[0].childFirstName){
            setChildFirstName(response.data[0].childFirstName );
          }
          if (response.data[0].ageStatus) {
            setAgeStatus(response.data[0].ageStatus);
          }
          if(response.data[0].title){
            setTitle(response.data[0].title);
            setProfileData(prevProfile => ({
              ...prevProfile,
              title: response.data[0].title
            }));
          }
          if(response.data[0].specification){
            setSpecification(response.data[0].specification);
          }
          if(response.data[0].profilePictureUrl){
            setProfilePicture(response.data[0].profilePictureUrl);
            setCurrentProfilePicture(response.data[0].profilePictureUrl);
            setProfileData(prevProfile => ({
              ...prevProfile,
              profilePicture: response.data[0].profilePictureUrl
            }));
          }
          if(response.data[0].languages){
            setSelectedLanguage(response.data[0].languages);
            setProfileData(prevProfile => ({
              ...prevProfile,
              selectedLanguage: response.data[0].languages
            }));
          }
          // if (response.data[0].specialities) {
          //   const specialitiesArray = response.data[0].specialities.split(',');
          //   setSelectedSpecialities(specialitiesArray);
          // }
          if (response.data[0].specialities) {
            try {
              const parsedSpecialities = JSON.parse(response.data[0].specialities);
              setSelectedSpecialities(parsedSpecialities);
              setProfileData(prevProfile => ({
                ...prevProfile,
                selectedSpecialities: parsedSpecialities
              }));
            } catch (error) {
              console.error('Failed to parse specialities', error);
              setSelectedSpecialities([]); // fallback if parse fails
            }
          }
          if(response.data[0].primarySport){
            setSelectedSport(response.data[0].primarySport);
            setProfileData(prevProfile => ({
              ...prevProfile,
              selectedSport: response.data[0].primarySport
            }));
          }
          if(response.data[0].additionalSports){
            setSelectedAddSport(response.data[0].additionalSports);
            setProfileData(prevProfile => ({
              ...prevProfile,
              selectedAddSport: response.data[0].additionalSports
            }));
          }
          if(response.data[0].interests){
            setSelectedInterest(response.data[0].interests);
            setProfileData(prevProfile => ({
              ...prevProfile,
              selectedInterest: response.data[0].interests
            }));
          }
       
          if(response.data[0].country){
            setSelectedCountry(response.data[0].country);
            setProfileData(prevProfile => ({
              ...prevProfile,
              selectedCountry: response.data[0].country
            }));
          }
          if(response.data[0].timeZone){
            setSelectedTimeZone(response.data[0].timeZone);
            setProfileData(prevProfile => ({
              ...prevProfile,
              selectedTimeZone: response.data[0].timeZone
            }));
          }
          // if(response.data[0].specialities){
          //   setSpecialities(response.data[0].specialities);
          // }
          if(response.data[0].careerHighlights){
            setCareerHighlights(response.data[0].careerHighlights);
          }
          if(response.data[0].summary){
            // setShortBio(response.data[0].summary);
            // setShortBioMobile(response.data[0].summary);
            const shortBioData = response.data[0].summary;
            setShortBio(shortBioData);
            setShortBioMobile(shortBioData);
            setProfileData(prevProfile => ({
              ...prevProfile,
              shortBio: shortBioData
            }));
          }
          if(response.data[0].bio){
            // const bioData = (response.data[0].bio).replaceAll('<p><br></p>','');
            setBio(response.data[0]?.bio);
            setBioMobile(response.data[0]?.bio);
            setProfileData(prevProfile => ({
              ...prevProfile,
              bio: response.data[0]?.bio
            }));
          }
          if(response.data[0].socialLinks){
            setSocialLinks(response.data[0].socialLinks);
            // if(response.data[0].socialLinks.instagram == '' && response.data[0].socialLinks.linkedIn == '' && response.data[0].socialLinks.twitter == '' && response.data[0].socialLinks.web == '' && response.data[0].socialLinks.youtube == ''){
            //   setCompletion(prevCompletion => ({
            //     ...prevCompletion,
            //     socialLinks: false
            //   }));
            // }
            // else{
            //   setCompletion(prevCompletion => ({
            //     ...prevCompletion,
            //     socialLinks: true
            //   }));
            // }
          }
          // if(response.data[0].firstName && response.data[0].lastName && response.data[0].email && response.data[0].phone && response.data[0].profilePictureUrl){
          //   setCompletion(prevCompletion => ({
          //     ...prevCompletion,
          //     basicInfo: true
          //   }));
          // }
        }
      }
    }
  };
  const handlePublishConfirm = async () => {
    const formPublsihData = {
      isLive: 1,
    };
 
    const get_access_token = localStorage.getItem('hodego_access_token');
 
    try {
      const response = await axios.put(`${siteConfig.hodegoUrl}mentor/${mentorId}`, formPublsihData, {
        headers: {
          hodego_access_token: get_access_token,
        },
      });
 
      if (response && response.data) {
        setIsProfileLive(true);
        setSnackbarOpenPublish(true);
        setPublishDialogOpen(false);
        console.log('Profile published successfully!');
      }
    } catch (error) {
      console.error('Error while publishing profile:', error);
    }
  };
 
  const handleUpdate = async () => {
    let formData={};
    let tempBioMobile = bioMobile;
    let tempBio = bio;

    const errorMessages = [];
    if(userType == 'mentor'){

      if(isMobile == true){
        const strippedMobileBio = tempBioMobile.replace(/<[^>]+>/g, '').trim();
        if (strippedMobileBio.length < 100) {
          setBioError(true);
          setBioHelperText(`Minimum 100 characters required. (${strippedMobileBio.length}/100)`);
          return; // Stop form submission
        } else {
          setBioError(false);
          setBioHelperText('');
        }
      }else{
        const strippedBio = tempBio.replace(/<[^>]+>/g, '').trim();
        if (strippedBio.length < 100) {
          setBioError(true);
          setBioHelperText(`Minimum 100 characters required. (${strippedBio.length}/100)`);
          return; // Stop form submission
        } else {
          setBioError(false);
          setBioHelperText('');
        }
      }
     
    }
    // Validate first name
    if (!firstName.trim()) {
      errorMessages.push('First name cannot be empty.');
    }
 
    // Validate last name
    if (!lastName.trim()) {
      errorMessages.push('Last name cannot be empty.');
    }
    if (userType === 'mentee' && ageStatus === 'minor' && !childFirstName.trim()) {
      setChildFirstNameError(true);
      setChildFirstNameHelperText('Youth Athlete’s First Name is required.');
      setLoading(false);
      return;
    } else {
      setChildFirstNameError(false);
      setChildFirstNameHelperText('');
    }
    // If errors exist, show snackbar and prevent saving
    if (errorMessages.length > 0) {
      setSnackbarMessage(errorMessages.join(' ')); // Join errors if multiple
      setSnackbarOpen(true); // Show error snackbar
      setLoading(false); // Stop loading
      return; // Exit function to prevent further execution
    }
   
    // If no errors, start loading
    setLoading(true);
    setIsDirty(false);

    // const isValid = await formik.validateForm();
 


   
    if(bioMobile == '<p><br></p>'){
      // tempBioMobile = (bioMobile).replaceAll('<p><br></p>','');
      tempBioMobile = bioMobile;
    }
    if(bio == '<p><br></p>'){
      // tempBio = (bio).replaceAll('<p><br></p>','');
      tempBio = bio;
    }
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
    if (!valid) {
      setLoading(false);
      return;
    }

    if(userType == 'mentor'){
      formData={
        'firstName':firstName.trim(),
        'lastName':lastName.trim(),
        'email':email,
        'phone':phone,
        'title':title,
        'specification':specification,
        'profilePictureUrl':profilePicture,
        'languages':selectedLanguage,
        'primarySport':selectedSport,
        'additionalSports':selectedAddSport,
        'summary':isMobile ==true?shortBioMobile:shortBio,
        'bio':isMobile == true?tempBioMobile :tempBio,
        'country':selectedCountry,
        'timeZone':selectedTimeZone,
        'specialities': JSON.stringify(selectedSpecialities),
        'careerHighlights':careerHighlights,
        'socialLinks': {
          'instagram': instagram,
          'web': web,
          'twitter': twitter,
          'linkedIn': linkedIn,
          'youtube': youtube,
        },
      };
    }
    else{
      formData={
        'firstName':firstName.trim(),
        'lastName':lastName.trim(),
        'email':email,
        'phone':phone,
        'profilePictureUrl':profilePicture,
        'languages':selectedLanguage,
        'bio':isMobile == true?tempBioMobile:tempBio,
        'country':selectedCountry,
        'timeZone':selectedTimeZone,
        'interests':selectedInterest,
        'ageStatus': childFirstName.trim() !== '' ? 'minor' : 'adult',
        'childFirstName': childFirstName.trim(),

      };
    }
    const get_access_token = localStorage.getItem('hodego_access_token');
    axios.put(`${siteConfig.hodegoUrl}user/${userId}`,formData,
      {headers: {
        'hodego_access_token': get_access_token
      }})
      .then(response => {
        if(response.data){
          if(response.data.length>0){
            setProfileData(prevProfile => ({
              ...prevProfile,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              profilePicture: profilePicture,
              phone: phone,
              email: email,
              bio:isMobile == true?bioMobile:bio,
              shortBio:isMobile == true?shortBioMobile:shortBio,
              title: title,
              selectedLanguage:selectedLanguage,
              selectedSpecialities:selectedSpecialities,
              selectedAddSport:selectedAddSport,
              selectedSport:selectedSport,
              selectedCountry:selectedCountry,
              selectedTimeZone:selectedTimeZone,
              selectedInterest:selectedInterest
            }));
            // setShowWarning(false);
            setLoading(false);
            setSnackbarOpen(true);
            getProfileStrength();
            setSnackbarMessage('Updated Successfully!');
          }
        }
      })
      .catch(error => {
        console.log('Error updating profile', error);
        setSnackbarMessage('Failed to update profile. Please try again.');
        setSnackbarOpen(true);
      });
  };
  const handlePreviewOpen = () => {
    setPreviewOpen(true);
  };
  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };
  // Function to open the dialog
  const handleClickOpen = () => {
    setDeleteOpen(true);
  };
  const handleDeleteAccount = async() =>{
    const response = await deleteData(`${siteConfig.hodegoUrl}user/deleted`);
    if(response){
      if(response.data?.status == true){
        setDeleteOpen(false);
        setDeletionSuccessStatus('Deleted Successfully');
        setSnackbarOpen(true);
        logout({
          logoutParams: {
            returnTo: window.location.origin,
          }
        });
        localStorage.removeItem('hodego_access_token');
        localStorage.removeItem('hodego_login_status');
        localStorage.removeItem('firstLoad');
        localStorage.removeItem('selectedUserType');
        localStorage.removeItem('hodegoStatus');
        localStorage.removeItem('registrationType');
        localStorage.removeItem('mentorId');
        localStorage.removeItem('userData');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('timerLeft');
        localStorage.removeItem('provider');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
      else{
        setDeleteOpen(false);
        setSnackbarMessage(response.data?.message);
        setSnackbarOpen(true);
      }
    }
  };
  // Function to close the dialog
  const handleClose = () => {
    setDeleteOpen(false);
  };
  // const handlePublishClick = () => {
  //   setPublishDialogOpen(true);
  // };
  const handlePublishClick = () => {
    const incompleteFields: { name: string; url: string }[] = [];

    if (!completion.profilePic) {
      incompleteFields.push({ name: 'Upload Profile Picture', url: `${window.location.origin}/account-settings?value=editProfile` });
    }
    if (!completion.basicInfo) {
      incompleteFields.push({ name: 'Complete Basic/Profile Info (Including Bio)', url: `${window.location.origin}/account-settings?value=editProfile` });
    }
    if (!completion.stripeIdentity) {
      incompleteFields.push({ name: 'Verify Your Identity', url: `${window.location.origin}/account-settings?value=hodegoVerify` });
    }
    if (!completion.availability) {
      incompleteFields.push({ name: 'Set Your Availability', url: `${window.location.origin}/account-settings?value=availability` });
    }
    if (!completion.pricing) {
      incompleteFields.push({ name: 'Add Your Pricing', url: `${window.location.origin}/account-settings?value=pricing` });
    }
    // Warning for optional fields (Social Links & Bank Account)
    if (!completion.socialLinks || !completion.payment) {
      console.warn('Your profile is published, but Social Links and Bank Account Information are incomplete.');
    }
   
    if (incompleteFields.length === 0) {
      setPublishDialogOpen(true);
    } else {
      setMissingFieldsDialog(true);
      setPendingFields(incompleteFields);
    }
  };
 
  const handleMissingFieldsDialogClose = () => {
    setMissingFieldsDialog(false);
  };

  const handlePublishCancel = () => {
    setPublishDialogOpen(false);
  };
  const fetchMentorData = async () => {
    const response = await getData(`${siteConfig.hodegoUrl}mentor?userId=${userId}`);
    if(response){
      if(response.data){
        if(response.data.length>0){
          if(response.data[0].stripeStatus){
            setStripeStatus(response.data[0].stripeStatus);
            if(response.data[0].stripeStatus == 'verified'){
              // setCompletion(prevCompletion => ({
              //   ...prevCompletion,
              //   stripeIdentity: true
              // }));
            }
          }
          if(response.data[0].accountStatus){
            setAccountStatus(response.data[0].accountStatus);
          }
          if(response.data[0].countryCode){
            localStorage.setItem('countryCode', response.data[0].countryCode);
            setCountryCode(response.data[0].countryCode);
          }
          if(response.data[0].currencyCode){
            setCurrencyCode(response.data[0].currencyCode);
          }
          if(response.data[0].mentorId){
            localStorage.setItem('mentorId', response.data[0].mentorId);
            setMentorId(response.data[0].mentorId);
          }
          if(response.data[0].userId){
            setUserName(response.data[0].userName);
          }
          if(response.data[0].isVerified){
            setIsVerified(response.data[0].isVerified);
          }
          if(response.data[0].isLive == 1){
            setIsProfileLive(true);
          }
          else{
            setIsProfileLive(false);
          }
          // if(response.data[0].availabilityId){
          //   setCompletion(prevCompletion => ({
          //     ...prevCompletion,
          //     availability: true
          //   }));
          // }
          // if(response.data[0].accountId && response.data[0].externalAccountId){
          //   setCompletion(prevCompletion => ({
          //     ...prevCompletion,
          //     payment: true
          //   }));
          // }
        }
      }
    }
  };
  // const handleDeleteLanguage = (languageToDelete: string) => {
  //   setSelectedLanguage((prevSelected) =>
  //     prevSelected.filter((lang) => lang !== languageToDelete)
  //   );
  // };
  const handleDeleteLanguage = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    console.log('clicked delete');
    setSelectedLanguage((prevSelected) =>
      prevSelected.filter((lang) => lang !== value)
    );
  };
  const handleDeleteAddSports = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    console.log('clicked delete');
    setSelectedAddSport((prevSelected) =>
      prevSelected.filter((sport) => sport !== value)
    );
  };
  const handleDeleteSpeciality = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    setSelectedSpecialities((prevSelected) =>
      prevSelected.filter((specialityId) => specialityId !== value)
    );
  };
  const handleDeleteInterests = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    console.log('clicked delete');
    setSelectedInterest((prevSelected) =>
      prevSelected.filter((sport) => sport !== value)
    );
  };

  const handleSessionStatus = (status) => {
    console.log('status',status);
    setSessionData(status);
  };
  const savedStatus = (status)=>{
    setAvailabilityStatus(status);
  };

  const handleChange = (event, newValue) => {
    getCount();
    let unSavedStatus = false;
    setNewValue(newValue);
    if(newValue != 'pricing'){
      if(sessionData == true){
        setUnSavedOpen(true);
        unSavedStatus = true;
      }
      else{
        setUnSavedOpen(false);
      }
    }
    // let tempBio = profileData.bio;
    // if(!profileData.bio.includes('<p>')){
    //   tempBio = `<p>${profileData.bio}</p>`;
    // }
    console.log('socail',socialLinks);
    console.log('insta',instagram);
    console.log('JSON.stringify(profileData.selectedSpecialities)',JSON.stringify(profileData.selectedSpecialities));
    console.log('JSON.stringify(selectedSpecialities)',JSON.stringify(selectedSpecialities));
    if(profileData.firstName != firstName || profileData.lastName != lastName
      || profileData.email!= email || profileData.phone!= phone
      || profileData.title!= title
      // || profileData.profilePicture!= profilePicture
      || JSON.stringify(profileData.selectedLanguage)!= JSON.stringify(selectedLanguage)
      || JSON.stringify(profileData.selectedSpecialities)!= JSON.stringify(selectedSpecialities)
      || profileData.selectedSport!= selectedSport
      || JSON.stringify(profileData.selectedAddSport)!= JSON.stringify(selectedAddSport)
      || profileData.shortBio!= (isMobile == true?shortBioMobile:shortBio)
      // || bioUpdateStatus == true
      || profileData.selectedCountry!= selectedCountry
      || profileData.selectedTimeZone!= selectedTimeZone
      || JSON.stringify(profileData.selectedInterest) !== JSON.stringify(selectedInterest)
      || availabilityStatus == true
      || socialLinks.instagram!= instagram
      || socialLinks.twitter!= twitter
      || socialLinks.linkedIn!= linkedIn
      || socialLinks.youtube!= youtube
    ){
      // console.log('tempBio',tempBio);
      console.log('bio',bio);
      setUnSavedOpen(true);
    }
    else{
      if(unSavedStatus == false){
        setUnSavedOpen(false);
        navigate(`?value=${newValue}`, { replace: true });
        if(userType == 'mentor'){
          fetchMentorData();
        }
        setValue(newValue);
      }
    }
  };
  const handleDiscardChange = ()=>{
    // setShowWarning(false);
    setAvailabilityStatus(false);
    setSessionData(false);
    setUnSavedOpen(false);
    setFirstName(profileData.firstName);
    setLastName(profileData.lastName);
    setProfilePicture(profileData.profilePicture);
    setPhone(profileData.phone);
    setEmail(profileData.email);
    setShortBio(profileData.shortBio);
    setShortBioMobile(profileData.shortBio);
    // setBio((profileData.bio).replaceAll('<p><br></p>',''));
    // setBioMobile((profileData.bio).replaceAll('<p><br></p>',''));
    setBio(profileData.bio);
    setBioMobile(profileData.bio);
    setTitle(profileData.title);
    setSelectedLanguage(profileData.selectedLanguage);
    setSelectedSpecialities(profileData.selectedSpecialities);
    setSelectedAddSport(profileData.selectedAddSport);
    setSelectedSport(profileData.selectedSport);
    setSelectedCountry(profileData.selectedCountry);
    setSelectedTimeZone(profileData.selectedTimeZone);
    setInstagram(socialLinks.instagram);
    setTwitter(socialLinks.twitter);
    setLinkedIn(socialLinks.linkedIn);
    setYoutube(socialLinks.youtube);
    setSelectedInterest(profileData.selectedInterest);
    navigate(`?value=${newValue}`, { replace: true });
    if(userType == 'mentor'){
      fetchMentorData();
    }
    setValue(newValue);
  };
  const checkEmailValidation = (firstName,lastName) =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(firstName)) {
      return firstName.split('@')[0];
    }
    if (emailRegex.test(lastName)) {
      return lastName.split('@')[0];
    }
    return `${firstName} ${lastName}`;
  };
  const getCurrentYear = (joinedDate) => {
    const dateObject = new Date(joinedDate);
    const currentDate = dateObject.getUTCFullYear();
    return currentDate;
  };
  // const handleSpecialitiesChange = (value) => {
  //   setSpecialities(value);
  // };
  // const handleHighlightsChange = (value) => {
  //   setCareerHighlights(value);
  // };

  // const handleBioChange = (content: string) => {
  //   setBio(content); // Update your state or context
  // };

  const handleBioChange = (content: string) => {
    setBio(content);
    if(content != profileData.bio){
      setBioUpdateStatus(true);
    }else{
      setBioUpdateStatus(false);
    }
    // Remove HTML tags and count only text characters
    const strippedBio = content.replace(/<[^>]+>/g, '').trim();
    const charCount = strippedBio.length;

    // Show live character count if below 100
    if (charCount < 100) {
      setBioHelperText(`Minimum 100 characters required. (${charCount}/100)`);
      setBioError(true);
    } else {
      setBioHelperText('');
      setBioError(false);
    }
  };
  const handleBioMobileChange = (content: string) => {
    setBioMobile(content);
    if(content != profileData.bio){
      setBioUpdateStatus(true);
    }
    else{
      setBioUpdateStatus(false);
    }
    // Remove HTML tags and count only text characters
    const strippedBio = content.replace(/<[^>]+>/g, '').trim();
    const charCount = strippedBio.length;

    // Show live character count if below 100
    if (charCount < 100) {
      setBioHelperText(`Minimum 100 characters required. (${charCount}/100)`);
      setBioError(true);
    } else {
      setBioHelperText('');
      setBioError(false);
    }
  };
  // const handleBioMobileChange = (value) => {
  //   // setBioMobile((value).replaceAll('<p><br></p>',''));
  //   setBioMobile(value);
  // };
  const handleUnSavedClose = () => {
    setUnSavedOpen(false);
  };
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfilePicture(currentProfilePicture);
    const file = event.target.files?.[0];
 
    if (file) {
      // Allowed file types
      const allowedTypes = ['image/jpeg', 'image/png'];
 
      if (!allowedTypes.includes(file.type)) {
        setValidationError('Only JPG and PNG images are allowed.');
        setOpenImageValidationSnackbar(true); // Show Snackbar on error
        return;
      }
 
      setValidationError(null); // Clear any previous error
      setOpenImageValidationSnackbar(false); // Close any existing Snackbar
 
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfilePicture(reader.result as string);
        setOpenCropDialog(true); // Open crop dialog
      };
      reader.readAsDataURL(file);
    }
  };
 
  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };
  const handleMandatoryFieldsCheck = () => {
    // Ensure response is available before checking
    if (!completion) {
      setMandatoryCompleteDialog(false);
      return;
    }
 
    // Check if ALL required fields are completed
    const allMandatoryComplete =
      completion.profilePic &&  // Profile picture uploaded
      completion.basicInfo &&   // Basic info provided
      completion.stripeIdentity && // Identity verified
      completion.pricing && // Pricing set
      completion.availability; // Availability added
 
    // Profile should NOT be live, and all required fields should be completed (excluding social & payment)
    if (!isProfileLive && allMandatoryComplete) {
      setMandatoryCompleteDialog(true);
    } else {
      setMandatoryCompleteDialog(false); // Hide the dialog if any required field is missing
    }
  };
  const getCroppedImage = async () => {
    if (!tempProfilePicture || !croppedAreaPixels) return;
    const image = new Image();
    image.src = tempProfilePicture;
 
    return new Promise<string>((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
 
        if (!ctx) return reject('Canvas context not found');
 
        // Set higher resolution for HD output
        const HD_SCALE_FACTOR = 2; // Scale by 2x for HD output
        canvas.width = 257 * HD_SCALE_FACTOR;
        canvas.height = 257 * HD_SCALE_FACTOR;
 
        // Scale and crop the image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
 
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedUrl = URL.createObjectURL(blob);
              resolve(croppedUrl);
            }
          },
          'image/jpeg',
          1.0 // High-quality JPEG
        );
      };
    });
  };
 
  const handleCropSave = async () => {
    const croppedImage = await getCroppedImage();
    if (croppedImage) {
      setProfilePicture(croppedImage);
      setOpenCropDialog(false);

      // Upload cropped image to the server
      const formData = new FormData();
      const croppedBlob = await fetch(croppedImage).then(res => res.blob()); // Convert cropped URL to Blob
      formData.append('file', croppedBlob, 'cropped-image.webp');
     
      const get_access_token = localStorage.getItem('hodego_access_token');
      axios
        .post(`${siteConfig.hodegoUrl}user/profile-picture`, formData, {
          headers: {
            'hodego_access_token': get_access_token,
          },
        })
        .then((response) => {
          if (response.data && typeof response.data.url === 'string') {
            // setShowWarning(true);
            setProfilePicture(response.data.url);
            const formData={
              'profilePictureUrl':response.data.url,
            };
            const get_access_token = localStorage.getItem('hodego_access_token');
            axios.put(`${siteConfig.hodegoUrl}user/${userId}`,formData,
              {headers: {
                'hodego_access_token': get_access_token
              }})
              .then(response => {
                if(response.data){
                  if(response.data.length>0){
                    setLoading(false);
                    setSnackbarOpen(true);
                    getProfileStrength();
                    setSnackbarMessage('Profile Picture Saved Successfully!');
                  }
                }
              })
              .catch(error => {
                console.log('Error updating picture', error);
                setSnackbarMessage('Failed to saved the picture. Please try again.');
                setSnackbarOpen(true);
              });
          }
        })
        .catch((error) => {
          console.error('Error uploading cropped image', error);
        });
    }
  };
  return (
    <Main>
      {/* Dialog that shows once all mandatory fields are completed */}
      <Dialog open={mandatoryCompleteDialog} onClose={() => setMandatoryCompleteDialog(false)}>
        <DialogTitle>You're All Set!</DialogTitle>
        <DialogContent>
          <p>
     All required fields are complete!. Click the <strong>Publish</strong> button when you're ready to make your profile live.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMandatoryCompleteDialog(false)} color="primary"
            sx={{
              background: 'linear-gradient(90deg, #73A870, #0C6697)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #0C6697, #73A870)',
              },
            }}
           
          >
              Okay
          </Button>
        </DialogActions>
      </Dialog>
      
      {userType === 'mentor'  && accountStatus == 'suspended' &&  (
        <Box className="publishView" sx={{margin:'0 auto',width:isMobile ? '90%':'40%',marginTop:isMobile ? '2%':'0',marginBottom:'1%',filter: isVerified === 0 ? 'blur(22px)' : 'none', pointerEvents: isVerified === 0 ? 'none' : 'auto'}}>
          <Alert
            severity="info"
            className="publishInfo"
            sx={{
              display:isMobile ? 'flex': '',
              alignItems:isMobile ? 'center': '',
            }}
          >
          Your account is temporarily suspended due to missed sessions. New bookings are unavailable, but you can still complete upcoming sessions. Need help? Contact Support.
          </Alert>
        </Box>
      )}
      {userType === 'mentor'  && !isProfileLive &&  (
        <Box className="publishView" sx={{margin:'0 auto',width:isMobile ? '90%':'30%',marginTop:isMobile ? '2%':'0',marginBottom:'-3%',filter: isVerified === 0 ? 'blur(22px)' : 'none', pointerEvents: isVerified === 0 ? 'none' : 'auto'}}>
          <Alert
            severity="info"
            className="publishInfo"
            sx={{
              display:isMobile ? 'flex': '',
              alignItems:isMobile ? 'center': '',
            }}
            action={
              <Box sx={{marginTop:isMobile ?'2%':'0%'}}>
                <Button
                  className = "publishButton"
                  sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
                  variant="contained"
                  onClick={handlePublishClick}
                // color="primary"
                >
              Publish
                </Button>
              </Box>
            }
          >
           Your profile is not yet live...do you want to publish?
          </Alert>
        </Box>
      )}
      {/* Publish Confirmation Dialog */}
      <Dialog
        open={publishDialogOpen}
        onClose={handlePublishCancel}
        aria-labelledby="publish-dialog-title"
        aria-describedby="publish-dialog-description"
      >
        <DialogTitle id="publish-dialog-title">Confirm Publish</DialogTitle>
        <DialogContent>
          <DialogContentText id="publish-dialog-description">
          Ready to Go Public?
          Making your profile public lets others discover your profile, connect with you, and book sessions directly. Take this opportunity to expand your reach and make a difference in someone’s journey!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePublishCancel}
            sx={{
              color: 'red',
              border: '1px solid red',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              },
            }}
         
          >
            No
          </Button>
          <Button onClick={handlePublishConfirm} sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}} variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpenPublish}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpenPublish(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpenPublish(false)} severity="success">
          Profile Published Successfully!
        </Alert>
      </Snackbar>
      <Dialog
        open={missingFieldsDialog}
        onClose={handleMissingFieldsDialogClose}
        aria-labelledby="missing-fields-dialog-title"
        aria-describedby="missing-fields-dialog-description"
      >
        <DialogTitle id="missing-fields-dialog-title">Complete Your Profile</DialogTitle>
        <DialogContent>
          <DialogContentText id="missing-fields-dialog-description">
      Please complete the following fields before publishing:
          </DialogContentText>
          <List>
            {pendingFields.map((field, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: '#0C6697',
                  paddingY: 0.2, // Further reduces vertical padding
                  marginBottom: '-3%', // Removes any extra margin between items
                }}
                onClick={() => window.location.href = field.url}
              >
                <ListItemIcon sx={{ minWidth: 32 }}> {/* Icon spacing */}
                  <Circle color="disabled" />
                </ListItemIcon>
                <ListItemText sx={{paddingY: 0.5}} primary={field.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMissingFieldsDialogClose} variant="contained" sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crop Dialog */}
      <Dialog
        open={openCropDialog}
        onClose={() => setOpenCropDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            background: '#fff', // Dimmed background
            height: '350px',
            border: '1px solid #73a870',
            borderRadius: '4px'
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
    Crop Your Picture
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 24px',
            overflow: 'auto',
          }}
        >
          {tempProfilePicture && (
            <Cropper
              image={tempProfilePicture}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, zoom) => setZoom(zoom as number)}
            sx={{
              mt: 2,
              width: '80%',
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'space-between', // Ensure buttons are spaced out
            padding: '8px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Button
            onClick={() => {setOpenCropDialog(false);setProfilePicture(currentProfilePicture);}}
            variant="outlined"
          >
      Cancel
          </Button>
          <Button
            onClick={handleCropSave}
            color="primary"
            sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
            variant="contained"
          >
      Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={unSavedOpen}
        onClose={handleUnSavedClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
        You have unsaved changes. Are you sure you want to leave without saving?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleDiscardChange} autoFocus>Discard Changes</Button>
          <Button onClick={handleUnSavedClose} >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={handleClose}>
        <DialogTitle><Typography sx={{color:'red'}}>Delete Account</Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
          Are you sure you want to delete your account? This action is permanent and will remove all your personal data and profile information. It cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteAccount}
            sx={{
              background: 'linear-gradient(90deg, #0C6697, #73A870)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #0C6697, #73A870)',
              },
            }}
          >
                    Yes
          </Button>
          <Button
            onClick={handleClose}
            sx={{
              color: 'red',
              border: '1px solid red',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.1)', // Optional hover effect
              },
            }}>
                    No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={previewOpen} onClose={handlePreviewClose} fullScreen>
        <DialogTitle>Hodego Profile Preview
          {userType === 'mentor'  && !isMobile && (
            <Box
              className="previewBackToEdit"
              sx={{
                position: 'absolute',
                right: isProfileLive?'4%':'11%',
                top: 8,
              }}>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
                size="large"
                onClick={handlePreviewClose}
              >
            Back to Edit
              </Button>
            </Box>
          )}
          {userType === 'mentor'  && !isProfileLive && (
            <Box className="previewPublish" sx={{
              position: 'absolute',
              right: isMobile?'12%':'4%',
              top: 8,
            }}>
              <Button
                variant="contained"
                type="submit"
                disabled={isVerified === 0}
                sx={{background:isVerified === 0?'#b2b5b7': 'linear-gradient(90deg, #0C6697, #73A870)',color:isVerified === 0 ? '#00000033 !important':'primary'}}
                size="large"
                onClick={handlePublishClick}
              >
                    Publish
              </Button>
            </Box>
          )}
          <IconButton
            aria-label="close"
            onClick={handlePreviewClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ padding: isMobile?'0px':'auto' }}>
          <MentorDetailPage type={'preview'}  userName={userName} />
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mb: '4%', ml: '6%' }}
      >
        <Alert severity={snackbarMessage === 'Updated Successfully!' || snackbarMessage === 'Profile Picture Saved Successfully!'? 'success' : 'error'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Box sx={{ display: { xs: 'none', md: 'block' }, marginBottom: '5%', flexDirection: 'row', marginTop: '3%' }}>
        <Box
          className='settingsView'
          sx={{
            width: '10%',
            // padding: '20px',
            paddingRight: '0px',
            position: 'fixed',
            top: '8%',
            // left:'-1.5%',
            backgroundColor: '#73a8701c',
            height: 'calc(100vh - 3%)',
            overflowY: 'auto',
          }}
        >
          <Box display={'flex'} flexDirection="column" height="100%" justifyContent="space-between">
            <Box>
              <Box sx={{flexDirection: 'column',width: '100%', padding:'5%', margin:'2% 0px', textAlign: 'center', paddingBottom: '0px' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
                  <Avatar
                    src={profilePicture as string}
                    alt="Profile Picture"
                    sx={{
                      width: 74,
                      height: 74,
                      bgcolor: 'grey',
                      border:
                         userType === 'mentor'
                           ? isProfileLive
                             ? '3px solid transparent'
                             : '3px solid #F9B934'
                           : '3px solid transparent',
                      background:
                        userType === 'mentor'
                          ? isProfileLive
                            ? 'linear-gradient(to right, #73A870, #0C6697) border-box'
                            : '#F9B934'
                          : '#73A870',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      position: 'relative',
                    }}
                    onClick={handleAvatarClick}
                  >
                    {checkEmailValidation(firstName.charAt(0),lastName.charAt(0))}
                  </Avatar>
                  {isProfileLive && userType === 'mentor' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        bottom: '-8%',
                        left: '-7%',
                        right: '-7%',
                        margin: '0 auto',
                        background: 'linear-gradient(90deg, #73A870, #0C6697)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        padding: '2px 3px',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                  PROFILE LIVE
                    </Box>
                 
                  )}
                  {!isProfileLive && userType === 'mentor' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 'auto',
                        bottom: '-8%',
                        left: '0',
                        right: '0',
                        margin: '0 auto',
                        background: ' #F9B934',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        padding: '2px 4px',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                  NOT LIVE
                    </Box>
                 
                  )}
                </Box>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handlePopoverClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                >
                  <Typography sx={{ p: 1,fontWeight:'bold' }}>{checkEmailValidation(firstName,lastName)}</Typography>
                  <Typography sx={{ p: 1 }}>Joined in {getCurrentYear(createdAt)}</Typography>
                </Popover>
              </Box>
              <Tabs
                orientation="vertical"
                value={value}
                onChange={handleChange}
                sx={{ width: '100%' }}
                className="tabForDesktop"
              >
                <Tab
                  sx={{ width: '100%',justifyContent:'start', minHeight:'54px', marginTop:'8%'}}
                  label={<Typography sx={{ fontSize: '12px'}}>Dashboard</Typography>}
                  icon={<DashboardIcon sx={{ fontSize: '24px' }} />}
                  iconPosition="start"
                  value={'dashboardAnalytics'}
                />
                <Tab
                  sx={{ width: '100%',justifyContent:'start',  minHeight:'54px'}}
                  label={<Typography sx={{ fontSize: '12px'}}>Basic/Profile Info</Typography>}
                  icon={<EditIcon sx={{ fontSize: '24px' }} />}
                  iconPosition="start"
                  value={'editProfile'}
                />
               
                {userType === 'mentor' && (
                  <Tab
                    sx={{ width: '100%',justifyContent:'start', minHeight:'54px' }}
                    label={<Typography sx={{ fontSize: '12px' }}>{isVerifiedOnTab ? 'ID Verified' : 'Verify ID'}</Typography>}
                    icon={<CheckCircleIcon sx={{ fontSize: '24px' }} />}
                    iconPosition="start"
                    value={'hodegoVerify'}
                  />
                )}
                {userType === 'mentor' && (
                  <Tab
                    sx={{ width: '100%',justifyContent:'start', minHeight:'54px' }}
                    label={<Typography sx={{ fontSize: '12px' }}>Availability</Typography>}
                    icon={<EventAvailableIcon sx={{ fontSize: '24px' }} />}
                    iconPosition="start"
                    value={'availability'}
                  />
                )}
                {userType === 'mentor' && (
                  <Tab
                    sx={{ width: '100%',justifyContent:'start', minHeight:'54px' }}
                    label={<Typography sx={{ fontSize: '12px' }}>Pricing</Typography>}
                    icon={<ManageAccountsIcon sx={{ fontSize: '24px' }} />}
                    iconPosition="start"
                    value={'pricing'}
                  />
                )}
                {/* {userType === 'mentor' && (
                  <Tab
                    sx={{ width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingBottom: '10px' }}
                    label={<Typography sx={{ fontSize: '12px' }}>Social Links</Typography>}
                    icon={<LinkIcon sx={{ fontSize: '24px' }} />}
                    iconPosition="top"
                  />
                )} */}
                <Tab
                  sx={{ width: '100%',justifyContent:'start', minHeight:'54px' }}
                  label={<Typography sx={{ fontSize: '12px' }}>Bookings</Typography>}
                  icon={totalCount>0?
                    (<Tooltip
                      title={
                        <Typography variant="body2">
          Bookings: Upcoming: {upcomingCount} | Pending: {pendingCount}
                        </Typography>
                      }
                      placement="top"
                      arrow
                    >
                      <Badge badgeContent={totalCount}
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: 'red',
                            color: 'white', // Optional: Set the text color
                          },
                        }}
                        color="error">
                        <ScheduleIcon sx={{ fontSize: '24px' }} />
                      </Badge>
                    </Tooltip>):
                    <ScheduleIcon sx={{ fontSize: '24px' }} />
                  }
                  iconPosition="start"
                  value={'bookings'}
                />

                {userType === 'mentor' && (
                  <Tab
                    sx={{ width: '100%',justifyContent:'start',minHeight:'54px' }}
                    label={<Typography sx={{ fontSize: '12px' }}>Payouts</Typography>}
                    icon={<AccountBalanceIcon sx={{ fontSize: '24px' }} />}
                    iconPosition="start"
                    value={'payouts'}
                  />
                )}
                {/* {window.location.hostname != 'hodego.com'? */}
                <Tab
                  sx={{ width: '100%',justifyContent:'start', minHeight:'54px' }}
                  label={<Typography sx={{ fontSize: '12px' }}>Sync Calendar</Typography>}
                  icon={<CalendarTodayIcon sx={{ fontSize: '24px' }} />}
                  value={'syncCalendar'}
                  iconPosition="start"
                />
                {/* :
                  ''
                } */}
                
                {userType === 'mentor' && (
                  <Tab
                    sx={{ width: '100%',justifyContent:'start', minHeight:'54px' }}
                    label={<Typography sx={{ fontSize: '12px' }}>User Guide</Typography>}
                    icon={<SummarizeIcon sx={{ fontSize: '24px' }} />}
                    iconPosition="start"
                    value={'help'}
                  />
                )}
              </Tabs>
 
            </Box>
 
          </Box>
        </Box>
        <Box id="accountSettingsSection">
          {userType == 'mentor' && <ProfileCompletionWidget completion={completion} />}
          {value == 'dashboardAnalytics' && (
            <Box>
              <DashboardAnalytics  username={fullName} />
            </Box>
          )}
          {value == 'editProfile' && (
            <Box>
              <Grid container spacing={2} item xs={8} sx={{display:'flex',justifyContent:'space-between',maxWidth:'70%'}}>
                <Box>
                  <Typography variant="h6" sx={{ ml: 6, mb: 3, fontSize: '18px' }}>
                Basic/Profile Info    
                    {isProfileLive && userType === 'mentor'?
                      <Tooltip title="Share Profile" arrow
                        disableInteractive={isMobile} // Only disable interactivity on mobile
                        enterTouchDelay={0} // Ensures immediate display on touch
                      >
                        <IconButton onClick={handleShareOpen} color="primary">
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                      :
                      ''
                    }
                  </Typography>
               
                  <Snackbar
                    open={copyNotificationOpen}
                    autoHideDuration={1000}
                    onClose={handleCloseCopyNotification}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    sx={{ marginLeft: '6%' }}
                  >
                    <Alert severity="success" sx={{ width: '100%' }}>
           Link copied to clipboard!
                    </Alert>
                  </Snackbar>
                  {/* Dialog */}
                  <Dialog
                    sx={{
                      '& .MuiDialog-paper': {
                        width: isMobile?'900px': '600px', // Set the desired width
                        maxWidth: '90%', // Make it responsive for smaller screens
                      },
                    }}
                    open={openShare} onClose={() => setOpenShare(false)}>
                    <DialogTitle>
          Share Link
                      <IconButton
                        aria-label="close"
                        onClick={() => setOpenShare(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent>
                      <Box
                        sx={{
                          display: isMobile?'block':'flex',
                          alignItems: 'center',
                          paddingTop:'7px',
                          gap: 1, // Space between the input and button
                          mb: 2, // Margin bottom for spacing
                        }}
                      >
                        <TextField
                          label="Shareable Link"
                          value={`${window.location.origin}/expert/${userName}`}
                          fullWidth
                          disabled
                          InputLabelProps={{
                            shrink: true, // Ensures the label stays visible and shrinks to the top
                          }}
                          InputProps={{
                            sx: {
                              height: '45px', // Match the button height (adjust based on your button)
                              padding: '0', // Remove additional padding for alignment
                            },
                          }}
                        />
                        <Button
                          startIcon={<ContentCopyIcon />}
                          variant="contained"
                          onClick={handleCopy}
                          sx={{
                            marginTop: isMobile ? '4%':'0',
                            width:isMobile?'44%':'28%',
                            background: 'linear-gradient(90deg, #0C6697, #73A870)',
                            color: 'white',
                            whiteSpace: 'nowrap', // Prevent button text from wrapping
                            '&:hover': {
                              background: 'linear-gradient(90deg, #0C6697, #73A870)',
                            },
                          }}
                        >
        Copy Link
                        </Button>
                      </Box>
                    </DialogContent>
                  </Dialog>
                </Box>
              </Grid>
              {loading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <CircularProgress sx={{
                    position: 'absolute',
                  }}
                  size={50} />
                  <Box
                    component="img"
                    src={HodegoFavicon}
                    alt="Logo"
                    sx={{
                      width: '18px',
                      height: '20px',
                    }}
                  />
                </div>
              ) : (
                <Grid container spacing={2}>
                  {isVerified === 0 && userType === 'mentor' && (
                    <Alert severity="warning" sx={{ margin: '1% 5%' }}>
                   Hodego Expert Application is Pending Approval
                    </Alert>
                  )}
                  {/* {!showWarning && profilePicture == null && userType === 'mentor' && (
                    <Alert severity="warning" sx={{margin: '1% 5%'}}>Please upload your profile picture to complete account step (Complete Basic Information).</Alert>
                  )} */}
                  {/* {showWarning && (
                    <Alert severity="warning" sx={{margin: '1% 5%'}}>Your picture has been uploaded but will only be saved after you click 'Update'.</Alert>
                  )} */}
                  <Grid item xs={12} sm={9} sx={{ marginBottom: '1%', marginLeft: '6%' }}>
                    <Box
                      component="div"
                      sx={{
                        display: 'inline-block',
                        width: '100%',
                        textAlign: 'left',
                        marginBottom: '3%',
                      }}
                    >
                      {profilePicture && (
                        <Box
                          className="hodegoProfileUpload"
                          component="div"
                          sx={{
                            display: 'inline-block',
                            width: '15%',
                            verticalAlign: 'middle',
                          }}
                        >
                          <Avatar
                            src={profilePicture as string}
                            alt="Profile Picture"
                            sx={{ width: 125, height: 125,border: '3px solid #73A870' }}
                          />
                        </Box>
                      )}
                      {!profilePicture && (
                        <Box
                          className="hodegoProfileUpload"
                          component="div"
                          sx={{
                            display: 'inline-block',
                            width: '20%',
                            verticalAlign: 'middle',
                          }}
                        >
                          <Avatar
                            src={'https://assets.calendly.com/assets/frontend/media/placeholder-ea493df6fe8d166856b3.png'}
                            alt="Profile Picture"
                            sx={{ width: 125, height: 125 }}
                          />
                        </Box>
                      )}
                      <Box
                        className="uploadPicture"
                        component="div"
                        sx={{
                          display: 'inline-block',
                          width: '12%',
                        }}
                      >
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="profile-picture"
                          type="file"
                          onChange={handleProfilePictureChange}
                        />
                        <label htmlFor="profile-picture">
                          <Box marginTop={1} >
                            <Button
                              variant="outlined"
                              color="primary"
                              component="a"
                              target="blank"
                              size="small"
                            >
                            Upload picture
                            </Button>
                          </Box>
                        </label>
                      </Box>
                      <Snackbar
                        open={openImageValidationSnackbar}
                        autoHideDuration={4000}
                        onClose={() => setOpenImageValidationSnackbar(false)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                      >
                        <Alert onClose={() => setOpenImageValidationSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                          {validationError}
                        </Alert>
                      </Snackbar>
                      {userType === 'mentor' && (
                        <Box className="profilePreview" sx={{
                          display: 'inline-block',
                          width: '25%',
                        }}>
                          <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            sx={{
                              background: 'linear-gradient(90deg, #0C6697, #73A870)',
                              fontSize: '.8125rem'
                            }}
                            size="large"
                            onClick={handlePreviewOpen}
                          >
                    Preview Profile
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  <Grid container spacing={2} sx={{ marginLeft: '6%' }}>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <TextField
                          label="First Name*"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setIsDirty(true);
                          }}
                          sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                          disabled={stripeStatus === 'verified'}
                        />
                       
                        <TextField
                          label="Last Name*"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setIsDirty(true);
                          }}
                          sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                          disabled={stripeStatus === 'verified'}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <TextField
                          label="Mobile Number*"
                          value={phone}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Use a regular expression to allow only numbers
                            if (/^\d*$/.test(value)) {
                              setPhone(value);
                            }
                            else{
                              setPhone(value);
                            }
                            setIsDirty(true);
                          }}
                          sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                        />
                        <TextField
                          label="Email*"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setIsDirty(true);
                          }}
                          sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <FormControl sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}>
                          <InputLabel>Language*</InputLabel>
                          <Select
                            labelId="languages-label"
                            id="languages"
                            name="languages"
                            multiple
                            MenuProps={MenuProps}
                            value={selectedLanguage}
                            onChange={(e) => {
                              setSelectedLanguage(e.target.value as string[]);
                              setIsDirty(true);
                            }}
                            input={<OutlinedInput label="Languages *" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value: string) => (
                                  <Chip
                                    key={value}
                                    label={value}
                                    clickable
                                    deleteIcon={
                                      <CancelIcon
                                        onMouseDown={(event) => event.stopPropagation()}
                                      />
                                    }
                                    // className={classes.chip}
                                    onDelete={(e) => handleDeleteLanguage(e, value)}
                                    onClick={() => console.log('clicked chip')}
                                  />
                                ))}
                              </Box>
                            )}
                          >
                            {defaultlanguages.map((lang) => (
                              <MenuItem key={lang.id} value={lang.languageName}>
                                <Checkbox
                                  checked={selectedLanguage.includes(lang.languageName)} // Checkbox reflects selection
                                />
                                {lang.languageName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}>
                          <InputLabel>Time Zone*</InputLabel>
                          <Select
                            input={<OutlinedInput label="TimeZone" />}
                            sx={{ textAlign: 'left', width: '100%' }}
                            MenuProps={MenuProps}
                            value={selectedTimeZone}
                            onChange={(e) => {
                              setSelectedTimeZone(e.target.value);
                              setIsDirty(true);
                            }}
                          >
                            {defaultTimeZone.map((timeZone) => (
                              <MenuItem key={timeZone.id} value={timeZone.timeZoneName}>
                                {timeZone.timeZoneName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <FormControl sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}>
                          <InputLabel>Country*</InputLabel>
                          <Select
                            MenuProps={MenuProps}
                            value={selectedCountry}
                            onChange={(e) => {
                              setSelectedCountry(e.target.value);
                              setIsDirty(true);
                            }}
                            input={<OutlinedInput label="Country *" />}
                          >
                            {defaultcountries.map((country) => (
                              <MenuItem key={country.countryCode} value={country.countryCode}>
                                {country.countryName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {userType === 'mentor' ? (
                          <FormControl sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}>
                            <InputLabel>Sport*</InputLabel>
                            <Select
                              value={selectedSport}
                              MenuProps={MenuProps}
                              onChange={(e) => {
                                setSelectedSport(e.target.value);
                                setIsDirty(true);
                              }}
                              input={<OutlinedInput label="Sport *" />}
                            >
                              {defaultsports.map((sport) => (
                                <MenuItem key={sport.id} value={sport.sportName}>
                                  {sport.sportName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <FormControl sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}>
                            <InputLabel>Sports of Interest</InputLabel>
                            <Select
                              labelId="interest-label"
                              id="interest"
                              name="interest"
                              multiple
                              value={selectedInterest}
                              MenuProps={MenuProps}
                              onChange={(e) => {
                                setSelectedInterest(e.target.value as string[]);
                                setIsDirty(true);
                              }}
                              input={<OutlinedInput label="Sports of Interest" />}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip
                                      key={value}
                                      label={value}
                                      clickable
                                      deleteIcon={
                                        <CancelIcon
                                          onMouseDown={(event) => event.stopPropagation()}
                                        />
                                      }
                                      // className={classes.chip}
                                      onDelete={(e) => handleDeleteInterests(e, value)}
                                      onClick={() => console.log('clicked chip')}
                                    />
                                  ))}
                                </Box>
                              )}
                            >
                              {defaultsports.map((sport) => (
                                <MenuItem key={sport.id} value={sport.sportName}>
                                  <Checkbox
                                    checked={selectedInterest.includes(sport.sportName)} // Checkbox reflects selection
                                  />
                                  {sport.sportName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    </Grid>
                    {userType === 'mentee'  && ageStatus === 'minor' &&  (
                      <FormControl sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            label="Youth Athlete’s First Name*"
                            value={childFirstName}
                            onChange={(e) => {
                              setChildFirstName(e.target.value);
                              setIsDirty(true);
                              // Clear error as user types
                              if (childFirstNameError && e.target.value.trim() !== '') {
                                setChildFirstNameError(false);
                                setChildFirstNameHelperText('');
                              }
                            }}
                            error={childFirstNameError}
                            helperText={childFirstNameHelperText}
                            sx={{ml:2, mb: 2, paddingBottom: '2%', width: '50%' }}
                          />
                          <Tooltip
                            title={
                              <span>
            If the athlete turns 18 or older, please email{' '}
                                <a href="mailto:support@hodego.com" style={{ color: '#13d1d6' }}>
              support@hodego.com
                                </a>{' '}
            to convert this to a standard account. The account will remain under parental control until updated.
                              </span>
                            }
                            arrow
                            placement="right"
                          >
                            <Box sx={{marginBottom:'3%'}}>
                              <IconButton sx={{ ml: 1, mt: -1 }}>
                                <InfoOutlinedIcon color="action" />
                              </IconButton>
                            </Box>
                          </Tooltip>
                        </Box>
                      </FormControl>
                    )}

                    {userType === 'mentor' && (
                      <Grid item xs={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                          {/* <TextField
                            label="Headline"
                            placeholder='Professional Title'
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value);
                              setIsDirty(true);
                            }}
                            sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                          /> */}
                          {/* <TextField
                            label="Specification"
                            value={specification}
                            onChange={(e) => setSpecification(e.target.value)}
                            sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                          /> */}
                          <FormControl sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}>
                            <InputLabel>Additional Sports</InputLabel>
                            <Select
                              labelId="add-sports-label"
                              id="addSports"
                              name="addSports"
                              multiple
                              value={selectedAddSport}
                              MenuProps={MenuProps}
                              onChange={(e) => {
                                setSelectedAddSport(e.target.value as string[]);
                                setIsDirty(true);
                              }}
                              input={<OutlinedInput label="Additional Sports" />}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip
                                      key={value}
                                      label={value}
                                      clickable
                                      deleteIcon={
                                        <CancelIcon
                                          onMouseDown={(event) => event.stopPropagation()}
                                        />
                                      }
                                      // className={classes.chip}
                                      onDelete={(e) => handleDeleteAddSports(e, value)}
                                      onClick={() => console.log('clicked chip')}
                                    />
                                  ))}
                                </Box>
                              )}
                            >
                              {defaultsports.map((sport) => (
                                <MenuItem key={sport.id} value={sport.sportName}>
                                  <Checkbox
                                    checked={selectedAddSport.includes(sport.sportName)} // Checkbox reflects selection
                                  />
                                  {sport.sportName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Grid>
                    )}
                    {/* {userType === 'mentor' && (
                      <Grid item xs={8}>
                        <FormControl fullWidth variant="outlined" sx={{ mb: 2, paddingBottom: '2%' }}>
                          <InputLabel
                            htmlFor="short-bio"
                            shrink
                            sx={{ background: '#fff', padding: '0 4px', transform: 'translate(14px, -6px) scale(0.75)', zIndex: 1 }}
                          >
                          Short Bio
                          </InputLabel>
                          <OutlinedInput
                            id="short-bio"
                            placeholder="Write a 2-3 sentence bio to showcase your expertise and specialties for sports enthusiasts browsing expert profiles on our Explore page."
                            name="shortBio"
                            value={shortBio}
                            onChange={(e) => {
                              setShortBio(e.target.value);
                              setIsDirty(true);
                            }}
                            multiline
                            rows={4}
                            label="Short Bio"
                          />
                        </FormControl>
                      </Grid>
                    )}   */}
                   
                    {/* {userType === 'mentor' && (
                         
                        )} */}
                    {userType === 'mentor' && (
                      <Grid item xs={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                          <FormControl sx={{ mb: 2, paddingBottom: '2%', width: '100%' }}>
                            <InputLabel>Expertise Tags</InputLabel>
                            <Select
                              labelId="expertise-label"
                              id="expertise"
                              multiple
                              value={selectedSpecialities}
                              onChange={(e) => setSelectedSpecialities(e.target.value as string[])}
                              input={<OutlinedInput label="Expertise Tags" />}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value: string) => (
                                    <Chip
                                      key={value}
                                      label={getServiceNameById(value)} 
                                      clickable
                                      deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                                      onDelete={(e) => handleDeleteSpeciality(e, value)}
                                    />
                                  ))}
                                </Box>
                              )}
                              MenuProps={MenuProps}
                            >
                              {defaultSpecialities.map((speciality) => (
                                [
                                  <ListSubheader sx={{fontWeight:'bold',fontSize:'16px'}} key={`subheader-${speciality.id}`} disableSticky>
                                    {speciality.specialitiesName}
                                  </ListSubheader>,
                                  speciality.services?.map((service) => (
                                    <MenuItem key={service.service_id} value={String(service.service_id)}>
                                      <Checkbox checked={selectedSpecialities.includes(String(service.service_id))} />
                                      {service.service_name}
                                    </MenuItem>
                                  ))
                                ]
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Grid>

                    )}
                    {userType === 'mentor' && (
                      <Grid  className='bioField' item xs={8}>
                        <FormControl sx={{ mb: 2, width: '100%' }}>
                          <InputLabel shrink htmlFor="careerHighlights-editor" sx={{ background: '#fff', padding: '0px 1%' }}>
                            Bio*
                          </InputLabel>
                          <div id="careerHighlights-editor" style={{ minHeight: '200px' }}>
                            <ReactQuill
                              theme="snow"
                              modules={modules}
                              value={bio}
                              preserveWhitespace={true}
                              onChange={(e)=>handleBioChange(e)}
                              placeholder='Highlight your expertise, career achievements, and unique skills. Use this section to share your journey, accomplishments, and what sets you apart, helping others connect with your profile.'
                              style={{ minHeight: '200px', height: '100%' }}
                            />
                            {bioError && (
                              <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {bioHelperText}
                              </p>
                            )}
                          </div>
                        </FormControl>
                      </Grid>
                    )}
                    {userType === 'mentor' && (
                      <Grid item xs={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                          <Typography variant="h6" sx={{  fontSize: '18px',color:'#737678e0' }}>
                       Social Links
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {userType === 'mentor' && (
                      <Grid item xs={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
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
                              setIsDirty(true);
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
                            sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                          />
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
                              setIsDirty(true);
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
                            sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                          />
                        </Box>
                      </Grid>
                    )}
                    {userType === 'mentor' && (
                      <Grid item xs={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
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
                              setIsDirty(true);
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
                            sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                          />
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
                              setIsDirty(true);
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
                            sx={{ mb: 2, paddingBottom: '2%', width: '50%' }}
                          />
                        </Box>
                      </Grid>
                    )}
                    {/* {userType === 'mentor' && (
                      <>
                        <Grid item xs={8}>
                          <FormControl sx={{ mb: 2, width: '100%' }}>
                            <InputLabel shrink htmlFor="specialities-editor" sx={{ background: '#fff', padding: '0px 1%' }}>
                             Specialities
                            </InputLabel>
                            <div id="specialities-editor" style={{ minHeight: '200px' }}>
                              <ReactQuill
                                theme="snow"
                                modules={modules}
                                preserveWhitespace={true}
                                value={specialities}
                                onChange={handleSpecialitiesChange}
                                style={{ minHeight: '200px', height: '100%' }}
                              />
                            </div>
                          </FormControl>
                        </Grid>
                        <Grid item xs={8}>
                          <FormControl sx={{ mb: 2, width: '100%' }}>
                            <InputLabel shrink htmlFor="careerHighlights-editor" sx={{ background: '#fff', padding: '0px 1%' }}>
                            Career Highlights
                            </InputLabel>
                            <div id="careerHighlights-editor" style={{ minHeight: '200px' }}>
                              <ReactQuill
                                theme="snow"
                                modules={modules}
                                value={careerHighlights}
                                preserveWhitespace={true}
                                onChange={handleHighlightsChange}
                                style={{ minHeight: '200px', height: '100%' }}
                              />
                            </div>
                          </FormControl>
                        </Grid>
                      </>
                    )} */}
                    <Grid item xs={8} sx={{display:'flex',justifyContent:'space-between'}}>
                      <Box>
                        <Button variant="outlined" color="error" onClick={handleClickOpen}>
                    Delete Account
                        </Button>
                      </Box>
                      <Box>
                        <Button
                          variant="contained"
                          type="submit"
                          color="primary"
                          sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
                          size="large"
                          onClick={handleUpdate}
                        >
                    Save
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      {userType === 'mentor'  && !isProfileLive && accountStatus != 'suspended' && !isMobile && (
                        <Box sx={{margin:'0 auto',width:isMobile ? '90%':'53%',marginTop:isMobile ? '2%':'0',marginBottom:'-3%',filter: isVerified === 0 ? 'blur(22px)' : 'none', pointerEvents: isVerified === 0 ? 'none' : 'auto'}}>
                          <Alert
                            severity="info"
                            className="publishInfo"
                            action={
                              <Box sx={{marginTop:isMobile ?'2%':'0%'}}>
                                <Button
                                  sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
                                  variant="contained"
                                  onClick={handlePublishClick}
                                // color="primary"
                                >
                        Publish
                                </Button>
                              </Box>
                            }
                          >
                     Your profile is not yet live...do you want to publish?
                          </Alert>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
               
              )}
            </Box>
          )}
          {value == 'hodegoVerify' && userType === 'mentor' && (
            <Box>
              <StripeIdentity getProfileStrength={getProfileStrength} stripeStatus={stripeStatus} mentorId={mentorId} isVerifiedStatus={isVerified}  handleVerificationStatus={handleVerificationStatus} />
            </Box>
          )}
          {value == 'availability' && userType === 'mentor' && (
            <Box sx={{ height: '100%' }}>
              <Schedule getProfileStrength={getProfileStrength} savedStatus={savedStatus} mentorId={mentorId} isVerifiedStatus={isVerified} stripeStatus={stripeStatus} />
            </Box>
          )}
       
          {value == 'pricing' && userType === 'mentor' &&
          <><Typography  sx={{marginLeft:'2%', filter: isVerified === 0 ? 'blur(22px)' : 'none', pointerEvents: isVerified === 0 ? 'none' : 'auto',fontSize:'19px',fontWeight:'500' }}>Enable Session Lengths and Set Pricing for Each Duration</Typography><Box sx={{ height: '100%' }}>
            <MentorSession getProfileStrength={getProfileStrength} countryCode={countryCode} mentorId={mentorId} handleSessionStatus={handleSessionStatus}  isVerifiedStatus={isVerified}/>
          </Box></>
          }
          {/* {value == 4 && userType === 'mentor' && (
            <Box sx={{padding:'0px 5%'}}>
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontSize: '18px' }}>
                 Social Links
                </Typography>
              </Box>
              <SocialLinkView getProfileStrength={getProfileStrength} socialLinks={socialLinks} />
            </Box>
          )} */}
          {value == 'bookings' && (
            <Box sx={{margin:'0px 5%',marginLeft:'0px'}}>
              <Box>
                <Typography variant="h6" sx={{ mb: 3,marginLeft:'2%', fontSize: '18px' }}>
                 Bookings
                </Typography>
              </Box>
              <ManageBooking />
            </Box>
          )}
          {value == 'payouts' && userType === 'mentor' && <MentorPayment getProfileStrength={getProfileStrength} currencyCode={currencyCode} countryCode={countryCode} mentorId={mentorId} isVerifiedStatus={isVerified} />}
          {value == 'syncCalendar' && <SyncCalendar />}
          {value == 'help' && userType === 'mentor' && (
            <Box sx={{padding:'0px 5%'}}>
              <ProfileGuide />
            </Box>
          )}
        </Box>
      </Box>


      <Box sx={{ display: { xs: 'block', md: 'none' }, marginBottom: '5%', flexDirection: 'row', marginTop: '2%' }}>
        <Box sx={{ width: '100%', padding: '20px',display:'block' }}>
          <Box display={'block'}>
            <Box sx={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
              <Avatar src={profilePicture as string} alt="Profile Picture" sx={{ width: 60, height: 60, bgcolor: 'grey', marginRight: '5%', border:
                         userType === 'mentor'
                           ? isProfileLive
                             ? '3px solid transparent'
                             : '3px solid #F9B934'
                           : '3px solid transparent',
              background:
                        userType === 'mentor'
                          ? isProfileLive
                            ? 'linear-gradient(to right, #73A870, #0C6697) border-box'
                            : '#F9B934'
                          : '#73A870',
              borderRadius: '50%',
              display: 'inline-flex',
              position: 'relative'}}>
                {firstName.charAt(0)}{lastName.charAt(0)}
              </Avatar>
              {isProfileLive && userType === 'mentor' && (
                <Box
                  sx={{
                    position: 'absolute',
                    width: 'auto', // Change from '100%' to 'auto' for better content fitting
                    bottom: '-8%',
                    left: '50%',
                    transform: 'translateX(-50%)', // Center align horizontally
                    background: 'linear-gradient(90deg, #73A870, #0C6697)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    padding: '4px 8px', // Increased padding for better spacing
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                PROFILE LIVE
                </Box>
             
                 
              )}
              {!isProfileLive && userType === 'mentor' && (
                <Box
                  sx={{
                    position: 'absolute',
                    width: 'auto',
                    bottom: '-8%',
                    left: '0',
                    right: '0',
                    margin: '0 auto',
                    background: ' #F9B934',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    padding: '2px 4px',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  NOT LIVE
                </Box>
                 
              )}
            </Box>
            <Box display={'inline-block'} sx={{verticalAlign:'top',marginTop:'1%',marginLeft:'5%'}}>
              <Typography variant="h6">
                {checkEmailValidation(firstName,lastName)}
              </Typography>
              <Typography variant="body2">Joined in {getCurrentYear(createdAt)}</Typography>
            </Box>
           
          </Box>
          {isMobile && totalCount>0?
            <Alert
              severity="warning"
              sx={{marginTop:'5%',padding: '2px 10px'}}
            >
              <Typography variant="body2">
              Bookings: Upcoming: {upcomingCount} | Pending: {pendingCount}
              </Typography>
            </Alert>
            : ''
          }
          <Tabs
            orientation="horizontal"
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
          >
            <Tab label="Dashboard" value={'dashboardAnalytics'} />
            <Tab value={'editProfile'} label="Basic/Profile Info" />
            {userType == 'mentor' ?
              <Tab value={'hodegoVerify'} label={isVerifiedOnTab ? 'ID Verified' : 'Verify ID'} />
              :
              ''
            }
            {userType == 'mentor' ?
              <Tab value={'availability'} label="Availability" />
              :
              ''
            }
            {userType == 'mentor' ?
              <Tab value={'pricing'} label="Pricing" />
              :
              ''
            }
            <Tab label="Bookings" value={'bookings'} />
            {userType == 'mentor' ?
              <Tab value={'payouts'} label="Payouts" />
              :
              ''
            }
            <Tab label="Sync Calendar" value={'syncCalendar'}/>
            {userType == 'mentor' ?
              <Tab value={'help'} label="User Guide" />
              :
              ''
            }
          </Tabs>
        </Box>
        <Box sx={{ width: '100%', padding: '20px' }}>
        
          {value == 'dashboardAnalytics' && (
            <Box>
              <DashboardAnalytics username={fullName} />
            </Box>
          )}
        

          {value == 'editProfile' && (
            <Box sx={{ display: 'block' }}>
              <Box>
               
                <Grid container spacing={2} item xs={8} sx={{display:'flex',justifyContent:'space-between',paddingLeft:'5%',maxWidth:'100%'}}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                Basic/Profile Info
                      {isProfileLive && userType === 'mentor'?
                        <Tooltip title="Share Profile" arrow
                          disableInteractive={isMobile} // Only disable interactivity on mobile
                          enterTouchDelay={0} // Ensures immediate display on touch
                        >
                          <IconButton onClick={handleShareOpen} color="primary">
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                        :
                        ''
                      }
                    </Typography>
                  </Box>
                </Grid>
                {isVerified === 0 && userType === 'mentor' && (
                  <Alert severity="warning" sx={{ margin: '1% 2% 2%' }}>
                   Hodego Expert Application is Pending Approval
                  </Alert>
                )}
                {/* {showWarning && (
                  <Alert severity="warning" sx={{margin:'0 5% 2% 6%'}}>Your picture has been uploaded but will only be saved after you click 'Update'.</Alert>
                )} */}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={9} sx={{ marginBottom: '4%' }}>
                  <Box
                    component="div"
                    sx={{
                      display: 'inline-block',
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: '3%'
                    }}>
                    {profilePicture && (
                      <Box className="hodegoProfileUpload" component="div"
                        sx={{
                          display: 'inline-block',
                          width: '40%',
                          verticalAlign: 'middle',
                        }}>
                        <Avatar
                          src={profilePicture as string}
                          alt="Profile Picture"
                          sx={{ width: 125, height: 125,border: '3px solid #73A870' }}
                        />
                      </Box>
                    )}
                    {!profilePicture && (
                      <Box className="hodegoProfileUpload" component="div"
                        sx={{
                          display: 'inline-block',
                          width: '45%',
                          verticalAlign: 'middle',
                        }}>
                        <Avatar
                          src={'https://assets.calendly.com/assets/frontend/media/placeholder-ea493df6fe8d166856b3.png'}
                          alt="Profile Picture"
                          sx={{ width: 125, height: 125 }}
                        />
                      </Box>
                    )}
                    <Box component="div"
                      sx={{
                        display: 'inline-block',
                        width: '45%',
                        verticalAlign: userType === 'mentor'?'bottom':'middle',
                        lineHeight: 4,
                      }}>
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="profile-picture"
                          type="file"
                          onChange={handleProfilePictureChange}
                        />
                        <label htmlFor="profile-picture">
                          <Box marginTop={1}>
                            <Button
                              variant="outlined"
                              color="primary"
                              component="a"
                              target="blank"
                              size="small"
                            >
                    Upload picture
                            </Button>
                          </Box>
                        </label>
                      </Box>
                      <Snackbar
                        open={openImageValidationSnackbar}
                        autoHideDuration={4000}
                        onClose={() => setOpenImageValidationSnackbar(false)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                      >
                        <Alert onClose={() => setOpenImageValidationSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                          {validationError}
                        </Alert>
                      </Snackbar>
                      <Snackbar
                        open={deleteSuccessSnackbar}
                        autoHideDuration={3000}
                        onClose={() => setDeleteSuccessSnackbar(false)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                      >
                        <Alert onClose={() => setDeleteSuccessSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                          {deletionSuccessStatus}
                        </Alert>
                      </Snackbar>
                      {userType === 'mentor' && (
                        <Box>
                          <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
                            size="small"
                            onClick={handlePreviewOpen}
                          >
                    Preview Profile
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    label="First Name*"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    sx={{ mb: 2,paddingBottom:'2%' }}
                    disabled={stripeStatus === 'verified'}
                  />
                  <TextField
                    fullWidth
                    label="Last Name*"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    sx={{ mb: 2,paddingBottom:'2%' }}
                    disabled={stripeStatus === 'verified'}
                  />
                  {/* {userType === 'mentor' ?
                    <TextField
                      fullWidth
                      label="Headline"
                      placeholder='Professional Title'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      sx={{ mb: 2, paddingBottom: '2%' }}
                    />
                    :
                    ''
                  } */}
                  <TextField
                    fullWidth
                    label="Mobile Number*"
                    value={phone}
                    inputProps={{ type: 'tel' }}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Use a regular expression to allow only numbers
                      if (/^\d*$/.test(value)) {
                        setPhone(value);
                      }
                    }}
                    sx={{ mb: 2,paddingBottom:'2%' }}
                  />
                  <TextField
                    fullWidth
                    label="Email*"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2,paddingBottom:'2%' }}
                  />
                  <FormControl fullWidth sx={{ mb: 2,paddingBottom:'2%' }}>
                    <InputLabel>Language*</InputLabel>
                    <Select
                      labelId="languages-label"
                      id="languages"
                      name="languages"
                      multiple
                      MenuProps={MenuProps}
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as string[])}
                      input={<OutlinedInput label="Languages *" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value: string) => (
                            <Chip
                              key={value}
                              label={value}
                              clickable
                              deleteIcon={
                                <CancelIcon
                                  onMouseDown={(event) => event.stopPropagation()}
                                />
                              }
                              // className={classes.chip}
                              onDelete={(e) => handleDeleteLanguage(e, value)}
                              onClick={() => console.log('clicked chip')}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {defaultlanguages.map((lang) => (
                        <MenuItem key={lang.id} value={lang.languageName}>
                          <Checkbox
                            checked={selectedLanguage.includes(lang.languageName)} // Checkbox reflects selection
                          />
                          {lang.languageName}
                        </MenuItem>
                      ))}
                    </Select>

                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2, paddingBottom: '2%' }}>
                    <InputLabel>Time Zone*</InputLabel>
                    <Select
                      input={<OutlinedInput label="Time Zone" />}
                      sx={{ textAlign: 'left', width: '100%' }}
                      MenuProps={MenuProps}
                      value={selectedTimeZone}
                      onChange={(e) => {
                        setSelectedTimeZone(e.target.value);
                        setIsDirty(true);
                      }}
                    >
                      {defaultTimeZone.map((timeZone) => (
                        <MenuItem key={timeZone.id} value={timeZone.timeZoneName}>
                          {timeZone.timeZoneName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2,paddingBottom:'2%' }}>
                    <InputLabel>Country*</InputLabel>
                    <Select
                      value={selectedCountry}
                      MenuProps={MenuProps}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      input={<OutlinedInput label="Country *" />}
                    >
                      {defaultcountries.map((country) => (
                        <MenuItem key={country.countryCode} value={country.countryCode}>
                          {country.countryName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {userType === 'mentor' ? (
                    <FormControl fullWidth sx={{ mb: 2, paddingBottom: '2%' }}>
                      <InputLabel>Sport*</InputLabel>
                      <Select
                        value={selectedSport}
                        MenuProps={MenuProps}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        input={<OutlinedInput label="Sport *" />}
                      >
                        {defaultsports.map((sport) => (
                          <MenuItem key={sport.id} value={sport.sportName}>
                            {sport.sportName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <FormControl fullWidth sx={{ mb: 2, paddingBottom: '2%'}}>
                      <InputLabel>Sports of Interest</InputLabel>
                      <Select
                        labelId="interest-label"
                        id="interest"
                        name="interest"
                        multiple
                        value={selectedInterest}
                        MenuProps={MenuProps}
                        onChange={(e) => {
                          setSelectedInterest(e.target.value as string[]);
                          setIsDirty(true);
                        }}
                        input={<OutlinedInput label="Sports of Interest" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                clickable
                                deleteIcon={
                                  <CancelIcon
                                    onMouseDown={(event) => event.stopPropagation()}
                                  />
                                }
                                // className={classes.chip}
                                onDelete={(e) => handleDeleteInterests(e, value)}
                                onClick={() => console.log('clicked chip')}
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {defaultsports.map((sport) => (
                          <MenuItem key={sport.id} value={sport.sportName}>
                            <Checkbox
                              checked={selectedInterest.includes(sport.sportName)} // Checkbox reflects selection
                            />
                            {sport.sportName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {userType === 'mentee' && ageStatus === 'minor' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, paddingBottom: '2%' }}>
                      <TextField
                        label="Youth Athlete’s First Name*"
                        value={childFirstName}
                        onChange={(e) => {
                          setChildFirstName(e.target.value);

                          // Clear error as user types
                          if (childFirstNameError && e.target.value.trim() !== '') {
                            setChildFirstNameError(false);
                            setChildFirstNameHelperText('');
                          }
                        }}
                        error={childFirstNameError}
                        helperText={childFirstNameHelperText}
                        fullWidth
                        sx={{ mb: 2,paddingBottom:'2%' }}
                      />
                      <Tooltip
                        title={
                          <span>
          If the athlete turns 18 or older, please email{' '}
                            <a href="mailto:support@hodego.com" style={{ color: '#13d1d6' }}>
            support@hodego.com
                            </a>{' '}
          to convert this to a standard account. The account will remain under parental control until updated.
                          </span>
                        }
                        arrow
                        placement="right"
                      ><Box sx={{marginBottom:'3%'}}>
                          <IconButton>
                            <InfoOutlinedIcon color="action" />
                          </IconButton>
                        </Box>
                      </Tooltip>
                    </Box>
                  )}
                  {userType === 'mentor' ?
                    <FormControl fullWidth sx={{ mb: 2, paddingBottom: '2%' }}>
                      <InputLabel>Additional Sports</InputLabel>
                      <Select
                        labelId="add-sports-label"
                        id="addSports"
                        name="addSports"
                        multiple
                        value={selectedAddSport}
                        MenuProps={MenuProps}
                        onChange={(e) => setSelectedAddSport(e.target.value as string[])}
                        input={<OutlinedInput label="Additional Sports" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                clickable
                                deleteIcon={
                                  <CancelIcon
                                    onMouseDown={(event) => event.stopPropagation()}
                                  />
                                }
                                // className={classes.chip}
                                onDelete={(e) => handleDeleteAddSports(e, value)}
                                onClick={() => console.log('clicked chip')}
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {defaultsports.map((sport) => (
                          <MenuItem key={sport.id} value={sport.sportName}>
                            <Checkbox
                              checked={selectedAddSport.includes(sport.sportName)} // Checkbox reflects selection
                            />
                            {sport.sportName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    :''
                  }
                  {/* {isMobile == true && userType == 'mentor' ?
                    <FormControl fullWidth sx={{ mb: 2,paddingBottom:'2%' }}>
                      <TextField
                        label="Short Bio"
                        placeholder='"Write a 2-3 sentence bio to showcase your expertise and specialties for sports enthusiasts browsing expert profiles on our Explore page."'
                        variant="outlined"
                        name={'shortBioMobile'}
                        onChange={(e) => setShortBioMobile(e.target.value)}
                        multiline
                        value={shortBioMobile}
                        rows={4}
                        fullWidth
                      />
                    </FormControl>
                    :

                    ''
                  } */}
                  {/* <Grid item xs={8}> */}
                  {userType === 'mentor' && (
                    <FormControl fullWidth sx={{ mb: 2, paddingBottom: '2%' }}>
                      <InputLabel>Expertise Tags</InputLabel>
                      <Select
                        labelId="expertise-label"
                        id="expertise"
                        multiple
                        value={selectedSpecialities}
                        onChange={(e) => setSelectedSpecialities(e.target.value as string[])}
                        input={<OutlinedInput label="Expertise Tags" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value: string) => (
                              <Chip
                                key={value}
                                label={getServiceNameById(value)}
                                clickable
                                deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                                onDelete={(e) => handleDeleteSpeciality(e, value)}
                              />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {defaultSpecialities.map((speciality) => (
                          [
                            <ListSubheader sx={{fontWeight:'bold',fontSize:'16px'}} key={`subheader-${speciality.id}`} disableSticky>
                              {speciality.specialitiesName}
                            </ListSubheader>,
                            speciality.services?.map((service) => (
                              <MenuItem key={service.service_id} value={String(service.service_id)}>
                                <Checkbox checked={selectedSpecialities.includes(String(service.service_id))} />
                                {service.service_name}
                              </MenuItem>
                            ))
                          ]
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {isMobile == true && userType == 'mentor' ?
                    <FormControl className='bioField' fullWidth sx={{ mb: 2, width: '100%' }}>
                      <InputLabel shrink htmlFor="specialities-editor" sx={{ background: '#fff', padding: '0px 1%' }}>
                             Bio*
                      </InputLabel>
                      <div id="specialities-editor" style={{ minHeight: '200px' }}>
                        <ReactQuill
                          theme="snow"
                          modules={modules}
                          preserveWhitespace={true}
                          value={bioMobile}
                          onChange={(e)=>handleBioMobileChange(e)}
                          style={{ minHeight: '200px', height: '100%' }}
                        />
                        {bioError && (
                          <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                            {bioHelperText}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    :  
                    ''
                  }
                  {userType === 'mentor' && (
                    <Typography variant="h6" sx={{ mb: 3, fontSize: '18px',color:'#737678e0'}}>
                       Social Links
                    </Typography>
                  )}
                  {userType === 'mentor' ?
                    <TextField
                      fullWidth
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Instagram />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2, paddingBottom: '2%' }}
                    />
                    :
                    ''
                  }
                  {userType === 'mentor' ?
                    <TextField
                      fullWidth
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <X />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2, paddingBottom: '2%' }}
                    />
                    :
                    ''
                  }
                  {userType === 'mentor' ?
                    <TextField
                      fullWidth
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkedIn />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2, paddingBottom: '2%' }}
                    />
                    :
                    ''
                  }
                  {userType === 'mentor' ?
                    <TextField
                      fullWidth
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <YouTube />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2, paddingBottom: '2%' }}
                    />
                    :
                    ''
                  }
                  {/* {userType === 'mentor' && (
                    <>
                      <FormControl sx={{ mb: 2, width: '100%' }}>
                        <InputLabel shrink htmlFor="specialities-editor" sx={{ background: '#fff', padding: '0px 1%' }}>
                             Specialities
                        </InputLabel>
                        <div id="specialities-editor" style={{ minHeight: '200px' }}>
                          <ReactQuill
                            theme="snow"
                            modules={modules}
                            preserveWhitespace={true}
                            value={specialities}
                            onChange={handleSpecialitiesChange}
                            style={{ minHeight: '200px', height: '100%' }}
                          />
                        </div>
                      </FormControl>
                      <FormControl sx={{ mb: 2, width: '100%' }}>
                        <InputLabel shrink htmlFor="careerHighlights-editor" sx={{ background: '#fff', padding: '0px 1%' }}>
                            Career Highlights
                        </InputLabel>
                        <div id="careerHighlights-editor" style={{ minHeight: '200px' }}>
                          <ReactQuill
                            theme="snow"
                            modules={modules}
                            value={careerHighlights}
                            preserveWhitespace={true}
                            onChange={handleHighlightsChange}
                            style={{ minHeight: '200px', height: '100%' }}
                          />
                        </div>
                      </FormControl>
                    </>
                  )} */}
                  <Grid sx={{display:'flex',justifyContent:'space-between'}}>
                    <Box>
                      <Button variant="outlined" color="error" onClick={handleClickOpen}>
                    Delete Account
                      </Button>
                    </Box>
                    <Box>
                      <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        sx={{background: 'linear-gradient(90deg, #0C6697, #73A870)'}}
                        size="large"
                        onClick={handleUpdate}
                      >
                    Save
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
               
               
              </Grid>
            </Box>
          )}
          {value == 'hodegoVerify' && userType == 'mentor' &&
          <Box>
            <StripeIdentity getProfileStrength={getProfileStrength} stripeStatus={stripeStatus} mentorId={mentorId} isVerifiedStatus={isVerified} handleVerificationStatus={handleVerificationStatus}/>
          </Box>
          }
          {value == 'availability' && userType == 'mentor' && (
            <Box sx={{ height: '100%'}}>
              <Schedule getProfileStrength={getProfileStrength} savedStatus={savedStatus} mentorId={mentorId} isVerifiedStatus={isVerified} stripeStatus={stripeStatus}/>
            </Box>
          )}
          {value == 'pricing' && userType == 'mentor' &&
         <><Typography sx={{filter: isVerified === 0 ? 'blur(22px)' : 'none', pointerEvents: isVerified === 0 ? 'none' : 'auto',fontSize:'19px',fontWeight:'500'  }} variant="h6">Enable Session Lengths and Set Pricing for Each Duration</Typography><Box sx={{ height: '100%' }}>
           <MentorSession getProfileStrength={getProfileStrength} countryCode={countryCode} mentorId={mentorId} handleSessionStatus={handleSessionStatus}  isVerifiedStatus={isVerified} />
         </Box></>
          }
          {/* {value == 4 && userType == 'mentor' && (
            <Box sx={{ margin: '0 5%' }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 3,fontSize:'18px' }}>
               Social Links
                </Typography>
              </Box>
              <SocialLinkView getProfileStrength={getProfileStrength} socialLinks={socialLinks}/>
            </Box>
          )} */}
          {value == 'bookings' && (
            <Box sx={{ margin: '0 5%',marginLeft:'0px' }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 3,fontSize:'18px' }}>
                Bookings
                </Typography>
              </Box>
              <ManageBooking />
            </Box>
          )}
          {value == 'payouts' && userType == 'mentor' && <MentorPayment getProfileStrength={getProfileStrength} currencyCode={currencyCode} countryCode={countryCode} mentorId={mentorId} isVerifiedStatus={isVerified} />}
          {value == 'syncCalendar' && <SyncCalendar />}
          {value == 'help' && userType == 'mentor' &&
          <Box>
            <ProfileGuide />
          </Box>
          }
        </Box>
 
      </Box>
    </Main>
  );
};


export default AccountSettings;