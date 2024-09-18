$(document).ready(function () {
// login
    $("a.inline").fancybox(
        {
        helpers : {overlay : { css : { 'background': 'rgba(0,0,0,.2)'}}, title : null },
        padding: 0,
        type: 'inline'
        }   
    );
    $("a.iframe").fancybox(
        {
        helpers : {overlay : { css : { 'background': 'rgba(0,0,0,.2)'}}, title : null },
        padding: 0,
        type: 'iframe',
        width: 662
        }       
    );
   
    $("a.iframesm").fancybox(
        {
        helpers : {overlay : { css : { 'background': 'rgba(0,0,0,.2)'}}, title : null },
        padding: 0,
        width: 340,
        height: 'auto',
        type: 'iframe'
        }       
    );

// open alert in list view

$("a.fbox").live('mouseenter', function() { 
        $(this).fancybox(
            {
            hideOnContentClick:true,
            type: 'iframe',
            helpers : {overlay : { css : { 'background': 'rgba(0,0,0,.2)'}}},
            padding: 0,
            width: 662
            }   
        );
    });

});

