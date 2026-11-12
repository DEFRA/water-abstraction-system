// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import FullConditionPresenter from '../../../../src/presenters/licence-monitoring-station/setup/full-condition.presenter.js'

describe('Full Condition Presenter', () => {
  let conditions
  let session

  beforeEach(() => {
    session = {
      id: '2a1f9931-6821-4441-96f3-b8c0e4847515',
      label: 'My Test Station',
      licenceRef: 'LIC/001'
    }

    conditions = [
      {
        displayTitle: 'First condition title',
        id: 'fec6f0ac-e125-40e1-9926-ee4d8e0652ae',
        notes: 'Some notes.',
        param1: 'P1',
        param2: 'P2'
      },
      {
        displayTitle: 'Second condition title',
        id: '2c1fc38d-17fb-475a-8760-eb3370aae856',
        notes: 'More notes.',
        param1: 'P3',
        param2: 'P4'
      }
    ]
  })

  describe('when called', () => {
    describe('when checkPageVisited is true', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns the back link to the check page', () => {
        const result = FullConditionPresenter(session, conditions)

        expect(result.backLink).toEqual(
          '/system/licence-monitoring-station/setup/2a1f9931-6821-4441-96f3-b8c0e4847515/check'
        )
      })
    })

    describe('when checkPageVisited is false', () => {
      beforeEach(() => {
        session.checkPageVisited = false
      })

      it('returns the back link to the licence number page', () => {
        const result = FullConditionPresenter(session, conditions)

        expect(result.backLink).toEqual(
          '/system/licence-monitoring-station/setup/2a1f9931-6821-4441-96f3-b8c0e4847515/licence-number'
        )
      })
    })

    describe('when there are conditions', () => {
      it('returns the correct page title and monitoring station label', () => {
        const result = FullConditionPresenter(session, conditions)

        expect(result.pageTitle).toEqual('Select the full condition for licence LIC/001')
        expect(result.monitoringStationLabel).toEqual('My Test Station')
      })

      it('formats a list of conditions into radio buttons', () => {
        const result = FullConditionPresenter(session, conditions)

        expect(result.radioButtons).toEqual([
          {
            checked: false,
            hint: {
              text: 'Some notes. (Additional information 1: P1) (Additional information 2: P2)'
            },
            text: 'First condition title 1',
            value: 'fec6f0ac-e125-40e1-9926-ee4d8e0652ae'
          },
          {
            checked: false,
            hint: {
              text: 'More notes. (Additional information 1: P3) (Additional information 2: P4)'
            },
            text: 'Second condition title 2',
            value: '2c1fc38d-17fb-475a-8760-eb3370aae856'
          },
          {
            divider: 'or'
          },
          {
            checked: false,
            text: 'The condition is not listed for this licence',
            value: 'no_condition'
          }
        ])
      })

      describe('and the user has previously selected an option', () => {
        beforeEach(() => {
          session.conditionId = conditions[0].id
        })

        it('marks the option as checked', () => {
          const result = FullConditionPresenter(session, conditions)

          expect(result.radioButtons[0].checked).toBe(true)
        })
      })

      describe('and the user previously selected the not listed', () => {
        beforeEach(() => {
          session.conditionId = 'no_condition'
        })

        it('marks the option as checked', () => {
          const result = FullConditionPresenter(session, conditions)

          expect(result.radioButtons[3].checked).toBe(true)
        })
      })

      describe('when notes and/or params are null', () => {
        beforeEach(() => {
          conditions = [
            {
              displayTitle: 'A null condition',
              id: '03dd7ae6-607b-43bc-a195-3f1692678686',
              notes: null,
              param1: null,
              param2: null
            }
          ]
        })

        it('correctly handles their display', () => {
          const result = FullConditionPresenter(session, conditions)

          expect(result.radioButtons[0]).toEqual({
            checked: false,
            hint: {
              text: '(Additional information 1: None) (Additional information 2: None)'
            },
            text: 'A null condition 1',
            value: '03dd7ae6-607b-43bc-a195-3f1692678686'
          })
        })
      })
    })

    describe('when there are no conditions', () => {
      beforeEach(() => {
        conditions = []
      })

      it('returns the correct page title and monitoring station label', () => {
        const result = FullConditionPresenter(session, conditions)

        expect(result.pageTitle).toEqual('There are no flow or level cessation conditions for licence LIC/001')
        expect(result.monitoringStationLabel).toEqual('My Test Station')
      })

      it('returns no radio buttons', () => {
        const result = FullConditionPresenter(session, [])

        expect(result.radioButtons).toHaveLength(0)
      })
    })
  })
})
