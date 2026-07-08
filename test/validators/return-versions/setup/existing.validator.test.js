// Thing under test
import ExistingValidator from '../../../../app/validators/return-versions/setup/existing.validator.js'

describe('Return Versions Setup - Existing validator', () => {
  const returnVersions = [
    {
      id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
      reason: null,
      startDate: '2023-01-01T00:00:00.000Z'
    },
    {
      id: '22ecef19-3a13-44a0-a55e-8f4d34dd59a5',
      reason: 'major-change',
      startDate: '2024-05-07T00:00:00.000Z'
    }
  ]

  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = ExistingValidator({ existing: '60b5d10d-1372-4fb2-b222-bfac81da69ab' }, returnVersions)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when valid data is provided', () => {
    describe('because no "existing version" is given', () => {
      it('fails validation', () => {
        const result = ExistingValidator({ existing: '' }, returnVersions)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a return version')
      })
    })

    describe('because an unknown "reason" is given', () => {
      it('fails validation', () => {
        const result = ExistingValidator({ existing: 'be1f32a8-599f-4622-ada7-9dd885f5fc80' }, returnVersions)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a return version')
      })
    })
  })
})
