/**
 * Cloudflare R2 Verification Script
 * Tests R2 connectivity and basic operations
 */

import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
);

const accountId = env.CLOUDFLARE_ACCOUNT_ID;
const accessKey = env.CLOUDFLARE_R2_ACCESS_KEY;
const secretKey = env.CLOUDFLARE_R2_SECRET_KEY;

const BUCKET_NAME = 'tribe-uploads';
const S3_ENDPOINT = `https://${accountId}.r2.cloudflarestorage.com`;

async function verifyR2() {
  console.log('☁️ Verifying Cloudflare R2 Setup...\n');

  // 1. Check credentials
  console.log('1️⃣ Checking credentials...');
  if (!accountId || !accessKey || !secretKey) {
    console.error('❌ Missing R2 credentials');
    console.log('   Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY');
    return false;
  }
  console.log('   ✅ Credentials found');
  console.log(`   Account ID: ${accountId.slice(0, 8)}...`);
  console.log(`   Endpoint: ${S3_ENDPOINT}`);

  // 2. Initialize S3 client
  console.log('\n2️⃣ Initializing S3 client...');
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true,
  });
  console.log('   ✅ S3 client initialized');

  // 3. Test list operation
  console.log('\n3️⃣ Testing bucket access (list objects)...');
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    });
    const listResult = await s3Client.send(listCommand);
    console.log('   ✅ Bucket accessible');
    console.log(`   Objects in bucket: ${listResult.KeyCount || 0}`);
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log(`   First object: ${listResult.Contents[0].Key}`);
    }
  } catch (error) {
    console.error('   ❌ Failed to access bucket:', error.message);
    if (error.message.includes('NoSuchBucket')) {
      console.log('   💡 Bucket "tribe-uploads" does not exist. Create it in Cloudflare dashboard.');
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.log('   💡 Check your Access Key ID and Secret Key are correct.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   💡 Check your Account ID is correct.');
    }
    return false;
  }

  // 4. Test upload operation
  console.log('\n4️⃣ Testing upload operation...');
  const testKey = `test/verification-${Date.now()}.txt`;
  const testContent = 'Tribe R2 Verification Test';
  
  try {
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    await s3Client.send(uploadCommand);
    console.log('   ✅ Upload successful');
    console.log(`   Test file: ${testKey}`);

    // 5. Cleanup - delete test file
    console.log('\n5️⃣ Cleaning up test file...');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
    });
    await s3Client.send(deleteCommand);
    console.log('   ✅ Cleanup successful');
  } catch (error) {
    console.error('   ❌ Upload failed:', error.message);
    return false;
  }

  // 6. Configuration summary
  console.log('\n6️⃣ Configuration Summary:');
  console.log('   Bucket Name: tribe-uploads');
  console.log('   Region: APAC (Asia-Pacific)');
  console.log('   S3 Endpoint: ' + S3_ENDPOINT);
  console.log('   Public URL Pattern: https://pub-xxx.r2.dev/{key}');

  console.log('\n✅ All R2 checks passed! Ready for production.');
  return true;
}

verifyR2().then(success => {
  if (!success) {
    console.log('\n📋 Troubleshooting:');
    console.log('1. Verify bucket "tribe-uploads" exists in Cloudflare dashboard');
    console.log('2. Check API token has R2 read/write permissions');
    console.log('3. Ensure Account ID matches your Cloudflare account');
    console.log('4. Regenerate Access Key/Secret if needed');
    process.exit(1);
  }
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
