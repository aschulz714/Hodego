import React, { useEffect,useState } from 'react';
import './DashboardAnalytics.css';
import {
  Box,
  Grid,
  MenuItem,
  Select,
  Accordion,
  AccordionSummary,
  Typography,
  Card,
  CardContent,
  AccordionDetails,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getData } from '../../../../theme/Axios/apiService';
import siteConfig from '../../../../theme/site.config';
import TrendingUpTwoToneIcon from '@mui/icons-material/TrendingUpTwoTone';
import TrendingDownTwoToneIcon from '@mui/icons-material/TrendingDownTwoTone';
import RemoveIcon from '@mui/icons-material/Remove';
import { subDays } from 'date-fns';
import { format } from 'date-fns';
import { FormControlLabel, Checkbox } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Pagination from '@mui/material/Pagination';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';


interface DashboardAnalyticsProps {
  username: string;
}


const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ username }) => {
  const [selectedDayRange, setSelectedDayRange] = useState('Today');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [userMetrics, setUserMetrics] = useState<any[]>([]);
  const [rangeLabel, setRangeLabel] = useState('from previous 90 days');
  const [isCompareChecked, setIsCompareChecked] = useState(true);
  const [availabilityMetrics, setAvailabilityMetrics] = useState<{ label: string; value: string; change: string; trend: 'up' | 'down' | 'neutral' }[]>([]);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [earningsMetrics, setEarningsMetrics] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [showAllDialog, setShowAllDialog] = useState(false);
  const [paginatedTransactions, setPaginatedTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [paginatedPayouts, setPaginatedPayouts] = useState([]);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [payoutPage, setPayoutPage] = useState(1);
  const payoutPageSize = 10;
  let menteeMetrics = [];
  let menteetimeSlot = [];
  const timezoneMap = {
    'Asia/Calcutta': 'Asia/Kolkata',
    'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
    'Asia/Saigon': 'Asia/Ho_Chi_Minh',
    'Europe/Nicosia': 'Asia/Nicosia',
    'Pacific/Ponape': 'Pacific/Pohnpei',
  };
  const getUpdatedTimezone = (timezone) => {
    return timezoneMap[timezone] || timezone;
  };
  const userType = localStorage.getItem('userType');

  const handleDayChange = (event: any) => {
    setSelectedDayRange(event.target.value);
  };
  const getTrendDirection = (percentageDiff: number, isPositive: boolean): 'up' | 'down' | 'neutral' => {
    if (percentageDiff === 0) return 'neutral';
    return isPositive ? 'up' : 'down';
  };
  
  const handleCompareToggle = (event) => {
    setIsCompareChecked(event.target.checked);
  };

  const formatWithOrdinalAndTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getUTCDate(); // 👈 Use UTC versions
    const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const year = date.getUTCFullYear();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
  
    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
  
    const hour12 = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const paddedMin = minute.toString().padStart(2, '0');
  
    return `${month} ${day}${getOrdinal(day)}, ${year} at ${hour12}:${paddedMin} ${ampm}`;
  };
  
  
  const getDateRange = () => {
    const now = new Date();
    let fromDate;
    let label = 'from previous 90 days';
  
    if (selectedDayRange === 'Today') {
      fromDate = now;
      label = 'from yesterday';
    } else if (selectedDayRange === 'Last 7 days') {
      fromDate = subDays(now, 7);
      label = 'from previous 7 days';
    } else if (selectedDayRange === 'Last 30 days') {
      fromDate = subDays(now, 30);
      label = 'from previous 30 days';
    } else {
      fromDate = subDays(now, 90);
      label = 'from previous 90 days';
    }
  
    setRangeLabel(label); // 🔥 Set dynamic text for card 
  
    return {
      from: format(fromDate, 'yyyy-MM-dd'),
      to: format(now, 'yyyy-MM-dd'),
      timeZone: getUpdatedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    };
  };
  
  const getCurrencySymbol = (rate: number, currency: string) => {
    if (!currency) return rate.toString();
    const currencyCode = currency;
    const locale = 'en-US';
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    });
    const formattedAmount = formatter.format(rate);
    return formattedAmount;
  };

  const fetchAnalyticsData = async () => {
    const { from, to, timeZone } = getDateRange();
    try {
      const res = await getData(`${siteConfig.hodegoUrl}user/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&timeZone=${encodeURIComponent(timeZone)}&compare=true`);
      const data = res?.data;

      if (!data) return;
      const formatPercentage = (num) => `${Math.round(num)}%`;
      const sessionCount = data.sessionCount?.value ?? 0;
      const sessionChange = formatPercentage(data.sessionCount?.percentageDifference ?? 0);
      const sessionTrend = getTrendDirection(data.sessionCount?.percentageDifference ?? 0, data.sessionCount?.isPositive);

      const repeatUsers = Math.round(data.repeatedUsers?.value ?? 0);
      const repeatChange = formatPercentage(data.repeatedUsers?.percentageDifference ?? 0);
      const repeatTrend = getTrendDirection(data.repeatedUsers?.percentageDifference ?? 0, data.repeatedUsers?.isPositive);

      // const cancellationRate = `${Math.round(data.cancellation?.mentor ?? 0)}% vs ${Math.round(data.cancellation?.mentee ?? 0)}%`;
      // const cancelChange = formatPercentage(data.cancellation?.percentageDifference ?? 0);
      // const cancelTrend = getTrendDirection(data.cancellation?.percentageDifference ?? 0, data.cancellation?.isPositive);

      const conversionValue = Math.round(data.freeTrialConversions?.value ?? 0);
      const conversionChange = formatPercentage(data.freeTrialConversions?.percentageDifference ?? 0);
      const conversionTrend = getTrendDirection(data.freeTrialConversions?.percentageDifference ?? 0, data.freeTrialConversions?.isPositive);

      const upcoming = data.upcomingSessions?.value ?? 0;

      const noshows = data.otherAnalytics?.noshows ?? 0;
      const cancellations = data.otherAnalytics?.cancellations ?? 0;
      const reschedules = data.otherAnalytics?.reschedules ?? 0;
      const otherChange = formatPercentage(data.otherAnalytics?.percentageDifference ?? 0);
      const otherTrend = getTrendDirection(data.otherAnalytics?.percentageDifference ?? 0, data.otherAnalytics?.isPositive);
      

      const ratingValue = Math.round(data.ratings?.value ?? 0);
      const ratingDiff = `${Math.round(data.ratings?.valueDifference ?? 0)}`;
      const ratingTrend = getTrendDirection(data.ratings?.valueDifference ?? 0, data.ratings?.isPositive);

      const mentorMetrics = [
        { label: 'Total Sessions Completed', value: sessionCount, change: sessionChange, trend: sessionTrend },
        { label: 'Repeat Users %', value: `${repeatUsers}%`, change: repeatChange, trend: repeatTrend },
        // { label: 'Cancellation Rate (Mentor vs Mentee)', value: cancellationRate, change: cancelChange, trend: cancelTrend },
        {label: 'Average Rating (Out of 5 stars)',value: ratingValue,change: `+${ratingDiff}`,trend: ratingTrend},
        { label: 'No Shows / Cancellations / Reschedules', value: `${noshows} / ${cancellations} / ${reschedules}`, change: otherChange, trend: otherTrend },
        { label: 'Free Trial Conversions', value: conversionValue, change: conversionChange, trend: conversionTrend },
        { label: 'Upcoming Session Count', value: upcoming, change: '+0%', trend: 'neutral' },
      ];
      console.log('data',data);
      menteeMetrics = [
        { label: 'Total Sessions Completed', value: sessionCount, change: sessionChange, trend: sessionTrend },
        // { label: 'Cancellation Rate', value: cancellationRate, change: cancelChange, trend: cancelTrend },
        { label: 'No Shows / Cancellations / Reschedules', value: `${noshows} / ${cancellations} / ${reschedules}`, change: otherChange, trend: otherTrend },
        { label: 'Upcoming Session Count', value: upcoming, change: '+0%', trend: 'neutral' },
        {
          label: 'Time Slots Popularity (Most Booked Time Slot)',
          value: menteetimeSlot.find(m => m.label.includes('Time Slots Popularity'))?.value || '—',
          change: menteetimeSlot.find(m => m.label.includes('Time Slots Popularity'))?.change || 'N/A',
          trend: menteetimeSlot.find(m => m.label.includes('Time Slots Popularity'))?.trend || 'neutral',
        },
        {
          label: 'Total Sessions Paid',
          value: `${data.earningMetrics?.totalSessionsPaid?.value ?? 0}`,
          change: typeof data.earningMetrics?.totalSessionsPaid?.percentageChange === 'number'
            ? `${data.earningMetrics.totalSessionsPaid.percentageChange}%`
            : 'N/A',
          trend: getTrendDirection(
            data.earningMetrics?.totalSessionsPaid?.percentageChange ?? 0,
            data.earningMetrics?.totalSessionsPaid?.isPositive ?? true
          ),
        }
        
      ];

      // const ratingMetrics = [
      //   {label: 'Average Rating (Out of 5 stars)',value: ratingValue,change: `+${ratingDiff}`,trend: ratingTrend},
      // ];

      setMetrics(mentorMetrics);
      setUserMetrics(menteeMetrics);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  };


  const fetchAvailabilityData = async () => {
    // 1. build your date & timezone query
    const { from, to, timeZone } = getDateRange();
  
    try {
      // 2. call the availability endpoint
      const res = await getData(
        `${siteConfig.hodegoUrl}user/analytics/availability?` +
        `from=${encodeURIComponent(from)}` +
        `&to=${encodeURIComponent(to)}` +
        `&timeZone=${encodeURIComponent(timeZone)}` +
        '&compare=true'
      );

      const {
        responseTime: { responseTime: rawMins, change: rawChange },
        mostDemandedSlot,
      } = res.data;
  

      const totalMins = Math.round(rawMins);
      const changeInMins = Math.round(rawChange);

      // 4. format the raw minutes into “X hr Y mins”
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const prettyValue =
        (hrs > 0 ? `${hrs} hr${hrs > 1 ? 's' : ''} ` : '') +
        `${mins} mins`;
  
      // 5. turn the numeric change into “+N mins” or “-N mins”
      const prettyChange = `${changeInMins > 0 ? '+' : ''}${changeInMins} mins`;
  
      // 6. decide arrow direction
      const trendDir: 'up' | 'down' | 'neutral' =
      changeInMins > 0 ? 'up'
        : changeInMins < 0 ? 'down'
          : 'neutral';
  
      // 7. detect if we actually have a slot to show
      const hasSlot = Boolean(mostDemandedSlot);
  
      // 8. update your card state with two entries
      setAvailabilityMetrics([
        {
          label: 'Response Time to Bookings / Messages',
          value: prettyValue,       
          change: prettyChange,     
          trend: trendDir,          
        },
        {
          label: 'Time Slots Popularity (Most Booked Time Slot)',
          value: hasSlot ? mostDemandedSlot : '—',
          change: hasSlot ? 'High Demand' : 'N/A',
          trend: hasSlot ? 'up' : 'neutral',
        },
      ]);
      menteetimeSlot = [{
        label: 'Time Slots Popularity (Most Booked Time Slot)',
        value: hasSlot ? mostDemandedSlot : '—',
        change: hasSlot ? 'High Demand' : 'N/A',
        trend: hasSlot ? 'up' : 'neutral',
      }];
    } catch (err) {
      console.error('Error loading availability:', err);
    }
  };
  

  const fetchPaymentAnalytics = async () => {
    const { from, to, timeZone } = getDateRange();
  
    try {
      const res = await getData(
        `${siteConfig.hodegoUrl}user/analytics/payment?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&timeZone=${encodeURIComponent(timeZone)}&compare=true`
      );
      console.log('res',res);
      const data = res?.data;
      const currency = data.earningMetrics.currencyId || '$'; 
  
      if (!data) return;
      if(userType === 'mentee'){
        if(menteeMetrics.length > 0){
          menteeMetrics.forEach((metric) => {
            if (metric.label === 'Total Sessions Paid') {
              metric.value = `${data.earningMetrics?.totalSessionsPaid?.value ?? 0}`;
              metric.change = typeof data.earningMetrics.totalSessionsPaid?.percentageChange === 'number'
                ? `${data.earningMetrics.totalSessionsPaid.percentageChange}%`
                : 'N/A';
              metric.trend = getTrendDirection(data.earningMetrics.totalSessionsPaid?.percentageChange, data.earningMetrics.totalSessionsPaid?.isPositive);
            }
          });
          setUserMetrics([...menteeMetrics]);
        }
      }

      const earnings = [
        {
          label: 'Total Earnings',
          value: getCurrencySymbol(data.earningMetrics.totalEarnings, currency),
          // change: `${data.earningMetrics.earning?.percentageChange}%`,
          change: typeof data.earningMetrics.earning?.percentageChange === 'number'
            ? `${data.earningMetrics.earning.percentageChange}%`
            : 'N/A',

          trend: getTrendDirection(data.earningMetrics.earning?.percentageChange, data.earningMetrics.earning?.isPositive),
        },
        {
          label: 'Total Sessions Paid',
          value: `${data.earningMetrics.totalSessionsPaid?.value}`,
          // change: `${data.earningMetrics.totalSessionsPaid?.percentageChange}%`,
          change: typeof data.earningMetrics.totalSessionsPaid?.percentageChange === 'number'
            ? `${data.earningMetrics.totalSessionsPaid.percentageChange}%`
            : 'N/A',

          trend: getTrendDirection(data.earningMetrics.totalSessionsPaid?.percentageChange, data.earningMetrics.totalSessionsPaid?.isPositive),
        },
        {
          label: 'Pending Payout',
          value: getCurrencySymbol(data.earningMetrics.pendingPayout, currency),
          change: 'N/A',
          trend: 'neutral',
        },
        {
          label: 'Next Payout Date',
          // value: new Date(data.earningMetrics.nextPayoutDate).toLocaleDateString('en-US'),
          value: data.earningMetrics.nextPayoutDate
            ? new Date(data.earningMetrics.nextPayoutDate).toLocaleDateString('en-US')
            : 'No payout scheduled',

          change: 'N/A',
          trend: 'neutral',
        },
      ];
  
      setEarningsMetrics(earnings);
  
      // Update Transaction History
      const transactions = data.transactionHistory.map((txn) => ({
        name: txn.firstName && txn.lastName ? `${txn.firstName} ${txn.lastName}` : 'Unknown',
        avatar: txn.profilePic && txn.profilePic.trim() !== '' ? txn.profilePic : null,
        bookingId: `#${txn.bookingId}`,
        sessionDate: formatWithOrdinalAndTime(txn.fromDateTime),
        duration: `${txn.slotDuration} min`,
        // earned: `₹${parseFloat(txn.earnedAmount).toFixed(2)}`,
        earned: getCurrencySymbol(parseFloat(txn.earnedAmount), data.earningMetrics.currencyId),
        status: txn.paymentStatus.charAt(0).toUpperCase() + txn.paymentStatus.slice(1),
      }));
      setUserTransactions(transactions.slice(0, 4));
      setTotalTransactions(data.transactionHistoryTotal ?? transactions.length);

  
      // Update Payout History
      const payouts = data.payoutHistory.map((p) => ({
        initiated: formatWithOrdinalAndTime(p.initiatedDate),
        arrival: new Date(p.arrivalDate).toLocaleDateString('en-US', { timeZone }),
        status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
        // amount: `₹${parseFloat(p.amount).toFixed(2)}`,
        amount: getCurrencySymbol(parseFloat(p.amount), data.earningMetrics.currencyId),
        bookingId: `#${p.associatedBookingId[0]}`,
        sessionsIncluded: p.sessionsIncluded,
      }));
      setPayoutHistory(payouts.slice(0, 4)); // ✅ Show only 4
      setTotalPayouts(data.payoutHistoryTotal ?? payouts.length); // ✅ Total value
      

    } catch (err) {
      console.error('Failed to fetch payment analytics:', err);
    }
  };


  const fetchPaginatedTransactions = async (pageNum: number) => {
    const offset = (pageNum - 1) * pageSize;
    const { from, to, timeZone } = getDateRange();
  
    try {
      const res = await getData(`${siteConfig.hodegoUrl}user/analytics/payment/transactions?from=${from}&to=${to}&timeZone=${encodeURIComponent(timeZone)}&offset=${offset}&limit=${pageSize}`);
   
      const transactions = res?.data?.data ?? [];
      const currencyId = res?.data?.earningMetrics?.currencyId || 'USD'; 
      console.log('currencyId',currencyId);
      const mapped = transactions.map((txn) => ({
        name: txn.firstName && txn.lastName ? `${txn.firstName} ${txn.lastName}` : 'Unknown',
        avatar: txn.profilePic?.trim() ? txn.profilePic : null,
        bookingId: `#${txn.bookingId}`,
        sessionDate: formatWithOrdinalAndTime(txn.fromDateTime),
        duration: `${txn.slotDuration} min`,
        // earned: `₹${parseFloat(txn.earnedAmount).toFixed(2)}`,
        earned: getCurrencySymbol(parseFloat(txn.earnedAmount), currencyId),
        status: txn.paymentStatus.charAt(0).toUpperCase() + txn.paymentStatus.slice(1),
      }));
  
      setPaginatedTransactions(mapped);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch paginated transactions:', err);
    }
  };


  const fetchPaginatedPayouts = async (pageNum: number) => {
    const offset = (pageNum - 1) * payoutPageSize;
    const { from, to, timeZone } = getDateRange();
  
    try {
      const res = await getData(
        `${siteConfig.hodegoUrl}user/analytics/payment/payouts?from=${from}&to=${to}&timeZone=${encodeURIComponent(timeZone)}&offset=${offset}&limit=${payoutPageSize}`
      );
  
      const payouts = res?.data?.data ?? [];
      const currencyId = res?.data?.earningMetrics?.currencyId || 'USD'; 
      const mapped = payouts.map((p) => ({
        initiated: formatWithOrdinalAndTime(p.initiatedDate),
        arrival: new Date(p.arrivalDate).toLocaleDateString('en-US', { timeZone }),
        status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
        amount: getCurrencySymbol(parseFloat(p.amount), currencyId),
        bookingId: `#${p.associatedBookingId[0]}`,
        sessionsIncluded: p.sessionsIncluded,
      }));
  
      setPaginatedPayouts(mapped);
      setPayoutPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch paginated payouts:', err);
    }
  };
  useEffect(() => {
    fetchAnalyticsData();
    fetchAvailabilityData();
    fetchPaymentAnalytics();
  }, [selectedDayRange, isCompareChecked]);

  const TrendIcon = ({ trend }: { trend: string }) => {
    const iconStyle = { fontSize: '1.8rem', verticalAlign: 'middle', marginRight: '2px' };
    if (trend === 'up') return <TrendingUpTwoToneIcon sx={{ ...iconStyle, color: 'green' }} />;
    if (trend === 'down') return <TrendingDownTwoToneIcon sx={{ ...iconStyle, color: 'red' }} />;
    return <RemoveIcon sx={{ ...iconStyle, color: '#999' }} />;
  };


  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'green';
    if (trend === 'down') return 'red';
    return '#666';
  };


  return (
    <><><Box sx={{ padding: 4 }}>
      {/* Top Card */}
      <Card sx={{ backgroundColor: '#73A870', borderRadius: 2, padding: isMobile?'4px':'16px', color: 'white', marginBottom: 4 }}>
        <CardContent sx={{flexDirection: isMobile ? 'column' : 'row', display: 'flex', justifyContent: 'space-between',  alignItems: isMobile ? 'flex-start' : 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700,   mb: isMobile ? 3 : 0 }}>Welcome, {username}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {userType === 'mentor' && (
              <><FormControlLabel
                control={<Checkbox
                  checked={isCompareChecked}
                  onChange={handleCompareToggle}
                  sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }} />}
                label="Compare"
                sx={{ color: '#fff' }} /><Box sx={{ marginLeft: '-10%', marginTop: '6px' }}>
                <Tooltip
                  title="When checked, charts and cards will show change vs. the previous period"
                  disableInteractive={isMobile}
                  enterTouchDelay={0}
                  arrow
                >
                  <InfoOutlinedIcon
                    sx={{
                      color: '#fff',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      mt: '2px'
                    }} />
                </Tooltip>
              </Box></>
            )}
            <Select
              value={selectedDayRange}
              onChange={handleDayChange}
              variant="outlined"
              sx={{ backgroundColor: 'white', color: '#000', borderRadius: 1, fontWeight: 600,  mt: isMobile && userType !== 'mentor' ? 1 : 0 }}
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Last 7 days">Last 7 days</MenuItem>
              <MenuItem value="Last 30 days">Last 30 days</MenuItem>
              <MenuItem value="Last 90 days">Last 90 days</MenuItem>
            </Select>
          </Box>
        </CardContent>
      </Card>

      {/* Collapsible Section for User & Payout History */}
      <Box sx={{ marginTop: 6 }}>
        <Grid container spacing={3}>
          {/* User Transaction History */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>User Transaction History</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}
                  sx={{
                    elevation: 0, // This removes MUI's default shadow
                    boxShadow: 'none', // Explicitly removes any box shadow
                    borderRadius: 2,
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'black',whiteSpace: isMobile ? 'nowrap' : 'normal' }}>Athlete Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'black',whiteSpace: isMobile ? 'nowrap' : 'normal' }}>Booking ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'black',whiteSpace: isMobile ? 'nowrap' : 'normal' }}>Session Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Duration</TableCell>
                        {userType == 'mentor' ?
                          <TableCell sx={{ fontWeight: 'bold', color: 'black',whiteSpace: isMobile ? 'nowrap' : 'normal'  }}>Earned (Post Fee)</TableCell>
                          :
                          <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Paid</TableCell>
                        }
                        <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Status</TableCell>

                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            align="center"
                            sx={{
                              fontStyle: 'italic',
                              color: '#999',
                              paddingY: 4, // Adds vertical space
                              fontSize: '1rem',
                            }}
                          >
                            No transaction history to show
                          </TableCell>
                        </TableRow>
                      ) : (
                        userTransactions.map((user, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              '&:hover': { backgroundColor: '#f5f5f5' },
                              '& td': {
                                borderBottom: index === userTransactions.length - 1
                                  ? 'none'
                                  : '1px solid #e0e0e0',
                              },
                            }}
                          >


                            <TableCell  sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: '50%',
                                      marginRight: 10,
                                      objectFit: 'cover',
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.style.display = 'none';
                                    } } />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: '50%',
                                      backgroundColor: '#e0f2f1',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginRight: 1.2,
                                    }}
                                  >
                                    <PersonIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                                  </Box>
                                )}
                                <Typography sx={{ fontWeight: 'bold', color: '#0C6697' }}>
                                  {user.name}
                                </Typography>
                              </Box>
                            </TableCell>



                            <TableCell>{user.bookingId}</TableCell>
                            <TableCell  sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}>{user.sessionDate}</TableCell>
                            <TableCell>{user.duration}</TableCell>
                            <TableCell>{user.earned}</TableCell>
                            <TableCell>
                              <Box
                                component="span"
                                sx={{
                                  backgroundColor: (() => {
                                    const s = user.status.toLowerCase();
                                    if (s === 'succeeded') return '#DFF6E0';
                                    if (s === 'failed') return '#FFE0E0';
                                    if (s === 'pending') return '#E3F2FD';
                                    if (s === 'in progress') return '#FFF9C4';
                                    if (s === 'canceled') return '#E0E0E0';
                                    return '#f5f5f5';
                                  })(),
                                  color: (() => {
                                    const s = user.status.toLowerCase();
                                    if (s === 'succeeded') return '#2E7D32';
                                    if (s === 'failed') return '#D32F2F';
                                    if (s === 'pending') return '#1565C0';
                                    if (s === 'in progress') return '#FBC02D';
                                    if (s === 'canceled') return '#424242';
                                    return '#666';
                                  })(),
                                  fontWeight: 'bold',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.85rem',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {user.status}
                              </Box>
                            </TableCell>




                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {totalTransactions > 4 && (
                    <Box sx={{ display: 'block', padding: 2, textAlign: 'right' ,marginRight:'4%'}}>
                      <Typography
                        onClick={() => {
                          setShowAllDialog(true);
                          fetchPaginatedTransactions(1); // Load first page
                        } }
                        sx={{
                          cursor: 'pointer',
                          color: '#1976d2',
                          fontWeight: 'bold',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                          View more
                      </Typography>
                    </Box>
                  )}
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Payout History */}
          {userType === 'mentor' && (

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Payout History</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}
                    sx={{
                      elevation: 0, // This removes MUI's default shadow
                      boxShadow: 'none', // Explicitly removes any box shadow
                      borderRadius: 2,
                    }}
                  >
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Initiated</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'black',whiteSpace: isMobile ? 'nowrap' : 'normal' }}>Est. Arrival</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'black', whiteSpace: isMobile ? 'nowrap' : 'normal' }}>Booking Id</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'black',whiteSpace: isMobile ? 'nowrap' : 'normal' }}>Sessions Included</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payoutHistory.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              align="center"
                              sx={{
                                fontStyle: 'italic',
                                color: '#999',
                                paddingY: 4, // Adds vertical space
                                fontSize: '1rem',
                              }}
                            >
                              No payout history to show
                            </TableCell>
                          </TableRow>
                        ) : (
                          payoutHistory.map((payout, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                '&:hover': { backgroundColor: '#f5f5f5' },
                                '& td': {
                                  borderBottom: index === payoutHistory.length - 1 ? 'none' : '1px solid #e0e0e0',
                                },
                              }}
                            >
                              <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}>{payout.initiated}</TableCell>
                              <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}>{payout.arrival}</TableCell>
                              <TableCell>
                                <Box
                                  component="span"
                                  sx={{
                                    backgroundColor: payout.status === 'Paid'
                                      ? '#DFF6E0'
                                      : payout.status === 'Failed'
                                        ? '#FFE0E0'
                                        : '#FFF5D1',
                                    color: payout.status === 'Paid'
                                      ? '#2E7D32'
                                      : payout.status === 'Failed'
                                        ? '#D32F2F'
                                        : '#F9A825',
                                    fontWeight: 'bold',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {payout.status}
                                </Box>
                              </TableCell>
                              <TableCell>{payout.amount}</TableCell>
                              <TableCell>{payout.bookingId}</TableCell>
                              <TableCell>{payout.sessionsIncluded}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                     
                    </Table>
                    {totalPayouts > 4 && (
                      <Box sx={{ display: 'block', padding: 2, textAlign: 'right' ,marginRight:'4%'}}>
                        <Typography
                          onClick={() => {
                            setShowPayoutDialog(true);
                            fetchPaginatedPayouts(1); // Load page 1
                          } }
                          sx={{
                            cursor: 'pointer',
                            color: '#1976d2',
                            fontWeight: 'bold',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                            View more
                        </Typography>
                      </Box>
                    )}
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>

          )}

        </Grid>
      </Box>
      {userType === 'mentee' && (
        <><Typography variant="h6" sx={{ fontWeight: 800, marginBottom: 2, marginTop:isMobile?'13%': '4%' }}>
          Enthusiast Performance Metrics:
        </Typography><Grid container spacing={2}>
          {userMetrics.map((metric, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{
                borderRadius: 2,
                backgroundColor: '#ffffff',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #ddd',
                // minHeight: '140px',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.12)',
                },
              }}
              >
                <CardContent>
                  {isCompareChecked && (
                    <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                      {rangeLabel}
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '2rem', // 🔥 Increased font size of the value
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {metric.value}

                    {/* 👇 Trend arrow + percentage change */}
                    {/* {isCompareChecked &&  userType !== 'mentee' &&(
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: 8,
                          fontSize: '1.1rem',
                          color: getTrendColor(metric.trend),
                        }}
                      >
                        <TrendIcon trend={metric.trend} />
                        {metric.change}
                      </span>
                    )} */}
                  </Typography>

                  <Typography variant="body1" sx={{ marginTop: 0.5, fontWeight: 700, color: '#000' }}>
                    {metric.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid></>
      )}


      {userType === 'mentor' && (
        <><Typography variant="h6" sx={{ fontWeight: 800, marginBottom: 2, marginTop:isMobile?'13%': '4%' }}>
          Expert Performance Metrics:
        </Typography><Grid container spacing={2}>
          {metrics.map((metric, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{
                borderRadius: 2,
                backgroundColor: '#ffffff',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #ddd',
                // minHeight: '140px',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.12)',
                },
              }}
              >

                {/* borderRadius: 3,
                    backgroundColor: '#ffffff',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #ddd',
                    paddingY: 2,
                    paddingX: 3,
                    minHeight: '140px',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.12)',
                    }, */}
                <CardContent>
                  {isCompareChecked && (
                    <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                      {rangeLabel}
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '2rem', // 🔥 Increased font size of the value
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {metric.value}

                    {/* 👇 Trend arrow + percentage change */}
                    {isCompareChecked && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: 8,
                          fontSize: '1.1rem',
                          color: getTrendColor(metric.trend),
                        }}
                      >
                        <TrendIcon trend={metric.trend} />
                        {metric.change}
                      </span>
                    )}
                  </Typography>

                  <Typography variant="body1" sx={{ marginTop: 0.5, fontWeight: 700, color: '#000' }}>
                    {metric.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid></>
      )}

      {/* Availability & Responsiveness */}
      {userType === 'mentor' && (
        <><Typography variant="h6" sx={{ fontWeight: 'bold', marginTop: 5, marginBottom: 2 }}>
          Availability & Responsiveness:
        </Typography><Grid container spacing={2}>
          {availabilityMetrics.map((metric, idx) => (
            <Grid item xs={12} sm={6} md={4} key={`availability-${idx}`}>
              <Card
                sx={{
                  borderRadius: 3,
                  backgroundColor: '#ffffff',
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #ddd',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent>
                  {isCompareChecked && (
                    <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                      {rangeLabel}
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.9rem',
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {metric.value}
                    {isCompareChecked && metric.change !== 'N/A' && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: 8,
                          fontSize: '1.1rem',
                          color: getTrendColor(metric.trend),
                        }}
                      >
                        <TrendIcon trend={metric.trend} />
                        {metric.change}
                      </span>
                    )}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginTop: 1, fontWeight: 700, color: '#000' }}>
                    {metric.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid></>
      )}
      {/* Earnings & Payout Metrics */}
      {userType === 'mentor' && (
        <><Typography variant="h6" sx={{ fontWeight: 'bold', marginTop: 5, marginBottom: 2 }}>
          Earnings & Payout Metrics:
        </Typography><Grid container spacing={2}>
          {earningsMetrics.map((metric, idx) => (
            <Grid item xs={12} sm={6} md={4} key={`earnings-${idx}`}>
              <Card
                sx={{
                  borderRadius: 3,
                  backgroundColor: '#ffffff',
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #ddd',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent>
                  {isCompareChecked && (
                    <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                      {rangeLabel}
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.9rem',
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {metric.value}
                    {isCompareChecked && metric.change !== 'N/A' && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: 8,
                          fontSize: '1.1rem',
                          color: getTrendColor(metric.trend),
                        }}
                      >
                        <TrendIcon trend={metric.trend} />
                        {metric.change}
                      </span>
                    )}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#000' }}>
                    {metric.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid></>
      )}
    </Box>
    <Dialog open={showAllDialog} onClose={() => setShowAllDialog(false)} fullWidth maxWidth="md">
      <DialogTitle>User Transaction History</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => setShowAllDialog(false)}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}><strong>Athlete Name</strong></TableCell>
                <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}><strong>Booking ID</strong></TableCell>
                <TableCell><strong>Session Date</strong></TableCell>
                <TableCell><strong>Duration</strong></TableCell>
                <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}><strong>Earned (Post Fee)</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.map((txn, index) => (
                <TableRow key={index}>
                  <TableCell  sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {txn.avatar ? (
                        <img
                          src={txn.avatar}
                          alt={txn.name}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            marginRight: 10,
                            objectFit: 'cover',
                          }} />
                      ) : (
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: '#e0f2f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 1.2,
                          }}
                        >
                          <PersonIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        </Box>
                      )}
                      <Typography sx={{ fontWeight: 'bold', color: '#0C6697' }}>
                        {txn.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{txn.bookingId}</TableCell>
                  <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}>{txn.sessionDate}</TableCell>
                  <TableCell>{txn.duration}</TableCell>
                  <TableCell>{txn.earned}</TableCell>

                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: (() => {
                          const s = txn.status.toLowerCase();
                          if (s === 'succeeded') return '#DFF6E0';
                          if (s === 'failed') return '#FFE0E0';
                          if (s === 'pending') return '#E3F2FD';
                          if (s === 'in progress') return '#FFF9C4';
                          if (s === 'canceled') return '#E0E0E0';
                          return '#f5f5f5';
                        })(),
                        color: (() => {
                          const s = txn.status.toLowerCase();
                          if (s === 'succeeded') return '#2E7D32';
                          if (s === 'failed') return '#D32F2F';
                          if (s === 'pending') return '#1565C0';
                          if (s === 'in progress') return '#FBC02D';
                          if (s === 'canceled') return '#424242';
                          return '#666';
                        })(),
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {txn.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(totalTransactions / pageSize)}
            page={page}
            onChange={(_, newPage) => fetchPaginatedTransactions(newPage)}
            shape="rounded"
            siblingCount={1}
            boundaryCount={1} />
        </Box>
      </DialogContent>
    </Dialog></><Dialog open={showPayoutDialog} onClose={() => setShowPayoutDialog(false)} fullWidth maxWidth="md">
      <DialogTitle>Payout History</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => setShowPayoutDialog(false)}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f9fafb' }}>
              <TableRow>
                <TableCell><strong>Initiated</strong></TableCell>
                <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}><strong>Est. Arrival</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}><strong>Booking Id</strong></TableCell>
                <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}><strong>Sessions Included</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPayouts.map((payout, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}>{payout.initiated}</TableCell>
                  <TableCell sx={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }} >{payout.arrival}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: payout.status === 'Paid' ? '#DFF6E0' :
                          payout.status === 'Failed' ? '#FFE0E0' :
                            '#FFF5D1',
                        color: payout.status === 'Paid' ? '#2E7D32' :
                          payout.status === 'Failed' ? '#D32F2F' :
                            '#F9A825',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                      }}
                    >
                      {payout.status}
                    </Box>
                  </TableCell>
                  <TableCell>{payout.amount}</TableCell>
                  <TableCell>{payout.bookingId}</TableCell>
                  <TableCell>{payout.sessionsIncluded}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(totalPayouts / payoutPageSize)}
            page={payoutPage}
            onChange={(_, newPage) => fetchPaginatedPayouts(newPage)}
            shape="rounded"
            siblingCount={1}
            boundaryCount={1} />
        </Box>
      </DialogContent>
    </Dialog></>

  
  );
  
};

export default DashboardAnalytics;
