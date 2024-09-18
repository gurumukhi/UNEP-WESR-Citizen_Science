// this is for Firefox mainly - if we get to w3c geolocation and permission 
// has not been granted to use location, we need to error out
var timerId = window.setInterval(timedout, 10000);
var locChanged = false;
var geo_info = new Object();
function timedout() {
    set_user_location();  //just serve the map without lat/lon
}

function w3c_geolocate(callback) {
  // Last but not least, try W3C Geolocation method (Preferred)
  if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) { 
            var latlng = [position.coords.latitude, position.coords.longitude];
            callback(latlng);
        }, function(error) {
            set_user_location();
        },{timeout:10000});
  } else {
    // Browser doesn't support Geolocation
    set_user_location();  //just serve the map without lat/lon
  }
}

function google_geo_by_address(address, callback) {
    geocoder = new google.maps.Geocoder();
    var locinfo = new Object();
    geocoder.geocode( {'address': address }, function(results, status) {
        if(status == "OK") {
            locinfo['default_lat'] = ""+results[0].geometry.location.lat();
            locinfo['default_lon'] = ""+results[0].geometry.location.lng();
            locinfo['default_locname'] = ""+results[0].formatted_address;
            var place_names = new Array();
            place_names = locinfo['default_locname'].split(",");
            var pnl = place_names.length;
            var country_name = $.trim(place_names[pnl - 1]);
            locinfo['default_country'] = ""+country_lu[country_name];
        }
        callback(locinfo);
    });
}

function google_geo_by_ll(lat, lon, callback) {
    if(!lat || !lon) {
        w3c_geolocate();
    }
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lon);
    var locinfo = new Object();
    geocoder.geocode( {'latLng': latlng }, function(results, status) {
        if(status == "OK") {
            locinfo['default_lat'] = lat;
            locinfo['default_lon'] = lon;
            locinfo['default_locname'] = results[0].formatted_address;
            var place_names = new Array();
            place_names = locinfo['default_locname'].split(",");
            var pnl = place_names.length;
            var country_name = $.trim(place_names[pnl - 1]);
            locinfo['default_country'] = country_lu[country_name];
        }
        callback(locinfo);
    });
}

// this is always called on pageload, then need to serve_map for first time
function set_user_location(loc_info, hmu_id, preset_id, set_hm_cookie) {
    // sometimes geo_info is not set, like if the user didn't accept geolocation
    if(typeof(loc_info) == "undefined") {
        geo_info['default_lat'] = worldlat;
        geo_info['default_lon'] = worldlon;
        geo_info['zoom_level'] = worldzoom;
        geolocation = false;
    } else {
        geo_info = loc_info; // set this so it can be used globally
    }
    // allow for passing of lat/lon in the query string
    if(typeof(passed_params['latlon']) != "undefined") {
        var llarr = passed_params['latlon'].split(",");
        geo_info['zoom_lat'] = llarr[0];
        geo_info['zoom_lon'] = llarr[1];
        geo_info['zoom_level'] = parseInt(llarr[2]);
        passed_loc = true;
    }
    // set the geo_info to default if not set
    geo_info['default_radius'] = geo_info['default_radius'] ? geo_info['default_radius'] : 50;
    if(set_hm_cookie) {
        var user_info = new Object();
        user_info['hmu_id'] = hmu_id;
        user_info['default_location'] = geo_info['default_lat']+","+geo_info['default_lon'];
        user_info['default_locname'] = geo_info['default_locname'];
        user_info['default_radius'] = geo_info['default_radius'];
        user_info['default_country'] = geo_info['default_country'];
        $.ajax({ url: "../authUser.php", dataType: 'json', data: user_info,
            success: function(jsonData) {
                //console.log(jsonData);
            }
        });
    }
    // geo_info comes in from google_geo_by_ll as an object: lat, lon, locname 
    if(geolocation) {
        // by default, show local info
        //$('#radius_change').val(geo_info['default_radius']);
        $("#locations_dropdown label:first").html('Your Location<span id="locname">: '+geo_info['default_locname']+'</span>');
        // sometimes zoom is passed in
        geo_info['zoom_level'] = geo_info['zoom_level'] ? geo_info['zoom_level'] : localzoom;
    } else {
        $("#currentlocation").parent().hide();
    }

    if(locChanged) {
        return geo_info;
    }

    serve_map(hmu_id, preset_id);

    // hide flucast site link if user is not in US
    if(location_info['default_country'] != 106) {
        $('#flucastsite').hide();
    }
    var state = location_info['default_locname'];
   /*  $('#goviral').hide();
    if((state.indexOf('MA') !== -1) || (state.indexOf('NY') !== -1)) {
        $('#goviral').show();
    }*/
}
