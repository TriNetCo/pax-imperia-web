import PropTypes from 'prop-types';

const Planet = ({ entity, onClose }) => {
    const { name, colony} = entity;

    return (
        <div className="planet modal-message">
            <span className="close" onClick={onClose}>&times;</span>

            <div className="upper-segment">
                <div>
                    {entity.type.toUpperCase()}: {entity.name}
                </div>
                <div>
                Player: {entity.playerId}
                </div>
            </div>

            <div className="resources">
                <div>
                    Population: {colony.population}
                </div>
                <div>
                    Food: {colony.food}
                </div>
                <div>
                    Wood: {colony.wood}
                </div>
            </div>

            <button>Abandon</button>


        </div>
    );
};

Planet.propTypes = {
    entity: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Planet;
