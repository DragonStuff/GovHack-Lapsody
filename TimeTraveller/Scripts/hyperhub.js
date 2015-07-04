HyperHub = function (_map) {
    // Declare a proxy to reference the hub. 
    var hyper = $.connection.hyperHub;
    var map = _map;
    var markersArray = [];
    var markerClusterer;

    // Create a function that the hub can call to broadcast messages.
    hyper.client.broadcastMessage = function (name, message) {
        /*// Html encode display name and message. 
        var encodedName = $('<div />').text(name).html();
        var encodedMsg = $('<div />').text(message).html();
        // Add the message to the page. 
        $('#discussion').append('<li><strong>' + encodedName
            + '</strong>:&nbsp;&nbsp;' + encodedMsg + '</li>');*/
    };

    hyper.client.userListChanged = function (userList) {        
        clearOverlays();
        var users = eval(userList);
        for (var key in users) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(users[key].Latitude, users[key].Longitude),
                map: map
            });

            console.log(users[key].Latitude + "/" + users[key].Longitude);

            markersArray.push(marker);
        }

        markerClusterer = new MarkerClusterer(map, markersArray);
    };

    // Start the connection.
    $.connection.hub.start().done(function () {
        /*$('#sendmessage').click(function () {
            // Call the Send method on the hub. 
            hyper.server.send($('#displayname').val(), $('#message').val());
            // Clear text box and reset focus for next comment. 
            $('#message').val('').focus();
        });*/
    });

    function clearOverlays() {
        for (var i = 0; i < markersArray.length; i++) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;

        if (markerClusterer) {
            markerClusterer.clearMarkers();
        }
    }

    function updateLocation(lat, lng) {
        $.connection.hub.start().done(function () {
            hyper.server.updateLocation(lat, lng);
        });
    }

    function disconnect() {
        $.connection.hub.start().done(function () {
            hyper.server.disconnect();
        });
    }

    return {
        updateLocation: updateLocation,
        disconnect: disconnect
    }
}