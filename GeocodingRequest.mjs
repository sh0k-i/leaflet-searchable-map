// iterate over each one and send a request to Mapbox’s Geocoding API

import fetch from 'node-fetch';
import fs from 'fs'; 
import initialData from './initialData.json' assert { type: 'json' };

const accessToken = ''; 

// Function to fetch geocoding data from Mapbox using the correct endpoint
async function geocodeAddress(address) {
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${accessToken}`; // Use the forward geocoding endpoint
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch geocoding data for ${address}: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    // Filter for the best match based on match_code
    const bestMatch = data.features.find(feature => {
        const matchCode = feature.properties.match_code || {};
        return matchCode.address_number === 'matched' && matchCode.street === 'matched';
    });

    // Return the best match, if available
    return bestMatch || null; // Return null if no suitable match is found
}

async function processAddresses() {
    let completeData = [];

    for (const entry of initialData) {
        const { LastName, Address1, City, State, Zip, Product } = entry;
        const fullAddress = `${Address1}, ${City}, ${State} ${Zip}`;

        try {
            const response = await geocodeAddress(fullAddress);
            if (response) {
                const { properties, geometry } = response; // Destructure properties and geometry
                // Construct the complete entry
                const completeEntry = {
                    id: response.id,
                    "Last Name": LastName,
                    "Address Number": properties.context.address.address_number,
                    "Street": properties.context.street.name,
                    "Postal Code": properties.context.postcode.name,
                    "Region": properties.context.region.name,
                    "Country": properties.context.country.name,
                    "Full Address": properties.full_address,
                    "Latitude": geometry.coordinates[1], 
                    "Longitude": geometry.coordinates[0],
                    "Product": Product
                    
                };

                completeData.push(completeEntry);
            } else {
                console.log(`No suitable match found for: ${fullAddress}`);
            }
        } catch (error) {
            console.error(`Error geocoding ${fullAddress}:`, error);
        }
    }

    // Save to CompleteData.json
    fs.writeFileSync('./CompleteData.json', JSON.stringify(completeData, null, 2));
    console.log('CompleteData.json created successfully.');
}

// Run the process
processAddresses();