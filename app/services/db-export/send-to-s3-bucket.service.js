'use strict'

/**
 * Sends a file to our AWS S3 bucket
 * @module SendToS3BucketService
 */

const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')

const S3Config = require('../../../config/s3.config.js')

/**
 * Sends a file to our AWS S3 Bucket using the filePath that it receives
 *
 * @param {String} filePath A string containing the path of the file to send to the S3 bucket
 *
 * @returns {Boolean} True if the file is uploaded successfully and false if not
 */
async function go (filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error()
  }

  const bucketName = S3Config.s3.bucket
  const fileName = path.basename(filePath)
  const fileContent = await fsPromises.readFile(filePath)
  const params = {
    Bucket: bucketName,
    Key: `export/${fileName}`,
    Body: fileContent
  }

  await _uploadToBucket(params)
}

/**
 * Uploads a file to an Amazon S3 bucket using the given parameters
 *
 * @param {Object} params The parameters to use when uploading the file
 * @param {String} fileName The name of the file to upload
 *
 * @returns {Boolean} True if the file is uploaded successfully and false if not
 */
async function _uploadToBucket (params) {
  const s3Client = new S3Client()
  const command = new PutObjectCommand(params)

  await s3Client.send(command)
}

module.exports = {
  go
}
