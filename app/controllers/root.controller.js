/**
 * Controller for / endpoints
 * @module RootController
 */

function index(_request, _h) {
  return { status: 'alive' }
}

export {
  index
}
export default {
  index
}
