const fs = require('fs');
const CPU = require('./cpu');

const args = process.argv.slice(2);

if (args.length != 1) {
  console.error("usage: ls8 infile");
  process.exit(1);
}

const filename = args[0];

/**
 * read the input file
 */
function readFile(filename) {
  const contents = fs.readFileSync(filename, 'utf-8');
  // TODO! Error check!

  return contents;
}

/**
 * Load the file into CPU memory
 */
function loadMemory(cpu, contents) {
  const lines = contents.split('\n');
  let address = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Find comment
    const commentIndex = line.indexOf('#');
    if (commentIndex != -1) {
      line = line.substr(0, commentIndex);
    }

    line = line.trim();

    if (line === '') {
      continue;
    }

    const val = parseInt(line, 2); // convert from binary string to decimal
        
    cpu.poke(address++, val);
  }
}

/**
 *  MAIN
 */
const cpu = new CPU();

const contents = readFile(filename);
loadMemory(cpu, contents);

cpu.startClock();
