import express, { request } from "express";
import Staff from "../../model/Staff.js";
import User from "../../model/User.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { STAFF } from "../../constant.js";
import AuthOffline from "../../model/AuthOffline.js";
const staffAdminRoute = express.Router();

/**
 * @route GET /api/admin/staff/
 * @description get all staff, get a staff by id, sort by name and search by keyword, filter by staff type
 * @access private
 */
staffAdminRoute.get("/", async (req, res) => {
    const { id, keyword, sort, filter } = req.query
    let query = {}
    if (id) query = { _id: id };
    if (keyword) {
        query = { name: { $regex: keyword, $options: 'i' } };
    }
    if (filter) query = { staff_type: filter };
    try {
        const result = await Staff.find(query)
            .populate("department")
            .populate("car_fleet")
            .sort({ name: sort | 1 });
        return result.length
            ? sendSuccess(res, "Get staffs information successfully", result)
            : sendError(res, "Get staffs error. Not found");
    } catch (error) {
        console.log(error);
        sendServerError(res, error);
    }
});


/**
 * @route  DELETE /api/admin/staff/:id
 * @description Delete staff by id
 * @access private
 */
staffAdminRoute.delete('/:id', async (req, res) => {
    let id = req.params.id;
    const isExist = await Staff.exists({ _id: id })
    if (!isExist) { return sendError(res, 'Staff does not exist.') }
    try {
        const staff = await Staff.deleteOne({ _id: id })
        const userfind = await User.find({ role: id })
        await User.findByIdAndRemove(userfind[0]._id)
        return sendSuccess(res, "Delete staff user successfully.")
    }
    catch (err) { 
        console.log(err);
        sendServerError(res) 
    };
})

/**
 * @route  PUT /api/admin/staff/:id
 * @description Update the staff by id using request body.
 * @access private
 */
staffAdminRoute.put('/:id', async (req, res) => {
    let id = req.params.id;
    const { name, staff_type, department, car_fleet } = req.body;
    const isExist = await Staff.exists({ _id: id })
    if (!isExist) { return sendError(res, 'Staff does not exist.') }
    if (staff_type) {
        if (((staff_type != STAFF.ADMIN && staff_type != STAFF.DRIVER && staff_type != STAFF.SHIPPER && staff_type != STAFF.STOREKEEPER && staff_type != STAFF.STAFF))) {
            return sendError(res, "Staff-type not found.")
        }
    } else if (staff_type == '') {
        return sendError(res, "Staff-type not found.")
    }
    let carFleet = null;
    if (car_fleet === '')
        carFleet = null;
    else
        carFleet = car_fleet;
    try {
        await Staff.findByIdAndUpdate(id, { name: name, staff_type, department: department, car_fleet: carFleet })
        return sendSuccess(res, "Staff updated successfully.")
    }
    catch (err) {
        console.log(err);
        sendServerError(res, err.message)
    }
})

/**
 * @route GET /api/admin/staff/department/:id
 * @description Get Staff by Id Department
 * @access private
 */
staffAdminRoute.get('/department/:id', async (req, res) => {
    try {
        const { id } = req.params
        const staffs = await Staff.find({ department: id })
        if (!staffs) return sendError(res, "Departmental does not exist.");
        if (staffs) return sendSuccess(res, "Get departmental staff", staffs)
        return sendError(res, "Information not found")
    } catch (error) {
        console.log(err);
        return sendError(res, "Departmental does not exist.");
    }
})

/**
 * @route GET /api/admin/staff/get-login-offline-code
 * @description Get login offline code
 * @access private
 */
staffAdminRoute.get('/get-login-offline-code', async (req, res) => {
    try {
        const { staffCode } = req.query;
        const staff = await Staff.findOne({ code: staffCode });
        if (staff == null || staff == undefined) return sendError(res, `Staff - ${staffCode} does not exist`);

        const user = await User.findOne({role : staff._id})

        const randomCode = (Math.random() + 1).toString(36).substring(7).toUpperCase();

        await AuthOffline.create({
            code : randomCode,
            user : user._id,
        })

        return sendSuccess(res, "Get login offline code successfully", {
            code : randomCode
        })
      
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})
export default staffAdminRoute
