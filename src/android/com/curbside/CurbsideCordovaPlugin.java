/**
 */
package com.curbside;

import android.location.Location;

import com.curbside.sdk.CSMonitoringSession;
import com.curbside.sdk.CSMotionActivity;
import com.curbside.sdk.CSSession;
import com.curbside.sdk.CSSite;
import com.curbside.sdk.CSTransportationMode;
import com.curbside.sdk.CSTripInfo;
import com.curbside.sdk.CSUserSession;
import com.curbside.sdk.CSUserStatus;
import com.curbside.sdk.CSUserStatusUpdate;
import com.curbside.sdk.event.Event;
import com.curbside.sdk.event.Path;
import com.curbside.sdk.event.Status;
import com.curbside.sdk.event.Type;
import com.curbside.sdk.model.CSUserInfo;
import com.google.firebase.messaging.RemoteMessage;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.joda.time.DateTime;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import rx.Subscriber;
import rx.exceptions.OnErrorNotImplementedException;

public class CurbsideCordovaPlugin extends CordovaPlugin {

    private CallbackContext eventListenerCallbackContext;
    private ArrayList<PluginResult> pluginResults = new ArrayList<>();

    @Override
    public void initialize(final CordovaInterface cordova, final CordovaWebView webView) {
        super.initialize(cordova, webView);

        CSUserSession userSession = CSUserSession.getInstance();
        if (userSession != null) {
            subscribe(userSession, Type.CAN_NOTIFY_MONITORING_USER_AT_SITE, "canNotifyMonitoringSessionUserAtSite");
            subscribe(userSession, Type.APPROACHING_SITE, "userApproachingSite");
            subscribe(userSession, Type.ARRIVED_AT_SITE, "userArrivedAtSite");
            subscribe(userSession, Type.UPDATED_TRACKED_SITES, "updatedTrackedSites");
        }

        CSMonitoringSession monitoringSession = CSMonitoringSession.getInstance();
        if (monitoringSession != null) {
            subscribe(monitoringSession, Type.FETCH_LOCATION_UPDATE, "userStatusUpdates");
        }
    }

    private String getStringArg(JSONArray args, int i) {
        String value;
        try {
            value = args.getString(i);
            if (value.equals("null")) {
                return null;
            }
        } catch (JSONException e) {
            return null;
        }
        return value;
    }

    private List<String> getArrayArg(JSONArray args, int i) {
        ArrayList<String> value;
        try {
            JSONArray jsonValue = args.getJSONArray(i);
            if (jsonValue == null) {
                return null;
            }
            value = new ArrayList<>();
            for (int j = 0; j < jsonValue.length(); j++) {
                value.add(jsonValue.getString(j));
            }

        } catch (JSONException e) {
            return null;
        }
        return value;
    }

    private Location getLocationArg(JSONArray args, int i) {
        Location location;
        try {
            JSONObject jsonValue = args.getJSONObject(i);
            if (jsonValue == null) {
                return null;
            }
            location = new Location("JsonProvider");
            if (jsonValue.has("altitude")) {
                location.setAltitude(jsonValue.getDouble("altitude"));
            }
            if (jsonValue.has("horizontalAccuracy")) {
                location.setAccuracy((float) jsonValue.getDouble("horizontalAccuracy"));
            }
            if (jsonValue.has("speed")) {
                location.setSpeed((float) jsonValue.getDouble("speed"));
            }
            if (jsonValue.has("course")) {
                location.setBearing((float) jsonValue.getDouble("course"));
            }
            if (jsonValue.has("timestamp")) {
                location.setTime(jsonValue.getLong("timestamp"));
            }
            if (jsonValue.has("latitude")) {
                location.setLatitude(jsonValue.getDouble("latitude"));
            }
            if (jsonValue.has("longitude")) {
                location.setLongitude(jsonValue.getDouble("longitude"));
            }
        } catch (JSONException e) {
            return null;
        }
        return location;
    }

    private Object jsonEncode(Object object) throws JSONException {
        if (object instanceof Collection) {
            JSONArray result = new JSONArray();
            for (Object item : (Collection) object) {
                result.put(jsonEncode(item));
            }
            return result;
        } else if (object instanceof CSSite) {
            CSSite site = (CSSite) object;
            JSONObject result = new JSONObject();
            result.put("siteIdentifier", site.getSiteIdentifier());
            result.put("distanceFromSite", site.getDistanceFromSite());
            result.put("userStatus", jsonEncode(site.getUserStatus()));
            result.put("trips", jsonEncode(site.getTripInfos()));
            return result;
        } else if (object instanceof CSUserStatus) {
            CSUserStatus userStatus = (CSUserStatus) object;
            switch (userStatus) {
                case ARRIVED:
                    return "arrived";
                case IN_TRANSIT:
                    return "inTransit";
                case APPROACHING:
                    return "approaching";
                case INITIATED_ARRIVED:
                    return "userInitiatedArrived";
                case UNKNOWN:
                    return "unknown";
            }
            return null;
        } else if (object instanceof CSMotionActivity) {
            CSMotionActivity motionActivity = (CSMotionActivity) object;
            switch (motionActivity) {
                case IN_VEHICLE:
                    return "inVehicle";
                case ON_BICYCLE:
                    return "onBicycle";
                case ON_FOOT:
                    return "onFoot";
                case STILL:
                    return "still";
                default:
                    return "unknown";
            }
        } else if (object instanceof CSTripInfo) {
            CSTripInfo tripInfo = (CSTripInfo) object;
            JSONObject result = new JSONObject();
            result.put("trackToken", tripInfo.getTrackToken());
            result.put("startDate", tripInfo.getStartDate());
            result.put("destID", tripInfo.getDestId());
            return result;
        } else if (object instanceof CSUserInfo) {
            CSUserInfo userInfo = (CSUserInfo) object;
            JSONObject result = new JSONObject();
            result.put("fullName", userInfo.getFullName());
            result.put("emailAddress", userInfo.getEmailAddress());
            result.put("smsNumber", userInfo.getSmsNumber());
            result.put("vehicleMake", userInfo.getVehicleMake());
            result.put("vehicleModel", userInfo.getVehicleModel());
            result.put("vehicleLicensePlate", userInfo.getVehicleLicensePlate());
            return result;
        } else if (object instanceof CSUserStatusUpdate) {
            CSUserStatusUpdate userStatusUpdate = (CSUserStatusUpdate) object;
            JSONObject result = new JSONObject();
            result.put("trackingIdentifier", userStatusUpdate.getTrackingIdentifier());
            result.put("location", jsonEncode(userStatusUpdate.getLocation()));
            result.put("lastUpdateTimestamp", userStatusUpdate.getLastUpdateTimeStamp());
            result.put("userStatus", jsonEncode(userStatusUpdate.getUserStatus()));
            result.put("userInfo", jsonEncode(userStatusUpdate.getUserInfo()));
            result.put("acknowledgedUser", userStatusUpdate.hasAcknowledgedUser());
            result.put("estimatedTimeOfArrival", userStatusUpdate.getEstimatedTimeOfArrivalInSeconds());
            result.put("distanceFromSite", userStatusUpdate.getDistanceFromSiteInMeters());
            result.put("motionActivity", jsonEncode(userStatusUpdate.getTransportMode()));
            result.put("tripsInfo", jsonEncode(userStatusUpdate.getTripsInfo()));
            if (userStatusUpdate.getMonitoringSessionUserAcknowledgedTimestamp() != null) {
                result.put("monitoringSessionUserAcknowledgedTimestamp",
                        userStatusUpdate.getMonitoringSessionUserAcknowledgedTimestamp());
            }
            if (userStatusUpdate.getMonitoringSessionUserTrackingIdentifier() != null) {
                result.put("monitoringSessionUserTrackingIdentifier",
                        userStatusUpdate.getMonitoringSessionUserTrackingIdentifier());
            }
            return result;
        } else if (object instanceof Location) {
            Location location = (Location) object;
            JSONObject result = new JSONObject();
            result.put("altitude", location.getAltitude());
            result.put("latitude", jsonEncode(location.getLatitude()));
            result.put("longitude", jsonEncode(location.getLongitude()));
            result.put("horizontalAccuracy", location.getAccuracy());
            result.put("speed", location.getSpeed());
            result.put("course", location.getBearing());
            result.put("timestamp", location.getTime());
            return result;
        } else if (object == null) {
            return JSONObject.NULL;
        }
        return object;
    }

    private void subscribe(final CSSession session, Type type, final String eventName) {
        final CurbsideCordovaPlugin ccPlugin = this;
        Subscriber<Event> subscriber = new Subscriber<Event>() {
            @Override
            public final void onCompleted() {
            }

            @Override
            public final void onError(Throwable e) {
                throw new OnErrorNotImplementedException(e);
            }

            @Override
            public final void onNext(Event event) {
                try {
                    JSONObject result = new JSONObject();
                    result.put("event", eventName);
                    if (event.object != null) {
                        result.put("result", jsonEncode(event.object));
                    }
                    PluginResult dataResult = new PluginResult(
                            event.status == Status.SUCCESS ? PluginResult.Status.OK : PluginResult.Status.ERROR,
                            result);
                    dataResult.setKeepCallback(true);
                    if (ccPlugin.eventListenerCallbackContext != null) {
                        ccPlugin.eventListenerCallbackContext.sendPluginResult(dataResult);
                    } else {
                        pluginResults.add(dataResult);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };
        listenEvent(session, type, subscriber);
    }

    private void listenNextEvent(final CSSession session, final Type type, final CallbackContext callbackContext) {
        if (session == null) {
            switch (type) {
                case REGISTER_TRACKING_ID:
                case UNREGISTER_TRACKING_ID:
                    callbackContext.error("CSSession must be initialized");
                    break;
                case START_TRIP:
                case COMPLETE_TRIP:
                case COMPLETE_ALL_TRIPS:
                case CANCEL_TRIP:
                case CANCEL_ALL_TRIPS:
                case SEND:
                case FETCH_LOCATION_UPDATE:
                case ACK_LOCATION_UPDATE:
                case START_MOCK_TRIP:
                case CANCEL_MOCK_TRIP:
                case CAN_NOTIFY_MONITORING_USER_AT_SITE:
                case APPROACHING_SITE:
                case ARRIVED_AT_SITE:
                case UPDATED_TRACKED_SITES:
                case UPDATE_TRIP:
                case ETA_FROM_SITE:
                    callbackContext.error("CSUserSession must be initialized");
                    break;
                case START_MONITORING_ARRIVALS:
                case STOP_MONITORING_ARRIVALS:
                case NOTIFY_MONITORING_SESSION_USER:
                case COMPLETE_TRIP_FOR_TRACKING_IDENTIFIER:
                case CANCEL_TRIP_FOR_TRACKING_IDENTIFIER:
                    callbackContext.error("CSMonitoringSession must be initialized");
                    break;
            }
        } else {
            Subscriber<Event> subscriber = new Subscriber<Event>() {
                @Override
                public final void onCompleted() {
                }

                @Override
                public final void onError(Throwable e) {
                    throw new OnErrorNotImplementedException(e);
                }

                @Override
                public final void onNext(Event event) {
                    Object result = event.object;
                    if (event.status == Status.SUCCESS) {
                        if (result instanceof JSONObject) {
                            callbackContext.success((JSONObject) result);
                        } else if (result instanceof JSONArray) {
                            callbackContext.success((JSONArray) result);
                        } else if (result instanceof String) {
                            callbackContext.success((String) result);
                        } else if (result instanceof Integer) {
                            callbackContext.success((Integer) result);
                        } else {
                            callbackContext.success();
                        }
                    } else {
                        callbackContext.error(event.object.toString());
                    }
                    unsubscribe();
                }
            };
            listenEvent(session, type, subscriber);
        }
    }

    private void listenEvent(final CSSession session, final Type type, final Subscriber<Event> subscriber) {
        session.getEventBus().getObservable(Path.USER, type).subscribe(subscriber);
    }

    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
        if (action.equals("eventListener")) {
            this.eventListenerCallbackContext = callbackContext;
            for (PluginResult pluginResult : pluginResults) {
                callbackContext.sendPluginResult(pluginResult);
            }
            pluginResults.clear();
        } else {
            switch (action) {
                case "setTrackingIdentifier": {
                    String trackingIdentifier = this.getStringArg(args, 0);
                    CSMonitoringSession monitoringSession = CSMonitoringSession.getInstance();
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (monitoringSession != null) {
                        if (trackingIdentifier != null) {
                            listenNextEvent(monitoringSession, Type.REGISTER_TRACKING_ID, callbackContext);
                            monitoringSession.registerTrackingIdentifier(trackingIdentifier);
                        } else {
                            listenNextEvent(monitoringSession, Type.UNREGISTER_TRACKING_ID, callbackContext);
                            monitoringSession.unregisterTrackingIdentifier();
                        }
                    } else if (userSession != null) {
                        if (trackingIdentifier != null) {
                            listenNextEvent(userSession, Type.REGISTER_TRACKING_ID, callbackContext);
                            userSession.registerTrackingIdentifier(trackingIdentifier);
                        } else {
                            listenNextEvent(userSession, Type.UNREGISTER_TRACKING_ID, callbackContext);
                            userSession.unregisterTrackingIdentifier();
                        }
                    } else {
                        callbackContext.error("CSSession must be initialized");
                    }
                    break;
                }
                case "startTripToSiteWithIdentifier": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        String siteID = this.getStringArg(args, 0);
                        String trackToken = this.getStringArg(args, 1);
                        String tripType = null;
                        if (args.length() == 3) {
                            tripType = this.getStringArg(args, 2);
                        }
                        listenNextEvent(userSession, Type.START_TRIP, callbackContext);
                        userSession.startTripToSiteWithIdentifier(siteID, trackToken, tripType);
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "startTripToSiteWithIdentifierAndEta": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        String siteID = this.getStringArg(args, 0);
                        String trackToken = this.getStringArg(args, 1);
                        String from = this.getStringArg(args, 2);
                        String to = this.getStringArg(args, 3);
                        listenNextEvent(userSession, Type.START_TRIP, callbackContext);
                        DateTime dtFrom = DateTime.parse(from);
                        DateTime dtTo = to == null ? null : DateTime.parse(to);
                        userSession.startTripToSiteWithIdentifierAndETA(siteID, trackToken, dtFrom, dtTo);
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "completeTripToSiteWithIdentifier": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        String siteID = this.getStringArg(args, 0);
                        String trackToken = this.getStringArg(args, 1);
                        listenNextEvent(userSession, Type.COMPLETE_TRIP, callbackContext);
                        userSession.completeTripToSiteWithIdentifier(siteID, trackToken);
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "completeAllTrips": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        listenNextEvent(userSession, Type.COMPLETE_ALL_TRIPS, callbackContext);
                        userSession.completeAllTrips();
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "cancelTripToSiteWithIdentifier": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        String siteID = this.getStringArg(args, 0);
                        String trackToken = this.getStringArg(args, 1);
                        listenNextEvent(userSession, Type.CANCEL_TRIP, callbackContext);
                        userSession.cancelTripToSiteWithIdentifier(siteID, trackToken);
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "cancelAllTrips": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        listenNextEvent(userSession, Type.CANCEL_ALL_TRIPS, callbackContext);
                        userSession.cancelAllTrips();
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "getTrackingIdentifier": {
                    CSMonitoringSession monitoringSession = CSMonitoringSession.getInstance();
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (monitoringSession != null) {
                        callbackContext.success(monitoringSession.getTrackingIdentifier());
                    } else if (userSession != null) {
                        callbackContext.success(userSession.getTrackingIdentifier());
                    } else {
                        callbackContext.error("CSSession must be initialized");
                    }
                    break;
                }
                case "getTrackedSites": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        Object trackedSites = userSession.getTrackedSites();
                        if (trackedSites != null) {
                            callbackContext.success((JSONObject) jsonEncode(trackedSites));
                        } else {
                            callbackContext.success(new JSONArray());
                        }
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "setUserInfo": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        JSONObject userInfoData = args.getJSONObject(0);
                        String fullName = userInfoData.has("fullName") ? userInfoData.getString("fullName") : null;
                        String emailAddress = userInfoData.has("emailAddress") ? userInfoData.getString("emailAddress") : null;
                        String smsNumber = userInfoData.has("smsNumber") ? userInfoData.getString("smsNumber") : null;
                        String vehicleMake = userInfoData.has("vehicleMake") ? userInfoData.getString("vehicleMake") : null;
                        String vehicleModel = userInfoData.has("vehicleModel") ? userInfoData.getString("vehicleModel") : null;
                        String vehicleLicensePlate = userInfoData.has("vehicleLicensePlate")
                                ? userInfoData.getString("vehicleLicensePlate")
                                : null;

                        CSUserInfo userInfo = new CSUserInfo(fullName, emailAddress, smsNumber, vehicleMake, vehicleModel,
                                vehicleLicensePlate);
                        userSession.setUserInfo(userInfo);
                        callbackContext.success();
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "getEtaToSiteWithIdentifier": {
                    CSUserSession userSession = CSUserSession.getInstance();
                    if (userSession != null) {
                        String siteID = this.getStringArg(args, 0);
                        Location location = this.getLocationArg(args, 1);
                        String transportationModeString = this.getStringArg(args, 2);
                        CSTransportationMode transportationMode;
                        if ("walking".equals(transportationModeString)) {
                            transportationMode = CSTransportationMode.WALKING;
                        } else {
                            transportationMode = CSTransportationMode.DRIVING;
                        }
                        listenNextEvent(userSession, Type.ETA_FROM_SITE, callbackContext);
                        userSession.getEtaToSiteWithIdentifier(siteID, location, transportationMode);
                    } else {
                        callbackContext.error("CSUserSession must be initialized");
                    }
                    break;
                }
                case "completeTripForTrackingIdentifier": {
                    CSMonitoringSession monitoringSession = CSMonitoringSession.getInstance();
                    if (monitoringSession != null) {
                        String trackingIdentifier = this.getStringArg(args, 0);
                        List<String> trackTokens = this.getArrayArg(args, 1);
                        listenNextEvent(monitoringSession, Type.COMPLETE_TRIP_FOR_TRACKING_IDENTIFIER, callbackContext);
                        monitoringSession.completeTripForTrackingIdentifier(trackingIdentifier, trackTokens);
                    } else {
                        callbackContext.error("CSMonitoringSession must be initialized");
                    }
                    break;
                }
                case "cancelTripForTrackingIdentifier": {
                    CSMonitoringSession monitoringSession = CSMonitoringSession.getInstance();
                    if (monitoringSession != null) {
                        String trackingIdentifier = this.getStringArg(args, 0);
                        List<String> trackTokens = this.getArrayArg(args, 1);
                        listenNextEvent(monitoringSession, Type.CANCEL_TRIP_FOR_TRACKING_IDENTIFIER, callbackContext);
                        monitoringSession.cancelTripForTrackingIdentifier(trackingIdentifier, trackTokens);
                    } else {
                        callbackContext.error("CSMonitoringSession must be initialized");
                    }
                    break;
                }
                case "startMonitoringArrivalsToSiteWithIdentifier": {
                    CSMonitoringSession monitoringSession = CSMonitoringSession.getInstance();
                    if (monitoringSession != null) {
                        String siteID = this.getStringArg(args, 0);
                        listenNextEvent(monitoringSession, Type.START_MONITORING_ARRIVALS, callbackContext);
                        monitoringSession.startMonitoringArrivalsToSiteWithIdentifier(siteID);
                    } else {
                        callbackContext.error("CSMonitoringSession must be initialized");
                    }
                    break;
                }
                case "stopMonitoringArrivals": {
                    CSMonitoringSession monitoringSession = CSMonitoringSession.getInstance();
                    if (monitoringSession != null) {
                        listenNextEvent(monitoringSession, Type.STOP_MONITORING_ARRIVALS, callbackContext);
                        monitoringSession.stopMonitoringArrivals();
                    } else {
                        callbackContext.error("CSMonitoringSession must be initialized");
                    }
                    break;
                }
                default:
                    callbackContext.error("invalid action:" + action);
                    break;
            }
        }
        return true;
    }
}
