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
      expect(result).to.include('navigationLinks')
      expect(result.navigationLinks).to.include([
        {
          active: true,
          href: '/system/users/me/profile-details',
          text: 'Profile details'
        }
      ])
      expect(result).to.include(profileDetails)
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

    describe('but the current user is not found', () => {
      beforeEach(() => {
        // Simulate not found: select resolves to null
        selectStub.resolves(null)
      })
      it('does not return data fields (should this error?)', async () => {
        const result = await ViewProfileDetailsService.go(999, yarStub)

        expect(userModelQueryStub.calledOnce).to.be.true()
        expect(findByIdStub.calledWith(999)).to.be.true()
        expect(selectStub.calledOnce).to.be.true()
        expect(result).to.not.include(Object.keys(profileDetails))
      })
    })
  })

  describe('but the database read fails', () => {
    beforeEach(() => {
      userModelQueryStub.restore()
      Sinon.stub(UserModel, 'query').throws(new Error('DB error'))
    })
    it('propagates errors thrown by the database read', async () => {
      let error
      try {
        await ViewProfileDetailsService.go(userId, yarStub)
      } catch (err) {
        error = err
      }
      expect(error).to.exist()
      expect(error.message).to.equal('DB error')
    })
  })
})
