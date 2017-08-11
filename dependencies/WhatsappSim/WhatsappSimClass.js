/**
 * Whatsapp Simulator Class
 * A class to handle all parts of simulating a whatsapp conversation from existing text
 */
(function (window) {
    /**
     * WhatsappSimClass
     * The class object to simulate whatsapp
     */
    function WhatsappSimClass() {
        // Defaults
        this.replayInterval = 1000;
        this.replayType = 'auto';
        this.replayScalingFactor = 1;
        this.state = "paused";
        this.queue = [];
        this.conversation = [];

        // Types of formats
        this.types = [
            {
                name: "email",
                testRegex: /^\d{2}\/\d{2}\/\d{2},\s\d{1,2}:\d{2}\s[AP]M/,
                splitRegx: /(\s-\s|\:\s)/
            }, {
                name: "copyWeb",
                testRegex: /^\[\d{1,2}:\d{2}\s[AP]M,\s\d{1,2}\/\d{1,2}\/20\d{2}\]/,
                splitRegx: /(\]\s|\:\s)/,
                hasBracket: true
            }, {
                name: "copyPhone",
                testRegex: /^\[\d{2}\/\d{2},\s\d{1,2}:\d{2}\s[AP]M\]/,
                splitRegx: /(\]\s|\:\s)/,
                hasBracket: true
            }
        ]
    }

    /**
     * parse()
     * The function to parse the whatsapp text and return an conversation object
     * @param {String} txt The formatted string exported or copied from whatsapp 
     * @param {Object} [options] Parsing Options 
     * @return {Object} An Object with an array of conversation objects or error if format not found
     */
    WhatsappSimClass.prototype.parse = function parse(txt, options) {
        var self = this;
        var opts = options || {};
        var txtArr = txt.split('\n');
        var type, txtObArr = [], txtOb = null, lineSplit, authors = [], noSelfPresent = true;

        // Identify the format of the text
        type = identifyWAT(txtArr[0], self);
        console.log(type);
        if (type === null) {
            return {
                status: false,
                err: "Does not match a known format"
            };
        }

        // Construct Parsed Object
        txtArr.forEach(function (line) {
            var testType = type.testRegex.test(line);
            if (testType) {

                // Check if the text Object is empty 
                // (if it passes the test type check, it will skip this condition only for the first message)
                if (txtOb !== null) {
                    txtObArr.push(txtOb);
                    txtOb = null;
                }

                // Form the basic message
                lineSplit = line.split(type.splitRegx);
                txtOb = {
                    date: lineSplit[0],
                    name: lineSplit[2],
                    txt: lineSplit.splice(4).join("")
                };

                // Handle bracket format
                if (type.hasBracket) {
                    txtOb.date = txtOb.date.substring(1);
                }

                // Set the timestamp field
                setTimestamp(txtOb, txtObArr);

                // If for yourself the name and number is present replace it in the chat
                if (opts.me && opts.me.name && opts.me.number) {
                    // Incase log contains your number and not name
                    if (opts.me.number == txtOb.name) {
                        txtOb.name = opts.me.name
                    }

                    // Indicate that it is you
                    if (opts.me.name == txtOb.name) {
                        txtOb.self = true;
                        noSelfPresent = false;
                    }
                }

                // Check if the message is a continuation message of the same author
                var prevTxt = txtObArr[txtObArr.length - 1];
                if (txtObArr[0] && (txtOb.name == prevTxt.name)) {
                    prevTxt.continuation = true;
                } else {
                    txtOb.tail = true;
                }

                // Handle media ommitted
                if (txtOb.txt == "<Media omitted>") {
                    txtOb.txt = "<i>Cannot show media</i>";
                }

                // Add author to authors list
                var exists = false;
                authors.forEach(function (author) {
                    if (author == txtOb.name) {
                        exists = true
                    }
                }, this);
                if (!exists) {
                    authors.push(txtOb.name)
                }

            } else {
                if (txtOb !== null) {
                    txtOb.txt += '\n';
                    txtOb.txt += line;
                }
            }

        }, this);

        txtObArr.push(txtOb);

        // For group conversations build author field
        setAuthorField(txtObArr, authors, noSelfPresent);

        // Store conversation array
        if (!opts.dontStore) {
            self.conversation = txtObArr;
            self.queue = JSON.parse(JSON.stringify(self.conversation))
        }
        return {
            status: true,
            conversation: txtObArr
        };
    }

    /**
     * startSimulation
     * begin the simulation
     */
    WhatsappSimClass.prototype.startSimulation = function startSimulation() {
        var self = this;
        self.state = "running";
        scheduler(self);
    }

    /**
     * pauseSimulation
     * pause the simulation
     */
    WhatsappSimClass.prototype.pauseSimulation = function pauseSimulation() {
        var self = this;
        self.state = "paused";
        scheduler(self);
    }

    /**
     * stopSimulation
     * stop the simulation
     */
    WhatsappSimClass.prototype.stopSimulation = function stopSimulation() {
        var self = this;
        self.state = "stopped";
        scheduler(self);
    }

    /**
     * resetSimulation
     * reset the simulation from the begining
     */
    WhatsappSimClass.prototype.resetSimulation = function resetSimulation() {
        var self = this;
        self.state = "reset";
        scheduler(self);
    }

    /**
     * config()
     * Configure the simulation Library
     * @param {Object} options Set the configuration options
     */
    WhatsappSimClass.prototype.config = function config(options) {
        var self = this;
        var opts = options || {};

        // Set options
        self.replayType = (opts.replayType) ? opts.replayType : self.replayType;
        self.replayInterval = (opts.replayInterval) ? opts.replayInterval : self.replayInterval;
    }

    /**
     * addFormat()
     * Add additional parsing formats
     * @param {Object} format The Format object of the parser
     * @return {Object} Returns error or success status
     */
    WhatsappSimClass.prototype.addFormat = function addFormat(format) {
        var self = this;

        // Check if the formats is correct
        if (!format.name || !format.testRegex || !format.splitRegx) {
            return {
                status: false,
                err: "Incorrect format type"
            }
        }

        self.types.push(format);
        return { status: true };
    }

    /**
     * IdentifyWAT Function (Private)
     * Used to identify the type of format used in the text
     */
    function identifyWAT(txt, self) {
        var t = null;
        self.types.forEach(function (type) {
            if (type.testRegex.test(txt)) {
                t = type;
            }
        }, this);

        return t;
    }

    /**
     * setTimestamp (Private)
     * used to set the timestamp information on the message
     * @param {Object} msg the current message to be modified with the timestamp field
     * @param {Array} prevMsgArray the array of message objects added so far
     */
    function setTimestamp(msg, prevMsgArray) {
        // Extract the time field from the message
        var timeRegex = /\d{1,2}:\d{2}\s[AP]M/g;
        msg.timestamp = timeRegex.exec(msg.date);

        // Find time difference between the messages and set the time factor
        // The time factor will be a value between 100 - 500 for messages within 4 mins
        // and between 1000 - 2000 for messages between 5 - 30 mins
        // and 5000 for anything longer than 30 mins

        var len = prevMsgArray.length;
        if (len) {
            var d1 = prevMsgArray[len-1].date.split(timeRegex).join();
            var d2 = msg.date.split(timeRegex).join();
            var diff;

            // Check if dates are different
            if (d1 != d2) {
                msg.timeInterval = 5000;
                return;
            } 

            d1 = new Date("1/1/2000 " + msg.timestamp);
            d2 = new Date("1/1/2000 " + prevMsgArray[len-1].timestamp);
            diff = (d1 - d2) / 60000; // To convert difference to mins

            // Set interval based on time difference
            if (diff < 5) {
                msg.timeInterval = (diff + 1) * 100;
            } else if (diff <= 30) {
                msg.timeInterval = 40 * diff + 800;
            } else {
                msg.timeInterval = 5000;
            }
        }

    }

    /**
     * setAuthorField()
     * for group conversations set the author field
     * @param {Array} conversations array of messages
     * @param {Array} authors array of authors
     * @param {Boolean} force force the autor field to be populated
     */
    function setAuthorField(conversations, authors, force) {
        if (authors.length <= 2 && !force) {
            return;
        }

        conversations.forEach(function (msg) {
            authors.forEach(function (author, authorIndex) {
                if (msg.name == author) {
                    msg.authorId = authorIndex + 1;
                }
            }, this);
        }, this);
    }

    /**
     * getNextInterval() (Private)
     * gets the wait time for the next message
     * @param {Object} msg the message object that is to be emmitted next
     * @param {Object} self the message object that is to be emmitted next
     * @return {Number} time in milliseconds for the next message
     */
    function getNextInterval(msg, self) {
        var time = 0;

        if (!msg) {
            return time;
        }

        switch (self.replayType) {
            case "random":
                // TODO: Generate a value between 0.5 and 5 seconds with a mean of 1
                var min = 0.5;
                var max = 2;
                time = Math.floor(Math.random() * (max - min + 1) + min) * 1000 * self.replayScalingFactor;
                break;

            case "time":
                time = msg.timeInterval * self.replayScalingFactor;
                break;

            case "auto":
            default:
                time = self.replayInterval * self.replayScalingFactor;
                break;
        }

        return time;
    }

    /**
     * Sceduler (Private)
     * Self calling function that executes a task from the scheduled list of tasks to execute
     */
    function scheduler(self) {
        // Check state
        switch (self.state) {
            case "running":

                if (self.queue.length) {
                    // Execute
                    var msg = self.queue.shift();
                    self.onMessage(msg);

                    // Clear existing timeouts and Set timeout
                    var timeoutPeriod = getNextInterval(self.queue[0], self);
                    clearTimeout(self.timeoutInstance);
                    self.timeoutInstance = setTimeout(function () {
                        scheduler(self);
                    }, timeoutPeriod);
                } else {
                    self.state = "stopped";
                }

                break;

            case "reset":
                self.queue = JSON.parse(JSON.stringify(self.conversation));
                self.state = "running";
                clearTimeout(self.timeoutInstance);
                scheduler(self);
                break;

            case "stopped":
                self.queue.length = 0;
                break;

            case "paused":
            default:
                break;
        }
    }

    /**
     * Initialize the Library
     * define globally if it doesn't already exist
     */
    if (typeof (WhatsappSim) === 'undefined') {
        window.WhatsappSim = new WhatsappSimClass();
    }
    else {
        console.log("WhatsappSim Library already defined.");
    }
})(window)