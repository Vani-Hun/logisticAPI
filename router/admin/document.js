import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { createDocument } from "../../validation/document.js";
import Order from "../../model/Order.js";
import Product from "../../model/Product.js";
import Document from "../../model/Document.js";

const documentAdminRoute = express.Router()

/**
 * @route POST /api/admin/document/create
 * @description create information of document
 * @access private
 */
documentAdminRoute.post("/create", async (req, res) => {
    const errors = createDocument(req.body)
    if (errors) return sendError(res, errors)
    try {
        const { order, product, value, delivery_time, receiving_time, transport_means } = req.body

        const orders = await Order.findById({ _id: order })
        if (!orders) return sendError(res, "Order does not exist.")

        const products = await Product.findById({ _id: product })
        if (!products) return sendError(res, "Product does not exist.")

        const documents = await Document.create({ 
            order, 
            product, 
            value, 
            delivery_time, 
            receiving_time, 
            transport_means 
        })
        return sendSuccess(res, "Create information of document successfully.", 
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
                value: documents.value,
                delivery_time: documents.delivery_time, 
                receiving_time: documents.receiving_time,
                transport_means: documents.transport_means,
                __v: documents.__v
            }
        )
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route PUT /api/admin/document/:id
 * @description update information of document
 * @access private
 */
documentAdminRoute.put("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const isExist = await Document.exists({ _id: id })
        if(!isExist) return sendError(res, "Document does not exist.")

        const { value, delivery_time, receiving_time, transport_means } = req.body
        await Document.findByIdAndUpdate(id, {
            value: value, 
            delivery_time: delivery_time, 
            receiving_time: receiving_time, 
            transport_means: transport_means
        })
        return sendSuccess(res, "Update document successfully.", { 
            value, delivery_time, receiving_time, transport_means
        })
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route DELETE /api/admin/document/:id
 * @description delete information of driver profile
 * @access private
 */
documentAdminRoute.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const isExist = await Document.exists({ _id: id })
        if(!isExist) return sendError(res, "Document does not exist.")

        const documents = await Document.findByIdAndDelete(id)
        return sendSuccess(res, "Delete document successfully.", documents)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default documentAdminRoute