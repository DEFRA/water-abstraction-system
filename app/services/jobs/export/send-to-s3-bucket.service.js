'use strict'

/**
 * Sends a file to our AWS S3 bucket
 * @module SendToS3BucketService
 */

const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')
const fsPromises = require('fs').promises
const { HttpsProxyAgent, HttpProxyAgent } = require('hpagent')
const { NodeHttpHandler } = require('@smithy/node-http-handler')
const path = require('path')

const requestConfig = require('../../../../config/request.config.js')
const S3Config = require('../../../../config/s3.config.js')

/**
 * Sends a file to our AWS S3 Bucket using the filePath that it receives
 *
 * @param {string} filePath - A string containing the path of the file to send to the S3 bucket
 */
async function go (filePath) {
  const bucketName = S3Config.s3.bucket
  const fileName = path.basename(filePath)
  const fileContent = await fsPromises.readFile(filePath)
  const params = {
    Bucket: bucketName,
    Key: `export/${fileName}`,
    Body: fileContent
  }

  await _uploadFileToS3Bucket(params)
}

/**
 * Sets the configuration settings for the S3 client
 *
 * If the environment has a proxy then we set that here. The default timeout is 6 minutes but we believe that is far too
 * long to wait. So, we set 'connectionTimeout' to be 10 seconds.
 *
 * @private
 */
function _customConfig () {
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

async function _uploadFileToS3Bucket (params) {
  const customConfig = _customConfig()
  const s3Client = new S3Client(customConfig)
  const command = new PutObjectCommand(params)

  await s3Client.send(command)
}

module.exports = {
  go
}
