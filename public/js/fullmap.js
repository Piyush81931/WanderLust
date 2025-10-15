const mapToken = maptoken;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    const showMapBtn = document.getElementById('showMapBtn');
    console.log("Button element:", showMapBtn);
    
    if (showMapBtn) {
      console.log("Adding click event to button");
      showMapBtn.addEventListener('click', function() {
        console.log("Button clicked!");
        const mapModal = document.getElementById('mapModal');
        if (mapModal) {
          mapModal.style.display = 'block';
          setTimeout(loadMap, 200); // Allow modal to render first
        } else {
          console.error("Map modal not found");
        }
      });
    } else {
      console.error("Show Map button not found");
    }
  });
  
  function closeMap() {
    const mapModal = document.getElementById('mapModal');
    mapModal.style.display = 'none';
  }
  
  function loadMap() {
    console.log("Loading map...");
    // Note: Changed variable name to match what's defined in your EJS
    mapboxgl.accessToken = maptoken;
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [77.2090, 28.6139], // Default center (Delhi)
      zoom: 4
    });

    console.log("Plotting markers for", alllisting.length, "listings");
    
    alllisting.forEach(listing => {
      if (listing.geometry && listing.geometry.coordinates) {
        new mapboxgl.Marker()
          .setLngLat(listing.geometry.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>${listing.title}</strong>`))
          .addTo(map);
      }
    });
  }
  map.addControl(new mapboxgl.NavigationControl());

  // Add style switcher
  map.addControl(
    new mapboxgl.NavigationControl({
      showCompass: false
    })
  );
  
  // Add a style switcher
  map.addControl(
    new mapboxgl.StylesControl({
      styles: [
        {
          label: 'Satellite',
          styleName: 'Satellite',
          styleUrl: 'mapbox://styles/mapbox/satellite-v9'
        },
        {
          label: 'Satellite Streets',
          styleName: 'Satellite Streets',
          styleUrl: 'mapbox://styles/mapbox/satellite-streets-v12'
        },
        {
          label: 'Outdoors',
          styleName: 'Outdoors',
          styleUrl: 'mapbox://styles/mapbox/outdoors-v12'
        }
      ]
    })
  );
    