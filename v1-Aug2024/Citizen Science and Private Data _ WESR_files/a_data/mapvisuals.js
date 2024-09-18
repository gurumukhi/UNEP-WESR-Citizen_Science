$(document).ready(function () {

    // This function is to get the browser cookies to determine if a user is logged in
    var getCookies = function(){
        var pairs = document.cookie.split(";");
        var cookies = {};
        for (var i=0; i<pairs.length; i++){
          var pair = pairs[i].split("=");
          cookies[(pair[0]+'').trim()] = unescape(pair[1]);
        }
        return cookies;
      }

    var cookies = getCookies();

    // console.log('The hmu_id is: ', cookies['HealthMap[hmu_id]'])

    // only show the download link if the user is logged in
    if(hmu_id) {
        $('#download').show();
    } else if (partner == "mriids") {
        $('#download').show();
    } else if (partner == "predict") {
        $('#download').show();
    } else {
        $('#download').hide();
    }

    // For PREDICT, this checks if there is a hmu_id for a logged in user stored in the cookies and if not, changes the text for the download button telling the user to login. 
    if (partner == "predict" && !cookies['HealthMap[hmu_id]']) {
        $('#download').attr('title', 'Please log in to download')
    } else if (partner == "predict" && cookies['HealthMap[hmu_id]']) {
        $('#download').attr('title', 'Download map data to csv')
    }

    $('#submit_location').click(function() {
        var newloc = $('#location_change').val();
        if(newloc) {
            google_geo_by_address(newloc, function(locinfo) { 
                locChanged = true;
                geo_info = set_user_location(locinfo, hmu_id, '', true);
                get_preset(local_preset_id, "show", hmu_id);
            });
        }
        // close the popup
        $('#settings_block').fadeOut(500);
        $('#map_icons i').removeClass('act');
    });

    $('#radius_change').change(function() {
        geo_info['default_radius'] = this.value;
        if (geolocation && $("input[name=locations_search]").filter('[value="current"]').is(":checked")) {
            // fixme, change the cookie value for radius
            get_preset(local_preset_id, "show");
        }
    });

    // map pins
    for(var pp=1; pp<7; pp++) {
        pins['l'+pp] = new google.maps.MarkerImage(path_to_pins+'images/3.0/pins/l'+pp+'.png', new google.maps.Size(21, 21));
        pins['s'+pp] = new google.maps.MarkerImage(path_to_pins+'images/3.0/pins/s'+pp+'.png', new google.maps.Size(13, 13));
    }

    // if popup is visible by default - before clicking on icon - make it draggable
    $('.mi_popup').draggable({ handle: ".drag_container header" });
    
    // map icons
    $('#map_icons i').click(function() {
        $(".mi_popup").css("display","none");
        var iconcat = (this.id).replace("_container", "");
        $('#map_icons i').removeClass('act');
        // don't expand content for add alert since that has a fancybox
        if(iconcat != "add") {
            $('#' + iconcat + '_block').fadeIn(500).draggable({ handle: ".drag_container header" });
            $('#close_' + iconcat).show();
            $(this).addClass('act');
        }
    });

    $('.close_icons').click(function() {
        var iconcat = (this.id).replace("close_", "");
        $('#' + iconcat + '_block').fadeOut(500);
        $('#map_icons i').removeClass('act');
        $(this).hide();
    });

    // update content in trends near you if necessary
    $('#local_container').click(function() {
        if($('#local_block').is(":visible")) {
            get_trends_near_you();
        }
    });

    // different action for clicking on add alert
    $("#add_container").fancybox({
        helpers : {overlay : { css : { 'background': 'rgba(0,0,0,.2)'}}, title : null },
        padding: 0,
        type: 'iframe',
        href: path_to_news_form + '/add_alert.php',
        width: 500
   });

    $('#map_icons i').qtip({
        content: { attr: 'title' },
        show: { event: "mouseover" },
        hide: { event: "mouseout" },
        style: { tip: { corner: "topMiddle", width: 6, height: 6 }, width: 80, classes: 'blacktooltip' },
        position: { at: "bottom center", my: "top center" }
    });

    // map style
    $('#settings_content').on("click", ".mapstyle", function() {
        if ($('.mapstyle input:checked').length==2) { // both contrast & labels selected
            var styleval = "hmstylecontrastlabels";
        } else {
            var styleval = typeof($(".mapstyle input:checked").val()) == "undefined" ? "hmstyle" : $(".mapstyle input:checked").val();
        }
        var styledMapType = new google.maps.StyledMapType(mapStyles[styleval], { name: 'Styled' });
        map.mapTypes.set('Styled', styledMapType);
    });

    // marker style - cluster or not
    $('#settings_content').on("click", ".markerstyle", function() {
        clear_markers();
        marker_cluster = $(".markerstyle input:checked").val() == "clustered" ? true : false;
        // save the current zoom & center so it doesn't reset to previous search
        geo_info['zoom_lat'] = map.getCenter().lat();
        geo_info['zoom_lon'] = map.getCenter().lng();
        geo_info['zoom_level'] = map.getZoom();
        passed_loc = true; // so the serve markers doesn't overwrite these set values
        serve_markers();
    });

});

// map styles
var mapStyles = new Object();
if(typeof(defaultMapStyle) == "undefined") {
    var defaultMapStyle = typeof(defaultMapStyle) == "undefined" ? 'hmstyle' : defaultMapStyle;
}

mapStyles['hmstyle'] = [
{stylers: [ { "saturation": -100 }]},
{featureType: "road", stylers: [ { visibility: "off" } ] },
{featureType: "transit", stylers: [ { visibility: "off" } ] },
{elementType: "labels", stylers: [ { visibility: "off" } ] },
{featureType: "poi", stylers: [ { visibility: "off" } ] },
{featureType: "water", stylers: [{ color: "#e3e3e3" }]},
{featureType: "landscape", stylers: [{ color: "#ffffff" }]},
{featureType: "administrative", elementType: "geometry",stylers: [{lightness: 20},{visibility: "on" },{weight: .5 }]}, 
{featureType: "administrative",elementType: "geometry.fill","stylers": [{ "visibility": "off" }]}
]

mapStyles['hmstylecontrastlabels'] = [
{stylers: [ { "saturation": -100 }]},
{elementType: "labels", stylers: [ { visibility: "on" } ] },
{featureType: "road", stylers: [ { visibility: "off" } ] },
{featureType: "transit", stylers: [ { visibility: "off" } ] },
{featureType: "poi", stylers: [ { visibility: "off" } ] },
{featureType: "water", stylers: [{ color: "#cacaca" }]},
{featureType: "landscape", stylers: [{ color: "#ffffff" }]},
{featureType: "administrative", elementType: "geometry",stylers: [{visibility: "on" },{weight: 1 }]}, 
{featureType: "administrative",elementType: "geometry.fill","stylers": [{ "visibility": "off" }]},
{elementType: "labels.text.stroke", stylers: [{ visibility: "off" }]},
{elementType: "labels.text.fill", stylers: [{ color: "#666666" }, { visibility: "on" }]},
{featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }]},
{elementType: "labels.icon", stylers: [{ "visibility": "off" }]}
]

mapStyles['hmstylecontrast'] = [
{stylers: [ { "saturation": -100 }]},
{featureType: "road", stylers: [ { visibility: "off" } ] },
{featureType: "transit", stylers: [ { visibility: "off" } ] },
{elementType: "labels", stylers: [ { visibility: "off" } ] },
{featureType: "poi", stylers: [ { visibility: "off" } ] },
{featureType: "water", stylers: [{ color: "#cacaca" }]},
{featureType: "landscape", stylers: [{ color: "#ffffff" }]},
{featureType: "administrative", elementType: "geometry",stylers: [{visibility: "on" },{weight: 1 }]}, 
{featureType: "administrative",elementType: "geometry.fill","stylers": [{ "visibility": "off" }]}
]

mapStyles['hmstylelabels'] = [
{stylers: [ { "saturation": -100 }]},
{elementType: "labels", stylers: [ { visibility: "on" } ] },
{featureType: "road", stylers: [ { visibility: "off" } ] },
{featureType: "transit", stylers: [ { visibility: "off" } ] },
{featureType: "poi", stylers: [ { visibility: "off" } ] },
{featureType: "water", stylers: [{ color: "#e3e3e3" }]},
{featureType: "landscape", stylers: [{ color: "#ffffff" }]},
{featureType: "administrative", elementType: "geometry",stylers: [{lightness: 20},{visibility: "on" },{weight: .5 }]}, 
{featureType: "administrative",elementType: "geometry.fill","stylers": [{ "visibility": "off" }]},
{elementType: "labels.text.stroke", stylers: [{ visibility: "off" }]},
{elementType: "labels.text.fill", stylers: [{ color: "#999999" }, { visibility: "on" }]},
{featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }]},
{elementType: "labels.icon", stylers: [{ "visibility": "off" }]}
]

mapStyles['mosstyle'] = [
{ featureType: "poi", elementType: "geometry", stylers: [ { visibility: "off" } ] },
{ featureType: "road", stylers: [ { visibility: "off" } ] },
{ featureType: "transit", stylers: [ { visibility: "off" } ] },
{ featureType: "landscape", stylers: [ { lightness: 0 }, { saturation: -99 } ] },
{ featureType: "administrative", elementType: "labels", stylers: [ { visibility: "on" }, { lightness: 40 }, { saturation: -100 } ] },
{ featureType: "water", elementType: "labels", stylers: [ { visibility: "off" } ] },
{ featureType: "administrative.country", elementType: "geometry", stylers: [ { saturation: -100 }, { lightness: 20 } ] },
{ featureType: "administrative", elementType: "geometry", stylers: [ { saturation: -100 }, { lightness: 0 }, { visibility: "on" } ] },
{ featureType: "poi", stylers: [ { visibility: "off" } ] },
{ featureType: "water", stylers: [{ color: "#dfdfdf" }]},
{ featureType: "landscape", stylers: [{ color: "#ffffff" }]},
{ "stylers": [{ "saturation": -100 }] },
{ featureType: "landscape", elementType: "labels.text.stroke", stylers: [{ visibility: "off" }]},
{ featureType: "landscape", elementType: "labels.text.fill", stylers: [{ color: "#000000" }, { visibility: "on" }]}
]
