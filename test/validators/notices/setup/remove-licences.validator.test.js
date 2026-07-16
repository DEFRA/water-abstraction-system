// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import RemoveLicencesValidator from '../../../../app/validators/notices/setup/remove-licences.validator.js'

describe('Notices - Setup - Remove Licences validator', () => {
  let licenceRefsWithDueReturns
  let payload

  beforeEach(() => {
    licenceRefsWithDueReturns = ['123/67']
  })

  describe('when licences are valid to be removed', () => {
    beforeEach(() => {
      payload = { removeLicences: '123/67' }
    })

    it('confirms the data is valid', () => {
      const result = RemoveLicencesValidator(payload, licenceRefsWithDueReturns)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because a licence is not a valid licence to be removed', () => {
      beforeEach(() => {
        payload = { removeLicences: '01/123' }
      })

      it('fails validation', () => {
        const result = RemoveLicencesValidator(payload, licenceRefsWithDueReturns)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('There are no returns due for licence 01/123')
      })
    })

    describe('because multiple licences are not valid licences to be removed', () => {
      beforeEach(() => {
        payload = { removeLicences: '01/123,678' }
      })

      it('fails validation', () => {
        const result = RemoveLicencesValidator(payload, licenceRefsWithDueReturns)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('There are no returns due for licences 01/123, 678')
      })
    })
  })
})
