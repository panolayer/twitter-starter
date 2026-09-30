import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Derive the stored extension from the original filename.
function extFromName(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot === -1) return 'bin';
  return name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: { code: 'no_file', message: 'Expected a "file" field.' } },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extFromName(file.name || 'upload');
  const filename = `${randomUUID()}.${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url }, { status: 201 });
}
