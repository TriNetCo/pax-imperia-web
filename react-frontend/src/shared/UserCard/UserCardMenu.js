import { IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { useState } from 'react';


const UserCardMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div className='menu'>
        <IconButton onClick={handleClick}>
          <MenuIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleClose}><PeopleIcon /> Friend List</MenuItem>
          <MenuItem onClick={handleClose}><SettingsIcon /> Account</MenuItem>
          <MenuItem onClick={handleClose}><LogoutIcon /> Logout</MenuItem>
        </Menu>
      </div>
    </>
  );
};

export default UserCardMenu;
