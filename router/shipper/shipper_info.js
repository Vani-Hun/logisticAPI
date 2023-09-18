import express from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import User from "../../model/User.js";
import Staff from "../../model/Staff.js";
const shipper_infoRouter = express.Router();

/**
 * @route GET /shipper/CODSigningStatus/
 * @description Get shipper's information
 * @access public
 */
shipper_infoRouter.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staff = await Staff.findById(req.decoded.roleId);
        const office = staff.office;
        const nameShipper = staff.name;
        const staffCode = staff.code;
        const detail = {
            office,
            nameShipper,
            staffCode
        }
        return sendSuccess(res, 'Get shippers information successfuly', { detail });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});
export default shipper_infoRouter;