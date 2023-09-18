import express, { request } from "express"
import { sendError, sendServerError, sendSuccess, } from "../../helper/client.js"
import {
  updateOrderStatusValidate, signOrderValidate, updateOrderTrackingValidate, validateGetSupervisionSending, validateGetSupervisionSendingDetail,
  validateUpdatePostOffice,
  createOrderByAdminValidate,
  updateStatusInprogressValidate
} from "../../validation/order.js"
import {
  canChangeOrderStatus, genarateOrderID, genarateBillofLandingID, getOrderWithFilters,
  handleAdminScanOrderValue,
  getOrdersInSupervisionSending,
  getSupervisionSendingReport,
  getOrders24h,
  getOrdersToCollectCod,
  getOrdersCollectCod,
  getOrdersCod,
  getOrdersSigned,
} from "../../service/order.js"
import Order from "../../model/Order.js"
import { CASH_PAYMENT, COD_STATUS, ORDER_STATUS, PAYMENT_METHOD, PICKUP_METHOD, STAFF } from "../../constant.js"
import CompareReview from "../../model/CompareReview.js"
import { COMPARE_REVIEW_TYPE, SCAN_TYPE, SUPERVISION_SENDING_DETAIL_TYPE } from "../../constant.js"
import { getDateWhenEditSchedule } from "../../service/compareReview.js"
import { handleGroupOrderByDeliveryStaff, handleSupervisionDelivery, handleSupervisionDeliveryDetail } from "../../service/order.js"
import Staff from "../../model/Staff.js"
import PostOffice from "../../model/PostOffice.js"
import Warehouse from "../../model/Warehouse.js"
import mongoose from "mongoose"
import { PdfHelper } from "../../helper/generatePdf/pdf.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";
import { calculateShippingExpressCost, calculateShippingOrderCost } from "../../helper/caculatorCost.js"
import Fee from "../../model/Fee.js"
import User from "../../model/User.js"
import moment from "moment"

const app = express();
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = path.join(__dirname, '..', '..', 'data', 'dvhcvn.json');
const filePath_Express_Standard = path.join(__dirname, '..', '..', 'data', 'express', 'standard_fee.json');
const filePath_Express_Fast = path.join(__dirname, '..', '..', 'data', 'express', 'fast_fee.json');
const filePath_Express_Super = path.join(__dirname, '..', '..', 'data', 'express', 'super_fee.json');

const orderAdminRoute = express.Router();

/**
 * @route GET /api/admin/order
 * @description get list of order
 * @access private
 */

orderAdminRoute.get('/', async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
    const page = req.query.page ? parseInt(req.query.page) : 0
    let { sortBy, orderIds, beginSendTime, endSendTime, beginConfirmTime, endConfirmTime, beginSignTime, endSignTime, pickUpStaff, confirmStaff, originPostOffice, customer, destinationPostOffice, cashPayment, codStatus, endSeal, orderStatus, signedStatus, totalFreight, insuranceFee, canceledStatus, transportationMode } = req.query
    const orders = await getOrders24h(pageSize, page, sortBy, orderIds, beginSendTime, endSendTime, beginConfirmTime, endConfirmTime, beginSignTime, endSignTime, pickUpStaff, confirmStaff, originPostOffice, customer, destinationPostOffice, cashPayment, codStatus, endSeal, orderStatus, signedStatus, totalFreight, insuranceFee, canceledStatus, transportationMode)
    if (orders.length === 0) return sendError(res, "No order found")
    return sendSuccess(res, 'Get orders successfully', orders)
  } catch (error) {
    console.error(error.message);
    return sendServerError(res);
  }
})

/**
 * @route GET /api/admin/order/supervision-delivery/:startDate/:endDate/:postCode
 * @description admin get delivery monitoring
 * @access private
 */
orderAdminRoute.get('/supervision-delivery/:startDate/:endDate/:postCode', async (req, res) => {
  try {
    const { postCode } = req.params
    let postOffice = await PostOffice.findOne({ code: postCode }).lean()
    if (!postOffice) { return sendError(res, "postOffice not found") }
    let staff = await Staff.find({ office: postOffice._id, staff_type: "shipper" }).lean()
    if (!staff) { return sendError(res, "staff not found") }
    const startDate = await new Date(req.params.startDate)
    const endDate = await new Date(req.params.endDate)
    const data = await handleSupervisionDelivery(startDate, endDate, postOffice, staff)
    return sendSuccess(res, 'Get delivery monitoring successfully', data)
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/order/supervision-delivery-detail/:staffCode/:startDate/:endDate/:postCode
 * @description admin get delivery monitoring
 * @access private
 */
orderAdminRoute.get('/supervision-delivery-detail/:staffCode/:startDate/:endDate/:postCode', async (req, res) => {
  try {
    const { postCode, staffCode } = req.params
    let postOffice = await PostOffice.findOne({ code: postCode }).lean()
    if (!postOffice) { return sendError(res, "postOffice not found") }
    let staff = await Staff.findOne({ code: staffCode }).lean()
    if (!staff) { return sendError(res, "staff not found") }
    const startDate = await new Date(req.params.startDate)
    const endDate = await new Date(req.params.endDate)
    const order = await handleSupervisionDeliveryDetail(startDate, endDate, postOffice, staff)
    return sendSuccess(res, 'Get delivery monitoring successfully', order)
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route POST /api/admin/order/tax
 * @description admin get delivery monitoring
 * @access private
 */
orderAdminRoute.post('/tax', async (req, res) => {
  try {
    const newTax = new Tax({
      code: req.body.shipping.VAT_code,
      cost: req.body.shipping.VAT_fee,
    })
    newTax.save()
    return sendSuccess(res, 'Get delivery monitoring successfully', newTax)
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route POST /api/admin/order
 * @description admin create a new order
 * @access private
 */
orderAdminRoute.post('/', async (req, res) => {
  try {
    let {
      origin,
      destination,
      pickup_staff,
      customer,
      note,
    } = req.body;

    const errors = createOrderByAdminValidate(req.body)
    if (errors) return sendError(res, errors)

    let sender = {
      name: req.body.sender.name,
      phone: req.body.sender.phone,
      email: req.body.sender.email,
      address: req.body.sender.address
    }

    let receiver = {
      name: req.body.receiver.name,
      phone: req.body.receiver.phone,
      email: req.body.receiver.email,
      address: req.body.receiver.address
    }

    let product = {
      name: req.body.product.product_name,
      weight: req.body.product.weight,
      goods_value: req.body.product.goods_value,
      quantity: req.body.product.quantity,
      types: req.body.product.product_types,
      cash_payment: req.body.product.cash_payment,
      transportation: req.body.product.transportation,
      note: note
    }
    let shipping = {
      type_shipping: req.body.shipping.type_shipping,
      standard_fee: req.body.shipping.standard_fee,
      fuel_surcharge: req.body.shipping.fuel_surcharge,
      receiver_fee: req.body.shipping.receiver_fee,
      remote_areas_surcharge: req.body.shipping.remote_areas_surcharge,
      other: req.body.shipping.other,
      tax_VAT_value: req.body.shipping.VAT_fee,
      tax_code: req.body.shipping.VAT_code,
      total_amount_before_discount: req.body.shipping.before_discount,
      insurance_fees: req.body.shipping.insurance_fee,
      total_amount_after_discount: req.body.shipping.after_discount,
      total_amount_after_tax_and_discount: req.body.shipping.after_discount_tax,
      discount: req.body.shipping.discount,
    }

    const company = {
      name: req.body.company.name,
      address: req.body.company.address,
      note: note,
    }

    const cod = {
      cod: req.body.cod.cod,
      fee: req.body.cod.fee
    }

    const orderId = await genarateOrderID()
    const bill_of_landing = await genarateBillofLandingID()
    const order = await Order.create({
      orderId,
      customer: customer,
      sender: sender,
      receiver: receiver,
      origin: origin,
      destination: destination,
      shipping: { id: bill_of_landing, ...shipping },
      product: product,
      cod: cod,
      company: company,
      pickUpStaff: pickup_staff,
      confirmStaff: req.decoded.roleId
    });
    if(product.transportation === 'T'){
      const newOrder = await Order.findOneAndUpdate(
        { orderId: orderId },
        {
          $push:
          {
            timeline: {
              status: ORDER_STATUS.in_progress
            }
          }
        },
        { new: true })
      return sendSuccess(res, "Create new order successfully", newOrder)
    }
    return sendSuccess(res, "Create new order successfully", order)
  } catch (error) {
    console.log(error);
    return sendServerError(res)
  }
})

/**
 * @route PUT /api/admin/order/:orderId/status
 * @description update status order by orderId
 * @access private
 */
orderAdminRoute.put("/:orderId/status/change", async (req, res) => {
  try {
    const errors = updateOrderStatusValidate(req.body);
    if (errors) return sendError(res, errors);

    const { orderId } = req.params;
    const { status, pickUpStaff } = req.body;
    const order = await Order.findOne({ orderId });
    if (!order) return sendError(res, "Order does not exist.", 404);
    const curSta = order.timeline[order.timeline.length - 1].status;
    console.log("curStatus: ", curSta)
    const canChange = await canChangeOrderStatus(order, status);
    if (canChange) {
      if (status === ORDER_STATUS.in_progress) {
        const errorUpdate = updateStatusInprogressValidate(req.body)
        if (errorUpdate) return sendError(res, errorUpdate)
        const orderWithNewStatus = await Order.findOneAndUpdate(
          { orderId },
          {
            $push:
            {
              timeline: {
                status: status
              }
            },
            pickUpStaff: pickUpStaff,
            confirmStaff: req.decoded.roleId
          },
          { new: true }
        );
        // sendOrderMessageToCustomer(order.orderId, "Đơn hàng đã được lấy thành công và chuyển đến kho phân loại");
        return sendSuccess(res, "Change status of the order successfully.", orderWithNewStatus);
      } else {
        const orderWithNewStatus = await Order.findOneAndUpdate(
          { orderId },
          {
            $push:
            {
              timeline: {
                status: status
              }
            },
          },
          { new: true }
        );
        if (status === ORDER_STATUS.dispatching) {
          let _date = await getDateWhenEditSchedule(COMPARE_REVIEW_TYPE.DEFAULT);
          await CompareReview.create({
            customer: orderWithNewStatus.customer,
            order: orderWithNewStatus._id,
            selected_date: _date,
          });
          // sendOrderMessageToCustomer(order.orderId, "Đơn hàng đã được xác nhận thành công");
          return sendSuccess(res, "Change status of the order successfully.", {
            status,
          });
        } else {
          if (status === ORDER_STATUS.dispatched) {
            // sendOrderMessageToCustomer(order.orderId, "Đã giao hàng thành công")
          }
          if (status === ORDER_STATUS.in_return) {
            // sendOrderMessageToCustomer(order.orderId, "Yêu cầu trả hàng của bạn đã được gửi đi")
          }
          if (status === ORDER_STATUS.return_confirmation) {
            // sendOrderMessageToCustomer(order.orderId, "Yêu cầu trả hàng của bạn đã được xác nhận thành công")
          }
          if (status === ORDER_STATUS.return_success) {
            // sendOrderMessageToCustomer(order.orderId, "Đơn hàng đã được hoàn trả thành công")
          }
          if (status === ORDER_STATUS.problem_order) {
            // sendOrderMessageToCustomer(order.orderId, "Đơn hàng đã xảy ra sự cố")
          }
          if (status === ORDER_STATUS.canceled) {
            // sendOrderMessageToCustomer(order.orderId, "Đơn hàng đã bị huỷ")
          }
          return sendSuccess(res, "Change status of the order successfully.", {
            status
          });
        }
      }
    }
    return sendError(res, "Can not change the status of this order.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route PATCH /api/admin/order/scan/orderId
 * @description admin update tracking of an order by orderId
 * @access private
 */
orderAdminRoute.patch("/tracking/scan/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params
    const errors = updateOrderTrackingValidate(req.body);
    if (errors) return sendError(res, errors);
    const staffId = req.decoded.roleId;

    let updateValue = await handleAdminScanOrderValue(req, staffId, orderId);
    if (typeof updateValue === 'string') {
      return sendError(res, updateValue);
    }

    let order = await Order.findOneAndUpdate({ orderId }, updateValue);
    return sendSuccess(
      res, "successfully.", order
    )
  } catch (error) {
    console.log(error);
    return sendServerError(res)
  }
})

/**
* @route PUT /api/admin/order/finance/cod/collecting
* @description get cod not collected
* @access private
*/
orderAdminRoute.get("/finance/cod/collecting", async (req, res) => {
  try {
    const admin = await Staff.findById(req.decoded.roleId)
    const post_office = await PostOffice.findOne({ code: admin.code.slice(0, 8) })
    const post_office_id = post_office._id
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    let { sortBy, orderIds, beginSendTime, endSendTime, beginSignTime, endSignTime, shipper, customer, department, carFleet, postCode, cashPayment } = req.query;
    postCode = post_office_id
    const results = await getOrdersToCollectCod(pageSize, page, sortBy, orderIds, beginSendTime, endSendTime, beginSignTime, endSignTime, shipper, customer, department, carFleet, postCode, cashPayment)
      .then(result => {
        if (result.length === 0) {
          return sendError(res, "COD not found");
        } else {
          const data = result.reduce((acc, item) => {
            const { shipperInfo, cod, shipping, product, lastStatus } = item;
            if (shipperInfo && shipperInfo._id && (product.cash_payment === CASH_PAYMENT.CC_CASH || product.cash_payment === CASH_PAYMENT.PP_CASH)) {
              if (!acc[shipperInfo._id]) {
                acc[shipperInfo._id] = {
                  staff: shipperInfo.name,
                  countSending: lastStatus.status === ORDER_STATUS.return_success ? 1 : 0,
                  moneySending: lastStatus.status === ORDER_STATUS.return_success ? (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0) : 0,
                  countDelivery: lastStatus.status === ORDER_STATUS.dispatched ? 1 : 0,
                  moneyDelivery: lastStatus.status === ORDER_STATUS.dispatched ? (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0) : 0,
                  codDelivery: cod.cod ? parseInt(cod.cod) : 0,
                  total: shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0
                };
              } else {
                acc[shipperInfo._id].countSending += lastStatus.status === ORDER_STATUS.return_success ? 1 : 0,
                  acc[shipperInfo._id].moneySending += lastStatus.status === ORDER_STATUS.return_success ? (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0) : 0,
                  acc[shipperInfo._id].countDelivery += lastStatus.status === ORDER_STATUS.dispatched ? 1 : 0,
                  acc[shipperInfo._id].moneyDelivery += lastStatus.status === ORDER_STATUS.dispatched ? (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0) : 0,
                  acc[shipperInfo._id].codDelivery += cod.cod ? parseInt(cod.cod) : 0,
                  acc[shipperInfo._id].total += lastStatus.status === ORDER_STATUS.return_success ? (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0) : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0)
              }
            }
            return acc;
          }, {});
          return sendSuccess(res, "Get order successfully", data)
        }
      });
  } catch (error) {
    return sendServerError(res, error);
  }
}
);

/**
* @route PUT /api/admin/finance/cod/collecting
* @description update cod status in order by cod collection
* @access private
*/
orderAdminRoute.put('/finance/cod/collecting', async (req, res) => {
  try {
    const admin = await Staff.findById(req.decoded.roleId)
    const post_office = await PostOffice.findOne({ code: admin.code.slice(0, 8) })
    const post_office_id = post_office._id
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    let { sortBy, orderIds, beginSendTime, endSendTime, beginSignTime, endSignTime, shipper, customer, department, carFleet, postCode, cashPayment } = req.query;
    postCode = post_office_id
    const result = await getOrdersToCollectCod(pageSize, page, sortBy, orderIds, beginSendTime, endSendTime, beginSignTime, endSignTime, shipper, customer, department, carFleet, postCode, cashPayment)
    if (result.length == 0) return sendError(res, "Order not found");
    result.map(async (item) => {
      const newCodStatus = await Order.findOneAndUpdate({ orderId: item.orderId },
        {
          $set: {
            "shipping.collected": true,
            "shipping.collected_by": admin._id,
            "shipping.collected_time": new Date().toISOString(),
          }
        },
        { new: true })
    });
    return sendSuccess(res, "Collected COD successfully", result);
  } catch (error) {
    return sendServerError(res, error);
  }
});

/**
* @route GET /api/admin/order/finance/cod/collected
* @description get all cod collected
* @access private
*/
orderAdminRoute.get('/finance/cod/collected', async (req, res) => {
  try {
    const admin = await Staff.findById(req.decoded.roleId)
    const post_office = await PostOffice.findOne({ code: admin.code.slice(0, 8) })
    const post_office_id = post_office._id
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    let { sortBy, beginCollectedTime, endCollectedTime, postCode, shipper, cashier, cashPayment } = req.query
    postCode = post_office_id
    const results = await getOrdersCollectCod(pageSize, page, sortBy, beginCollectedTime, endCollectedTime, postCode, shipper, cashier, cashPayment)
      .then(result => {
        if (result.length === 0) {
          return sendError(res, "COD not found");
        } else {
          const data = result.reduce((acc, item) => {
            const { shipperInfo, cod, shipping, product, cashier, lastStatus } = item;
            if (shipperInfo && shipperInfo._id) {
              if (!acc[shipperInfo._id]) {
                acc[shipperInfo._id] = {
                  collectedTime: shipping.collected_time,
                  shipper: shipperInfo.name,
                  collectedMoney: lastStatus.status === ORDER_STATUS.return_success ?
                    (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0)
                    : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0),
                  money: parseInt(cod.cod) ?? 0,
                  serial: shipperInfo.serial_number_of_the_shipping_manifest ?? "",
                  cashPayment: [product.cash_payment],
                  cashier: cashier.name,
                  collectedTime: shipping.collected_time,
                  collectedBy: shipping.collected_by
                };
              } else {
                acc[shipperInfo._id].cashPayment.push(product.cash_payment);
                acc[shipperInfo._id].cashPayment = [...new Set(acc[shipperInfo._id].cashPayment)],
                  acc[shipperInfo._id].collectedMoney += lastStatus.status === ORDER_STATUS.return_success ?
                    (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0)
                    : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0),
                  acc[shipperInfo._id].money += parseInt(cod.cod) ?? 0
              }
            }
            return acc;
          }, {});
          return sendSuccess(res, "Get collected COD successfully", data);
        }
      });
  } catch (error) {
    return sendServerError(res, error);
  }
})

/**
* @route GET /api/admin/order/finance/cod/detail
* @description get detail cod collected by a delivery staff
* @access private
*/
orderAdminRoute.get('/finance/cod/collected/detail', async (req, res) => {
  try {
    const admin = await Staff.findById(req.decoded.roleId)
    const post_office = await PostOffice.findOne({ code: admin.code.slice(0, 8) })
    const post_office_id = post_office._id
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    let { sortBy, beginCollectedTime, endCollectedTime, postCode, shipper, cashier, cashPayment } = req.query
    postCode = post_office_id
    const results = await getOrdersCollectCod(pageSize, page, sortBy, beginCollectedTime, endCollectedTime, postCode, shipper, cashier, cashPayment)
      .then(async (result) => {
        if (result.length === 0) {
          return sendError(res, "COD not found");
        } else {
          let groupedObjects = {};
          result.forEach(function (obj) {
            var shipperId = obj.shipperInfo._id;
            if (groupedObjects.hasOwnProperty(shipperId)) {
              groupedObjects[shipperId].push(obj);
            } else {
              groupedObjects[shipperId] = [obj];
            }
          });
          const resultArray = [];
          for (let staff in groupedObjects) {
            const obj = groupedObjects[staff];
            const newData = await handleGroupOrderByDeliveryStaff(obj);
            resultArray.push(newData);
          }
          Promise.all(resultArray)
            .then((resolvedData) => {
              return sendSuccess(res, "Get collected COD successfully", resolvedData);
            })
            .catch((error) => {
              return sendError(res, "Error: " + error);
            });
        }
      });
  } catch (error) {
    return sendServerError(res, error);
  }
});

/**
* @route GET /api/admin/order/finance/cod
* @description get all cod by date
* @access private
*/
orderAdminRoute.get('/finance/cod', async (req, res) => {
  try {
    const admin = await Staff.findById(req.decoded.roleId)
    const post_office = await PostOffice.findOne({ code: admin.code.slice(0, 8) })
    const post_office_id = post_office._id
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    let { sortBy, beginSendTime, endSendTime, beginSignTime, endSignTime, shipper, postCode, postOffice, cashPayment } = req.query
    postCode = post_office_id
    const result = await getOrdersCod(pageSize, page, sortBy, beginSendTime, endSendTime, beginSignTime, endSignTime, shipper, postCode, postOffice, cashPayment);
    if (result.length == 0) return sendError(res, "Order not found");
    const data = result.reduce((acc, item) => {
      const { shipperInfo, cod, shipping, postOfficeInfo, product, lastStatus } = item;
      if (!acc[shipperInfo._id]) {
        acc[shipperInfo._id] = {
          shipper: shipperInfo.name,
          shipper_code: shipperInfo.code,
          moneyPP: product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : 0,
          moneyCC: product.cash_payment === CASH_PAYMENT.CC_CASH ? (lastStatus.status === ORDER_STATUS.return_success ? ((parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0)) : 0,
          cod: parseInt(cod.cod) ?? 0,
          total: (lastStatus.status === ORDER_STATUS.return_success ?
            (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0)
            : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0)
          ) + parseInt(cod.cod),
          moneyCollected: shipping.collected === true ? (lastStatus.status === ORDER_STATUS.return_success ?
            (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0)
            : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0)) : 0,
          notCollected: shipping.collected === true ? ((lastStatus.status === ORDER_STATUS.return_success ?
            (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0)
            : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0)
          ) + parseInt(cod.cod)) : 0,
          count: 1,
          postOffice: postOfficeInfo.name,
          codCollected: shipping.collected === true ? parseInt(cod.cod) : 0
        };
      } else {
        acc[shipperInfo._id].moneyPP += product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : 0,
          acc[shipperInfo._id].moneyCC += product.cash_payment === CASH_PAYMENT.CC_CASH ? (lastStatus.status === ORDER_STATUS.return_success ? ((parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0)) : 0,
          acc[shipperInfo._id].cod += parseInt(cod.cod) ?? 0,
          acc[shipperInfo._id].total += (lastStatus.status === ORDER_STATUS.return_success ?
            (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0)
            : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0)
          ) + parseInt(cod.cod),
          acc[shipperInfo._id].moneyCollected += shipping.collected === true ? (lastStatus.status === ORDER_STATUS.return_success ?
            (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0)
            : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0)) : 0,
          acc[shipperInfo._id].notCollected += shipping.collected === false ? ((lastStatus.status === ORDER_STATUS.return_success ?
            (product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0)
            : (shipping.total_amount_after_tax_and_discount ? parseInt(shipping.total_amount_after_tax_and_discount) : 0)
          ) + parseInt(cod.cod)) : 0,
          acc[shipperInfo._id].count += 1,
          acc[shipperInfo._id].codCollected += cod.status === shipping.collected === true ? parseInt(cod.cod) : 0
      }
      return acc;
    }, {});
    const totalData = {};
    for (const key in data) {
      const item = data[key];
      for (const prop in item) {
        if (prop !== 'shipper' && prop !== 'postOffice' && prop !== 'shipper_code') {
          if (typeof totalData[prop] === 'undefined') {
            totalData[prop] = 0;
          }
          totalData[prop] += item[prop];
        }
      }
    }
    return sendSuccess(res, "Get orders by delivery staff successfully", { data, totalData });
  } catch (error) {
    return sendServerError(res, error);
  }
});

/**
 * @route POST /api/admin/order/sign/:orderId
 * @description admin confirm order signed
 * @access private
 */
orderAdminRoute.put('/confirm-sign/:orderId', async (req, res) => {
  try {
    const staffId = req.decoded.roleId
    const orderId = req.params.orderId
    const { shipper, sign, instead } = req.body
    const signing = await Order.findOneAndUpdate(
      { orderId: orderId },
      {
        deliverySign: {
          signer: staffId,
          instead: instead ?? false,
          shipper: shipper,
          sign: sign,
          time: new Date.now()
        }
      },
      { new: true })
    return sendSuccess(res, 'Signed order successfully')
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/order/checking-sign
 * @description admin sign order
 * @access private
 */
orderAdminRoute.get('/checking-sign', async (req, res) => {
  try {
    const admin = await Staff.findById(req.decoded.roleId)
    const post_office = await PostOffice.findOne({ code: admin.code.slice(0, 8) })
    const post_office_id = post_office._id
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    let { sortBy, orderIds, beginConfirmTime, endConfirmTime, beginSignTime, endSignTime, province, postCode, customerPostCode, onlyCC_CASH, onlyCOD, typeSign } = req.query
    postCode = post_office_id
    let orders = await getOrdersSigned(pageSize, page, sortBy, orderIds, beginConfirmTime, endConfirmTime, beginSignTime, endSignTime, province, postCode, customerPostCode, onlyCC_CASH, onlyCOD, typeSign);
    if (orders.length === 0) return sendError(res, "No order found")
    return sendSuccess(res, 'Get orders successfully', orders)
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/order/monitor/:postCode
 * @description admin monitor incoming order at post office
 * @access private
 */
orderAdminRoute.get('/supervision-incoming/:postCode', async (req, res) => {
  try {
    let { beginDate, endDate } = req.query
    const postCode = req.params.postCode
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
    const page = req.query.page ? parseInt(req.query.page) : 0
    let { sortBy, orderIds, sender, receiver, shipper, customer, pickupStaff, collectCodStaff, confirmStaff, company, department, carFleet, cashPayment, orderStatus, codStatus, signed, canceledStatus, transportationMode, originPostOffice, destinationPostOffice, beginSendTime, endSendTime, beginConfirmTime, endConfirmTime, beginDeliveryTime, endDeliveryTime, beginSignTime, endSignTime, beginCollectCodTime, endCollectCodTime } = req.query
    destinationPostOffice = postCode
    const result = await getOrderWithFilters(pageSize, page, sortBy, orderIds, sender, receiver, shipper, customer, pickupStaff, collectCodStaff, confirmStaff, company, department, carFleet, cashPayment, orderStatus, codStatus, signed, canceledStatus, transportationMode, originPostOffice, destinationPostOffice, beginSendTime, endSendTime, beginConfirmTime, endConfirmTime, beginDeliveryTime, endDeliveryTime, beginSignTime, endSignTime, beginCollectCodTime, endCollectCodTime
    )
      .then(result => {
        if (beginDate && endDate) {
          const filteredOrders = result.filter((order) => {
            const trackingArray = order.tracking
            for (const tracking of trackingArray) {
              if (
                tracking.scan_type === "incoming_postoffice" &&
                new Date(tracking.scan_code_time) >= new Date(beginDate) &&
                new Date(tracking.scan_code_time) <= new Date(endDate)
              ) {
                return true
              }
            }
            return false
          });
          return filteredOrders
        } else {
          return result
        }
      })
      .then(filteredOrders => {
        const countOrder = filteredOrders.reduce((acc, order) => {
          acc.total++
          if (order.tracking.some(item => item.scan_type === 'sending_postoffice') && !order.tracking.some(item => item.scan_type === 'incoming_postoffice')) acc.notArrived++
          if (order.tracking.some(item => item.scan_type === 'incoming_postoffice')) acc.totalArrived++
          if (!order.deliverySign) acc.notSigned++
          if (!order.tracking.some(item => item.scan_type === 'received_order')) acc.notDelivery++
          if (order.tracking.length == 0) acc.notRecorded++
          if (!order.tracking.some(item => item.scan_type === 'sending_postoffice')) acc.notSent++
          return acc
        }, {
          total: 0,
          notArrived: 0,
          totalArrived: 0,
          notDelivery: 0,
          notSigned: 0,
          notRecorded: 0,
          notSent: 0
        })
        return sendSuccess(res, "Get incoming", countOrder)
      })
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/order/monitor/:postCode
 * @description admin monitor detail incoming order at post office
 * @access private
 */
orderAdminRoute.get('/supervision-incoming/:postCode/detail', async (req, res) => {
  try {
    let { beginDate, endDate } = req.query
    const postCode = req.params.postCode
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
    const page = req.query.page ? parseInt(req.query.page) : 0
    let { sortBy, orderIds, sender, receiver, shipper, customer, pickupStaff, collectCodStaff, confirmStaff, company, department, carFleet, cashPayment, orderStatus, codStatus, signed, canceledStatus, transportationMode, originPostOffice, destinationPostOffice, beginSendTime, endSendTime, beginConfirmTime, endConfirmTime, beginDeliveryTime, endDeliveryTime, beginSignTime, endSignTime, beginCollectCodTime, endCollectCodTime } = req.query
    destinationPostOffice = postCode
    const result = await getOrderWithFilters(pageSize, page, sortBy, orderIds, sender, receiver, shipper, customer, pickupStaff, collectCodStaff, confirmStaff, company, department, carFleet, cashPayment, orderStatus, codStatus, signed, canceledStatus, transportationMode, originPostOffice, destinationPostOffice, beginSendTime, endSendTime, beginConfirmTime, endConfirmTime, beginDeliveryTime, endDeliveryTime, beginSignTime, endSignTime, beginCollectCodTime, endCollectCodTime
    )
      .then(result => {
        if (beginDate && endDate) {
          const filteredOrders = result.filter((order) => {
            const trackingArray = order.tracking
            for (const tracking of trackingArray) {
              if (
                tracking.scan_type === "incoming_postoffice" &&
                new Date(tracking.scan_code_time) >= new Date(beginDate) &&
                new Date(tracking.scan_code_time) <= new Date(endDate)
              ) {
                return true
              }
            }
            return false
          });
          return filteredOrders
        } else {
          return result
        }
      })
      .then(filteredOrders => {
        if (filteredOrders === "Order not found") return sendError(res, "Order not found")
        const list = filteredOrders.map((order) => {
          const trackingSending = order.tracking.find(item => item.scan_type === "sending_postoffice");
          if (trackingSending) {
            return {
              orderId: order.orderId,
              sendingPost: order.originPostOfficeInfo[0]?.name,
              sendingDate: trackingSending.scan_code_time,
              nextPost: order.destinationPostOfficeInfo[0]?.name,
              weight: order.product.weight
            }
          } else {
            return null
          }
        })
        const filteredList = list.filter(item => item !== null);
        return sendSuccess(res, "Get detail incoming", { filteredList, count: filteredList.length })
      })
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/* @route GET /api/admin/order/order-form/:orderId
 * @description admin get pdf of order form
 * @access private
 */
orderAdminRoute.get('/order-form/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate('origin');

    if (order == null || order == undefined) {
      return sendError(res, "Order dose not exist");
    }

    const binaryResult = await PdfHelper.createOrderForm(order);

    res.setHeader('Content-disposition', `attachment; filename=${orderId}.pdf`);
    res.type('pdf').send(binaryResult);


  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/order/supervision-sending-detail/:postOfficeCode
 * @description admin supervise order sent detail with postOfficeCode
 * @access private
 */
orderAdminRoute.get('/supervision-sending-detail/:postOfficeCode', async (req, res) => {
  try {
    const { postOfficeCode } = req.params;
    const { page, pageSize, detail_type, from_date, to_date } = req.query;
    let fromDate = from_date;
    let toDate = to_date;

    const errors = validateGetSupervisionSendingDetail(postOfficeCode,
      detail_type, page, pageSize, fromDate, toDate);
    if (errors) return sendError(res, errors);

    if (postOfficeCode != null) {
      const postOffice = await PostOffice.findOne({ code: postOfficeCode });
      if (postOffice == null || postOffice == undefined) {
        return sendError(res, "Post office does not exist.")
      }
    }
    let orders = await getOrdersInSupervisionSending(postOfficeCode,
      detail_type, page, pageSize, fromDate, toDate);

    sendSuccess(res, 'success', orders, orders.length);
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/order/supervision-sending/:postOfficeCode
 * @description admin supervise order sent in post office
 * @access private
 */
orderAdminRoute.get('/supervision-sending/:postOfficeCode', async (req, res) => {
  try {
    const { postOfficeCode } = req.params;

    if (postOfficeCode == null || postOfficeCode == undefined) {
      return sendError(res, 'postOfficeCode is required');
    }
    if (postOfficeCode != null) {
      const postOffice = await PostOffice.findOne({ code: postOfficeCode });
      if (postOffice == null || postOffice == undefined) {
        return sendError(res, "Post office does not exist.")
      }
    }
    const { from_date, to_date } = req.query;

    let fromDate = from_date;
    let toDate = to_date;

    const errors = validateGetSupervisionSending(req.query);
    if (errors) return sendError(res, errors);
    const result = await getSupervisionSendingReport(postOfficeCode,
      fromDate, toDate);

    if (result[0] != null && result[0] != undefined) {
      sendSuccess(res, 'success', result[0]);
    }
    else {
      sendSuccess(res, 'success', {});
    }
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route PATCH /api/admin/order/update-postoffice
 * @description admin choose post office for order
 * @access private
 */
orderAdminRoute.patch('/update-postoffice/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { origin, destination } = req.body;
    const errors = validateUpdatePostOffice(req.body);
    if (errors) return sendError(res, errors);

    if (orderId == null || orderId == undefined) {
      return sendError(res, 'orderId in params is required');
    }

    let order = await Order.findOne({ orderId });

    if (order == null || order == undefined) {
      return sendError(res, 'order is not exist');
    }
    if (origin == destination) {
      return sendError(res, 'origin & destination must be different');
    }

    let _origin;
    let _destination;
    await Promise.all([
      PostOffice.findOne({ code: origin }).then((value) => {
        _origin = value;
      }),
      PostOffice.findOne({ code: destination }).then((value) => {
        _destination = value;
      }),
    ]);
    if (_origin == null || _origin == undefined) {
      return sendError(res, `post office - origin which has ${origin} code  is not exist`);
    }

    if (_destination == null || _destination == undefined) {
      return sendError(res, `post office - destination which has ${destination} code  is not exist`);
    }

    order.origin = _origin._id;
    order.destination = _destination._id;

    await order.save();

    return sendSuccess(res, 'Admin update order post office successfully', order);
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/order/in-warehouse
 * @description admin get order in warehouse
 * @access private
 */
orderAdminRoute.get('/in-warehouse', async (req, res) => {
  try {
    let { page, pageSize, warehouse, postOfficeCode } = req.query;
    let skipNum = (Number(page) - 1) * Number(pageSize);
    if (skipNum < 0) skipNum = 0;


    if (mongoose.isValidObjectId(warehouse) == false) {
      return sendError(res, `warehouse - ${warehouse} is not a valid objectId mongoose`)
    }

    const _warehouse = await Warehouse.findById(warehouse);
    if (_warehouse == null || _warehouse == undefined) {
      return sendError(res, `warehouse is not exist`);
    }

    let conditions = [
      {
        tracking: { $ne: null } // tracking not null
      },
      {
        $expr: { $gt: [{ $size: "$tracking" }, 0] } // tracking.length > 0
      }
    ];

    if (postOfficeCode != null && postOfficeCode != undefined) {
      const _postOffice = await PostOffice.findOne({
        code: postOfficeCode
      }).lean();
      if (_postOffice == null || _postOffice == undefined) {
        return sendError(res, `Post office - ${postOfficeCode} is not exit`);
      }

      conditions.push({
        destination: mongoose.Types.ObjectId(_postOffice._id),
      })
    }

    const orders = await Order.aggregate([
      {
        $match: {
          $and: conditions
        }
      },
      {
        $addFields: {
          lastTracking: {
            $last: "$tracking"
          },
        }
      },
      {
        $match: {
          $and: [
            { "lastTracking.scan_type": SCAN_TYPE.INCOMING_WAREHOUSE }, // check order in warehouse
            { "lastTracking.warehouse": mongoose.Types.ObjectId(warehouse) },
          ]
        }
      },
      {
        $limit: Number(pageSize),
      },
      {
        $skip: skipNum,
      },
      {
        $unset: [
          "lastTracking"
        ]
      },
    ]);

    return sendSuccess(res, 'Admin get orders in warehouse  successfully',
      orders,
      orders.length);
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/order/shipping-cost
 * @description calculate shipping fee
 * @access private
 */
orderAdminRoute.post('/shipping-cost', async (req, res) => {
  try {
    let code_area1 = '';
    let code_area2 = '';
    let fromProvince = '';
    let toProvince = '';
    let key = '';
    let shipCost = [];
    let checkInOut = '';
    const weight = req.body.weight
    const type_shipping = req.body.type_shipping
    const province_origin = req.body.province_origin
    const province_destination = req.body.province_destination
    const district_origin = req.body.district_origin
    const district_destination = req.body.district_destination
    const discount = req.body.discount
    const insurance_fee = req.body.insurance_fee

    const data = JSON.parse(fs.readFileSync(filePath));
    data.forEach((level1) => {
      const level1Name = level1.name.toLowerCase();
      if (level1Name.includes(province_origin.toLowerCase())) {
        fromProvince = level1.code_name;
      }
    });
    data.forEach((level1) => {
      const level1Name2 = level1.name.toLowerCase();
      if (level1Name2.includes(province_destination.toLowerCase())) {
        toProvince = level1.code_name;
      }
    });

    if (type_shipping == 'EXPRESS') {
      const data_express_standard = JSON.parse(fs.readFileSync(filePath_Express_Standard));
      data_express_standard[fromProvince].cities.forEach((city) => {
        if (city.code_name.includes(toProvince)) {
          code_area2 = city.code_area;
        }
      });
      code_area1 = data_express_standard[fromProvince].code_area;
      key = `${code_area1}-${code_area2}`;
      data_express_standard[fromProvince].level2s.forEach((level2) => {
        if (level2.level2_id.includes(key)) {
          shipCost = level2.cost;
        }
      });
    } else if (type_shipping == 'FAST') {
      const data_express_fast = JSON.parse(fs.readFileSync(filePath_Express_Fast));
      data_express_fast[fromProvince].cities.forEach((city) => {
        if (city.code_name.includes(toProvince)) {
          code_area2 = city.code_area;
        }
      });
      code_area1 = data_express_fast[fromProvince].code_area;
      key = `${code_area1}-${code_area2}`;
      data_express_fast[fromProvince].level2s.forEach((level2) => {
        if (level2.level2_id.includes(key)) {
          shipCost = level2.cost;
        }
      });
    } else if (type_shipping == 'SUPER') {
      if (weight > 10) {
        return sendError(res, "Weight is not allowed to be more than 10kg.");
      }
      const data_express_super = JSON.parse(fs.readFileSync(filePath_Express_Super));
      data_express_super[fromProvince].cities.forEach((city) => {
        if (city.code_name.includes(toProvince)) {
          code_area2 = city.code_area;
          if (city.In.toLowerCase().includes(district_destination.toLowerCase())) {
            checkInOut = 'In';
          }
          else if (city.Out.toLowerCase().includes(district_destination.toLowerCase()))
            checkInOut = 'Out';
          return;
        }
      });
      code_area1 = data_express_super[fromProvince].code_area;
      key = `${code_area1}-${code_area2}`;
      data_express_super[fromProvince].level2s.forEach((level2) => {
        if (level2.level2_id.includes(key)) {
          if (checkInOut == 'In')
            shipCost = level2.costIn;
          else
            shipCost = level2.costOut;
        }
      });
    }
    const fee = await Fee.findOne({});
    const totalPrice = calculateShippingOrderCost(weight, shipCost, fee.fuel_fee, fee.VAT, type_shipping, discount, insurance_fee);
    return sendSuccess(res, "Successfully", { shipping_cost: totalPrice });

  } catch (error) {
    console.log(error);
    sendServerError(res, error);
  }
});

orderAdminRoute.post('/insurance-fee', async (req, res) => {
  try {
    const goods_value = req.body.goods_value
    let before_discount = req.body.before_discount
    let after_discount = 0
    let discount = req.body.discount
    if (goods_value === '')
      return sendError(res, "Please enter goods value");
    const insurance_fee = Math.ceil(goods_value * 0.01);
    const fee = await Fee.findOne({});
    before_discount = before_discount + insurance_fee
    after_discount = before_discount - discount
    const VAT_fee = after_discount * fee.VAT / 100
    const after_discount_tax = Math.ceil(after_discount + VAT_fee)
    return sendSuccess(res, "Get shipping fee after insurance successfully", {
      shipping_cost: {
        insurance_fee: insurance_fee,
        before_discount: before_discount,
        after_discount: after_discount,
        VAT_fee: VAT_fee,
        after_discount_tax: after_discount_tax
      }
    })

  } catch (error) {
    console.log(error);
    sendServerError(res, error);
  }

});

/**
 * @route PUT /api/admin/order
 * @description admin update a just created order
 * @access private
 */
orderAdminRoute.put('/:id', async (req, res) => {
  try {

    const { id } = req.params
    console.log("id: ", id)
    const curOrder = await Order.findById(id)
    if(!curOrder) return sendError(res, 'Order not found')
    const lastStatus = curOrder.timeline[curOrder.timeline.length - 1].status
    if(lastStatus !== ORDER_STATUS.waiting_for_pickup) return sendError(res, 'Cannot edit this order')
    const shippingId = curOrder.shipping.id

    let {
      origin,
      destination,
      pickup_staff,
      customer,
      note,
    } = req.body;

    const errors = createOrderByAdminValidate(req.body)
    if (errors) return sendError(res, errors)

    let sender = {
      name: req.body.sender.name,
      phone: req.body.sender.phone,
      email: req.body.sender.email,
      address: req.body.sender.address
    }

    let receiver = {
      name: req.body.receiver.name,
      phone: req.body.receiver.phone,
      email: req.body.receiver.email,
      address: req.body.receiver.address
    }

    let product = {
      name: req.body.product.product_name,
      weight: req.body.product.weight,
      goods_value: req.body.product.goods_value,
      quantity: req.body.product.quantity,
      types: req.body.product.product_types,
      cash_payment: req.body.product.cash_payment,
      transportation: req.body.product.transportation,
      note: note
    }
    let shipping = {
      type_shipping: req.body.shipping.type_shipping,
      standard_fee: req.body.shipping.standard_fee,
      fuel_surcharge: req.body.shipping.fuel_surcharge,
      receiver_fee: req.body.shipping.receiver_fee,
      remote_areas_surcharge: req.body.shipping.remote_areas_surcharge,
      other: req.body.shipping.other,
      tax_VAT_value: req.body.shipping.VAT_fee,
      tax_code: req.body.shipping.VAT_code,
      total_amount_before_discount: req.body.shipping.before_discount,
      insurance_fees: req.body.shipping.insurance_fee,
      total_amount_after_discount: req.body.shipping.after_discount,
      total_amount_after_tax_and_discount: req.body.shipping.after_discount_tax,
      discount: req.body.shipping.discount,
    }

    const company = {
      name: req.body.company.name,
      address: req.body.company.address,
      note: note,
    }

    const cod = {
      cod: req.body.cod.cod,
      fee: req.body.cod.fee
    }

    const order = await Order.findByIdAndUpdate(id, {
      $set: {
        customer: customer,
        sender: sender,
        receiver: receiver,
        origin: origin,
        destination: destination,
        shipping: { id: shippingId, ...shipping },
        product: product,
        cod: cod,
        company: company,
        pickUpStaff: pickup_staff,
        confirmStaff: req.decoded.roleId,
      },
      $push: {
        timeline: {
          status: ORDER_STATUS.in_progress,
        },
      },
    }, { new: true });
    return sendSuccess(res, "Update order successfully", order)
  } catch (error) {
    console.log(error);
    return sendServerError(res)
  }
})

export default orderAdminRoute
