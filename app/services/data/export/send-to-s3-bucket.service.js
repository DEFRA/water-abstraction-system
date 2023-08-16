'use strict'

/**
 * Sends a file to our AWS S3 bucket
 * @module SendToS3BucketService
 */

// const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')
const { CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, S3Client, AbortMultipartUploadCommand, PutObjectCommand } = require('@aws-sdk/client-s3')

const S3Config = require('../../../../config/s3.config.js')

/**
 * Sends a file to our AWS S3 Bucket using the filePath that it receives
 *
 * @param {String} filePath A string containing the path of the file to send to the S3 bucket
 */
async function go (filePath) {
  const bucketName = S3Config.s3.bucket
  const fileName = path.basename(filePath)
  const key = `export/${fileName}`
  const file = await fsPromises.readFile(filePath)
  const buffer = Buffer.from(file, 'utf8')

  await _uploadType(buffer, bucketName, key)
}

async function _uploadType (buffer, bucketName, key) {
  if (buffer.length <= 5 * 1024 * 1024) {
    await _uploadSingleFile(bucketName, key, buffer)
  } else {
    await _uploadToBucket(bucketName, key, buffer)
  }
}

async function _uploadSingleFile (bucketName, key, buffer) {
  const s3Client = new S3Client()

  try {
    return await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer
      })
    )
  } catch (error) {
    console.log(error)
  }
}

/**
 * Uploads a file to an Amazon S3 bucket using the given parameters
 *
 * @param {Object} params The parameters to use when uploading the file
 */
async function _uploadToBucket (bucketName, key, buffer) {
  const s3Client = new S3Client({})
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
    console.error(error)

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
