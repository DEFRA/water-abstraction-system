'use strict'

const Joi = require('joi')

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const { licenceRefSchema } = require('../../../app/validators/helpers/licence-ref-schema.validator.js')

describe('Validators - Helpers - licence ref schema', () => {
  let licenceExists
  let payload

  beforeEach(() => {
    licenceExists = true
    payload = { licenceRef: '123/67' }
  })

  it('confirms the data is valid', () => {
    const schema = Joi.object({ licenceRef: licenceRefSchema(licenceExists) })
    const result = schema.validate(payload, { abortEarly: false })

    expect(result.value).to.exist()
    expect(result.error).not.to.exist()
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

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a licence number')
      })
    })

    describe('because the "licenceRef" does not exist', () => {
      beforeEach(() => {
        licenceExists = false
      })

      it('confirms the data is invalid', () => {
        const schema = Joi.object({ licenceRef: licenceRefSchema(licenceExists) })
        const result = schema.validate(payload, { abortEarly: false })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid licence number')
      })
    })
  })
})
