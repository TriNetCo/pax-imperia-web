import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { wsConnect, wsDisconnect } from '../modules/websocket';
// import { startRound, leaveGame, makeMove } from '../modules/game';
import WithAuth from '../hocs/AuthenticationWrapper';

class Game extends React.Component {
    componentDidMount() {
        const { id } = this.props;
        if (id) {
            //   this.connectAndJoin();
        }
    }

    connectAndJoin = () => {
        const { id, dispatch } = this.props;
        const host = 'ws://127.0.0.1:4000/websocket';
        // const host = `ws://127.0.0.1:8000/ws/game/${id}?token=${localStorage.getItem('token')}`;
        dispatch(wsConnect(host));
    };


    render() {
    // abridged for brevity
        return `${<span> LOADING </span>}`;
    }

}

const s2p = (state, ownProps) => ({
    id: ownProps.match && ownProps.match.params.id,
});

Game.propTypes = {
    id: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
};

export default WithAuth(connect(s2p)(Game));
