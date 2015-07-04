HyperHub = function () {
    // Declare a proxy to reference the hub. 
    var hyper = $.connection.hyperHub;
    var markersArray = [];
    var powerStationsArray = [];
    var circlesArray = [];
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
            //console.log("getMyUsage: " + myUsage);
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
            //console.log("userListChanged: " + userList);
            clearOverlays();
            var users = eval(userList);
            for (var key in users) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(users[key].Latitude, users[key].Longitude),
                    map: map
                });

                console.log(users[key].Latitude + "/" + users[key].Longitude);

                // draw circle based on the emission
                var emissionOptions = {
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.3,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.2,
                    map: map,
                    center: new google.maps.LatLng(users[key].Latitude, users[key].Longitude),
                    radius: users[key].Emission
                };

                // Add the circle for this city to the map.
                var circle = new google.maps.Circle(emissionOptions);

                markersArray.push(marker);
                circlesArray.push(circle);
            }

            markerClusterer = new MarkerClusterer(map, markersArray);
        };
    }

    function clearOverlays() {
        for (var i = 0; i < markersArray.length; i++) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;

        for (var i = 0; i < circlesArray.length; i++) {
            circlesArray[i].setMap(null);
        }

        circlesArray.length = 0;

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

    function togglePowerStationReport(toggle) {
    }

    return {
        updateLocation: updateLocation,
        disconnect: disconnect,
        init: init,
        addUsage: addUsage,
        removeAppliance: removeAppliance,
        togglePowerStationReport: togglePowerStationReport
    }
}