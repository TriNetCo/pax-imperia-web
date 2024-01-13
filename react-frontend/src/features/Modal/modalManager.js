
const displayModal = (modal) => {
    window.modalShown = true;
    document.getElementById('modal').style.display = 'block';
    modal.refreshModal();
};

class ModalManager {

    injectReactGarbage({refreshModal}) {
        this.refreshModal = refreshModal;
    }

    /**
     * Displays a message box.
     *
     * @param {*} params
     * @param {string} params.title
     * @param {string} params.body
     */
    msgBox(params) {
        this.type = 'MESSAGE';
        this.message = {
            title: params.title,
            body: params.body,
        };

        if (params.cb) {
            window.modalCb = params.cb;
        }

        displayModal(this);
    };

    /**
     * Shows a particular modal.
     * @param {string} type - The type of modal to show, e.g. 'CHAT_LOBBY'.
     */
    show(type) {
        this.type = type;
        displayModal(this);
    }

    /**
     * Shows space view object info on the modal, e.g. plant, ship, wormhole, system.
     * @param {Entity} entity
     */
    showObjectInfo(entityData) {
        this.type = 'OBJECT_INFO';
        this.objectInfoEntity = entityData;
        displayModal(this);
    }

    // Any time the entity's data changes, we need to refresh the modal so
    // the user sees the latest data.

    updateEntity(entity) {
        // compare the incoming entity to the current entity to see if anything has changed
        // if nothing has changed, then don't refresh the modal

        this.objectInfoEntity = {...entity};
        this.refreshModal();
    }

}

export default ModalManager;
