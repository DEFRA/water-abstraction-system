/**
 * Creates a compressed tarball (.tgz) from a given schema folder
 * @module CompressSchemaFolderService
 */

import * as tar from 'tar'

/**
 * Create a compressed tarball (.tgz) from a given schema folder
 *
 * @param {string} schemaFolderPath
 *
 * @returns {Promise<string>} The path to the created tarball file
 */
export default async function compressSchemaFolder(schemaFolderPath) {
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
