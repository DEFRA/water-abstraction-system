'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we want to stub
const UserModel = require('../../../app/models/user.model.js')

// Thing under test
const ViewProfileDetailsService = require('../../../app/services/users/view-profile-details.service.js')

describe('Users - View profile details service', () => {
  const profileDetails = {
    address: '123 Test St',
    email: 'test@environment-agency.gov.uk',
    jobTitle: 'Developer',
    name: 'Test User',
    tel: '0123456789'
  }
  const testNotification = 'Profile updated!'
  const userId = 123

  let findByIdStub
  let selectStub
  let userModelQueryStub
  let yarStub

  beforeEach(() => {
    // Stub UserModel.query().findById().select()
    selectStub = Sinon.stub().resolves(profileDetails)
    findByIdStub = Sinon.stub().returns({ select: selectStub })
    userModelQueryStub = Sinon.stub(UserModel, 'query').returns({ findById: findByIdStub })
    yarStub = { flash: Sinon.stub().withArgs('notification').returns([]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewProfileDetailsService.go(userId, yarStub)

      expect(result).to.include({ pageTitle: 'Profile details' })
      expect(result).to.include(profileDetails)
    })

    it('returns the correctly selected navigation', async () => {
      const result = await ViewProfileDetailsService.go(userId, yarStub)

      expect(result).to.include('navigationLinks')
      expect(result.navigationLinks).to.equal([
        { active: true, href: '/system/users/me/profile-details', text: 'Profile details' },
        { href: '/account/update-password', text: 'Change password' },
        { href: '/signout', text: 'Sign out' }
      ])
    })

    describe('and there is a notification to be displayed', () => {
      beforeEach(() => {
        yarStub = { flash: Sinon.stub().withArgs('notification').returns([testNotification]) }
      })

      it('returns the notification', async () => {
        const result = await ViewProfileDetailsService.go(userId, yarStub)

        expect(yarStub.flash.calledWith('notification')).to.be.true()
        expect(result.notification).to.equal(testNotification)
      })
    })

    describe('and there is no notification to be displayed', () => {
      it('does not return a notification', async () => {
        const result = await ViewProfileDetailsService.go(userId, yarStub)

        expect(result.notification).to.be.undefined()
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      userModelQueryStub.restore()
      Sinon.stub(UserModel, 'query').throws(new Error('Model query error'))
    })
    it('throws the error', async () => {
      const error = await expect(ViewProfileDetailsService.go(userId, yarStub)).to.reject()

      expect(error).to.exist()
      expect(error.message).to.equal('Model query error')
    })
  })
})
