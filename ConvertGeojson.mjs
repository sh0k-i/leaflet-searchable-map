import fs from 'fs'; // Import the fs module
import GeoJSON from 'geojson'; // Import the geojson library

// Load the CompleteData.json file
const completeData = JSON.parse(fs.readFileSync('./CompleteData.json', 'utf-8'));

// Convert the data to GeoJSON format
const geojsonData = GeoJSON.parse(completeData, {
    Point: ['Latitude', 'Longitude'], // Specify the geometry attributes
    include: ['Last Name', 'Full Address', 'Product'] // Include additional properties
});

// Save the GeoJSON to a file
fs.writeFileSync('./CompleteData.geojson', JSON.stringify(geojsonData, null, 2));
console.log('CompleteData.geojson created successfully.');