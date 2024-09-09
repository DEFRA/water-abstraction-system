'use strict'

/**
 * Fetches a licence's abstraction data and generates setup return requirements from it
 * @module GenerateFromAbstractionDataService
 */

const FetchAbstractionDataService = require('./fetch-abstraction-data.service.js')

const SUMMER_RETURN_CYCLE = 'summer'
const WINTER_RETURN_CYCLE = 'winter-and-all-year'

const DAILY_CUBIC_METRES_THRESHOLD = 2500

const TWO_PART_IRRIGATION_IDS = ['380', '390', '400', '410', '420', '600', '620']

/**
 * Fetches a licence's abstraction data and generates setup return requirements from it
 *
 * During the return requirements setup journey we offer users the option of setting up the new requirements using the
 * current abstraction data against the licence.
 *
 * Specifically, we look to the licence's current licence version, which in turn is linked to one or more licence
 * version purposes. For each one of these we create a return requirement setup object.
 *
 * Note, we are not creating a `return_requirement` record but an object that matches what the setup journey expects.
 * This means the requirements will display correctly in the `/check` page, and users can amend the values using the
 * 'Change' links shown.
 *
 * @param {string} licenceId - The UUID of the licence to fetch abstraction data from and generate return requirements
 *
 * @returns {Promise<object[]>} an array of return requirements generated from the licence's abstraction and ready to
 * be persisted to the setup session
 */
async function go (licenceId) {
  const licence = await FetchAbstractionDataService.go(licenceId)

  return _transformForSetup(licence)
}

/**
 * The only agreement recorded against the licence that maps to an option we display in the journey is S127 (two-part
 * tariff). `_fetch()` extracts whether a licence has an S127 financial agreement and returns it as
 * `twoPartTariffAgreement true|false`.
 *
 * Because a user can select multiple agreements or exceptions we return it as an array. If none apply you have to
 * explicitly select it as well. Hence, we return that as an option so that the view can pre-select it should a user
 * return to the page to make changes.
 *
 * @private
 */
function _agreementExceptions (licence) {
  const { twoPartTariffAgreement } = licence

  if (twoPartTariffAgreement) {
    return ['two-part-tariff']
  }

  return ['none']
}

/**
 * Determine what the returns cycle will be, based on the purpose's abstraction period
 *
 * If the abstraction period is wholly within 1 April to 31 October then it is 'summer'. Else it is
 * 'winter-and-all-year'.
 *
 * Fortunately, to confirm this we don't have to look at the day, we can just check the months involved!
 *
 * @private
 */
function _returnsCycle (startMonth, endMonth) {
  const summerMonths = [4, 5, 6, 7, 8, 9, 10]

  // If the start month is after the end month it can't be within April to October
  if (startMonth > endMonth) {
    return WINTER_RETURN_CYCLE
  }

  // If the start month is not one of the summer months it can't be wholly in 'summer'
  if (!summerMonths.includes(startMonth)) {
    return WINTER_RETURN_CYCLE
  }

  // If the end month is not one of the summer months it can't be wholly in 'summer'
  if (!summerMonths.includes(endMonth)) {
    return WINTER_RETURN_CYCLE
  }

  // If we get to here, we're wholly in summer!
  return SUMMER_RETURN_CYCLE
}

/**
 * Determine the collection frequencies for the return requirement
 *
 * This logic is derived from a table which aims to identify what collection and reporting frequencies to use based on
 * various factors
 *
 * ### Water company & Electricity generation
 *
 * |CM per day|Collection|Reporting|
 * |----------|----------|---------|
 * |Below 100 |Daily     |Daily    |
 * |100 - 2500|Daily     |Daily    |
 * |Above 2500|Daily     |Daily    |
 *
 * ### Irrigation with two-part tariff (purpose is 2PT _and_ licence has 2PT agreement)
 *
 * |CM per day|Collection|Reporting|
 * |----------|----------|---------|
 * |Below 100 |Daily     |Monthly  |
 * |100 - 2500|Daily     |Monthly  |
 * |Above 2500|Daily     |Weekly   |
 *
 * ### Everything else
 *
 * |CM per day|Collection|Reporting|
 * |----------|----------|---------|
 * |Below 100 |Monthly   |Monthly  |
 * |100 - 2500|Monthly   |Monthly  |
 * |Above 2500|Weekly    |Weekly   |
 *
 * @private
 */
function _frequencyCollected (licence, licenceVersionPurpose) {
  const { twoPartTariffAgreement, waterUndertaker } = licence
  const { dailyQuantity, purpose } = licenceVersionPurpose

  // Licensee is a water company or the purpose is for electricity generation
  if (waterUndertaker || licenceVersionPurpose.$electricityGeneration()) {
    return 'day'
  }

  // Licensee has a two-part tariff agreement and the purpose is two-part tariff
  if (twoPartTariffAgreement && TWO_PART_IRRIGATION_IDS.includes(purpose.legacyId)) {
    return 'day'
  }

  if (dailyQuantity > DAILY_CUBIC_METRES_THRESHOLD) {
    return 'week'
  }

  return 'month'
}

/**
 * Determine the collection frequencies for the return requirement
 *
 * This logic is derived from a table which aims to identify what collection and reporting frequencies to use based on
 * various factors
 *
 * See the tables in _frequencyCollected() for details
 *
 * @private
 */
function _frequencyReported (licence, licenceVersionPurpose) {
  const { waterUndertaker } = licence
  const { dailyQuantity } = licenceVersionPurpose

  // Licensee is a water company or the purpose is for electricity generation
  if (waterUndertaker || licenceVersionPurpose.$electricityGeneration()) {
    return 'day'
  }

  if (dailyQuantity > DAILY_CUBIC_METRES_THRESHOLD) {
    return 'week'
  }

  return 'month'
}

/**
 * For each point grab the ID and return it as an array of points.
 *
 * Remember, we are transforming the data into what is needed for the session, not what is needed for the UI! Hence, we
 * only need the naldPointId.
 *
 * @private
 */
function _points (licenceVersionPurposePoints) {
  return licenceVersionPurposePoints.map((licenceVersionPurposePoint) => {
    return licenceVersionPurposePoint.naldPointId.toString()
  })
}

/**
 * The requirement was
 *
 * > This is from the abs data the local name on the point
 *
 * The problem is a purpose can have multiple points. So, we grab all the descriptions for each point in the, strip out
 * any nulls or undefined and then select the first one to form the site description.
 *
 * @private
 */
function _siteDescription (licenceVersionPurposePoints) {
  const descriptions = licenceVersionPurposePoints.map((licenceVersionPurposePoint) => {
    return licenceVersionPurposePoint.description
  })

  // NOTE: This is doing two things at once. It first filters the descriptions by passing each one to Boolean(). It will
  // return true or false depending on whether the value is 'truthy'. In our case this means null or undefined will be
  // stripped from the array. From what's left we select the first one.
  return descriptions.filter(Boolean)[0]
}

/**
 * Take the licence and associated abstraction data returned by `_fetch()` and transform it into an array of return
 * requirements ready for persisting to the session.
 *
 * What we return matches what you would see in the session if you chose the manual journey. This is what allows a
 * user to make changes from the `/check` page to the requirements we generate.
 *
 * @private
 */
function _transformForSetup (licence) {
  const { licenceVersionPurposes } = licence.$currentVersion()

  return licenceVersionPurposes.map((licenceVersionPurpose) => {
    const {
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth,
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth,
      licenceVersionPurposePoints,
      purpose
    } = licenceVersionPurpose

    return {
      points: _points(licenceVersionPurposePoints),
      purposes: [{ alias: '', description: purpose.description, id: purpose.id }],
      returnsCycle: _returnsCycle(startMonth, endMonth),
      siteDescription: _siteDescription(licenceVersionPurposePoints),
      abstractionPeriod: {
        'end-abstraction-period-day': endDay,
        'end-abstraction-period-month': endMonth,
        'start-abstraction-period-day': startDay,
        'start-abstraction-period-month': startMonth
      },
      frequencyReported: _frequencyReported(licence, licenceVersionPurpose),
      frequencyCollected: _frequencyCollected(licence, licenceVersionPurpose),
      agreementsExceptions: _agreementExceptions(licence)
    }
  })
}

module.exports = {
  go
}
