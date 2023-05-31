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
  const filesInFolder = await fsPromises.readdir(folderPath)

  filesInFolder.forEach(async (file) => {
    const filePath = `${folderPath}/${file}`
    await fsPromises.unlink(filePath)
  })

  await fsPromises.rmdir(folderPath)
}

module.exports = {
  go
}
