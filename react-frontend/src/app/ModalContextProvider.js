import React from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../features/Modal/Modal';


/**
 * @typedef {object} ModalContextProviderProps
 * @property {ModalManager} modal
 * @property {function} refreshModal
 */
/**
 * @type {React.Context<ModalContextProviderProps>}
 */
export const ModalContext = React.createContext(null);

const ModalContextProvider = ({children, injectedModal}) => {
    const [_modal] = useState(injectedModal); // is this redundant?
    const [key, setKey] = useState(0);

    const refreshModal = () => {
        setKey(prevKey => prevKey + 1);
    };

    injectedModal.injectReactGarbage({refreshModal});

    return (
        <ModalContext.Provider value={{modal: _modal, updateData: refreshModal, key}}>
            <Modal />
            {children}
        </ModalContext.Provider>
    );
};

ModalContextProvider.propTypes = {
    children: PropTypes.element.isRequired,
    injectedModal: PropTypes.object,
};

export default ModalContextProvider;
