'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PointsValidator = require('../../../../app/validators/return-versions/setup/points.validator.js')

describe('Return Versions Setup - Point validator', () => {
  describe('when valid data is provided', () => {
    const points = ['c083c0cc-42ca-4917-a929-e1fed906ff66', '90764459-d9af-4e13-850b-cf4299fd5e8a']

    it('confirms the data is valid', () => {
      const result = PointsValidator.go(points)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const points = ['100345']

    it('fails validation', () => {
      const result = PointsValidator.go(points)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select any points for the requirements for returns')
    })
  })

  describe('when no data is provided', () => {
    const points = [undefined]

    it('fails validation', () => {
      const result = PointsValidator.go(points)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select any points for the requirements for returns')
    })
  })
})
