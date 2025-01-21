
// Define the time range
var start = '2000-01-01';
var end = '2000-12-31';

// Load MODIS NDVI and LST data
var modisNDVI = ee.ImageCollection('MODIS/006/MOD13A1')
                 .filterDate(start, end)
                 .select('NDVI');

var modisLST = ee.ImageCollection('MODIS/006/MOD11A2')
                .filterDate(start, end)
                .select('LST_Day_1km');

// Function to convert LST from Kelvin to Celsius
function kelvinToCelsius(img) {
  return img.multiply(0.02).subtract(273.15)
    .copyProperties(img, ['system:time_start']);
}

// Apply the conversion to LST data
var modisLSTCelsius = modisLST.map(kelvinToCelsius);

// Calculate the min, max NDVI
var minNDVI = modisNDVI.min();
var maxNDVI = modisNDVI.max();

// Calculate the min, max LST
var minLST = modisLSTCelsius.min();
var maxLST = modisLSTCelsius.max();

// Function to calculate VCI for an image
function calculateVCI(image) {
  return image.subtract(minNDVI).divide(maxNDVI.subtract(minNDVI)).multiply(100)
               .copyProperties(image, ['system:time_start']);
}

// Function to calculate TCI for an image
function calculateTCI(image) {
  return maxLST.subtract(image).divide(maxLST.subtract(minLST)).multiply(100)
               .copyProperties(image, ['system:time_start']);
}

// Calculate VCI and TCI
var vci = modisNDVI.map(calculateVCI);
var tci = modisLSTCelsius.map(calculateTCI);

// Function to calculate VHI for a pair of images
function calculateVHI(vciImage, tciImage) {
  return vciImage.add(tciImage).divide(2)
    .set('system:time_start', vciImage.get('system:time_start'));
}

// Combine VCI and TCI to calculate VHI
var vhiList = vci.toList(vci.size()).zip(tci.toList(tci.size()));
var vhi = ee.ImageCollection.fromImages(vhiList.map(function(imagePair) {
  return calculateVHI(ee.Image(ee.List(imagePair).get(0)), ee.Image(ee.List(imagePair).get(1)));
}));

// Reduce the VHI image collection to a single image (mean over the time period)
var meanVHI = vhi.mean();

// Clip the VHI to the AOI
var vhiClip = meanVHI.clip(aoi);

// Visualization parameters
var visParams = {
  min: 0,
  max: 100,
  palette: ['blue', 'green', 'yellow', 'red']
};

// Add layers to the map
Map.centerObject(aoi, 6);
Map.addLayer(aoi, {color: 'black'}, 'AOI');
Map.addLayer(vhiClip, visParams, 'VHI');

// Set up the legend
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// Legend title
var legendTitle = ui.Label({
  value: 'Vegetation Health Index',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});

legend.add(legendTitle);

// Function to generate a row of the legend
var createLegendRow = function(color, label) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: color,
      // Use a square to represent the color
      padding: '8px',
      margin: '0 8px 4px 0'
    }
  });

  var description = ui.Label({
    value: label,
    style: {margin: '0 0 4px 6px'}
  });

  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

// Color palette and corresponding labels
var palette = ['blue', 'green', 'yellow', 'red'];
var labels = ['0-25 Low', '26-50 Moderate', '51-75 High', '76-100 Very High'];

// Adding each legend row
for (var i = 0; i < palette.length; i++) {
  legend.add(createLegendRow(palette[i], labels[i]));
}

// Add legend to the map
Map.add(legend);

// Export the image, specifying scale and region.
Export.image.toDrive({
  image: vhiClip,
  description: 'VHI_Sudan_2000',
  scale: 1000,
  region: aoi
});
