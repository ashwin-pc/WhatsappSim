var $input = $("input[type=file]").first();

// Event Listeners
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

        $("#output").html("");
        $("#authors").find('option').remove();
        $("#authors").append("<option>Select Author</option>").append(WhatsappSim.authors.map(function (x) {
            return $("<option>" + x + "</option>")
        }))
        $(".button").prop("disabled", false);
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

    $("#output").html("");
    $("#authors").find('option').remove();
    $("#authors").append("<option>Select Author</option>").append(WhatsappSim.authors.map(function (x) {
        return $("<option>" + x + "</option>")
    }))

    $(".button").prop("disabled", false);
})

$(".play").on("click", function () {
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
    WhatsappSim.resetSimulation()
    updateStats();
})

$("select").on("change", function () {
    var $select = $(this);
    var key = $select.data("key")
    var configOb = {}

    configOb[key] = $select.val();
    WhatsappSim.config(configOb)
})

// handle the Me fields
$(document).ready(function () {
    var me = {};
    $(".input.me").each(function () {
        var key = $(this).data("key")
        var meVal = localStorage.getItem(key)

        if (meVal) {
            $(this).val(meVal);
            me[key] = meVal;
        }
    })
    WhatsappSim.config({ me: me })
})
$("#authors").on("change", function () {
    var author = $(this).val();

    WhatsappSim.setPrimaryAuthor(author);
})

// Navigation
$("#hamburger").on("click", function () {
    $(".pane-one").addClass("open");
});
$("#close-menu").on("click", function () {
    $(".pane-one").removeClass("open");
});

$(".start-btn").on("click", function () {
    $(".pane-one").removeClass("open");
})

function updateStats() {
    $('#stats').html(
        "state: " + WhatsappSim.state + "<br>" +
        "queue.length: " + WhatsappSim.queue.length + "<br>"
    );
}

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
        WhatsappSim.parse(defaultConvos[0])
        WhatsappSim.setPrimaryAuthor("Ashwin")
        WhatsappSim.startSimulation()
    })
})();

/**
 * Faq Controller
 */
(function (window) {
    function FAQController() {
        var self = this

        self.faqs = [
            {
                question: "Does not match a known format?",
                answer: 0
            }, {
                question: "Replay Formats?",
                answer: 1
            }
        ]

        self.init();
    }

    // Initialize
    FAQController.prototype.init = function () {
        var self = this;

        $("#faqs").append(self.faqs.map(function (q) {
            return $("<option value='" + q.answer + "'>" + q.question + "</option>")
        })).on("change", function () {
            self.showFaq($(this).val())
        })
    }

    // Show an FAQ
    FAQController.prototype.showFaq = function (index) {
        var self = this;

        $("#output").html("");
        WhatsappSim.parse(faqConvos[index])
        WhatsappSim.setPrimaryAuthor("Ashwin")
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

    // Keeping the conversations separate to not clutter up the code
    var faqConvos = [
        '02/12/14, 7:08 PM - Siri: Hey! Whats Does not match a known format?!\n\
02/12/14, 7:08 PM - Ashwin: Oh im so sorry 😥!\n\
02/12/14, 7:08 PM - Ashwin: Yes your format isnt supported yet, \nbut just mail us a sample of your chat text so that we can support it too!\n\
02/12/14, 7:09 PM - John: Yeah, it turns out Whatsapp has a different format for almost every device!!\n\
02/12/14, 7:10 PM - Siri: Thats Awful!!?\n\
02/12/14, 7:11 PM - Ashwin: Thats just how it is, but hey! just send us something that can help us understand the format used and we will add it 😁\n\
02/12/14, 7:11 PM - Ashwin: Just send a small snippet to reachme@designedbyashw.in',

        '02/12/14, 7:08 PM - Siri: What are the different Replay Formats?!\n\
02/12/14, 7:08 PM - Ashwin: Oh thats just to control at what speed you see your messages\n\
02/12/14, 7:08 PM - Ashwin: Auto - Plays each message at a constant interval\n\n\
Random - As the name suggests plays each message at a random interval\n\n\
Time Based - This looks at the time the message was sent and tries to replicate its effect, sped up at different rates depending in the difference (Trust me, you do not want to wait a day for the message)\n\n\
Word Based - The size of the message determines the interval (Longer messages stay on for longer). Best for reading the conversation without pausing\n\n\
All At Once - Well some of just cant wait, so show ALL AT ONCE!'
    ]
})(window)

var defaultConvos = [
    '21/11/14, 8:16 PM - Ashwin created group "Whatsapp Simulator"\n\
02/12/14, 7:08 PM - Siri: Hey! Whats this?!\n\
02/12/14, 7:08 PM - Ashwin: Hi There!\n\
02/12/14, 7:08 PM - Ashwin: Want to re-live some of those old conversations?\n\
02/12/14, 7:09 PM - John: Yeah, its pretty simple too!\n\
02/12/14, 7:10 PM - Siri: How!!?\n\
02/12/14, 7:11 PM - Ashwin: Just paste your chat in the menu\n\
02/12/14, 7:11 PM - Ashwin: Select who you are\n\
02/12/14, 7:11 PM - Ashwin: and hit play!\n\
02/12/14, 7:13 PM - Siri: 😱😱😱'
];

/**
 * TODO
 * - Add Typing..
 * - Add Readme
 * - add setters for all configurations
 */