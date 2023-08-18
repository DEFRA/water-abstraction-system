'use strict'
/**
 * Checks the buffer size, if less than 5MB upload type is single upload, if greater then 5MB upload type is multipart
 *
 * AWS S3 bucket have conditions on using multi-part uploads. One of these conditions is the file has to be over 5 MB.
 * Anything under 5MB must be a single upload. By isolating the service in its own file, we can create a stub for
 * testing upload types with the "send-to-S3-bucket" service.
 * {@link https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html S3 multipart upload limits}
 *
 * @module UploadTypeService
 */

/**
 * Returns the upload type based on its size to the specified S3 bucket
 *
 * @param {Buffer} buffer The file content as a buffer object
 */
async function go (buffer) {
  if (buffer.length <= 5 * 1024 * 1024) {
    return 'single upload'
  } else {
    return 'multipart upload'
  }
}

module.exports = {
  go
}
