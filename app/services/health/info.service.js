'use strict'

/**
 * Checks status and gathers info for each of the services which make up WRLS
 * @module InfoService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const ChildProcess = require('child_process')
const util = require('util')
const exec = util.promisify(ChildProcess.exec)

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')
const CreateRedisClientService = require('./create-redis-client.service.js')
const FetchImportJobsService = require('./fetch-import-jobs.service.js')
const FetchSystemInfoService = require('./fetch-system-info.service.js')
const { formatLongDateTime } = require('../../presenters/base.presenter.js')
const RequestLib = require('../../lib/request.lib.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')

const servicesConfig = require('../../../config/services.config.js')

/**
 * Returns data required to populate our `/service-status` page, eg. task activity status, virus checker status, service
 * version numbers, etc.
 *
 * Each data set is returned in the format needed to populate the gov.uk table elements ie. an array containing one
 * array per row, where each row array contains multiple `{ text: '...' }` elements, one for each cell in the row.
*/
async function go () {
  const addressFacadeData = await _getAddressFacadeData()
  const chargingModuleData = await _getChargingModuleData()
  const legacyAppData = await _getLegacyAppData()
  const redisConnectivityData = await _getRedisConnectivityData()
  const virusScannerData = await _getVirusScannerData()

  const appData = await _addSystemInfoToLegacyAppData(legacyAppData)

  return {
    addressFacadeData,
    appData,
    chargingModuleData,
    redisConnectivityData,
    virusScannerData
  }
}

async function _addSystemInfoToLegacyAppData (appData) {
  const systemInfo = await FetchSystemInfoService.go()

  return [...appData, systemInfo]
}

async function _getAddressFacadeData () {
  const statusUrl = new URL('/address-service/hola', servicesConfig.addressFacade.url)
  const result = await RequestLib.get(statusUrl.href)

  if (result.succeeded) {
    return result.response.body
  }

  return _parseFailedRequestResult(result)
}

async function _getLegacyAppData () {
  const healthInfoPath = 'health/info'

  const services = [
    { name: 'Import', serviceName: 'import' },
    { name: 'External UI', serviceName: 'external' },
    { name: 'Internal UI', serviceName: 'internal' },
    { name: 'Service - foreground', serviceName: 'water' },
    { name: 'Service - background', serviceName: 'background' },
    { name: 'Returns', serviceName: 'returns' },
    { name: 'Tactical CRM', serviceName: 'crm' },
    { name: 'Tactical IDM', serviceName: 'idm' },
    { name: 'Reporting', serviceName: 'reporting' },
    { name: 'Permit repository', serviceName: 'permits' }
  ]

  for (const service of services) {
    const result = await LegacyRequestLib.get(service.serviceName, healthInfoPath, false)

    if (result.succeeded) {
      service.version = result.response.body.version
      service.commit = result.response.body.commit
      service.jobs = service.name === 'Import' ? await _getImportJobsData() : []
    } else {
      service.version = _parseFailedRequestResult(result)
      service.commit = ''
    }
  }

  return services
}

async function _getChargingModuleData () {
  const result = await ChargingModuleRequestLib.get('status')

  if (result.succeeded) {
    return result.response.info.dockerTag
  }

  return _parseFailedRequestResult(result)
}

async function _getImportJobsData () {
  try {
    const importJobs = await FetchImportJobsService.go()

    return _mapArrayToTextCells(importJobs)
  } catch (error) {
    return []
  }
}

async function _getRedisConnectivityData () {
  let redis

  try {
    redis = await CreateRedisClientService.go()

    await redis.ping()

    return 'Up and running'
  } catch (error) {
    return `ERROR: ${error.message}`
  } finally {
    if (redis) {
      await redis.disconnect()
    }
  }
}

async function _getVirusScannerData () {
  try {
    const { stdout, stderr } = await exec('clamdscan --version')
    return stderr ? `ERROR: ${stderr}` : stdout
  } catch (error) {
    return `ERROR: ${error.message}`
  }
}

function _mapArrayToTextCells (rows) {
  return rows.map(row => {
    return [
      ...[{ text: row.name }],
      ...[{ text: row.completedCount }],
      ...[{ text: row.failedCount }],
      ...[{ text: row.activeCount }],
      ...[{ text: row.maxCompletedonDate ? formatLongDateTime(row.maxCompletedonDate) : '-' }]
    ]
  })
}

function _parseFailedRequestResult (result) {
  if (result.response.statusCode) {
    return `ERROR: ${result.response.statusCode} - ${result.response.body}`
  }

  return `ERROR: ${result.response.name} - ${result.response.message}`
}

module.exports = {
  go
}
