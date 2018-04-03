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
    })
})();


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

        $("#output").html("");
        $("#authors").find('option').remove();
        $("#authors").append(WhatsappSim.authors.map(function (x) {
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
    $("#authors").append(WhatsappSim.authors.map(function (x) {
        return $("<option>" + x + "</option>")
    }))

    $(".button").prop("disabled", false);
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
 * Hamburger menu setup
 */
$("#hamburger").on("click", function () {
    $(".pane-one").addClass("open");
});
$("#close-menu").on("click", function () {
    $(".pane-one").removeClass("open");
});

$(".start-btn").on("click", function () {
    $(".pane-one").removeClass("open");
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