import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Props {
  title: string;
  id: string;
  colorInvert?: boolean;
}

const NavItem = ({
  title,
  id,
  colorInvert = false,
}: Props): JSX.Element => {
  const [openedPopoverId, setOpenedPopoverId] = useState(null);

  const handleClick = (event, popoverId) => {
    setOpenedPopoverId(popoverId);
  };

  const linkColor = colorInvert ? 'common.white' : 'text.primary';

  return (
    <Box>
      <Box
        display={'flex'}
        alignItems={'center'}
        aria-describedby={id}
        sx={{ cursor: 'pointer' }}
        onClick={(e) => handleClick(e, id)}
      >
        <Typography
          fontWeight={openedPopoverId === id ? 700 : 400}
          color={linkColor}
          fontSize={'20px'}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default NavItem;
