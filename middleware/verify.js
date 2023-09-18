import jwt from "jsonwebtoken"
import { sendError, sendServerError } from "../helper/client.js"
import { TOKEN_BLACKLIST, TOKEN_LIST } from "../index.js"
import Customer from "../model/Customer.js"
import AuthOffline from "../model/AuthOffline.js"
import User from "../model/User.js"
import Staff from "../model/Staff.js"
import { AUTH_OFFLINE_CODE } from "../constant.js"
import KeyToken from "../model/KeyToken.js"


/**
 * header contain
 * Authorised : token
 */
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token']
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, "publicKey", async function (err, decoded) {
                if (err) {
                    return sendError(res, 'jwt expired.', 401)
                } else {
                    console.log(`decoded`, decoded);
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return sendError(res, 'No token provided', 401)
        }
    } catch (error) {
        console.log(error);
        return sendError(res, 'No token provided.', 401)
    }
}

export const verifyRefreshToken = async (refreshToken) => {

}

export const verifyAdmin = async (req, res, next) => {
    const role = req.decoded.role;
    if (role != null && role != undefined){
        if (req.decoded.role !== 'admin') {
            return sendError(res, 'Forbidden.', 403)
        }  
    } 
    else {
        return sendError(res, 'Forbidden.', 403)
    }
    
    next()
}

export const verifyStaff = async (req, res, next) => {
    if (!req.user.role.hasOwnProperty('staff_type'))
        return sendError(res, 'Forbidden.', 403)
    next()
}

export const verifyCustomer = async (req, res, next) => {
    if (req.params.customerId) {
        const { customerId } = await req.params
        if (customerId.length !== 24) {
            return sendError(res, 'Wrong ID of Customer')
        }
        const isExistCustomer = await Customer.exists({ _id: customerId, })
        if (isExistCustomer == null && !req.user.role.hasOwnProperty('customer_type'))
            return sendError(res, 'Forbidden.', 403)
    } else if (!req.user.role.hasOwnProperty('customer_type'))
        return sendError(res, 'Forbidden.', 403)
    next()
}

export const verifyStorekeeper = async (req, res, next) => {
    if (req.user.role.staff_type !== 'storekeeper')
        return sendError(res, 'Forbidden.', 403)
    next()
}

export const verifyCustomerOrAdmin = async (req, res, next) => {
    if (req.user.role.staff_type !== 'admin' && (!req.user.role.hasOwnProperty('customer_type')))
        return sendError(res, 'Forbidden.', 403)
    next()
}

export const verifyDriver = async (req, res, next) => {
    if (req.user.role.staff_type !== 'driver')
        return sendError(res, 'Forbidden.', 403)
    next()
}

export const verifyShipper = async (req, res, next) => {
    const role = req.decoded.role;
    if (role != null && role != undefined){
        if (req.decoded.role !== 'shipper') {
            return sendError(res, 'Forbidden.', 403)
        }  
    } 
    else {
        return sendError(res, 'Forbidden.', 403)
    }
    
    next()
}