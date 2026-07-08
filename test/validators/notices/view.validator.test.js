// Thing under test
import ViewValidator from '../../../app/validators/notices/view.validator.js'

describe('Notices - View validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('that is fully populated', () => {
      beforeEach(() => {
        payload = {
          licence: '01/123',
          recipient: 'carol.shaw@atari.co.uk',
          status: 'sent'
        }
      })

      it('confirms the data is valid', () => {
        const result = ViewValidator(payload)

        expect(result.value).toEqual({
          licence: '01/123',
          recipient: 'carol.shaw@atari.co.uk',
          status: 'sent'
        })
        expect(result.error).toBeUndefined()
      })
    })

    describe('that is partially populated', () => {
      beforeEach(() => {
        payload = {
          licence: '01/123'
        }
      })

      it('confirms the data is valid', () => {
        const result = ViewValidator(payload)

        expect(result.value).toEqual({
          licence: '01/123'
        })
        expect(result.error).toBeUndefined()
      })
    })

    describe('that is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('confirms the data is valid', () => {
        const result = ViewValidator(payload)

        expect(result.value).toEqual({})
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    describe('because "Licence" is too long', () => {
      beforeEach(() => {
        payload.licence = 'a'.repeat(26)
      })

      it('fails validation', () => {
        const result = ViewValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error.details[0].message).toEqual('Licence number must be 25 characters or less')
        expect(result.error.details[0].path[0]).toEqual('licence')
      })
    })

    describe('because "Recipient" is too long', () => {
      beforeEach(() => {
        payload.recipient = 'a'.repeat(256)
      })

      it('fails validation', () => {
        const result = ViewValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error.details[0].message).toEqual('Recipient must be 255 characters or less')
        expect(result.error.details[0].path[0]).toEqual('recipient')
      })
    })

    describe('because "Status" is unknown', () => {
      beforeEach(() => {
        payload.status = 'foo'
      })

      it('fails validation', () => {
        const result = ViewValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a valid status type')
        expect(result.error.details[0].path[0]).toEqual('status')
      })
    })
  })
})
