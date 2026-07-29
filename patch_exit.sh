sed -i 's/console.log(`\\n${upCount}\/${statuses.length} sites up · ${nowIso}`);/console.log(`\\n${upCount}\/${statuses.length} sites up · ${nowIso}`);\n  process.exit(0);/' scripts/monitor.ts
