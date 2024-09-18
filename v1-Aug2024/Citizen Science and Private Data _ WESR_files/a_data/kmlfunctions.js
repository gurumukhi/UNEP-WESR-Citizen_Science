function toggleKML(checked, id) {
    if (checked) {
        var layer = new google.maps.KmlLayer(kml[id].url, {
            preserveViewport: true,
            suppressInfoWindows: false
        });
        // store kml as obj
        kml[id].obj = layer;
        kml[id].obj.setMap(map);
        if(typeof(kml[id].preset) != "undefined") {
            get_preset(kml[id].preset);
        }
    }
    else {
        kml[id].obj.setMap(null);
        delete kml[id].obj;
    }
};

function createTogglers() {
    var html = "<form><ul>";
    for (var prop in kml) {
        var nameval = kml[prop].name;
        nameval += kml[prop].descr ? '<br \/>' + kml[prop].descr : '';
        html += "<li id=\"selector-" + prop + "\"><input type='checkbox' id='" + prop + "'" +
        " onclick='highlight(this,\"selector-" + prop + "\"); toggleKML(this.checked, this.id)' \/><label> " +
        nameval + "<\/label><\/li>";
    }
    html += "<\/ul><\/form>";

    // for datalayers, always check the first one by default
    if(typeof(dataLayers) != "undefined") {
        html += "<p></p>Data Layer";
        if(dataLayers['description']) {
            html += "<br />"+dataLayers['description'];
        }
        html += "<ul>";
        var layerc = 0;
        for (var prop in dataLayers) {
            if(prop == "description") {
                continue;
            }
            var ck_default = layerc == 0 ? 'checked' : '';
            var disabled = dataLayers[prop].disabled ? 'disabled = "true"' : '';
            var nameval = dataLayers[prop].name;
            nameval += dataLayers[prop].descr ? '<br \/>' + dataLayers[prop].descr : '';
            html += "<li id=\"selector-" + prop + "\"><input type='radio' name='layerChoices' id='" + prop + "'" +
            " onclick='highlight(this,\"selector-" + prop + "\"); get_preset(" + dataLayers[prop].preset_id + ")' " +
            ck_default+" "+disabled+" \/><label> " + nameval + "<\/label><\/li>";
            layerc++;
        }
        html += "<\/ul>";
    }
    document.getElementById("toggle_box").innerHTML = html;
};

// easy way to remove all objects
function removeAll() {
    for (var prop in kml) {
        if (kml[prop].obj) {
            kml[prop].obj.setMap(null);
            delete kml[prop].obj;
        }

    }
};

// Append Class on Select
function highlight(box, listitem) {
    var selected = 'selected';
    var normal = 'normal';
    document.getElementById(listitem).className = (box.checked ? selected: normal);
};

function startup() { 
    // check all kml layers by default that are set to checked
    for (var prop in kml) {
        if(kml[prop].ck_default) {
            var checkit = document.getElementById(prop);
            checkit.checked = true;
            toggleKML(checkit, prop);
            highlight(checkit, "selector-"+prop);
        }
    }
    // make kml block that is visible on page load draggable
    $('#kml_block').draggable({ handle: ".drag_container" });
}
