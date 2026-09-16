const { Upload } = require("@aws-sdk/lib-storage");
const s3 = require("../config/aws");

async function uploadToS3(buffer, key, contentType = "image/jpeg") {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }
  });

  const result = await upload.done();

  return {
    bucket: process.env.AWS_S3_BUCKET,
    key,
    etag: result.ETag
  };
}

module.exports = {
  uploadToS3
};
