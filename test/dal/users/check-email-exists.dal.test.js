// Test helpers
import * as UserHelper from '../../support/helpers/user.helper.js'

// Thing under test
import CheckEmailExistsDal from '../../../app/dal/users/check-email-exists.dal.js'

describe('DAL - Check email exists dal', () => {
  let email
  let user

  describe('when the user exists', () => {
    beforeAll(async () => {
      user = await UserHelper.add()
      email = user.username
    })

    afterAll(async () => {
      await user.$query().delete()
    })

    it('returns "true"', async () => {
      const result = await CheckEmailExistsDal(email)

      expect(result).toBe(true)
    })
  })

  describe('when the user does not exists', () => {
    beforeAll(() => {
      email = 'doesnotexist@environment-agency.gov.uk'
    })

    it('returns "false"', async () => {
      const result = await CheckEmailExistsDal(email)

      expect(result).toBe(false)
    })
  })
})
