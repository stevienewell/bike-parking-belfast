const fs = require("fs");
const geolib = require("geolib");
const staticService = require("@mapbox/mapbox-sdk/services/static");

module.exports.closestBikeParking = (latitude, longitude) => {
  const rawdata = fs.readFileSync("cycleparkingv2.geojson");
  const dataSet = JSON.parse(rawdata);

  let cycleStations = [];
  dataSet.features.forEach(function(feature) {
    let jsonData = {};

    jsonData["latitude"] = feature.geometry.coordinates[1];
    jsonData["longitude"] = feature.geometry.coordinates[0];
    jsonData["id"] = feature.properties.Google_Str;
    jsonData["address"] = `${
      feature.properties.Building_N !== undefined
        ? feature.properties.Building_N
        : ""
    } ${feature.properties.Street_Roa}`;
    cycleStations.push(jsonData);
  });

  const result = geolib.findNearest(
    { latitude: latitude, longitude: longitude },
    cycleStations
  );

  return result;
};

const getMapImage = (latitude, longitude) => {
  const staticClient = staticService({
    accessToken: process.env.MAPBOX_APIKEY
  });

  // Filter all buildings that have a height value that is less than 300 meters
  const request = staticClient.getStaticImage({
    ownerId: "mapbox",
    styleId: "streets-v11",
    width: 720,
    height: 480,
    position: {
      coordinates: [longitude, latitude],
      zoom: 20
    },
    overlays: [
      {
        marker: {
          coordinates: [longitude, latitude],
          color: "#F00"
        }
      }
    ],
    layer_id: "building"
  });
  const staticImageUrl = request.url();
  console.log(staticImageUrl);
  return staticImageUrl;
};

module.exports.getMapImage = getMapImage;
