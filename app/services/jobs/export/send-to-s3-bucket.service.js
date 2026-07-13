/**
 * Sends a file to our AWS S3 bucket
 * @module SendToS3BucketService
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { promises as fsPromises } from 'node:fs'
import { HttpsProxyAgent, HttpProxyAgent } from 'hpagent'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import path from 'node:path'

import serverConfig from '../../../../config/server.config.js'
import S3Config from '../../../../config/s3.config.js'

/**
 * Sends a file to our AWS S3 Bucket using the filePath that it receives
 *
 * @param {string} filePath - A string containing the path of the file to send to the S3 bucket
 */
export default async function (filePath) {
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
function _customConfig() {
  return {
    requestHandler: new NodeHttpHandler({
      // This uses the ternary operator to give either an `http/httpsAgent` object or an empty object, and the spread
      // operator to bring the result back into the top level of the `customConfig` object.
      ...(serverConfig.httpProxy
        ? {
            httpsAgent: new HttpsProxyAgent({ proxy: serverConfig.httpProxy }),
            httpAgent: new HttpProxyAgent({ proxy: serverConfig.httpProxy })
          }
        : {}),
      connectionTimeout: 10000
    })
  }
}

async function _uploadFileToS3Bucket(params) {
  const customConfig = _customConfig()
  const s3Client = new S3Client(customConfig)
  const command = new PutObjectCommand(params)

  await s3Client.send(command)
}
