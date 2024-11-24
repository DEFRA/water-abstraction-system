'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RegionPresenter = require('../../../../app/presenters/bill-runs/setup/region.presenter.js')

describe('Bill Runs Setup Region presenter', () => {
  const regions = [
    { id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' },
    { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' },
    { id: '3334054e-03b6-4696-9d74-62b8b76a3c64', displayName: 'Westerlands' }
  ]

  let session

  describe('when provided with a bill run setup session record', () => {
    beforeEach(() => {
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: {}
      }
    })

    describe('where the user has not previously selected a bill run region', () => {
      it('correctly presents the data', () => {
        const result = RegionPresenter.go(session, regions)

        expect(result).to.equal({
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          regions,
          selectedRegion: null
        })
      })
    })

    describe('where the user has previously selected a bill run region', () => {
      beforeEach(() => {
        session.region = 'Stormlands'
      })

      it('correctly presents the data', () => {
        const result = RegionPresenter.go(session, regions)

        expect(result).to.equal({
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          regions,
          selectedRegion: 'Stormlands'
        })
      })
    })
  })
})
