'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const SubmitProfileDetailsService = require('../../app/services/users/submit-profile-details.service.js')
const ViewProfileDetailsService = require('../../app/services/users/view-profile-details.service.js')

// Thing under test
const UsersController = require('../../app/controllers/users.controller.js')

describe('UsersController', () => {
  let request, h

  beforeEach(() => {
    request = {
      payload: { some: 'data' },
      yar: { session: 'data' },
      auth: { credentials: { user: { id: 123 } } }
    }
    h = {
      view: Sinon.stub(),
      redirect: Sinon.stub()
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('submitProfileDetails', () => {
    it('should redirect to /system/users/me/profile-details if no error', async () => {
      const pageData = { some: 'data' }
      Sinon.stub(SubmitProfileDetailsService, 'go').resolves(pageData)

      await UsersController.submitProfileDetails(request, h)

      expect(SubmitProfileDetailsService.go.calledWith(123, request.payload, request.yar)).to.be.true()
      expect(h.redirect.calledOnceWith('/system/users/me/profile-details')).to.be.true()
      expect(h.view.notCalled).to.be.true()
    })

    it('should render the profile details view if there is an error', async () => {
      const pageData = { error: 'Some error', other: 'data' }
      Sinon.stub(SubmitProfileDetailsService, 'go').resolves(pageData)

      await UsersController.submitProfileDetails(request, h)

      expect(SubmitProfileDetailsService.go.calledWith(123, request.payload, request.yar)).to.be.true()
      expect(h.view.calledOnceWith('users/profile-details.njk', pageData)).to.be.true()
      expect(h.redirect.notCalled).to.be.true()
    })
  })

  describe('viewProfileDetails', () => {
    it('should render the profile details view with page data', async () => {
      const pageData = { name: 'Test User' }
      Sinon.stub(ViewProfileDetailsService, 'go').resolves(pageData)

      await UsersController.viewProfileDetails(request, h)

      expect(ViewProfileDetailsService.go.calledWith(123, request.yar)).to.be.true()
      expect(h.view.calledOnceWith('users/profile-details.njk', pageData)).to.be.true()
    })
  })
})
