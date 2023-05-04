'use strict'

/**
 * Compresses a file at a specified path using gzip
 * @module CompressFilesService
 */

const fs = require('fs')
const { pipeline } = require('node:stream')
const { promisify } = require('node:util')
const zlib = require('node:zlib')

/**
 * Compresses a file using gzip and writes the compressed data to a new file with a '.gz' extension
 *
 * @param {String} filePath A string containing the file path that will be compressed
 *
 * @returns {Boolean} True if the file is compressed successfully and false if not
 */
async function go (filePath) {
  try {
    await compressFile(filePath)
    global.GlobalNotifier.omg(`${filePath} successfully compressed to gzip.`)

    return true
  } catch (error) {
    global.GlobalNotifier.omfg(`ERROR: ${filePath} did not successfully compress to gzip.`)

    return false
  }
}

async function compressFile (filePath) {
  if (fs.existsSync(filePath)) {
    const readStream = fs.createReadStream(filePath)
    const writeStream = fs.createWriteStream(`${filePath}.gz`)
    const compress = zlib.createGzip()

    const pipe = promisify(pipeline)

    await pipe(readStream, compress, writeStream)
  } else {
    throw new Error('File to compress does not exist')
  }
}

module.exports = {
  go
}
