/* eslint-disable no-unused-vars, strict, no-undef */

// Controller code
const __SERVICE_NAME__ = require('__SERVICE_PATH__')
const __SUBMIT_NAME__ = require('__SUBMIT_PATH__')

async function __VIEW_SERVICE_NAME__(request, h) {
  const { sessionId } = request.params

  const pageData = await __SERVICE_NAME__.go(sessionId)

  return h.view(`__VIEW_PATH__`, pageData)
}

async function __SUBMIT_SERVICE_NAME__(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await __SUBMIT_NAME__.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`__VIEW_PATH__`, pageData)
  }

  return h.redirect('')
}

// router code

const routes = [
  {
    method: 'GET',
    path: '',
    options: {
      handler: __CONTROLLER_NAME__.__VIEW_SERVICE_NAME__,
      auth: {
        access: {
          scope: ['']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '',
    options: {
      handler: __CONTROLLER_NAME__.__SUBMIT_SERVICE_NAME__,
      auth: {
        access: {
          scope: ['']
        }
      }
    }
  }
]
