
export const handleFilePath = req_file => {
    if (process.platform === 'win32')
        return req_file ? req_file.path.split("\\").slice(1).join("/") : null
    else
        return req_file ? req_file.path.split("/").slice(1).join("/") : null
}

export const OTP_EXPIRED = 60000 // unit: milisecond

export const JWT_EXPIRED = '7d'
export const JWT_REFRESH_EXPIRED = '30d'

export const SESSION_AGE = 600000 // unit: milisecond

export const OPENCAGE_API_KEY = '7f8d6f65dfd846748331d3c5e0a52070'

export const UTYPE = {
    STAFF: 'staff',
    CUSTOMER: 'customer'
}

export const STAFF = {
    MARKETING: 'marketing',
    SALES: 'sales',
    IT: 'it',
    ADMIN: 'admin',
    DRIVER: 'driver',
    SHIPPER: 'shipper',
    STOREKEEPER: 'storekeeper',
    STAFF: 'staff',
    WAREHOUSE_ACCOUNTANT: 'warehouse_accountant',
    GENERAL_ACCOUNTING: 'general_accounting'
}


export const CUSTOMER = {
    BUSINESS: 'business',
    PASSERS: 'passers',
    INTERMEDIARY: 'intermediary'
}

export const CUSTOMER_RANK = {
    TITAN: 'titan',
    GOLD: 'gold',
    SILVER: 'silver',
    BRONZE: 'bronze',
    UNRANK: 'unrank'
}
export const POSITION = {
    INTERN: 'Intern',
    JUNIOR: 'Junior',
    SENIOR: 'Senior',
    CONTRIBUTOR: 'Contributor'
}
export const INDUSTRY = {
    CUSTOMERSERVICE: "Chăm sóc khách hàng",
    POSTALSERVICES: "Bưu cục",
    INFORMATIONTECHNOLOGY: "Công nghệ thông tin",
    TRAINING: "Đào tạo",
    FINANCIALACCOUNTING: "Kế toán tài chính",
    AUDITING_INTERNALCONTROL: "Kiểm toán & kiểm soát nội bộ",
    BUSINESS: "Kinh doanh",
    MARKETING: "Marketing ",
    ADMINISTRATIVERECEPTIONIST: "Nhân sự hành chính",
    LEGAL: "Pháp lý",
    QUALITYMANAGEMENT: "Quản lý chất lượng",
    PURCHASING: "Thu mua",
    ASSISTANT: "Trợ lý",
    OPERATIONSCENTER: "Trung tâm khai thác",
    OPERATIONS: "Vận hành"
}
export const PROVINCES = {
    HA_NOI: "Thành phố Hà Nội",
    CAN_THO: "Thành phố Cần Thơ",
    HO_CHI_MINH: "Thành phố Hồ Chí Minh",
    BAC_NINH: "Thành phố Bắc Ninh",
    DAK_LAK: "Tỉnh Đăk Lăk",
    DONG_NAI: "Tỉnh Đồng Nai",
    PHU_THO: "Tỉnh Phú Thọ",
    THAI_NGUYEN: "Tỉnh Thái Nguyên",
    NGHE_AN: "Tỉnh Nghệ An"
};
export const TYPE_FEE = {
    FEE: "fee",
    TOLL_FEE: "toll_fee",
    FUEL_FEE: "fuel_fee"
}

export const LEASES = {
    WATER: "water",
    ELECTRICITY: "electricity",
    PORTER: "porter",
    SHIPPER: "shipper"
}
export const PRODUCT_UNIT = {
    KG: 'kg',
    TON: 'ton',
    M3: 'm3'
}
export const RETURN_ZONE = {
    A: 'A', // 'provincial'
    B: 'B', // '<100Km'
    C: 'C', // '100-300Km'
    F: 'F' // '>300Km'
}

export const VERIFY_OP = {
    email: 'email',
    phone: 'phone'
}

export const ORDER_STATUS = {
    waiting_for_pickup: 'waiting for pickup',
    in_progress: 'in progress',
    dispatching: 'dispatching',
    dispatched: 'dispatched',
    in_return: 'in return',
    return_confirmation: 'return confirmation',
    return_success: "return success",
    problem_order: 'problem order',
    canceled: 'canceled',
}

export const SCAN_TYPE = {
    RECEIVED_ORDER: 'received_order',// nhận hàng
    SENDING_POSTOFFICE: 'sending_postoffice', // gửi hàng
    INCOMING_POSTOFFICE: 'incoming_postoffice', // hàng đến
    SENDING_WAREHOUSE: 'sending_warehouse', // gửi hàng
    INCOMING_WAREHOUSE: 'incoming_warehouse', // hàng đến
    SHIPPING: 'shipping', // phát hàng
    UNUSUAL_ORDER: 'unusual_order', // hàng bất thường
    PACKAGING: 'packaging', // đóng bao
    REMOVE_PACKAGING: 'remove_packaging', // gỡ gối
    WAREHOUSE: 'warehouse', // nhập kho
    CAR_GOING: 'car_going', // xe đi
    CAR_INCOMING: 'car_incoming', // xe đến
}

export const PRODUCT_STATUS = {
    pending: 'pending',
    already: 'already'
}
export const PRODUCT_TYPE = {
    goods: 'goods',
    fresh: 'fresh',
    letter: 'letter'
}

export const MAX_LENGTH = 5000 // maximum allowed number of characters

export const MIN_LENGTH = 1 // minimum allowed number of characters

export const APPLICANT_STATUS = {
    APPROVED: 'approved',
    PENDING: 'pending',
    REJECTED: 'rejected',
}

export const INTEREST_SOURCE = {
    REC_STAFF: 'staff',
    REC_STAFF: 'friend',
    REC_EMAIL: 'email',
    REC_PHONE: 'phone',
    REC_FB: 'facebook',
    REC_LKD: 'linkedin',
    REC_INT: 'search',
    REC_EVENT: 'event',
    REC_OTHER: 'other',
}

export const MESSAGE_STATUS = {
    unseen: 'unseen',
    seen: 'seen',
}
export const BILL_STATUS = {
    waiting: 'waiting',
    processing: 'processing',
    completed: 'completed'
}

export const CAR_TYPE = {
    TON_8: '8_ton',
    TON_20: '20_ton',
}

export const SUPPLIER = {
    NHA_SAN_XUAT: 'nha_san_xuat',
    NHA_PHAN_PHOI: 'nha_phan_phoi',
    HANG_QUOC_TE: 'hang_quoc_te',
    AMAZON: 'amazon',
    EBAY: 'ebay'
}

export const SUPPLIER_STATUS = {
    pay: 'pay',
    unpay: 'unpay'
}

export const NOTIFY_EVENT = {
    connection: 'connection',
    addSession: 'add-session',
    send: 'send',
    receive: 'receive',
    disconnect: 'disconnect'
}

// This constant may be updated later
export const TURNOVER = {
    complete_order: 'complete order',
    fuel: 'fuel',
    repair: 'repair',
    maintenance: 'maintenance',
    incurred: 'incurred'
}

export const SHIPMENT_MANAGER = {
    import: 'import',
    export: 'export'
}

export const PAYMENT_METHOD = {
    CASH: 'cash',
    MOMO_WALLET: 'momo wallet',
    ZALO_PAY: 'zalo pay',
    PAYPAL: 'paypal',
    BANKING: 'banking'
}

export const PICK_UP_AT = {
    ON_SITE: 'on site',
    SHIP: 'ship'
}
export const REPAIR_TYPE = {
    REPAIR: 'Repair',
    REPLACE: 'Replace'
}

export const DEVICE_TYPE = {
    SHELL: 'Shell',
    BATTERY: 'Battery',
    OIL: 'Oil',
    TIRE: 'Tire',
    OTHER: 'Other'
}

export const BLOG_CATEGORY = {
    INDUSTRY_NEWS: 'industry_news',
    EVENT: 'event',
    J_MAGAZINE: 'j_magazine'
}

export const TRACKING_STATUS = {
    UNKNOWN: "unknown",
}

export const METERIAL_MANAGER = {
    import: 'import',
    export: 'export'
}

export const TAX_TYPE = {
    COMPANY_INCOME: 'Company income',
    EXCISE: 'Excise',
    NATURAL_RESOURCE: 'Natural resource',
    VALUE_ADDED: 'Value added',
    OTHER: 'Other'
}

export const RECEIPT_STATUS = {
    CONFIRMED: 'confirmed',
    UNCONFIRMED: 'unconfirmed'
}
export const ISSUES_TYPE = {
    RETURN: 'return',
    DAMAGED: 'damaged',
    LOST: 'lost',
    PROHIBITED: 'prohibited',
    UNREACHABLE: 'unreachable',
    CUSTOMER_REFUSED: 'customerRefused',
    RETURN_TO_SENDER: 'returnToSender',
    APPOINTMENT: 'appointment'
}

export const TypeOfProblem = {
    RESCHEDULE_PICKUPDATE: 'Khách hẹn lại ngày nhận',
    CUSTOMER_UNREACHABLE: 'Không liên lạc được với khách hàng',
    RETURNED_SHIPMENT: 'Bưu kiện chuyển hoàn',
    REFUSES_PAYMENT: 'Khách từ chối nhận hàng, từ chối trả phí',
    PROHIBITED_ITEM: 'Hàng cấm gửi',
    CUSTOMER_ARRIVAL_FOR_PACKAGE_PICKUP: 'Khách tự đến bưu cục lấy hàng',
    CUSTOMER_CANCEL: 'Khách báo hủy đơn',
    CANT_CONTACT_SENDER: 'Không liên hệ được người gửi',
    SENDER_RESCHEDULED: 'Người gửi hẹn lại ngày lấy',
    PACKING_NOT_GUARANTEED: 'Đóng gói không đảm bảo',
    PARCEL_NOT_READY: 'Bưu kiện chưa sẵn sàng',
    WRONG_INFO_SENDER: 'Sai thông tin người gửi',
    SENDER_REGISTER_WRONG_WEIGHT: 'Người gửi đăng ký sai trọng lượng',
    OVERSIZED_OVERLOADED: 'Quá khổ quá tải'
}
export const TypeOfStatusProblem = {
    PROCESSING: 'processing',
    PROCESSED: 'processed',
}
export const COMPARE_REVIEW_TYPE = {
    ONCE_A_DAY: 'once_a_day',
    ONCE_A_WEEK: 'once_a_week',
    TWICE_A_WEEK: 'twice_a_week',
    THREE_TIMES_A_WEEK: 'three_times_a_week',
    ONCE_A_MONTH: 'once_a_month',
    TWICE_A_MONTH: 'twice_a_month',
    DEFAULT: 'once_a_month',
}

export const DAY_OF_WEEK = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 0,
    LENGTH: 7,
}
export const FUEL_FEE = 52033

export const CASH_PAYMENT = {
    CC_CASH: 'CC_CASH', // receiver pay
    PP_CASH: 'PP_CASH', // sender pay
    PP_PM: 'PP_PM' // the sender pays at the end of the month
}

export const COD_STATUS = {
    waiting: 'waiting',
    collected: 'collected',
    in_process: 'in_process',
    paid: "paid"
}

export const TRANSPORTATION_TYPE = {
    TRUCK: 'truck',
    BOAT: 'boat',
    PLANE: 'plane',
    MOTORBIKE: 'motorbike',
}


export const POSTOFFICE = {
    LENGTH_OF_1ST_PART_IN_CODE: 3,
    LENGTH_OF_2ND_PART_IN_CODE: 2,
    LENGTH_OF_3RD_PART_IN_CODE: 3
}

export const SHIPPING_TYPE = {
    EXPRESS: 'express',
    FAST: 'fast',
    SUPER: 'super'
}

export const SUPERVISION_SENDING_DETAIL_TYPE = {
    SENT: 'sent',
    NOT_SENT: 'not_sent',
    NOT_SHIPPED: 'not_shipped',
    NOT_REVICED: 'not_reviced',
    NOT_SIGN_RECIVED: 'not_sign_reviced',
}

export const PICKUP_METHOD = {
    A: 'A', // pick up goods from sender's address
    T: 'T' // the sender brings the goods to the post office to send
}

export const STAFF_CODE = {
    LENGTH_OF_2ND_PART: 4,
    LENGTH_WITHOUT_POSTOFFICE: 9,
    'marketing': '1',
    'sales': '2',
    'it': '3',
    'admin': '4',
    'driver': '5',
    'shipper': '6',
    'storekeeper': '7',
    'staff': '8',
    'warehouse_accountant': '9',
    'general_accounting': '91'
}

export const ORDER_SEAL_ITEM_STATUS = {
    WAITING: 'waiting',
    IN: 'in',
    OUT: 'out',
}

export const DRIVER_TASK_TYPE = {
    SEND_ORDER: 'send_order',
    GET_ORDER: 'get_order',
}

export const DRIVER_TASK_STATUS = {
    NOT_STARTED: 'not_started',
    DOING: 'doing',
    DONE: 'done',
}

export const DRIVER_TASK_SCAN_TYPE = {
    CAR_INCOMING_POST_OFFICE: 'car_incoming_post_office',
    CAR_LEAVE_POST_OFFICE: 'car_leave_post_office',
    CAR_INCOMING_WAREHOUSE: 'car_incoming_warehouse',
    CAR_LEAVE_WAREHOUSE: 'car_leave_warehouse',
}

export  const DRIVER_STATUS = {
    DRIVING: "driving",
    AVAILABLE: "available",
    UNAVAILABLE: "unavailable"
}

export const AUTH_OFFLINE_CODE = {
    LENGTH: 5
}

export const IMAGE_DEFAULT = {
    BLOG: 'https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg',
}

export const BLOG_BANNER = {
    ID : '64f6c920080c3c704a47525e',
}