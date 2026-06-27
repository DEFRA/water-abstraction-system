'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const YarStub = require('../../support/stubs/yar.stub.js')

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

  let selectStub
  let userModelQueryStub
  let whereStub
  let yarStub

  beforeEach(() => {
    // NOTE: We stub the UserModel `findById().select()` query to avoid hitting the DB as part of the test. It is
    // sufficiently simple running it would just be testing Objection.js and not our logic.
    selectStub = Sinon.stub().resolves(profileDetails)
    whereStub = Sinon.stub().returns({
      select: selectStub,
      first: Sinon.stub().returnsThis(),
      limit: Sinon.stub().returnsThis()
    })
    userModelQueryStub = Sinon.stub(UserModel, 'query').returns({ where: whereStub })
    yarStub = YarStub.build(Sinon)
    yarStub.flash.withArgs('notification').returns([])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewProfileDetailsService.go(userId, yarStub)

      expect(result).toEqual({
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        navigationLinks: [
          { active: true, href: '/system/users/me/profile-details', text: 'Profile details' },
          { href: '/account/update-password', text: 'Change password' },
          { href: '/signout', text: 'Sign out' }
        ],
        notification: undefined,
        pageTitle: 'Profile details',
        ...profileDetails
      })
    })

    describe('and there is a notification to be displayed', () => {
      beforeEach(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.flash.withArgs('notification').returns([testNotification])
      })

      it('returns the notification', async () => {
        const result = await ViewProfileDetailsService.go(userId, yarStub)

        expect(yarStub.flash.calledWith('notification')).toBe(true)
        expect(result.notification).toEqual(testNotification)
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      userModelQueryStub.restore()
      Sinon.stub(UserModel, 'query').throws(new Error('Model query error'))
    })

    it('throws the error', async () => {
      const error = await ViewProfileDetailsService.go(userId, yarStub).catch((e) => {
        return e
      })

      expect(error).toBeDefined()
      expect(error.message).toEqual('Model query error')
    })
  })
})
