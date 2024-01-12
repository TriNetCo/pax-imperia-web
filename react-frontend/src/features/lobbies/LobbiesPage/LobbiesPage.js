import UserCard from 'src/shared/UserCard/UserCard';
import './LobbiesPage.css';
import {bindActionCreators} from '@reduxjs/toolkit';
import {connect} from 'react-redux';
import * as lobbySliceActions from 'src/features/Lobbies/lobbiesSlice';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import LobbiesListing from './LobbiesListing';

const LobbiesPage = ({
    lobbies,
    actions,
    ...props
}) => {

    useEffect(() => {
        actions.fetchAllLobbies()
            .catch((error) => {
                alert('Loading lobbies failed HOW DO I CATCH HERE'); });
    }, []);

    return (
        <>
            <UserCard />
            <div className="newgame-wrap">
                <div className="big-header">Multiplayer Games</div>

                <div>
                    <div>Enter Lobby Code</div>
                    <input type="text"></input>
                    <button>Search (disabled)</button>
                </div>

                <LobbiesListing lobbies={lobbies} />

            </div>
        </>
    );
};

function mapStateToProps(state) {
    return {
        lobbies: state.lobbies.lobbies,
        lobbySlice: state.lobbies,
    };
}

// this fancy method gets installed into the component's props for you per the export line below
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            fetchAllLobbies: bindActionCreators(lobbySliceActions.fetchAll, dispatch),
        },
    };
}

LobbiesPage.propTypes = {
    lobbies: PropTypes.array.isRequired,
    actions: PropTypes.array.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(LobbiesPage);
