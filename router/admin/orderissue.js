import express from "express";
import {
  sendError,
  sendServerError,
  sendSuccess,
} from "../../helper/client.js";
import Order from "../../model/Order.js";
import OrderIssue from "../../model/OrderIssue.js";
import {
  ISSUES_TYPE, ORDER_STATUS
} from "../../constant.js";
import Product from "../../model/Product.js";
const orderIssueAdminRoute = express.Router();
/**
 * @route POST /api/admin/orderIssue/orderIssues
 * @description Update OrderIssues
 * @access private
 */
orderIssueAdminRoute.post('/orderIssues', async (req, res) => {
  try {
    // const orderId = req.params.orderId;
    const { description, orderId, issueType } = req.body;
    if (!issueType == issueType.ISSUES_TYPE) {
      return res.status(404).json({
        message: 'Issue must belong to 1 of this issue: return, lost, damage, prohibited, unreachable, customerRefused, returnToSender, appointment'
      });
    }
    const order = await Order.findOneAndUpdate({
      orderId: orderId,
    }, {
      status: ORDER_STATUS.problem_order
    });
    const isExist = await OrderIssue.exists({
      orderId: orderId
    });
    if (isExist) return sendError(res, "This orderIssues is already existed.");
    else if (!isExist) {
      const orderIssue = new OrderIssue({
        orderId: orderId,
        description: description,
        issueType: issueType,
      });

      await orderIssue.save();

      return sendSuccess(res, "successfully", {
        orderIssue
      });
    }
  } catch (err) {
    return sendServerError(res);
  }
});
/**
 * @route GET /api/admin/orderIssue/:id
 * @description Get orderIssues by id
 * @access private
 */
orderIssueAdminRoute.get("/:id", async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const orderIssue = await OrderIssue.findById(id);
    if (orderIssue) return sendSuccess(res, "Get orderIssue successfully.", orderIssue);
    return sendError(res, "Information not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});
/**
 * @route GET /api/admin/orderIssue/
 * @description Get list orderIssues 
 * @access private
 */
orderIssueAdminRoute.get("/", async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    const { orderId, issueType, sortBy, keyword } = req.query;
    let query = {};
    let listKeyword = keyword ?
      {
        $or: [
          { orderId: { $regex: keyword, $options: "i" } },
          { issueType: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      } : {};

    if (orderId) {
      query.orderId = orderId;
    }
    if (issueType) {
      query.issueType = issueType;
    }
    const length = await OrderIssue.find({
      $and: [query, listKeyword]
    }).count();
    const listOrderIssue = await OrderIssue.find({
      $and: [query, listKeyword]
    })
      .limit(pageSize)
      .skip(pageSize * page)
      .sort(`${sortBy}`);

    if (listOrderIssue)
      return sendSuccess(res, "Get orderIssue successful.", { length, listOrderIssue });
    return sendError(res, "Information not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

// orderIssueAdminRoute.put('/issues/:orderId/:issues', async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const issues = req.params.issues;
//     const {
//       description, productIds
//     } = req.body;
// const productId = productIds.map(productId => productId._id);
//     await Product.updateMany({
//       _id: {
//         $in: productId
//       }
//     }, {
//       isIssues: issues
//     });
//     const order = await Order.findOneAndUpdate({
//       orderId
//     }, {
//       isIssues: issues
//     });
//     if (!order) {
//       return res.status(404).json({
//         message: 'order not found'
//       });
//     }
//     const isExist = await OrderIssue.exists({
//       orderId: orderId
//     });
//     if (isExist) return sendError(res, "This orderIssues is already existed.");
//     else if (!isExist) {
//       const orderIssue = new OrderIssue({
//         orderId: orderId,
//         description: description,
//         issueType: issues,
//         productIds: productIds,
//       });

//       await orderIssue.save();
//       return sendSuccess(res, "successfully", {
//         orderIssue
//       });
//     }
//   } catch (err) {
//     return sendServerError(res);
//   }
// });

export default orderIssueAdminRoute;