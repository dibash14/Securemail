import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./downloaded_file.txt');
const data = fs.readFileSync(filePath, 'utf-8');
const linesArray = data.split(/\r?\n/);

fs.writeFileSync('./phishingLink.js', `export const phishingLinks = [\n`);

for (const line of linesArray) {
    if (line.trim() !== '') { // --------------------skip empty lines-----------------------
        fs.appendFileSync('./phishingLink.js', `  "${line}",\n`);
    }
}
fs.appendFileSync('./phishingLink.js', `];\n`);



