const fs = require('fs');

let content = fs.readFileSync('App.js', 'utf8');

const startMarker = "  // ─────────────────── JOBS SCREEN ───────────────────\n  if (currentScreen === 'Jobs') {";
const endMarker = "  // ─────────────────── RSB SCREEN (State Level DSW";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("Markers not found", { startIdx, endIdx });
  process.exit(1);
}

const replacement = `  // ─────────────────── JOBS SCREEN ───────────────────
  if (currentScreen === 'Jobs') {
    return (
      <JobHub
        onBack={() => setCurrentScreen('Home')}
        onOpenAI={() => setCurrentScreen('ChatAI')}
      />
    );
  }

`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync('App.js', content, 'utf8');
console.log("SUCCESS");
