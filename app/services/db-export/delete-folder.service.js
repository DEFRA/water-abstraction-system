'use strict'

/**
 * @module DeleteFolderService
 */

const fs = require('fs')

/**
 * Deleting a folder and its content
 *
 * @param {String} folderPath The folder path that we want to delete
 */
async function go (folderPath) {
  const filesInFolder = fs.readdirSync(folderPath)

  filesInFolder.forEach((file) => {
    const filePath = `${folderPath}/${file}`
    fs.unlinkSync(filePath)
  })

  fs.rmdirSync(folderPath)
}

module.exports = {
  go
}
