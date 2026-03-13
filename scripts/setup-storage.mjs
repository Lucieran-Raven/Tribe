/**
 * Storage Buckets Setup Script
 * 
 * Run this after linking your Supabase project:
 * npx supabase link --project-ref sgodfejzvhphgeytmujl
 * node scripts/setup-storage.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(s => s.trim()))
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.log('Add this to .env.local:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const buckets = [
  {
    id: 'avatars',
    name: 'avatars',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  {
    id: 'posts',
    name: 'posts',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  {
    id: 'stories',
    name: 'stories',
    public: true,
    fileSizeLimit: 15728640, // 15MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
  }
];

async function setupStorage() {
  console.log('🚀 Setting up storage buckets...\n');

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBucket, error: getError } = await supabase
        .storage
        .getBucket(bucket.id);

      if (getError && getError.message.includes('not found')) {
        // Create bucket
        const { data, error } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes
        });

        if (error) {
          console.error(`❌ Failed to create bucket "${bucket.id}":`, error.message);
          continue;
        }

        console.log(`✅ Created bucket: ${bucket.id}`);
        console.log(`   Public: ${bucket.public}`);
        console.log(`   Max size: ${bucket.fileSizeLimit / 1024 / 1024}MB`);
        console.log(`   Mime types: ${bucket.allowedMimeTypes.join(', ')}\n`);
      } else if (getError) {
        console.error(`❌ Error checking bucket "${bucket.id}":`, getError.message);
        continue;
      } else {
        console.log(`ℹ️  Bucket "${bucket.id}" already exists\n`);
      }
    } catch (err) {
      console.error(`❌ Error with bucket "${bucket.id}":`, err.message);
    }
  }

  console.log('\n✨ Storage setup complete!');
  console.log('\nNext steps:');
  console.log('1. Configure RLS policies in Supabase Dashboard → Storage → Policies');
  console.log('2. Or run the SQL from STORAGE_SETUP.md to set policies via SQL Editor');
}

setupStorage().catch(console.error);
