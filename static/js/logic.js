// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let baseMaps = {
  "Street Map": street,
  "Default Map": basemap  // Changed to 'basemap' instead of 'background'
};

// Create the map object with center and zoom options.
let myMap = L.map("map-id", {
  center: [34.03, -118.15],
  zoom: 5,
  layers: basemap  // Updated to 'basemap' instead of 'background'
});


// Then add the 'basemap' tile layer to the map.
basemap.addTo(myMap);
street.addTo(myMap);


// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();
let overlays = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

L.control.layers(baseMaps, overlays, {
  collapsed: false
}).addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: '#000000',
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };

  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 90) {
      return 'red'; // Updated to 'red'
    } else if (depth > 70) {
      return 'orange'; // Updated to 'orange'
    } else if (depth > 50) {
      return 'yellow'; // Updated to 'yellow'
    } else if (depth > 30) {
      return 'limegreen'; // Updated to 'limegreen'
    } else if (depth > 10) {
      return 'lightgreen'; // Updated to 'lightgreen'
    } else {
      return 'cyan'; // Updated to 'cyan'
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 2.5;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);

    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      let depth = feature.geometry.coordinates[2]; // Correct way to access depth
      layer.bindPopup(
          `Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}<br>Depth: ${depth} km`
      );

    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(map);

  earthquakes.addTo(map);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    const depthIntervals = [0, 10, 30, 50, 70, 90];
    const colors = ['cyan', 'lightgreen', 'limegreen', 'yellow', 'orange', 'red'];


    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depthIntervals.length; i++) {
      div.innerHTML +=
      '<i style="background:' + colors[i] + '"></i> ' +
      (depthIntervals[i] ? depthIntervals[i] + (depthIntervals[i + 1] ? ' &ndash; ' + depthIntervals[i + 1] + ' km' : '+ km')
       : '0 &ndash; 10 km') + '<br>';
    }

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(myMap);


  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plate_data, {
      style: {
        color: "blue",
        weight: 2
      }
    // Then add the tectonic_plates layer to the map.
  }).addTo(tectonicPlates);

  });
});
