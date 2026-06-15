const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

function createSvg(text, filename, width=400, height=300, bgColor='#333', textColor='#fff') {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}" />
    <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
      ${text}
    </text>
  </svg>`;
  fs.writeFileSync(path.join(dir, filename), svg);
}

// Map images
createSvg('Map 1F', 'map1f.png', 600, 400, '#2b6cb0');
createSvg('Map 2F', 'map2f.png', 600, 400, '#2c7a7b');

// Step images
for (let i = 0; i <= 8; i++) {
  createSvg(`Step ${i} Image`, `step${i}.png`, 400, 300, '#4a5568');
}

// Field images
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
for (const letter of letters) {
  createSvg(`Field ${letter}`, `${letter}.png`, 300, 300, '#718096');
}

console.log('Dummy images generated successfully.');
