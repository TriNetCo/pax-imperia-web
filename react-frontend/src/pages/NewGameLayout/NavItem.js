import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';


const NavItem = ({ text, path, altPath }) => {
    const location = useLocation();

    // This function checks if the current page is the one that is being displayed
    // If it is, it returns the active class, otherwise it returns an empty string
    const isActive = () => {
        if (location.pathname === path
            || (altPath && location.pathname.includes(altPath)) ) {
            return 'breadcrumb-item active';
        } else {
            return 'breadcrumb-item';
        }
    };

    return (
        <li className={isActive(path)}>
            <Link to={path}>{text}</Link>
        </li>
    );
};

NavItem.propTypes = {
    text: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    altPath: PropTypes.string
};

export default NavItem;
