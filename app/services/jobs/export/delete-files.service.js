/**
 * Deletes a folder and its content or an individual file
 * @module DeleteFilesService
 */

import { promises as fsPromises } from 'node:fs'

/**
 * Deletes a folder and its content or an individual file
 *
 * @param {string} path - The folder or file path that we want to delete
 */
async function go(path) {
  try {
    await fsPromises.rm(path, { recursive: true, force: true })
  } catch (error) {
    globalThis.GlobalNotifier.omfg('Delete file service errored', { path }, error)
  }
}

export default {
  go
}
