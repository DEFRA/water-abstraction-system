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

import AddressRoutes from '../routes/address.routes.js'
import AssetRoutes from '../routes/assets.routes.js'
import BillLicences from '../routes/bill-licences.routes.js'
import BillRoutes from '../routes/bills.routes.js'
import BillRunRoutes from '../routes/bill-runs.routes.js'
import BillRunReviewRoutes from '../routes/bill-runs-review.routes.js'
import BillRunSetupRoutes from '../routes/bill-runs-setup.routes.js'
import BillingAccountRoutes from '../routes/billing-accounts.routes.js'
import BillingAccountSetupRoutes from '../routes/billing-accounts-setup.routes.js'
import CheckRoutes from '../routes/check.routes.js'
import CompaniesRoutes from '../routes/companies.routes.js'
import CompanyContactsRoutes from '../routes/company-contacts.routes.js'
import CompanyContactsSetupRoutes from '../routes/company-contacts-setup.routes.js'
import DataRoutes from '../routes/data.routes.js'
import FilterRoutesService from '../services/plugins/filter-routes.service.js'
import HealthRoutes from '../routes/health.routes.js'
import NoticesRoutes from '../routes/notices.routes.js'
import NoticesSetupRoutes from '../routes/notices-setup.routes.js'
import NotificationRoutes from '../routes/notifications.routes.js'
import JobRoutes from '../routes/jobs.routes.js'
import LicenceEndDatesRoutes from '../routes/licences-end-dates.routes.js'
import LicenceMonitoringStationRoutes from '../routes/licence-monitoring-station.routes.js'
import LicenceMonitoringStationSetupRoutes from '../routes/licence-monitoring-station-setup.routes.js'
import LicenceRoutes from '../routes/licence.routes.js'
import LicenceVersionsRoutes from '../routes/licence-versions.routes.js'
import ManageRoutes from '../routes/manage.routes.js'
import MonitoringStationRoutes from '../routes/monitoring-station.routes.js'
import ReportRoutes from '../routes/reports.routes.js'
import ReturnLogRoutes from '../routes/return-logs.routes.js'
import ReturnLogSetupRoutes from '../routes/return-logs-setup.routes.js'
import ReturnSubmissionsRoutes from '../routes/return-submissions.routes.js'
import ReturnVersionsRoutes from '../routes/return-versions.routes.js'
import ReturnVersionsSetupRoutes from '../routes/return-versions-setup.routes.js'
import RootRoutes from '../routes/root.routes.js'
import SearchRoutes from '../routes/search.routes.js'
import UsersRoutes from '../routes/users.routes.js'
import UsersSetupRoutes from '../routes/users-setup.routes.js'

import AirbrakeConfig from '../../config/airbrake.config.js'

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
  ...BillingAccountSetupRoutes,
  ...CheckRoutes,
  ...CompaniesRoutes,
  ...CompanyContactsRoutes,
  ...CompanyContactsSetupRoutes,
  ...NotificationRoutes,
  ...LicenceRoutes,
  ...LicenceEndDatesRoutes,
  ...LicenceMonitoringStationRoutes,
  ...LicenceMonitoringStationSetupRoutes,
  ...LicenceVersionsRoutes,
  ...JobRoutes,
  ...ManageRoutes,
  ...MonitoringStationRoutes,
  ...ReportRoutes,
  ...ReturnLogSetupRoutes,
  ...ReturnLogRoutes,
  ...ReturnSubmissionsRoutes,
  ...ReturnVersionsRoutes,
  ...ReturnVersionsSetupRoutes,
  ...NoticesRoutes,
  ...NoticesSetupRoutes,
  ...DataRoutes,
  ...SearchRoutes,
  ...UsersRoutes,
  ...UsersSetupRoutes
]

const RouterPlugin = {
  name: 'router',
  register: (server, _options) => {
    // Filter our any routes which should not be registered. Typically, these will be unfinished endpoints we filter
    // out when running in production
    const filteredRoutes = FilterRoutesService(routes, AirbrakeConfig.environment)

    server.route(filteredRoutes)
  }
}

export default RouterPlugin
