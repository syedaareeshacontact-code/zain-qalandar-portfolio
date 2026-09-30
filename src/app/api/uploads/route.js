import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import cloudinary from '@/lib/cloudinary';
import { isAhdNamaUnlocked } from '@/lib/ahdNamaLock';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FILE_RULES = {
  pdf: {
    maxBytes: 20 * 1024 * 1024,
    mimeTypes: new Set(['application/pdf']),
    extensions: new Set(['pdf']),
    resourceType: 'raw',
  },
  image: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: new Set(['image/jpeg', 'image/png', 'image/webp']),
    extensions: new Set(['jpg', 'jpeg', 'png', 'webp']),
    resourceType: 'image',
  },
};

const FOLDERS = {
  'ahd-nama': 'portfolio/ahd-nama',
  cv: 'portfolio/cv',
  notes: 'portfolio/notes',
  portfolio: 'portfolio/assets',
};

function getExtension(fileName = '') {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function getFileKind(file) {
  const extension = getExtension(file.name);

  if (FILE_RULES.pdf.mimeTypes.has(file.type) || FILE_RULES.pdf.extensions.has(extension)) {
    return 'pdf';
  }

  if (FILE_RULES.image.mimeTypes.has(file.type) || FILE_RULES.image.extensions.has(extension)) {
    return 'image';
  }

  return null;
}

function safeFileName(fileName = 'upload') {
  const name = fileName.replace(/\.[^/.]+$/, '');
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return cleaned || 'upload';
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

function jsonError(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

function getCategory(value) {
  return typeof value === 'string' && FOLDERS[value] ? value : 'portfolio';
}

async function requireAhdNamaUnlock(category) {
  if (category !== 'ahd-nama' || await isAhdNamaUnlocked()) return null;
  return jsonError('Ahd Nama is locked. Unlock the archive before accessing its files.', 423);
}

function serializeUpload(upload) {
  return {
    id: upload._id.toString(),
    originalName: upload.originalName,
    category: upload.category,
    documentCategory: upload.documentCategory || '',
    kind: upload.kind,
    secureUrl: upload.secureUrl,
    bytes: upload.bytes,
    createdAt: upload.createdAt,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = getCategory(searchParams.get('category'));
    const lockedResponse = await requireAhdNamaUnlock(category);
    if (lockedResponse) return lockedResponse;
    const kind = searchParams.get('kind');
    const filter = { category };

    if (kind === 'pdf' || kind === 'image') {
      filter.kind = kind;
    }

    const database = await getDatabase();
    const uploads = await database
      .collection('uploads')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ data: uploads.map(serializeUpload) });
  } catch (error) {
    console.error('Upload list route error:', error);
    return jsonError('The uploaded files could not be loaded right now.', 500);
  }
}

export async function POST(request) {
  let uploadedAsset;
  let resourceType;

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return jsonError('Use multipart/form-data with a file field.');
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const categoryValue = formData.get('category');
    const requestedDocumentCategory = formData.get('documentCategory');

    if (!(file instanceof File)) {
      return jsonError('Please select a file to upload.');
    }

    const category = getCategory(categoryValue);
    const lockedResponse = await requireAhdNamaUnlock(category);
    if (lockedResponse) return lockedResponse;
    let documentCategory = '';
    if (category === 'notes' && typeof requestedDocumentCategory === 'string') {
      const database = await getDatabase();
      const categoryRecord = await database.collection('noteCategories').findOne({ slug: requestedDocumentCategory });
      documentCategory = categoryRecord?.slug || '';
    }
    const kind = getFileKind(file);

    if (!kind) {
      return jsonError('Only PDF, JPG, PNG, and WEBP files are allowed.');
    }

    const rules = FILE_RULES[kind];
    const extension = getExtension(file.name);

    if (file.size === 0 || file.size > rules.maxBytes) {
      const limit = kind === 'pdf' ? '20 MB' : '10 MB';
      return jsonError(`This ${kind} must be smaller than ${limit}.`);
    }

    if (file.type && !rules.mimeTypes.has(file.type) && !rules.extensions.has(extension)) {
      return jsonError('The selected file type is not supported.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicId = `${safeFileName(file.name)}-${randomUUID()}`;
    resourceType = rules.resourceType;

    uploadedAsset = await uploadBuffer(buffer, {
      folder: FOLDERS[category],
      public_id: publicId,
      resource_type: rules.resourceType,
      type: 'upload',
      overwrite: false,
      unique_filename: false,
      ...(kind === 'pdf' ? { format: 'pdf' } : {}),
    });

    const uploadRecord = {
      originalName: file.name,
      category,
      documentCategory,
      kind,
      publicId: uploadedAsset.public_id,
      secureUrl: uploadedAsset.secure_url,
      resourceType: uploadedAsset.resource_type,
      format: uploadedAsset.format || extension,
      bytes: file.size,
      createdAt: new Date(),
    };

    const database = await getDatabase();
    const { insertedId } = await database.collection('uploads').insertOne(uploadRecord);

    return NextResponse.json(
      {
        message: 'File uploaded successfully.',
        data: {
          id: insertedId.toString(),
          ...uploadRecord,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedAsset?.public_id) {
      await cloudinary.uploader.destroy(uploadedAsset.public_id, {
        resource_type: resourceType,
        invalidate: true,
      }).catch(() => undefined);
    }

    console.error('Upload route error:', error);
    return jsonError('The file could not be uploaded right now. Please try again.', 500);
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return jsonError('A valid PDF id is required.');
    }

    const database = await getDatabase();
    const uploads = database.collection('uploads');
    const filter = { _id: new ObjectId(id), category: { $in: ['ahd-nama', 'cv', 'notes'] }, kind: 'pdf' };
    const upload = await uploads.findOne(filter);

    if (!upload) {
      return jsonError('That PDF could not be found.', 404);
    }

    const lockedResponse = await requireAhdNamaUnlock(upload.category);
    if (lockedResponse) return lockedResponse;

    await cloudinary.uploader.destroy(upload.publicId, {
      resource_type: upload.resourceType || 'raw',
      invalidate: true,
    });

    await uploads.deleteOne(filter);

    return NextResponse.json({ message: 'PDF deleted successfully.' });
  } catch (error) {
    console.error('Upload delete route error:', error);
    return jsonError('The PDF could not be deleted right now. Please try again.', 500);
  }
}
