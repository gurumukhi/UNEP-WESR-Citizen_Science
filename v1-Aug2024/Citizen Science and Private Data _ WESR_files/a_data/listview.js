var default_sort_col = typeof(default_sort_col) == "number" ? default_sort_col : 1;
$(document).ready(function () {
    // ratings
    $('.icon-star').live('click', function() {
        if(!hmu_id) {
            return false;
        }
        var rating = this.id;
        yourrating = rating.replace("score","");
        var classinfo = $(this).attr('class');
        var classinfoarr = classinfo.split(" ");
        var fdata = new Object();
        fdata['alert_id'] = classinfoarr[1];
        fdata['rating'] = yourrating;
        var rurl = path_to_main + "submitComment.php";
        $.ajax({ type: "POST", url: rurl, dataType: 'json', data: fdata,
            success: function(resp) {
                if(resp['status'] == "error") {
                    alert("You must log on to HealthMap to use this functionality.");
                    return false;
                }
                // update stars to be your vote
                for (var i=1; i<=5; i++) {
                    $('#score'+i+'.'+fdata['alert_id']).removeClass('selected');
                    if(i <= yourrating) {
                        $('#score'+i+'.'+fdata['alert_id']).addClass('selected');
                    }
                }
            }
        }) 
        return false;
    });

    listView = $('#list_view_table').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength" : 5,
        "bLengthChange": true,
        "aLengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
        "aaSorting": [[ default_sort_col, "desc" ]],
        "bScrollAutoCss": false,
        "oLanguage": {
             "oPaginate": {
                "sNext": "",
                "sPrevious": "",
                "sLast": "",
                "sFirst": ""
             },
            "sInfo": "Showing _START_ to _END_ of _TOTAL_ results",
            "sSearch": "Filter Results _INPUT_",
            "sLengthMenu": "Display _MENU_ results"
        }
    });
});
