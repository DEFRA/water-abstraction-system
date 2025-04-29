'use strict'

// Controller code
const __SERVICE_NAME__ = require('__SERVICE_PATH__')

async function view__NAME__(request, h) {
  const { eventId } = request.params

  const pageData = await __SERVICE_NAME__.go(eventId)

  return h.view(`__VIEW_PATH__`, pageData)
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
  }
]
