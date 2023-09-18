import express from "express"
import Customer from "../../model/Customer.js"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { COD_STATUS, CUSTOMER } from "../../constant.js"
import User from "../../model/User.js";
import bodyParser from "body-parser";
import Order from "../../model/Order.js"
import mongoose from "mongoose";

const customerAdminRoute = express.Router();

/**
 * @route PUT /api/customer/:id
 * @description Update a customer
 * @access public
 */
customerAdminRoute.put('/:id', async (req, res) => {
    let id = req.params.id;
    const isExist = await Customer.exists({ _id: id })
    if (!isExist) { return sendError(res, 'Customer does not exist.') }
    const { name, address, description, customer_type, rank_passers, companyTaxcode_business } = req.body;
    // res.send(req.body)
    if (customer_type == '') { return sendError(res, 'Invalid customer type.') }
    else if (customer_type && !(customer_type == CUSTOMER.BUSINESS || customer_type == CUSTOMER.PASSERS || customer_type == CUSTOMER.INTERMEDIARY)) {
        return sendError(res, 'Invalid customer type.')
    }
    try {
        await Customer.findByIdAndUpdate(id, { name: name, address: address, description: description, customer_type: customer_type, rank_passers: rank_passers, companyTaxcode_business: companyTaxcode_business })
        return sendSuccess(res, 'Customer updated successfully.')
    }
    catch (err) {
        return sendServerError(res);
    }
})

/**
 * @route GET /api/customer/classification/:type
 * @description Get all customer match the classification (normal, vip, new, old)
 * @access public
 */
customerAdminRoute.get('/classification/:type', async (req, res) => {
  try {

    let classification = '';
    if (req.params.type === 'normal') {
      classification = 'Normal Customer'
    } else if (req.params.type === 'vip') {
      classification = 'Vip Customer'
    } else if (req.params.type === 'new') {
      classification = 'New Customer'
    } else if (req.params.type === 'old') {
      classification = 'Old Customer'
    } else {
      sendError(res, 'Type is error: Please enter type (normal, new. vip. old)', 400)
    }

    const customers = await Customer.find().populate('orders');

    const finalCustomers = customers.filter(customer => customer.classification === classification);
  
    sendSuccess(res, 'Get classification success', {
      customer: finalCustomers,
    })
  } catch (error) {
    sendError(res, 'Get classification error ');
  }
})

/**
 * @route GET /api/customer/classification/:customerId
 * @description Get a classification of customer
 * @access public
 */
customerAdminRoute.get('/classification/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.customerId }).populate('orders');
  
    const {classification} = customer;
    sendSuccess(res, 'Get classification success', {
        classification,
        daysSinceAccountCreation: customer.daysSinceAccountCreation
    })
  } catch (error) {
    sendError(res, 'Get classification error ');
  }
})

/**
 * @route DELETE /api/customer/:id
 * @description delete a customer
 * @access public
 */
customerAdminRoute.delete('/:id', async (req, res) => {
    let id = req.params.id;
    const isExist = await Customer.exists({ _id: id })
    if (!isExist) { return sendError(res, 'Customer does not exist.') }

    try {
        await Customer.findByIdAndRemove(id)
        const userfind = await User.find({ role: id })
        await User.findByIdAndRemove(userfind[0]._id)
            .then(() => {
                return sendSuccess(res, "Delete customer user successfully.")
            })
    }
    catch (err) {
        sendServerError(res)
    }
})

/**
 * @route GET /api/customer/customerDebt
 * @description get customer debt
 * @access public
 */
customerAdminRoute.get('/:customerDebt', async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page) : 0
        const { name, sortBy } = req.query
        let listCustomer = [];
        let customerDebt = 0;
        let totalCusTomerDebt = 0;
        let orderDebt = {};

        let orders = await Order.find()
            .populate('customer')
            .skip(pageSize * page)
            .limit(pageSize)
            .sort(sortBy)

        orders.map((order) => {
            if (order.cod.status !== COD_STATUS.paid) {
                customerDebt = order.total_price
                orderDebt = { ...order, customerDebt: customerDebt }
                listCustomer.push({ customerDebt: customerDebt, order: orderDebt._doc })
            }
        })

        if (name) {
            listCustomer = listCustomer.filter((order) => {
                const nameCustomer = order.order.customer.name
                return nameCustomer.toLowerCase().includes(name.toLowerCase())
            })
        }

        listCustomer.forEach((customer) => {
            totalCusTomerDebt += customer.customerDebt
        })

        if (listCustomer)
            return sendSuccess(
                res,
                'Get order information successfully.',
                { totalCusTomerDebt: totalCusTomerDebt, listCustomer })
        return sendError(res, 'Order information is not found.', {})
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route GET /api/customer
 * @description get customers , id
 * @access public
 */
customerAdminRoute.get('/', async (req, res) => {
    const id = req.query.id ? req.query.id : null;
    const keyword = req.query.keyword ? req.query.keyword : null;
    const sort = req.query.sort || 1;
    const filter = req.query.filter
    let query = {};
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (id) {
      if (!objectIdRegex.test(id)) {
        return sendError(res, "Invalid ID format");
      }
        query = { _id: id }
    }
    else if (keyword) {
       query = {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { address: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { customer_type: { $regex: keyword, $options: 'i' } },
            { companyTaxcode_business: { $regex: keyword, $options: 'i' } }
          ]
        }
    } else if (filter) {
        query = { customer_type: filter }
    }
    try {
        if (sort !== '1' && sort !== '-1') {
          return sendError(res, "Invalid sort value");
        }
        if (id) {
      const customer = await Customer.findOne(query);
      if (!customer) {
        return sendError(res, "Customer not found");
      }
    }
        const result = await Customer.find(query).sort({ name: sort })
        if (result.length === 0) {
          return sendError(res, "No information found.");
        }
        return sendSuccess(res, "Get customers successfully.", result)
    }
    catch (err) {
        sendServerError(res);
        console.log(err);
    }
})

/**
 * @route GET /api/admin/customer/list/customers/
 * @description get list customer
 * @access public
 */
customerAdminRoute.get('/list/customers/', async (req, res) => {
  try {
      const limit = req.query.limit || 15;
      const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(limit);
      if (customers.length < 1)
          return sendError(res, 'No customer yet');
      const detail = []
      customers.forEach((customer) => {
          const data = {
              id: customer._id,
              name: customer.name,
              level: customer.rank_passers.level,
              point: customer.rank_passers.point,
              customer_type: customer.customer_type,
              address: customer.address,
              description: customer.description,
              companyTaxcode_business: customer.companyTaxcode_business,
              createdAt: customer.createdAt,
          }
          detail.push(data);
      });
      return sendSuccess(res, "Get list Customer success!", { detail })
  } catch (error) {
      console.error(error)
      return sendError(res, 'Internal server error');
  }
});

/**
 * @route GET /api/admin/customer/detail/:id
 * @description get list customer
 * @access public
 */
customerAdminRoute.get('/detail/:id', async (req, res) => {
  try {
      const { id } = req.params
      const cusId = mongoose.Types.ObjectId(id);
      const customer = await User.aggregate([
        {
          $match: {
            role: cusId
          }
        },
        {
          $lookup: {
            from: "customers",
            localField: "role",
            foreignField: "_id",
            as: "customerInfo"
          }
        },
        {
          $addFields: {
            role: { $arrayElemAt: ["$customerInfo", 0] },
          }
        },
        {
          $project: {
            name: "$role.name",
            phone: 1,
            email: 1,
            address: "$role.address"
          }
        }
      ])
      return sendSuccess(res, "Get list Customer success!", customer)
  } catch (error) {
      console.error(error)
      return sendError(res, 'Internal server error');
  }
});

export default customerAdminRoute;