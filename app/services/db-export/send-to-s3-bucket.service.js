'use strict'

/**
 * Sends a file to our AWS S3 bucket
 * @module SendToS3BucketService
 */

const fs = require('fs')
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
  const bucketName = S3Config.s3.bucket
  const fileName = path.basename(filePath)
  const fileContent = fs.readFileSync(filePath)

  const params = {
    Bucket: bucketName,
    Key: `export/${fileName}`,
    Body: fileContent
  }

  return _uploadToBucket(params, fileName)
}
/**
 * Uploads a file to an Amazon S3 bucket using the given parameters
 *
 * @param {Object} params The parameters to use when uploading the file.
 * @param {String} fileName The name of the file to upload
 *
 * @returns {Boolean} True if the file is uploaded successfully and false if not
 */
async function _uploadToBucket (params, fileName) {
  const s3Client = new S3Client()
  const command = new PutObjectCommand(params)

  try {
    await s3Client.send(command)
    global.GlobalNotifier.omg(`The file ${fileName} was uploaded successfully`)
    return true
  } catch (error) {
    global.GlobalNotifier.omfg(`ERROR uploading file: ${error.message}`)
    return false
  }
}

module.exports = {
  go
}
