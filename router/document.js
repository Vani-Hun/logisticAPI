import express from "express"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import { createDocument } from "../validation/document.js";
import { verifyToken, verifyCustomer } from "../middleware/verify.js";
import Document from "../model/Document.js";
import Order from "../model/Order.js";
import Product from "../model/Product.js";
import User from "../model/User.js";

const documentRoute = express.Router()

/**
 * @route GET /api/document/
 * @description get about information
 * @access private
 */
documentRoute.get('/', verifyToken,
    async (req, res) => {
        try {
            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return sendError(res, "User not found", 404);
            }
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
            const page = req.query.page ? parseInt(req.query.page) : 0
            const { keyword, sortBy, limit, order, product, value,
                delivery_time, receiving_time, transport_means } = req.query

            var query = {}
            var keywordList = keyword
                ? {
                    $or: [
                        { order: { $regex: keyword, $options: "i" } },
                        { product: { $regex: keyword, $options: "i" } },
                        { value: { $regex: keyword, $options: "i" } },
                        { delivery_time: { $regex: keyword, $options: "i" } },
                        { receiving_time: { $regex: keyword, $options: "i" } },
                        { transport_means: { $regex: keyword, $options: "i" } }
                    ]
                }
                : {}

            if (order) {
                query.order = order
            }
            if (product) {
                query.product = product
            }
            if (value) {
                query.value = value
            }
            if (delivery_time) {
                query.delivery_time = delivery_time
            }
            if (receiving_time) {
                query.receiving_time = receiving_time
            }
            if (transport_means) {
                query.transport_means = transport_means
            }

            const length = await Document.find({ $and: [query, keywordList] }).count()
            const documents = await Document.find({ $and: [query, keywordList] })
                .skip(pageSize * page)
                .limit(pageSize)
                .sort(`${sortBy}`)
            if (documents.length == 0) return sendError(res, "Document information is not found.")
            return sendSuccess(res, "Get document successfully.", { length, documents })
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    });

/**
 * @route GET /api/document/:id
 * @description get about information of document by id
 * @access private
 */
documentRoute.get('/:id', verifyToken,
    async (req, res) => {
        try {
            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return sendError(res, "User not found", 404);
            }
            const { id } = req.params
            const document = await Document.findById(id)
            const orders = await Order.findOne()
            const products = await Product.findOne()
            if (document) return sendSuccess(res, "Get document successfully.",
                {
                    orders: {
                        orderId: orders.orderId,
                        service: orders.service,
                        customer: orders.customer,
                        sender: orders.sender,
                        receiver: orders.receiver,
                        origin: orders.origin,
                        destination: orders.destination,
                        total_price: orders.total_price,
                        route: orders.route,
                        feedback: orders.feedback
                    },
                    products: products,
                    value: document.value,
                    delivery_time: document.delivery_time,
                    receiving_time: document.receiving_time,
                    transport_means: document.transport_means,
                    __v: document.__v
                }
            )
            return sendError(res, "Not information found.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    })

export default documentRoute