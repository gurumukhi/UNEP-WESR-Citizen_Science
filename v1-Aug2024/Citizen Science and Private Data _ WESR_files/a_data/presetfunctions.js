$(document).ready(function () {

    // click preset
    $('.qv').live("click", function() {
        preset_id = (this.id).replace("qv_", "");
        get_preset(preset_id, "show");
        $('#close_search').trigger('click');
        if (ibArray) { // close any open infowindows
            for (var ibi in ibArray) {
                ibArray[ibi].close();
            }
        }
        $('.qv').removeClass('active');
        $(this).addClass('active');
    });

    $('.qvtitle').live('mouseover', function(event) {
        $(this).qtip({
            overwrite: false, 
            content: { attr: 'tooltip' },
            style: { classes: 'bluetooltip', tip: { corner: "topMiddle", width: 6, height: 6 }, width: 150},
            position: { at: "bottom center", my: "top center" },
            show: {
                event: event.type, 
                ready: true, 
                solo: true
            }
            }, event); 
    }).each(function(i) {
        $.attr(this, 'oldtitle', $.attr(this, 'title'));
        this.removeAttribute('title');
    });
         
        $('.qv').live('hover', function() { 
            if(hmu_id) {
                $(this).find('.edit_preset').toggle();
                }
         });

    // trash preset
    $('.qv .icon-trash').live("click", function(e) {
        e.stopPropagation();
        var presetname = $(this).attr('title');
        var x = confirm('Are you sure you want to delete ' + presetname + ' from your saved searches?');
        if (x==true) {
            var query = new Object();
            var trash_preset_id = $(this).attr("id");
            query['preset_id'] = trash_preset_id.replace('qtip-','');
            save_preset(query, 'delete');
            $('#show_views_dropdown_options').prepend('<span class="success"><i class="icon-trash"></i> ' + presetname + ' has been deleted.</span>').show();
            $('.success').delay(5000).fadeOut('slow');
        } else return false;
    });
    
    // edit preset
    $('.qv .icon-edit').live("click", function(e) {
        e.stopPropagation();
        $('#saveview label').inFieldLabels();
        $('#search_dropdown, #show_search_dropdown_options').show();
        $('#saveview').prependTo('#show_search_dropdown_options').show();
        $('.search_dropdown_cat, #show_views_dropdown_options').hide();
        $('#save_search_choice').html('Edit this saved search');
        edit_preset_id = $(this).attr("id");
        edit_preset_id = edit_preset_id.replace('qtip-','');
        $('#submit_search').val('update saved search');
        $('.submitsearch').removeClass('editsearch');
        get_preset(edit_preset_id, "edit");
        // cancel editing preset        
        $('#close_search').click(function() {
            reset_search();
            $('#show_views_dropdown_options').show();
            $('#show_search_dropdown_options').hide();
        });
        $('#show_search_drop, #show_search').click(function() {
            reset_search();
            $('#show_views_dropdown_options, #saveview').hide();
            $('#show_search_dropdown_options').show();
        });
    });
  
      
    // sort presets
    $('#show_views_dropdown_options').on('mouseover', function() {
        if(hmu_id) {
            $('#presetlist').sortable({
                update : function() {
                    var query = new Object();
                    query['preset_ids'] = $('#presetlist').sortable( "toArray" );
                    save_preset(query, 'update');
                }
            });
        }});
    });

function save_preset(query, action) {
    if(action) { // either delete or update
        query['action'] = action;
    } else { // save
        query['map_center_lat'] = map.getCenter().lat();
        query['map_center_lon'] = map.getCenter().lng();
        query['zoom_level'] = map.getZoom();
        query['map_type'] = map.getMapTypeId();
        query['name'] = $('#viewn').val();
        query['description'] = $('#viewd').val();
        if(typeof(edit_preset_id) != "undefined" && edit_preset_id > 0) {
            query['preset_id'] = edit_preset_id;
        }
    }
    query['partner'] = partner;
    var spurl = path_to_main + "savePreset.php";
    $.ajax({ type: "POST", url: spurl, dataType: 'json', data: query,
        success: function(resp) {
            if(action == "update") {
                return false;
            }
            // change the preset list to include just added
            if(typeof(resp['preset_list']) != "undefined") {
                $('#presetlist').html(resp['preset_list']);
            }
            // hide the ability to save the view since you just saved it
            $('#saveview').hide();
            edit_preset_id = ''; // reset this so if you click on a preset, it doesn't remember the last editted preset
        }
    });
    return false;
}
    
function get_preset(passed_preset_id, mode, hmu_id) {
    // set preset_id for global context
    preset_id = passed_preset_id;
    query = new Object();
    skipMapBounds = true;
    if(preset_id) {
        query['qvid'] = preset_id;
    } else {
        query['hmu_id'] = hmu_id;
    }
    query['mode'] = mode;
    query['geolocation'] = geolocation; // if this is set to 1, the local view preset will get pushed on to presetlist
    query['partner'] = partner;
    var purl = path_to_main + "getPreset.php";
    $.ajax({url: purl, dataType: 'json', data: query, 
        success: function(jsonData) {
            if(mode == "edit") {
                $('#viewn').val(jsonData['preset_info']['name']);
                $('#viewd').val(jsonData['preset_info']['description']);
            } else {
                if(mode == "build_presetlist") {
                    preset_id = jsonData['default_preset'];
                    $('#presetlist').html(jsonData['preset_list']);
                    if(hmu_id) {
                        $('#presetlist').addClass("sortable");
                    }
                }
                $('#saveview').hide();  // have to put this here b/c initial get_preset doesn't have click trigger
            }
            upd_adv_search(jsonData['advanced_search']);
            // don't override passed in location info
            jsonData['advanced_search']['zoom_lat'] = passed_loc ? geo_info['zoom_lat'] : jsonData['preset_info']['map_center_lat'];
            jsonData['advanced_search']['zoom_lon'] = passed_loc ? geo_info['zoom_lon'] : jsonData['preset_info']['map_center_lon'];
            jsonData['advanced_search']['zoom_level'] = passed_loc ? geo_info['zoom_level'] : jsonData['preset_info']['zoom_level'];
            jsonData['advanced_search']['displayapi'] = jsonData['preset_info']['displayapi'];
            serve_markers(jsonData['advanced_search'], jsonData['preset_info']['name']);
        }
    });
}
