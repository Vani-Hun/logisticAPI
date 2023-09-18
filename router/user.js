import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../helper/client.js'
import { verifyCustomer, verifyStaff, verifyToken } from '../middleware/verify.js'
import CarFleet from '../model/CarFleet.js'
import Customer from '../model/Customer.js'
import Department from '../model/Department.js'
import Staff from '../model/Staff.js'
import User from '../model/User.js'

const userRoute = express.Router()

/**
 * @route PUT /api/user/customer
 * @description update personnal customer information
 * @access private
 */
userRoute.put('/customer', verifyToken, async (req, res) => {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const { name, email, phone, address, description, taxcode } = req.body
    try {
        const [isExistedEmail, isExistedPhone] = await Promise.all([
            User.exists({ email }),
            User.exists({ phone })
        ])
        if (isExistedEmail || isExistedPhone)
            return sendError(res, "Email/Phone is used.")
        if (!name && !email && !phone) {
            return sendError(res, "Update account information false.");
        }

        await Promise.all([
            User.findByIdAndUpdate(user._id, { email, phone }),
            Customer.findByIdAndUpdate(user.role, { name, address, description, taxcode })
        ])
        return sendSuccess(res, "Update user's information successfully.")
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route PUT /api/user/staff
 * @description update personnal staff information
 * @access private
 */
userRoute.put('/staff', verifyToken, async (req, res) => {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const { name, email, phone, department, car_fleet } = req.body

    if (!name && !email && !phone && !department && !car_fleet)
        return sendError(res, "Update staff failed.");

    try {
        const [isExistedEmail, isExistedPhone, isExistedDepartment, isExistedCarFleet] = await Promise.all([
            User.exists({ email }),
            User.exists({ phone }),
            Department.exists({ _id: department }),
            CarFleet.exists({ _id: car_fleet })
        ])
        if (isExistedEmail || isExistedPhone)
            return sendError(res, "Email/Phone is used.")
        if (department && !isExistedDepartment)
            return sendError(res, "Department does not exist.")
        if (car_fleet && !isExistedCarFleet)
            return sendError(res, "Car Fleet does not exist.")

        await Promise.all([
            User.findByIdAndUpdate(user._id, { email, phone }),
            Staff.findByIdAndUpdate(user.role, { name, department, car_fleet })
        ])
        return sendSuccess(res, "Update user's information successfully.")
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})
/**
 * @route PATCH /api/user/delete
 * @description update personnal staff information
 * @access private
 */
userRoute.patch("/delete", verifyToken, async (req, res) => {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const userId = user._id;
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { delete: true }
        );

        if (!user) {
            return sendError(res, "User not found.");
        }

        return sendSuccess(res, "Account has been deleted.");
    } catch (error) {
        console.error(error.message);
        return sendServerError(res);
    }
});


export default userRoute
