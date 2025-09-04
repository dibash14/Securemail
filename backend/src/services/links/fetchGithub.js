import {Octokit} from 'octokit';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN})

async function getFile(){
const response=await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
  owner: 'Phishing-Database',
  repo: 'Phishing.Database',
  path: 'README.md',
  headers: {'X-GitHub-Api-Version': '2022-11-28'}
})


const filerContent=Buffer.from(response.data.content,"base64").toString('utf8');
const urlRegix = /(https?:\/\/[^\s]+ALL-phishing-links\.lst)/i;
const links= filerContent.match(urlRegix) || [];

//save only links in readme.md
fs.writeFileSync('LINKS.txt',links.join('\n'));
console.log(`FOUND ${links.length} links.`)

//save the whole readme.md
fs.writeFileSync('README.txt',filerContent);
console.log('file has been saved');

}
getFile();























