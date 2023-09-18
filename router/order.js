import express from "express"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import { createOrderByAdminValidate, createOrderByCustomerValidate, signOrderValidate, updateOrderValidate } from "../validation/order.js"
import { verifyToken, verifyCustomer, verifyCustomerOrAdmin, verifyStaff } from "../middleware/verify.js"
import { genarateOrderID, genarateBillofLandingID } from "../service/order.js"
import Order from "../model/Order.js"
import User from "../model/User.js"
import Customer from "../model/Customer.js"
import { COD_STATUS, CUSTOMER, ORDER_STATUS, SCAN_TYPE } from "../constant.js"
import { sendFeedback, sendtokenfeedbacktoCustomer } from "../service/order.js"

const orderRoute = express.Router();

/**
 * @route POST /api/order
 * @description customer create a new order
 * @access private
 */
orderRoute.post("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId)
    const customerId = user.role
    const customer = await Customer.findById(customerId)
    let {
      note,
      origin,
      destination
    } = req.body;
    const errors = createOrderByCustomerValidate(req.body)
    if (errors) return sendError(res, errors)

    let sender = {
      name: req.body.sender.name,
      phone: req.body.sender.phone,
      address: req.body.sender.address
    }

    let receiver = {
      name: req.body.receiver.name,
      phone: req.body.receiver.phone,
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
      name: customer.name,
      address: customer.address,
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
      customer: customerId,
      sender: sender,
      receiver: receiver,
      origin: origin,
      destination: destination,
      shipping: { id: bill_of_landing, ...shipping },
      product: product,
      cod: cod,
      company: company
    });
    return sendSuccess(res, "Create new order successfully", order)
  } catch (error) {
    console.log(error);
    return sendServerError(res)
  }
})

/**
 * @route get /api/order/customer
 * @description get order of customer by date
 * @access private
 */
orderRoute.get("/customer", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerId = user.role;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
    const page = req.query.page ? parseInt(req.query.page) : 0
    let { sortBy, keyword, status, startDate, endDate } = req.query;
    let query = {}
    if (keyword) {
      query.$or = [
        { orderId: { $regex: keyword, $options: 'i' } },
        { 'receiver.name': { $regex: keyword, $options: 'i' } },
        { 'receiver.phone': { $regex: keyword, $options: 'i' } },
        { 'product.name': { $regex: keyword, $options: 'i' } },
        { 'shipping.id': { $regex: keyword, $options: 'i' } },
      ]
    }
    if (customerId) {
      query.customer = customerId
    }
    if (status) {
      query.status = status
    }
    if (startDate && endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
      if (startDate == 'Invalid Date' || endDate == 'Invalid Date') {
        return sendError(res, "Invalid Date")
      }
      query.createdAt = { $gte: startDate, $lte: endDate }
    }

    const returnedOrders = await Order.find(query)
      .limit(pageSize)
      .skip(pageSize * page)
      .sort(`${sortBy}`)
    if (returnedOrders.length === 0) {
      return sendError(res, "No orders found")
    }
    const formattedOrders = returnedOrders.map(order => {
      const { orderId, receiver, createdAt, status, product } = order;
      const { name: receiverName, phone: receiverPhone } = receiver;
      const productName = product?.name ?? null;
      return {
        orderId,
        receiverName,
        receiverPhone,
        createdAt,
        status,
        productName,
      };
    });
    return sendSuccess(res, 'Get order successfully', formattedOrders, formattedOrders.length);
  } catch (error) {
    console.error(error.message);
    return sendServerError(res);
  }
});


/**
 * @route GET /api/order/:orderId
 * @description customer see their order by orderId
 * @access private
 */
orderRoute.get("/:orderId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId })
    if (!order) {
      return sendError(res, `The order ${orderId} does not exist.`);
    }
    const sender = {
      name: order.sender.name,
      phone: order.sender.phone,
      address: order.sender.address,
    };

    const receiver = {
      name: order.receiver.name,
      phone: order.receiver.phone,
      address: order.receiver.address,
    };

    const productInfo = {
      name: order.product.name ?? null,
      weight: order.product.weight,
      totalAmount: order.shipping.total_amount_after_tax_and_discount,
      COD: order.cod.cod,
      paymentMethod: order.product.cash_payment,
    };

    const response = {
      sender,
      receiver,
      productInfo,
    };
    return sendSuccess(res, "Get order successfully.", response);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route PUT /api/order/:orderId
 * @description customer can update their order when order status is waiting
 * @access private
 */
orderRoute.put("/:orderId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const errors = updateOrderValidate(req.body);
    if (errors) return sendError(res, errors);

    const { sender, receiver, product, shipping } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findOne({ orderId });
    if (!order) return sendError(`The order ${orderId} does not exist.`);
    if (order.timeline.slice(-1).status !== ORDER_STATUS.waiting)
      return sendError(
        "Can not edit this order because it is not in waiting process."
      );

    // check whether address is real or not
    // if (typeof origin.address === "object") {
    //   let data = await locateAddress(
    //     origin.address.street +
    //     origin.address.ward +
    //     origin.address.district +
    //     origin.address.province
    //   )
    //   if (!data) return sendError(res, "Origin is not existing.")
    // } else {
    //   origin.address = await Warehouse.exists({ _id: origin.address })
    //   if (!origin.address)
    //     return sendError(res, "Origin warehouse doesn't exist.")
    // }

    // if (typeof destination.address === "object") {
    //   let data = await locateAddress(
    //     destination.address.street +
    //     destination.address.ward +
    //     destination.address.district +
    //     destination.address.province
    //   )
    //   if (!data) return sendError(res, "Destination is not existing.")
    // } else {
    //   destination.address = await Warehouse.exists({
    //     _id: destination.address
    //   })
    //   if (!destination.address)
    //     return sendError(res, "Destination warehouse doesn't exist.")
    // }

    const updatedOrder = await Order.findByIdAndUpdate(order._id, { sender, receiver, product, cod, shipping })
    // await Product.deleteMany({ order: order._id });
    // products.forEach(async (product) => {
    //   const { name, quantity, unit, note } = product;
    //   await Product.create({ name, quantity, unit, note, order: order._id })
    // })
    return sendSuccess(res, "Update the order successfully.", updatedOrder)
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})


/**
 * @route put /api/order/feedlback/:orderId
 * @description put feedback of order
 * @access private
 */
orderRoute.put("/feedlback/:orderId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const staff = req.decoded.role;
    if (staff === 'admin') {
      const orderId = req.params.orderId;
      const { content } = req.body;
      const order = await Order.findOne({ orderId });
      if (!order)
        return sendError(res, `the order ${orderId} does not exist.`);
      if (!content) return sendError(res, `the content does not exist.`);
      const staffId = order.staffconfirm;
      if (!staffId) return sendError(res, "StaffConfirm not in Order");
      const customer = await Customer.findById(order.customer);
      sendFeedback(staffId, content, customer._id);
      let add = { user: customer.name, content: content };
      let feedlback = [...order.feedback, add];
      await Order.findByIdAndUpdate(order._id, { feedback: feedlback });
      return sendSuccess(res, "Create Feeback by customer successfully");
    } else {
      if (staff !== CUSTOMER.PASSERS && staff !== CUSTOMER.BUSINESS && staff !== CUSTOMER.INTERMEDIARY)
        return sendError(res, "Forbidden", 403)
      const nameStaff = req.user.role.name;
      const orderId = req.params.orderId;
      const { content } = req.body;
      const order = await Order.findOne({ orderId });
      if (!order)
        return sendError(res, `the order ${orderId} does not exist.`);
      if (!content) return sendError(res, `the content does not exist.`);
      const customer = await Customer.findById(order.customer);
      sendtokenfeedbacktoCustomer(customer._id, content);
      let add = { user: nameStaff, content: content };
      let feedlback = [...order.feedback, add];
      await Order.findByIdAndUpdate(order._id, { feedback: feedlback });
      return sendSuccess(res, "Create Feeback by staff successfully");
    }
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
}
)

/**
 * @route get /api/order/:orderId/feedback
 * @description get feedback of order
 * @access private
 */
orderRoute.get("/:orderId/feedback", verifyToken, verifyCustomerOrAdmin,
  async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findOne({ orderId });
      if (!order)
        return sendError(res, `the orderID ${orderId} does not exist.`);
      const user = await User.findById(req.decoded.userId);
      if (!user) {
          return sendError(res, "User not found", 404);
      }
      const staff = req.decoded.role;
      if (staff === 'admin') {
        if (user.role == order.customer)
          return sendSuccess(res, "get feedback successfully", order.feedback);
        else {
          return sendError(res, "forbidden");
        }
      } else
        return sendSuccess(res, "get feedback successfully", order.feedback);
    } catch (error) {
      return sendServerError(res);
    }
  }
);

/**
 * @route get /api/order/finance/:startDate/:endDate
 * @description get order of customer to financial management
 * @access private
 */
orderRoute.get("/finance/:startDate/:endDate", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerID = user.role;
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate + "T23:59:59");
    if (startDate == 'Invalid Date' || endDate == 'Invalid Date') {
      return sendError(res, "Invalid Date")
    }

    const orderWaiting = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    const orderInProgress = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    const orderDispatching = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    const orderDispatched = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    const orderInReturn = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    const orderReturnConfirmation = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    const orderReturnSuccess = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    const orderProblem = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    const orderCanceled = { amount: 0, codFee: 0, shipFee: 0, percent: 0 };
    let totalCodFee = 0;
    let totalShipFee = 0;

    const Orders = await Order.find({
      customer: customerID,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    for (const order of Orders) {
      totalCodFee += +order.cod.cod;
      totalShipFee += +order.shipping.total_amount_after_tax_and_discount;
      if (order.timeline.slice(-1).status === ORDER_STATUS.waiting_for_pickup) {
        orderWaiting.amount++;
        orderWaiting.codFee += +order.cod.cod;
        orderWaiting.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderWaiting.percent++;
      }
      if (order.timeline.slice(-1).status === ORDER_STATUS.in_progress) {
        orderInProgress.amount++;
        orderInProgress.codFee += +order.cod.cod;
        orderInProgress.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderInProgress.percent++;
      }
      if (order.timeline.slice(-1).status === ORDER_STATUS.dispatching) {
        orderDispatching.amount++;
        orderDispatching.codFee += +order.cod.cod;
        orderDispatching.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderDispatching.percent++;
      }
      if (order.timeline.slice(-1).status === ORDER_STATUS.dispatched) {
        orderDispatched.amount++;
        orderDispatched.codFee += +order.cod.cod;
        orderDispatched.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderDispatched.percent++;
      }
      if (order.timeline.slice(-1).status === ORDER_STATUS.problem_order) {
        orderProblem.amount++;
        orderProblem.codFee += +order.cod.cod;
        orderProblem.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderProblem.percent++;
      }
      if (order.timeline.slice(-1).status === ORDER_STATUS.in_return) {
        orderInReturn.amount++;
        orderInReturn.codFee += +order.cod.cod;
        orderInReturn.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderInReturn.percent++;
      }
      if (order.timeline.slice(-1).status === ORDER_STATUS.return_confirmation) {
        orderReturnConfirmation.amount++;
        orderReturnConfirmation.codFee += +order.cod.cod;
        orderReturnConfirmation.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderReturnConfirmation.percent++;
      }
      if (order.timeline.slice(-1).status === ORDER_STATUS.return_success) {
        orderReturnSuccess.amount++;
        orderReturnSuccess.codFee += +order.cod.cod;
        orderReturnSuccess.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderReturnSuccess.percent++;
      }
      if (order.timeline.slice(-1).status === ORDER_STATUS.canceled) {
        orderCanceled.amount++;
        orderCanceled.codFee += +order.cod.cod;
        orderCanceled.shipFee += +order.shipping.total_amount_after_tax_and_discount;
        orderCanceled.percent++;
      }
    }

    orderWaiting.percent = parseFloat((orderWaiting.percent * 100 / Orders.length).toFixed(1));
    orderInProgress.percent = parseFloat((orderInProgress.percent * 100 / Orders.length).toFixed(1));
    orderDispatching.percent = parseFloat((orderDispatching.percent * 100 / Orders.length).toFixed(1));
    orderDispatched.percent = parseFloat((orderDispatched.percent * 100 / Orders.length).toFixed(1));
    orderProblem.percent = parseFloat((orderProblem.percent * 100 / Orders.length).toFixed(1));
    orderInReturn.percent = parseFloat((orderInReturn.percent * 100 / Orders.length).toFixed(1));
    orderReturnConfirmation.percent = parseFloat((orderReturnConfirmation.percent * 100 / Orders.length).toFixed(1));
    orderReturnSuccess.percent = parseFloat((orderReturnSuccess.percent * 100 / Orders.length).toFixed(1));
    orderCanceled.percent = parseFloat((orderCanceled.percent * 100 / Orders.length).toFixed(1));

    return sendSuccess(res, 'Get list order successfully.',
      {
        totalOrder: Orders.length,
        totalCodFee: totalCodFee,
        totalShipFee: totalShipFee,
        waiting: orderWaiting,
        inProgress: orderInProgress,
        dispatching: orderDispatching,
        dispatched: orderDispatched,
        inReturn: orderInReturn,
        returnConfirmation: orderReturnConfirmation,
        returnSuccess: orderReturnSuccess,
        problem: orderProblem,
        canceled: orderCanceled
      }
    );
  }
  catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route get /api/order/COD/:startDate/:endDate
 * @description get order's cod of customer by status
 * @access private
 */
orderRoute.get("/COD/:startDate/:endDate", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerId = user.role;
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate + "T23:59:59");
    if (startDate == 'Invalid Date' || endDate == 'Invalid Date') {
      return sendError(res, "Invalid Date")
    }
    let waitingCOD = 0, collectedCOD = 0, collectedShipping = 0, waitingShipping = 0
    const orders = await Order.find({
      customer: customerId,
      createdAt: { $gte: startDate, $lte: endDate }
    })
    orders.forEach(order => {
      if (order.cod.status && order.cod.status === COD_STATUS.collected) {
        collectedCOD += +order.cod.cod
        collectedShipping += +order.shipping.total_amount_after_tax_and_discount
      } else if (order.cod.status && order.cod.status === COD_STATUS.waiting) {
        waitingCOD += +order.cod.cod
        waitingShipping += +order.shipping.total_amount_after_tax_and_discount
      }
    })

    if (orders.length === 0) {
      return sendSuccess(res, "order not found")
    }
    return sendSuccess(res, 'Get order successfully', { waitingCOD, waitingShipping, collectedCOD, collectedShipping })
  } catch (error) {
    return sendServerError(res);
  }
});
/**
 * @route get /api/order/endCOD/:startDate/:endDate
 * @description get order's cod of customer by status
 * @access private
 */
orderRoute.get("/endCOD/:startDate/:endDate", verifyToken, async (req, res) => {
  const user = await User.findById(req.decoded.userId);
  if (!user) {
      return sendError(res, "User not found", 404);
  }
  const customerId = user.role;
  const startDate = new Date(req.params.startDate);
  const endDate = new Date(req.params.endDate + "T23:59:59");
  if (startDate == 'Invalid Date' || endDate == 'Invalid Date') {
    return sendError(res, "Invalid Date")
  }
  try {
    let paidCOD = 0, fee = 0, controlMoney = 0
    const orders = await Order.find({
      customer: customerId,
      updatedAt: { $gte: startDate, $lte: endDate }
    })
    orders.forEach(order => {
      if (order.cod === COD_STATUS.paid) {
        paidCOD += +order.cod.cod
        fee += +order.cod.fee
        controlMoney += +order.cod.control_money
      }
    })
    if (orders.length === 0) {
      return sendSuccess(res, "order not found")
    }
    return sendSuccess(res, 'Get order successfully', { paidCOD, fee, controlMoney })
  } catch (error) {
    console.error(error.message);
    return sendServerError(res);
  }
});

/**
 * @route get /api/order/search/trackingOrder
 * @description customer search orders by shipping code
 * @access private
 */
orderRoute.get("/search/trackingOrder", async (req, res) => {
  try {
    const orderCode = req.query.orderCode;
    if (orderCode === "")
      return sendError(res,"Order code is required");
    let arrayCode = orderCode.split(',');
    const orders = await Order.find({ orderId: arrayCode })     
    let response = [];
    orders.forEach((order) => {
      let sender = {
        name: order.sender.name,
        phone: order.sender.phone,
        address: order.sender.address,
      };
  
      let receiver = {
        name: order.receiver.name,
        phone: order.receiver.phone,
        address: order.receiver.address,
      };
  
      let productInfo = {
        name: order.product.name ?? null,
        weight: order.product.weight,
        totalAmount: order.shipping.total_amount_after_tax_and_discount,
        COD: order.cod.cod,
        paymentMethod: order.product.cash_payment,
      };
      let status = "";
      switch(order.status){
        case ORDER_STATUS.waiting_for_pickup:
          status = "Đang đợi lấy đơn hàng";
          break;
        case ORDER_STATUS.in_progress:
          status = "Đang xử lý đơn hàng";
          break;
        case ORDER_STATUS.dispatching:
          status = "Đang giao hàng";
          break;
        case ORDER_STATUS.in_progress:
          status = "Giao hàng thành công";
          break;
        case ORDER_STATUS.problem_order:
          status = "Đơn hàng có vấn đề";
          break;
        case ORDER_STATUS.in_return:
          status = "Đang xử lý hoàn hàng";
          break;
        case ORDER_STATUS.return_confirmation:
          status = "Xác nhận hoàn hàng";
          break;
        case ORDER_STATUS.return_success:
          status = "Hoàn hàng thành công";
          break;
        case ORDER_STATUS.canceled:
          status = "Đơn hàng đã hủy";
          break;
      }

      let info = {
        sender: sender,
        receiver: receiver,
        product: productInfo,
        status: status
      }
      response.push(info);
    });

    return sendSuccess(res, 'Get order successfully', response)
  } catch (error) {
    console.error(error.message);
    return sendServerError(res);
  }
});

export default orderRoute
