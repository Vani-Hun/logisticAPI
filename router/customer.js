import express from "express"
import Customer from "../model/Customer.js"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import { CUSTOMER } from "../constant.js"
import CustomerService from "../model/CustomerAppointment.js"
import { verifyToken, verifyCustomer } from "../middleware/verify.js"
import User from "../model/User.js"
import argon2 from "argon2"


const customerRoute = express.Router();

/**
 * @route GET /api/customer/
 * @description get all customers, get a customer by id, sort by name and search by keyword
 * @access public
 */
customerRoute.get('/', async (req, res) => {
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
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { address: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { customer_type: { $regex: keyword, $options: 'i' } },
      { companyTaxcode_business: { $regex: keyword, $options: 'i' } }
    ]

  } if (filter) {
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
 * @route POST /api/customer/users
 * @description customer create Child account
 * @access public
 */
customerRoute.post('/users', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerId = user.role;
    const userData = req.body;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return sendError(res, "Customer is not found", 404);
    }
    const newCustomer = await Customer.create({
      name: userData.name,
      customer_type: "passers",
      bank_name: userData.bank_name,
      bank_account_number: userData.bank_account_number,
    });
    const hashedPassword = await argon2.hash(userData.password);
    const newUser = await User.create({
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
      role: newCustomer._id,
      isActive: true,
    });
    customer.child_account.push(newUser._id);
    await customer.save();
    return sendSuccess(res, "Create child account success", { newUser, newCustomer });
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
});
/**
 * @route GET /api/customer/users/:phone
 * @description get Child account of customer
 * @access public
 */
customerRoute.get('/users/:phone', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerId = user.role;
    const phone = req.params.phone;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return sendError(res, "Customer is not found", 404);
    }
    const users = await User.find({ _id: { $in: customer.child_account } });
    if (users.length === 0) {
      return sendError(res, "Phone number does not exist", 404);
    }
    return sendSuccess(res, "successfully", { users, customer: customer });
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
});




export default customerRoute