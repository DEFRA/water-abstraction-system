'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

const LoadService = require('../services/data/load/load.service.js')
const SeedService = require('../services/data/seed/seed.service.js')
const SubmitDeduplicateService = require('../services/data/deduplicate/submit-deduplicate.service.js')
const TearDownService = require('../services/data/tear-down/tear-down.service.js')

async function deduplicate(_request, h) {
  return h.view('data/deduplicate.njk', {
    pageTitle: 'De-duplicate a licence',
    activeNavBar: 'search'
  })
}

async function load(request, h) {
  const result = await LoadService.go(request.payload)

  return h.response(result).code(200)
}

async function seed(_request, h) {
  await SeedService.go()

  return h.response().code(204)
}

async function submitDeduplicate(request, h) {
  const pageData = await SubmitDeduplicateService.go(request.payload)

  if (pageData.error) {
    return h.view('data/deduplicate.njk', {
      pageTitle: 'De-duplicate a licence',
      activeNavBar: 'search',
      ...pageData
    })
  }

  return h.redirect(`/licences?query=${pageData.licenceRef}`)
}

async function tearDown(_request, h) {
  await TearDownService.go()

  return h.response().code(204)
}

module.exports = {
  deduplicate,
  load,
  seed,
  submitDeduplicate,
  tearDown
}
