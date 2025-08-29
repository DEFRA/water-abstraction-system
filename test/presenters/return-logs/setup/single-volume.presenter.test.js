'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SingleVolumePresenter = require('../../../../app/presenters/return-logs/setup/single-volume.presenter.js')

describe('Return Logs Setup - Single Volume presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345',
      units: 'litres'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = SingleVolumePresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/meter-provided',
        pageTitle: 'Is it a single volume?',
        caption: 'Return reference 012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        singleVolume: null,
        singleVolumeQuantity: null,
        units: 'litres'
      })
    })
  })

  describe('the "singleVolume" property', () => {
    describe('when the user has previously selected "yes" to a single volume being provided', () => {
      beforeEach(() => {
        session.singleVolume = 'yes'
      })

      it('returns the "singleVolume" property populated to re-select the option', () => {
        const result = SingleVolumePresenter.go(session)

        expect(result.singleVolume).to.equal('yes')
      })
    })

    describe('when the user has previously selected "no" to a single volume being provided', () => {
      beforeEach(() => {
        session.singleVolume = 'no'
      })

      it('returns the "singleVolume" property populated to re-select the option', () => {
        const result = SingleVolumePresenter.go(session)

        expect(result.singleVolume).to.equal('no')
      })
    })
  })

  describe('the "singleVolumeQuantity" property', () => {
    describe('when the user has previously entered a "singleVolumeQuantity"', () => {
      beforeEach(() => {
        session.singleVolumeQuantity = '1000'
      })

      it('returns the "singleVolumeQuantity" property populated to re-select the option', () => {
        const result = SingleVolumePresenter.go(session)

        expect(result.singleVolumeQuantity).to.equal('1000')
      })
    })
  })

  describe('the "units" property', () => {
    describe('when the "units" property is "cubic-metres"', () => {
      beforeEach(() => {
        session.units = 'cubic-metres'
      })

      it('returns the "units" property presenter correctly', () => {
        const result = SingleVolumePresenter.go(session)

        expect(result.units).to.equal('cubic metres')
      })
    })

    describe('when the "units" property is "litres"', () => {
      beforeEach(() => {
        session.units = 'litres'
      })

      it('returns the "units" property presenter correctly', () => {
        const result = SingleVolumePresenter.go(session)

        expect(result.units).to.equal('litres')
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "meter-details" page', () => {
      beforeEach(() => {
        session.meterProvided = 'yes'
      })

      it('returns a link back to the "meter-details" page', () => {
        const result = SingleVolumePresenter.go(session)

        expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/meter-details')
      })
    })

    describe('when the user has come from the meter-provided', () => {
      beforeEach(() => {
        session.meterProvided = 'no'
      })

      it('returns a link back to the "meter-provided" page', () => {
        const result = SingleVolumePresenter.go(session)

        expect(result.backLink).to.equal(
          '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/meter-provided'
        )
      })
    })
  })
})
