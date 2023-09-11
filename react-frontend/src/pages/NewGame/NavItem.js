import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavItem = ({ text, path }) => {
  const location = useLocation();

  // This function checks if the current page is the one that is being displayed
  // If it is, it returns the active class, otherwise it returns an empty string
  const isActive = (page) => {
    if (location.pathname === page) {
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
  path: PropTypes.string.isRequired
};

export default NavItem;
