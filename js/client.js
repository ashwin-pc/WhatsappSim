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
    WhatsappSim.config({me: me})
})
$(".input.me").on("change", function () {

    var key = $(this).data("key")
    var meVal = $(this).val()
    var me = {}
    localStorage.setItem(key,meVal)

    me[key] = meVal;
    WhatsappSim.config({me:me})
})
$(".clear-me").on("click", function () {
    $(".input.me").each(function () {
        $(this).val("");
        localStorage.removeItem($(this).data("key"));
    })

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

        document.body.scrollTop = document.body.scrollHeight;
    }

    WhatsappSim.onComplete = function () {
        updateStats();
    }
})();

/**
 * TODO
 * 
 * - Add Readme
 * - Other configurations such as time controlled and random time
 * - add setters for all configurations
 */