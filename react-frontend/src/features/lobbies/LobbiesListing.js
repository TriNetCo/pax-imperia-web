import LobbyEntry from './LobbyEntry';
import PropTypes from 'prop-types';

const LobbiesListing = ({lobbies}) => {
    return (
        <div className="lobbies-listing">
            {
                lobbies.map( (lobby, index) => {
                    return (
                        <LobbyEntry key={index} lobby={lobby} />
                    );
                })
            }
        </div>
    );
};

LobbiesListing.propTypes = {
    lobbies: PropTypes.array.isRequired,
};

export default LobbiesListing;
