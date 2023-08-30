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

/**
 * Sends a file to our AWS S3 Bucket using the filePath that it receives and setting the config
 *
 * @param {String} filePath A string containing the path of the file to send to the S3 bucket
 */
async function go (filePath) {
  const bucketName = S3Config.s3.bucket
  const fileName = path.basename(filePath)
  const key = `export/${fileName}`
  const file = await fsPromises.readFile(filePath)
  const buffer = Buffer.from(file, 'utf8')

  const customConfig = _setCustomConfig()

  if (_singleUpload(buffer) === true) {
    await _uploadSingleFile(bucketName, key, buffer, customConfig)
  } else {
    await _uploadMultipartFile(bucketName, key, buffer, customConfig)
  }
}

/**
 * Completes the multipart upload for the Amazon s3 bucket
 *
 * @param {*} s3Client The AWS s3 client instance used to interact with the service
 * @param {*} bucketName The name of the bucket where the object will be stored
 * @param {*} key The key (path) of the object within the bucket
 * @param {*} uploadId The uploadId associated with the created multipart upload
 * @param {*} uploadResults An array of upload results containing ETag and part number
 */
async function _completeMultipartUploadCommand (s3Client, bucketName, key, uploadId, uploadResults) {
  await s3Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
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
 * @param {*} s3Client The AWS S3 Client instance used to interact with the service
 * @param {String} bucketName The name of the bucket where the object will be stored
 * @param {String} key The key (path) of the object within the bucket
 *
 * @returns {String} The uploadId associated with the created multipart upload
 */
async function _createMultipartUpload (s3Client, bucketName, key) {
  const multipartUpload = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key
    })
  )

  return multipartUpload.UploadId
}

/**
 * Sets the configuration settings for the S3 bucket
 *
 * If the environment has a proxy then we set that here as well. Setting the connectionTimeout to be less than the 10
 * seconds 6 minute standard.
 * @returns {} Custom configuration settings
 */
function _setCustomConfig () {
  return {
    requestHandler: new NodeHttpHandler({
    // This uses the ternary operator to give either an `http/httpsAgent` object or an empty object, and the spread
    // operator to bring the result back into the top level of the `defaultOptions` object.
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
  const FIVE_MEGA_BYTES = 5242880

  return buffer.length <= FIVE_MEGA_BYTES
}

/**
 * Uploads a file in multiple parts to the specified S3 bucket with the provided key
 *
 * @param {Buffer} buffer The file content as a buffer object
 * @param {String} bucketName Name of the S3 bucket to upload the file to
 * @param {String} key The path under which the file will be stored in the bucket
 */
async function _uploadMultipartFile (bucketName, key, buffer, customConfig) {
  const s3Client = new S3Client(customConfig)
  let uploadId

  try {
    const uploadId = await _createMultipartUpload(s3Client, bucketName, key)

    const uploadResults = await _uploadPartCommand(s3Client, bucketName, key, buffer, uploadId)

    await _completeMultipartUploadCommand(s3Client, bucketName, key, uploadId, uploadResults)
  } catch (error) {
    global.GlobalNotifier.omfg('Send to S3 errored', error)

    if (uploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId
      })
      await S3Client.send(abortCommand)
    }
  }
}

/**
 * Uploads a buffer as parts in a multipart upload to an Amazon s3 bucket
 *
 * @param {*} s3Client The AWS S3 Client instance used to interact with the service
 * @param {String} bucketName The name of the bucket where the object will be stored
 * @param {String} key The key (path) of the object within the bucket
 * @param {Buffer} buffer The buffer containing the data to be uploaded in parts
 * @param {String} uploadId The uploadId associated with the created multipart upload
 *
 * @returns An array of responses from the upload promises for each part.
 */
async function _uploadPartCommand (s3Client, bucketName, key, buffer, uploadId) {
  const uploadPromises = []
  // Each part size needs to be a minimum of 5MB to use multipart upload
  const PART_SIZE = 5242880
  // Calculating how many parts there will be depending on the size of the buffer
  const totalParts = Math.ceil(buffer.length / PART_SIZE)

  // Looping through uploading each individual part
  for (let i = 0; i < totalParts; i++) {
    const start = i * PART_SIZE
    const end = Math.min(start + PART_SIZE, buffer.length)
    uploadPromises.push(
      s3Client
        .send(
          new UploadPartCommand({
            Bucket: bucketName,
            Key: key,
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

  return await Promise.all(uploadPromises)
}

/**
 * Uploads a single file content to the specified S3 bucket with the provided key
 *
 * @param {Buffer} buffer The file content as a buffer object
 * @param {String} bucketName Name of the S3 bucket to upload the file to
 * @param {String} key The path under which the file will be stored in the bucket
 */
async function _uploadSingleFile (bucketName, key, buffer, customConfig) {
  const s3Client = new S3Client(customConfig)

  try {
    return await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
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
