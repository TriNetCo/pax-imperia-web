

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

        window.modalShown = true;
        document.getElementById('modal').style.display = 'block';
        this.refreshModal();
    };

    show(type) {
        this.type = type;
        window.modalShown = true;
        document.getElementById('modal').style.display = 'block';
        this.refreshModal();
    }
}

export default ModalManager;
