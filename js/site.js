var findme_map = L.map('findme-map')
    .setView([37.7, -97.3], 3),
    osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = 'Map data © OpenStreetMap contributors',
    osm = L.tileLayer(osmUrl, {minZoom: 2, maxZoom: 18, attribution: osmAttrib}).addTo(findme_map),
    category_data = [];

var findme_marker = L.marker([0,0], {draggable:true}).addTo(findme_map);
findme_marker.setOpacity(0);

if (location.hash) location.hash = '';

$("#find").submit(function(e) {
    e.preventDefault();
    $("#couldnt-find").hide();
    var address_to_find = $("#address").val();
    if (address_to_find.length === 0) return;
    var qwarg = {
        format: 'json',
        q: address_to_find
    };
    var url = "http://nominatim.openstreetmap.org/search?" + $.param(qwarg);
    $("#findme h4").text("Searching...");
    $("#findme").addClass("loading");
    $.getJSON(url, function(data) {
        if (data.length > 0) {
            var chosen_place = data[0];
            console.log(chosen_place);

            var bounds = new L.LatLngBounds(
                [+chosen_place.boundingbox[0], +chosen_place.boundingbox[2]],
                [+chosen_place.boundingbox[1], +chosen_place.boundingbox[3]]);

            findme_map.fitBounds(bounds);

            findme_marker.setOpacity(1);
            findme_marker.setLatLng([chosen_place.lat, chosen_place.lon]);

            $('#instructions').html('Našli smo naslov! Prestavite marker na lokacijo avtobusne postaje, nato dodajte <a href="#details">podrobnosti</a>.');
            $('.step-2 a').attr('href', '#details');
        } else {
            $('#instructions').html('<strong>Nismo mogli najti vašega naslova.</strong> Poskusite iskati samo ime ceste ali pa samo mesta.');
        }
        $("#findme").removeClass("loading");
    });
});

$("#findgeome").click(function(e) {
    console.log("clicked");
    $("#findgeome").addClass("loading");
    $.geolocation.get({
    win: function(position) {
        /*console.log(position);*/
        var center = L.latLng(position.coords.latitude, position.coords.longitude);
        /*console.log(center);*/
        findme_map.setView(center, 16);
        findme_marker.setOpacity(1);
        findme_marker.setLatLng(center);
        $('#instructions').html('Pridobili smo lokacijo! Prestavite marker na lokacijo avtobusne postaje, nato dodajte <a href="#details">podrobnosti</a>.');
        $('.step-2 a').attr('href', '#details');
        $("#findgeome").removeClass("loading");
    },
    fail:function(error) {
        if (error.code === 1) {
            $("#instructions").html('<strong>Prosim omogočite dostop do Geolokacije, če želite na tak način določiti lokacijo postaje</strong>');
        } else if (error.code === 2) {
            $("#instructions").html('Podatka o lokaciji žal nismo mogli pridobiti.');
        } else if (error.code === 3) {
            $("#instructions").html('Podatka o lokaciji žal nismo mogli pridobiti. Poskusite kasneje.');
        }
        $("#findgeome").removeClass("loading");
    }
    });
});

$(window).on('hashchange', function() {
    if (location.hash == '#details') {
        $('#collect-data-step').removeClass('hide');
        $('#address-step').addClass('hide');
        $('#confirm-step').addClass('hide');
        $('.steps').addClass('on-2');
        $('.steps').removeClass('on-3');
    } else if (location.hash == '#done') {
        $('#confirm-step').removeClass('hide');
        $('#collect-data-step').addClass('hide');
        $('#address-step').addClass('hide');
        $('.steps').addClass('on-3');
    } else {
        $('#address-step').removeClass('hide');
        $('#collect-data-step').addClass('hide');
        $('#confirm-step').addClass('hide');
        $('.steps').removeClass('on-2');
        $('.steps').removeClass('on-3');
    }
    findme_map.invalidateSize();
});

$("#collect-data-done").click(function() {
    location.hash = '#done';

    var note_body = "http://buma.github.io/bus_stops submitted note for a bus_stop:\n"; 
    var name = $("#name").val(); 
    var alt_name = $("#alt_name").val(); 
    var covered = $("#covered").is(":checked"); 
    var shelter = $("#shelter").is(":checked"); 
    var bench_yes = $("#bench_yes").is(":checked"); 
    var bench_no = $("#bench_no").is(":checked"); 
    if (name !== '') {
        note_body += "name: " + name + "\n"; 
    }
    if (alt_name !== '') {
        note_body += "alt_name: " + alt_name + "\n"; 
    }
    if (covered === true) {
        note_body += "covered: Yes\n";
    } else if (shelter === true) {
        note_body += "shelter: Yes\n";
    }
    if (bench_yes === true) {
        note_body += "bench: Yes\n";
    } else if (bench_no === true) {
        note_body += "bench: No\n";
    }
        latlon = findme_marker.getLatLng(),
        qwarg = {
            lat: latlon.lat,
            lon: latlon.lng,
            text: note_body
        };

    $.post('http://api.openstreetmap.org/api/0.6/notes.json', qwarg);
});
