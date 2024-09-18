// add HTML5 support to IE
document.createElement('header');
document.createElement('footer');
document.createElement('section');
document.createElement('aside');
document.createElement('nav');
document.createElement('article');

var passed_loc = false;
var passed_params = new Object();
var max_passed_weeks = 16;
var max_passed_days = 91;

$(document).ready(function() {

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

  if (typeof(partner) == "undefined") {
    partner = "hm";
  }

  /*
  make users change password
  send to login and if their pword doesn't meet min requirements, send to reset pw form
  */
  if (typeof(prompt_new_pass) != "undefined") {
    if (prompt_new_pass) {
      // log the user out, so they will be forced to log back in
      // then we can check if they are valid or not
      location.href = path_to_main + 'admin/logout.php';
    }
  }

  // download icon
  $('#download').click(function() {
    // This checks if the user is not logged in and if so, stops the rest of the function from running.
    if (partner == 'predict' && !cookies['HealthMap[hmu_id]']) {
      return
    }
    var gaurl = path_to_main + "getAlerts.php";
    search_filters['download_csv'] = true;
    search_filters['viewable_alerts'] = viewableMarkerArray;
    $.ajax({
      url: gaurl,
      dataType: 'json',
      data: search_filters,
      success: function(jsonData) {
        var downloadurl = path_to_main + "downloadFile.php";
        if (partner == "mriids") {
          downloadurl = path_to_main + "downloadFilemriids.php";
        }
        if (partner == "predict") {
          $('#download-predict').hide();
          downloadurl = path_to_main + "downloadPredictFile.php";
        }
        window.location.href = downloadurl + "?ck=" + jsonData['filedownload'];
      }
    });
  });

  // download icon for PREDICT site
  // $('#download-predict').click(function() {
  //   var gaurl = path_to_main + "getAlerts.php";
  //   search_filters['download_csv'] = true;
  //   search_filters['viewable_alerts'] = viewableMarkerArray;
  //   $.ajax({
  //     url: gaurl,
  //     dataType: 'json',
  //     data: search_filters,
  //     success: function(jsonData) {
  //       var downloadurl = path_to_main + "downloadPredictFile.php";
  //       window.location.href = downloadurl + "?ck=" + jsonData['filedownload'];
  //     }
  //   });
  // });

  //$(".scrollable").scrollable();
  $('.sortable').sortable();

  // datepicker
  if (typeof(default_sdate) == "undefined") {
    if (partner == "pfizer") {
      var default_sdate = new Date('2015-08-02');
    } else {
      var default_sdate = new Date();
      default_sdate.setMonth(default_sdate.getMonth() - 6);
    }
  }
  $(".datepicker").datepicker({
    minDate: default_sdate
  });

  // in field label
  $("label").inFieldLabels();

  // set the passed params variable if hash or query string
  var qs = location.search.substring(1) ? location.search.substring(1) : location.hash;
  if (qs.substring(0, 2) == "#!") {
    qs = qs.substring(2);
  }
  if (qs) {
    var pairs = qs.split('&');
    for (var i = 0; i < pairs.length; i++) {
      elts = pairs[i].split("=");
      passed_params[elts[0]] = elts[1];
    }
  }

  // allow for passing in the alert_id to go directly to that alert
  if (typeof(passed_params['aid']) != "undefined") {
    b(passed_params['aid']);
  }

  // redirect based on language chosen
  $('#langform').change(function() {
    var language = $('#langform option:selected').val();
    document.location = "../" + language;
    return false;
  });

});

function set_default_view() {
  var advanced_search = new Object();
  if (typeof(passed_params['d']) != "undefined") {
    advanced_search['diseases'] = passed_params['d'].split(",");
  }
  if (typeof(passed_params['p']) != "undefined") {
    advanced_search['locations'] = passed_params['p'].split(",");
  }
  if (typeof(passed_params['f']) != "undefined") {
    advanced_search['sources'] = passed_params['f'].split(",");
  }
  if (typeof(passed_params['s']) != "undefined") {
    advanced_search['species'] = passed_params['s'].split(",");
  }
  // allow for time interval to be passed in, not to exceed 3 months
  if (typeof(passed_params['weeks']) != "undefined" && passed_params['weeks'] < max_passed_weeks) {
    advanced_search['time_interval'] = passed_params['weeks'] + " weeks";
  } else if (typeof(passed_params['days']) != "undefined" && passed_params['days'] < max_passed_days) {
    advanced_search['time_interval'] = passed_params['days'] + " days";
  } else {
    advanced_search['time_interval'] = '1 week';
  }
  advanced_search['category'] = new Array('1', '2', '29');
  upd_adv_search(advanced_search);
  serve_markers(advanced_search);
}

// this gets called when an alert title is clicked
// or if an alertid comes in query string
function b(id, dest_lang, src_lang, pid) {
  var url = url ? url : path_to_main + 'ai.php';
  url += '?' + id;
  if (dest_lang) {
    url += '&trto=' + dest_lang;
  }
  if (src_lang) {
    url += '&trfr=' + src_lang;
  }
  if (pid) {
    url += '&pid' + pid;
  }
  $.fancybox.open({
    type: 'iframe',
    padding: 0,
    width: 662,
    helpers: {
      overlay: {
        css: {
          'background': 'rgba(0,0,0,.2)'
        }
      }
    },
    autoResize: true,
    href: url
  });
}

