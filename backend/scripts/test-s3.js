require('dotenv').config(); // Loads .env
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

console.log('Attempting to connect to S3...');

s3.listBuckets((err, data) => {
  if (err) {
    console.error("❌ Connection Failed:", err);
  } else {
    console.log("✅ Connection Successful!");
    console.log("Buckets found:", data.Buckets.map(b => b.Name));
    
    const myBucket = data.Buckets.find(b => b.Name === process.env.AWS_BUCKET_NAME);
    if (myBucket) {
      console.log(`✅ Targeted bucket '${process.env.AWS_BUCKET_NAME}' exists.`);
    } else {
      console.error(`❌ Could not find bucket '${process.env.AWS_BUCKET_NAME}' in this account.`);
    }
  }
});