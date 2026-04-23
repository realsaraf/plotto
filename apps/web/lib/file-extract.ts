/**
 * Server-side helpers to convert uploaded files into plain text suitable
 * for the LLM extraction pipeline.
 *
 * Hard caps + accepted MIME types are enforced here so the route handler
 * stays thin.
 */

import OpenAI from 'openai';

export const MAX_DOC_BYTES = 1 * 1024 * 1024; // 1 MB hard cap (PDF/DOCX/TXT)
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // post-compress safety cap

export const ACCEPTED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc (legacy)
  'text/plain',
  'text/markdown',
] as const;

export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
] as const;

export type FileExtractionResult = {
  text: string;
  source: 'pdf' | 'docx' | 'txt' | 'image';
  filename: string;
  bytes: number;
};

export class FileTooLargeError extends Error {
  constructor(public bytes: number, public limit: number) {
    super(`File too large: ${bytes} > ${limit} bytes`);
  }
}

export class UnsupportedFileError extends Error {
  constructor(public mime: string) {
    super(`Unsupported file type: ${mime}`);
  }
}

function isImage(mime: string): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(mime);
}

function isDoc(mime: string): boolean {
  return (ACCEPTED_DOC_TYPES as readonly string[]).includes(mime);
}

/**
 * Extract plain text from a single uploaded File. Routes to the right
 * parser based on MIME type. For images, calls OpenAI's vision endpoint
 * to transcribe + describe in compact form.
 */
export async function extractTextFromFile(
  file: File,
  opts: { openaiApiKey: string; visionModel?: string },
): Promise<FileExtractionResult> {
  const mime = file.type || 'application/octet-stream';
  const bytes = file.size;
  const filename = file.name || 'upload';

  if (isImage(mime)) {
    if (bytes > MAX_IMAGE_BYTES) throw new FileTooLargeError(bytes, MAX_IMAGE_BYTES);
    const text = await ocrImage(file, opts);
    return { text, source: 'image', filename, bytes };
  }

  if (!isDoc(mime)) throw new UnsupportedFileError(mime);
  if (bytes > MAX_DOC_BYTES) throw new FileTooLargeError(bytes, MAX_DOC_BYTES);

  const buf = Buffer.from(await file.arrayBuffer());

  if (mime === 'application/pdf') {
    const text = await parsePdf(buf);
    return { text, source: 'pdf', filename, bytes };
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword'
  ) {
    const text = await parseDocx(buf);
    return { text, source: 'docx', filename, bytes };
  }

  // text/plain or text/markdown
  return { text: buf.toString('utf8'), source: 'txt', filename, bytes };
}

async function parsePdf(buf: Buffer): Promise<string> {
  // pdf-parse v2 exposes a class-based API.
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = await parser.getText();
    return (result.text || '').trim();
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function parseDocx(buf: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const { value } = await mammoth.extractRawText({ buffer: buf });
  return (value || '').trim();
}

async function ocrImage(
  file: File,
  opts: { openaiApiKey: string; visionModel?: string },
): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buf.toString('base64')}`;
  const client = new OpenAI({ apiKey: opts.openaiApiKey });
  const model = opts.visionModel ?? 'gpt-4o-mini';
  const completion = await client.chat.completions.create({
    model,
    max_tokens: 800,
    messages: [
      {
        role: 'system',
        content:
          'You are a precise OCR + scene transcriber. Output only the extracted text and any short factual description needed to understand context (sender, date stamps, screenshot of a calendar invite, etc.). Do NOT add commentary.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Transcribe everything visible in this image, preserving line breaks and structure. If it is a screenshot of a message, include the sender name and timestamps.',
          },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'auto' } },
        ],
      },
    ],
  });
  return (completion.choices[0]?.message?.content ?? '').trim();
}

/** Build a single text blob from possibly mixed inputs (typed text + file). */
export function composeRawContent(parts: {
  typed?: string;
  file?: FileExtractionResult;
}): string {
  const sections: string[] = [];
  if (parts.file) {
    const header = `[Attached ${parts.file.source.toUpperCase()}: ${parts.file.filename}]`;
    sections.push(`${header}\n${parts.file.text}`);
  }
  if (parts.typed && parts.typed.trim()) {
    sections.push(parts.typed.trim());
  }
  return sections.join('\n\n').trim();
}
