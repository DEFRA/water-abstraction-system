// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import LicenceNumberPresenter from '../../../../app/presenters/licence-monitoring-station/setup/licence-number.presenter.js'

describe('Licence Monitoring Station Setup - Licence Number Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      label: 'LABEL',
      licenceRef: 'LICENCE_REF',
      id: 'd9afac37-9754-4bfa-95f7-87ab26824423'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicenceNumberPresenter(session)

      expect(result).toMatchObject({
        licenceRef: 'LICENCE_REF',
        monitoringStationLabel: 'LABEL',
        pageTitle: 'Enter the licence number this threshold applies to'
      })
    })

    describe('when checkPageVisited is true', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns the back link to the check page', () => {
        const result = LicenceNumberPresenter(session)

        expect(result.backLink).toEqual(
          `/system/licence-monitoring-station/setup/d9afac37-9754-4bfa-95f7-87ab26824423/check`
        )
      })
    })

    describe('when checkPageVisited is false', () => {
      beforeEach(() => {
        session.checkPageVisited = false
      })

      it('returns the back link to the stop or reduce page', () => {
        const result = LicenceNumberPresenter(session)

        expect(result.backLink).toEqual(
          `/system/licence-monitoring-station/setup/d9afac37-9754-4bfa-95f7-87ab26824423/stop-or-reduce`
        )
      })
    })
  })
})
