import { bindActionCreators } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import * as userSliceActions from "./usersSlice";
// import {
//   decrement,
//   increment,
//   incrementByAmount,
//   incrementAsync,
//   incrementIfOdd,
//   selectCount,
// } from './usersSlice';
import styles from './Users.module.css';

const UsersPage = ({
  users,
  actions,
  ...props
}) => {
  // const count = useSelector(selectCount);
  const dispatch = useDispatch();
  // const users = useSelector(state => state.users);
  // const [incrementAmount, setIncrementAmount] = useState('2');

  // const incrementValue = Number(incrementAmount) || 0;

  const initRedux = () => {
    actions.fetchAllUsers()
        .catch((error) => {
          alert("Loading users failed HOW DO I CATCH HERE"); });
  }

  return (
    <div>
      <h1>Users:</h1>
      <div className={styles.row}>
        John Doe | john@example.com | admin | show
      </div>
      <div className={styles.row}>
        Jane Doe | jane@example.com | user | show
      </div>

      <button onClick={initRedux}>Initiate Redux Thing</button>
    </div>
  );
};


function mapStateToProps(state) {
  return {
    users: state.users.users,
    userSlice: state.users,
  };
}

// this fancy method gets installed into the component's props for you per the export line below
function mapDispatchToProps(dispatch) {
  return {
    actions: {
      fetchAllUsers: bindActionCreators(userSliceActions.fetchAll, dispatch),
    },
  };
}

// export default UsersPage;
export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);