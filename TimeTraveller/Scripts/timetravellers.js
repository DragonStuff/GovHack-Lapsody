var map = null;
var hyperHub = null;
var currCenter = null;
var map = null;
var marker = null;
var circle = null;
var radius = 1000;
var isAuthenticated = false;
var powerstationOn = false;
var year = 2015;

$(document).ready(function() {
    $(".reportToggle").click(function() {
        switch ($(this).attr('id')) {
            case "chkPowerStation":
                powerstationOn = !powerstationOn;
                hyperHub.togglePowerStationReport(powerstationOn);
                break;
        }
    });

    $("#datepicker").datepicker({
        format: " yyyy", // Notice the Extra space at the beginning
        viewMode: "years",
        minViewMode: "years"
    }).on("changeDate", function (e) {
        year = e.date.getFullYear();
    });;
});

function closeDialog() {
    $("#dialog").dialog("close");
}


function closeDialogHint() {
    $("#dialogHint").dialog("close");
}


function logOff() {    
    hyperHub.disconnect();
    window.location = "/Account/Logoff";
}

function addAppliance() {
    var product = $("#cbxUsage").val().trim();
    var quantity = $("#cbxQuantity").val().trim();

    if (product.length > 0 && quantity.length > 0) {
        hyperHub.addUsage(product, quantity);

        $("#cbxUsage").val("");
        $("#cbxQuantity").val("");
    } else {
        toastr.error('Please Select an Appliance and Quantity', 'Try Again!');
    }

}

function removeAppliance(id) {
    hyperHub.removeAppliance(id);
}

function initHyperHub() {
    if (isAuthenticated) {
        hyperHub = new HyperHub();
        hyperHub.init(map);
    }
}

function initMap() {
    var latlng = new google.maps.LatLng(-33.8650, 151.2094);

    var mapOptions = {
        center: latlng,
        zoom: 13,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    setLocation(latlng);

    google.maps.event.addDomListener(window, "resize", function() {
        fitMap();
        setLocation(currCenter);
    });

    fitMap();
}

function fitMap() {
    $("#map").height($(window).height() - 80);
}

function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(onGeoLocationHandler, onGeoLocationErro);
}

function onGeoLocationHandler(position) {
    if (position == null) return;

    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    if(hyperHub)
        hyperHub.updateLocation(position.coords.latitude, position.coords.longitude);

    /*            // get the country used to localise searches
            $.ajax({
                url: "/Home/GetCountry",
                dataType: "json",
                data: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                },
                success: function (data) {
                    var result = eval(data);
                    country = result.Data;
                },
                error: function (err) {
                }
            });*/

    setLocation(latlng);
}

function onGeoLocationErro(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("user did not share geolocation data");
            break;

        case error.POSITION_UNAVAILABLE:
            alert("could not detect current position");
            break;

        case error.TIMEOUT:
            alert("retrieving position timed out");
            break;

        default:
            alert("unknown error");
            break;
    }
}

function setLocation(latlng) {
    currCenter = latlng;
    map.setCenter(latlng);
}

