
import fetch from 'node-fetch';
import fs from 'fs'; 
import initialData from './initialData.json' assert { type: 'json' };

const accessToken = 'sk.eyJ1Ijoic2hvay1pIiwiYSI6ImNtMmV0cTNpdzAyanAya3F5dndjNjExOHcifQ.9uTf5uVBeiBPtJ8ABUrYUQ'; 
const MAX_RETRIES = 3; // Number of retry attempts
const RETRY_DELAY = 1000; // Delay in milliseconds between retries
const BATCH_SIZE = 10; // Number of addresses to process in each batch
const BATCH_PAUSE = 12000; // Pause in milliseconds between batches (to handle 500 requests/minute)

async function geocodeAddress(address) {
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${accessToken}&limit=10`;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
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

            return bestMatch || null; // Return null if no suitable match is found

        } catch (error) {
            attempt++;
            console.error(`Attempt ${attempt} failed for ${address}. Error: ${error.message}`);
            if (attempt < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Wait before retrying
            }
        }
    }

    console.error(`All ${MAX_RETRIES} attempts failed for ${address}.`);
    return null; // Return null after all retries fail
}

async function processAddresses() {
    let completeData = [];
    let unmatchedData = []; // Store unmatched entries here
    let failedData = []; // Store failed entries here

    for (let i = 0; i < initialData.length; i += BATCH_SIZE) {
        const batch = initialData.slice(i, i + BATCH_SIZE); // Get the current batch

        // Process all addresses in the current batch concurrently
        const results = await Promise.all(batch.map(async (entry) => {
            const { LastName, Address1, City, State, Zip, Product } = entry;
            const fullAddress = `${Address1}, ${City}, ${State} ${Zip}`;

            try {
                const response = await geocodeAddress(fullAddress);
                if (response) {
                    const { properties, geometry } = response;
                    return {
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
                } else {
                    console.log(`No suitable match found for: ${fullAddress}`);
                    unmatchedData.push(entry); // Add to unmatched data if no suitable match is found
                    return null; // return null for unmatched entries
                }
            } catch (error) {
                console.error(`Error geocoding ${fullAddress}:`, error);
                failedData.push(entry); // Add the entry to failed data on error
                return null; // return null on failure
            }
        }));

        // Filter out the successful results and add to completeData
        completeData.push(...results.filter(result => result !== null));

        // Pause after processing each batch
        if (i + BATCH_SIZE < initialData.length) {
            console.log(`Pausing for ${BATCH_PAUSE / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, BATCH_PAUSE));
        }
    }

    // Save matched and unmatched data to respective JSON files
    fs.writeFileSync('./CompleteData.json', JSON.stringify(completeData, null, 2));
    fs.writeFileSync('./Unmatched.json', JSON.stringify(unmatchedData, null, 2));
    fs.writeFileSync('./Failed.json', JSON.stringify(failedData, null, 2)); // Save failed data
    console.log('CompleteData.json, Unmatched.json, and Failed.json created successfully.');
}

// Run the process
processAddresses();