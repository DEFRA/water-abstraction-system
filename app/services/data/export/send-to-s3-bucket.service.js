'use strict'

/**
 * Sends a file to our AWS S3 bucket
 * @module SendToS3BucketService
 */

const { CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, S3Client, AbortMultipartUploadCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const fsPromises = require('fs').promises
const { HttpsProxyAgent, HttpProxyAgent } = require('hpagent')
const { NodeHttpHandler } = require('@smithy/node-http-handler')
const path = require('path')

const requestConfig = require('../../../../config/request.config.js')
const S3Config = require('../../../../config/s3.config.js')
const UploadTypeService = require('../export/upload-type.service.js')

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

  const customConfig = {
    requestHandler: new NodeHttpHandler({
      // This uses the ternary operator to give either an `http/httpsAgent` object or an empty object, and the spread operator to
      // bring the result back into the top level of the `defaultOptions` object.
      ...(requestConfig.httpProxy
        ? {
            httpsAgent: new HttpsProxyAgent({ proxy: requestConfig.httpProxy }),
            httpAgent: new HttpProxyAgent({ proxy: requestConfig.httpProxy })
          }
        : {}),
      connectionTimeout: 10000
    })
  }

  if (UploadTypeService.go(buffer) === 'single upload') {
    await _uploadSingleFile(bucketName, key, buffer, customConfig)
  } else {
    await _uploadToBucket(bucketName, key, buffer, customConfig)
  }
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

/**
 * Uploads a file in multiple parts to the specified S3 bucket with the provided key
 *
 * @param {Buffer} buffer The file content as a buffer object
 * @param {String} bucketName Name of the S3 bucket to upload the file to
 * @param {String} key The path under which the file will be stored in the bucket
 */
async function _uploadToBucket (bucketName, key, buffer, customConfig) {
  const s3Client = new S3Client(customConfig)
  let uploadId

  try {
    const multipartUpload = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: key
      })
    )

    uploadId = multipartUpload.UploadId

    const uploadPromises = []
    const partSize = 5 * 1024 * 1024
    const totalParts = Math.ceil(buffer.length / partSize)

    for (let i = 0; i < totalParts; i++) {
      const start = i * partSize
      const end = Math.min(start + partSize, buffer.length)
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
          .then((d) => {
            return d
          })
      )
    }

    const uploadResults = await Promise.all(uploadPromises)

    return await s3Client.send(
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

module.exports = {
  go
}
