'use strict'

class SessionNotFoundError extends Error {
  constructor() {
    super('The requested setup session no longer exists')
  }
}
module.exports = SessionNotFoundError
