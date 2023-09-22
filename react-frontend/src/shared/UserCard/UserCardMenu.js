import React from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { useContext, useState } from 'react';
import UserContext from '../../app/UserContext';

const UserCardMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const userContext = useContext(UserContext);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAccount = () => {
        setAnchorEl(null);

        alert('TODO: Add account settings when more backend stuff is finished.');
    };

    const handleLogout = () => {
        userContext.logout();
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
                    <MenuItem onClick={handleAccount}><SettingsIcon /> Account</MenuItem>
                    <MenuItem onClick={handleClose}><LogoutIcon /> Leave Game</MenuItem>
                    <MenuItem onClick={handleLogout}><LogoutIcon /> Logout</MenuItem>
                </Menu>
            </div>
        </>
    );
};

export default UserCardMenu;
