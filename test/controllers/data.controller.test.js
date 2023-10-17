'use strict'

// Things we need to stub
const ExportService = require('../../app/services/data/export/export.service.js')
const MockService = require('../../app/services/data/mock/mock.service.js')
const SeedService = require('../../app/services/data/seed/seed.service.js')
const TearDownService = require('../../app/services/data/tear-down/tear-down.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Data controller', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    server.logger.error = jest.fn().mockResolvedValue()
    // We silence sending a notification to our Errbit instance using Airbrake
    server.app.airbrake.notify = jest.fn().mockResolvedValue()
  })

  describe('GET /data/export', () => {
    const options = {
      method: 'GET',
      url: '/data/export'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        jest.spyOn(ExportService, 'go').mockResolvedValue()
      })

      it('displays the correct message', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(204)
      })
    })
  })

  describe('GET /data/mock', () => {
    const options = {
      method: 'GET',
      url: '/data/mock/licence/32055e54-a17d-4629-837d-5da51390bb47'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        jest.spyOn(MockService, 'go').mockResolvedValue({ data: 'mock' })
      })

      it('displays the correct message', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(200)
        // TODO: test the response object
      })
    })

    describe('when the request fails', () => {
      describe('because the MockService errors', () => {
        beforeEach(async () => {
          jest.spyOn(MockService, 'go').mockRejectedValue(new Error('computer says no'))
        })

        it('returns a 500 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(500)
        })
      })
    })
  })

  describe('POST /data/seed', () => {
    const options = {
      method: 'POST',
      url: '/data/seed'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        jest.spyOn(SeedService, 'go').mockResolvedValue()
      })

      it('displays the correct message', async () => {
        const response = await server.inject(options)
        expect(response.statusCode).toEqual(204)
      })
    })

    describe('when the request fails', () => {
      describe('because the SeedService errors', () => {
        beforeEach(async () => {
          jest.spyOn(SeedService, 'go').mockRejectedValue(new Error('computer says no'))
        })

        it('returns a 500 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(500)
        })
      })
    })
  })

  describe('POST /data/tear-down', () => {
    const options = {
      method: 'POST',
      url: '/data/tear-down'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        jest.spyOn(TearDownService, 'go').mockResolvedValue()
      })

      it('returns a 204 status', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(204)
      })
    })

    describe('when the request fails', () => {
      describe('because the TearDownService errors', () => {
        beforeEach(async () => {
          jest.spyOn(TearDownService, 'go').mockRejectedValue(new Error('computer says no'))
        })

        it('returns a 500 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(500)
        })
      })
    })
  })
})
