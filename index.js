import authRoute from "./router/auth.js"
import adminRoute from "./router/admin/index.js"
import orderRoute from "./router/order.js"
import aboutRoute from "./router/about.js"
import publicRoute from "./router/public.js"
import contactUsRoute from "./router/contactUs.js"
import commitmentRoute from "./router/commitment.js"
import partnerRoute from "./router/partner.js"
import contactMsgRoute from "./router/contactMsg.js"
import consultancyRoute from "./router/consultancy.js"
import quoteRoute from "./router/quote.js"
import warehouseRoute from "./router/warehouse.js"
import applicantRoute from "./router/applicant.js"
import careerRoute from "./router/career.js"
import departmentRoute from "./router/department.js"
import participantRoute from "./router/participant.js"
import receiverRoute from "./router/receiver.js"
import productRoute from "./router/product.js"
import featureRoute from "./router/feature.js"
import priceRoute from "./router/price.js"
import priceListRoute from "./router/pricelist.js"
import serviceRoute from "./router/service.js"
import customerRoute from "./router/customer.js"
import turnoverRoute from "./router/turnover.js"
// import billRoute from "./router/bill.js"
import carriageContractRoute from "./router/carriageContract.js"
import blogRoute from "./router/blog.js"
import bookingRoute from "./router/booking.js"
import materialRoute from "./router/material.js"
import driverProfileRoute from "./router/driverProfile.js"
import vehicleProfileRoute from "./router/vehicleProfile.js"
import documentRoute from "./router/document.js"
import complaintRoute from "./router/complaint.js"
import expenseCategoryRoute from "./router/expenseCategory.js"
import reciptCategoryRoute from "./router/reciptCategory.js"
import discountRoute from "./router/discount.js"
import suggestRoute from "./router/suggest.js"
import shippingCostRoute from "./router/shippingCost.js"
import bankAccountRouter from "./router/bankAccount.js"
import orderNotificationRoute from "./router/orderNotification.js"
import notificationRoute from "./router/notification.js"
import exportExcelRoute from "./router/exportExcel.js"
import individualContractRoute from "./router/individualContract.js"
import businessContractRoute from "./router/businessContract.js"
import orderIssueRoute from "./router/orderissuse.js"
import addressRoute from "./router/address.js"
import faqRoute from "./router/faq.js"
import compareReviewRoute from "./router/compareReview.js"
import policyRoute from "./router/policy.js"
import shipperRoute from "./router/shipper/index.js"
import userRoute from "./router/user.js"
import prohibitedProductRoute from "./router/prohibitedProduct.js"
import strengthRoute from "./router/strength.js"
import postOfficeRoute from "./router/postOffice.js"
import expressRoute from "./router/express.js"
import careerLifeRoute from "./router/careerLife.js"
import LifeStyleRoute from "./router/lifeStyle.js"
import chatInfoRoute from "./router/chatInfo.js"
import socialNetworkRoute from "./router/socialNetwork.js"
// lib & middle
import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import YAML from 'yamljs'
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser'
// import { sendMailToCafllet, sendMailToDriver } from "./service/notification.js"
import session from "express-session"
// import path from "path"
// const __dirname = path.resolve(path.dirname(''))
import swaggerUi from 'swagger-ui-express'
import { verifyAdmin, verifyShipper, verifyToken } from "./middleware/verify.js"
import { clearTokenList } from "./service/jwt.js"
import { SESSION_AGE } from "./constant.js"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import useragent from 'express-useragent'
import requestIp from 'request-ip'
import { checkOverload } from "./helper/checkConnectdb.js"
const swaggerDocument = YAML.load('./swagger.yaml')

// dotevn config

dotenv.config()


/**
 * Connect MongoDB
 */
mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 100 })
const db = mongoose.connection
db.on('error', () => console.log('MongoDB connection error.'))
db.once('open', () => {
  console.log('Connected to MongoDB successfully.')
  // mongoose.set("debug", true)
  // mongoose.set("debug", { color: true })
})
checkOverload()
const PORT = process.env.PORT || 8000

export const TOKEN_LIST = {}
export const TOKEN_BLACKLIST = {}
export const SOCKET_SESSIONS = []
const app = express()

const store = new session.MemoryStore()

app.use(session({
  secret: process.env.SESSION_NAME,
  cookie: { maxAge: SESSION_AGE },
  saveUninitialized: false,
  store,
  resave: false
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.DEV == '1' ? process.env.DEV_URL : process.env.HOST,
  credentials: true
}))
// app.use(helmet())
app.use(morgan("dev"))
app.use(compression())

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// app.get('/favico.ico', (req, res) => {
//     res.sendStatus(404);
// });
app.use(useragent.express());
app.use(requestIp.mw())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use('/api/public', publicRoute)
  .use('/api/admin', verifyToken, adminRoute)
  .use('/api/auth', authRoute)
  .use('/api/order', orderRoute)
  .use('/api/about', aboutRoute)
  .use('/api/contactus', contactUsRoute)
  .use('/api/commitment', commitmentRoute)
  .use('/api/partner', partnerRoute)
  .use('/api/message', contactMsgRoute)
  .use('/api/consultancy', consultancyRoute)
  .use('/api/quote', quoteRoute)
  .use('/api/warehouse', warehouseRoute)
  .use('/api/user', userRoute)
  .use('/api/prohibited-product', prohibitedProductRoute)
  .use('/api/applicant', applicantRoute)
  .use('/api/career', careerRoute)
  .use('/api/department', departmentRoute)
  .use('/api/participant', participantRoute)
  .use('/api/feature', featureRoute)
  .use('/api/notification', verifyToken, notificationRoute)
  .use('/api/receiver', receiverRoute)
  .use('/api/product', productRoute)
  .use('/api/price', priceRoute)
  .use('/api/pricelist', priceListRoute)
  .use('/api/service', serviceRoute)
  .use('/api/customer', customerRoute)
  .use('/api/discount', discountRoute)
  .use('/api/suggest', suggestRoute)
  .use('/api/address', addressRoute)
  .use('/api/turnover', turnoverRoute)
  // .use('/api/bill', billRoute)
  .use("/api/carriageContract", carriageContractRoute)
  .use('/api/blog', blogRoute)
  .use('/api/booking', bookingRoute)
  .use('/api/material', materialRoute)
  .use('/api/driver-profile', driverProfileRoute)
  .use('/api/vehicle-profile', vehicleProfileRoute)
  .use('/api/document', documentRoute)
  .use("/api/complaint", complaintRoute)
  .use('/api/expense-category', expenseCategoryRoute)
  .use('/api/recipt-category', reciptCategoryRoute)
  .use("/api/export", exportExcelRoute)
  .use("/api/individual-contract", individualContractRoute)
  .use('/api/address', addressRoute)
  .use("/api/orderIssue", orderIssueRoute)
  .use('/api/shippingcost', shippingCostRoute)
  .use('/api/bankAccount', bankAccountRouter)
  .use('/api/address', addressRoute)
  .use("/api/orderNotification", orderNotificationRoute)
  .use("/api/business-contract", businessContractRoute)
  .use("/api/orderIssue", orderIssueRoute)
  .use('/api/shippingcost', shippingCostRoute)
  .use('/api/bankAccount', bankAccountRouter)
  .use('/api/faq', faqRoute)
  .use('/api/compare-review', compareReviewRoute)
  .use('/api/policy', policyRoute)
  .use('/api/shipper', shipperRoute)
  .use('/api/strength', strengthRoute)
  .use('/api/post-office', postOfficeRoute)
  .use('/api/express', expressRoute)
  .use('/api/career-life', careerLifeRoute)
  .use('/api/life-style/', LifeStyleRoute)
  .use('/api/chat-info', chatInfoRoute)
  .use('/api/social-network', socialNetworkRoute)
app.use('/*', async (req, res) => {
  res.status(501).send("Don't implement.")
})
// app.use(express.static('public'));
// app.use('/public', express.static('public'));

// app.use(express.static(path.join(__dirname, process.env.BUILD_DIST)));

// app.get('/*', async (req, res) => {
//     try {
//         res.sendFile(path.join(__dirname, process.env.BUILD_DIST + 'index.html'))
//     } catch (error) {
//         console.log(error.message)
//         res.sendStatus(500)
//     }
// })
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.DEV == '1' ? process.env.DEV_URL : process.env.HOST,
    methods: ["GET", "POST"]
  }
});
const customers = {};

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);
  //   Khi một khách hàng kết nối, thêm họ vào đối tượng customers
  customers[socket.id] = 'Customer';

  // Gửi thông báo cho admin rằng một khách hàng mới đã kết nối
  io.emit('admin notification', `Admin: New customer (${socket.id}) connected.`);

  socket.on('customer send', (message) => {
    console.log("message:", message)
    const data = {
      customer: socket.id,
      message: message
    }
    // Gửi tin nhắn từ khách hàng đến admin
    io.emit('admin receive', data);
  });


  socket.on('admin send', (data) => {
    console.log("data:", data)
    const { customerSocketId, message } = data;
    const customer = customers[customerSocketId];

    if (customer) {
      io.to(customerSocketId).emit('customer receive', `Admin (${socket.id}): ${message}`);
    }
  });


  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);

    // Xóa khách hàng khỏi đối tượng customers khi họ ngắt kết nối
    delete customers[socket.id];

    // Gửi thông báo cho admin rằng một khách hàng đã ngắt kết nối
    io.emit('admin message', `Admin: Customer (${socket.id}) disconnected.`);
  });
});





server.listen(PORT, () => {
  console.log(`Server start at port: ${PORT}`)
})
// app.listen(() => {
//     sendMailToCafllet()
// })
// app.listen(() => {
//     sendMailToDriver()
// })
setInterval(() => {
  clearTokenList(TOKEN_BLACKLIST)
}, 3600000)
