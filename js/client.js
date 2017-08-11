var $input = $("input[type=file]").first();

// Event Listeners
$input.on("change", function () {
    var self = this;

    // Read file
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        var convo = WhatsappSim.parse(text, {
            me: {
                name: "Ashwin PC",
                number: "+91 81052 80436"
            }
        });

        if (!convo.status) {
            alert(convo.err);
            return;
        }

        setupWhatsappSim();

        $(".button").prop("disabled", false);
    };
    reader.readAsText(self.files[0]);
})

$("textarea").on("change", function () {
    console.log("here");
    var text = $(this).val();

    var convo = WhatsappSim.parse(text, {
        me: {
            name: "Ashwin PC",
            number: "+91 81052 80436"
        }
    });

    if (!convo.status) {
        alert(convo.err);
        return;
    }

    $("#output").html("");

    setupWhatsappSim();

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

function updateStats() {
    $('#stats').html(
        "state: " + WhatsappSim.state + "<br>" +
        "queue.length: " + WhatsappSim.queue.length + "<br>"
    );
}

function setupWhatsappSim() {
    WhatsappSim.onMessage = function (msg) {
        var self = (msg.self) ? "message-out" : "message-in";
        var continuation = (msg.continuation) ? "msg-continuation" : "";
        var tail = (msg.tail) ? "tail" : "";
        var hasAuthor = (msg.authorId && !msg.self && msg.tail) ? "has-author" : "";
        var author = (msg.authorId && !msg.self && msg.tail) ? "<div class='author color-" + msg.authorId + "'>" + msg.name + "</div>" : "";

        $("#output")
            .append($(
                "<div class='msg " + continuation + "'>\
                        <div class='bubble " + self + " " + tail + " " + hasAuthor + "'>\
                            " + author + "\
                            <span class='tail-container highlight'></span>\
                            <div class='message-text'>" + msg.txt + "</div>\
                            <div class='message-meta'>"+ msg.timestamp + "</div>\
                        </div>\
                    </div>"))
            .show();

        updateStats();

        document.body.scrollTop = document.body.scrollHeight;
    }
}

/**
 * TODO
 * 
 * - Add Readme
 * - Other configurations such as time controlled and random time
 * - add setters for all configurations
 */