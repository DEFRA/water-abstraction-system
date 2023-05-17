'use strict'

/**
 * Compresses a file at a specified path using gzip
 * @module CompressFilesService
 */

const fs = require('node:fs')
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
  if (!fs.existsSync(filePath)) {
    return false
  }

  await _compressFile(filePath)

  return `${filePath}.gz`
}

async function _compressFile (filePath) {
  const readStream = fs.createReadStream(filePath)
  const writeStream = fs.createWriteStream(`${filePath}.gz`)
  const compress = zlib.createGzip()

  const pipe = promisify(pipeline)

  await pipe(readStream, compress, writeStream)
}

module.exports = {
  go
}
