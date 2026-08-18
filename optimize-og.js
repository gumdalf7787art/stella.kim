const sharp = require('sharp');
const fs = require('fs');

const inputPath = 'C:\\Users\\검달프\\.gemini\\antigravity\\brain\\c25a43f9-6987-4ce8-88e3-ee275b5f85c5\\media__1787031030350.jpg';
const outputPath = 'images/og-thumbnail.jpg';

sharp(inputPath)
  .resize({ width: 1200, height: 630, fit: 'cover' })
  .jpeg({ quality: 80, progressive: true })
  .toFile(outputPath)
  .then(info => {
    console.log('Successfully created OG thumbnail:', info);
  })
  .catch(err => {
    console.error('Error creating OG thumbnail:', err);
  });
