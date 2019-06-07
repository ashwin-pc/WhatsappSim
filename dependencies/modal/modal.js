/*!
 * Modal v1.3 (update gist link)
 * Author: Ashwin P Chandran
 * Licensed under MIT
 */

(function (window) {

    /**
     * Modal - Modal Controller Class
     * @param {Node} containerEle - DOM Container element
     */
    function ModalController() {
        insertModal();
        return openModal;
    }

    function insertModal() {
        $("body").append(`<div id="modal" class="modal">
                                <div class="contents">
                                    <h1 class="title">Title</h1>
                                    <p class="message">Message</p>
                                </div>
                                <div class="modal-btns">
                                    <button class="button deny">No</button>
                                    <button class="button confirm">Yes</button>
                                </div>
                            </div>`);
    }

    function openModal(title, msg, ...params) {
        $("#modal .title").text(title);
        $("#modal .message").text(msg);

        console.log(params);
        // params[0]();
        
        switch (params.length) {
            case 0:
                $("#modal .modal-btns .button").addClass("hide");
                break;
            
            case 1:
                $("#modal .modal-btns .button").removeClass("hide");
                $("#modal .modal-btns .deny").addClass("hide");
                $("#modal .modal-btns .confirm").on("click.modal", function () {
                    if (typeof params[0] === "function") {
                        params[0]();
                    }
                    $("#modal .modal-btns .confirm").off("click.modal");
                    $("#modal").removeClass("open");
                });
                break;

            case 2:
                $("#modal .modal-btns .button").removeClass("hide");
                $("#modal .modal-btns .confirm").on("click.modal", function () {
                    $("#modal").removeClass("open");
                    $("#modal .modal-btns .confirm").off("click.modal");

                    if (typeof params[0] === "function") {
                        params[0]();
                    }
                });
                $("#modal .modal-btns .deny").on("click.modal", function () {
                    $("#modal .modal-btns .deny").off("click.modal");
                    $("#modal").removeClass("open");

                    if (typeof params[1] === "function") {
                        params[1]();
                    }
                });
                break;
        
            default:
                break;
        }


        $("#modal").addClass("open");
    }
    

    /**
     * Initialize the Library
     * define globally if it doesn't already exist
     */
    if (typeof (modal) === 'undefined') {
        document.addEventListener("DOMContentLoaded", function() {
            window.modal = ModalController();
        });
    }
    else {
        console.log("Modal Library already defined.");
    }
})(window)  