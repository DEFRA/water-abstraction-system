'use strict'

/**
 * Our router plugin which pulls in the various routes we have defined ready to be registered with the Hapi server
 * (server.js).
 *
 * You register your routes via a plugin, and by bringing them into this central place it gives us the scope to do
 * things like filter what actually gets registered. A working example might be an endpoints used to support testing and
 * debugging which we don't want registered in the actual production environment.
 *
 * @module RouterPlugin
 */

const AddressRoutes = require('../routes/address.routes.js')
const AssetRoutes = require('../routes/assets.routes.js')
const BillLicences = require('../routes/bill-licences.routes.js')
const BillRoutes = require('../routes/bills.routes.js')
const BillRunRoutes = require('../routes/bill-runs.routes.js')
const BillRunReviewRoutes = require('../routes/bill-runs-review.routes.js')
const BillRunSetupRoutes = require('../routes/bill-runs-setup.routes.js')
const BillingAccountRoutes = require('../routes/billing-accounts.routes.js')
const CheckRoutes = require('../routes/check.routes.js')
const DataRoutes = require('../routes/data.routes.js')
const FilterRoutesService = require('../services/plugins/filter-routes.service.js')
const HealthRoutes = require('../routes/health.routes.js')
const NoticesRoutes = require('../routes/notices.routes.js')
const NoticesSetupRoutes = require('../routes/notices-setup.routes.js')
const NotificationRoutes = require('../routes/notifications.routes.js')
const JobRoutes = require('../routes/jobs.routes.js')
const LicenceRoutes = require('../routes/licence.routes.js')
const LicenceEndDatesRoutes = require('../routes/licences-end-dates.routes.js')
const LicenceMonitoringStationRoutes = require('../routes/licence-monitoring-station.routes.js')
const LicenceMonitoringStationSetupRoutes = require('../routes/licence-monitoring-station-setup.routes.js')
const MonitoringStationRoutes = require('../routes/monitoring-station.routes.js')
const ReturnLogSetupRoutes = require('../routes/return-logs-setup.routes.js')
const ReturnLogRoutes = require('../routes/return-logs.routes.js')
const ReturnSubmissionsRoutes = require('../routes/return-submissions.routes.js')
const ReturnVersionsSetupRoutes = require('../routes/return-versions-setup.routes.js')
const ReturnVersionsRoutes = require('../routes/return-versions.routes.js')
const RootRoutes = require('../routes/root.routes.js')

const AirbrakeConfig = require('../../config/airbrake.config.js')

const routes = [
  ...RootRoutes,
  ...AddressRoutes,
  ...AssetRoutes,
  ...HealthRoutes,
  ...BillLicences,
  ...BillRoutes,
  ...BillRunRoutes,
  ...BillRunReviewRoutes,
  ...BillRunSetupRoutes,
  ...BillingAccountRoutes,
  ...CheckRoutes,
  ...NotificationRoutes,
  ...LicenceRoutes,
  ...LicenceEndDatesRoutes,
  ...LicenceMonitoringStationRoutes,
  ...LicenceMonitoringStationSetupRoutes,
  ...JobRoutes,
  ...MonitoringStationRoutes,
  ...ReturnLogSetupRoutes,
  ...ReturnLogRoutes,
  ...ReturnSubmissionsRoutes,
  ...ReturnVersionsRoutes,
  ...ReturnVersionsSetupRoutes,
  ...NoticesRoutes,
  ...NoticesSetupRoutes,
  ...DataRoutes
]

const RouterPlugin = {
  name: 'router',
  register: (server, _options) => {
    // Filter our any routes which should not be registered. Typically, these will be unfinished endpoints we filter
    // out when running in production
    const filteredRoutes = FilterRoutesService.go(routes, AirbrakeConfig.environment)

    server.route(filteredRoutes)
  }
}

module.exports = RouterPlugin
