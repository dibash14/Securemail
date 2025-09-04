import https from 'https'
import fs from 'fs';

const fileUrl = 'https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/refs/heads/master/phishing-links-ACTIVE.txt';
const destination = 'downloaded_file.txt';

const file = fs.createWriteStream(destination);

https.get(fileUrl, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close(() => {
            console.log('File downloaded successfully');
        });
    });
}).on('error', (err) => {
    fs.unlink(destination, () => {
        console.error('Error downloading file:', err);
    });
});