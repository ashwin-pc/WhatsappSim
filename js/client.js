var $input = $("input[type=file]").first();

// Event Listeners
$input.on("change", function () {
    var self = this;

    // Read file
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        var convo = WhatsappSim.parse(text, {
            me : {
                name: "Ashwin PC",
                number: "+91 81052 80436"
            }
        });

        if (!convo.status) {
            alert(convo.err);
            return;
        }

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
                            <div class='message-meta'>"+msg.timestamp+"</div>\
                        </div>\
                    </div>"))
                .show();

            $('#stats').html(
                "state: " + WhatsappSim.state + "<br>" + 
                "queue.length: " + WhatsappSim.queue.length + "<br>"
            );
        }

        $(".button").prop("disabled", false);
    };
    reader.readAsText(self.files[0]);
})

$(".play").on("click", function () {
    WhatsappSim.startSimulation()
})
$(".pause").on("click", function () {
    WhatsappSim.pauseSimulation()
})
$(".stop").on("click", function () {
    $("#output").html("");
    WhatsappSim.stopSimulation()
})
$(".reset").on("click", function () {
    $("#output").html("");
    WhatsappSim.resetSimulation()
})

/**
 * TODO
 * 
 * - Add Readme
 * - Other configurations such as time controlled and random time
 * - add setters for all configurations
 */