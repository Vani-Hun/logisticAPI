import express from "express"
import authAdminRoute from "./auth.js"
import serviceAdminRoute from "./service.js"
import warehouseAdminRoute from "./warehouse.js"
import aboutAdminRoute from "./about.js"
import contactUsAdminRoute from "./contactUs.js"
import commitmentAdminRoute from "./commitment.js"
import subCommitmentAdminRoute from "./subCommitment.js"
import partnerAdminRoute from "./partner.js"
import contactMsgAdminRoute from "./contactMsg.js"
import userAdminRoute from "./user.js"
import carAdminRoute from "./car.js"
// import billAdminRoute from "./bill.js"
import prohibitedProductAdminRoute from "./prohibitedProduct.js"
import consultancyAdminRoute from "./consultancy.js"
import participantAdminRoute from "./participant.js"
import quoteAdminRoute from "./quote.js"
import orderAdminRoute from "./order.js"
import applicantAdminRoute from "./applicant.js"
import careerAdminRoute from "./career.js"
import departmentAdminRoute from "./department.js"
import staffAdminRoute from "./staff.js"
import productAdminRoute from "./product.js"
import featureAdminRoute from "./feature.js"
import priceAdminRoute from "./price.js"
import pricelistAdminRoute from "./pricelist.js"
import customerAdminRoute from "./customer.js"
import turnoverAdminRoute from "./turnover.js"
import carFleetAdminRoute from "./carFleet.js"
import CarriageContractAdminRoute from "./carriageContract.js"
import carRepairAdminRoute from "./carrepair.js"
import deliveryReportAdminRoute from "./deliveryReport.js"
import insuranceRouteAdmin from "./insurance.js"
import taxRouteAdmin from "./tax.js"
import totalCostAdminRoute from "./totalCost.js"
import kiosAdminRoute from "./kios.js"
import blogAdminRoute from "./blog.js"
import bookingAdminRoute from "./booking.js"
import materialAdminRoute from "./material.js"
import driverProfileAdminRoute from "./driverProfile.js"
import vehicleProfileAdminRoute from "./vehicleProfile.js"
import documentAdminRoute from "./document.js"
import expenseCategoryAdminRoute from "./expenseCategory.js"
import reciptCategoryAdminRoute from "./reciptCategory.js"
import discountAdminRoute from "./discount.js"
import individualContractAdminRoute from "./individualContract.js"
import businessContractAdminRoute from "./businessContract.js"
import orderIssueAdminRoute from "./orderissue.js"
import suggestAdminRoute from "./suggest.js"
import addressAdminRoute from "./address.js"
import orderNotificationAdminRoute from "./orderNotification.js"
import faqAdminRoute from "./faq.js"
import compareReviewAdminRoute from "./compareReview.js"
import policyAdminRoute from "./policy.js"
import exportExcelAdminRoute from "./exportExcel.js"
import postOfficeAdminRoute from "./postOffice.js"
import orderSealRoute from "./orderSeal.js"
import driverTaskAdminRoute from "./driverTask.js"
import feeAdminRoute from "./fee.js"
import strengthAdminRoute from "./strength.js"
import expressAdminRoute from "./express.js"
import careerLifeAdminRoute from "./careerLife.js"
import lifeStyleAdminRoute from "./lifeStyle.js"
import socialNetworkAdminRoute from "./socialNetwork.js"
import chatInfoAdminRoute from "./chatInfo.js"
import driverAssignmentRouter from "./driverAssignment.js"
import carTaskRouter from "./carTask.js"
const adminRoute = express.Router();

adminRoute.use('/auth', authAdminRoute)
    .use('/service', serviceAdminRoute)
    .use('/warehouse', warehouseAdminRoute)
    .use('/about', aboutAdminRoute)
    .use('/contactus', contactUsAdminRoute)
    .use('/commitment', commitmentAdminRoute)
    .use('/sub-commitment', subCommitmentAdminRoute)
    .use('/partner', partnerAdminRoute)
    .use('/message', contactMsgAdminRoute)
    .use('/user', userAdminRoute)
    .use('/car', carAdminRoute)
    // .use('/bill', billAdminRoute)
    .use('/prohibited-product', prohibitedProductAdminRoute)
    .use('/consultancy', consultancyAdminRoute)
    .use('/participant', participantAdminRoute)
    .use('/quote', quoteAdminRoute)
    .use('/order', orderAdminRoute)
    .use("/applicant", applicantAdminRoute)
    .use("/career", careerAdminRoute)
    .use("/department", departmentAdminRoute)
    .use("/staff", staffAdminRoute)
    .use("/product", productAdminRoute)
    .use("/feature", featureAdminRoute)
    .use('/price', priceAdminRoute)
    .use('/pricelist', pricelistAdminRoute)
    .use("/customer", customerAdminRoute)
    .use("/turnover", turnoverAdminRoute)
    .use("/carfleet", carFleetAdminRoute)
    .use("/carriagecontract", CarriageContractAdminRoute)
    .use("/carrepair", carRepairAdminRoute)
    .use("/kios", kiosAdminRoute)
    .use("/blog", blogAdminRoute)
    .use("/booking", bookingAdminRoute)
    .use("/material", materialAdminRoute)
    .use("/deliveryreport", deliveryReportAdminRoute)
    .use("/insurance", insuranceRouteAdmin)
    .use("/tax", taxRouteAdmin)
    .use("/totalcost", totalCostAdminRoute)
    .use("/driver-profile", driverProfileAdminRoute)
    .use("/vehicle-profile", vehicleProfileAdminRoute)
    .use("/document", documentAdminRoute)
    .use("/expense-category", expenseCategoryAdminRoute)
    .use("/recipt-category", reciptCategoryAdminRoute)
    .use("/discount", discountAdminRoute)
    .use("/individual-contract", individualContractAdminRoute)
    .use("/business-contract", businessContractAdminRoute)
    .use("/orderIssue", orderIssueAdminRoute)
    .use("/suggest", suggestAdminRoute)
    .use("/address", addressAdminRoute)
    .use("/orderNotification", orderNotificationAdminRoute)
    .use("/faq", faqAdminRoute)
    .use("/compare-review", compareReviewAdminRoute)
    .use("/policy", policyAdminRoute)
    .use("/post-office", postOfficeAdminRoute)
    .use("/export", exportExcelAdminRoute)
    .use("/orderSeal", orderSealRoute)
    .use("/driver-task", driverTaskAdminRoute)
    .use("/fee", feeAdminRoute)
    .use("/strength", strengthAdminRoute)
    .use("/express", expressAdminRoute)
    .use("/career-life", careerLifeAdminRoute)
    .use("/life-style", lifeStyleAdminRoute)
    .use("/social-network", socialNetworkAdminRoute)
    .use("/chat-info", chatInfoAdminRoute)
    .use("/assign-driver", driverAssignmentRouter)
    .use("/car-task", carTaskRouter)
export default adminRoute

