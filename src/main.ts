import * as fs from 'fs';
import * as readline from 'readline';
import { throttleDecryption } from './api/decrypt';
import { generateCitizenFile } from './processCitizens';

// Limit blocks to 1000, since decrypt api only handles 1000 entries at a time
const MAX_BLOCK_SIZE = 1000

const readFile = (fileName: string, dataDestination: string) => {
  let lineNumber = 0;
  let block: string[] = [];
  let blocks: string[][] = [];

  if (!fs.existsSync(fileName)) {
    throw new Error('top secret file not found !');
  }

  const stream = fs.createReadStream(fileName);
  const lineReader = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  lineReader.on('line', (line: string) => {
    block.push(line);
    lineNumber++;

    if (lineNumber >=  MAX_BLOCK_SIZE) {
      blocks.push(block);
      block = [];
      lineNumber = 0;
    }
  });

  lineReader.on('close', async () => {
    // File finished reading, make sure to include stragglers
    if (block.length) {
      blocks.push(block);
      block = [];
    }

    try {
      // Decrypt the blocks of data
      const citizens = await throttleDecryption(blocks);
      generateCitizenFile(citizens, dataDestination);

      console.log('Process completed');
    } catch (e) {
      console.log('we got an error', e);
    }
  });
}

// Process start !
readFile(
  'data-source/super-secret-data.txt',
  'data-output/citizens-super-secret-info.txt'
);
