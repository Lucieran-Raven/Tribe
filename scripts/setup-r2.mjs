/**
 * Cloudflare R2 Setup Script
 * Creates bucket and configures CORS automatically
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(s => s.trim()))
);

const accountId = env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = env.CLOUDFLARE_R2_API_TOKEN; // R2 Account Token for API
const accessKey = env.CLOUDFLARE_R2_ACCESS_KEY; // S3 Access Key
const secretKey = env.CLOUDFLARE_R2_SECRET_KEY; // S3 Secret Key

if (!accountId || !apiToken || !accessKey || !secretKey) {
  console.error('❌ Missing Cloudflare R2 credentials in .env.local');
  console.log('Required:');
  console.log('  CLOUDFLARE_ACCOUNT_ID=xxx');
  console.log('  CLOUDFLARE_R2_API_TOKEN=xxx');
  console.log('  CLOUDFLARE_R2_ACCESS_KEY=xxx');
  console.log('  CLOUDFLARE_R2_SECRET_KEY=xxx');
  process.exit(1);
}

async function setupR2() {
  console.log('☁️ Setting up Cloudflare R2...\n');

  // Cloudflare API endpoints for R2
  const apiBase = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2`;

  try {
    // List existing buckets
    const listRes = await fetch(`${apiBase}/buckets`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!listRes.ok) {
      const error = await listRes.text();
      console.error('❌ Failed to list buckets:', error);
      return;
    }

    const { result: buckets } = await listRes.json();
    const bucketExists = buckets?.find(b => b.name === 'tribe-uploads');

    if (bucketExists) {
      console.log('✅ Bucket "tribe-uploads" already exists');
    } else {
      console.log('🪣 Creating bucket "tribe-uploads"...');
      
      const createRes = await fetch(`${apiBase}/buckets`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'tribe-uploads' })
      });

      if (!createRes.ok) {
        const error = await createRes.text();
        console.error('❌ Failed to create bucket:', error);
        console.log('\n📋 Manual setup required:');
        console.log('1. Go to https://dash.cloudflare.com');
        console.log('2. Navigate to R2 Object Storage');
        console.log('3. Create bucket named "tribe-uploads"');
        return;
      }

      console.log('✅ Bucket "tribe-uploads" created');
    }

    // Configure CORS
    console.log('\n📋 CORS Configuration:');
    console.log('Add to bucket settings:');
    console.log(JSON.stringify({
      CORSRules: [
        {
          AllowedOrigins: ['http://localhost:3000', 'https://yourdomain.com'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
          AllowedHeaders: ['*'],
          MaxAgeSeconds: 3600
        }
      ]
    }, null, 2));

    console.log('\n✨ R2 setup complete!');
    console.log('\nNext steps:');
    console.log('1. Add bucket CORS in Cloudflare Dashboard');
    console.log('2. Configure custom domain (optional)');
    console.log('3. Test upload with: npm run dev');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 Manual setup guide: CLOUDFLARE_R2_SETUP.md');
  }
}

setupR2();
