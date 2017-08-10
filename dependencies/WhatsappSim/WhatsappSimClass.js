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
        this.replaySpeed = 1000;
        this.replayType = 'auto';
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
                if (txtOb !== null) {
                    txtObArr.push(txtOb);
                    txtOb = null;
                }

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
                setTimestamp(txtOb);

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
                var prevTxt = txtObArr[txtObArr.length-1];
                if (txtObArr[0] && (txtOb.name == prevTxt.name)) {
                    prevTxt.continuation = true;
                } else {
                    txtOb.tail = true;
                }

                // Add author to authors list
                var exists = false;
                authors.forEach(function(author) {
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
        self.replaySpeed = (opts.replaySpeed) ? opts.replaySpeed : self.replaySpeed;
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
        return {status:true};
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
     */
    function setTimestamp(msg) {
        var timeRegex = /\d{1,2}:\d{2}\s[AP]M/g;
        msg.timestamp = timeRegex.exec(msg.date);
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

        conversations.forEach(function(msg) {
            authors.forEach(function(author, authorIndex) {
                if (msg.name == author) {
                    msg.authorId = authorIndex + 1;
                }
            }, this);
        }, this);
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
                    var timeoutPeriod = (self.replayType == 'auto' || !msg.timeout) ? self.replaySpeed : msg.timeout;
                    clearTimeout(self.timeoutInstance);
                    self.timeoutInstance = setTimeout(function() {
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