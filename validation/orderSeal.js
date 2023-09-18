import Error from "../helper/error.js"

export const createOrderSealValidate = data => {
    const error = new Error()

    error.isRequired(data.warehouse, 'warehouse')
        .isRequired(data.orderIds, 'orderIds')
        .checkMongoId(data.warehouse, 'warehouse')
           
    return error.get()
}