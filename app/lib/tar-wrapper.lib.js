/**
 * Wraps the `tar` package so its `create()` function can be stubbed in tests
 * @module TarWrapperLib
 */

import * as tar from 'tar'

/**
 * Wraps `tar.create()`
 *
 * `tar` is a genuine ES module, so its exports are non-configurable and cannot be stubbed directly with
 * `vi.spyOn()`. This first-party wrapper gives tests something stubbable to spy on instead.
 *
 * @param {object} options - Options passed straight through to `tar.create()`
 * @param {string[]} fileList - The list of files/folders passed straight through to `tar.create()`
 *
 * @returns {Promise<void>}
 */
export async function tarCreate(options, fileList) {
  return tar.create(options, fileList)
}
