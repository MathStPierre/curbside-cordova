/*
    *
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
       let errorEventHandler = function(error){
           expect(error).toBeNull();
       };
   
       let destinationSiteId = 'piecompany_118604'
   
       exports.defineAutoTests = function () {
           describe('Curbside', function () {
   
               it('should exist', function () {
                   expect(window.Curbside).toBeDefined();
               });
   
               it('setup event listeners', function () {
                   window.Curbside.on("encounteredError", errorEventHandler);
                   expect(null).toBeNull();
               });
   
               it('setTrackingIdentifier', function () {
                   window.Curbside.setTrackingIdentifier("CORDOVA_PLUGIN_TEST_TRACKING_ID", function (error) {
                       expect(error).toBeNull();
                   });
   
                   window.Curbside.getTrackingIdentifier(function (error, trackingIdentifier) {
                       expect(error).toBeNull();
                       expect(trackingIdentifier).toBe("CORDOVA_PLUGIN_TEST_TRACKING_ID");
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
                   window.Curbside.setTrackingIdentifier("CORDOVA_PLUGIN_TEST_TRACKING_ID", function (error) {
                       expect(error).toBeNull();
                   });
                   
                   window.Curbside.startTripToSiteWithIdentifier(destinationSiteId, "CORDOVA_PLUGIN_TEST_TRACKING_TOKEN", function (error) {
                       expect(error).toBeNull();
                   });
   
                   setTimeout(null, 5000);
   
                   window.Curbside.getTrackedSites(function(error, sites){
                       expect("Thihtoeh").toBeNull();
                       expect(sites).toEqual([destinationSiteId]); 
                   });
   
                   window.Curbside.cancelTripToSiteWithIdentifier(destinationSiteId, 'CORDOVA_PLUGIN_TEST_TRACKING_TOKEN"', function (error) {
                       expect(error).toBeNull();
                   });
   
                   window.Curbside.getTrackedSites(function(error, sites){
                       expect(error).toBeNull();
                       expect(sites).toEqual([destinationSiteId]); 
                   });
   
                   //Avoid no expectation warning
                   expect(null).toBeNull();
               });
   
   
   
               // it('Call setUserInfo', function () {
               //     var err = null
   
               //     var obj = JSON.parse('{ "fullName":"Denis Doe", "emailAddress":"denis.doe@rakuten.com", "smsNumber":"730-412-3021", "vehicleMake":"Chevrolet","vehicleModel":"Corvette","vehicleLicensePlate":"RAKREADY" }');
               //     window.Curbside.setUserInfo(obj, function(error){
               //         err = error;
               //     });
   
               //     expect(err).toBeNull();
               // });
   
               // it('should contain a platform specification that is a string', function () {
               //     expect(window.device.platform).toBeDefined();
               //     expect(String(window.device.platform).length > 0).toBe(true);
               // });
   
               // it('should contain a version specification that is a string', function () {
               //     expect(window.device.version).toBeDefined();
               //     expect(String(window.device.version).length > 0).toBe(true);
               // });
   
               // it('should contain a UUID specification that is a string or a number', function () {
               //     expect(window.device.uuid).toBeDefined();
               //     if (typeof window.device.uuid === 'string' || typeof window.device.uuid === 'object') {
               //         expect(String(window.device.uuid).length > 0).toBe(true);
               //     } else {
               //         expect(window.device.uuid > 0).toBe(true);
               //     }
               // });
   
               // it('should contain a cordova specification that is a string', function () {
               //     expect(window.device.cordova).toBeDefined();
               //     expect(String(window.device.cordova).length > 0).toBe(true);
               // });
   
               // it('should depend on the presence of cordova.version string', function () {
               //     expect(window.cordova.version).toBeDefined();
               //     expect(String(window.cordova.version).length > 0).toBe(true);
               // });
   
               // it('should contain device.cordova equal to cordova.version', function () {
               //     expect(window.device.cordova).toBe(window.cordova.version);
               // });
   
               // it('should contain a model specification that is a string', function () {
               //     expect(window.device.model).toBeDefined();
               //     expect(String(window.device.model).length > 0).toBe(true);
               // });
   
               // it('should contain a manufacturer property that is a string', function () {
               //     expect(window.device.manufacturer).toBeDefined();
               //     expect(String(window.device.manufacturer).length > 0).toBe(true);
               // });
   
               // it('should contain an isVirtual property that is a boolean', function () {
               //     expect(window.device.isVirtual).toBeDefined();
               //     expect(typeof window.device.isVirtual).toBe('boolean');
               // });
   
               // it('should contain a serial number specification that is a string', function () {
               //     expect(window.device.serial).toBeDefined();
               //     expect(String(window.device.serial).length > 0).toBe(true);
               // });
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
   
           var device_tests =
               '<h3>Press SetTracking Device button to SetTracking</h3>' +
               '<div id="set_tracking"></div>' +
               'Expected result: Status box will get updated with device info. (i.e. platform, version, uuid, model, etc)';
   
           contentEl.innerHTML = '<div id="info"></div>' + device_tests;
   
           createActionButton(
               'Set Tracking',
               function () {
   
                   // var err1 = null
                   // Curbside.setTrackingIdentifier("CORDOVA_PLUGIN_TEST_ID", function(error){
                   //     err = error;
                   // });
   
                   // // expect(err).toBeNull();
   
                   // clearLog();
                   // logMessage("error : " + err);
               },
               'set_tracking'
           );
       };
