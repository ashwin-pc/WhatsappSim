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
    WhatsappSim.config({me: me})
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
 * - add setters for all configurations
 */