'use strict'

/**
 * Uploads a folders worth of files to our S3 bucket
 * @module SendToS3BucketService
 */

const fsPromises = require('fs').promises
const path = require('path')
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')

const S3Config = require('../../../config/s3.config.js')

/**
 * Sends a schema folder with table files in to our AWS S3 Bucket using the folderPath that it receives
 *
 * @param {String} folderPath A string containing the path of the folder to send to the S3 bucket
 *
 * @returns {Boolean} True if the folder is uploaded successfully and false if not
 */
async function go (folderPath) {
  const bucketName = S3Config.s3.bucket
  const folderName = path.basename(folderPath)

  const files = await _getFilesFromFolder(folderPath)

  for (const file of files) {
    try {
      await _uploadToBucket(bucketName, folderName, file)
    } catch (error) {
      return false
    }
  }
  return true
}

/**
 * Retrieves all the files within a folder
 *
 * @param {String} folderPath A string containing the path of the folder
 *
 * @returns {[]} An array of file paths within the folder
 */
async function _getFilesFromFolder (folderPath) {
  const files = await fsPromises.readdir(folderPath)

  return files.map((file) => {
    return path.join(folderPath, file)
  })
}

/**
 * Uploads a file to an Amazon S3 bucket using the given parameters
 *
 * @param {Object} bucketName The name of the bucket we want to upload to
 * @param {String} folderName The name of the folder to upload
 * @param {String} filePath The path of the individual file to upload
 *
 * @returns {Boolean} True if the file is uploaded successfully and false if not
 */
async function _uploadToBucket (bucketName, folderName, filePath) {
  const fileName = path.basename(filePath)
  const fileContent = await fsPromises.readFile(filePath)

  const params = {
    Bucket: bucketName,
    Key: `export/${folderName}/${fileName}`,
    Body: fileContent
  }

  const s3Client = new S3Client()
  const command = new PutObjectCommand(params)

  await s3Client.send(command)
}

module.exports = {
  go
}
