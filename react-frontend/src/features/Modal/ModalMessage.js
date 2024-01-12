import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';


const ModalMessage = ({ message, onClose }) => {
    return (
        <div className="modal-message">
            <span className="close" onClick={onClose}>&times;</span>

            <div className="modal-message-header">
                {message.title}
            </div>
            <div className="modal-message-body">
                {message.body}
            </div>
            <div className="modal-message-footer">
                <Button variant="contained" onClick={onClose}>
                    OK
                </Button>
            </div>
        </div>
    );
};

ModalMessage.propTypes = {
    message: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ModalMessage;
