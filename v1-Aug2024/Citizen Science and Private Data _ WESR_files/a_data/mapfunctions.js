var skipMapBounds = false;
var zoomChanged = false;
var mapDragged = false;
var mapBoundsChanged = false;
var getMapBounds = false;
var filteredByDiz = false;
var markerCluster;
var markerClusterArr = new Array();
var markerIds = new Object();
var placeIds = new Object();
var listviewByAlert = new Object();
var localinfoByAlert = new Object();
var viewableMarkerArray = new Array();
var listViewArray = new Array();
var displayapi;
var preciselocations = false;
var numalerts;

function serve_map(hmu_id, preset_id) {

    lat = geo_info['zoom_lat'] ? geo_info['zoom_lat'] : geo_info['default_lat'];
    lon = geo_info['zoom_lon'] ? geo_info['zoom_lon'] : geo_info['default_lon'];
    zoom_level = geo_info['zoom_level'] ? geo_info['zoom_level'] : middlezoom; 

    //timer is set in locator.js for when user ignores the tracking location message
    clearInterval(timerId);

    var myOptions = {
        mapTypeControlOptions: {
            mapTypeIds: 'Styled',
            mapTypeControl: false 
        },
        panControl: false,
        scrollwheel: false,
        streetViewControl: false,
        center: new google.maps.LatLng(lat, lon),
        zoom: zoom_level,
        zoomControl: false,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        mapTypeId: 'Styled'
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    bounds = google.maps.LatLngBounds;

    // you are here icon
    if (geolocation && !passed_loc && (!preset_id || preset_id == local_preset_id)) {
        var youimg = path_to_main + "images/3.0/you.png";
        var you_icon = new google.maps.MarkerImage(youimg, new google.maps.Size(24, 20), new google.maps.Point(0,0), new google.maps.Point(0, 20));
        var yah_latlon = new google.maps.LatLng(lat, lon);
        var yah_hover = "Your Location: "+geo_info['default_locname'];
        yah = new google.maps.Marker({ position: yah_latlon, map: map, icon: you_icon, zIndex: 1, title: yah_hover });
    }

    // kml layers
    if (kmlmapicon == 1) {    
        // KML
        createTogglers();
        // preselect kml layer
        startup(); 
    }
    
    var styledMapType = new google.maps.StyledMapType(mapStyles[defaultMapStyle], { name: 'Styled' });  
    map.mapTypes.set('Styled', styledMapType);

    // define minimum and maximum zoom levels
    styledMapType.getMinimumResolution = function() { return 1; }
    styledMapType.getMaximumResolution = function() { return maxzoom; }

    // slider target
    var target = $('#zoom-slider #zoom-path');

    // create the slider
    target.slider({
        orientation: 'vertical',
        value: middlezoom,
        min: parseInt(styledMapType.getMinimumResolution()),
        max: parseInt(styledMapType.getMaximumResolution()),
        step:   1,
        animate: true,
        stop: function() {
            map.setZoom(parseInt(target.slider('option','value')));
        }
    });

    // START listeners to change map on zoom, pan
    if(geolocation || preciselocations) {
    google.maps.event.addListener(map, 'idle', function() { 
        zoom_level = map.getZoom();
        target.slider('option','value', zoom_level); 
        // only want to override this if user changed location OR picked your location
        if ((zoomChanged || mapDragged) && !skipMapBounds) { 
            mapBoundsChanged = true;
            get_info_in_bounds();
        }
        if(zoomChanged || mapDragged || searchClicked) {
            skipMapBounds = false;
        }
        zoomChanged = false;
        mapDragged = false;
        searchClicked = false;
    });

    google.maps.event.addListener(map, 'dragend', function() {
        mapDragged = true;
    });
    }

    // SHOW MAP LABELS WHEN ZOOMED IN
    google.maps.event.addListener(map, 'zoom_changed', function() {
        if(defaultMapStyle.indexOf('labels') == -1) {
            if(map.getZoom() > 5) { 
                $('#showlabels').attr('checked','checked');
                styledMapType = new google.maps.StyledMapType(mapStyles['hmstylelabels'], { name: 'Styled' }); 
            } else { 
                styledMapType = new google.maps.StyledMapType(mapStyles[defaultMapStyle], { name: 'Styled' }); 
                $('#showlabels').removeAttr('checked');
            }
        }  
        map.mapTypes.set('Styled', styledMapType); 
        zoomChanged = true;
    });

    google.maps.event.addListenerOnce(map, 'bounds_changed', function(){
        if(typeof(passed_params['ps']) != "undefined") {
            preset_id = passed_params['ps'];
            get_preset(preset_id, 'show');
            return;
        }
        if(typeof(passed_params['d']) != "undefined" || typeof(passed_params['p']) != "undefined" || typeof(passed_params['f']) != "undefined" || typeof(passed_params['s']) != "undefined") {
            set_default_view();
            return;
        }
        if(hmu_id && !passed_loc) { // passed loc means lat/lon came in through query string
            // get the user's default presets
            get_preset('', 'build_presetlist', hmu_id);
        } else {
            // if preset is passed in, like partner skins, use that.  Otherwise give either HM default local (381) or HM default global (1)
            var mode = 'show';
            if (!preset_id) {
                preset_id = geolocation ? 381 : 1;
                mode = geolocation ? 'build_presetlist' : 'show';  // if geolocation is on, need to add that preset to the default presetlist
            }
            get_preset(preset_id, mode);
        }
    });

    // maximum slider value
    var maxValue = parseInt(target.slider('option', 'max'));
    // minimum slider value
    var minValue = parseInt(target.slider('option', 'min'));

    if(polyoverlay == "fusion") {
        initFusion();
    }
    //buildHeatMap();
}

function getInfoWindowEvent(marker, counter) {
    var boxText = document.createElement("div");
    var climg = path_to_main + "images/3.0/cl.png";
    boxText.style.cssText = "border-bottom: 0px solid rgba(0,68,119,.7); border-right: 0px solid rgba(0,68,119,.7); border-left: 0px solid rgba(0,68,119,.7); -webkit-box-shadow: 0px 1px 8px rgba(0,0,0,.3); box-shadow: 0px 1px 8px rgba(0,0,0,.3); border-radius: 2px; color: #333; max-height: 300px; overflow: auto; margin-top: 8px; padding: 10px; width: 430px;";
    boxText.innerHTML = contents[counter];
    var boxOptions = {
        content: boxText
        ,pixelOffset: new google.maps.Size(-80, -10)
        ,infoBoxClearance: new google.maps.Size(100, 100)
        ,maxWidth: 0
        ,zIndex: 999
        ,boxStyle: { width: "450px" }
        ,closeBoxMargin: "0px"
        ,closeBoxURL: climg
    };
    var ib = new InfoBox(boxOptions);
    ibArray[counter] = ib;
    google.maps.event.addListener(marker, "click", function (e) {
        skipMapBounds = true;
        if (ibArray) { // close any open infowindows
            for (var ibi in ibArray) {
                ibArray[ibi].close();
            }
        }
        $("#list_view, #trends_view").slideUp(250);
        $("#trends,#list").removeClass('act');
        $("#map").addClass('act');
        $('#navigation').show();
        ib.open(map, this);
    });
}

function getPolyEvents(regionpoly, regionName, regionBalloon, counter) {

    var polyText = document.createElement("div");
    var climg = path_to_main + "images/3.0/cl.png";
    polyText.style.cssText = "border-bottom: 0px solid rgba(0,68,119,.7); border-right: 0px solid rgba(0,68,119,.7); border-left: 0px solid rgba(0,68,119,.7); -webkit-box-shadow: 0px 0px 15px 0px rgba(0,0,0,.3); box-shadow: 0px 0px 15px 0px rgba(0,0,0,.3); border-radius: 2px; color: #333; max-height: 300px; overflow: auto; margin-top: 8px; padding: 10px; width: 180px;";
    polyText.innerHTML = "<p><strong>"+regionName+"</strong></p><div class='at'>" + regionBalloon + "</div>";

    var polyBoxOptions = {
         content: polyText
        ,pixelOffset: new google.maps.Size(-41, 0)
        ,infoBoxClearance: new google.maps.Size(100, 100)
        ,maxWidth: 0
        ,zIndex: 999
        ,boxStyle: { width: "200px" }
        ,closeBoxMargin: "0px"
        ,closeBoxURL: climg 
    };
    var ib = new InfoBox(polyBoxOptions);
    polyibArray[counter] = ib;
    google.maps.event.addListener(regionpoly,"mouseover",function(event) {
        this.setOptions({fillOpacity: .4});
    });
    google.maps.event.addListener(regionpoly, 'mouseout', function() {
        this.setOptions({fillOpacity: 0.3});
    });
    google.maps.event.addListener(regionpoly, "click", function (e) {
        if (polyibArray) { // close any open infowindows
            for (var ibi in polyibArray) {
                polyibArray[ibi].close();
            }
        }
        ib.setPosition(e.latLng);
        ib.open(map);
    });
}

function clear_markers() {
    for (var mi in markerArray) {
        markerArray[mi].setMap(null);
    }
    if(yah) {
        if ($("input[name=locations_search]").filter('[value="current"]').is(":checked")) {
            yah.setVisible(true);
        } else {
            yah.setVisible(false);
        }
    }
    markerArray = new Object();
    if (typeof(markerCluster) != "undefined") {
        markerCluster.clearMarkers();
    }

    // reset the array
    markerClusterArr = new Array();
}

function get_map_bounds() {
    bounds = map.getBounds();
    sw = bounds.getSouthWest();
    ne = bounds.getNorthEast();
    search_filters['lat1'] = sw.lat();
    search_filters['lat2'] = ne.lat();
    search_filters['lon1'] = sw.lng();
    search_filters['lon2'] = ne.lng();
    // keep these the same so the map doesn't pan
    search_filters['zoom_lat'] = map.getCenter().lat();
    search_filters['zoom_lon'] = map.getCenter().lng();
}

function setViewableMarkerArray() {
    // update the number of alerts showing in viewable portion of map
    viewableMarkerArray = new Array();
    listViewArray = new Array();
    for (var mi in markerArray) {
        if( map.getBounds().contains(markerArray[mi].getPosition()) ){
            for(var aid in markerIds[mi]) {
                if(typeof(listviewByAlert[markerIds[mi][aid]]) != "undefined") {  // <= IE8
                    if(typeof(listviewByAlert[markerIds[mi][aid]][placeIds[mi]]) != "undefined") {
                        listViewArray.push(listviewByAlert[markerIds[mi][aid]][placeIds[mi]]);
                    }
                    if(jQuery.inArray(markerIds[mi][aid], viewableMarkerArray) == -1) {
                        viewableMarkerArray.push(markerIds[mi][aid]);
                    }
                }
            }
        }
    }
}

function get_info_in_bounds() {

    if(numalerts > 0) {
        setViewableMarkerArray();
        // if you get the markers in the boundary, but there are none, then zoom out one until you find markers 
        while(viewableMarkerArray.length < 1) {
            var current_zoom = map.getZoom();
            var zoom_out = current_zoom - 1;
            map.setZoom(zoom_out);
            getMapBounds = false;
            // try again to get markers in the viewable range
            setViewableMarkerArray();
        }

        // update outbreaks near me if it is visible
        if(!filteredByDiz && $('#local_block').is(":visible")) {
            get_trends_near_you();
        }

        // update the list view
        update_list_view(listViewArray); 

        if(mapBoundsChanged && !searchClicked) { // if search clicked, it was a change to "my location"
            update_your_to_current();
        }
    }

    // set the number of alerts showing in narrative sentence
    numalerts = viewableMarkerArray.length;
    var numalert_text = numalerts == 1 ? '1 alert for ' : numalerts + ' alerts for ';
    $('#numalerts').text(numalert_text);

    mapBoundsChanged = false;
    if(getMapBounds) {
        skipMapBounds = false;
        getMapBounds = false;
    }
}

function get_trends_near_you() {
    // sometimes we get here if someone gets default preset, closes ONM, then opens it
    if(viewableMarkerArray.length == 0) {
        return;
    } 
    $('#trends_near_you').html('<i class="icon-spinner icon-spin"></i>');
    var ulvurl = path_to_main + "updateViewableMap.php";  
    var query = new Object();
    query['viewable_alerts'] = viewableMarkerArray;
    query['viewable_diseases'] = search_filters['diseases'];
    query['local_info'] = localinfoByAlert;
    query['partner'] = partner;
    $.ajax({url: ulvurl, type: "POST", dataType: 'json', data: query,
        success: function(jsonData) {
            if(jsonData['local_forecast']) {
                $('#trends_near_you').html(jsonData['local_forecast'][0]);
            }
        }
   });
}

function update_list_view(listview, listview_header) { 
    if(listview.length > 0) {
        listView.fnClearTable();
        update_list_view_header(listview_header);
        listView.fnAddData(listview);
        listView.fnDraw();
    }
}

function update_list_view_header(listview_header) { 
    if(typeof(listview_header) == "object") {
        for(var numinobj in listview_header) {
            var tdid = "lvh"+numinobj;
            if(listview_header[numinobj]) {
                $('#'+tdid).html(listview_header[numinobj]);
                listView.fnSetColumnVis(numinobj, true);
            } else {
                listView.fnSetColumnVis(numinobj, false);
            }
        }
    }
}

$('.dis_cat h5, .dis_icon img, .dizcount').live('click', function() {
    // clicked on ONM Disease category, keep all search filters, but change diseases
    // because the map may have panned or zoomed, need to get map bounds for the search
    var dizids = '';
    // SELECTING SINGLE DISEASE
    if($(this).hasClass("dizcount")) {
        $('.dizcount').addClass('inactive');
        $(this).removeClass('inactive');
        var chosencat = $(this).attr('data-cat');
        if($('#dis_cat_'+chosencat).hasClass('inactive')) {
            return false;
        }
        dizids = $(this).attr('data-ids');
        $('.dis_cat').removeClass('selected');
        $('.dis_cat').addClass('inactive');
    } else {
        var thisid = this.id;
        var chosencat = thisid.slice(-2); 
        $('.dizcount').removeClass('inactive');
        // SELECTING EVERYTHING
        if($('#dis_cat_'+chosencat).hasClass('selected')) {
            // deselecting all, show all
            $('.dis_cat').each(function() {
                if(dizids) { dizids += ","; }
                dizids += $(this).attr('data-ids');
            });
            // remove all selected classes, none are selected
            $('.dis_cat').removeClass('selected');
            $('.dis_cat').removeClass('inactive');
        // SELECTING SINGLE CATEGORY
        } else {
            $('.dis_cat').addClass('inactive');
            dizids = $('#dis_cat_'+chosencat).attr('data-ids');
            $('#dis_cat_'+chosencat).addClass('selected');
        }
    }
    $('#dis_cat_'+chosencat).removeClass('inactive');
    skipMapBounds = true;
    filteredByDiz = true;
    search_filters['diseases'] = dizids.split(",");
    get_map_bounds();
    upd_adv_search(search_filters);
    serve_markers(search_filters);
    $('#search').css('display','inline-block');
    skipMapBounds = false;
});

function serve_markers(sf, quickview) {
    // reset the viewable marker array
    viewableMarkerArray = new Array();

    // set the global search_filters variable
    search_filters = sf ? sf : search_filters;

    $('#search_loadingMsg').show();

    clear_markers();

    if(polyoverlay == "google") {
        serve_polygons("regions.xml", search_filters);
    }
    
    // this is for partners that have multiple display api, if their search differs by data type
    if(typeof(showdtypes) != "undefined") {
        displayapi = search_filters['displayapi'] ? search_filters['displayapi'] : partner;
        // FIXME: hack
        if(displayapi == "Predictsurveillance" || displayapi == "Predicttestdata") {
            quickview = displayapi == "Predictsurveillance" ? "PREDICT Animal Sampling Data" : "PREDICT Preliminary Test Results";
            $('#dates_drop').hide();
            $('#dates_dropdown').hide();
        } else if (displayapi == 'Predictallsurv' || displayapi == 'Predict2surveillance') {
            // This is to hide the Date dropdown for PREDICT 1&2 and PREDICT 2 Interview/Sampling Data view since searching by date doesn't work yet.
            $('#dates_drop').hide();
            $('#dates_dropdown').hide();
        } else {
            $('#dates_drop').show();
        }
        for(var adtype in alldtypes) {
            $('#' + alldtypes[adtype] +'_drop').hide();
            $('#' + alldtypes[adtype] +'_dropdown').hide();
        }
        for(var adtype in showdtypes[displayapi]) {
            $('#' + showdtypes[displayapi][adtype] +'_drop').show();
        }
    }
    update_narrative_sentence(quickview);

    search_filters['heatscore'] = 1;
    search_filters['partner'] = partner;

    // "current location" is selected
    if (geolocation && $("input[name=locations_search]").filter('[value="current"]').is(":checked")) {

        // if here and map doesn't move or change, need to get info in bounds
        getMapBounds = true;
        skipMapBounds = true; // so it doesn't happen twice on the times the map is panning or zooming

        if(locChanged) { // change the position of yah marker
            var newlatlng = new google.maps.LatLng(geo_info['default_lat'], geo_info['default_lon']);
            yah.setPosition(newlatlng);
            var newhover = "Your Location: "+geo_info['default_locname'];
            yah.setTitle(newhover);
        }

        // zoom and center in default location, unless the user has filtered by diz (they may have panned before filter)
        if(!filteredByDiz) {
            // passed loc means the lat and lon were passed in or captured in time by cluster on/off option
            search_filters['zoom_lat'] = passed_loc ? geo_info['zoom_lat'] : geo_info['default_lat'];
            search_filters['zoom_lon'] = passed_loc ? geo_info['zoom_lon'] : geo_info['default_lon'];
            search_filters['zoom_level'] = passed_loc ? geo_info['zoom_level'] : localzoom;
        }
        // for trends, use the country of the user, not current location
        search_filters['default_country'] = [geo_info['default_country']];
    }

    var gaurl = path_to_main + "getAlerts.php";
    $.ajax({url: gaurl, dataType: 'json', data: search_filters, 
        success: function(jsonData) {
            localinfoByAlert = jsonData['local_forecast'][1];
            listviewByAlert = jsonData['listview_by_alert'];
            $('#search_loadingMsg').hide();
            if(!passed_loc && (map.getCenter().lat() != jsonData['zoom_lat'] || map.getCenter().lng() != jsonData['zoom_lon'])) {
                var newzoom = !isNaN(parseInt(jsonData['zoom_level'])) ? parseInt(jsonData['zoom_level']) : maxzoom;
                map.setZoom(newzoom);
                map.setCenter(new google.maps.LatLng(jsonData['zoom_lat'], jsonData['zoom_lon']));
            }
            var marker = latlon = "";
            var markers = jsonData['markers'];
            numalerts = jsonData['numalerts'];
            var numalert_text = numalerts == 1 ? '1 alert for ' : numalerts + ' alerts for ';
            $('#numalerts').text(numalert_text);
            var maplegend = jsonData['maplegend'];
            $('#activity_index').html(maplegend);

            // update the timeline div if it's showing by default
            if(trends_showing) {
                get_trends(trends);
            }

            // loop through and place all markers on the map
            for (var i=0; i<markers.length; i++) {
                latlon = new google.maps.LatLng(markers[i].lat, markers[i].lon);
                var latlonstr = markers[i].lat+markers[i].lon;
                contents[i] = markers[i].html;
                markerIds[i] = markers[i].alertids;
                placeIds[i] = markers[i].place_id;
                marker = new google.maps.Marker({ position: latlon, map: map, title: markers[i].label, icon: pins[markers[i].pin] });
                markerArray[i] = marker;
                markerClusterArr.push(marker);
                getInfoWindowEvent(marker, i);
            }

            if(marker_cluster) {
                //set style options for marker clusters (these are the default styles)
                var mcOptions = {styles: [
                            { height: 34, url: path_to_main+"images/3.0/pins/1.png", width: 34 },
                            { height: 55, url: path_to_main+"images/3.0/pins/2.png", width: 55 },
                            { height: 89, url: path_to_main+"images/3.0/pins/3.png", width: 89 },
                            { height: 144, url: path_to_main+"images/3.0/pins/4.png", width: 144 },
                            { height: 144, url: path_to_main+"images/3.0/pins/5.png", width: 144 }]}            
                markerCluster = new MarkerClusterer(map, markerClusterArr, mcOptions);
            }

            if(getMapBounds) {
                // if it's the first time, will only show what's in viewable window
                get_info_in_bounds();
                // sometimes it's species, sometimes it's distance in miles
                update_list_view_header(jsonData['list_view_header']);
            } else {
                // local forecast box, only update if it wasn't a click to filter by disease cat
                if(!filteredByDiz && $('#local_block').is(":visible")) {
                    $('#trends_near_you').html(jsonData['local_forecast'][0]);
                } else if (filteredByDiz) {
                    // build list of viewable markers if local block is clicked on
                    viewableMarkerArray = new Array();
                    for (var mi in markerArray) {
                        for(var aid in markerIds[mi]) {
                            if(jQuery.inArray(markerIds[mi][aid], viewableMarkerArray) == -1) {
                                viewableMarkerArray.push(markerIds[mi][aid]);
                            }
                        }
                    }
                }
                // update the list view
                update_list_view(jsonData['listview'], jsonData['list_view_header']);
            }
            // reset these global variables
            mapBoundsChanged = false;
            locChanged = false;
            filteredByDiz = false;
            passed_loc = false;
        }
    });
}

function serve_polygons(filename, search_filters) {
    var color = new Object();
    color[1] = "#ff00d8";
    color[2] = "#6c00ff";
    color[3] = "#0042ff";
    color[4] = "#00deff";
    color[5] = "#00ff84";
    var rhurl = path_to_main + "getRegionHeat.php";
    $.ajax({url: rhurl, dataType: 'json', data: search_filters, 
        success: function(jsonData) {
            var regionHeat = jsonData['regionheat'];
            // if the polygons already exist, just update them
            if(polyArray.length > 0) {
                for(var regionId in polyArray) {
                    for(var tp in polyArray[regionId]) {
                        var thepoly = polyArray[regionId][tp];
                        //var theib = allibs[rid][tp];
                        thepoly.setOptions({fillColor: color[regionHeat[regionId]]});
                        //theib.setContent(boxText);
                    }
                }
                return;
            }
            $.ajax({ type: "GET", url: filename, dataType: "xml",
                success: function(xml) {
                    $(xml).find("region").each( function() {
                        var regionId = $(this).attr("id");
                        var regionName = $(this).attr("name");
                        var polycolor = typeof(color[regionHeat[regionId]]) != "undefined" ? color[regionHeat[regionId]] : '#cccccc';
                        var stateCoords = new Array();
                        $(this).find("point").each(function() {
                            var lat = $(this).attr("lat");
                            var lon = $(this).attr("lon");
                            stateCoords.push(new google.maps.LatLng(lat, lon));
                        });
                        var regionpoly = new google.maps.Polygon({ 
                            paths: stateCoords, 
                            strokeColor: "#fff", 
                            strokeOpacity: 0, 
                            strokeWeight: 0, 
                            fillColor: polycolor, 
                            fillOpacity: .2
                        });
                        regionpoly.setMap(map);
                        if(polyArray[regionId]) {
                            polyArray[regionId].push(regionpoly);
                        } else {
                            polyArray[regionId] = new Array(regionpoly);
                        }
                        // info window for poly
                        var polyText = document.createElement("div");
                        polyText.style.cssText = "border-radius: 2px; color: #000; margin-top: 1px; background: #fff; padding: 5px 3px; text-align: center;";
                        polyText.innerHTML = regionName;
                        var polyBoxOptions = {
                            content: polyText
                            ,boxStyle: { background: "url('../images/3.0/asc.png') no-repeat 40px 1px",opacity: .9, width: "150px" }
                            ,closeBoxURL: ""
                            ,isHidden: false
                            ,pane: "floatPane"
                        };
                        var ib = new InfoBox(polyBoxOptions);
                        google.maps.event.addListener(regionpoly,"mouseover",function(event) {
                            ib.setPosition(event.latLng);
                            ib.open(map);
                        });
                        google.maps.event.addListener(regionpoly,"mouseout",function(){ ib.close(); })
                    });
                }
            });
        }
    });
}

function initFusion() {
    // Initialize JSONP request
    var script = document.createElement('script');
    var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
    url.push('sql=');
    var query = 'SELECT name, kml_4326 FROM ' + '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ';
    var encodedQuery = encodeURIComponent(query);
    url.push(encodedQuery);
    url.push('&callback=buildFusionPolys');
    url.push('&key=AIzaSyBXGodLA3xy3hnzCSP2gdFSSV3BrfyDRr4');
    script.src = url.join('');
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
}

function buildHeatMap() {

    $.get('../twitterlayer/nycmapdata.js', function(data) {
        var mapData = [];
        var keys = Object.keys(results.features);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var date = results.features[key].properties.date;
    //        var min = start;
    //        var max = end;
    //        if (date >= min && date <= max){
                var coords = results.features[key].geometry.coordinates;
                var latLng = new google.maps.LatLng(coords[0],coords[1]);
                var Loc = {
                    id: key,//***
                    location: latLng,
                    weight: results.features[key].properties.weight, 
                    text: results.features[key].properties.text,
                    locationString: coords[0].toString() + ", " + coords[1].toString(),
                    areakey: results.features[key].properties.areakey,
                    day: results.features[key].properties.dateString.day,
                    time: results.features[key].properties.dateString.time
                };
                mapData.push(Loc);
            };
     //   };
        var heatmap = new google.maps.visualization.HeatmapLayer({
            data: mapData,
            radius: 50,
            maxIntensity: 0.3,
            opacity: 0.5
        });
        heatmap.setMap(map);
    });
}

function buildFusionPolys(data) {

    var countrymap = new Object();
    countrymap['Central African Rep.'] = 'Central African Republic';
    countrymap['Congo (Kinshasa)'] = 'DR Congo';
    countrymap['W. Sahara'] = 'Western Sahara';
    countrymap['S. Sudan'] = 'South Sudan';

    var color = new Object();
    color[0] = '#000000';
    color[1] = '#377e37';
    color[2] = '#006d71';
    color[3] = '#003c71';
    color[4] = '#3e3365';

    var rhurl = path_to_main + "getRegionHeat.php";
    var rows = data['rows'];
    $.ajax({url: rhurl, dataType: 'json', data: search_filters,
        success: function(jsonData) {
            var regionVals = jsonData['regionheat'];
            for (var i in rows) {
                var regionId = i;
                var regionName = rows[i][0];
                // map the fusion country name to our db name
                regionName = typeof(countrymap[regionName]) != "undefined" ? countrymap[regionName] : regionName;
                // if the country doesn't have heat, don't include in overlay
                if(typeof(regionVals[regionName]) == "undefined") {
                    continue;
                }
                var regionHeat = typeof(regionVals[regionName]) != "undefined" ? regionVals[regionName][0] : 0;
                var regionBalloon = typeof(regionVals[regionName]) != "undefined" ? regionVals[regionName][1] : 'Unknown';
                if (regionName != 'Antarctica') {
                    var newCoordinates = [];
                    var geometries = rows[i][1]['geometries'];
                    if (geometries) {
                        for (var j in geometries) {
                            newCoordinates.push(constructFusionCoordinates(geometries[j]));
                        }
                    } else {
                        newCoordinates = constructFusionCoordinates(rows[i][1]['geometry']);
                    }
                    var randomnumber = Math.floor(Math.random() * 4);
                    var polycolor = color[regionHeat] ? color[regionHeat] : '#000000';
                    var regionpoly = new google.maps.Polygon({
                        paths: newCoordinates,
                        strokeColor: polycolor,
                        strokeOpacity: .5,
                        strokeWeight: 1,
                        fillColor: polycolor,
                        fillOpacity: .3
                    });
                    regionpoly.setMap(map);
                    if(polyArray[regionId]) {
                        polyArray[regionId].push(regionpoly);
                    } else {
                        polyArray[regionId] = new Array(regionpoly);
                    }
                    // set up listeners
                    getPolyEvents(regionpoly, regionName, regionBalloon, i);
                }
            }
        }
    });
}

function constructFusionCoordinates(polygon) {
    var newCoordinates = [];
    if(typeof(polygon['coordinates']) != "undefined") {
        var coordinates = polygon['coordinates'][0];
        for (var i in coordinates) {
            newCoordinates.push( new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
        }
    }
    return newCoordinates;
}
