// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import * as LicenceVersionPresenter from '../../app/presenters/licence-version.presenter.js'

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

        expect(result).toEqual({
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

        expect(result).toEqual({
          hiddenText: 'licence version ending on 31 December 2022',
          href: `/system/licence-versions/${licenceVersion.id}`
        })
      })
    })
  })
})
