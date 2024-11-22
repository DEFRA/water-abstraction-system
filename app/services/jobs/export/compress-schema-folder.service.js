'use strict'

/**
 * Creates a compressed tarball (.tgz) from a given schema folder
 * @module CompressSchemaFolderService
 */

const tar = require('tar')

/**
 * Create a compressed tarball (.tgz) from a given schema folder
 *
 * @param {string} schemaFolderPath
 *
 * @returns {Promise<string>} The path to the created tarball file
 */
async function go(schemaFolderPath) {
  const file = `${schemaFolderPath}.tgz`

  await tar.create(
    {
      gzip: true,
      file
    },
    [schemaFolderPath]
  )

  return file
}

module.exports = {
  go
}
