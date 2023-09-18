import { SCAN_TYPE } from "../constant.js";
import Order from "../model/Order.js";

const allUnique = arr => arr.length === new Set(arr).size;

export const genarateSealCode = (length = 6) => {
    return Math.random().toString(36).substring(2, length+2).toUpperCase();
}

export const checkOrdersInCreateSealOrder = async (orderIds, warehouse) => {
    // check orderIds unique
    let _orderIds = orderIds.map(value => value.orderId);
    if (allUnique(_orderIds) == false){
        return 'orderIds has value not unique.';
    }

    // check order exists
    // check order is in warehouse
    let querys = [];
    let error = null;
    for (let i in orderIds) {
        let orderId = orderIds[i].orderId;
        let query = Order.findOne({orderId : orderId}).then((order) => {
            if (order == null || order == undefined) {           
                error =  `orderIds - ${orderId} is not exist`;
                return;
            }
            if (order.is_in_plan == true) {           
                error =  `orderIds - ${orderId} is in another seal / in plan to do something`;
                return;
            }
            if (order.tracking == null || order.tracking == undefined) {
                error = `orderIds - ${orderId} is not in warehouse - ${warehouse}`;
                return;
            }
            else {
                let len = order.tracking.length - 1;
                if (len == -1) {
                    error = `orderIds - ${orderId} is not in warehouse - ${warehouse}`;
                    return;
                }
                if (order.tracking[len].scan_type != SCAN_TYPE.INCOMING_WAREHOUSE){
                    error = `orderIds - ${orderId} is not in warehouse - ${warehouse}`;
                    return;
                }
                if (order.tracking[len].scan_type == SCAN_TYPE.INCOMING_WAREHOUSE &&
                    order.tracking[len].warehouse != warehouse){
                    error = `orderIds - ${orderId} is not in warehouse - ${warehouse}`;
                    return;
                }
            }
            
        });
        querys.push(query);
    }
    await Promise.all(querys);
    return error;
}

export const updateInPlanForOrders = async (orderIds) => {
    let _orderIds = orderIds.map(value => value.orderId);
    await Order.updateMany(
      { orderId : {
            $in : _orderIds,
        } 
      },
      { $set: { is_in_plan : true } },
    )
}

export const handleClearOrderIds = async (orderIds) => {
    let _orderIds = orderIds.map(value => value.orderId);
    await Order.updateMany(
      { orderId : {
            $in : _orderIds,
        } 
      },
      { $set: { is_in_plan : false } },
    )
}

export const checkOrdersInUpdateSealOrder = async (
    old_orderIds,
    orderIds, warehouse) => {
    // check orderIds unique
    let _orderIds = orderIds.map(value => value.orderId);
    let _old_orderIds = old_orderIds.map(value => value.orderId);

    if (allUnique(_orderIds) == false){
        return 'orderIds has value not unique.';
    }

    // check order exists
    // check order is in warehouse
    let querys = [];
    let error = null;
    for (let i in orderIds) {
        let orderId = orderIds[i].orderId;
        let query = Order.findOne({orderId : orderId}).then((order) => {
            if (order == null || order == undefined) {           
                error =  `orderIds - ${orderId} is not exist`;
                return;
            }
            if (_old_orderIds.indexOf(orderId) == -1){
                if (order.is_in_plan == true) {           
                    error =  `orderIds - ${orderId} is in another seal / in plan to do something`;
                    return;
                }
            }
            
            if (order.tracking == null || order.tracking == undefined) {
                error = `orderIds - ${orderId} is not in warehouse - ${warehouse}`;
                return;
            }
            else {
                let len = order.tracking.length - 1;
                if (len == -1) {
                    error = `orderIds - ${orderId} is not in warehouse - ${warehouse}`;
                    return;
                }
                if (order.tracking[len].scan_type != SCAN_TYPE.INCOMING_WAREHOUSE){
                    error = `orderIds - ${orderId} is not in warehouse - ${warehouse}`;
                    return;
                }
                if (order.tracking[len].scan_type == SCAN_TYPE.INCOMING_WAREHOUSE &&
                    order.tracking[len].warehouse != warehouse){
                    error = `orderIds - ${orderId} is not in warehouse - ${warehouse}`;
                    return;
                }
            }
            
        });
        querys.push(query);
    }
    await Promise.all(querys);
    return error;
}

  