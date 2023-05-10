'use strict'

const AWS = require('aws-sdk')
const fs = require('fs')
const S3Config = require('../../../config/s3.config')
const path = require('path')

async function go (filePath) {
  const s3 = new AWS.S3()

  const bucketName = `${S3Config.s3.bucket}/export`
  const fileName = path.basename(filePath)
  const fileContent = fs.readFileSync(filePath)

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent
  }

  try {
    const data = await s3.upload(params).promise()
    global.GlobalNotifier.omg(`File was uploaded successfully : ${data.Location}`)
  } catch (error) {
    global.GlobalNotifier.omfg(`ERROR uploading file : ${error}`)
  }
}

module.exports = {
  go
}
