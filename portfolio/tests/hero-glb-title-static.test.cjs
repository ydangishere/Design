const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  ['hero title 3D container exists', /class="[^"]*\bhero-title-3d\b[^"]*"/],
  ['GLB asset is referenced', /assets\/text-ydang\.glb/],
  ['Three.js module import exists', /three\.module\.js/],
  ['GLTFLoader import exists', /GLTFLoader\.js/],
  ['accessible Y VAN DANG label remains', /aria-label="Y VAN DANG"/],
  ['fallback hides only after render is confirmed', /\.hero-title-3d\.is-rendered \.hero-title-3d__fallback/],
  ['canvas pixels are checked before confirming render', /readPixels\(/],
];

const forbidden = [
  ['loaded class must not hide fallback before render confirmation', /\.hero-title-3d\.is-loaded \.hero-title-3d__fallback\s*\{\s*opacity:0/s],
];

let failed = false;
for (const [name, pattern] of checks) {
  if (!pattern.test(html)) {
    console.error(`FAIL: ${name}`);
    failed = true;
  } else {
    console.log(`PASS: ${name}`);
  }
}

for (const [name, pattern] of forbidden) {
  if (pattern.test(html)) {
    console.error(`FAIL: ${name}`);
    failed = true;
  } else {
    console.log(`PASS: ${name}`);
  }
}

if (failed) process.exit(1);
