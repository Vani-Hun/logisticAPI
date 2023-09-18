import express from "express"
import authRoute from "./auth.js"
import waitForDelivery from "./waitForDelivery.js"
import takeOrderShipperRoute from "./takeorder.js"
import CODSigningStatusRouter from "./CODSigingStatus.js"
import notificationShipperRoute from "./notification.js"
import shipper_infoRouter from "./shipper_info.js"
import financial_statementsRouter from "./financial_statements.js"
import historyScanOrderShipperRoute from "./historyScanOrder.js"
import codeScanReportRouter from "./codeScanReport.js"
import paymentStaffShipperRoute from "./payment_staff.js"
import moneyStatisticShipperRoute from "./moneyStatistic.js"
import deliveryRateRouter from "./deliveryRate.js"
import searchOrderRouter from "./searchOrders.js"
import statisticScanTypeRouter from "./statisticScanType.js"
import signOfflineRouter from "./sign_offline.js"
import signOfflineRoute from "./trackingShipment.js"
import syncOfflineDataRouter from "./syncOfflineData.js"
import shipperorderaccept from "./shipperorderaccept.js"
import maintenanceRouter from "./maintenance.js"
const shipperRoute = express.Router();

shipperRoute.use('/auth', authRoute)
            .use('/takeOrder', takeOrderShipperRoute)
            .use('/waitForDelivery', waitForDelivery)
            .use('/CODSigningStatus', CODSigningStatusRouter)
            .use('/notification', notificationShipperRoute)
            .use('/shipper-info', shipper_infoRouter)
            .use('/financial-statements', financial_statementsRouter)
            .use('/historyScanOrder', historyScanOrderShipperRoute)
            .use('/codeScanReport', codeScanReportRouter)
            .use('/paymentStaff', paymentStaffShipperRoute)
            .use('/money-statistic', moneyStatisticShipperRoute)
            .use('/deliveryRate', deliveryRateRouter)
            .use('/search-order', searchOrderRouter)
            .use('/statistic-scan-type', statisticScanTypeRouter)
            .use('/sign-offline', signOfflineRouter)
            .use('/tracking-shipment', signOfflineRoute)
            .use('/sync-offline-data', syncOfflineDataRouter)
            .use('/shipperorderaccept', shipperorderaccept)
            .use('/maintenance', maintenanceRouter)

export default shipperRoute
