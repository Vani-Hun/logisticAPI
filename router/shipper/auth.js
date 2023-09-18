import express from 'express'
import argon2 from "argon2"
import jwt from "jsonwebtoken"
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import Staff from '../../model/Staff.js'
import User from '../../model/User.js'
import { createKeyToken } from '../../service/auth.js'
import { createTokenPair, createNewTokenPair } from '../../middleware/auth.js'
import PostOffice from '../../model/PostOffice.js'
import { JWT_EXPIRED, JWT_REFRESH_EXPIRED } from '../../constant.js'
import { TOKEN_LIST, TOKEN_BLACKLIST } from '../../index.js'
import { userChangePw } from '../../validation/auth.js'
import KeyToken from '../../model/KeyToken.js'
import { clearTokenList } from '../../service/jwt.js'
import { verifyShipper, verifyToken} from "../../middleware/verify.js"
const authShipperRoute = express.Router()

/**
 * @route POST /api/shipper/auth/login
 * @description shipper login
 * @access public
 */
authShipperRoute.post('/login', async (req, res) => {
    
    try {
        const userAgent = req.useragent;
        const ip = req.clientIp;

        const deviceInfo = {
            browser: userAgent.browser,
            version: userAgent.version,
            os: userAgent.os,
            platform: userAgent.platform,
            source: userAgent.source,
            ip: ip
        };
        console.log("deviceInfo:", deviceInfo)
        const { codeOffice, codeStaff, password } = req.body
        const postOffice = await PostOffice.findOne({ code: codeOffice })
        if (!postOffice) {
            return sendError(res, 'Invalid office code')
        }
        const staff = await Staff.findOne({ code: codeStaff, office: postOffice._id, isActive: true })
        if (!staff) {
            return sendError(res, 'Invalid staff code')
        }
        const user = await User.findOne({ role: staff._id }).populate({ path: 'role', model: Staff });
        if (!user) {
            return sendError(res, 'User not found');
        }
        if (!user.isActive) {
            return sendError(res, 'Account locked. Please contact the nearest post office.');
        }
        const isPasswordCorrect = await argon2.verify(user.password, password);
        if (!isPasswordCorrect) {
            if (staff.loginAttempts >= 5) {
                user.isActive = false;
                await user.save();
                return sendError(res, 'Account locked');
            } else {
                staff.loginAttempts += 1;
                await staff.save();
                return sendError(res, 'Invalid password');
            }
        }
        if (staff.staff_type !== 'shipper') {
            return sendError(res, 'Not a shipper');
        }
        staff.loginAttempts = 0;
        await staff.save();

        const userData = {
            _id: user._id,
            name: staff.name,
            staff_type: staff.staff_type,
            office: staff.office.code,
            address: staff.address,
            role: user.role,
        }
        console.log(user.role.staff_type);
        const tokens = await createTokenPair({ userId: user._id, role: user.role.staff_type, roleId: user.role._id }, "publicKey", "privateKey")
        await createKeyToken(user._id, deviceInfo , tokens.refreshToken, "privateKey", "publicKey")
        const response = await {
            "status": "Logged in",
            "accessToken": tokens.accessToken,
            "refreshToken": tokens.refreshToken,
            "user": userData
        }
        return sendSuccess(res, 'Login successfully', response)
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }
})

/**
 * @route PUT /api/shipper/auth/change-password
 * @description shipper change password
 * @access public
 */
authShipperRoute.put('/change-password', verifyToken, verifyShipper, async (req, res) => {
    try {
        const errors = userChangePw(req.body)
        if (errors)
            return sendError(res, errors)

        const { oldPw, newPw } = req.body
        if (oldPw === newPw)
            return sendError(res, "New password must be different old password")

        const user = await User.findById(req.user.id);
        if (!user)
            return sendError(res, "User not exist");

        const staff = await Staff.findById(req.decoded.userId);
        if (!staff)
            return sendError(res, "Staff shipper not exist");

        const checkOldPassword = await argon2.verify(user.password, oldPw);
        if (!checkOldPassword)
            return sendError(res, "Old password is not correct");

        const hashPassword = await argon2.hash(newPw);
        await User.findByIdAndUpdate(req.user.id, { password: hashPassword });
        return sendSuccess(res, 'Change password successfully')
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }
})

export default authShipperRoute