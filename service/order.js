import mongoose from "mongoose"
import { ORDER_STATUS, PICK_UP_AT, NOTIFY_EVENT, COD_STATUS, SCAN_TYPE, STAFF, SUPERVISION_SENDING_DETAIL_TYPE, ORDER_SEAL_ITEM_STATUS, PICKUP_METHOD } from "../constant.js"
import Order from "../model/Order.js"
import Product from "../model/Product.js"
import DeliveryService from "../model/DeliveryService.js"
import Customer from "../model/Customer.js"
import User from "../model/User.js"
import { sendError, sendServerError, sendSuccess, sendAutoMail, sendAutoSMS } from "../helper/client.js";
import { io } from "socket.io-client"
import { CASH_PAYMENT } from "../constant.js";
import Staff from "../model/Staff.js";
import PostOffice from "../model/PostOffice.js";
import Warehouse from "../model/Warehouse.js"
import moment from "moment"
import OrderSeal from "../model/OrderSeal.js";
import { sign } from "crypto"

/**
 * generate ID for an order
 * @returns {string} generated order ID
 */
export const genarateOrderID = async () => {
  try {
    while (true) {
      const orderId = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();
      const isExist = await Order.exists({
        orderId,
      });
      if (!isExist) {
        return orderId;
      }
    }

  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 * generate ID for an order
 * @returns {string} generated order ID
 */
export const genarateBillofLandingID = async () => {
  try {
    while (true) {
      const billId = Math.floor(
        100000000 + Math.random() * 900000000
      ).toString();
      return billId;
    }

  } catch (error) {
    console.log(error);
    return null;
  }
};
/**
 * calculate order fee
 * @param {ObjectId} orderId
 * @returns {Number|null}
 */
export const calculateOrderFee = async (orderId) => {
  let fee = null;
  try {
    const products = await Product.find({ order: orderId }).populate(
      "product_shipments",
      "value quantity"
    );
    products.forEach((pro) => {
      pro.product_shipments.forEach((shipment) => {
        fee += shipment.value * shipment.quantity;
      });
    });
  } catch (error) {
    console.log(error);
  }
  return fee;
};

export const canChangeOrderStatus = async (order, nxtSta) => {
  try {
    const curSta = order.timeline[order.timeline.length - 1].status;
    if (!curSta) return false;
    if (curSta === ORDER_STATUS.waiting_for_pickup && (nxtSta === ORDER_STATUS.in_progress || nxtSta === ORDER_STATUS.canceled)) {
      return true
    } else if (curSta === ORDER_STATUS.in_progress && (nxtSta === ORDER_STATUS.dispatching)) {
      return true
    } else if (curSta === ORDER_STATUS.dispatching && (nxtSta === ORDER_STATUS.dispatched || nxtSta === ORDER_STATUS.problem_order)) {
      return true
    } else if (curSta === ORDER_STATUS.problem_order && (nxtSta === ORDER_STATUS.dispatched || nxtSta === ORDER_STATUS.in_return)) {
      return true
    } else if (curSta === ORDER_STATUS.in_return && nxtSta === ORDER_STATUS.return_confirmation) {
      return true
    } else if (curSta === ORDER_STATUS.return_confirmation && nxtSta === ORDER_STATUS.return_success) {
      return true
    } else { return false }
  } catch (error) {
    console.log(error)
    return false
  }
};

//send feeback order to user
export const sendFeedback = async (staffId, content, IdCustomer) => {
  try {
    const staff = await User.findById(staffId);
    const customer = await Customer.findById(IdCustomer);
    const user = await User.findOne({ role: customer._id });
    if (staff.email) {
      const optionsStaff = {
        from: process.env.MAIL_HOST,
        to: staff.email,
        subject: "[noreply-Logistics Webapp]  Feedback customer",
        html: `<p>Feedback của khách hàng: ${customer.name}</p>
                   <p>IdCustomer: ${IdCustomer}</p>
                   <P>Nội dung: ${content}</p>`,
      };
      const sendMailToStaff = await sendAutoMail(optionsStaff);
    } else {
      //Send SMS
      const optionsStaff = {
        from: process.env.PHONE_NUMBER,
        to: staff.phone,
        body: `Feedback từ khách hàng: ${customer.name} có ID: ${IdCustomer} với nội dung: ${content}`,
      };
      const senSMSToStaff = await sendAutoSMS(optionsStaff);
    }

    if (user.email) {
      const optionsCustomer = {
        from: process.env.MAIL_HOST,
        to: user.email,
        subject: "[noreply-Logistics Webapp]  Feedback customer",
        html: `<p>Chúng tôi đã nhân được feedback từ quý khách </p>
                       <P>Nội dung: ${content}</p>
                       <P>Xin chân thành sự phản hồi của quý khách !</p>`,
      };
      const sendMailToCustomer = await sendAutoMail(optionsCustomer);
    } else {
      const optionsCustomer = {
        from: process.env.PHONE_NUMBER,
        to: user.phone,
        body: `Chúng tôi đã nhận được feedback từ bạn, Xin chân thành cảm ơn sự phản hồi của quý khách`,
      };
      const sendSMSToCustomer = await sendAutoSMS(optionsCustomer);
    }
    const nameCustomer = customer.name;
    const socket = io(process.env.SOCKET_SERVER, { reconnection: true });
    socket.emit(NOTIFY_EVENT.send, staffId, {
      IdCustomer,
      nameCustomer,
      content,
    });
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
};

export const sendtokenfeedbacktoCustomer = async (customerID, content) => {
  const socket = io(process.env.SOCKET_SERVER, { reconnection: true });
  socket.emit(NOTIFY_EVENT.send, customerID, { content });
};

export const sendOrderMessageToCustomer = async (orderId, message, ...moreInfo) => {
  try {
    const order = await Order.findOne({ orderId });
    const customerId = order.customer;
    const user = await User.findOne({ role: customerId });
    const products = await Product.find({ customerId });
    const delivery_services = await DeliveryService.findOne({
      _id: order.service,
    });

    if (user.email) {
      //send email
      const options = {
        from: process.env.MAIL_HOST,
        to: user.email,
        subject: "[noreply-Logistics Webapp] Order details information",
        html: `<p>${message}</b>.</p>
                             <p>Dịch vụ của bạn: ${delivery_services.name}</p>
                             <p>Mã Đơn hàng: ${order.orderId}</p>
                             <p>${moreInfo}</p>
                             `,
      };
      const sendMailSuccess = await sendAutoMail(options);
      if (!sendMailSuccess) return false;
    } else {
      //Send SMS
      const options = {
        from: process.env.PHONE_NUMBER,
        to: user.phone,
        body: `${message}. Dịch vụ của bạn: ${order.service.name}. Mã đơn hàng: ${order.orderId}, ${moreInfo}`,
      };
      const sendSMSSuccess = await sendAutoSMS(options);
      if (!sendSMSSuccess) return false;
    }
    const serviceName = delivery_services.name;
    const userId = user._id;
    const socket = io(process.env.SOCKET_SERVER, { reconnection: true });
    socket.emit(NOTIFY_EVENT.send, userId, {
      order,
      products,
      serviceName,
      orderId,
    });
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const getOrderWithFilters = async (pageSize, page, sortBy, orderIds, sender, receiver, shipper, customer, pickupStaff, collectCodStaff, confirmStaff, company, department, carFleet, cashPayment, orderStatus, codStatus, signed, canceledStatus, transportationMode, originPostOffice, destinationPostOffice, beginSendTime, endSendTime, beginConfirmTime, endConfirmTime, beginDeliveryTime, endDeliveryTime, beginSignTime, endSignTime, beginCollectCodTime, endCollectCodTime) => {
  try {
    const orderIdArray = orderIds !== undefined && orderIds !== "" ? orderIds.split("\n") : [];
    const pipeline = [
      {
        $lookup: {
          from: "discounts",
          localField: "shipping.discount",
          foreignField: "_id",
          as: "discountInfo"
        }
      },
      {
        $lookup: {
          from: "taxes",
          localField: "shipping.VAT",
          foreignField: "_id",
          as: "taxInfo"
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "tracking.shipper",
          foreignField: "_id",
          as: "shipperInfo"
        }
      },
      {
        $lookup: {
          from: "departments",
          localField: "shipperInfo.department",
          foreignField: "_id",
          as: "departmentInfo"
        }
      },
      {
        $lookup: {
          from: "car_fleets",
          localField: "shipperInfo.car_fleet",
          foreignField: "_id",
          as: "carFleetInfo"
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "pickUpStaff",
          foreignField: "_id",
          as: "pickUpStaffInfo"
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "confirmStaff",
          foreignField: "_id",
          as: "confirmStaffInfo",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo"
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "origin",
          foreignField: "_id",
          as: "originPostOfficeInfo"
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "destination",
          foreignField: "_id",
          as: "destinationPostOfficeInfo"
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "cod.collectedBy",
          foreignField: "_id",
          as: "collectCodStaffInfo"
        }
      },
      {
        $project: {
          shipperInfo: {
            $mergeObjects: [
              { $arrayElemAt: ["$shipperInfo", 0] },
              {
                department: { $arrayElemAt: ["$departmentInfo", 0] },
                car_fleet: { $arrayElemAt: ["$carFleetInfo", 0] }
              }
            ]
          },
          collectCodStaffInfo: 1,
          orderId: 1,
          customer: 1,
          sender: 1,
          receiver: 1,
          origin: 1,
          destination: 1,
          route: 1,
          company: 1,
          timeline: 1,
          feedback: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          cod: 1,
          tracking: 1,
          cash_payment: 1,
          shipping: 1,
          shippingInfo: 1,
          sendingInfo: 1,
          pickUpStaffInfo: 1,
          confirmStaffInfo: 1,
          deliverySign: 1,
          deliveryTime: 1,
          product: 1,
          lastStatus: 1,
          lastCodStatus: 1,
          customerInfo: 1,
          originPostOfficeInfo: 1,
          destinationPostOfficeInfo: 1,
        }
      },
      {
        $addFields: {
          "shipping.discount": {
            $arrayElemAt: ["$discountInfo", 0]
          },
          "shipping.VAT": {
            $arrayElemAt: ["$taxInfo", 0]
          },
          lastStatus: { $arrayElemAt: ["$timeline", -1] },
          confirmTime: {
            $cond: {
              if: { $isArray: "$timeline" },
              then: {
                $let: {
                  vars: {
                    in_progressStatus: {
                      $filter: {
                        input: "$timeline",
                        as: "timeline",
                        cond: { $eq: ["$$timeline.status", "in progress"] },
                      },
                    },
                  },
                  in: { $arrayElemAt: ["$$in_progressStatus.time", 0] },
                },
              },
              else: null,
            },
          },
          deliveryTime: {
            $cond: {
              if: { $isArray: "$timeline" },
              then: {
                $let: {
                  vars: {
                    dispatchedStatus: {
                      $filter: {
                        input: "$timeline",
                        as: "timeline",
                        cond: { $eq: ["$$timeline.status", "dispatched"] },
                      },
                    },
                  },
                  in: { $arrayElemAt: ["$$dispatchedStatus.time", 0] },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $match: {
          $and: [
            signed ? { "sign.signed_to_receive": { $exists: signed === "signed" ? true : false } } : {},
            canceledStatus && canceledStatus === true ? { "lastStatus.status": "canceled" } : {},
            collectCodStaff ? { "collectCodStaffInfo.name": { $regex: collectCodStaff, $options: "i" } } : {},
            pickupStaff ? { "pickUpStaffInfo.name": { $regex: pickupStaff, $options: "i" } } : {},
            confirmStaff ? { "confirmStaffInfo.name": { $regex: confirmStaff, $options: "i" } } : {},
            shipper ? { "shipperInfo.name": { $regex: shipper, $options: "i" } } : {},
            company ? { "company.name": { $regex: company, $options: "i" } } : {},
            department ? { "shipperInfo.department.name": { $regex: department, $options: "i" } } : {},
            carFleet ? { "shipperInfo.car_fleet.name": { $regex: carFleet, $options: "i" } } : {},
            customer ? { "customerInfo.name": { $regex: customer, $options: "i" } } : {},
            transportationMode ? { "product.transportation": transportationMode } : {},
            cashPayment ? { "product.cash_payment": cashPayment } : {},
            beginSendTime && endSendTime ? { "createdAt": { $gte: new Date(beginSendTime), $lte: new Date(endSendTime) } } : {},
            beginDeliveryTime && endDeliveryTime ? { deliveryTime: { $gte: new Date(beginDeliveryTime), $lte: new Date(endDeliveryTime) } } : {},
            beginSignTime && endSignTime ? { "sign.time": { $gte: new Date(beginSignTime), $lte: new Date(endSignTime) } } : {},
            beginConfirmTime && endConfirmTime ? { confirmTime: { $gte: new Date(beginConfirmTime), $lte: new Date(endConfirmTime) } } : {},
            beginCollectCodTime && endCollectCodTime ? { "cod.time_collected": { $gte: new Date(beginCollectCodTime), $lte: new Date(endCollectCodTime) } } : {},
            codStatus ? { "cod.status": codStatus } : {},
            orderStatus ? { "lastStatus.status": orderStatus } : {},
            originPostOffice ? {
              $or: [
                { "originPostOfficeInfo.cod": { $regex: originPostOffice, $options: "i" } },
                { "originPostOfficeInfo.name": { $regex: originPostOffice, $options: "i" } },
                { "originPostOfficeInfo.province": { $regex: originPostOffice, $options: "i" } },
              ]
            } : {},
            destinationPostOffice ? {
              $or: [
                { "destinationPostOfficeInfo.code": { $regex: destinationPostOffice, $options: "i" } },
                { "destinationPostOfficeInfo.name": { $regex: destinationPostOffice, $options: "i" } },
                { "destinationPostOfficeInfo.province": { $regex: destinationPostOffice, $options: "i" } },
              ]
            } : {},
            sender ? {
              $or: [
                { "sender._id": { $regex: sender, $options: "i" } },
                { "sender.name": { $regex: sender, $options: "i" } },
                { "sender.phone": { $regex: sender, $options: "i" } },
              ]
            } : {},
            receiver ? {
              $or: [
                { "receiver._id": { $regex: receiver, $options: "i" } },
                { "receiver.name": { $regex: receiver, $options: "i" } },
                { "receiver.phone": { $regex: receiver, $options: "i" } },
              ]
            } : {},
            orderIdArray.length > 0 ? { orderId: { $in: orderIdArray } } : {},
          ]
        }
      },
      { $sort: { [sortBy || "createdAt"]: 1 } },
      { $skip: pageSize * page },
      { $limit: pageSize || 100 }
    ];
    const results = await Order.aggregate(pipeline);
    if (results.length === 0) {
      return [];
    }
    return results;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const handleGroupOrderByDeliveryStaff = async (result) => {
  try {
    const shipper = result[result.length - 1].shipperInfo.name
    const id = result[result.length - 1].shipperInfo.code
    const timeCollected = result[result.length - 1].shipping.collected_time
    const totalData = result.reduce((acc, item) => {
      const { shipperInfo, cod, shipping, product, lastStatus } = item;
      if (!acc[shipperInfo._id]) {
        acc[shipperInfo._id] = {
          moneyPP: product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : 0,
          moneyCC: product.cash_payment === CASH_PAYMENT.CC_CASH ? (lastStatus.status === ORDER_STATUS.return_success ? ((parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0)) : 0,
          cod: parseInt(cod.cod) ?? 0,
          count: 1
        };
      } else {
        acc[shipperInfo._id].moneyPP += product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0) : 0,
        acc[shipperInfo._id].moneyCC += product.cash_payment === CASH_PAYMENT.CC_CASH ? (lastStatus.status === ORDER_STATUS.return_success ? ((parseInt(shipping.total_amount_after_tax_and_discount) * 2) ?? 0) : (parseInt(shipping.total_amount_after_tax_and_discount) ?? 0)) : 0,
        acc[shipperInfo._id].cod += parseInt(cod.cod) ?? 0,
        acc[shipperInfo._id].count += 1;
      }
      return acc;
    }, {});
    const codTable = result.map((item) => {
      return {
        time: item.createdAt,
        shippingId: item.shipping.id,
        date: item.createdAt,
        moneyPP: item.product.cash_payment === CASH_PAYMENT.PP_CASH ? (parseInt(item.shipping.total_amount_after_tax_and_discount) ?? 0) : 0,
        moneyCC: item.product.cash_payment === CASH_PAYMENT.CC_CASH ? (item.lastStatus.status === ORDER_STATUS.return_success ? ((parseInt(item.shipping.total_amount_after_tax_and_discount) * 2) ?? 0) : (parseInt(item.shipping.total_amount_after_tax_and_discount) ?? 0)) : 0,
        COD: parseInt(item.cod.cod) ?? 0
      }
    });
    const newData = {
      shipper: shipper,
      code: id,
      time_collected: timeCollected,
      total: totalData,
      table: codTable
    }
    return newData;
  } catch (error) {
    console.log(error)
  }
}

export const handleAdminScanOrderValue = async (req, staffId, orderId) => {
  let scan_body = {
    scan_type: req.body.scan_type,
    scan_code_time: new Date(req.body.scan_code_time),
    confirm_staff: staffId,
  }

  let post_office = null;

  switch (req.body.scan_type) {
    case SCAN_TYPE.RECEIVED_ORDER:
      post_office = req.body.post_office;
      break;
    case SCAN_TYPE.SENDING_POSTOFFICE:
      post_office = req.body.post_office;
      scan_body = {
        ...scan_body,
        driver: req.body.driver,
        transportation: req.body.transportation,
      }
      break;
    case SCAN_TYPE.INCOMING_POSTOFFICE:
      post_office = req.body.post_office;
      scan_body = {
        ...scan_body,
        driver: req.body.driver,
        transportation: req.body.transportation,
      }
      break;
    case SCAN_TYPE.SENDING_WAREHOUSE:
      scan_body = {
        ...scan_body,
        warehouse: req.body.warehouse,
        driver: req.body.driver,
        transportation: req.body.transportation,
      }
      break;
    case SCAN_TYPE.INCOMING_WAREHOUSE:
      scan_body = {
        ...scan_body,
        warehouse: req.body.warehouse,
        driver: req.body.driver,
        transportation: req.body.transportation,
      }
      break;
    case SCAN_TYPE.SHIPPING:
      post_office = req.body.post_office;
      scan_body = {
        ...scan_body,
        shipper: req.body.shipper,
        transportation: req.body.transportation,
      }
      break;
    case SCAN_TYPE.UNUSUAL_ORDER:
      post_office = req.body.post_office;
      scan_body = {
        ...scan_body,
        issueType: req.body.issueType,
      }
      break;
    case SCAN_TYPE.PACKAGING:
      post_office = req.body.post_office;
      scan_body = {
        ...scan_body,
        seal_code: req.body.seal_code,
        warehouse: req.body.warehouse,
      }
      break;
    case SCAN_TYPE.REMOVE_PACKAGING:
      post_office = req.body.post_office;
      scan_body = {
        ...scan_body,
        seal_code: req.body.seal_code,
      }
      break;
    default:
    // code block
  }

  if (scan_body.hasOwnProperty('driver')) {
    if (mongoose.isValidObjectId(scan_body.driver) == false) {
      return "driver is not valid ObjectId";
    }
    const driver = await Staff.findById(scan_body.driver);
    if (driver == null || driver == undefined) {
      return "Staff driver does not exist."
    }
    if (driver.staff_type != STAFF.DRIVER) {
      return "This staff is not driver."
    }
  }

  if (scan_body.hasOwnProperty('shipper')) {
    if (mongoose.isValidObjectId(scan_body.shipper) == false) {
      return "shipper is not valid ObjectId";
    }
    const shipper = await Staff.findById(scan_body.shipper);
    if (shipper == null || shipper == undefined) {
      return "Staff does not exist."
    }
    if (shipper.staff_type != STAFF.SHIPPER) {
      return "Staff is not shipper."
    }
  }

  if (post_office != null) {
    if (mongoose.isValidObjectId(post_office) == false) {
      return "post_office is not valid ObjectId";
    }
    const postOffice = await PostOffice.findById(post_office);
    if (postOffice == null || postOffice == undefined) {
      return "Post office does not exist."
    }
  }

  if (scan_body.hasOwnProperty('warehouse')) {
    if (mongoose.isValidObjectId(scan_body.warehouse) == false) {
      return "warehouse is not valid ObjectId";
    }
    const warehouse = await Warehouse.findById(scan_body.warehouse);
    if (warehouse == null || warehouse == undefined) {
      return "Warehouse does not exist."
    }
  }

  if (scan_body.hasOwnProperty('seal_code')) {
    let status, value;
    if (scan_body.scan_type == SCAN_TYPE.PACKAGING) {
      status = ORDER_SEAL_ITEM_STATUS.IN;
      value = 1
    }
    if (scan_body.scan_type == SCAN_TYPE.REMOVE_PACKAGING) {
      status = ORDER_SEAL_ITEM_STATUS.OUT;
      value = -1
    }
    const orderSeal = await OrderSeal.findOneAndUpdate(
      {
        code: scan_body.seal_code,
        "orders.orderId": orderId,
      },
      {
        $set: {
          "orders.$.status": status,
        },
        $inc: { num_orders_in_seal: value, }
      }
    );
    if (orderSeal == null || orderSeal == undefined) {
      return "Order seal does not exist."
    }
    if (scan_body.scan_type == SCAN_TYPE.PACKAGING) {

    }
  }

  const order = await Order.findOne({ orderId })
  if (!order) return "Order does not exist."

  // Update last tracking if have same scan_type and confirm_staff
  // else add new in tracking
  if (order.tracking == undefined) {
    order.tracking = [];
    order.tracking.push(scan_body);
  }
  else {
    const lenTrackings = order.tracking.length;
    if (lenTrackings == 0) {
      order.tracking.push(scan_body);
    }
    else {
      if (order.tracking[lenTrackings - 1].scan_type == scan_body.scan_type &&
        order.tracking[lenTrackings - 1].confirm_staff == scan_body.confirm_staff) {
        order.tracking[lenTrackings - 1] = scan_body;
      }
      else {
        order.tracking.push(scan_body);
      }
    }
  }
  let updateValue = {
    tracking: order.tracking
  }

  if (post_office != null) {
    if (req.body.scan_type == SCAN_TYPE.SENDING_POSTOFFICE) {
      updateValue = {
        ...updateValue,
        origin: post_office,
      }
    }
    if (req.body.scan_type == SCAN_TYPE.RECIVED_ORDER ||
      req.body.scan_type == SCAN_TYPE.UNUSUAL_ORDER
      || req.body.scan_type == SCAN_TYPE.INCOMING_POSTOFFICE) {
      updateValue = {
        ...updateValue,
        destination: post_office,
      }
    }
  }
  return updateValue;
}

export const getOrdersInSupervisionSending = async (postOfficeCode,
  detail_type, page, pageSize, fromDate, toDate) => {
  let limmitValue = Number(pageSize);
  let skipValue = (Number(page) - 1) * Number(pageSize);

  if (skipValue < 0) {
    skipValue = 0;
  }
  let matchValue = {};
  switch (detail_type) {
    case SUPERVISION_SENDING_DETAIL_TYPE.SENT:
      matchValue = {
        valueSent: 1,
      };
      break;
    case SUPERVISION_SENDING_DETAIL_TYPE.NOT_SENT:
      matchValue = {
        valueSent: 0,
      };
      break;
    case SUPERVISION_SENDING_DETAIL_TYPE.NOT_REVICED:
      matchValue = {
        valueShipped: 1
      };
      break;
    case SUPERVISION_SENDING_DETAIL_TYPE.NOT_SHIPPED:
      matchValue = {
        valueShipped: 0
      };
      break;
    case SUPERVISION_SENDING_DETAIL_TYPE.NOT_SIGN_RECIVED:
      matchValue = {
        valueNotSignReviced: 1
      };
      break;
    default:
    // code block
  }

  const result = await Order.aggregate([
    {
      $match: {
        "origin": { $ne: null },
        createdAt: {
          $gte: new Date(fromDate),
          $lt: new Date(toDate)
        }
      }
    },
    {
      $addFields: {
        valueSent: {
          // valueSent = 1 when trackings has tracking.scan_type = sending_postoffice
          // valueSent = 0 
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "sending_postoffice"] }
                }
              }
            },
            in: { $min: [{ $size: "$$resTracking" }, 1] }
          }
        },
        valueReviced: {
          // valueRevice = 1 when trackings has tracking.scan_type = incoming_postoffice
          // valueRevice = 0 
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "incoming_postoffice"] }
                }
              }
            },
            in: { $min: [{ $size: "$$resTracking" }, 1] }
          }
        },
        valueShipped: {
          // valueShipped = 1 when trackings has tracking.scan_type = shipping
          // valueShipped = 0 
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "shipping"] }
                }
              }
            },
            in: { $min: [{ $size: "$$resTracking" }, 1] }
          }
        },
        valueNotSignReviced: {
          $cond: [{
            $or: [
              { $eq: ["$sign.signed_to_receive", null] },
              { $eq: ["$sign.signed_to_receive", false] }
            ]
          }, 1, 0]
        }
      }
    },
    {
      $match: matchValue
    },
    {
      $lookup: {
        from: "post_offices",
        localField: "origin",
        foreignField: "_id",
        as: "post_office"
      }
    },
    { $unwind: { path: "$post_office" } },
    {
      $match: {
        "post_office.code": postOfficeCode
      }
    },
    {
      $project: {
        orderId: 1,
        post_office: 1,
        sender: 1,
        tracking: 1,
        sign: 1,
      }
    },
    { "$limit": limmitValue },
    { "$skip": skipValue },
  ]);
  return result;
}

export const getSupervisionSendingReport = async (postOfficeCode,
  fromDate, toDate) => {
  const result = await Order.aggregate([
    {
      $match: {
        "origin": { $ne: null },
        createdAt: {
          $gte: new Date(fromDate),
          $lt: new Date(toDate)
        }
      }
    },

    {
      $project: {
        origin: 1,
        valueSent: {
          // valueSent = 1 when trackings has tracking.scan_type = sending_postoffice
          // valueSent = 0 
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "sending_postoffice"] }
                }
              }
            },
            in: { $min: [{ $size: "$$resTracking" }, 1] }
          }
        },
        valueReviced: {
          // valueRevice = 1 when trackings has tracking.scan_type = incoming_postoffice
          // valueRevice = 0 
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "incoming_postoffice"] }
                }
              }
            },
            in: { $min: [{ $size: "$$resTracking" }, 1] }
          }
        },
        valueShipped: {
          // valueShipped = 1 when trackings has tracking.scan_type = shipping
          // valueShipped = 0 
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "shipping"] }
                }
              }
            },
            in: { $min: [{ $size: "$$resTracking" }, 1] }
          }
        },
        valueNotSignReviced: {
          $cond: [{
            $or: [
              { $eq: ["$sign.signed_to_receive", null] },
              { $eq: ["$sign.signed_to_receive", false] }
            ]
          }, 1, 0]
        }
      }
    },
    {
      $group: {
        _id: "$origin",
        countSent: { $sum: "$valueSent" },
        countNotSent: {
          $sum: {
            $subtract: [1, "$valueSent"]
          }
        },
        countNotReviced: {
          $sum: {
            $subtract: [1, "$valueReviced"]
          }
        },
        countNotSignReviced: { $sum: "$valueNotSignReviced" },
        countNotShipped: {
          $sum: {
            $subtract: [1, "$valueShipped"]
          }
        },
      }
    },
    {
      $project: {
        postOfficeId: "$_id",
        _id: false,
        num_orders_Sent: "$countSent",
        num_orders_NotSent: "$countNotSent",
        num_orders_NotShipped: "$countNotShipped",
        num_orders_NotReviced: "$countNotReviced",
        num_orders_NotSignReviced: "$countNotSignReviced",
      }
    },
    {
      $lookup: {
        from: "post_offices",
        localField: "postOfficeId",
        foreignField: "_id",
        as: "post_office"
      }
    },
    { $unwind: { path: "$post_office" } },
    {
      $match: {
        "post_office.code": postOfficeCode
      }
    },
  ]);
  return result;
}

export const handleSupervisionDelivery = async (startDate, endDate, postOffice, staff) => {
  const data = []
  for (let i = 0; i < staff.length; i++) {
    let order = await Order.find({
      destination: postOffice._id, tracking: {
        $elemMatch: {
          scan_type: "shipping",
          shipper: staff[i]._id,
          scan_code_time: { $gte: startDate, $lte: endDate }
        }
      }
    }).lean()
    if (order.length === 0) {
      data.push({
        postOffice: postOffice.name,
        startDate: startDate,
        shipper: staff[i].name,
        codeShipper: staff[i].code,
        totalOrder: order.length,
        signed_number: 0,
        unsigned_number: 0,
        refund_number: 0,
        delivery_rate: "0%"
      })
    } else {
      let signed_number = 0, refund_number = 0, unusual_number = 0
      order.forEach(order => {
        if (order.tracking[order.tracking.length - 1] === "unusual_order") { unusual_number++ }
        else if (order.tracking[order.tracking.length - 1] === "recived_order") { signed_number++ }
        else if (order.status === "in return") { refund_number++ }
      })
      data.push({
        postOffice: postOffice.name,
        startDate: startDate,
        shipper: staff[i].name,
        codeShipper: staff[i].code,
        totalOrder: order.length,
        signed_number: signed_number,
        unsigned_number: order.length - signed_number,
        refund_number: refund_number,
        delivery_rate: `${signed_number * 100 / order.length}%`
      })
    }
  }
  return data
}

export const handleSupervisionDeliveryDetail = async (startDate, endDate, postOffice, staff) => {
  let order = await Order.aggregate([
    {
      $match: {
        destination: postOffice._id,
        tracking: {
          $elemMatch: {
            scan_type: "shipping",
            shipper: staff._id,
            scan_code_time: { $gte: startDate, $lte: endDate }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        orderId: 1,
        service: "$product.service",
        postOffice: postOffice.name,
        timeDelivery: {
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "shipping"] }
                }
              }
            },
            in: { $first: "$$resTracking.scan_code_time" }
          }
        },
        staffDeliveryName: staff.name,
        staffDeliveryCode: staff.code,
        timeUnusual: {
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "unusual_order"] }
                }
              }
            },
            in: { $first: "$$resTracking.scan_code_time" }
          }
        },
        reason: {
          $let: {
            vars: {
              resTracking: {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "unusual_order"] }
                }
              }
            },
            in: { $first: "$$resTracking.issueType" }
          }
        },
        timeSigned: {
          $cond: {
            if:
            {
              $let: {
                vars: {
                  resTracking: {
                    $filter: {
                      input: "$tracking",
                      as: "track",
                      cond: { $eq: ["$$track.scan_type", "recived_order"] }
                    }
                  }
                },
                in: { $first: "$$resTracking.scan_code_time" }
              }
            }, then: { $last: "$tracking.scan_code_time" }, else: "null"
          }
        },
        postOfficeSigned: {
          $cond: {
            if: {
              $let: {
                vars: {
                  resTracking: {
                    $filter: {
                      input: "$tracking",
                      as: "track",
                      cond: { $eq: ["$$track.scan_type", "unusual_order"] }
                    }
                  }
                },
                in: { $first: "$$resTracking.issueType" }
              }
            }, then: postOffice.code, else: "null"
          }
        },
        totalAmountAfterDiscount: {
          $cond: [{ $gt: ["$shipping.total_amount_after_discount", "0"] }, "$shipping.total_amount_after_discount", "0"]
        },
        totalAmountAfterTaxAndDiscount: {
          $cond: [{ $gt: ["$shipping.total_amount_after_tax_and_discount", "0"] }, "$shipping.total_amount_after_tax_and_discount", "0"]
        },
        COD: "$cod.cod",
        receiverNumber: "$receiver.number",
        cash_payment: "$product.cash_payment",
        receiverAddress: "$receiver.address",
        receiverName: "$receiver.name"
      }
    }
  ])
  return order
}

export const getIncomingTracking = async (pageSize, page, sortBy, orderIds, confirmStaffId, previousPostOffice, confirmTime, transportationMode) => {
  try {
    const orderIdArray = orderIds !== undefined && orderIds !== "" ? orderIds.split("\n") : [];
    const confirmStaffObjectId = mongoose.Types.ObjectId(confirmStaffId);
    const pipeline = [
      {
        $addFields: {
          incomingTracking: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$tracking",
                  as: "tracking",
                  cond: {
                    $and: [
                      { $eq: ["$$tracking.scan_type", "incoming_postoffice"] },
                      { $eq: ["$$tracking.confirm_staff", confirmStaffObjectId] },
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          previousTracking: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$tracking",
                  as: "tracking",
                  cond: {
                    $and: [
                      { $eq: ["$$tracking.scan_type", "incoming_postoffice"] },
                      { $lt: ["$$tracking.scan_code_time", "$incomingTracking.scan_code_time"] },
                    ],
                  },
                },
              },
              -1,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "previousTracking.post_office",
          foreignField: "_id",
          as: "previousPostInfo"
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "incomingTracking.confirm_staff",
          foreignField: "_id",
          as: "confirm_staff"
        }
      },
      {
        $addFields: {
          incomingTracking: {
            $mergeObjects: [
              "$incomingTracking",
              {
                confirm_staff: { $arrayElemAt: ["$confirm_staff", 0] }
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "destination",
          foreignField: "_id",
          as: "destinationPostOfficeInfo"
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "incomingTracking.confirm_staff.office",
          foreignField: "_id",
          as: "confirmPostOfficeInfo"
        }
      },
      {
        $addFields: {
          destinationPostOfficeInfo: { $arrayElemAt: ["$destinationPostOfficeInfo", 0] },
          previousPostOfficeInfo: { $arrayElemAt: ["$previousPostInfo", 0] },
          confirmPostOfficeInfo: { $arrayElemAt: ["$confirmPostOfficeInfo", 0] },
        }
      },
      {
        $set: {
          currentDate: moment(new Date()).format('YYYY-MM-DD')
        }
      },
      {
        $project: {
          incomingTrackingStaff: "$incomingTracking.confirm_staff._id",
          shippingId: "$shipping.id",
          confirmDate: "$currentDate",
          trackingTime: "$incomingTracking.scan_code_time",
          weight: "$product.weight",
          previousPost: "$previousPostOfficeInfo.name",
          type: "Kiện đến",
          trackingStaff: "$incomingTracking.confirm_staff.name",
          confirmPost: "$confirmPostOfficeInfo.name",
          confirmTime: "$incomingTracking.scan_code_time",
          destinationPostCode: "$destinationPostOfficeInfo.code",
          transportation: "$incomingTracking.transportation"
        }
      },
      {
        $match: {
          $and: [
            { incomingTrackingStaff: confirmStaffObjectId },
            transportationMode ? { transportation: transportationMode } : {},
            previousPostOffice ? { previousPost: previousPostOffice } : {},
            confirmTime ? { confirmDate: confirmTime } : {},
            orderIdArray.length > 0 ? { orderId: { $in: orderIdArray } } : {},
          ],
        }
      },
      { $sort: { [sortBy || "createdAt"]: 1 } },
      { $skip: pageSize * page },
      { $limit: pageSize || 100 }
    ];
    const results = await Order.aggregate(pipeline);
    if (results.length === 0) {
      return [];
    }
    return results;
  } catch (error) {
    return error
  }
}

export const getDeliveryTracking = async (pageSize, page, sortBy, orderIds, confirmStaffId, deliveryStaffId, confirmTime) => {
  try {
    const orderIdArray = orderIds !== undefined && orderIds !== "" ? orderIds.split("\n") : [];
    const confirmStaffObjectId = mongoose.Types.ObjectId(confirmStaffId)
    const deliveryStaffObjectId = mongoose.Types.ObjectId(deliveryStaffId)
    const pipeline = [
      {
        $addFields: {
          shippingTracking: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$tracking",
                  as: "tracking",
                  cond: {
                    $and: [
                      { $eq: ["$$tracking.scan_type", "shipping"] },
                      { $eq: ["$$tracking.confirm_staff", confirmStaffObjectId] },
                      { $eq: ["$$tracking.shipper", deliveryStaffObjectId] },
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "staffs",
          localField: "shippingTracking.confirm_staff",
          foreignField: "_id",
          as: "confirm_staff"
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "shippingTracking.shipper",
          foreignField: "_id",
          as: "shipper"
        }
      },
      {
        $addFields: {
          shippingTracking: {
            $mergeObjects: [
              "$shippingTracking",
              {
                confirm_staff: { $arrayElemAt: ["$confirm_staff", 0] },
                shipper: { $arrayElemAt: ["$shipper", 0] }
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "shippingTracking.confirm_staff.office",
          foreignField: "_id",
          as: "confirmPostOfficeInfo"
        }
      },
      {
        $addFields: {
          confirmPostOfficeInfo: { $arrayElemAt: ["$confirmPostOfficeInfo", 0] },
        }
      },
      {
        $set: {
          currentDate: moment(new Date()).format('YYYY-MM-DD')
        }
      },
      {
        $project: {
          shippingTrackingStaff: "$shippingTracking.confirm_staff._id",
          deliveryStaff: "$shippingTracking.shipper._id",
          shippingId: "$shipping.id",
          confirmDate: "$currentDate",
          trackingTime: "$shippingTracking.scan_code_time",
          shipper: "$shippingTracking.shipper.name",
          type: "Phát kiện",
          trackingStaff: "$shippingTracking.confirm_staff.name",
          confirmPost: "$confirmPostOfficeInfo.name",
          confirmTime: "$shippingTracking.scan_code_time",
        }
      },
      {
        $match: {
          $and: [
            { shippingTrackingStaff: confirmStaffObjectId },
            deliveryStaffId ? { deliveryStaff: deliveryStaffObjectId } : {},
            confirmTime ? { confirmDate: confirmTime } : {},
            orderIdArray.length > 0 ? { orderId: { $in: orderIdArray } } : {},
          ],
        }
      },
      { $sort: { [sortBy || "createdAt"]: 1 } },
      { $skip: pageSize * page },
      { $limit: pageSize || 100 }
    ];
    const results = await Order.aggregate(pipeline);
    if (results.length === 0) {
      return [];
    }
    return results;
  } catch (error) {
    return error
  }
}

export const getOrders24h = async (pageSize, page, sortBy, orderIds, beginSendTime, endSendTime, beginConfirmTime, endConfirmTime, beginSignTime, endSignTime, pickUpStaff, confirmStaff, originPostOffice, customer, destinationPostOffice, cashPayment, codStatus, endSeal, orderStatus, signedStatus, totalFreight, insuranceFee, canceledStatus, transportationMode) => {
  try {
    const orderIdArray = orderIds !== undefined && orderIds !== "" ? orderIds.split(/[\n\s]+/) : [];
    const pipeline = [
      {
        $lookup: {
          from: "discounts",
          localField: "shipping.discount",
          foreignField: "_id",
          as: "discountInfo"
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "pickUpStaff",
          foreignField: "_id",
          as: "pickUpStaffInfo"
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "confirmStaff",
          foreignField: "_id",
          as: "confirmStaffInfo",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo"
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "origin",
          foreignField: "_id",
          as: "originPostOfficeInfo"
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "destination",
          foreignField: "_id",
          as: "destinationPostOfficeInfo"
        }
      },
      {
        $addFields: {
          "shipping.discount": {
            $arrayElemAt: ["$discountInfo", 0]
          },
          discountInfo: {
            $arrayElemAt: ["$discountInfo", 0]
          },
          pickUpStaffInfo: {
            $arrayElemAt: ["$pickUpStaffInfo", 0]
          },
          confirmStaffInfo: {
            $arrayElemAt: ["$confirmStaffInfo", 0]
          },
          customerInfo: {
            $arrayElemAt: ["$customerInfo", 0]
          },
          originPostOfficeInfo: {
            $arrayElemAt: ["$originPostOfficeInfo", 0]
          },
          destinationPostOfficeInfo: {
            $arrayElemAt: ["$destinationPostOfficeInfo", 0]
          },
          lastStatus: { $arrayElemAt: ["$timeline", -1] },
          confirmTime: {
            $cond: {
              if: { $isArray: "$timeline" },
              then: {
                $let: {
                  vars: {
                    in_progressStatus: {
                      $filter: {
                        input: "$timeline",
                        as: "timeline",
                        cond: { $eq: ["$$timeline.status", "in progress"] },
                      },
                    },
                  },
                  in: { $arrayElemAt: ["$$in_progressStatus.time", 0] },
                },
              },
              else: null,
            },
          },
          signTime: {
            $cond: {
              if: { $isArray: "$tracking" },
              then: {
                $let: {
                  vars: {
                    receivedOrderTracking: {
                      $filter: {
                        input: "$tracking",
                        as: "tracking",
                        cond: { $eq: ["$$tracking.scan_type", "received_order"] },
                      },
                    },
                  },
                  in: { $arrayElemAt: ["$$receivedOrderTracking.scan_code_time", 0] },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $match: {
          $and: [
            beginSendTime && endSendTime ? { "createdAt": { $gte: new Date(beginSendTime), $lte: new Date(endSendTime) } } : {},
            beginSignTime && endSignTime ? { "signTime": { $gte: new Date(beginSignTime), $lte: new Date(endSignTime) } } : {},
            beginConfirmTime && endConfirmTime ? { "confirmTime": { $gte: new Date(beginConfirmTime), $lte: new Date(endConfirmTime) } } : {},
            pickUpStaff ? {
              $or: [
                { "pickUpStaffInfo._id": pickUpStaff },
                { "pickUpStaffInfo.name": pickUpStaff },
                { "pickUpStaffInfo.code": pickUpStaff },
              ]
            } : {},
            confirmStaff ? {
              $or: [
                { "confirmStaffInfo._id": confirmStaff },
                { "confirmStaffInfo.name": confirmStaff },
                { "confirmStaffInfo.code": confirmStaff },
              ]
            } : {},
            originPostOffice ? {
              $or: [
                { "originPostOfficeInfo.code": originPostOffice },
                { "originPostOfficeInfo.name": originPostOffice },
                { "originPostOfficeInfo.province": originPostOffice },
              ]
            } : {},
            customer ? {
              $or: [
                { "customerInfo._id": customer },
                { "customerInfo.name": customer },
              ]
            } : {},
            destinationPostOffice ? {
              $or: [
                { "destinationPostOfficeInfo.code": destinationPostOffice },
                { "destinationPostOfficeInfo.name": destinationPostOffice },
                { "destinationPostOfficeInfo.province": destinationPostOffice },
              ]
            } : {},
            cashPayment ? { "product.cash_payment": cashPayment } : {},
            codStatus ? { "cod.status": codStatus } : {},
            orderStatus ? { "lastStatus.status": orderStatus } : {},
            signedStatus ? { "sign.signed_to_receive": signedStatus === "signed" ? true : { $in: [false, null]} } : {},
            insuranceFee && insuranceFee === "true" ? { "shipping.insurance_fees": { $nin: ["0", "", null] } } : {},
            canceledStatus && canceledStatus === "true" ? { "lastStatus.status": "canceled" } : {},
            transportationMode ? { "product.transportation": transportationMode } : {},
            orderIdArray.length > 0 ? { orderId: { $in: orderIdArray } } : {},
          ]
        }
      },
      {
        $project: {
          orderId: "$orderId",
          sendingDate: "$createdAt",
          sending_place: "$originPostOfficeInfo.province",
          sending_district: "$originPostOfficeInfo.district",
          receive_place: "$destinationPostOfficeInfo.province",
          receive_district: "$destinationPostOfficeInfo.district",
          originPostOffice: "$originPostOfficeInfo.code",
          pickUpStaffCode: "$pickUpStaffInfo.code",
          getPickUpStaff: "$pickUpStaffInfo._id",
          receivedStaffName: "$confirmStaffInfo.name",
          destinationPostCode: "$destinationPostOfficeInfo.ward" + '-' + "$destinationPostOfficeInfo.code",
          contentProduct: "$product.name",
          note: "$product.note",
          weight: "$product.weight",
          goods_value: "$product.goods_value",
          cod: "$cod.cod",
          cod_fee: "$cod.fee",
          insuranceFee: "$shipping.insurance_fees" ?? '',
          standardFee: "$shipping.standard_fee",
          receiverFee: "$shipping.receiver_fee",
          fuelSurcharge: "$shipping.fuel_surcharge",
          copyrightFee: "$shipping.copyright_fee",
          otherFee: "$shipping.other",
          discount: "$shipping.discount.discount",
          beforeDiscountTotal: "$shipping.total_amount_before_discount",
          VAT: "$shipping.tax_VAT_value",
          tax_code: "$shipping.tax_code",
          afterTaxDiscountTotal: "$shipping.total_amount_after_tax_and_discount",
          remoteAreasSurcharge: "$shipping.remote_areas_surcharge",
          afterDiscountTotal: "$shipping.total_amount_after_discount",
          getCustomer: "$customerInfo._id",
          nameCompany: "$customerInfo.name",
          addressCompany: "$company.address",
          nameSender: "$sender.name",
          phoneSender: "$sender.phone",
          emailSender: "$sender.email",
          addressSender: "$sender.address",
          nameReceiver: "$receiver.name",
          phoneReceiver: "$receiver.phone",
          emailReceiver: "$receiver.email",
          addressReceiver: "$receiver.address",
          confirmTime: 1,
          signTime: "$signTime",
          sign: "$sign.signed_to_receive",
          status: "$lastStatus.status",
          cashPayment: "$product.cash_payment",
          transportation: "$product.transportation"
        }
      },
      { $sort: { [sortBy || "createdAt"]: 1 } },
      { $skip: pageSize * page },
      { $limit: pageSize || 100 }
    ];
    const results = await Order.aggregate(pipeline);
    if (results.length === 0) {
      return [];
    }
    console.log(results.length)
    return results;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const getOrdersToCollectCod = async (pageSize, page, sortBy, orderIds, beginSendTime, endSendTime, beginSignTime, endSignTime, shipper, customer, department, carFleet, postCode, cashPayment) => {
  try {
    const orderIdArray = orderIds !== undefined && orderIds !== "" ? orderIds.split("\n") : [];
    const pipeline = [
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo"
        }
      },
      {
        $addFields: {
          lastStatus: { $arrayElemAt: ["$timeline", -1] },
          receivedInfo: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "received_order"] }
                }
              },
              0
            ]
          },
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "receivedInfo.shipper",
          foreignField: "_id",
          as: "shipperInfo"
        }
      },
      {
        $lookup: {
          from: "departments",
          localField: "shipperInfo.department",
          foreignField: "_id",
          as: "departmentInfo"
        }
      },
      {
        $lookup: {
          from: "car_fleets",
          localField: "shipperInfo.car_fleet",
          foreignField: "_id",
          as: "carFleetInfo"
        }
      },
      {
        $addFields: {
          shipperInfo: {
            $mergeObjects: [
              { $arrayElemAt: ["$shipperInfo", 0] },
              {
                department: { $arrayElemAt: ["$departmentInfo", 0] },
                car_fleet: { $arrayElemAt: ["$carFleetInfo", 0] }
              }
            ]
          },
        }
      },
      {
        $match: {
          $or: [
            { "product.cash_payment": "CC_CASH", "lastStatus.status": "dispatched", destination: postCode },
            { "lastStatus.status": "return success", origin: postCode },
          ]
        }
      },
      {
        $project: {
          orderId: 1,
          customerInfo: 1,
          product: 1,
          shipping: 1,
          sign: 1,
          cod: 1,
          lastStatus: 1,
          createdAt: 1,
          shipperInfo: 1,
          receivedInfo: 1,
        }
      },
      {
        $match: {
          $and: [
            { "sign.signed_to_receive": true },
            { "shipping.collected": false },
            beginSendTime && endSendTime ? { "createdAt": { $gte: new Date(beginSendTime), $lte: new Date(endSendTime) } } : {},
            beginSignTime && endSignTime ? { "receivedInfo.scan_code_time": { $gte: new Date(beginSignTime), $lte: new Date(endSignTime) } } : {},
            department ? {
              $or: [
                { "shipperInfo.department._id": department },
                { "shipperInfo.department.name": department },
              ]
            } : {},
            carFleet ? {
              $or: [
                { "shipperInfo.car_fleet._id": carFleet },
                { "shipperInfo.car_fleet.name": carFleet },
              ]
            } : {},
            customer ? {
              $or: [
                { "customerInfo._id": customer },
                { "customerInfo.name": customer },
              ]
            } : {},
            shipper ? {
              $or: [
                { "shipperInfo._id": shipper },
                { "shipperInfo.name": shipper },
              ]
            } : {},
            cashPayment ? { "product.cash_payment": cashPayment } : {},
            orderIdArray.length > 0 ? { orderId: { $in: orderIdArray } } : {},
          ]
        }
      },
      { $sort: { [sortBy || "createdAt"]: 1 } },
      { $skip: pageSize * page },
      { $limit: pageSize || 100 }
    ];
    const results = await Order.aggregate(pipeline);
    if (results.length === 0) {
      return [];
    }
    console.log(results.length)
    return results;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const getOrdersCollectCod = async (pageSize, page, sortBy, beginCollectedTime, endCollectedTime, postCode, shipper, cashier, cashPayment) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "staffs",
          localField: "shipping.collected_by",
          foreignField: "_id",
          as: "cashier"
        }
      },
      {
        $addFields: {
          lastStatus: { $arrayElemAt: ["$timeline", -1] },
          receivedInfo: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "received_order"] }
                }
              },
              0
            ]
          },
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "receivedInfo.shipper",
          foreignField: "_id",
          as: "shipperInfo"
        }
      },
      {
        $addFields: {
          shipperInfo: {
            $arrayElemAt: ["$shipperInfo", 0]
          },
        }
      },
      {
        $match: {
          $or: [
            { "product.cash_payment": "CC_CASH", "lastStatus.status": "dispatched", destination: postCode },
            { "lastStatus.status": "return success", origin: postCode },
          ]
        }
      },
      {
        $project: {
          orderId: 1,
          product: 1,
          shipping: 1,
          sign: 1,
          cod: 1,
          shipperInfo: 1,
          cashier: 1,
          lastStatus: 1,
          createdAt: 1
        }
      },
      {
        $match: {
          $and: [
            { "sign.signed_to_receive": true },
            { "shipping.collected": true },
            beginCollectedTime && endCollectedTime ? { "shipping.collected_time": { $gte: new Date(beginCollectedTime), $lte: new Date(endCollectedTime) } } : {},
            shipper ? {
              $or: [
                { "shipperInfo._id": shipper },
                { "shipperInfo.name": shipper },
              ]
            } : {},
            cashier ? {
              $or: [
                { "cashier._id": cashier },
                { "cashier.name": cashier },
              ]
            } : {},
            cashPayment ? { "product.cash_payment": cashPayment } : {}
          ]
        }
      },
      { $sort: { [sortBy || "createdAt"]: 1 } },
      { $skip: pageSize * page },
      { $limit: pageSize || 100 }
    ];
    const results = await Order.aggregate(pipeline);
    if (results.length === 0) {
      return [];
    }
    console.log(results.length)
    return results;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const getOrdersCod = async (pageSize, page, sortBy, beginSendTime, endSendTime, beginSignTime, endSignTime, shipper, postCode, postOffice, cashPayment) => {
  try {
    const pipeline = [
      {
        $addFields: {
          lastStatus: { $arrayElemAt: ["$timeline", -1] },
          postOfficeInfo: { $arrayElemAt: ["$postOfficeInfo", 0]},
          receivedInfo: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "received_order"] }
                }
              },
              0
            ]
          },
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "receivedInfo.shipper",
          foreignField: "_id",
          as: "shipperInfo"
        }
      },
      {
        $addFields: {
          shipperInfo: {
            $arrayElemAt: ["$shipperInfo", 0]
          },
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "shipperInfo.office",
          foreignField: "_id",
          as: "postOfficeInfo"
        }
      },
      {
        $match: {
          $or: [
            { "product.cash_payment": "CC_CASH", "lastStatus.status": "dispatched", destination: postCode },
            { "lastStatus.status": "return success", origin: postCode },
          ]
        }
      },
      {
        $match: {
          $and: [
            { "sign.signed_to_receive": true },
            beginSendTime && endSendTime ? { "createdAt": { $gte: new Date(beginSendTime), $lte: new Date(endSendTime) } } : {},
            beginSignTime && endSignTime ? { "receivedInfo.scan_code_time": { $gte: new Date(beginSignTime), $lte: new Date(endSignTime) } } : {},
            shipper ? {
              $or: [
                { "shipperInfo._id": shipper },
                { "shipperInfo.name": shipper },
                { "shipperInfo.code": shipper },
              ]
            } : {},
            postOffice ? {
              $or: [
                { "postOfficeInfo._id": postOffice },
                { "postOfficeInfo.name": postOffice },
                { "postOfficeInfo.code": postOffice },
              ]
            } : {},
            cashPayment ? { "product.cash_payment": cashPayment } : {},
          ]
        }
      },
      {
        $project: {
          orderId: 1,
          customerInfo: 1,
          product: 1,
          shipping: 1,
          sign: 1,
          cod: 1,
          lastStatus: 1,
          createdAt: 1,
          shipperInfo: 1,
          postOfficeInfo: 1
        }
      },
      { $sort: { [sortBy || "createdAt"]: 1 } },
      { $skip: pageSize * page },
      { $limit: pageSize || 100 }
    ];
    const results = await Order.aggregate(pipeline);
    if (results.length === 0) {
      return [];
    }
    console.log(results.length)
    return results;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const getOrdersSigned = async (pageSize, page, sortBy, orderIds, beginConfirmTime, endConfirmTime, beginSignTime, endSignTime, province, postCode, customerPostCode, onlyCC_CASH, onlyCOD, typeSign) => {
  try {
    const orderIdArray = orderIds !== undefined && orderIds !== "" ? orderIds.split("\n") : [];
    const pipeline = [
      {
        $lookup: {
          from: "post_offices",
          localField: "origin",
          foreignField: "_id",
          as: "originInfo"
        }
      },
      {
        $lookup: {
          from: "post_offices",
          localField: "destination",
          foreignField: "_id",
          as: "destinationInfo"
        }
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo"
        }
      },
      {
        $addFields: {
          receivedInfo: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$tracking",
                  as: "track",
                  cond: { $eq: ["$$track.scan_type", "received_order"] }
                }
              },
              0
            ]
          },
        }
      },
      {
        $lookup: {
          from: "staffs",
          localField: "receivedInfo.shipper",
          foreignField: "_id",
          as: "shipperInfo"
        }
      },
      {
        $addFields: {
          shipperInfo: {
            $arrayElemAt: ["$shipperInfo", 0]
          },
          customerInfo: {
            $arrayElemAt: ["$customerInfo", 0]
          },
          originInfo: {
            $arrayElemAt: ["$originInfo", 0]
          },
          destinationInfo: {
            $arrayElemAt: ["$destinationInfo", 0]
          },
          lastStatus: { 
            $arrayElemAt: ["$timeline", -1] 
          },
          money_arrive: {
            $cond: {
              if: { $eq: ["$product.cash_payment", "CC_CASH"] },
              then: "$shipping.total_amount_after_tax_and_discount",
              else: "0"
            }
          },
        }
      },
      {
        $match: {
          $and: [
            { "sign.signed_to_receive": true },
            beginSignTime && endSignTime ? { "receivedInfo.scan_code_time": { $gte: new Date(beginSignTime), $lte: new Date(endSignTime) } } : {},
            {
              $or: [
                {
                  $and: [
                    { $expr: { $eq: [typeSign, "delivery"] } },
                    { "lastStatus.status": "dispatched" },
                    { "destination": postCode }
                  ]
                },
                {
                  $and: [
                    { $expr: { $eq: [typeSign, "sending"] } },
                    { "lastStatus.status": "return success" },
                    { "origin": postCode }
                  ]
                },
                {
                  $and: [
                    {
                      $or: [
                        { $and: [ { "lastStatus.status": "dispatched" }, { "destination": postCode } ] },
                        { $and: [ { "lastStatus.status": "return success" }, { "origin": postCode } ] }
                      ]
                    }
                  ]
                }
              ]
            },
            province ? {
              $or: [
                { $and: [ { "lastStatus.status": "dispatched" }, { "destinationInfo.province": province } ] },
                { $and: [ { "lastStatus.status": "return success" }, { "originInfo.province": province } ] }
              ]
            } : {},
            onlyCC_CASH ? { "product.cash_payment": "CC_CASH" } : {},
            onlyCOD ? { $expr: { $gt: [ "cod.cod", 0 ] } } : {},
            orderIdArray.length > 0 ? { orderId: { $in: orderIdArray } } : {},
          ]
        }
      },
      {
        $project: {
          orderId: "$orderId",
          cash_payment: "$product.cash_payment",
          sign_time: "$receivedInfo.scan_code_time",
          shipper_name: "$shipperInfo.name",
          shipper_code: "$shipperInfo.code",
          staff_recorded: "$shipperInfo.name",
          confirm_time: "$receivedInfo.scan_code_time",
          sign_instead: "$sign.substituteSignature",
          sign_post_office: "$destinationInfo.name",
          signer: "$customerInfo.name",
          cod_fee: "$cod.fee",
          money_arrive: "$money_arrive",
          destination_post_code: "$destinationInfo.code",
          weight: "$product.weight",
          cod: "$cod.cod",
          sender_name: "$sender.name",
          origin_post_office: "$originInfo.name",
          destination_district: "$destinationInfo.district",
          sign_province: "$destinationInfo.province",
          origin_province: "$originInfo.province",
          customer_province: "$originInfo.province",
        }
      },
      { $sort: { [sortBy || "createdAt"]: 1 } },
      { $skip: pageSize * page },
      { $limit: pageSize || 100 }
    ];
    const results = await Order.aggregate(pipeline);
    if (results.length === 0) {
      return [];
    }
    console.log(results.length)
    return results;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
