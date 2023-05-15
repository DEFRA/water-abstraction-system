'use strict'

/**
 * @module DeleteFileService
 */

const fs = require('fs')

/**
 * Deleting a file
 *
 * @param {String} filePath The file path that we want to delete
 */
async function go (filePath) {
  fs.unlinkSync(filePath)
}

module.exports = {
  go
}
