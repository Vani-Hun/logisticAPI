import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import Bill from "../../model/Bill.js"
import CarRepair from "../../model/CarRepair.js"
import { handleDeliveryReportInfoDetail } from "../../service/deliveryReport.js"

const deliveryReportAdminRoute = express.Router();

/**
 * @route GET /api/admin/deliveryReport
 * @description get all DeliveryReport
 * @access private
 */
deliveryReportAdminRoute.get("/", async (req, res) => {
  try {
    let list1 = await Bill.find({})
    let list2 = await CarRepair.find({})

    let list = []
    for (let i = 0; i < list1.length; i++) {
      for (let j = 0; j < list2.length; j++) {
        if (
          list2[j].bill &&
          list1[i]._id.toString() === list2[j].bill.toString()
        ) {
          list.push([list1[i], list2[j]])
        }
      }
      if (list[i] === undefined) {
        list.push([list1[i]])
      }
    }
    if (list.length === list1.length) {
      handleDeliveryReportInfoDetail(list).then((list) => {
        return sendSuccess(res, "Get report successfully", list)
      })
    } else {
      return sendError(res, "Information not found.")
    }
  } catch (error) {
    console.log(error);
    return sendServerError(res)
  }
})

export default deliveryReportAdminRoute
