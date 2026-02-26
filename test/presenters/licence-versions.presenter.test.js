'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../app/lib/general.lib.js')

// Thing under test
const LicenceVersionsPresenter = require('../../app/presenters/licence-versions.presenter.js')

describe('Licences versions presenter', () => {
  describe('#formatLicenceVersions()', () => {
    let licenceVersions

    describe('when licence versions', () => {
      describe('have contiguous licence versions', () => {
        beforeEach(() => {
          licenceVersions = [
            {
              id: generateUUID(),
              startDate: new Date('2015-11-06'),
              endDate: new Date('2023-10-02')
            },
            {
              id: generateUUID(),
              startDate: new Date('2002-04-01'),
              endDate: new Date('2015-11-05')
            },
            {
              id: generateUUID(),
              startDate: new Date('1977-04-01'),
              endDate: new Date('2002-03-31')
            }
          ]
        })

        it('returns all the licence versions merged', () => {
          const result = LicenceVersionsPresenter.formatLicenceVersions(licenceVersions)

          expect(result).to.equal([
            {
              id: licenceVersions[0].id,
              endDate: new Date('2023-10-02'),
              startDate: new Date('1977-04-01')
            }
          ])
        })
      })

      describe('have overlapping licence versions (the same start date, end date)', () => {
        beforeEach(() => {
          licenceVersions = [
            {
              id: generateUUID(),
              endDate: new Date('2022-01-03'),
              startDate: new Date('2022-01-02')
            },
            {
              id: generateUUID(),
              endDate: new Date('2022-01-02'),
              startDate: new Date('2022-01-01')
            }
          ]
        })

        it('returns all the licence versions merged', () => {
          const result = LicenceVersionsPresenter.formatLicenceVersions(licenceVersions)

          expect(result).to.equal([
            {
              id: licenceVersions[0].id,
              endDate: new Date('2022-01-03'),
              startDate: new Date('2022-01-01')
            }
          ])
        })
      })

      describe('have non contiguous licence versions', () => {
        beforeEach(() => {
          licenceVersions = [
            {
              id: generateUUID(),
              startDate: new Date('2016-10-06'),
              endDate: new Date('2023-10-02')
            },
            {
              id: generateUUID(),
              startDate: new Date('2002-04-01'),
              endDate: new Date('2015-11-05')
            },
            {
              id: generateUUID(),
              startDate: new Date('1977-04-01'),
              endDate: new Date('2002-03-31')
            }
          ]
        })

        it('returns the licence versions merged into groups', () => {
          const result = LicenceVersionsPresenter.formatLicenceVersions(licenceVersions)

          expect(result).to.equal([
            {
              id: licenceVersions[0].id,
              startDate: new Date('2016-10-06'),
              endDate: new Date('2023-10-02')
            },
            {
              id: licenceVersions[1].id,
              startDate: new Date('1977-04-01'),
              endDate: new Date('2015-11-05')
            }
          ])
        })
      })

      describe('have an older licence version entirely contained within a newer version', () => {
        beforeEach(() => {
          licenceVersions = [
            {
              id: generateUUID(),
              startDate: new Date('2022-01-01'),
              endDate: new Date('2022-01-10')
            },
            {
              id: generateUUID(),
              startDate: new Date('2022-01-05'), // Starts LATER than the one above
              endDate: new Date('2022-01-06') // Ends EARLIER than the one above
            }
          ]
        })

        it('does not shrink the start date to a later date', () => {
          const result = LicenceVersionsPresenter.formatLicenceVersions(licenceVersions)

          expect(result).to.equal([
            {
              id: licenceVersions[0].id,
              startDate: new Date('2022-01-01'),
              endDate: new Date('2022-01-10')
            }
          ])
        })
      })
    })
  })
})
