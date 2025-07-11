'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const FullConditionPresenter = require('../../../../app/presenters/licence-monitoring-station/setup/full-condition.presenter.js')

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
        id: 'fec6f0ac-e125-40e1-9926-ee4d8e0652ae',
        displayTitle: 'First condition title',
        notes: 'Some notes.',
        param1: 'P1',
        param2: 'P2'
      },
      {
        id: '2c1fc38d-17fb-475a-8760-eb3370aae856',
        displayTitle: 'Second condition title',
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
        const result = FullConditionPresenter.go(session, conditions)

        expect(result.backLink).to.equal(
          '/system/licence-monitoring-station/setup/2a1f9931-6821-4441-96f3-b8c0e4847515/check'
        )
      })
    })

    describe('when checkPageVisited is false', () => {
      beforeEach(() => {
        session.checkPageVisited = false
      })

      it('returns the back link to the licence number page', () => {
        const result = FullConditionPresenter.go(session, conditions)

        expect(result.backLink).to.equal(
          '/system/licence-monitoring-station/setup/2a1f9931-6821-4441-96f3-b8c0e4847515/licence-number'
        )
      })
    })

    describe('when there are conditions', () => {
      it('returns the correct page title and monitoring station label', () => {
        const result = FullConditionPresenter.go(session, conditions)

        expect(result.pageTitle).to.equal('Select the full condition for licence LIC/001')
        expect(result.monitoringStationLabel).to.equal('My Test Station')
      })

      it('formats a list of conditions into radio buttons', () => {
        const result = FullConditionPresenter.go(session, conditions)

        expect(result.radioButtons).to.equal([
          {
            value: 'fec6f0ac-e125-40e1-9926-ee4d8e0652ae',
            text: 'First condition title 1',
            hint: {
              text: 'Some notes. (Additional information 1: P1) (Additional information 2: P2)'
            },
            checked: false
          },
          {
            value: '2c1fc38d-17fb-475a-8760-eb3370aae856',
            text: 'Second condition title 2',
            hint: {
              text: 'More notes. (Additional information 1: P3) (Additional information 2: P4)'
            },
            checked: false
          },
          {
            divider: 'or'
          },
          {
            value: 'no_condition',
            text: 'The condition is not listed for this licence',
            checked: false
          }
        ])
      })

      describe('and the user has previously selected an option', () => {
        beforeEach(() => {
          session.conditionId = conditions[0].id
        })

        it('marks the option as checked', () => {
          const result = FullConditionPresenter.go(session, conditions)

          expect(result.radioButtons[0].checked).to.be.true()
        })
      })

      describe('and the user previously selected the not listed', () => {
        beforeEach(() => {
          session.conditionId = 'no_condition'
        })

        it('marks the option as checked', () => {
          const result = FullConditionPresenter.go(session, conditions)

          expect(result.radioButtons[3].checked).to.be.true()
        })
      })

      describe('when notes and/or params are null', () => {
        beforeEach(() => {
          conditions = [
            {
              id: '03dd7ae6-607b-43bc-a195-3f1692678686',
              displayTitle: 'A null condition',
              notes: null,
              param1: null,
              param2: null
            }
          ]
        })

        it('correctly handles their display', () => {
          const result = FullConditionPresenter.go(session, conditions)

          expect(result.radioButtons[0]).to.equal({
            value: '03dd7ae6-607b-43bc-a195-3f1692678686',
            text: 'A null condition 1',
            hint: {
              text: '(Additional information 1: None) (Additional information 2: None)'
            },
            checked: false
          })
        })
      })
    })

    describe('when there are no conditions', () => {
      beforeEach(() => {
        conditions = []
      })

      it('returns the correct page title and monitoring station label', () => {
        const result = FullConditionPresenter.go(session, conditions)

        expect(result.pageTitle).to.equal('There are no flow or level cessation conditions for licence LIC/001')
        expect(result.monitoringStationLabel).to.equal('My Test Station')
      })

      it('returns no radio buttons', () => {
        const result = FullConditionPresenter.go(session, [])

        expect(result.radioButtons).to.be.empty()
      })
    })
  })
})
