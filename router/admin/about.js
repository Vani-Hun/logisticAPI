import express from 'express'
import { unlinkSync } from 'fs'
import fs from 'fs'
import { uploadResourcesAboutUsBanner, uploadImg } from "../../middleware/storage.js"
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { createAboutUsDir } from '../../middleware/createDir.js'
import About from '../../model/About.js'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import Strength from '../../model/Strength.js'

const aboutAdminRoute = express.Router()

/**
 * @route POST /api/admin/about/banners
 * @description create/update aboutus banners
 * @access private
 */
aboutAdminRoute.post('/banners',
    createAboutUsDir,
    uploadResourcesAboutUsBanner.array('banners'),
    async (req, res) => {
        try {
            const images = []
            const isExist = await About.findOne({})
            if (isExist) {
                await isExist.banners.map(async (banners) => {
                    let splitUrl = await banners.split('/')
                    let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
                    await deleteSingle(file)
                })
            }
            await req.files.forEach(async (file) => {
                let fileImage = await `${file.destination}${file.filename}`
                let nameImage = await file.filename
                let resultImage = await uploadSingle(fileImage, "aboutUs", nameImage)
                if (resultImage) {
                    fs.unlinkSync(fileImage, (err) => {
                        console.log(err)
                    })
                    images.push(resultImage)
                }
                if (images.length === req.files.length) {
                    await About.findOneAndUpdate({}, { banners: images }, { upsert: true, new: true })
                    return sendSuccess(res, 'upload banners successfully.')
                }
            })
        } catch (error) {
            console.log(error)
            if (req.files)
                req.files.map(file => unlinkSync(file.path))
            return sendServerError(res)
        }
    }
)

/**
 * @route POST /api/admin/about/element/banners
 * @description create/update element aboutUs banners
 * @access private
 */
aboutAdminRoute.post('/element/banners',
    createAboutUsDir,
    uploadResourcesAboutUsBanner.single('banners'),
    async (req, res) => {
        try {
            const element = await req.body.element;
            const isExist = await About.findOne({})
            if (isExist) {
                let splitUrl = await isExist.banners[element].split('/')
                let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
                await deleteSingle(file)
            }
            let fileImage = await `${req.file.destination}${req.file.filename}`
            let nameImage = await req.file.filename
            let resultImage = await uploadSingle(fileImage, "aboutUs", nameImage)
            if (resultImage) {
                fs.unlinkSync(fileImage, (err) => {
                    console.log(err)
                })
            }
            isExist.banners[element] = resultImage;
            let images = isExist.banners;
            await About.findOneAndUpdate({}, { banners: images }, { upsert: true, new: true })
            return sendSuccess(res, 'upload banners successfully.');
        } catch (error) {
            console.log(error)
            if (req.files)
                req.files.map(file => unlinkSync(file.path))
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about/topBanner
* @description create/update aboutus topBanner
* @access private
*/
aboutAdminRoute.post('/topBanner',
    createAboutUsDir,
    uploadImg.single('topBanner'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "aboutUs", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await About.findOneAndUpdate({}, { topBanner: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload top banner successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about/appBanner
* @description create/update aboutus topBanner
* @access private
*/
aboutAdminRoute.post('/appBanner',
    createAboutUsDir,
    uploadImg.single('appBanner'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "aboutUs", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await About.findOneAndUpdate({}, { appBanner: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload app banner successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about/midBanner
* @description create/update aboutus midBanner
* @access private
*/
aboutAdminRoute.post('/midBanner',
    createAboutUsDir,
    uploadImg.single('midBanner'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "aboutUs", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await About.findOneAndUpdate({}, { midBanner: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload mid banner successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about/bottomBanner
* @description create/update aboutus bottomBanner
* @access private
*/
aboutAdminRoute.post('/bottomBanner',
    createAboutUsDir,
    uploadImg.single('bottomBanner'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "aboutUs", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await About.findOneAndUpdate({}, { bottomBanner: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload bottom banner successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about/licenseimg
* @description create/update aboutus licenseimg
* @access private
*/
aboutAdminRoute.post('/licenseimg',
    createAboutUsDir,
    uploadImg.single('license_img'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "aboutUs", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await About.findOneAndUpdate({}, { license_img: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload bottom banner successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about/searchBanner
* @description create/update aboutus searchBanner
* @access private
*/
aboutAdminRoute.post('/searchBanner',
    createAboutUsDir,
    uploadImg.single('searchBanner'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "aboutUs", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await About.findOneAndUpdate({}, { searchBanner: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload bottom banner successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about/logo
* @description create/update aboutus logo
* @access private
*/
aboutAdminRoute.post('/logo',
    createAboutUsDir,
    uploadImg.single('logo'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "aboutUs", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await About.findOneAndUpdate({}, { logo: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload logo successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about
* @description create/update aboutus info
* @access private
*/
aboutAdminRoute.post('/',
    async (req, res) => {
        const { name, description, vision, values, history, networkCoverage, video, businessLicense, licenseOrgan, licenseDetail } = req.body
        try {
            await About.findOneAndUpdate({}, { name, description, vision, values, history, networkCoverage, video, businessLicense, licenseOrgan, licenseDetail }, { upsert: true, new: true })
            return sendSuccess(res, 'set about-us information successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/about/strength
* @description create/update strength aboutus info
* @access private
*/
aboutAdminRoute.post('/strength',
    async (req, res) => {
        try {
            const { name } = req.body
            console.log("name:", name)
            const strength = await Strength.findOne({ name: name }).lean()
            if (!strength) { return sendError(res, "Not found") }
            await About.findOneAndUpdate({}, { $push: { strengths: strength._id } }, { upsert: true, new: true })
            return sendSuccess(res, 'set about-us information strength successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

export default aboutAdminRoute