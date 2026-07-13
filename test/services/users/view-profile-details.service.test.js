// Test framework dependencies

// Test helpers
import YarStub from '../../support/stubs/yar.stub.js'

// Things we want to stub
import UserModel from '../../../app/models/user.model.js'

// Thing under test
import ViewProfileDetailsService from '../../../app/services/users/view-profile-details.service.js'

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
  let whereStub
  let yarStub

  beforeEach(() => {
    // NOTE: We stub the UserModel `findById().select()` query to avoid hitting the DB as part of the test. It is
    // sufficiently simple running it would just be testing Objection.js and not our logic.
    selectStub = vi.fn().mockResolvedValue(profileDetails)
    whereStub = vi.fn().mockReturnValue({
      select: selectStub,
      first: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis()
    })

    vi.spyOn(UserModel, 'query').mockReturnValue({ where: whereStub })

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewProfileDetailsService(userId, yarStub)

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
        yarStub = YarStub()
        yarStub.flash.mockReturnValue([testNotification])
      })

      it('returns the notification', async () => {
        const result = await ViewProfileDetailsService(userId, yarStub)

        expect(yarStub.flash).toHaveBeenCalledWith('notification')
        expect(result.notification).toEqual(testNotification)
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      vi.spyOn(UserModel, 'query').mockImplementation(() => {
        throw new Error('Model query error')
      })
    })

    it('throws the error', async () => {
      const error = await ViewProfileDetailsService(userId, yarStub).catch((e) => {
        return e
      })

      expect(error).toBeDefined()
      expect(error.message).toEqual('Model query error')
    })
  })
})
