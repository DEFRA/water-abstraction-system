/**
 * Creates a compressed tarball (.tgz) from a given schema folder
 * @module CompressSchemaFolderService
 */

import { tarCreate } from '../../../lib/tar-wrapper.lib.js'

/**
 * Create a compressed tarball (.tgz) from a given schema folder
 *
 * @param {string} schemaFolderPath
 *
 * @returns {Promise<string>} The path to the created tarball file
 */
export default async function compressSchemaFolderService(schemaFolderPath) {
  const file = `${schemaFolderPath}.tgz`

  await tarCreate(
    {
      gzip: true,
      file
    },
    [schemaFolderPath]
  )

  return file
}
