import dotenv from 'dotenv';
import path from 'path';
import Imap from 'node-imap';
import linkify from "linkifyjs";
import he from "he";
import { fileURLToPath } from 'url';
import { simpleParser } from 'mailparser';
import { phishingLinks } from '../links/phishingLink.js';
import { hasMultipleExtension } from '../attachment/corruptionCheck.js';
import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

export function emailParser() {
  imap.once('ready', () => {
    openInbox((err, box) => {
      if (err) throw err;

      const sinceDate = '2-Sep-2025'; //----> set date
      imap.search(['UNSEEN', ['SINCE', sinceDate]], (err, results) => {
        if (err) throw err;

        if (!results.length) {
          console.log(' No new unread emails since', sinceDate);
          imap.end();
          return;
        }

        const f = imap.fetch(results, { bodies: '' });

        f.on('message', (msg, seqno) => {
          let buffer = '';

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });

          msg.once('end', () => {
            simpleParser(buffer)
              .then(parsed => {
                console.log('\n New Email Found:');
                console.log('Subject:', parsed.subject);
                console.log('From:', parsed.from.text);
                console.log('Body:', parsed.text?.substring(0, 200));

                // Extract links
                function extractLinks(text = "") {
                  const decoded = he.decode(text);
                  return linkify.find(decoded)
                    .filter(m => m.type === "url")
                    .map(m => m.href);
                }
                const links = extractLinks(parsed.text || '');
                console.log('Links found:', links);

                //CATCHING THE PHISHING LINK
                const suspect = links.filter(link =>
                  phishingLinks.some(phishing => link.includes(phishing))
                );
                if (suspect.length > 0) {
                  console.log(" 🚨🚨 ALERT: PHISHING LINK FOUND ", suspect);
                } else {
                  console.log(" ✅  THE EMAIL DOESNOT HAVE ANY PHISHING LINKS");
                }

                // Extract attachments info
                const attachments = parsed.attachments.map(att => ({
                  filename: att.filename,
                  size: att.size,
                  contentType: att.contentType,
                  content: att.content
                }));
                
                console.log('Attachments:', attachments);
                //check for the multiple  extension
                attachments.forEach(att => {
                  if (hasMultipleExtension(att.filename)) {
                    console.log(`⚠️  Corroupted: Multiple extesion detected ${att.filename}`);
                  }
                })
        
                for (const attachment of attachments) {
                  malware(attachment.content, attachment.filename);
                }
              })
              .catch(err => console.error(' Error parsing email:', err));
          });
        });

        f.once('error', (err) => console.log(' Fetch error:', err));

        f.once('end', () => {
          console.log('\n Done fetching emails.');
          imap.end();
        });
      });
    });
  });


  imap.once('error', (err) => console.log(' IMAP connection error:', err));
  imap.once('end', () => console.log(' Connection closed.'));
  imap.connect();
}

export const malware = async (fileBuffer, filename) => {
  try {
    // Prepare form-data with file
    const form = new FormData();
    form.append("file", fileBuffer, { filename });

    // Upload file to VirusTotal
    const uploadRes = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      form,
      {
        headers: {
          "x-apikey": process.env.VT_API_KEY,
          ...form.getHeaders(),
        },
      }
    );

    const analysisId = uploadRes.data.data.id;
    console.log(" File uploaded:", filename, "| analysis ID:", analysisId);

    // Poll results until scan is completed
    let status = "queued";
    let resultRes;
    while (status !== "completed") {
      resultRes = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: { "x-apikey": process.env.VT_API_KEY },
        }
      );

      status = resultRes.data.data.attributes.status;

      if (status !== "completed") {
        console.log("Attachment is  Still scanning, waiting...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    // Final result
    console.log(" Final Scan:", resultRes.data.data.attributes.stats);
  } catch (err) {
    console.error(" Error scanning file:", err.message);
  }
};

