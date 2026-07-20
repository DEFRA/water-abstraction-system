// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import UserHelper from '../../support/helpers/user.helper.js'

// Thing under test
import CheckEmailExistsDal from '../../../app/dal/users/check-email-exists.dal.js'

describe('DAL - Check email exists dal', () => {
  let email
  let user

  describe('when a user with the same email exists', () => {
    afterAll(async () => {
      await user.$query().delete()
    })

    describe('and it is an internal account', () => {
      beforeAll(async () => {
        user = await UserHelper.add({ application: 'water_admin' })
        email = user.username
      })

      it('returns "true"', async () => {
        const result = await CheckEmailExistsDal(email)

        expect(result).toBe(true)
      })
    })

    describe('and it is an external account', () => {
      beforeAll(async () => {
        user = await UserHelper.add({ application: 'water_vml' })
        email = user.username
      })

      it('returns "false"', async () => {
        const result = await CheckEmailExistsDal(email)

        expect(result).toBe(false)
      })
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
