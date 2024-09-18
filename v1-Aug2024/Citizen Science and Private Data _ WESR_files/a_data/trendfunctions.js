$(document).ready(function() {
    $('input[name="denom"], input[name="resolution"]').click(function() {
        get_trends('dg');
    });

    $('input[name="trend_file"]').live("click", function() {
        var seldatafile = $("input:radio[name='trend_file']:checked").val();
        get_trends('d3', seldatafile);
    });
});


function get_trends(type, datafile) {

    $('#loadingMsg').show();
    $('#chart_div').hide();

    //search_filters = get_selected_search();
    if(search_filters['locations'] && search_filters['locations'] == "0") {
        search_filters['default_country'] = geo_info['default_country'];
    }
    search_filters['trendtype'] = type;
    if(datafile) {
        search_filters['datafile'] = datafile;
    }

    var tgurl = path_to_main + "getTrends.php";
    $.ajax({url: tgurl, dataType: 'json', data: search_filters,
        success: function(jsonData) {
            $('#loadingMsg').hide();
            $('#chart_div').show();
            // mers uses an iframe
            if(typeof(jsonData['timeline']['iframesrc']) != "undefined") {
                $('#chart_div').html('<iframe src="'+jsonData['timeline']['iframesrc']+'" width="100%" height="300" frameBorder="0"></iframe>');
                $('#chart_div').show();
            } else if(type == "d3") {
                draw_d3(jsonData['timeline']);
                $('#d3menu select').dropdown({ gutter : 0, stack: false });
            } else { // dygraphs
                draw_dygraph(jsonData['timeline'], type);
            }
        }
    });
}

function draw_d3(filters) {
    var validHeader = ["itemName","itemID","year"];
    var validCountries = filters[0];
    var chartinfo = filters[1];
    var datafile = chartinfo[0];
    $("#chart_div").empty();
    $('#chart_info').html(chartinfo[1]);
    d3.csv(datafile, function(csv) {
        if(validCountries.length > 0) {
            var newcountries = new Array();
            for(var csvob in csv) {
                var newrow = new Object();
                $.each(csv[csvob], function(ckey, cval) {
                    if(jQuery.inArray(ckey, validHeader) > -1) {
                        newrow[ckey] = cval;
                    }
                    if(jQuery.inArray(ckey, validCountries) > -1) {
                        newrow[ckey] = parseInt(cval);
                    }
                })
                newcountries.push(newrow);
            }
            countries = newcountries;
        } else {
            // just use the entire csv file
            countries = csv;
        }
        redrawD3Line();
    });
}

// this is the google chart
function draw_chart(timeline) {
    var data = google.visualization.arrayToDataTable(timeline);
    var chart = new google.visualization.ImageLineChart(document.getElementById('chart_div'));
    chart.draw(data, {width: 900, height: 340, legend: 'bottom'});
}

function draw_dygraph(timelinedata, type) {

    var allcols = timelinedata[0];
    var allrows = timelinedata[1];
    var rangevals = timelinedata[2];
    var denom = $("input[name='denom']:checked").val();

    if(allcols == "filename") { // viss, in this case allrows is a csv file
        g = new Dygraph(
            document.getElementById("chart_div"),
            allrows,
            {colors: ['#480024','#79002b','#cd1932','#f55435','#ff8831'], includeZero: true, width: 900, height: 250, labelsDiv: document.getElementById('chart_label') }
        );
    // this one is for DengueSingapore that has the resolution options
    /* what the data looks like
    var allcols = ["Month", "Dengue Singapore", "Dengue Malaysia"];
    var dataarr = [[ new Date("2009/07/12"), 53 ], [ new Date("2009/07/19"), 83 ], [ new Date("2009/07/20"), 103 ], [ new Date("2009/07/21"), 93 ]];
    */
    } else if(typeof(allrows[denom]) != "undefined") {
        var denomlu = new Object();
        denomlu['count'] = '# visits';
        denomlu['percv'] = '% of total visits';
        denomlu['percp'] = 'population rate';
        var resolution = $("input[name='resolution']:checked").val();
        allrows = allrows[denom][resolution];
        var dataarr = new Array();
        for(j = 0; j < allrows.length; j++) {
            var rowval = allrows[j];
            var rowvals = rowval.split(",");
            var dateval = new Date(rowvals[0]);
            var thisarr = new Array(dateval);
            for(k = 1; k < rowvals.length; k++) {
                thisarr.push(rowvals[k]);
            }
            dataarr.push(thisarr);
        }
        g = new Dygraph(
            document.getElementById("chart_div"),
            dataarr,
            {colors: ['#480024','#79002b','#cd1932','#f55435','#ff8831'], includeZero: true, width: 900, height: 250, legend: 'always', ylabel: denomlu[denom], labels: allcols, showRangeSelector: false, valueRange: rangevals[denom][resolution], labelsDiv: document.getElementById('chart_label') }
        );
    // this one is for the HealthMap breakdown by Year/Month
    } else {
        g = new Dygraph(
            document.getElementById("chart_div"),
            allrows,
            {colors: ['#480024','#79002b','#cd1932','#f55435','#ff8831'], width: 1000, height: 250, legend: 'always', ylabel: '# of HealthMap Alerts', labels: allcols, labelsDiv: document.getElementById('chart_label'), labelsSeparateLines: false, displayAnnotations: true, labelsKMB: true, avoidMinZero: true, axes: { x: { ticker: function(min, max, pixels, opts, dygraph, vals) { return [{v:1, label:"Jan"}, {v:2, label:"Feb"}, {v:3, label:"Mar"}, {v:4, label:"Apr"}, {v:5, label:"May"}, {v:6, label:"Jun"}, {v:7, label:"Jul"}, {v:8, label:"Aug"}, {v:9, label:"Sep"}, {v:10, label:"Oct"}, {v:11, label:"Nov"}, {v:12, label:"Dec"}]; } }
           } 
        });
    }

}
