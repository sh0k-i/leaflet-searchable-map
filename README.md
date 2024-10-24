# Leaflet Searchable Map

This project implements a searchable map using Leaflet and GeoJSON. You can search for properties by their last name. 

## Features
- Search functionality for names and addresses
- Interactive map with GeoJSON data
- Display popups with property details

## Documentation

#### Install dependencies:
 Node.js and node-fetch for making HTTP requests `npm install node-fetch`

#### Geocoding Script:
Ran GeocodingRequest.mjs script to iterate over each address and send a request to Mapboxs Geocoding API and returns the best result based on specific conditions. Stores the data in a json file 'Coordinates.json' 

#### Create geojson file 
- Installed package `npm install geojson`
- Ran ConvertGeojson.mjs script to convert CompleteData.json to GeoJSON and saves it to a new file, CompleteData.geojson

#### Create Searchable Map
The HTML file implements a searchable map using Leaflet.js and the Leaflet Search plugin. It dynamically loads GeoJSON data to display points on a map, providing functionality to search through the dataset.

**External Libraries and Resources:**
• **Leaflet.js**: Used to initialize and display the interactive map.
• **Leaflet Search**: Adds search functionality to the map for finding markers by specific properties.
• **Map Tiles**: OpenStreetMap tiles are provided by MapTiler.