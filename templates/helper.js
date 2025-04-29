/* eslint-disable camelcase, no-unused-vars, strict */

// Controller code
const __SERVICE_NAME__ = require('__SERVICE_PATH__')
const __SUBMIT_NAME__ = require('__SUBMIT_PATH__')

async function view__NAME__(request, h) {
  const { sessionId } = request.params

  const pageData = await __SERVICE_NAME__.go(sessionId)

  return h.view(`__VIEW_PATH__`, pageData)
}

async function submit__NAME__(request, h) {
  const { sessionId } = request.params

  await __SUBMIT_NAME__.go(sessionId)

  return h.redirect('')
}

// router code

const __CONTROLLER_NAME__ = require('__CONTROLLER_PATH__')

const routes = [
  {
    method: 'GET',
    path: '',
    options: {
      handler: __CONTROLLER_NAME__.view__NAME__,
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
      handler: __CONTROLLER_NAME__.submit__NAME__,
      auth: {
        access: {
          scope: ['']
        }
      }
    }
  }
]
