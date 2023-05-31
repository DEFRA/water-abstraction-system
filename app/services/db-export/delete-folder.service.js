'use strict'

/**
 * @module DeleteFolderService
 */

const fsPromises = require('fs').promises

/**
 * Deleting a folder and its content
 *
 * @param {String} folderPath The folder path that we want to delete
 */
async function go (folderPath) {
  await fsPromises.rm(folderPath, { recursive: true })
}

module.exports = {
  go
}
