/**
 * Initialize the Simulation Library
 */ 
(function () {
    WhatsappSim.onMessage = function (msg) {
        $("#output")
            .append(WhatsappSim.createMsgElement(msg))
            .show();

        updateStats();

        $("#output")[0].scrollTop = $("#output")[0].scrollHeight;
    }

    WhatsappSim.onComplete = function () {
        updateStats();
    }

    $(document).ready(function () {

        // Load conversation if exists
        if (location.hash !== "") {
            var url = "./api.php/records/conversations?filter=hashid,eq," + location.hash.slice(1);
            $.ajax({
                url: url,
                success: function (data) {
                    if(!data.records.length) {
                        return loadDefaultData();
                    }
                    
                    var wsimParams = JSON.parse(decodeURI(data.records[0].params));
                    WhatsappSim.loadInstance(wsimParams);
                    WhatsappSim.authors = JSON.parse(decodeURI(data.records[0].authors));
                    WhatsappSim.conversation = JSON.parse(decodeURI(data.records[0].conversation));
                    WhatsappSim.resetSimulation();

                    initInputs();
                    $(".media-btn").prop("disabled", false);
                }
            });
        } else {
            loadDefaultData();
        }
    })
})();

function loadDefaultData() {
    // Load the default startup conversation
    $.ajax({
        url: "./data/default.txt",
        success: function (data) {
            WhatsappSim.parse(data)
            WhatsappSim.setPrimaryAuthor("Ashwin")
            WhatsappSim.config({
                replayType: "word"
            })
            WhatsappSim.startSimulation()
        }
    })
}


/**
 * Define and setup the Parsing inputs
 */
var $input = $("input[type=file]").first();
$input.on("change", function () {
    var self = this;

    // Read file
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        var convo = WhatsappSim.parse(text);

        if (!convo.status) {
            alert(convo.err);
            return;
        }

        initInputs();
        $(".media-btn").prop("disabled", false);
    };
    reader.readAsText(self.files[0]);
})

$("textarea").on("change", function () {
    var text = $(this).val();

    var convo = WhatsappSim.parse(text);

    if (!convo.status) {
        alert(convo.err);
        return;
    }

    initInputs();
    $(".media-btn").prop("disabled", false);
})


/**
 * Setup the play, pause, stop and reset buttons
 */
$(".play").on("click", function () {
    setParams();
    WhatsappSim.startSimulation()
    updateStats();
})
$(".pause").on("click", function () {
    WhatsappSim.pauseSimulation()
    updateStats();
})
$(".stop").on("click", function () {
    $("#output").html("");
    WhatsappSim.stopSimulation()
    updateStats();
})
$(".reset").on("click", function () {
    $("#output").html("");
    setParams();
    WhatsappSim.resetSimulation()
    updateStats();
})

/**
 * Setup share functionality
 * - Share via link
 * - Share via Whatsapp
 */
$(".share").on("click", function () {
    shareChat(function(hashid) {
        var msg = location.origin + location.pathname + "#" + hashid;
        toast(msg + "     <span style='color:grey'>Click to Copy</span>", {timeout: 20000, click: copyToClipboard.bind(this,msg)});
    })
})

$('#whatsapp-share').on("click", function (e) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        shareChat(function (hashid) {
            var message = "See a conversation between " + WhatsappSim.authors.join(", ") + " at " + location.origin + location.pathname + "%23" + hashid;
            var whatsapp_url = "whatsapp://send?text=" + message;
            window.location.href = whatsapp_url;
        })
    } else {
        toast('You Are Not On A Mobile Device. Please Use This Button To Share On Mobile');
    }
});

function shareChat(callback) {
    var hashid = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    $.ajax({
        url: "./api.php/records/conversations",
        type: "POST",
        data: {
            hashid: hashid,
            params: encodeURI(JSON.stringify(_objectWithoutProperties(WhatsappSim, ["authors", "conversation"]))),
            conversation: encodeURI(JSON.stringify(WhatsappSim.conversation)),
            authors: encodeURI(JSON.stringify(WhatsappSim.authors))
        },
        success: function(hashid) {
            return function (data) {callback(hashid)};
        }(hashid)
    })
}

/**
 * Hamburger menu setup
*/
$("#hamburger").on("click", function () {
    $(".pane-one").addClass("open");
    $(".pane-two").on("click.hamburger", function () {
        $(".pane-one").removeClass("open");
        $(".pane-two").off("click.hamburger");
    })
});
$("#close-menu").on("click", function () {
    $(".pane-one").removeClass("open");
    $(".pane-two").off("click.hamburger");
});

$(".start-btn").on("click", function () {
    $(".pane-one").removeClass("open");
    $(".pane-two").off("click.hamburger");
})

/**
 * Debugging function to see the simulator statistics
 */
function updateStats() {
    $('#stats').html(
        "state: " + WhatsappSim.state + "<br>" +
        "queue.length: " + WhatsappSim.queue.length + "<br>"
    );
}

/**
 * Initialize all input feilds
 */
function initInputs() {
    $("#output").html("");
    $("#authors").find('option').remove();
    $("#authors").append(WhatsappSim.authors.map(function (x) {
        return $("<option>" + x + "</option>")
    }))
}

/**
 * Set Playback parameters
 */
function setParams() {
    // Set the primary author
    WhatsappSim.setPrimaryAuthor($("#authors").val());

    // Set Config parameters
    $("select").each(function () {
        var $select = $(this);
        var key = $select.data("key")
        var configOb = {}
    
        configOb[key] = $select.val();
        WhatsappSim.config(configOb); 
    });
}

/**
 * Copy to clipboard
 */
function copyToClipboard(str) {
    var el = document.createElement('input');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setTimeout(function (){
        toast("Copied");
    }, 201);
};

/**
 * Copy Object without keys
 */
function _objectWithoutProperties(obj, keys) { 
    var target = {}; 
    for (var i in obj) { 
        if (keys.indexOf(i) >= 0) continue; 
        if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; 
        target[i] = obj[i]; 
    } 
    return target; 
}

/**
 * PWA Installation
 */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $(".install-btn").prop("disabled", false);
});

$(".install-btn").on("click", function () {
    // Show the prompt
    try {
        deferredPrompt.prompt();
    } catch (error) {
        console.log(error);
    }

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
        .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
});

/**
 * FAQ Controller
 */
(function (window) {
    function FAQController() {
        var self = this
        self.init();
    }

    // Initialize
    FAQController.prototype.init = function () {
        var self = this;

        $.ajax({ 
            url: "./data/faq.txt", 
            success: function (data) { 
                self.faqs = data.split("=====FAQ=====\n").map(function (str) {
                    var question = str.split("\n",1)[0];
                    var answer = str.substring(question.length + 2);
                    return {
                        question: question.split("QUESTION: ")[1],
                        answer: answer
                    }
                });
                
                $("#faqs").append(self.faqs.map(function (q, index) {
                    return $("<option value='" + index + "'>" + q.question + "</option>")
                })).on("change", function () {
                    self.showFaq($(this).val())
                })
            },
            error: function functionName() {
                $("#faqs").append($("<option'>Could not load FAQ's</option>"))
            }
        });

    }

    // Show an FAQ
    FAQController.prototype.showFaq = function (index) {
        var self = this;

        $("#output").html("");
        WhatsappSim.parse(self.faqs[index].answer)
        WhatsappSim.setPrimaryAuthor("Ashwin")
        WhatsappSim.config({replayType: "all"})
        WhatsappSim.startSimulation()
        $("#close-menu").click()
    }


    /**
     * Initialize the Library
     * define globally if it doesn't already exist
     */
    if (typeof (faq) === 'undefined') {
        window.faq = new FAQController();
    }
    else {
        console.log("FAQ Library already defined.");
    }

})(window)

/**
 * TODO
 * - Fix Update stats
 * - Add Readme
 */