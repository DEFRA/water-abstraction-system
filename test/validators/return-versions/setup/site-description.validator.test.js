'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SiteDescriptionValidator = require('../../../../app/validators/return-versions/setup/site-description.validator.js')

describe('Return Versions Setup - Site Description validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user provided a site description', () => {
      beforeEach(() => {
        payload = {
          siteDescription: 'This is a valid site description'
        }
      })

      it('confirms the payload is valid', () => {
        const result = SiteDescriptionValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user provided no site description', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the error "Enter a description of the site"', () => {
        const result = SiteDescriptionValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a description of the site')
      })
    })

    describe('because the user provided a short site description', () => {
      const invalidSiteDescription = 'Too short'

      beforeEach(() => {
        payload = {
          siteDescription: invalidSiteDescription
        }
      })

      it('fails validation with the error "Site description must be 10 characters or more"', () => {
        const result = SiteDescriptionValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Site description must be 10 characters or more')
      })
    })

    describe('because the user provided a long site description', () => {
      const invalidSiteDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.'

      beforeEach(() => {
        payload = {
          siteDescription: invalidSiteDescription
        }
      })

      it('fails validation with the error "Site description must be 100 characters or less"', () => {
        const result = SiteDescriptionValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Site description must be 100 characters or less')
      })
    })
  })
})
