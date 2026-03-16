export const geolocation = {
  getCurrentPosition: (options = { enableHighAccuracy: true }) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          (error) => {
            let message = 'Failed to get location';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location permission denied';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                message = 'Location request timeout';
                break;
            }
            reject(new Error(message));
          },
          options
        );
      }
    });
  },

  watchPosition: (callback, options = { enableHighAccuracy: true }) => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      options
    );
  },

  clearWatch: (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  },

  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  isWithinGeofence: (userLat, userLon, officeLat, officeLon, radiusMeters) => {
    const distance = geolocation.calculateDistance(
      userLat,
      userLon,
      officeLat,
      officeLon
    );
    return distance <= radiusMeters;
  },
};