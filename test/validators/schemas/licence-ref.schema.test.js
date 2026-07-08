import Joi from 'joi'

// Thing under test
import { licenceRefSchema } from '../../../app/validators/schemas/licence-ref.schema.js'

describe('Validators - Schema - licence ref schema', () => {
  let licenceExists
  let payload

  beforeEach(() => {
    licenceExists = true
    payload = { licenceRef: '123/67' }
  })

  it('confirms the data is valid', () => {
    const schema = Joi.object({ licenceRef: licenceRefSchema(licenceExists) })
    const result = schema.validate(payload, { abortEarly: false })

    expect(result.value).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  describe('when invalid data is provided', () => {
    describe('because a "licenceRef" has not been provided', () => {
      beforeEach(() => {
        licenceExists = false
        payload = { licenceRef: '' }
      })

      it('confirms the data is invalid', () => {
        const schema = Joi.object({ licenceRef: licenceRefSchema(licenceExists) })
        const result = schema.validate(payload, { abortEarly: false })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a licence number')
      })
    })

    describe('because the "licenceRef" does not exist', () => {
      beforeEach(() => {
        licenceExists = false
      })

      it('confirms the data is invalid', () => {
        const schema = Joi.object({ licenceRef: licenceRefSchema(licenceExists) })
        const result = schema.validate(payload, { abortEarly: false })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a valid licence number')
      })
    })
  })
})
