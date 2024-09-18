var pathToMain = '';

var pops = [];
function uP(url, id) {
  if(url.substr(0,4) != "http") {
     url = pathToMain + url;
  }
  if(pops[id] && !pops[id].closed) {
    pops[id].location = url;
    pops[id].focus();
  } else {
    pops[id] = window.open(url, id, 'toolbar=1,menubar=1,location=1,directories=1,width=840,height=400,scrollbars=1,resizable=1,status=1');
  }
}

function b(id, dest_lang, src_lang, pid) {
    p(id, dest_lang, src_lang, 'a.php', pid);
}

function p(id, dest_lang, src_lang, url, pid) {
    if(!url) {
        var url = 'ln.php';
    }
    url += '?' + id;
    if(dest_lang) {
        url += '&trto=' + dest_lang;
    }
    if(src_lang) {
        url += '&trfr=' + src_lang;
    }
    if(pid) {
        url += '&pid' + pid;
    }
    uP(url, id);
}

function xP(id) {
  uP('v.php?lc=' + lang + '&id=' + id, id);
}
function sc(lat, lon, lvl, pid) {
/*
  if($('#split').attr("class") != "viewdown") {
      show_split();
  }
  getInfoWindowEvent(markerArray[pid], pid);
*/
  map.setCenter(new google.maps.LatLng(lat, lon));
  map.setZoom(lvl);
}

function slu(id, name) {
    var bUrl = 'dlu.php?lc=' + lang;
    var pStr1 = "uP('" + bUrl + "&t=1&id=" + id + "'," + id + ")";
    var pStr2 = "uP('" + bUrl + "&t=2&id=" + id + "'," + id + ")";
    var pStr3 = "uP('" + bUrl + "&t=3&id=" + id + "'," + id + ")";
    var pStr4 = "uP('" + bUrl + "&t=4&id=" + id + "'," + id + ")";
    var pStr5 = "uP('" + bUrl + "&t=5&id=" + id + "'," + id + ")";
    i$('dlud').innerHTML = '<b>' + name + '</b><br/>';
    i$('dlud').innerHTML += '&bull; <a href="javascript:;" onclick="' + pStr1 + '">Wikipedia</a><br/>';
    i$('dlud').innerHTML += '&bull; <a href="javascript:;" onclick="' + pStr4 + '">WHO</a><br/>';
    i$('dlud').innerHTML += '&bull; <a href="javascript:;" onclick="' + pStr2 + '">CDC</a><br/>';
    i$('dlud').innerHTML += '&bull; <a href="javascript:;" onclick="' + pStr3 + '">PubMed</a><br/>';
    i$('dlud').innerHTML += '&bull; <a href="javascript:;" onclick="' + pStr5 + '">Google Trends</a><br/>';
    i$('dlud').innerHTML += '<br/><a href="javascript:;" style="text-align: right" onclick="i$(\'dlud\').style.display = \'none\';">close</a>';
    i$('dlud').style.display = '';
}

function getParam(name) {
    var qs = location.search.substring(1);
    //var qs = unescape(location.hash.substring(1));
    var pairs = qs.split('&');
    for(var i=0; i<pairs.length; i++) {
        elts = pairs[i].split("=");
        if(elts[0] == name) {
            return elts[1];
        }
    }
}


