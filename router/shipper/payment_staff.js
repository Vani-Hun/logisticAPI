import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { verifyToken, verifyShipper } from "../../middleware/verify.js"
import Order from '../../model/Order.js'
import { ORDER_STATUS, SCAN_TYPE } from '../../constant.js'

const paymentStaffShipperRoute = express.Router()

/**
 * @route GET /api/shipper/paymentStaff/payment 
 * @description payment for Admin
 * @access public
 */
paymentStaffShipperRoute.get('/payment', verifyToken, verifyShipper, async (req, res) => {
  const shipperId = req.decoded.roleId;
  try {
    const orders = await Order.find({ 'tracking.shipper': shipperId });
    const shipperFees = orders.map((order) => {
      const receiverFee = parseFloat(order.shipping.receiver_fee);
      const totalAmountAfterTaxAndDiscount = parseFloat(order.shipping.total_amount_after_tax_and_discount);
      const cod = parseFloat(order.cod.cod);
      const fee = parseFloat(order.cod.fee);
      const finalReceiverFee = isNaN(receiverFee) ? 0 : receiverFee;
      const finalTotalAmount = isNaN(totalAmountAfterTaxAndDiscount) ? 0 : totalAmountAfterTaxAndDiscount;
      const finalCod = isNaN(cod) ? 0 : cod;
      const finalFee = isNaN(fee) ? 0 : fee;
      const shipperFee = finalReceiverFee + finalTotalAmount + finalCod + finalFee;
      console.log(receiverFee, totalAmountAfterTaxAndDiscount, cod, fee);
      return {
        orderId: order.orderId,
        receiver_name: order.receiver.name,
        receiver_phone: order.receiver.phone,
        receiver_address: order.receiver.address,
        date: order.updatedAt,
        shipperFee,
      };
    });
    if (shipperFees.length === 0) {
      return sendError(res, "No orders found.");
    }
    return sendSuccess(res, "Get successfully", shipperFees)
  } catch (error) {
    console.log(error);
    return sendServerError(res, "An error occurred while calculating shipper fees.")
  }
});

export default paymentStaffShipperRoute;