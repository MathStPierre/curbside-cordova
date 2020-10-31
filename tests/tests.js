/*    
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

let trackingToken = null;

function createNewTrackingToken() {
    //Tracking token must be unique (e.g.: order id) and is used to differentiate trips.
    trackingToken = 'CordovaTestUser' + Math.random().toString(10).substring(7);
}

let destinationSiteId = 'rakutenreadydemo_100'
let trackingId = 'CurbsideCordovaTestsPlugin'

exports.defineAutoTests = function () {
    describe('Curbside', function () {

        it('should exist', function () {
            expect(window.Curbside).toBeDefined();
        });

        it('setTrackingIdentifier', function () {

            window.Curbside.setTrackingIdentifier(trackingId)
                .then(function () { })
                .catch(function (error) {
                    expect(error).toBeNull();
                });

            window.Curbside.getTrackingIdentifier()
                .then(function (trackingIdentifier) {
                    expect(trackingIdentifier).toBe(trackingId);
                })
                .catch(function (error) {
                    expect(error).toBeNull();
                });

            //Avoid no expectation warning
            expect(null).toBeNull();
        });

        it('setUserInfo', function () {
            var obj = JSON.parse('{ "fullName":"Denis Doe", "emailAddress":"denis.doe@rakuten.com", "smsNumber":"730-412-3021", "vehicleMake":"Chevrolet","vehicleModel":"Corvette","vehicleLicensePlate":"RAKREADY" }');
            window.Curbside.setUserInfo(obj, function (error) {
                expect(error).toBeNull();
            });

            //Avoid no expectation warning
            expect(null).toBeNull();
        });

        it('startAndCancelTripToSiteWithIdentifier', function () {
            createNewTrackingToken();

            window.Curbside.startTripToSiteWithIdentifier(destinationSiteId, trackingToken)
                .then(function () { })
                .catch(function (error) {
                    expect(error).toBeNull();
                });

            window.Curbside.getTrackedSites()
                .then(function (sites) {
                    expect(sites).toEqual([destinationSiteId]);
                })
                .catch(function (error) {
                    expect(error).toBeNull();
                })

            window.Curbside.cancelTripToSiteWithIdentifier(destinationSiteId, trackingToken)
                .then(function () { })
                .catch(function (error) {
                    expect(error).toBeNull();
                })

            window.Curbside.getTrackedSites()
                .then(function (sites) {
                    expect(sites).toEqual([]);
                })
                .catch(function (error) {
                    expect(error).toBeNull();
                })

            //Avoid no expectation warning
            expect(null).toBeNull();
        });

        it('startAndCompleteTripToSiteWithIdentifierAndTripType', function () {
            createNewTrackingToken();

            window.Curbside.startTripToSiteWithIdentifierAndType(destinationSiteId, trackingToken, "CSTripTypeCurbside")
                .then(function () { })
                .catch(function (error) {
                    expect(error).toBeNull();
                });

            window.Curbside.completeTripToSiteWithIdentifier(destinationSiteId, trackingToken)
                .then(function () { })
                .catch(function (error) {
                    expect(error).toBeNull();
                })

            //Avoid no expectation warning
            expect(null).toBeNull();
        });
    });
};

let areEventHandlersForManualTestSetup = false;

exports.defineManualTests = function (contentEl, createActionButton) {
    var logMessage = function (message, color) {
        var log = document.getElementById('info');
        var logLine = document.createElement('div');
        if (color) {
            logLine.style.color = color;
        }
        logLine.innerHTML = message;
        log.appendChild(logLine);
    };

    var clearLog = function () {
        var log = document.getElementById('info');
        log.innerHTML = '';
    };

    var tripType = "CSTripTypeDriveThru";
    var fromDate = new Date(); // for now
    var toDate = new Date(fromDate);
    toDate.setDate(fromDate.getDate() + 3); // in 3 days from now
    var minutesBeforePickupNotification = 30;

    var notificationTitle = "RR Notification"
    var notificationMsg = "RR Notification Message"

    var curbside_tests = '<h3>Press Start Trip button to start trip</h3>' +
        '<div id="start_trip"></div>' +
        'Expected result: Trip started for ' + destinationSiteId + ' site with no error' +
        '<div id="start_trip_with_trip_type"></div>' +
        'Expected result: Trip started for ' + destinationSiteId + ' site with trip type ' + tripType + ' with no error' +
        '<div id="start_trip_with_trip_eta_type"></div>' +
        'Expected result: Trip started for ' + destinationSiteId + ' site with ETA window between ' + fromDate + ' to ' + toDate +  
        ' and trip type ' + tripType + ' with no error' +
        '<div id="start_trip_on_their_way"></div>' +
        'Expected result:<br>- On iOS trip started for ' + destinationSiteId + ' site with trip type ' + tripType + ' with no error<br>' +
        '- On Android error method not supported' +
        '<div id="notify_user_arrival_at_site"></div>' +
        'Expected result: Notify monitoring session for user trips arrival at ' + destinationSiteId + ' site with no error' +
        '<div id="notify_user_arrival_at_site_for_track_tokens"></div>' +
        'Expected result: Notify monitoring session for user trips arrival for given track tokens at ' + destinationSiteId + ' site with no error' +
        '<div id="get_sites_to_notify_monitoring_session_user_of_arrival"></div>' +
        'Expected result: Returns the set of siteIdentifiers for which canNotifyMonitoringSessionUser is true with no error' +
        '<div id="set_notification_time_for_scheduled_pickup"></div>' +
        'Expected result: Set notification time for scheduled pickup with no error' +
        '<div id="update_all_trips_user_on_their_way"></div>' +
        'Expected result:<br>- On iOS all trips updated with on their way to true with no error<br>' +
        '- On Android error method not supported' +
        '<div id="complete_to_site_with_id"></div>' +
        'Expected result: Trip to ' + destinationSiteId + ' with tracking token marked as completed with no error' +
        '<div id="complete_all"></div>' +
        'Expected result: All open trips having now a timestamp value in their respective serviced_at field' +
        '<div id="cancel_all"></div>' +
        'Expected result: All trips marked as cancelled with no error' +
        '<div id="cancel_to_site_with_id"></div>' +
        'Expected result: Trip to ' + destinationSiteId + ' with tracking token marked as cancelled with no error';

    contentEl.innerHTML = '<div id="info"></div>' + curbside_tests;

    if (!areEventHandlersForManualTestSetup) {
        let errorEventHandler = function (error) { logMessage("Error occurred : " + error, 'red'); };
        let tripStartedEventHandler = function (site) { logMessage("Trip started for site : " + site.siteIdentifier, 'green'); };
        window.Curbside.on("encounteredError", errorEventHandler);
        window.Curbside.on("tripStartedForSite", tripStartedEventHandler);
        areEventHandlerForManualTestSetup = true;
    }

    createActionButton(
        'Start Trip',
        function () {
            clearLog()
            logMessage("Start Trip");

            window.Curbside.setTrackingIdentifier(trackingId)
                .then(function () { })
                .catch(function (error) {
                    logMessage('Error occured when calling setTrackingIdentifier : ' + error, 'red');
                });

            createNewTrackingToken();

            window.Curbside.startTripToSiteWithIdentifier(destinationSiteId, trackingToken)
                .then(function () {
                    logMessage('Successful startTripToSiteWithIdentifier call with tracking token ' + trackingToken, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling startTripToSiteWithIdentifier : ' + error, 'red');
                });
        },
        'start_trip'
    );

    createActionButton(
        'Start Trip With Trip Type',
        function () {
            clearLog()
            logMessage("Start Trip With Trip Type");

            window.Curbside.setTrackingIdentifier(trackingId)
                .then(function () { })
                .catch(function (error) {
                    logMessage('Error occured when calling setTrackingIdentifier : ' + error, 'red');
                });

            createNewTrackingToken();

            window.Curbside.startTripToSiteWithIdentifierAndType(destinationSiteId, trackingToken, tripType)
                .then(function () {
                    logMessage('Successful startTripToSiteWithIdentifier call with tracking token ' + 
                               trackingToken + ' and trip type ' + tripType, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling startTripToSiteWithIdentifier : ' + error, 'red');
                });
        },
        'start_trip_with_trip_type'
    );

    createActionButton(
        'Start Trip With Eta And Trip Type',
        function () {
            clearLog()
            logMessage("Start Trip With Eta And Trip Type");

            window.Curbside.setTrackingIdentifier(trackingId)
                .then(function () { })
                .catch(function (error) {
                    logMessage('Error occured when calling setTrackingIdentifier : ' + error, 'red');
                });

            createNewTrackingToken();

            // var fromDate = new Date(); // for now
            // var toDate = new Date(fromDate).setDate(fromDate.getDate() + 3);

            window.Curbside.startTripToSiteWithIdentifierAndEtaAndType(destinationSiteId, trackingToken, fromDate, toDate, tripType)
                .then(function () {
                    logMessage('Successful startTripToSiteWithIdentifierAndEtaAndType call with tracking token ' + 
                               trackingToken + ' and trip type ' + tripType, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling startTripToSiteWithIdentifierAndEtaAndType : ' + error, 'red');
                });
        },
        'start_trip_with_trip_eta_type'
    );

    createActionButton(
        'Start Trip On Their Way',
        function () {
            clearLog()
            logMessage("Start Trip On Their Way");

            window.Curbside.setTrackingIdentifier(trackingId)
                .then(function () { })
                .catch(function (error) {
                    logMessage('Error occured when calling setTrackingIdentifier : ' + error, 'red');
                });

            createNewTrackingToken();

            window.Curbside.startUserOnTheirWayTripToSiteWithIdentifier(destinationSiteId, trackingToken, tripType)
                .then(function () {
                    logMessage('Successful startUserOnTheirWayTripToSiteWithIdentifier call with tracking token ' + 
                               trackingToken + ' and trip type ' + tripType, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling startUserOnTheirWayTripToSiteWithIdentifier : ' + error, 'red');
                });
        },
        'start_trip_on_their_way'
    );

    createActionButton(
        'Notify Monitoring Session User Of Arrival At Site',
        function () {
            clearLog()
            logMessage("Notify Monitoring Session User Of Arrival At Site");

            window.Curbside.setTrackingIdentifier(trackingId)
                .then(function () { })
                .catch(function (error) {
                    logMessage('Error occured when calling setTrackingIdentifier : ' + error, 'red');
                });

            window.Curbside.notifyMonitoringSessionUserOfArrivalAtSite(destinationSiteId)
                .then(function () {
                    logMessage('Successful notifyMonitoringSessionUserOfArrivalAtSite call for site id ' + destinationSiteId, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling notifyMonitoringSessionUserOfArrivalAtSite : ' + error, 'red');
                });
        },
        'notify_user_arrival_at_site'
    );

    createActionButton(
        'Notify Monitoring Session User Of Arrival At Site For TrackTokens',
        function () {
            clearLog()
            logMessage("Notify Monitoring Session User Of Arrival At Site For TrackTokens");

            window.Curbside.notifyMonitoringSessionUserOfArrivalAtSiteForTrackTokens(destinationSiteId, [trackingToken])
                .then(function () {
                    logMessage('Successful notifyMonitoringSessionUserOfArrivalAtSiteForTrackTokens call for site id ' + destinationSiteId + 
                               ' and track token ' + trackingToken, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling notifyMonitoringSessionUserOfArrivalAtSiteForTrackTokens : ' + error, 'red');
                });
        },
        'notify_user_arrival_at_site_for_track_tokens'
    );

    createActionButton(
        'Get Sites To Notify Monitoring Session User Of Arrival',
        function () {
            clearLog()
            logMessage("Get Sites To Notify Monitoring Session User Of Arrival");

            window.Curbside.getSitesToNotifyMonitoringSessionUserOfArrival()
                .then(function (sites) {
                    logMessage('Successful getSitesToNotifyMonitoringSessionUserOfArrival call that is returning following sites: ' + 
                               sites, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling getSitesToNotifyMonitoringSessionUserOfArrival : ' + error, 'red');
                });
        },
        'get_sites_to_notify_monitoring_session_user_of_arrival'
    );

    createActionButton(        
        'Set Notification Time For Scheduled Pickup',
        function () {
            clearLog()
            logMessage("Set Notification Time For Scheduled Pickup");

            window.Curbside.setNotificationTimeForScheduledPickup(minutesBeforePickupNotification)            
                .then(function () {
                    logMessage('Successful setNotificationTimeForScheduledPickup call', 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling setNotificationTimeForScheduledPickup : ' + error, 'red');
                });            
        },
        'set_notification_time_for_scheduled_pickup'
    );
    
    createActionButton(
        'Update All Trips User On Their Way',
        function () {
            clearLog()
            logMessage("Update All Trips User On Their Way");

            window.Curbside.setTrackingIdentifier(trackingId)
                .then(function () { })
                .catch(function (error) {
                    logMessage('Error occured when calling setTrackingIdentifier : ' + error, 'red');
                });

            window.Curbside.updateAllTripsWithUserOnTheirWay(true)
                .then(function () {
                    logMessage('Successful updateAllTripsWithUserOnTheirWay call with userOnTheirWay set to true ', 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling updateAllTripsWithUserOnTheirWay : ' + error, 'red');
                });
        },
        'update_all_trips_user_on_their_way'
    );

    createActionButton(
        'Complete Trip To Site With Identifier',
        function () {

            clearLog()
            logMessage("Complete Trip To Site With Identifier");

            window.Curbside.completeTripToSiteWithIdentifier(destinationSiteId, trackingToken)
                .then(function () {
                    logMessage('Successful completeTripToSiteWithIdentifier call with tracking token ' + trackingToken, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling completeTripToSiteWithIdentifier : ' + error, 'red');
                });
        },
        'complete_to_site_with_id'
    );

    createActionButton(
        'Complete All',
        function () {

            clearLog()
            logMessage("Complete All");

            window.Curbside.completeAllTrips()
                .then(function () {
                    logMessage('Successful completeAllTrips call', 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling completeAllTrips : ' + error, 'red');
                });
        },
        'complete_all'
    );

    createActionButton(
        'Cancel Trip To Site With Identifier',
        function () {

            clearLog()
            logMessage("Cancel Trip To Site With Identifier");

            window.Curbside.cancelTripToSiteWithIdentifier(destinationSiteId, trackingToken)
                .then(function () {
                    logMessage('Successful cancelTripToSiteWithIdentifier call with tracking token ' + trackingToken, 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling cancelTripToSiteWithIdentifier : ' + error, 'red');
                });
        },
        'cancel_to_site_with_id'
    );

    createActionButton(
        'Cancel All',
        function () {

            clearLog()
            logMessage("Cancel All");

            window.Curbside.cancelAllTrips()
                .then(function () {
                    logMessage('Successful cancelAllTrips call', 'green');
                })
                .catch(function (error) {
                    logMessage('Error occured when calling cancelAllTrips : ' + error, 'red');
                });
        },
        'cancel_all'
    );
};
