// Store our API endpoint as queryUrl.
let usgs = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL/
d3.json(usgs).then(function (usgsData) {
    // Send the data features object to createFeatures function.
    createFeatures(usgsData.features);});

function createFeatures(eqData) {
    // Define a function for the features in the array.
    // Assign popup that describes the place, magnitude, and depth of the earthquake.
    function eachFeat(feature, layer) {
        const magnitude = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];
        layer.bindPopup(
            `<h3>${feature.properties.place}</h3>
            <p>Magnitude: ${magnitude}</p>
            <p>Depth: ${depth} km</p>`);}
    
    // Define a function to create circle markers with size and color based on earthquake properties.
    function pointToLayer(feature, coords) {
        // Magnitude-based size calculation
        let size = feature.properties.mag * 4;
        // Depth-based color calculation
        let depth = feature.geometry.coordinates[2];
        let color = depth >= 90 ? "#e60000" : depth >= 70 ? "#ff6600" : depth >= 50 ? "#ffc266" : depth >= 30 ? "#ffff80" : depth >= 10 ? "#ddff99" : "#b3f0ff";
        
        // Customize circle marker.
        return L.circleMarker(coords, {radius: size,
                                       fillColor: color,
                                       color: "#000",
                                       weight: 1,
                                       opacity: 1,
                                       fillOpacity: 0.7});}
    
    // Create a layer with the features array on the eqData object.
    // Run the onEachFeature function.
    let earthqs = L.geoJSON(eqData, {
        onEachFeature: eachFeat,
        pointToLayer: pointToLayer});

    // Send earthqs layer to the createMap function
    createMap(earthqs);}

function createMap(earthqs) {

    // Create the base layer.
    let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})

    // Create a base_layer_maps object.
    let base_layer_maps = {"Street Map": baseLayer,};

    // Create an overlay object to hold our overlay.
    let overlayMaps = {Earthquakes: earthqs};

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let eqMap = L.map("map", {center: [40,-111], zoom: 5, layers: [baseLayer, earthqs]});

    // Create a layer control and add it to the map.
    L.control.layers(base_layer_maps, overlayMaps).addTo(eqMap);

    // Add legend for depth.
    let legend = L.control({position: "bottomright"});

    legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "legend");
    let grades = ["-10", "10", "30", "50", "70", "90"];
    let colors = ["#b3f0ff", "#ddff99", "#ffff80", "#ffc266", "#ff6600", "#e60000"];
    
    // Loop through the depth intervals to associate a color with each interval.
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + colors[i] + '"></i>' + grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + " km" + "<br>" : "+ km");}
        return div;};

    legend.addTo(eqMap);}