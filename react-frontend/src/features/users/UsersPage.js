import { bindActionCreators } from '@reduxjs/toolkit';
import React from 'react';
import { connect } from 'react-redux';
import * as userSliceActions from './usersSlice';
import UserList from './UserList';

const UsersPage = ({
  users,
  actions,
  ...props
}) => {
  const initRedux = () => {
    actions.fetchAllUsers()
      .catch((error) => {
        alert('Loading users failed HOW DO I CATCH HERE'); });
  };

  const handleDeleteUser = (user) => {
    // const userWantsToDelete = confirm("Are you sure?");
    const userWantsToDelete = true;
    if (userWantsToDelete) {
      console.log('User deleted');
      actions.deleteUser(user.id).catch((error) => {
        console.log('Delete failed. ' + error.message);
      });
    }
  };

  return (
    <div>
      <UserList users={users} onDeleteClick={handleDeleteUser} />

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
      deleteUser: bindActionCreators(userSliceActions.deleteUser, dispatch),
    },
  };
}

// export default UsersPage;
export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);
