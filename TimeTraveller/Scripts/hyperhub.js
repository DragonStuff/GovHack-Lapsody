HyperHub = function () {
    // Declare a proxy to reference the hub. 
    var hyper = $.connection.hyperHub;
    var markersArray = [];
    var powerStationsCircleArray = [];
    var powerStationsMarkerArray = [];
    var airPollutionCircleArray = [];
    var airPollutionMarkerArray = [];
    var sydneyWaterTurbidityCircleArray = [];
    var sydneyWaterTurbidityMarkerArray = [];
    var sydneyWaterChlorineCircleArray = [];
    var sydneyWaterChlorineMarkerArray = [];
    var airconCircleArray = [];
    var aircondMarkerArray = [];
    var heaterCircleArray = [];
    var heaterMarkerArray = [];
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
                var totalEmissions = 0;
                var html = "<li>";
                for (var key in usages) {
                    totalEmissions += usages[key].Emission;
                    html += '<div class="card style-default-light">';
                    html += '<div class="comment-avatar"><i class="glyphicon opacity-50">' + usages[key].Quantity + '</i></div>';
                    html += '<div class="card-body">';
                    html += '<h4 class="comment-title">' + usages[key].Product + '</h4>';
                    html += '<p>' + Math.round(usages[key].Emission) + 'kg CO2 Emmissions Per Year</p>';
                    html += '<div class="stick-top-right">';

                    html += '<a class="btn btn-success" href="javascript:updateAppliance(\'' + usages[key].Product + '\',\'' + (usages[key].Quantity + 1) + '\')"><i class="fa fa-plus"></i></a>';
                    html += ' <a class="btn btn-warning" href="javascript:updateAppliance(\'' + usages[key].Product + '\',\'' + (usages[key].Quantity - 1) + '\')"><i class="fa fa-minus"></i></a>';

                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                }

                html += "</li>";
                html = '<li><div class="card"><div class="card-body no-padding"><div class="alert alert-callout alert-info no-margin"><strong class="text-xl">' + Math.round(totalEmissions) + 'kg per year</strong><br/><span class="opacity-50">Your Carbon Footprint Costs You $' + Math.round(totalEmissions / 1000 * 25) + ' per year</span></div>' + html;
                //    '<div class="stick-top-right">' + '<a class="btn btn-success" href="javascript:showPrediction('+totalEmissions+')"><i class="fa">Predict</i></a>' + '</div>' +
                //    '</div></div></li><li class="prediction"></li>' + html;
                usageList.append(html);
            }
        };

        /*
         

                                



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

                console.log(users[key].Latitude + "/" + users[key].Longitude + " : " + markersArray.length);
                var emissionFactor = 0.05;

                // draw circle based on the emission
                var emissionOptions = {
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.3,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.2,
                    map: map,
                    center: new google.maps.LatLng(users[key].Latitude, users[key].Longitude),
                    radius: users[key].Emission * emissionFactor
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
        for (var i = 0; i < powerStationsMarkerArray.length; i++) {
            powerStationsMarkerArray[i].setMap(null);
        }
        powerStationsMarkerArray.length = 0;

        for (var i = 0; i < powerStationsCircleArray.length; i++) {
            powerStationsCircleArray[i].setMap(null);
        }

        powerStationsCircleArray.length = 0;

        if (toggle) {
            for (var key in powerPlantsArray) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(powerPlantsArray[key].Latitude, powerPlantsArray[key].Longitude),
                    map: map,
                    icon: {
                        path: fontawesome.markers.STEAM,
                        scale: 0.5,
                        strokeWeight: 0.2,
                        strokeColor: 'black',
                        strokeOpacity: 1,
                        fillColor: '#edb657',
                        fillOpacity: 0.7
                    }
                });

                var emissionFactor = 5000;

                // draw circle based on the emission
                var emissionOptions = {
                    strokeColor: '#edb657',
                    strokeOpacity: 0.2,
                    strokeWeight: 2,
                    fillColor: '#edb657',
                    fillOpacity: 0.2,
                    map: map,
                    center: new google.maps.LatLng(powerPlantsArray[key].Latitude, powerPlantsArray[key].Longitude),
                    radius: emissionFactor
                };


                // Add the circle for this city to the map.
                var circle = new google.maps.Circle(emissionOptions);

                powerStationsMarkerArray.push(marker);
                powerStationsCircleArray.push(circle);
            }

        } else {
            // powerPlantsArray

        }
    }

    function toggleAirPollution(toggle) {
        for (var i = 0; i < airPollutionMarkerArray.length; i++) {
            airPollutionMarkerArray[i].setMap(null);
        }
        airPollutionMarkerArray.length = 0;

        for (var i = 0; i < airPollutionCircleArray.length; i++) {
            airPollutionCircleArray[i].setMap(null);
        }

        airPollutionCircleArray.length = 0;

        if (toggle) {
            for (var key in airPollutionArray) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(airPollutionArray[key].Latitude, airPollutionArray[key].Longitude),
                    map: map,
                    icon: {
                        path: fontawesome.markers.CAR,
                        scale: 0.5,
                        strokeWeight: 0.2,
                        strokeColor: 'black',
                        strokeOpacity: 1,
                        fillColor: '#edb657',
                        fillOpacity: 0.7
                    }
                });


                var emissionFactor = 4000;
                var emission = 0;
                switch(year) {
                    case 2010:
                        emission = airPollutionArray[key].T2010;                        
                        break;
                    case 2011:
                        emission = airPollutionArray[key].T2011;
                        break;
                    case 2012:
                        emission = airPollutionArray[key].T2012;
                        break;
                    case 2013:
                        emission = airPollutionArray[key].T2013;
                        break;
                    case 2014:
                        emission = airPollutionArray[key].T2014;
                        break;
                }

                if (emission === 0)
                    emission = Math.random();

                if (emission > 10)
                    emission /= 10;

                // draw circle based on the emission
                var emissionOptions = {
                    strokeColor: '#0fc3ff',
                    strokeOpacity: 0.1,
                    strokeWeight: 2,
                    fillColor: '#0fc3ff',
                    fillOpacity: 0.1,
                    map: map,
                    center: new google.maps.LatLng(airPollutionArray[key].Latitude, airPollutionArray[key].Longitude),
                    radius: emissionFactor * emission
                };


                // Add the circle for this city to the map.
                var circle = new google.maps.Circle(emissionOptions);

                airPollutionMarkerArray.push(marker);
                airPollutionCircleArray.push(circle);
            }

        } else {
            // powerPlantsArray

        }
    }

    function toggleSydneyWaterTurbidity(toggle) {
        for (var i = 0; i < sydneyWaterTurbidityMarkerArray.length; i++) {
            sydneyWaterTurbidityMarkerArray[i].setMap(null);
        }
        sydneyWaterTurbidityMarkerArray.length = 0;

        for (var i = 0; i < sydneyWaterTurbidityCircleArray.length; i++) {
            sydneyWaterTurbidityCircleArray[i].setMap(null);
        }

        sydneyWaterTurbidityCircleArray.length = 0;

        if (toggle) {
            for (var key in sydneyWaterArray) {
                if (sydneyWaterArray[key].Date === year) {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(sydneyWaterArray[key].Latitude, sydneyWaterArray[key].Longitude),
                        map: map,
                        icon: {
                            path: fontawesome.markers.ANCHOR,
                            scale: 0.3,
                            strokeWeight: 0.2,
                            strokeColor: 'black',
                            strokeOpacity: 1,
                            fillColor: '#edb657',
                            fillOpacity: 0.7
                        }
                    });

                    //console.log(sydneyWaterArray[key].Latitude + "/" + sydneyWaterArray[key].Longitude);

                    var emissionFactor = 2000;
                    var emission = sydneyWaterArray[key].Turbidity;


                    // draw circle based on the emission
                    var emissionOptions = {
                        strokeColor: '#7c66ff',
                        strokeOpacity: 0.3,
                        strokeWeight: 2,
                        fillColor: '#7c66ff',
                        fillOpacity: 0.3,
                        map: map,
                        center: new google.maps.LatLng(sydneyWaterArray[key].Latitude, sydneyWaterArray[key].Longitude),
                        radius: emissionFactor * (emission/12)
                    };


                    // Add the circle for this city to the map.
                    var circle = new google.maps.Circle(emissionOptions);

                    sydneyWaterTurbidityMarkerArray.push(marker);
                    sydneyWaterTurbidityCircleArray.push(circle);
                }
            }

        } else {
            // powerPlantsArray

        }
    }

    function toggleSydneyWaterChlorine(toggle) {
        for (var i = 0; i < sydneyWaterChlorineMarkerArray.length; i++) {
            sydneyWaterChlorineMarkerArray[i].setMap(null);
        }
        sydneyWaterChlorineMarkerArray.length = 0;

        for (var i = 0; i < sydneyWaterChlorineCircleArray.length; i++) {
            sydneyWaterChlorineCircleArray[i].setMap(null);
        }

        sydneyWaterChlorineCircleArray.length = 0;

        if (toggle) {
            for (var key in sydneyWaterArray) {
                if (sydneyWaterArray[key].Date === year) {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(sydneyWaterArray[key].Latitude, sydneyWaterArray[key].Longitude),
                        map: map,
                        icon: {
                            path: fontawesome.markers.ANCHOR,
                            scale: 0.3,
                            strokeWeight: 0.2,
                            strokeColor: 'black',
                            strokeOpacity: 1,
                            fillColor: '#edb657',
                            fillOpacity: 0.7
                        }
                    });

                    //console.log(sydneyWaterArray[key].Latitude + "/" + sydneyWaterArray[key].Longitude);

                    var emissionFactor = 1000;
                    var emission = sydneyWaterArray[key].Chlorine;


                    // draw circle based on the emission
                    var emissionOptions = {
                        strokeColor: '#33f4ba',
                        strokeOpacity: 0.3,
                        strokeWeight: 2,
                        fillColor: '#33f4ba',
                        fillOpacity: 0.3,
                        map: map,
                        center: new google.maps.LatLng(sydneyWaterArray[key].Latitude, sydneyWaterArray[key].Longitude),
                        radius: emissionFactor * (emission / 12)
                    };


                    // Add the circle for this city to the map.
                    var circle = new google.maps.Circle(emissionOptions);

                    sydneyWaterChlorineMarkerArray.push(marker);
                    sydneyWaterChlorineCircleArray.push(circle);
                }
            }

        } else {
            // powerPlantsArray

        }
    }

    function toggleAircon(toggle) {
        for (var i = 0; i < aircondMarkerArray.length; i++) {
            aircondMarkerArray[i].setMap(null);
        }
        aircondMarkerArray.length = 0;

        for (var i = 0; i < airconCircleArray.length; i++) {
            airconCircleArray[i].setMap(null);
        }

        airconCircleArray.length = 0;

        if (toggle) {
            for (var key in airconArray) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(airconArray[key].Latitude, airconArray[key].Longitude),
                    map: map,
                    icon: {
                        path: fontawesome.markers.ARROW_UP,
                        scale: 0.3,
                        strokeWeight: 0.2,
                        strokeColor: 'black',
                        strokeOpacity: 1,
                        fillColor: '#edb657',
                        fillOpacity: 0.7
                    }
                });

                //console.log(airconArray[key].Latitude + "/" + airconArray[key].Longitude);

                var emissionFactor = 1000;
                var emission = airconArray[key].Cooling;


                // draw circle based on the emission
                var emissionOptions = {
                    strokeColor: '#d4ff49',
                    strokeOpacity: 0.3,
                    strokeWeight: 2,
                    fillColor: '#d4ff49',
                    fillOpacity: 0.3,
                    map: map,
                    center: new google.maps.LatLng(airconArray[key].Latitude, airconArray[key].Longitude),
                    radius: emissionFactor + emission
                };


                // Add the circle for this city to the map.
                var circle = new google.maps.Circle(emissionOptions);

                aircondMarkerArray.push(marker);
                airconCircleArray.push(circle);
            }

        } else {
            // powerPlantsArray

        }
    }

    function toggleHeater(toggle) {
        for (var i = 0; i < heaterMarkerArray.length; i++) {
            heaterMarkerArray[i].setMap(null);
        }
        heaterMarkerArray.length = 0;

        for (var i = 0; i < heaterCircleArray.length; i++) {
            heaterCircleArray[i].setMap(null);
        }

        heaterCircleArray.length = 0;

        if (toggle) {
            for (var key in airconArray) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(airconArray[key].Latitude, airconArray[key].Longitude),
                    map: map,
                    icon: {
                        path: fontawesome.markers.ARROW_DOWN,
                        scale: 0.3,
                        strokeWeight: 0.2,
                        strokeColor: 'black',
                        strokeOpacity: 1,
                        fillColor: '#edb657',
                        fillOpacity: 0.7
                    }
                });

                //console.log(airconArray[key].Latitude + "/" + airconArray[key].Longitude);

                var emissionFactor = 1000;
                var emission = airconArray[key].Cooling;


                // draw circle based on the emission
                var emissionOptions = {
                    strokeColor: '#fc6c97',
                    strokeOpacity: 0.3,
                    strokeWeight: 2,
                    fillColor: '#fc6c97',
                    fillOpacity: 0.3,
                    map: map,
                    center: new google.maps.LatLng(airconArray[key].Latitude, airconArray[key].Longitude),
                    radius: emissionFactor + emission
                };


                // Add the circle for this city to the map.
                var circle = new google.maps.Circle(emissionOptions);

                heaterMarkerArray.push(marker);
                heaterCircleArray.push(circle);
            }

        } else {
            // powerPlantsArray

        }
    }

    return {
        updateLocation: updateLocation,
        disconnect: disconnect,
        init: init,
        addUsage: addUsage,
        removeAppliance: removeAppliance,
        togglePowerStationReport: togglePowerStationReport,
        toggleSydneyWaterTurbidity: toggleSydneyWaterTurbidity,
        toggleSydneyWaterChlorine: toggleSydneyWaterChlorine,
        toggleAircon: toggleAircon,
        toggleHeater: toggleHeater,
        toggleAirPollution: toggleAirPollution
    }
}