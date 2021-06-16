


  // Define a function with a popup describing the place and time of each earthquake
  function popUpMsg(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

 // Define streetmap layer
 var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "streets-v11",
    accessToken: API_KEY
  });
// Define darkmap layer
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });
  // Define satelitemap layer
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our map layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite Map": satellitemap
  };
  
// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
    center: [ 37.09, -95.71 ],
    zoom: 5,
    layers: [streetmap]     //default selected layer
    });


// Add streetmap tile to map
streetmap.addTo(myMap);


// create overlay layers
var earthquakes = new L.LayerGroup();
var faultlines = new L.LayerGroup();


// Create overlay object to hold the overlay layer
var overlayMaps = {
  Earthquakes: earthquakes,
  "Fault lines": faultlines
};

// Create a layer control
L.control.layers(baseMaps, overlayMaps, {
  collapsed: true //shows or hide the legend
}).addTo(myMap);

// load the data for the last 7 days for all earthquakes
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  L.geoJSON(data, {
    onEachFeature: popUpMsg,
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
        radius: feature.properties.mag * 6, 
        color: depthColor(feature.geometry.coordinates[2]),  
        fillOpacity: 0.85
      });
  }
  }).addTo(earthquakes);


  earthquakes.addTo(myMap);
});

///load the tectonic plates lines on the map

url = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'
d3.json(url, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  L.geoJSON(data,{
    style: function(){
      return {
        color : "red",
        weight: "1.5",
        opacity: 0.8
      };
    }}
      ).addTo(faultlines);
    
  faultlines.addTo(myMap);
});


// define the legend and different colors for depth 
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 4, 6, 8, 10],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    div.innerHTML += '<h3>Earthquake <br> <center>Depth <center></h3>'
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

//  function to define the depth of the earthquake by color and to be used in the legend
function depthColor(depth){
  if ( depth > 10){
    color = "#8b0000";
  }
  else if( depth > 8){
    color = "#a23300";
  }
  else if( depth > 6){
    color = " #bf7300";
  }
  else if( depth > 4){
    color = " #dcb200";
  }
  else{
    color = "yellow"
  }
  return color;
}

// attended TA extra HW session