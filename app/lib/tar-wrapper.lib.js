/**
 * Wraps `tar.create()` so it can be stubbed in tests
 *
 * `tar` is a genuine ES module, so its exports are non-configurable and cannot be stubbed directly with
 * `vi.spyOn()`. This first-party wrapper gives tests something stubbable to spy on instead.
 * @module TarWrapperLib
 */

import * as tar from 'tar'

/**
 * Creates a tarball, passing its arguments straight through to `tar.create()`
 *
 * @param {object} options
 * @param {string[]} fileList
 *
 * @returns {Promise<void>}
 */
export async function tarCreate(options, fileList) {
  return tar.create(options, fileList)
}
