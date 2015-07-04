﻿HyperHub = function () {
    // Declare a proxy to reference the hub. 
    var hyper = $.connection.hyperHub;
    var markersArray = [];
    var markerClusterer;

    function init() {
        // Create a function that the hub can call to broadcast messages.
        hyper.client.broadcastMessage = function (name, message) {
            /*// Html encode display name and message. 
            var encodedName = $('<div />').text(name).html();
            var encodedMsg = $('<div />').text(message).html();
            // Add the message to the page. 
            $('#discussion').append('<li><strong>' + encodedName
                + '</strong>:&nbsp;&nbsp;' + encodedMsg + '</li>');*/
        };

        hyper.client.getMyUsage = function (myUsage) {
            console.log(myUsage);
            var usages = eval(myUsage);
            if (usages) {
                var usageList = $("#usagelist");
                usageList.empty();
                var html = "<li>";
                for (var key in usages) {                    
                    html += '<div class="card style-default-light">';
                    html += '<div class="comment-avatar"><i class="glyphicon opacity-50">' + usages[key].Quantity + '</i></div>';
                    html += '<div class="card-body">';
                    html += '<h4 class="comment-title">' + usages[key].Product + '</h4>';
                    html += '<p>Produces ' + usages[key].Emission + ' CO2 Emmissions Per Day</p>';
                    html += '<a class="btn btn-danger stick-top-right" href="javascript:removeAppliance(\'' + usages[key].Id + '\')">Remove</a>';
                    html += '</div>';
                    html += '</div>';
                }

                html += "</li>";
                usageList.append(html);
            }
        };

        /*
                        <li>
                            <div class="card style-default-light">
                                <div class="comment-avatar"><i class="glyphicon opacity-50">10</i></div>
                                <div class="card-body">
                                    <h4 class="comment-title">Computer</h4>
                                    <p>Produces 1.2 CO2 Emmissions Per Day</p>
                                    <a class="btn btn-danger stick-top-right" href="#">Remove</a>
                                </div>
                            </div>
                        </li>          
         
         */

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
    }

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

    function addUsage(product, quantity) {
        $.connection.hub.start().done(function () {
            hyper.server.addUsage(product, quantity);
        });
    }

    function removeAppliance(id) {
        $.connection.hub.start().done(function () {
            hyper.server.removeUsage(id);
        });
    }

    return {
        updateLocation: updateLocation,
        disconnect: disconnect,
        init: init,
        addUsage: addUsage,
        removeAppliance: removeAppliance
    }
}