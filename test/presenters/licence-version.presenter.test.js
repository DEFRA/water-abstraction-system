'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceVersionPresenter = require('../../app/presenters/licence-version.presenter.js')

describe('Licence version presenter', () => {
  describe('#linkToLicenceVersion', () => {
    let licenceVersion

    describe('when the licence version does not have an end date', () => {
      beforeEach(() => {
        licenceVersion = {
          id: 'b38da465-2233-4008-8d89-af59c11dd141',
          endDate: null
        }
      })

      it('returns a link object with hidden text "current licence version"', () => {
        const result = LicenceVersionPresenter.linkToLicenceVersion(licenceVersion)

        expect(result).to.equal({
          hiddenText: 'current licence version',
          href: `/system/licence-versions/${licenceVersion.id}`
        })
      })
    })

    describe('when the licence version has an end date', () => {
      beforeEach(() => {
        licenceVersion = {
          id: 'b38da465-2233-4008-8d89-af59c11dd141',
          endDate: new Date('2022-12-31')
        }
      })

      it('returns a link object with hidden text "licence version ending on {end date}"', () => {
        const result = LicenceVersionPresenter.linkToLicenceVersion(licenceVersion)

        expect(result).to.equal({
          hiddenText: 'licence version ending on 31 December 2022',
          href: `/system/licence-versions/${licenceVersion.id}`
        })
      })
    })
  })
})
