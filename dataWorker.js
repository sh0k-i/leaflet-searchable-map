let geojsonData = null; // Store the loaded GeoJSON data

// Listen for messages from the main script
self.onmessage = (e) => {
    const { geojson, bounds } = e.data;

    // Load the geojson data initially if provided
    if (geojson) {
        geojsonData = geojson;
    }

    // Check if bounds are provided and geojson data is loaded
    if (bounds && geojsonData) {
        const filteredFeatures = geojsonData.features.filter(feature => {
            const [lng, lat] = feature.geometry.coordinates;

            // Check if the feature is within the bounds
            return (
                lng >= bounds._southWest.lng &&
                lng <= bounds._northEast.lng &&
                lat >= bounds._southWest.lat &&
                lat <= bounds._northEast.lat
            );
        });

        // Send the filtered data back to the main script
        self.postMessage({
            type: 'filteredData',
            features: filteredFeatures
        });
    }
};