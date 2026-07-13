// Test framework dependencies

// Test helpers
import YarStub from '../../support/stubs/yar.stub.js'

// Things to stub
import UserModel from '../../../app/models/user.model.js'

// Thing under test
import SubmitProfileDetailsService from '../../../app/services/users/submit-profile-details.service.js'

describe('Users - Submit profile details service', () => {
  const userId = 123

  let patchStub
  let payload
  let userModelQueryStub
  let whereStub
  let yarStub

  beforeEach(() => {
    // NOTE: We stub the UserModel `findById().patch()` query to avoid hitting the DB as part of the test. It is
    // sufficiently simple running it would just be testing Objection.js and not our logic.
    patchStub = vi.fn().mockResolvedValue()
    whereStub = vi.fn().mockReturnValue({ patch: patchStub, whereNull: vi.fn().mockReturnThis() })
    userModelQueryStub = vi.spyOn(UserModel, 'query').mockReturnValue({ where: whereStub })
    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          address: '123 Test St',
          email: 'test@environment-agency.gov.uk',
          jobTitle: 'Developer',
          name: 'Test User',
          tel: '0123456789'
        }
      })

      it('saves the user details', async () => {
        const result = await SubmitProfileDetailsService(userId, payload, yarStub)

        expect(patchStub).toHaveBeenCalled()
        expect(whereStub).toHaveBeenCalledWith('userId', userId)
        expect(patchStub).toHaveBeenCalledWith({
          'userData:contactDetails.address': payload.address,
          'userData:contactDetails.email': payload.email,
          'userData:contactDetails.jobTitle': payload.jobTitle,
          'userData:contactDetails.name': payload.name,
          'userData:contactDetails.tel': payload.tel
        })
        expect(result.navigationLinks).toBeInstanceOf(Array)
      })

      it('flashes a notification of successful update', async () => {
        await SubmitProfileDetailsService(userId, payload, yarStub)

        expect(yarStub.flash.mock.calls[yarStub.flash.mock.calls.length - 1][0]).toEqual('notification')
        expect(yarStub.flash.mock.calls[yarStub.flash.mock.calls.length - 1][1]).toEqual({
          title: 'Updated',
          text: 'Profile details updated'
        })
      })

      describe('and the payload has empty or missing values', () => {
        it('saves missing values as empty strings', async () => {
          await SubmitProfileDetailsService(userId, {}, yarStub)

          expect(patchStub).toHaveBeenCalledWith({
            'userData:contactDetails.address': '',
            'userData:contactDetails.email': '',
            'userData:contactDetails.jobTitle': '',
            'userData:contactDetails.name': '',
            'userData:contactDetails.tel': ''
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {
          email: 'invalidtestemail'
        }
      })

      it('does not save', async () => {
        await SubmitProfileDetailsService(userId, payload, yarStub)

        expect(userModelQueryStub).not.toHaveBeenCalled()
      })

      it('returns the details required to redisplay the page including validation errors', async () => {
        const result = await SubmitProfileDetailsService(userId, payload, yarStub)

        expect(result).toEqual({
          address: '',
          backLink: {
            href: '/',
            text: 'Go back to search'
          },
          email: 'invalidtestemail',
          error: {
            email: {
              text: 'Enter a valid email address'
            },
            errorList: [
              {
                href: '#email',
                text: 'Enter a valid email address'
              }
            ]
          },
          jobTitle: '',
          name: '',
          navigationLinks: [
            {
              active: true,
              href: '/system/users/me/profile-details',
              text: 'Profile details'
            },
            {
              href: '/account/update-password',
              text: 'Change password'
            },
            {
              href: '/signout',
              text: 'Sign out'
            }
          ],
          pageTitle: 'Profile details',
          tel: ''
        })
      })

      it('does not flash a notification', async () => {
        await SubmitProfileDetailsService(userId, payload, yarStub)

        expect(yarStub.flash).not.toHaveBeenCalled()
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
      const error = await SubmitProfileDetailsService(userId, {}, yarStub).catch((e) => {
        return e
      })

      expect(error).toBeDefined()
      expect(error.message).toEqual('Model query error')
    })
  })
})
