'use strict'

/**
 * Creates a compressed tarball (.tgz) from a given schema folder
 * @module CompressedTarballService
 */

const tar = require('tar')

/**
 * Create a compressed tarball (.tgz) from a given schema folder
 * @param {String} schemaFolderPath
 *
 * @returns {String} The path to the created tarball file
 */
async function go (schemaFolderPath) {
  await tar.create(
    {
      gzip: true,
      file: `${schemaFolderPath}.tgz`
    },
    [schemaFolderPath]
  )
  return `${schemaFolderPath}.tgz`
}

module.exports = {
  go
}
