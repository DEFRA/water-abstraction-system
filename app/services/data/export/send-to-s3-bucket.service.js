'use strict'

/**
 * Sends a file to our AWS S3 bucket
 * @module SendToS3BucketService
 */

const {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  S3Client,
  AbortMultipartUploadCommand,
  PutObjectCommand
} = require('@aws-sdk/client-s3')
const fsPromises = require('fs').promises
const { HttpsProxyAgent, HttpProxyAgent } = require('hpagent')
const { NodeHttpHandler } = require('@smithy/node-http-handler')
const path = require('path')

const requestConfig = require('../../../../config/request.config.js')
const S3Config = require('../../../../config/s3.config.js')

const FIVE_MB_IN_BYTES = 5242880

/**
 * Sends a file to our AWS S3 Bucket using the filePath that it receives and setting the config
 *
 * @param {String} filePath A string containing the path of the file to send to the S3 bucket
 */
async function go (filePath) {
  const bucketName = S3Config.s3.bucket
  const fileName = path.basename(filePath)
  const bucketPath = `export/${fileName}`
  const file = await fsPromises.readFile(filePath)
  const buffer = Buffer.from(file, 'utf8')

  const customConfig = _setCustomConfig()

  if (_singleUpload(buffer)) {
    await _uploadSingleFile(bucketName, bucketPath, buffer, customConfig)
  } else {
    await _uploadMultipartFile(bucketName, bucketPath, buffer, customConfig)
  }
}

/**
 * Completes the multipart upload for the Amazon s3 bucket
 */
async function _completeMultipartUploadCommand (s3Client, bucketName, bucketPath, uploadId, uploadResults) {
  return s3Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: bucketPath,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: uploadResults.map(({ ETag }, i) => ({
          ETag,
          PartNumber: i + 1
        }))
      }
    })
  )
}

/**
 * Creates a multipart upload in our Amazon s3 bucket
 *
 * @returns {String} The uploadId associated with the created multipart upload
 */
async function _createMultipartUpload (s3Client, bucketName, bucketPath) {
  const multipartUpload = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: bucketPath
    })
  )

  return multipartUpload.UploadId
}

/**
 * Sets the configuration settings for the S3 bucket
 *
 * If the environment has a proxy then we set that here. The default timeout is 6 minutes but we believe that is far too
 * long to wait. So, we set 'connectionTimeout' to be 10 seconds.
 *
 * @returns {} Custom configuration settings
 */
function _setCustomConfig () {
  return {
    requestHandler: new NodeHttpHandler({
    // This uses the ternary operator to give either an `http/httpsAgent` object or an empty object, and the spread
    // operator to bring the result back into the top level of the `customConfig` object.
      ...(requestConfig.httpProxy
        ? {
            httpsAgent: new HttpsProxyAgent({ proxy: requestConfig.httpProxy }),
            httpAgent: new HttpProxyAgent({ proxy: requestConfig.httpProxy })
          }
        : {}),
      connectionTimeout: 10000
    })
  }
}

/**
 * Returns the upload type based on its size to the specified S3 bucket
 *
 * AWS S3 bucket have conditions on using multi-part uploads. One of these conditions is the file has to be over 5 MB.
 * Anything under 5MB must be a single upload. By isolating the service in its own file, we can create a stub for
 * testing upload types with the "send-to-S3-bucket" service.
 * {@link https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html S3 multipart upload limits}
 *
 * @param {Buffer} buffer The file content as a buffer object
 *
 * @returns {Boolean} True if the buffer is smaller than 5 MB else false
 */
function _singleUpload (buffer) {
  return buffer.length <= FIVE_MB_IN_BYTES
}

/**
 * Splits the buffer into upload parts and sends them to be uploaded
 *
 * @returns An array of responses from the upload promises for each part.
 */
async function _splitIntoPartsAndUpload (s3Client, bucketName, bucketPath, buffer, uploadId) {
  const uploadPromises = []
  // Each part size needs to be a minimum of 5MB to use multipart upload
  // Calculating how many parts there will be depending on the size of the buffer
  const totalParts = Math.ceil(buffer.length / FIVE_MB_IN_BYTES)

  await _uploadPart(uploadPromises, buffer, totalParts, bucketName, s3Client, bucketPath, uploadId)

  return Promise.all(uploadPromises)
}

/**
 * Uploads a file in multiple parts to the specified S3 bucket with the provided key
 */
async function _uploadMultipartFile (bucketName, bucketPath, buffer, customConfig) {
  const s3Client = new S3Client(customConfig)
  let uploadId

  try {
    const uploadId = await _createMultipartUpload(s3Client, bucketName, bucketPath)

    const uploadResults = await _splitIntoPartsAndUpload(s3Client, bucketName, bucketPath, buffer, uploadId)

    await _completeMultipartUploadCommand(s3Client, bucketName, bucketPath, uploadId, uploadResults)
  } catch (error) {
    global.GlobalNotifier.omfg('Send to S3 errored', error)

    if (uploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: bucketPath,
        UploadId: uploadId
      })
      await S3Client.send(abortCommand)
    }
  }
}
/**
 * Upload all the parts to the AWS s3 bucket
 */
async function _uploadPart (uploadPromises, buffer, totalParts, bucketName, s3Client, bucketPath, uploadId) {
  for (let i = 0; i < totalParts; i++) {
    const start = i * FIVE_MB_IN_BYTES
    const end = Math.min(start + FIVE_MB_IN_BYTES, buffer.length)
    uploadPromises.push(
      s3Client
        .send(
          new UploadPartCommand({
            Bucket: bucketName,
            Key: bucketPath,
            UploadId: uploadId,
            Body: buffer.subarray(start, end),
            PartNumber: i + 1
          })
        )
        .then((response) => {
          // Once the promise is resolved return the response metadata (this includes the ETag)
          return response
        })
    )
  }
}

/**
 * Uploads a single file content to the specified S3 bucket with the provided bucket path
 */
async function _uploadSingleFile (bucketName, bucketPath, buffer, customConfig) {
  const s3Client = new S3Client(customConfig)

  try {
    return await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: bucketPath,
        Body: buffer
      })
    )
  } catch (error) {
    global.GlobalNotifier.omfg('Send to S3 errored', error)
  }
}

module.exports = {
  go
}
