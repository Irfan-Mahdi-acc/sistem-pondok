import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type UploadArgs = {
  bucket: string
  path: string
  file: ArrayBuffer | Buffer | Uint8Array
  contentType?: string
  cacheControl?: string
}

let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  supabaseAdmin = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  })

  return supabaseAdmin
}

// Track which buckets we've already ensured exist
const ensuredBuckets = new Set<string>()

async function ensureBucketExists(supabase: SupabaseClient, bucketName: string) {
  // Skip if we've already ensured this bucket exists in this session
  if (ensuredBuckets.has(bucketName)) {
    return
  }

  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(b => b.name === bucketName)

  if (!bucketExists) {
    // Create the bucket with public access
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    })

    if (error && !error.message.includes('already exists')) {
      console.error('Failed to create bucket:', error)
      throw new Error(`Failed to create storage bucket: ${error.message}`)
    }
  }

  ensuredBuckets.add(bucketName)
}

export async function uploadToSupabase({ bucket, path, file, contentType, cacheControl }: UploadArgs) {
  const supabase = getSupabaseAdmin()

  // Ensure bucket exists before uploading
  await ensureBucketExists(supabase, bucket)

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    cacheControl: cacheControl ?? '3600',
    contentType,
  })

  if (error) {
    return { success: false as const, error: error.message }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  if (!data?.publicUrl) {
    return { success: false as const, error: 'Failed to resolve Supabase public URL.' }
  }

  return {
    success: true as const,
    url: data.publicUrl,
  }
}

export async function deleteFromSupabase(bucket: string, path: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    return { success: false as const, error: error.message }
  }

  return { success: true as const }
}

