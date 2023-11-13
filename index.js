const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
} = require('@aws-sdk/client-s3');

const fs = require('fs');
require('dotenv').config();

const clientS3config = {
  apiVersion: '2006-03-01',
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

const bucketName = process.env.BUCKET_NAME;

const listBucketObjects = async (client) => {
  const command = new ListObjectsCommand({ Bucket: bucketName });
  const objects = await client.send(command);
  return objects.Contents;
};

const getObjectUrl = async (client, objectKey) => {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return url;
};

(async () => {
  const output = [];
  const client = new S3Client(clientS3config);
  const objects = await listBucketObjects(client);

  for (let object of objects) {
    output.push({
      file: object.Key,
      url: await getObjectUrl(client, object.Key),
    });
  }
  fs.writeFileSync('./output.json', JSON.stringify(output, null, 2));
})();
