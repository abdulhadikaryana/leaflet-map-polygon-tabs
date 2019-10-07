// Edit the initial year and number of tabs to match your GeoJSON data and tabs in index.html
var tab = "tab1";
var tabs = 8;

var tab_names = {
  'tab1': ['DIM1', 30.55],
  'tab2': ['DIM2', 69.67],
  'tab3': ['DIM3', 72.84],
  'tab4': ['DIM4', 41.11],
  'tab5': ['DIM5', 36.57],
  'tab6': ['DIM6', 55.03],
  'tab7': ['DIM7', 54.97],
  'tab8': ['IPK_Rasion', 53.74],
};

var indonesia = [
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  
];

var colors = [
  '#ffffff', // -4
  '#ffe6e7', // -3
  '#ffcdce', // -2
  '#ffb4b5', // -1
  '#ff9b9d', // 0
  '#ff696b', // 1
  '#ff5053', // 2
  '#ff373a', // 3
  '#ff1e21', // 4
];

var simple_colors = [
  '#0022ff',
  '#9ba8ff',
];

// Edit range cutoffs and colors to match your data; see http://colorbrewer.org
// Any values not listed in the ranges below displays as the last color
function getColor(d, nas) {
  // var n = Math.round((d-nas)/(nas/3));
  // n = (n < -4 ? -4 : n > 4 ? 4 : n) + 4;
  return d >= nas ? simple_colors[0] : simple_colors[1];
}

// Edit the center point and zoom level
var map = L.map('map', {
  center: [-2, 118],
  zoom: 5,
  scrollWheelZoom: false
});

// Edit links to your GitHub repo and data source credit
map.attributionControl
.setPrefix('View <a href="http://github.com/jackdougherty/leaflet-map-polygon-tabs">data and code on GitHub</a>, created with <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>; design by <a href="http://ctmirror.org">CT Mirror</a>');

// Basemap layer
new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map);

// Edit to upload GeoJSON data file from your local directory
$.getJSON("ipk_Indonesia.geojson", function (data) {
  geoJsonLayer = L.geoJson(data, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
});



// Edit the getColor property to match data properties in your GeoJSON file
// In this example, columns follow this pattern: index1910, index1920...
function style(feature) {
  var t = tab_names[tab];
  return {
    fillColor: getColor(feature.properties[t[0]], t[1]),
    weight: 0.5,
    opacity: 1,
    color: 'black',
    fillOpacity: 0.9
  };
}

// This highlights the polygon on hover, also for mobile
function highlightFeature(e) {
  resetHighlight(e);
  var layer = e.target;
  layer.setStyle({
    weight: 4,
    color: 'black',
    fillOpacity: 0.7
  });
  info.update(layer.feature.properties);
}

// This resets the highlight after hover moves away
function resetHighlight(e) {
  geoJsonLayer.setStyle(style);
  info.update();
}

// This instructs highlight and reset functions on hover movement
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: highlightFeature
  });
}

// Creates an info box on the map
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// Edit info box labels (such as props.town) to match properties of the GeoJSON data
info.update = function (props) {
  var winName =
  this._div.innerHTML = (props ?
    '<div class="areaName">' + props.PROVINSI + '</div>' : '<div class="areaName faded"><small>Hover over areas<br>Click tabs or arrow keys</small></div>') +
    '<div class="areaLabel"><div class="areaValue">Nilai</div>' +(props ? '' + (checkNull(props[tab_names[tab][0]])) : '--') + '</div>' + 
    '<div class="areaLabel"><div class="areaValue">Nasional</div>' +(props ? '' + (checkNull(tab_names[tab][1])) : '--') + '</div>';
};
info.addTo(map);

// When a new tab is selected, this changes the year displayed
$(".tabItem").click(function() {
  $(".tabItem").removeClass("selected");
  $(this).addClass("selected");
  tab = $(this).attr('id');
  geoJsonLayer.setStyle(style);
});

// Edit grades in legend to match the range cutoffs inserted above
// In this example, the last grade will appear as "2+"
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1],
    label_names = ['diatas nasional', 'dibawah nasional'],
    labels = [],
    from;
  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    labels.push(
      '<i style="background:' + simple_colors[from] + '"></i> ' + label_names[i]);
  }
  div.innerHTML = labels.join('<br>');
  return div;
};
legend.addTo(map);

// In info.update, this checks if GeoJSON data contains a null value, and if so displays "--"
function checkNull(val) {
  if (val != null || val == "NaN") {
    return comma(val);
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed as a percentage
function checkThePct(a,b) {
  if (a != null && b != null) {
    return Math.round(a/b*1000)/10 + "%";
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed with commas (such as 123,456)
function comma(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}

// This watches for arrow keys to advance the tabs
$("body").keydown(function(e) {
    var selectedTab = parseInt($(".selected").attr('id').replace('tab', ''));
    var nextTab;

    // previous tab with left arrow
    if (e.keyCode == 37) {
        nextTab = (selectedTab == 1) ? tabs : selectedTab - 1;
    }
    // next tab with right arrow
    else if (e.keyCode == 39)  {
        nextTab = (selectedTab == tabs) ? 1 : selectedTab + 1;
    }

    $('#tab' + nextTab).click();
});
