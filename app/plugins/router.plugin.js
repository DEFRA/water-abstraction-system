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

const AssetRoutes = require('../routes/assets.routes.js')
const BillLicences = require('../routes/bill-licences.routes.js')
const BillRoutes = require('../routes/bills.routes.js')
const BillRunRoutes = require('../routes/bill-runs.routes.js')
const BillRunSetupRoutes = require('../routes/bill-runs-setup.routes.js')
const BillingAccountRoutes = require('../routes/billing-accounts.routes.js')
const DataRoutes = require('../routes/data.routes.js')
const FilterRoutesService = require('../services/plugins/filter-routes.service.js')
const HealthRoutes = require('../routes/health.routes.js')
const ImportRoutes = require('../routes/import.routes.js')
const JobRoutes = require('../routes/jobs.routes.js')
const LicenceRoutes = require('../routes/licence.routes.js')
const ReturnRequirementRoutes = require('../routes/return-requirement.routes.js')
const RootRoutes = require('../routes/root.routes.js')

const AirbrakeConfig = require('../../config/airbrake.config.js')

const routes = [
  ...RootRoutes,
  ...AssetRoutes,
  ...HealthRoutes,
  ...BillLicences,
  ...BillRoutes,
  ...BillRunRoutes,
  ...BillRunSetupRoutes,
  ...BillingAccountRoutes,
  ...LicenceRoutes,
  ...JobRoutes,
  ...ReturnRequirementRoutes,
  ...DataRoutes,
  ...ImportRoutes
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
