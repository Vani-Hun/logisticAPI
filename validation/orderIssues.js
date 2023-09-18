import Error from "../helper/error.js";
import { TypeOfProblem,TypeOfStatusProblem } from "../constant.js";

export const createOrderIssuesValidate = (data) => {
    const error = new Error();
    error
        .isRequired(data.issueType, "issueType")
        .isInRangeName(data.issueType, TypeOfProblem, "issueType")
        .isRequired(data.statusIssues, "statusIssues")
        .isInRangeName(data.statusIssues, TypeOfStatusProblem, "statusIssues")
    switch (data.issueType) {
        case TypeOfProblem.RESCHEDULE_PICKUPDATE:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
                .isRequired(data.appointment_date, "appointment_date")
            break;
        case TypeOfProblem.CUSTOMER_UNREACHABLE:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.RETURNED_SHIPMENT:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.REFUSES_PAYMENT:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.PROHIBITED_ITEM:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
                .isRequired(data.image, "image")
            break;
        case TypeOfProblem.UNREACHABLE:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.CUSTOMER_ARRIVAL_FOR_PACKAGE_PICKUP:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.CUSTOMER_CANCEL:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.CANT_CONTACT_SENDER:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.SENDER_RESCHEDULED:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
                .isRequired(data.appointment_date, "appointment_date")
            break;
        case TypeOfProblem.PACKING_NOT_GUARANTEED:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
                .isRequired(data.image, "image")
            break;
        case TypeOfProblem.PARCEL_NOT_READY:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.WRONG_INFO_SENDER:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
            break;
        case TypeOfProblem.SENDER_REGISTER_WRONG_WEIGHT:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
                .isRequired(data.image, "image")
            break;
        case TypeOfProblem.OVERSIZED_OVERLOADED:
            error
                .isRequired(data.orderId, "orderId")
                .isRequired(data.issueType, "issueType")
                .isRequired(data.description, "description")
                .isRequired(data.image, "image")
            break;
        default:
    }
    return error.get()
};