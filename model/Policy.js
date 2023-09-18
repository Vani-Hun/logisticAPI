import mongoose, { Mongoose, mongo } from "mongoose";
const { Schema } = mongoose;

const PolicySchema = new Schema({
    companyName: {
        type: String,
        required: true
    },
    // brc: Business Registration Certificate
    brc: {
        type: String,
        required: true
    },
    issuedBy: {
        type: String,
        required: true
    },
    privacyPolicy: {
        type: String,
        required: true
    },
    returnPolicy: {
        info: [{
            type: String
        }],
        process: [{
            type: String
        }]
    },
    complaints: {
        complaintTimeLimit: [{
            type: String,
        }],
        complaintResolutionTime: [{
            type: String,
        }],
        complaintTypes: [{
            serviceType: {
                type: String,
            },
            responseTime: {
                type: String,
            },
            resolutionTime: {
                type: String,
            }
        }]
    },
    Compensation: {
        // Compensation Policy for Loss/Damage of Goods during Transportation
        damagedGoods: {
            lost: [{
                type: String,
            }],
            damage: [{
                type: String,
            }],
            notice: [{
                type: String,
            }]
        },
        // Policy for Deviation from Operational Procedures
        operatingError: [{
            type: String,
        }],
        // Compensation for Failure to Ensure Transportation Quality
        transportationQuality: [{
            category: {
                type: String,
            },
            detail: {
                type: String,
            },
            amount: {
                type: String,
            }
        }],
        // Compensation for lost goods in transit
        lossOfGoods: {
            // regulations on compensation
            regulation: [{
                type: String,
            }],
            // in case of not using the price declaration service
            noPriceDeclaration: [{
                type: String,
            }],
            // in case of using price declaration service
            priceDeclaration: [{
                case: {
                    type: String,
                },
                detail: {
                    type: String,
                }
            }],
            // valid invoices and documents
            validDocument: [{
                type: String,
            }],
            // Compensation Policy for Damage of Goods during Transportation
            compensation: [{
                type: {
                    type: String,
                },
                level: {
                    type: String,
                },
                value: {
                    type: String,
                }
            }],
            notice: [{
                type: String,
            }],
        },
        // disclaimer of liability
        disclaimer: [{
            type: String,
        }],
        // shipping and forwarding information
        information: [{
            type: String,
        }],
        // information about payment policies
        payment: [{
            type: String,
        }]
    },
    // Privacy Policy
    privacy: {
        // collect personal information
        collect: {
            type: String,
        },
        // purpose of using information
        purpose: {
            info: {
                type: String,
            },
            customer: [{
                type: String,
            }],
            company: [{
                type: String,
            }]
        },
        // disclosure information
        disclosure: [{
            type: String,
        }],
        // Access and Edit Methods for Information
        method: {
            type: String,
        },
        // acceptance
        acceptance: {
            type: String,
        }
    },
    others: [
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ]
}, { timestamps: true });

export default mongoose.model('policies', PolicySchema);