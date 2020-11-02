#!/bin/bash -ex

APP_NAME=$1

cordova create ${APP_NAME}
cd ./${APP_NAME}
cordova platform add android
cordova platform add ios
#Currently geolocation plugin and its test plugin are required because curbside-cordova plugin is not able to display the location authorization dialog (known issue).
cordova plugin add cordova-plugin-geolocation
cordova plugin add ./plugins/cordova-plugin-geolocation/tests

cordova plugin add cordova-plugin-test-framework
cordova plugin add curbside-cordova
cordova plugin add ./plugins/curbside-cordova/tests

