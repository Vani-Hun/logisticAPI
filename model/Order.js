import mongoose from "mongoose"
import { ORDER_STATUS, PICK_UP_AT, CASH_PAYMENT, ISSUES_TYPE, COD_STATUS, PRODUCT_TYPE, SCAN_TYPE, TRANSPORTATION_TYPE, PAYMENT_METHOD, SHIPPING_TYPE, TypeOfProblem, PICKUP_METHOD } from "../constant.js"
const { Schema } = mongoose;

const OrderSchema = new Schema(
    {
        orderId: {
            type: String,
            unique: true,
            required: true
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "customers"
        },
        assign_shipper: {
            type: Schema.Types.ObjectId,
            ref: "staffs"
        },
        sender: {
            type: {
                name: {
                    type: String,
                    required: true
                },
                phone: {
                    type: String,
                    required: true
                },
                email: {
                    type: String
                },
                address: {
                    type: String,
                    required: true
                }
            },
            required: true
        },
        receiver: {
            type: {
                name: {
                    type: String,
                    required: true
                },
                phone: {
                    type: String,
                    required: true
                },
                email: {
                    type: String
                },
                address: {
                    type: String,
                    required: true
                }
            },
            required: true
        },
        origin: {
            type: Schema.Types.ObjectId,
            ref: "post_offices",
            default: null
        },
        destination: {
            type: Schema.Types.ObjectId,
            ref: "post_offices",
            default: null
        },
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.waiting_for_pickup,
            required: true
        },
        route: [
            {
                type: Schema.Types.ObjectId,
                ref: "warehouses"
            },
        ],
        tracking: [{
            type: {
                scan_type: {
                    type: String,
                    enum: Object.values(SCAN_TYPE),
                    required: true,
                },
                confirm_staff: {
                    type: Schema.Types.ObjectId,
                    ref: "staffs",
                },
                driver: {
                    type: Schema.Types.ObjectId,
                    ref: "staffs",
                },
                shipper: {
                    type: Schema.Types.ObjectId,
                    ref: "staffs",
                },
                scan_code_time: {
                    type: Date,
                    required: true,
                },
                transportation: {
                    type: String,
                    enum: Object.values(TRANSPORTATION_TYPE),
                },
                issueType: {
                    type: String,
                    enum: Object.values(TypeOfProblem),
                },
                warehouse: {
                    type: Schema.Types.ObjectId,
                    ref: "warehouses"
                },
                seal_code : {
                    type: String,
                },
            },
        }],
        feedback: [
            {
                user: {
                    type: String,
                },
                content: {
                    type: String,
                }
            },
            { timestamps: true }
        ],
        cod: {
            type: {
                status: {
                    type: String,
                    enum: Object.values(COD_STATUS),
                    default: COD_STATUS.waiting,
                    required: true
                },
                cod: {
                    type: String,
                    default: 0
                },
                fee: {
                    type: String,
                    default: 0,
                },
                control_money: {
                    type: String,
                    default: 0
                },
                time_collected: {
                    type: Date
                },
                collectedBy: {
                    type: Schema.Types.ObjectId,
                    ref: "staffs"
                }
            }
        },
        shipping: {
            type: {
                id: {
                    type: String
                },
                insurance_fees: {
                    type: String
                },
                fuel_surcharge: {
                    type: String
                },
                receiver_fee:{
                    type: String
                },
                remote_areas_surcharge: {
                    type: String
                },
                other: {
                    type: String
                },
                VAT: {
                    type: Schema.Types.ObjectId,
                    ref: "tax"
                },
                discount: {
                    type: Schema.Types.ObjectId,
                    ref: "discounts"
                },
                tax_code: {
                    type: String,
                    ref: "taxes"
                },
                tax_VAT_value: {
                    type: String
                },
                copyright_fee: {
                    type: String
                },
                amount_payable: {
                    type: String
                },
                standard_fee: {
                    type: String
                },
                total_amount_before_discount: {
                    type: String
                },
                total_amount_after_discount: {
                    type: String
                },
                total_amount_after_tax_and_discount: {
                    type: String
                },
                pick_up_time: {
                    type: String
                },
                type_shipping: {
                    type: String,
                    enum: Object.values(SHIPPING_TYPE),
                    default: SHIPPING_TYPE.EXPRESS,
                },
                collected: {
                    type: Boolean,
                    default: false
                },
                collected_by: {
                    type: Schema.Types.ObjectId,
                    ref: "staffs"
                },
                collected_time: {
                    type: Date
                }
            }
        },
        product: {
            type: {
                name: {
                    type: String,
                },
                quantity: {
                    type: String,
                },
                types: {
                    type: String,
                    enum: Object.values(PRODUCT_TYPE),
                },
                goods_value: {
                    type: String,
                },
                unit: {
                    type: String,
                },
                weight: {
                    type: String,
                },
                other: {
                    type: String,
                },
                service: {
                    type: String
                },
                payment_person: {
                    type: String
                },
                payment_methods: {
                    type: String,
                    enum: Object.values(PAYMENT_METHOD),
                },
                cash_payment: {
                    type: String,
                    enum: Object.values(CASH_PAYMENT),
                    default: CASH_PAYMENT.PP_CASH
                },
                picture: {
                    type: String
                },
                transportation: {
                    type: String,
                    enum: Object.values(PICKUP_METHOD),
                    default: PICKUP_METHOD.T,
                    required: true
                },
                note: {
                    type: String
                },
            }
        },
        timeline: {
            type: [{
                status: {
                    type: String,
                    enum: Object.values(ORDER_STATUS),
                    default: ORDER_STATUS.waiting_for_pickup,
                    required: true
                },
                time: {
                    type: Date,
                    default: Date.now()
                }
            }],
            default: function () {
                return [{
                    status: ORDER_STATUS.waiting_for_pickup,
                    time: Date.now()
                }];
            }
        },
        company: {
            type: {
                name: {
                    type: String
                },
                address: {
                    type: String
                },
                note: {
                    type: String
                }
            },
            default: null
        },
        sign: {
            signed_to_receive: {
                type: Boolean, // Xác nhận đã ký
                default: null
            },
            signature: {
                type: String, // Đường dẫn tới hình ảnh chữ ký
                default: null
            },
            substituteSignature: {
                type: Boolean, // Trường ký thay (true nếu có người nhận hộ)
                default: false
            },
            appSignature: {
                type: String, // Đường dẫn tới hình ảnh chữ ký trên ứng dụng
                default: null
            }
        },
        change_shipper: {
            shipperId: {
                type: Schema.Types.ObjectId,
                ref: "staffs",
            },
            accept_transfer: {
                type: Boolean,
                default: false,
            },
        },
        image: [String],
        pickUpStaff: {
            type: Schema.Types.ObjectId,
            ref: "staffs",
            default: null
        },
        confirmStaff: {
            type: Schema.Types.ObjectId,
            ref: "staffs",
            default: null
        },
        deliverySign: {
            signer: {
                type: Schema.Types.ObjectId,
                ref: "staffs",
                default: null
            },
            shipper: {
                type: Schema.Types.ObjectId,
                ref: "staffs",
                default: null
            },
            sign: {
                type: String,
                default: null
            },
            instead: {
                type: Boolean,
                default: false
            },
            time: {
                type: Date,
                default: null
            },
        },
        is_in_plan : {
            type : Boolean,
            default : false,
            // true : đơn đã lên lịch để thực làm gì đó, vd đã tạo seal bao r
        },
    },
    { timestamps: true }
)

export default mongoose.model('orders', OrderSchema)
