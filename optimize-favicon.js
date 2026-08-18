const sharp = require('sharp');
const fs = require('fs');

const inputPath = 'C:\\Users\\검달프\\.gemini\\antigravity\\brain\\c25a43f9-6987-4ce8-88e3-ee275b5f85c5\\media__1787031348392.jpg';
const outputPath = 'favicon.png';

sharp(inputPath)
  .resize({ width: 192, height: 192, fit: 'cover' })
  .png({ quality: 100 })
  .toFile(outputPath)
  .then(info => {
    console.log('Successfully created Favicon:', info);
  })
  .catch(err => {
    console.error('Error creating Favicon:', err);
  });
