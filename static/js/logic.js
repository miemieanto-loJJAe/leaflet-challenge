// put url in a variable
const url1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


function Color(depth) {
    const colorrange = d3.interpolate("#f9e6ff","#4d0066");
    const depthrange = d3.scaleLinear().domain([10, 30]).range([0, 2]);
  
    return colorrange(depthrange(depth));
  }
  
  
  // calculate  marker radius based on mag
  function markerRadius(mag) {
    return mag * 5;
  }
  
  
  // fetch datasets
  Promise.all([d3.json(url1),d3.json(url2)]).then((data) => {
    const [earthquakedata, platesdata] = data;
  
    // Center map
    const map = L.map("map").setView([37.09, -95.71], 5);
  
    // Add base map
    const StreetMapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
    const darkmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    });
    const satellitelayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution:
        'Map data © <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">ArcGIS</a>'
    });
  
    const basemaps = {
      "OpenStreetMap": StreetMapLayer,
      "Dark Map": darkmap,
      "Satellite": satellitelayer
    };
  
    StreetMapLayer.addTo(map);
  
    // layer group for earthquake markers
    const earthquakeLayer = L.layerGroup();
  
    // Looping through the earthquake data
    earthquakedata.features.forEach((earthquake) => {
      const latitude = earthquake.geometry.coordinates[1];
      const longitude = earthquake.geometry.coordinates[0];
      const mag = earthquake.properties.mag;
      const depth = earthquake.geometry.coordinates[2];
  
      // circle marker for individual earthquake
      const marker = L.circleMarker([latitude, longitude], {
        radius: markerRadius(mag), // Set the marker radius based on magnitude
        fillColor: Color(depth),
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });
  
      // Adding popups to map
      marker.bindPopup(
        `Magnitude: ${mag}<br>Depth: ${depth} km<br>Location: ${earthquake.properties.place}`
      );
  
      // Adding marker to earthquake layer
      marker.addTo(earthquakeLayer);
    });
  
    // Create a tectonic plates layer
    const platesLayer = L.geoJSON(platesdata, {
      style: {
        color: "#cc0066", 
        weight: 2
      }
    });
  
    
    const overlayMaps = {
      "Earthquakes": earthquakeLayer,
      "Tectonic Plates": platesLayer
    };
  
    // adding legend
    const legend = L.control({ position: "bottomright" });
  
    // generate legend content
    legend.onAdd = function (map) {
      const div = L.DomUtil.create("div", "info legend");
      const depths = [-10, 10, 30, 50, 70, 90, 110, 130, 150];
      const labels = [];
  
      for (let i = 0; i < depths.length; i++) {
        const from = depths[i];
        const to = depths[i + 1];
  
        labels.push(
          `<i style="background:${Color(from + 1)}"></i> ${from + 1} km ${to ? "&ndash;" + to + " km" : "+"}`
        );
      }
  
      div.innerHTML = labels.join("<br>");
      return div;
    };
  
    // Add earthquake and tectonic plates 
    earthquakeLayer.addTo(map);
    platesLayer.addTo(map);
  
 
    L.control.layers(basemaps, overlayMaps).addTo(map);
  
    // Add legend 
    legend.addTo(map);
  });
  