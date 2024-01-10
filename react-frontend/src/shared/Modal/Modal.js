import React from 'react';
import './Modal.css';
import ChatLobby from 'src/pages/ChatPage/ChatLobby';

const Modal = () => {
    const ref = React.createRef();;

    const closeModal = () => {
        ref.current.style.display = 'none';
        window.modalShown = false;
    };

    const modalContentClicked = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div ref={ref} id="modal" onClick={closeModal}>
            <div className="content-wrap" onClick={modalContentClicked}>

                <ChatLobby closeModal={closeModal} />



                {/* <div className="modal-body">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <div id="modalContent">
                    </div>
                </div> */}

            </div>

        </div>
    );
};

export default Modal;
