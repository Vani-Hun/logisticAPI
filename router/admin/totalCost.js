import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import Insurance from "../../model/Insurance.js"
import Warehouse from "../../model/Warehouse.js"
import Tax from "../../model/Tax.js"
import Bill from "../../model/Bill.js"
import CarRepair from "../../model/CarRepair.js"
import { handleTotalCostInfo } from "../../service/totalcost.js"
import { handleDeliveryReportInfo } from "../../service/deliveryReport.js"

const totalCostAdminRoute = express.Router();

/**
 * @route GET /api/admin/totalcost
 * @description get all totalcost
 * @access private
 */
totalCostAdminRoute.get("/", async (req, res) => {
    try {
        let listInsurance = await Insurance.find({})
        let listWarehouse = await Warehouse.find({})
        let listTax = await Tax.find({})
        let listBill = await Bill.find({})
        let listCarRepair = await CarRepair.find({})
        let listDeliveryReport = []
        for (let i = 0; i < listBill.length; i++) {
            for (let j = 0; j < listCarRepair.length; j++) {
                if (
                    listCarRepair[j].bill &&
                    listBill[i]._id.toString() === listCarRepair[j].bill.toString()
                ) {
                    listDeliveryReport.push([listBill[i], listCarRepair[j]])
                }
            }
            if (listDeliveryReport[i] === undefined) {
                listDeliveryReport.push([listBill[i]])
            }
        }
        if (listDeliveryReport.length === listBill.length) {
            handleDeliveryReportInfo(listDeliveryReport).then(async (listDeliveryReport) => {
                await handleTotalCostInfo(listDeliveryReport, listInsurance, listWarehouse, listTax).then((list) => {
                    return sendSuccess(res, 'Get totalcost successfully', list)
                })
            })
        }

    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

export default totalCostAdminRoute
