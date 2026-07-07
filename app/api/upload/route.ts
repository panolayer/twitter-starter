import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Derive a file extension from the original filename (naive, on purpose).
function extFromName(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot === -1) return 'bin';
  return name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
}

// POST /api/upload (multipart/form-data, field "file") -> { url }.
//
// ⚠️ INTENTIONAL ISSUE (teaching sample):
// This route accepts and writes whatever file is sent WITHOUT validating its
// content-type or size. `validateImageUpload` exists in lib/validation.ts but
// is deliberately NOT called here — Panolayer's rules will flag the missing
// upload validation. The fix is to call `validateImageUpload({ contentType,
// size })` and reject anything that isn't an allowed image within the size cap.
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: { code: 'no_file', message: 'Expected a "file" field.' } },
      { status: 400 },
    );
  }

  // NOTE: no content-type check, no size check — trusts whatever was sent.
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extFromName(file.name || 'upload');
  const filename = `${randomUUID()}.${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url }, { status: 201 });
}
