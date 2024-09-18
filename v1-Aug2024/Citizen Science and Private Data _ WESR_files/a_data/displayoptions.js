$(document).ready(function () {

    // show display options
    $('#display i').qtip({
        content: { attr: 'title' },
        show: {event: "mouseover"},
        hide: {event: "mouseout"},
        style: { classes: 'bluetooltip', tip: { corner: "topMiddle", width: 6, height: 6 }, width: 80},
        position: { at: "bottom center", my: "top center" }
    });

    $('#display i').click(function() {
        $('#display i').removeClass('act');
        $(this).addClass('act'); } );
    
    function showmap() {
        $("#map").slideDown(250);
        $("#trends_view, #list_view").slideUp(250);
        $("#map_icons").animate({bottom:"105px"}, 250);
        $("#navigation, #map_icons").show();
        trends_showing = false;
        $('#display i').removeClass('act');
        $('#map').addClass('act'); 
        $('#list_view .icon-double-angle-down, #trends_view .icon-double-angle-down').remove();
    }

    // show trends 
    $('#trends').click(function() {
        if ($('#trends_view').is(':visible')) {
        showmap();
        } else {    
        $('#trends_view').slideDown(250); 
        $("#list_view").slideUp(250);
        $("#map_icons").animate({bottom:"415px"}, 250);
        //$('#navigation').hide();
        $('#trends_view').prepend('<i class="icon-double-angle-down"></i>');
        $('#trends_view .icon-double-angle-down').click(function() {
                showmap();
        });
        if(trends_showing == false && trends) { // get the trends data
            get_trends(trends);
        }
        trends_showing = true;
        } });
 
    // show list
    $("#list").click(function() {
        if ($('#list_view').is(':visible')) {
        showmap();
        } else {
        $("#list_view").slideDown(250);
        $("#trends_view").slideUp(250);
        $("#map_icons").animate({bottom:"415px"}, 250);
        //$('#navigation').hide();
        $('#list_view').prepend('<i class="icon-double-angle-down"></i>');
            $('#list_view .icon-double-angle-down').click(function() {
                showmap();
        });
        trends_showing = false;
    }}
    );

    // add font awesome to list view
    $('#list_view th i').parent('.sorting_asc').addClass('icon-caret-down');

    // show map
    $("#map").click(function() {
        showmap();
    });

    // Resize trends graph when window is resized
    $(window).resize(function() {
        if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('resizeEnd');
        }, 500);
    });
    $(window).on('resizeEnd', function() {
        if(trends_showing == true && trends) {
        get_trends(trends); }
    });

});
