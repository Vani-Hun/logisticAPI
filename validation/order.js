import { CASH_PAYMENT, ORDER_STATUS, PAYMENT_METHOD, PICK_UP_AT, PRODUCT_TYPE, PRODUCT_UNIT, SCAN_TYPE, SHIPPING_TYPE, TRANSPORTATION_TYPE, TypeOfProblem, SUPERVISION_SENDING_DETAIL_TYPE } from "../constant.js"
import Error from "../helper/error.js"

export const updateOrderValidate = (data) => {
  const error = new Error()

  error
    .isRequiredObject(data.sender, "sender", ["name", "phone"])
    .isRequiredObject(data.receiver, "receiver", ["name", "phone"])
    .isRequiredObject(data.origin, "origin", ["loading", "address"])
    .isRequiredObject(data.destination, "destination", ["unloading", "address"])
    .isRequiredObjectArray(data.products, "products", 1, ["name", "quantity", "unit"])

  if (!error.get()) {
    error.isInRange(data.origin.loading, PICK_UP_AT)
      .isInRange(data.destination.unloading, PICK_UP_AT)
    if (data.origin.loading === PICK_UP_AT.SHIP)
      error.isRequiredObject(data.origin.address, "origin's address", ["street", "ward", "district", "province"])
    else if (data.origin.loading === PICK_UP_AT.ON_SITE)
      error.isValidLength(data.origin.address, "origin's address", 24, 24)
    if (data.destination.unloading === PICK_UP_AT.SHIP)
      error.isRequiredObject(
        data.destination.address, "destination's address", ["street", "ward", "district", "province"])
    else if (data.destination.unloading === PICK_UP_AT.ON_SITE)
      error.isValidLength(data.destination.address, "destination's address", 24, 24)
  }

  if (!error.get())
    data.products.forEach((product) => {
      error.isInRange(product.unit, PRODUCT_UNIT);
      error.isRequiredAndInRangeOfNumber(product.quantity, "quantity of a product", { min: 1 })
    })
  return error.get()
}

export const signTheOrder = (data) => {
  const error = new Error();
  
  error.isRequired(data.signature, "signature");
  error.isRequired(data.appSignature, "appSignature");

  return error.get();
}
export const changeShipperOrder = (data) => {
  const error = new Error();
  error.isRequired(data.shipperId, "shipperId");
  return error.get();
}
export const updateOrderStatusValidate = (data) => {
  const error = new Error()

  error.isRequired(data.status, "status").isInRange(data.status, ORDER_STATUS)

  return error.get()
}

export const updateOrderTrackingValidate = (data) => {
  const error = new Error()
  error
  .isRequired(data.scan_type, "scan_type")
  .isInRangeName(data.scan_type, SCAN_TYPE, "scan_type")

  error
  .isRequired(data.scan_code_time, "scan_code_time")
  
  switch(data.scan_type) {
    case  SCAN_TYPE.RECEIVED_ORDER:
        error
          .isRequired(data.post_office  , "post_office");         
        break;
    
    case SCAN_TYPE.SENDING_POSTOFFICE:
        error
          .isRequired(data.driver  , "driver")
          .isRequired(data.transportation, "transportation")
          .isInRangeName(data.transportation, TRANSPORTATION_TYPE, "transportation")
          .isRequired(data.post_office  , "post_office")        
        break;
    case  SCAN_TYPE.INCOMING_POSTOFFICE:
        error
          .isRequired(data.driver  , "driver")    
          .isRequired(data.transportation, "transportation")
          .isInRangeName(data.transportation, TRANSPORTATION_TYPE, "transportation")
          .isRequired(data.post_office  , "post_office");    
        break;
    case  SCAN_TYPE.SENDING_WAREHOUSE:
        error
          .isRequired(data.warehouse, "warehouse")
          .isRequired(data.driver  , "driver")  
          .isRequired(data.transportation, "transportation")
          .isInRangeName(data.transportation, TRANSPORTATION_TYPE, "transportation")
        break;
    case  SCAN_TYPE.INCOMING_WAREHOUSE:
        error
          .isRequired(data.warehouse, "warehouse")
          .isRequired(data.driver  , "driver")  
          .isRequired(data.transportation, "transportation")
          .isInRangeName(data.transportation, TRANSPORTATION_TYPE, "transportation")
        break;
    case  SCAN_TYPE.SHIPPING:
        error
          .isRequired(data.transportation, "transportation")
          .isInRangeName(data.transportation, TRANSPORTATION_TYPE, "transportation")
          .isRequired(data.post_office  , "post_office")
        break;
    case  SCAN_TYPE.UNUSUAL_ORDER:
          error
            .isRequired(data.issueType, "issueType")
            .isInRangeName(data.issueType, TypeOfProblem, "issueType")
            .isRequired(data.post_office  , "post_office");  
          break;
    case  SCAN_TYPE.PACKAGING:
          error
            .isRequired(data.seal_code, "seal_code")
            .isRequired(data.warehouse  , "warehouse");  
          break;
    case  SCAN_TYPE.REMOVE_PACKAGING:
          error
            .isRequired(data.seal_code, "seal_code")
            .isRequired(data.post_office  , "post_office");  
          break;
    default:
    // code block
  }

  return error.get()
}

export const signOrderValidate = (data) => {
  const error = new Error()
  error
  .isRequired(data.sign, "sign")
  .isRequired(data.shipper, "shipper")
   return error.get()
}

export const TrackingValidateForShipper = (data) => {
  const error = new Error()
  error
  .isRequired(data.scan_type, "scan_type")
  .isInRangeName(data.scan_type, SCAN_TYPE, "scan_type")
  .isRequired(data.transportation, "transportation")
  .isInRangeName(data.transportation, TRANSPORTATION_TYPE, "transportation")
  .isRequired(data.post_office  , "post_office"); 

  return error.get()
}

export const validateCreateOrderByShipper = (data) => {
  const error = new Error()

  error.isRequired(data.phone_sender, "phone_sender")
      .isRequired(data.name_sender, "name_sender")
      .isRequired(data.address_sender, "address_sender")
      .isRequired(data.phone_receiver, "phone_receiver")
      .isRequired(data.name_receiver, "name_receiver")
      .isRequired(data.address_receiver, "address_receiver")
      .isRequired(data.origin, "origin")
      .isRequired(data.destination, "destination")
      .isRequired(data.payment_methods, "payment_methods")
      .isInRangeName(data.payment_methods, PAYMENT_METHOD, "payment_methods")
      .isRequired(data.transportation, "transportation")
      .isInRangeName(data.transportation, TRANSPORTATION_TYPE, "transportation")
      .isRequired(data.name_product, "name_product")
      .isRequired(data.type_product, "type_product")
      .isInRangeName(data.type_product, PRODUCT_TYPE, "type_product")
      .isRequired(data.weight_product, "weight_product")
      .isRequired(data.quantity_product, "quantity_product")
      .isRequired(data.type_shipping, "type_shipping")
      .isInRangeName(data.type_shipping, SHIPPING_TYPE, "type_shipping")
      .isRequired(data.total_shipping, "total_shipping")
      .isRequired(data.scan_type, "scan_type")
      .isInRangeName(data.scan_type, SCAN_TYPE, "scan_type")
      .isRequired(data.cash_payment, "cash_payment")
      .isInRangeName(data.cash_payment, CASH_PAYMENT, "cash_payment")

  return error.get()
}

export const validateAllProblemOrder = data => {
  const error = new Error()
  error.isRequired(data.issueType, 'issueType')
  .isInRange(data.issueType, TypeOfProblem)
  .isRequired(data.description, 'description')
  return error.get()
}

export const validateGetSupervisionSending = data => {
  const error = new Error()
  error
  .isRequired(data.from_date, 'from_date')
  .isRequired(data.to_date, 'to_date')

  return error.get()
}

export const validateGetSupervisionSendingDetail = (postOfficeCode, detail_type, page, pageSize, 
  from_date, to_date) => {
  const error = new Error()
  error
  .isRequired(page, 'page')
  .isRequired(pageSize, 'pageSize')
  .isRequired(postOfficeCode, 'postOfficeCode')
  .isRequired(detail_type, 'detail_type')
  .isInRangeName(detail_type, SUPERVISION_SENDING_DETAIL_TYPE, "detail_type")
  .isRequired(from_date, 'from_date')
  .isRequired(to_date, 'to_date')

  return error.get()
}


export const updateStatusInprogressValidate = (data) => {
  const error = new Error();
  error.isRequired(data.pickUpStaff, "pickUpStaff");
  return error.get();
}

export const validateUpdatePostOffice = (data) => {
  const error = new Error()
  error
  .isRequired(data.origin, 'origin')
  .isRequired(data.destination, 'destination')
  return error.get()
}

export const createOrderByAdminValidate = (data) => {
  const error = new Error()
  error.isRequired(data.origin, 'origin')
  error.isRequired(data.destination, 'destination')
  error.isRequired(data.pickup_staff, 'pickup_staff')
  error.isRequired(data.customer, 'customer')
  error.isRequired(data.shipping.type_shipping, 'type_shipping')
  error.isRequired(data.product.cash_payment, 'cash_payment')
  error.isRequired(data.product.product_types, 'product_types')
  error.isRequired(data.product.weight, 'weight')
  error.isRequired(data.product.transportation, 'transportation')
  error.isRequired(data.product.product_name, 'product_name')
  error.isRequired(data.product.quantity, 'quantity')
  error.isRequired(data.sender.name, 'sender_name')
  error.isRequired(data.sender.phone, 'sender_phone')
  error.isRequired(data.sender.email, 'sender_email')
  error.isRequired(data.sender.address, 'sender_address')
  error.isRequired(data.receiver.name, 'receiver_name')
  error.isRequired(data.receiver.phone, 'receiver_phone')
  error.isRequired(data.receiver.email, 'receiver_email')
  error.isRequired(data.receiver.address, 'receiver_address')
  return error.get()
}

export const createOrderByCustomerValidate = (data) => {
  const error = new Error()
  error.isRequired(data.origin, 'origin')
  error.isRequired(data.destination, 'destination')
  error.isRequired(data.shipping.type_shipping, 'type_shipping')
  error.isRequired(data.product.cash_payment, 'cash_payment')
  error.isRequired(data.product.product_types, 'product_types')
  error.isRequired(data.product.weight, 'weight')
  error.isRequired(data.product.transportation, 'transportation')
  error.isRequired(data.product.product_name, 'product_name')
  error.isRequired(data.product.quantity, 'quantity')
  error.isRequired(data.sender.name, 'sender_name')
  error.isRequired(data.sender.phone, 'sender_phone')
  error.isRequired(data.sender.address, 'sender_address')
  error.isRequired(data.receiver.name, 'receiver_name')
  error.isRequired(data.receiver.phone, 'receiver_phone')
  error.isRequired(data.receiver.address, 'receiver_address')
  return error.get()
}