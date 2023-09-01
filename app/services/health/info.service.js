'use strict'

/**
 * Checks status and gathers info for each of the services which make up WRLS
 * @module InfoService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const ChildProcess = require('child_process')
const util = require('util')
const exec = util.promisify(ChildProcess.exec)

const redis = require('@redis/client')

const { db } = require('../../../db/db.js')
const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')
const RequestLib = require('../../lib/request.lib.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')

const RedisConfig = require('../../../config/redis.config.js')
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
  const appData = await _getAppData()
  const chargingModuleData = await _getChargingModuleData()
  const redisConnectivityData = await _getRedisConnectivityData()
  const virusScannerData = await _getVirusScannerData()

  return {
    addressFacadeData,
    appData,
    chargingModuleData,
    redisConnectivityData,
    virusScannerData
  }
}

async function _fetchImportJobs () {
  const PGBOSS_JOBS_ARRAY = [
    'import.bill-runs',
    'import.charge-versions',
    'import.charging-data',
    'import.tracker',
    'licence-import.delete-removed-documents',
    'licence-import.import-company',
    'licence-import.import-licence',
    'licence-import.import-purpose-condition-types',
    'licence-import.queue-companies',
    'licence-import.queue-licences',
    'nald-import.delete-removed-documents',
    'nald-import.import-licence',
    'nald-import.queue-licences',
    'nald-import.s3-download'
  ]

  return db
    .select('name')
    .count({ completedCount: db.raw("CASE WHEN state = 'completed' THEN 1 END") })
    .count({ failedCount: db.raw("CASE WHEN state = 'failed' THEN 1 END") })
    .count({ activeCount: db.raw("CASE WHEN state IN ('active', 'created') THEN 1 END") })
    .max('completedon as maxCompletedonDate')
    .from(
      (db
        .select(
          'name',
          'state',
          'completedon'
        )
        .from('water_import.job')
        .whereIn('state', ['failed', 'completed', 'active', 'created'])
        .whereIn('name', PGBOSS_JOBS_ARRAY)
        .where((builder) =>
          builder
            .where(db.raw("createdon > now() - interval '3 days'"))
            .orWhere(db.raw("completedon > now() - interval '3 days'"))
        )
        .unionAll(
          db
            .select(
              'name',
              'state',
              'completedon'
            )
            .from('water_import.archive')
            .whereIn('state', ['failed', 'completed', 'active', 'created'])
            .whereIn('name', PGBOSS_JOBS_ARRAY)
            .where((builder) =>
              builder
                .where(db.raw("createdon > now() - interval '3 days'"))
                .orWhere(db.raw("completedon > now() - interval '3 days'"))
            )
        ))
        .as('jobs')
    )
    .groupBy('name')
}

async function _getAddressFacadeData () {
  const statusUrl = new URL('/address-service/hola', servicesConfig.addressFacade.url)
  const result = await RequestLib.get(statusUrl.href)

  if (result.succeeded) {
    return result.response.body
  }

  return _parseFailedRequestResult(result)
}

async function _getAppData () {
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
  const importJobs = await _fetchImportJobs()

  return _mapArrayToTextCells(importJobs)
}

async function _getRedisConnectivityData () {
  try {
    const client = redis.createClient({
      socket: {
        host: RedisConfig.host,
        port: RedisConfig.port
      },
      password: RedisConfig.password
    })

    await client.connect()
    await client.disconnect()

    return 'Up and running'
  } catch (error) {
    // `error` value not returned for security reasons as it gives out the IP address and port of Redis
    return 'Error connecting to Redis'
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
      ...[{ text: row.maxCompletedonDate ? row.maxCompletedonDate.toLocaleString() : '-' }]
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
