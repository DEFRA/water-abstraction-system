'use strict'

/**
 * Controller for /signin, /signout and /signed-out authentication endpoints
 * @module AuthenticationController
 */

const SubmitSigninService = require('../services/authentication/submit-signin.service.js')
const SubmitSignoutService = require('../services/authentication/submit-signout.service.js')
const ViewSignedOutService = require('../services/authentication/view-signed-out.service.js')
const ViewSigninService = require('../services/authentication/view-signin.service.js')

async function submitSignin(request, h) {
  const { cookieAuth, payload } = request

  const pageData = await SubmitSigninService.go(payload, cookieAuth, h)

  if (pageData.error) {
    return h.view('authentication/signin.njk', pageData)
  }

  return h.redirect('/')
}

async function submitSignout(request, h) {
  const { payload, yar } = request
  const { id: userId } = request.auth.credentials.user

  const pageData = await SubmitSignoutService.go(userId, payload, yar)

  return h.redirect('/signed-out?u=i')
}

async function viewSignedOut(request, h) {
  const { id: userId } = request.auth.credentials.user

  const pageData = await ViewSignedOutService.go(userId, request.yar)

  return h.view('authentication/signed-out.njk', pageData)
}

async function viewSignin(request, h) {
  // const { id: userId } = request.auth.credentials.user

  const pageData = await ViewSigninService.go()

  return h.view('authentication/signin.njk', pageData)
}

module.exports = {
  submitSignin,
  submitSignout,
  viewSignin,
  viewSignedOut
}
