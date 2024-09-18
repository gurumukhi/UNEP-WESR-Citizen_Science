var searchClicked = false;
if(typeof(onm_title1) == "undefined") {
    var onm_title1 = "Outbreaks Near Me";
    var onm_title2 = "Outbreaks in Current Location";
}
var excludeoptions = new Object();
var allsearchoptions = new Object();
var precise_filters = new Object();

// this function is used in presetfunctions.js and searchfunctions.js
// reset search - if edit presets or save search are open close them
function reset_search() {
    edit_preset_id = '';
    $('#viewn').val('');
    $('#viewd').val('');
    $('#saveview').hide();
    $('#saveview').prependTo('#show_search_dropdown_options').show();
    $('#save_search_choice').html('Save search');
    $('#submit_search').val('submit search');
    }

$(document).ready(function () {


    // change location link next to location in search
    $('.editloc').click(function() {
        $(".mi_popup").css("display","none"); // close all other popups
        $('#settings_block, #close_settings').show();
        $('#search_dropdown, #close_search').hide();
        $('#settings_container').addClass('act');
    });

    // logic for removing an item from select list
    for (var d=0; d<alldtypes.length; d++) {
        var dtype = alldtypes[d];
        $("."+dtype+"_sel").live('click', function() { 
            $(this).parent().remove(); 
            var removesel = this.id;
            var removeselid = removesel.replace($(this).attr("class"), "");
            var removetype = removesel.replace("_sel"+removeselid, "");
            // remove it from the excludeoptions array and rebuild search choices
            excludeoptions[removetype].splice( $.inArray(removeselid, excludeoptions[removetype]), 1 );
            build_valid_searchoptions(removetype, allsearchoptions[removetype], excludeoptions[removetype]);
            // if none are selected, make all dtype selected radio button
            if( $("#selected_"+removetype).is(':empty') ) {
                $('input[name='+ removetype +'_search]').filter('[value="all"]').attr('checked', 'true');
            }
        });
    }

    // search autocomplete logic
    $('.searchbox').click(function() {
        $('#places_searchbox').val("");
        $(this).autocomplete('search','');
        $('input[name='+ (this.id).replace("_searchbox", "") +'_search]').filter('[value="pick"]').attr('checked', 'true');
    })
    // location search dropdown
    $('#places_searchbox').click(function() {
        $(this).geocomplete().bind("geocode:result", function(event, result) { 
            precise_filters['zoom_lat'] = result.geometry.location.lat();
            precise_filters['zoom_lon'] = result.geometry.location.lng();
        });
        $('input[name=locations_search]').filter('[value="precise"]').attr('checked', 'true');
    })

    $('.searchbox_type').click(function() {
        $('#places_searchbox').val("");
        var chosen_type = $(this).attr('name').replace("_search", "");
        if( $(this).filter('[value="all"]').is(":checked") || $(this).filter('[value="current"]').is(":checked") || $(this).filter('[value="precise"]').is(":checked") || $(this).is(":focus")) {
            // reset the select list to have everything and clear selected list
            excludeoptions[chosen_type] = new Array();
            build_valid_searchoptions(chosen_type, allsearchoptions[chosen_type], excludeoptions[chosen_type]);
            $("#selected_"+chosen_type).empty();
        }
    });

    // clear date range if date dropdown is selected
    $('#datechoice1').click(function() {
        $('#date1,#date2').val("");
    });

    for (var i=0;i<urls.length;i++) { 
        $.getJSON(urls[i], function(source) {
            var whicharr = $(this)[0]['url'].split("/");
            var which = whicharr[whicharr.length-1].replace("_picklist.js", "");
            excludeoptions[which] = new Array();
            allsearchoptions[which] = source; // make it globally accessible
            $("#"+which+"_searchbox").autocomplete({
                minLength: 0,
                source: function (request, response) {
                    var term = $.ui.autocomplete.escapeRegex(request.term)
                    , startsWithMatcher = new RegExp("^" + term, "i")
                    , startsWith = $.grep(source, function(value) {
                    return startsWithMatcher.test(value.label || value.value || value);
                    })
                    , containsMatcher = new RegExp(term, "i")
                    , contains = $.grep(source, function (value) {
                    return $.inArray(value, startsWith) < 0 &&
                    containsMatcher.test(value.label || value.value || value);
                    });
                    response(startsWith.concat(contains));
                    },
                select: function(event, ui) {
                    event.preventDefault();
                    $(this).val('');

                    // add it to the exclude array so it's not in the select box                
                    excludeoptions[which].push(ui.item.value);
                    // rebuild the autoselect choices to exclude already chosen
                    if(excludeoptions[which].length > 0) {
                        build_valid_searchoptions(which, allsearchoptions[which], excludeoptions[which]);
                    }
                    $("#selected_"+which).append('<span><input type="checkbox" value="' + ui.item.value + '" checked><label class="'+which+'_sel" id="'+which+'_sel'+ui.item.value+'" for="' + ui.item.value + '">' +ui.item.label +' <i class="icon-remove-sign"></i></label></span>');
                },
                // when using arrows to navigate list display label in textbox instead of value
                focus: function(event,ui) {
                    $(this).val(ui.item.label);
                    return false;
                }
            })
        
        });
    }

    // search add pick input to list
    $("#add_locations").click(function(){
        var inputval = $('#locations_searchbox').val(); 
        $("#selected_locations").append('<span><input type="checkbox" checked><label>' +inputval +' <i class="icon-remove-sign"></i></label></span>');
        $('#locations_searchbox').val('');
    });         
    
    // show/hide search 
    function hide_search() {
        $('#search_dropdown,#close_search').fadeOut(500);
        $('#show_views_drop i, #show_views').removeClass('icon-folder-open');
        $('#show_views_drop i, #show_views').addClass('icon-folder-close');
    }

    $('#search_dropdown header').click(function() {
        $('#search_dropdown header').removeClass('active');
        $(this).addClass('active');
    }); 

    $('.togglesearch').click(function() {
        $('#search_dropdown,#close_search').show();
        $('#search_dropdown header').removeClass('active');
        $('#search_dropdown header#' + $(this).attr('id') + '_drop').addClass('active');
        $('#search_dropdown header#' + $(this).attr('id') + '_drop .icon-folder-close').removeClass('icon-folder-close').addClass('icon-folder-open');
        $('#show_search_dropdown_options, #show_views_dropdown_options').hide();
        $('#' + $(this).attr('id') +'_dropdown_options').show();
    $('#show_views_drop i').removeClass('icon-folder-close').addClass('icon-folder-open');
    });

    $('#selected_qv').click(function() {
        $('#search_dropdown,#close_search,#show_views_dropdown_options').show();
        $('#search_dropdown header').removeClass('active');
        $('#search_dropdown #show_views_drop').addClass('active');
        $('#show_search_dropdown_options').hide();
        $('#show_views_drop i').removeClass('icon-folder-close').addClass('icon-folder-open');
    });
   
    $('#show_search, #top #search li').click(function() {
        $('#search_dropdown #show_views_drop i').removeClass('icon-folder-open');
        $('#search_dropdown #show_views_drop i').addClass('icon-folder-close');
    });

    $('#show_search_drop').click(function() {
        $('#show_views_dropdown_options').hide();
        $('#show_search_dropdown_options').show();
        $('#show_views_drop i').removeClass('icon-folder-open');
        $('#show_views_drop i').addClass('icon-folder-close');
        
    });
     
    $('#show_views_drop').click(function() {
        $('#show_search_dropdown_options').hide();
        $('#show_views_dropdown_options').show();
        $('#show_views_drop i').removeClass('icon-folder-close');
        $('#show_views_drop i').addClass('icon-folder-open');
    });
    
    $('#search_dropdown h6').click(function() {
        $('#' + $(this).attr('id') + 'down').animate( {
            height: ['toggle', 'linear']
        },{duration: 100});
        });
    
    $('.top_sentence').click(function() {
        $('.search_dropdown_cat').hide();
        $('#show_views_drop').removeClass('active');
        $('#show_search_drop').addClass('active');
        $('#search_dropdown, #show_search_dropdown_options, #close_search, #'+(this).id+'_dropdown').show();
    });

    $('#alerts').click(function() {
        $('#search_dropdown, #close_search, .search_dropdown_cat').show();
    });

    $('#close_search').click(function() {
        hide_search();
    }); 

    // search tooltip
   
    $('#show_search').qtip({
        content: { attr: 'title' },
        show: {event: "mouseover",solo: true},
        hide: {event: "mouseout"},
        style: { classes: 'bluetooltip', tip: { corner: "topMiddle", width: 6, height: 6 }, width: 80},
        position: { at: "bottom center", my: "top center" }
    });
  
    if(hmu_id) {
    $('#show_views').qtip({
        content: { attr: 'title' },
        show: {event: "mouseover"},
        hide: {event: "mouseout"},
        style: { classes: 'bluetooltip', tip: { corner: "topMiddle", width: 6, height: 6 }, width: 95},
        position: { at: "bottom center", my: "top center" }
    }).removeData('qtip').qtip( {
            content: 'save this search',
            hide: {event: "click"},
            style: { classes: 'bluetooltip_opaque', tip: { corner: "topMiddle", width: 6, height: 6 }, width: 95},
            show: {event: "click", solo:true, target: $("input[value='submit search']")},
            position: { at: "bottom center", my: "top center" },
            events: {
                show: function(event, api) {
                // only show the tooltip if clicking up update map 
                    if($('#show_views_dropdown_options').is(':visible') || $('#saveview').is(':visible')) {
                    event.preventDefault();
                    }
                }
            }
    }
    ); 
    } if(!hmu_id) {
    $('#show_views').qtip({
        content: { attr: 'title' },
        show: {event: "mouseover",solo: true},
        hide: {event: "mouseout"},
        style: { classes: 'bluetooltip', tip: { corner: "topMiddle", width: 6, height: 6 }, width: 95},
        position: { at: "bottom center", my: "top center" }
    });
    } 

    // submit search
    $(".submitsearch").click(function() {
        var precise_location = $('#places_searchbox').val();
        // empty out last preset_id since searched 
        preset_id = '';
        searchClicked = true;
        if ( $("input[name=locations_search]").filter('[value="current"]').is(":checked") || $("input[name=locations_search]").filter('[value="precise"]').is(":checked")) {
            skipMapBounds = false;
        } else {
            skipMapBounds = true;
        }
        // will either be save, update saved search, or update map
        if (ibArray) { // close any open infowindows
            for (var ibi in ibArray) {
                ibArray[ibi].close();
            }
        }
        search_filters = get_selected_search();
        var search_action = this.value;
        if(search_action != "submit search" && $("#viewd").val().length > 0 && $("#viewn").val().length > 0) { // either save view or update saved view
            save_preset(search_filters);
            reset_search();
            $('#show_views_dropdown_options').prepend('<span class="success"><i class="icon-ok-sign"></i> Your changes have been saved.</span>').show();
            $('.success').delay(5000).fadeOut('slow');
            $('#show_search_dropdown_options').hide();
            return false;
        } 
        if(search_action != "submit search" && ($("#viewd").val().length == 0 || $("#viewn").val().length == 0)) {
            $('#saveview input[value=]').addClass('empty');
            $('#saveview').prepend('<span class="alertmsg"><i class="icon-exclamation-sign"></i> Please fill out required fields.</span>').show();
            $('#saveview input[value=]').click(function() { 
                $(this).removeClass('empty'); 
                $('.alertmsg').remove();
            });
            return false;
        }
        if(search_filters) {
            if(hmu_id) {
                $('#saveview').prependTo('#show_views_dropdown_options').show();
                $('.search_dropdown_cat').hide();
                }
            hide_search();   
            serve_markers(search_filters);
        } else {
            return false;
        }
        //$('#search').show();
    });
}); 

// update advanced search checklist to reflect COOKIE, variables passed in to query string, or from quickview
function upd_adv_search(adv_search_data) {
    // categories (alert_tag_id)
    if(typeof(adv_search_data['category']) != "undefined" && adv_search_data['category'].length > 0) {
        for (var cat=0; cat < allcats.length; cat++) {
            if(jQuery.inArray(allcats[cat], adv_search_data['category']) > -1) {
                $('input[name="category"]').filter('[value="'+allcats[cat]+'"]').attr('checked', true);
            } else {
                $('input[name="category"]').filter('[value="'+allcats[cat]+'"]').attr('checked', false);
            }
        }
    } else {
        // select all categories if none passed in
        for (var cat=0; cat < allcats.length; cat++) {
            $('input[name="category"]').filter('[value="'+allcats[cat]+'"]').attr('checked', true);
        }
    }
    // all other meta types
    for (var d=0; d<alldtypes.length; d++) {
        var dtype = alldtypes[d];
        // clear all from selected list & hide picklist
        $("#selected_"+dtype).empty();
        //$('#pick_'+dtype).hide();
        // that type wasn't passed in, so choose radio button for all
        if (typeof(adv_search_data[dtype]) == "undefined" || (typeof(adv_search_data[dtype]) != "undefined" && adv_search_data[dtype].length == 0)) {
            // select "all" radio button
            $('input[name='+dtype+'_search]').filter('[value="all"]').attr('checked', true);
        } else if (dtype == "locations" && adv_search_data['locations'] == 0) {
            // current location radio button is selected
            $('input[name='+dtype+'_search]').filter('[value="current"]').attr('checked', true);
        } else {
            // show pick as selected and show the picklist
            $('input[name='+dtype+'_search]').filter('[value="pick"]').attr('checked', true);
            $('#pick_'+dtype).show();
            var searchoptions = new Array();
            excludeoptions[dtype] = new Array();
            // loop through the JSON file to get the correct name matched with id - has to be sync and show in selected list
            $.ajax({
                type: 'GET',
                url: path_to_main + 'js/picklists/'+dtype+'_picklist.js?a',
                dataType: 'json',
                async: false,
                success: function(json_data) {
                    for(var j=0; j<json_data.length; j++) {
                        $.each(json_data[j], function(json_key, json_val) {
                            if(jQuery.inArray(json_val, adv_search_data[dtype]) > -1) {
                                if(json_val >=0 || json_val < 0) {
                                excludeoptions[dtype].push(json_val);
                                $("#selected_"+dtype).append('<span><input type="checkbox" value="' + json_val + '" checked><label class="'+dtype+'_sel" id="'+dtype+'_sel'+json_val+'">' + json_data[j]['label'] +' <i class="icon-remove-sign"></i></label></span>');
                                return;
                                }
                            } else {
                                if(json_val >=0 || json_val < 0) {
                                    var thissearch = new Object();
                                    thissearch['label'] = json_data[j]['label'];
                                    thissearch['value'] = json_val;
                                    searchoptions.push(thissearch);
                                    return;
                                }
                            }
                        })
                    }
                    // reset the search choices with the excluded values excluded
                    build_valid_searchoptions(dtype, allsearchoptions[dtype], excludeoptions[dtype]);
                }
            });
        }
    }
    // update the time interval chosen; clear out any previous values that may have been there
    $('#time_interval').val('');
    $('#date1').val('');
    $('#date2').val('');
    if(adv_search_data['sdate'] && adv_search_data['edate']) {
        $('input[name="datechoice"]').filter('[value="daterange"]').attr('checked', true);
        $('#date1').val(adv_search_data['sdate']);
        $('#date2').val(adv_search_data['edate']);
    } else {
        $('input[name="datechoice"]').filter('[value="recent"]').attr('checked', true);
        $('#time_interval').val(adv_search_data['time_interval']);
    }
}

function get_selected_search() {
    var search_filters = new Object();
    if ($("input[name=locations_search]").filter('[value="precise"]').is(":checked")) {
        // set the precise zoom lat and zoom lon
        search_filters['zoom_lat'] = precise_filters['zoom_lat'];
        search_filters['zoom_lon'] = precise_filters['zoom_lon'];
        search_filters['zoom_level'] = localzoom;
    }
    // category checkboxes
    if ($('#choosecat :checked').length > 0) { 
        search_filters['category'] = new Array();
        $('#choosecat :checked').each(function() {
            var sc = $(this).val();
            if(sc.indexOf(",") != -1) {
                var scarr = sc.split(","); //sometimes one checkbox has multiple comma separated values
                for(var sci in scarr) {
                    search_filters['category'].push(scarr[sci]);
                }
            } else {
                search_filters['category'].push(sc);
            }
        })
    } 
    if ($('#choosecat :checked').length == 0) { 
        $('#choosecat').prepend("<span class=\"alertmsg\"><i class=\"icon-exclamation-sign\"></i> Please select at least one category.</span>");
                $('#choosecat').click(function() {
                   $('.alertmsg').remove();
                });
                return false;
    }
    // now do the rest of the meta types
    for (var d=0; d<alldtypes.length; d++) {
        var dtype = alldtypes[d];
        if ($("input[name="+dtype+"_search]").filter('[value="pick"]').is(":checked")) {
            if ($("#selected_"+dtype+" :checked").length > 0) {
                search_filters[dtype] = new Array();
                $("#selected_"+dtype+" :checked").each(function() {
                    search_filters[dtype].push($(this).val());
                })
            } else {
                $('#' + dtype + '_drop').prepend("<span class=\"alertmsg\"><i class=\"icon-exclamation-sign\"></i> Please select at least one item from the "+dtype+" menu.</span>");
                $('#show_search_dropdown_options').click(function() {
                   $('.alertmsg').remove(); 
                });
                return false;
            }
        } else if (dtype == "locations" && $("input[name=locations_search]").filter('[value="current"]').is(":checked")) {
            search_filters['locations'] = '0';
        }
    }
    // start and end dates
    if( $('#date1').val() && $('#date2').val()) {
        search_filters['sdate'] = $("#date1").val();
        search_filters['edate'] = $("#date2").val();
        // get amount of days between start and end date, not to exceed 1 month
        var jssd = new Date(search_filters['sdate']);
        var jsed = new Date(search_filters['edate']);
        var msDay = 60*60*24*1000;
        var numdays = Math.floor((jsed - jssd) / msDay);
        if(numdays > 200 && partner != "abxresistance") {
            alert("Please specify a date range 6 months or shorter.");
            return false;
        }
    } else {
        search_filters['time_interval'] = $("#time_interval").val();
    }
    // if a displayapi has value, use it
    if(displayapi) {
        search_filters['displayapi'] = displayapi;
    }
    return search_filters;
}

function update_your_to_current() {
    if($("input[name=locations_search]").filter('[value="current"]').is(":checked")) {
        // this is if someone pans the map and gets updated views of marker, need to change "your" location to "current"
        if(preset_id == local_preset_id) {
            $('#selected_qv').html('all diseases, current location, in the past week <i class="icon-caret-down"></i>');
        } else {
            $('#locations').removeClass('yourlocval');
            $('#num_ns_locations').text('Current');
            $('#locations_plural').hide();
        }
        $('#onm_title').text(onm_title2);
    }
}

function update_narrative_sentence(quickview) {

    // update all the numbers in search bars, even if quickview
    for (var d=0; d<alldtypes.length; d++) {
        if ($("input[name="+alldtypes[d]+"_search]").filter('[value="all"]').is(":checked")) {
            $('#num_ns_'+alldtypes[d]).text("All");
            $('#num_bar_'+alldtypes[d]).text('');
            $('#'+alldtypes[d]+'_plural').show();
        } else {
            if( $("#selected_"+alldtypes[d]+" :checked").length > 0 ) {
                $('#num_ns_'+alldtypes[d]).text($("#selected_"+alldtypes[d]+" :checked").length);
                $('#num_bar_'+alldtypes[d]).text('('+$("#selected_"+alldtypes[d]+" :checked").length+')');
            }
            // hide the "s" in the narrative sentence if there's only 1
            if( alldtypes[d] == "diseases" || alldtypes[d] == "locations" ) {
                if ( $("#selected_"+alldtypes[d]+" :checked").length == 1 ) {  
                    $('#'+alldtypes[d]+'_plural').hide();
                } else {
                    $('#'+alldtypes[d]+'_plural').show();
                }
            }
        } 
    }


    // show your location on hover 
    $('#top').on('mouseover', function() {
    $('#top .yourlocval').qtip({
            content: geo_info['default_locname'],
            show: {event: "mouseover",solo: true},
            hide: {event: "mouseout"},
            style: { classes: 'blacktooltip', tip: { corner: "topMiddle", width: 6, height: 6 }, width: 250},
            position: { at: "bottom center", my: "top center" },
            events: {
                show: function(event, api) {
                // only show the tooltip if clicking update map 
                    if(!$('#locations').hasClass('yourlocval') ) {
                    event.preventDefault();
                    }
                }
            }
        });
    });

    // date
    if( $('#date1').val() && $('#date2').val()) {
        $('#timeinterval').text('from ' + $("#date1").val() + ' - ' + $("#date2").val()); 
    } else {
        $('#timeinterval').text('in the past ' + $("#time_interval").val()); 
    }

    if(quickview && quickview != "undefined") {
        if(quickview == "All diseases, your location in the past week") {
            $('#selected_qv').html('all diseases, <span class="yourlocval">your location</span> in the past week <i class="icon-caret-down"></i>');
            $('#onm_title').text(onm_title1);
        } else {
            $('#selected_qv').html(quickview + '<i class="icon-caret-down"></i>');
            $('#onm_title').text(onm_title2);
        } 
        $('#search').hide();
        $('#selected_qv').show();
        $('.togglesearch').removeClass('active');
        $('#show_views').addClass('active');
        return;
    } else {
        // override locations value
        if ($("input[name=locations_search]").filter('[value="current"]').is(":checked")) {
            $('#num_ns_locations').text("Your");
            $('#locations_plural').hide();
            $('#locations').addClass('yourlocval');
            $('#onm_title').text(onm_title1);
        } else {
            if ($("input[name=locations_search]").filter('[value="precise"]').is(":checked")) {
                $('#num_ns_locations').text("Current");
                $('#locations_plural').hide();
            }
            $('#locations').removeClass('yourlocval');
            $('#onm_title').text(onm_title2);
        }
        $('#search').show();
        $('#selected_qv').hide();
        $('.qv').removeClass('active');
        $('.togglesearch').removeClass('active');
        $('#show_search').addClass('active');
    }

}

function autocompleteData(dtype,cursearch,excludeopts) {
    var source = new Array();
    $.each(cursearch, function(i, val){
        if(jQuery.inArray(val.value, excludeopts) < 0) {
//        if(excludeopts.indexOf(val.value) == -1) {
            var thissearch = new Object();
            thissearch['label'] = val.label;
            thissearch['value'] = val.value;
            source.push(thissearch);
        }
    })

    $("#" + dtype + "_searchbox").autocomplete({
        source:
            function (request, response) {
                var term = $.ui.autocomplete.escapeRegex(request.term)
                    , startsWithMatcher = new RegExp("^" + term, "i")
                    , startsWith = $.grep(source, function (value) {
                    return startsWithMatcher.test(value.label || value.value || value);
                })
                    , containsMatcher = new RegExp(term, "i")
                    , contains = $.grep(source, function (value) {
                    return $.inArray(value, startsWith) < 0 && containsMatcher.test(value.label || value.value || value);
                });
                response(startsWith.concat(contains));
            }
    });
}

function build_valid_searchoptions(dtype, cursearch, excludeopts) {
    if (Array.isArray(dtype)){
        $.each(dtype, function (type, value) {
            autocompleteData(value, cursearch[type],excludeopts);
        })
    }
    else
        autocompleteData(dtype, cursearch,excludeopts);
}
