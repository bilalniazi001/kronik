const axios = require('axios');

// Get location details from coordinates using OpenStreetMap Nominatim
async function getLocationDetails(latitude, longitude) {
    try {
        if (!latitude || !longitude) return 'Unknown Location';
        return `${latitude}, ${longitude}`;
    } catch (error) {
        console.error('Location formatting error:', error);
        return 'Unknown Location';
    }
}

// Calculate distance between two coordinates (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Check if location is within geofence
function isWithinGeofence(userLat, userLon, officeLat, officeLon, radiusMeters) {
    const distance = calculateDistance(userLat, userLon, officeLat, officeLon);
    return distance <= radiusMeters;
}

module.exports = {
    getLocationDetails,
    calculateDistance,
    isWithinGeofence
};