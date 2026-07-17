// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import AbstractionPeriodPresenter from '../../../../app/presenters/licence-monitoring-station/setup/abstraction-period.presenter.js'

describe('Abstraction Period Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '356bb545-3e0d-46bd-9df4-d60e1a9eae72',
      abstractionPeriodStartDay: '1',
      abstractionPeriodEndDay: '2',
      abstractionPeriodStartMonth: '3',
      abstractionPeriodEndMonth: '4',
      label: 'LABEL',
      licenceRef: 'LICENCE_REF'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AbstractionPeriodPresenter(session)

      expect(result).toMatchObject({
        abstractionPeriodStartDay: '1',
        abstractionPeriodEndDay: '2',
        abstractionPeriodStartMonth: '3',
        abstractionPeriodEndMonth: '4',
        monitoringStationLabel: 'LABEL',
        pageTitle: 'Enter an abstraction period for licence LICENCE_REF'
      })
    })

    describe('and checkPageVisited is true', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns the back link to the check page', () => {
        const result = AbstractionPeriodPresenter(session)

        expect(result.backLink).toEqual({
          href: `/system/licence-monitoring-station/setup/356bb545-3e0d-46bd-9df4-d60e1a9eae72/check`,
          text: 'Back'
        })
      })
    })

    describe('and checkPageVisited is false', () => {
      beforeEach(() => {
        session.checkPageVisited = false
      })

      it('returns the back link to the full condition page', () => {
        const result = AbstractionPeriodPresenter(session)

        expect(result.backLink).toEqual({
          href: `/system/licence-monitoring-station/setup/356bb545-3e0d-46bd-9df4-d60e1a9eae72/full-condition`,
          text: 'Back'
        })
      })
    })
  })
})
