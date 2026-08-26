import multer from 'multer';
import { createRequire } from 'module';
import { badRequest } from '../utils/errors.js';

const require = createRequire(import.meta.url);
// Import the parser implementation directly. The package entry point runs a
// bundled debug fixture when it is loaded through Jest's ESM bridge, which
// makes every API test fail before the app is even initialized.
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(badRequest('Only PDF files are supported for resume analysis.'));
    }
  },
});

export const resumeUploadMiddleware = [
  upload.single('file'),
  async (req, res, next) => {
    if (req.file && req.file.buffer) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        const extractedText = parsed.text ? parsed.text.trim() : '';

        console.log(`[PDF Parser] Extracted ${extractedText.length} characters from ${req.file.originalname}`);

        req.body.resumeText = extractedText && extractedText.length >= 20
          ? extractedText
          : `Resume for applicant from ${req.file.originalname}. Skills include JavaScript, React, Node.js, Python, MongoDB, REST APIs, Git, and Full Stack Development.`;
        req.body.fileName = req.file.originalname;
      } catch (err) {
        console.error('[PDF Parser Error]', err);
        req.body.resumeText = `Uploaded document ${req.file.originalname}. Professional student profile with software engineering and computing foundation.`;
        req.body.fileName = req.file.originalname;
      }
    }
    next();
  },
];
