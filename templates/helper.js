/* eslint-disable no-unused-vars */

// Controller code
import __SERVICE_NAME__ from '__SERVICE_PATH__'
import __SUBMIT_NAME__ from '__SUBMIT_PATH__'

async function __VIEW_SERVICE_NAME__(request, h) {
  const { sessionId } = request.params

  const pageData = await __SERVICE_NAME__(sessionId)

  return h.view(`__VIEW_PATH__`, pageData)
}

async function __SUBMIT_SERVICE_NAME__(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await __SUBMIT_NAME__(sessionId, payload)

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
      handler: __VIEW_SERVICE_NAME__,
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
      handler: __SUBMIT_SERVICE_NAME__,
      auth: {
        access: {
          scope: ['']
        }
      }
    }
  }
]
