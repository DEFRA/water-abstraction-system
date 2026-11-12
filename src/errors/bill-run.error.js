/**
 * Error thrown when processing a bill run fails, with an optional error code
 *
 * @module BillRunError
 */

export default class BillRunError extends Error {
  constructor(error, code = null) {
    super(error)

    this.code = code
  }
}
