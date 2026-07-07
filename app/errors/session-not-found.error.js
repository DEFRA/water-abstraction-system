class SessionNotFoundError extends Error {
  constructor() {
    super('The requested setup session no longer exists')
  }
}
export default SessionNotFoundError
