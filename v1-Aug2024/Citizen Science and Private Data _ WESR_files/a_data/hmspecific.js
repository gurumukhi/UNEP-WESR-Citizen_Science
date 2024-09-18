$(document).ready(function () {
   // load about video
    var check_cookie = $.cookie('visited');
    // if no HM cookie has been sent and there are no parameters set in query string
    if(check_cookie == null && !passed_loc && JSON.stringify(passed_params) == '{}'){
        $.cookie('visited', 'yes', {expires: 700});
        $.fancybox(
            {
            helpers : {overlay : { css : { 'background': 'rgba(0,0,0,.2)'}}, title : null },
            padding: 0,
            href: 'https://player.vimeo.com/video/27433633?title=0&amp;byline=0&amp;portrait=0&amp;color=ffffff',
            width: 550,
            height: 277,
            type: 'iframe'
            }
        );
     }

    if(hmu_id) {
        $('#local_content').on('click', '#subscribe', function() {
            window.location = '../admin/pref.php';
        });
    } else {
        // if user tries to rate, but isn't logged in
        $("span.icon-star").live("click", function() {
            window.location.href = '../forms/login.html';
        });
        
        $("#subscribe").fancybox({
            helpers : {overlay : { css : { 'background': 'rgba(0,0,0,.2)'}}, title : null },
            padding: 0,
            type: 'iframe',
            href: '../forms/login.html#pref',
            width: 340
        });
    }
});
