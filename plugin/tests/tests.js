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

let errorFromErrorEvenHandler = null
let siteFromTripStartedForSiteEventHandler = null

let errorEventHandler = function (error) {
    errorFromErrorEvenHandler = error
};

let tripStartedForSiteEventHandler = function (site) {
    siteFromTripStartedForSiteEventHandler = site
};

let trackingToken = null;

function createNewTrackingToken() {
    //Tracking token must be unique (e.g.: order id) and is used to differentiate trips.
    trackingToken = 'CordovaTestUser' + Math.random().toString(10).substring(7);
}

let destinationSiteId = 'rakutenreadydemo_100'
let trackingId = 'CurbsideCordovaTestsPlugin'



// Usage!
//   sleep(500).then(() => {
//       // Do something after the sleep!
//   });

exports.defineAutoTests = function () {
    describe('Curbside', function () {

        it('should exist', function () {
            expect(window.Curbside).toBeDefined();
        });

        it('register event listeners', function () {
            window.Curbside.on("encounteredError", errorEventHandler);
            window.Curbside.on("tripStartedForSite", tripStartedForSiteEventHandler);

            //Avoid no expectation warning
            expect(null).toBeNull();
        });

        it('setTrackingIdentifier', function () {

            window.Curbside.setTrackingIdentifier(trackingId)
                .then(function () { })
                .catch(function (error) {
                    expect(error).toBeNull();
                });

            window.Curbside.getTrackingIdentifier()
                .then(function (trackingIdentifier) {
                    expect(trackingIdentifier).toBe("CORDOVA_PLUGIN_TEST_TRACKING_ID");
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

            // window.Curbside.cancelTripToSiteWithIdentifier(destinationSiteId, trackingToken)
            //     .then(function () { })
            //     .catch(function (error) {
            //         expect(error).toBeNull();
            //     })

            // window.Curbside.getTrackedSites()
            //     .then(function (sites) {
            //         expect(sites).toEqual([]);
            //     })
            //     .catch(function (error) {
            //         expect(error).toBeNull();
            //     })

            //Avoid no expectation warning
            expect(null).toBeNull();
        });

        it('cancelTripToSiteWithIdentifier', function () {

            // while (errorFromErrorEvenHandler == null && siteFromTripStartedForSiteEventHandler == null) {
            // }

            expect(errorFromErrorEvenHandler).toBeNull();
            expect(siteFromTripStartedForSiteEventHandler).toEqual(destinationSiteId);

            // while (errorFromErrorEvenHandler == null && siteFromTripStartedForSiteEventHandler == null);

            // expect(errorFromErrorEvenHandler).toBeNull();
            // expect(siteFromTripStartedForSiteEventHandler).toEqual(destinationSiteId);

            // setTimeout(null, 5000);

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

        it('unregister event listeners', function () {
            // window.Curbside.off("encounteredError", errorEventHandler);
            // window.Curbside.off("tripStartedForSite", tripStartedForSiteEventHandler);

            //Avoid no expectation warning
            expect(null).toBeNull();
        });
    });
};

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

    var curbside_tests = '<h3>Press Start Trip button to start trip</h3>' +
        '<div id="start_trip"></div>' +
        'Expected result: Trip started for ' + destinationSiteId + ' site with no error' +
        '<div id="complete_all"></div>' +
        'Expected result: All trips marked as completed with no error' +
        '<div id="complete_to_site_with_id"></div>' +
        'Expected result: Trip to ' + destinationSiteId + ' with tracking token marked as completed with no error';

    contentEl.innerHTML = '<div id="info"></div>' + curbside_tests;

    let errorEventHandler = function (error) { logMessage("Start trip error : " + error, 'red'); };
    let tripStartedEventHandler = function (site) {
        let siteStr = site.toString()
        logMessage("Trip started for site : " + site.siteIdentifier, 'green');
    }

    window.Curbside.on("encounteredError", errorEventHandler);
    window.Curbside.on("tripStartedForSite", tripStartedEventHandler);

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
};
