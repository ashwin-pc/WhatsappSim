/*!
 * Toasts v1.3 (https://gist.github.com/ashwin-pc/d7ea40f341739a034e332f63d9e5a070)
 * Author: Ashwin P Chandran
 * Licensed under MIT
 */

(function (window) {

    /**
     * Toast - Toast Controller Class
     * @param {Node} containerEle - DOM Container element
     */
    function ToastContainer() {
        // TODO : Gravity (add to comments the options and impliment)
        // TODO : Remove styles from css if possible
        // Append Toast container to page
        var containerTopEle = document.createElement("div");
        containerTopEle.id = "toast-container-top";
        document.body.appendChild(containerTopEle);

        var containerBottomEle = document.createElement("div");
        containerBottomEle.id = "toast-container-bottom";
        document.body.appendChild(containerBottomEle);

        // Set defaults
        this.topToastContainerEle = containerTopEle;
        this.bottomToastContainerEle = containerBottomEle;
        this.message = "Something went wrong, Try Again";
        this.timeout = 5000;
        this.logging = false;
        this.gravity = 'top';
        this.dismiss = true;
        this.vibrate = 300;
    }
    /**
     * Show Toast
     * @param {String} msg Toast Message
     * @param {Object} [options] Individual Toast options to override the defaults
     * @param {Number} [options.timeout] - Toast default timeout
     * @param {Boolean} [options.dismiss] - Toast dismissible?
     * @param {Number} [options.vibrate] - Toast vibration length
     * @param {String} [options.gravity] - Toast default gravity
     * @param {Boolean} [options.logging] - Toast default logging option
     * @param {Function} [callback]
     */
    ToastContainer.prototype.toast = function (msg, options, callback) {
        var self = this;
        var toastInstance = {};

        // Options
        var opt = options || {}
        var m = msg || this.message;
        var t = opt.timeout || this.timeout;
        var d = opt.dismiss || this.dismiss;
        var v = opt.vibrate || this.vibrate;
        var g = opt.gravity || this.gravity;
        var log = opt.logging || this.logging;
        var click = opt.click || null;

        // Create HTML
        var containerEle = self.containerEle = (g === "top") ? this.topToastContainerEle : this.bottomToastContainerEle;
        var toastEle = self.toastEle = document.createElement("div");
        toastEle.classList.add("simple-toast");
        toastEle.innerHTML = m;
        toastEle.classList.add(g);
        containerEle.appendChild(toastEle);
        toastInstance.msg = m;

        // Slide in toast
        setTimeout(function () {
            toastEle.classList.add("show");
            if ("vibrate" in navigator && v) {
                navigator.vibrate(v);
            }
        }, 500);

        // Slide out toast
        setTimeout(function () {
            toastEle.classList.remove("show");
        }, t + 500);

        // Remove from DOM
        self.removeTimeout = setTimeout(function () {
            containerEle.removeChild(toastEle);
            removeEvents(toastInstance);
        }, t + 700);

        // Log Error
        if (log) {
            console.log(m);
        }

        // Dismiss toast
        if (d) {
            // For keypress
            toastInstance.keyDownEvent = function (e) {
                var hasValidKey = ["Escape"].filter(function (key) {
                    return key == e.code;
                }).length

                if (hasValidKey) {
                    self.removeToast(toastInstance);
                }
            }

            document.addEventListener("keydown", toastInstance.keyDownEvent);

            // For mouseclick
            toastInstance.mouseEvent = function () {
                self.removeToast(toastInstance);
            }
            toastEle.addEventListener("click", toastInstance.mouseEvent);
        }

        // Copy toast text
        if (click) {
            toastEle.addEventListener("click", function mouseclick() {
                click(m);
                toastEle.removeEventListener("click", mouseclick);
            })
        }

        if (callback) {
            return callback(null, m);
        } else {
            return 
        }
    }

    /**
     * remove toast when dismissed
     * @param {Function} dismissEvent event handler function to remove for action
     */
    ToastContainer.prototype.removeToast = function (toastInstance) {
        var self = this;
        clearTimeout(self.removeTimeout);
        self.toastEle.classList.remove("show");
        removeEvents(toastInstance)
        setTimeout(function () {
            self.containerEle.removeChild(self.toastEle);
        }, 200);
    }

    function removeEvents(toastInstance) {
        document.removeEventListener("keydown", toastInstance.keyDownEvent);
        document.removeEventListener("click", toastInstance.mouseEvent);
    }

    /**
     * Initialize the Library
     * define globally if it doesn't already exist
     */
    if (typeof (toast) === 'undefined') {
        document.addEventListener("DOMContentLoaded", function() { 
            var toastCtlr = new ToastContainer();
            window.toast = toastCtlr.toast.bind(toastCtlr);
        });
    }
    else {
        console.log("Toast Library already defined.");
    }
})(window)  