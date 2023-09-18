import express from 'express'
import { unlinkSync } from 'fs'
import fs from 'fs'
import { uploadImg } from "../../middleware/storage.js"
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import Strength from '../../model/Strength.js'
import { createCareerLifeDir } from '../../middleware/createDir.js'
import CareerLife from '../../model/CareerLife.js'

const careerLifeAdminRoute = express.Router()

/**
* @route POST /api/admin/career-life/topPicture
* @description create/update career-life topPicture
* @access private
*/
careerLifeAdminRoute.post('/topPicture',
    createCareerLifeDir,
    uploadImg.single('topPicture'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "CareerLife", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await CareerLife.findOneAndUpdate({}, { topPicture: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload top picture successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/career-life/rightPicture
* @description create/update career-life rightPicture
* @access private
*/
careerLifeAdminRoute.post('/rightPicture',
    createCareerLifeDir,
    uploadImg.single('rightPicture'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "CareerLife", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await CareerLife.findOneAndUpdate({}, { rightPicture: result }, { upsert: true, new: true })
                return sendSuccess(res, 'upload right picture successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/career-life/detailLife
* @description create/update career-life info detailLife
* @access private
*/
careerLifeAdminRoute.post('/detailLife', async (req, res) => {
    const { nameLife, contentLife, descriptionLife } = req.body
    try {
        await CareerLife.findOneAndUpdate({}, { nameLife, contentLife, descriptionLife }, { upsert: true, new: true })
        return sendSuccess(res, 'Set career-life information successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route POST /api/admin/career-life/detailTeammatePortrait
* @description create/update career-life info detailTeammatePortrait
* @access private
*/
careerLifeAdminRoute.post('/detailTeammatePortrait', createCareerLifeDir, uploadImg.single('logoTeammatePortrait'), async (req, res) => {
    let file = await `${req.file.destination}${req.file.filename}`
    let name = await req.file.fieldname
    let result = await uploadSingle(file, "CareerLife", name)
    if (result) {
        fs.unlinkSync(file, (err) => {
            console.log(err)
        })
    }
    const { nameTeammatePortrait, teammatePortrait } = req.body
    const splitTeammatePortrait = teammatePortrait.split(',');
    try {
        await CareerLife.findOneAndUpdate({}, { nameTeammatePortrait, teammatePortrait: splitTeammatePortrait, logoTeammatePortrait: result }, { upsert: true, new: true })
        return sendSuccess(res, 'Set career-life information successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route POST /api/admin/career-life/address
* @description create/update career-life info address
* @access private
*/
careerLifeAdminRoute.post('/address', createCareerLifeDir, uploadImg.single('logoAddress'), async (req, res) => {
    let file = await `${req.file.destination}${req.file.filename}`
    let nameLogo = await req.file.fieldname
    let result = await uploadSingle(file, "CareerLife", nameLogo)
    if (result) {
        fs.unlinkSync(file, (err) => {
            console.log(err)
        })
    }
    const { name, detail } = req.body
    const address = {
        logo: result,
        name: name,
        detail: detail
    }
    try {
        await CareerLife.findOneAndUpdate({}, { address }, { upsert: true, new: true })
        return sendSuccess(res, 'Set career-life information successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})


/**
* @route POST /api/admin/career-life/info
* @description create/update career-life info
* @access private
*/
careerLifeAdminRoute.post('/info', createCareerLifeDir, uploadImg.single('logoInfo'), async (req, res) => {
    try {
        const { name, content } = req.body
        let file = await `${req.file.destination}${req.file.filename}`
        let nameLogo = await req.file.fieldname + name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let result = await uploadSingle(file, "CareerLife", nameLogo)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        const info = {
            logo: result,
            name: name,
            content: content
        }
        await CareerLife.findOneAndUpdate({}, { $push: { info: info } }, { upsert: true, new: true })
        return sendSuccess(res, 'Set career-life information successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/admin/career-life/element/info
 * @description create/update element career-life info
 * @access private
 */
careerLifeAdminRoute.post('/element/info', createCareerLifeDir, uploadImg.single('logoInfo'), async (req, res) => {
    try {
        const element = await req.body.element;
        const isExist = await CareerLife.findOne({})
        if (isExist) {
            let splitUrl = await isExist.info[element].logo.split('/')
            let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
            await deleteSingle(file)
        }
        const { name, content } = req.body
        let fileImage = await `${req.file.destination}${req.file.filename}`
        let nameImage = await req.file.filename + name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let resultImage = await uploadSingle(fileImage, "CareerLife", nameImage)
        if (resultImage) {
            fs.unlinkSync(fileImage, (err) => {
                console.log(err)
            })
        }
        const info = {
            logo: resultImage,
            name: name,
            content: content
        }
        isExist.info[element] = info;
        let information = isExist.info;
        await CareerLife.findOneAndUpdate({}, { info: information }, { upsert: true, new: true })
        return sendSuccess(res, 'upload career-life successfully.');
    } catch (error) {
        console.log(error)
        if (req.files)
            req.files.map(file => unlinkSync(file.path))
        return sendServerError(res)
    }
})

/**
 * @route POST /api/admin/career-life/element/info
 * @description create/update element career-life info
 * @access private
 */
careerLifeAdminRoute.post('/element/info', createCareerLifeDir, uploadImg.single('logoInfo'), async (req, res) => {
    try {
        const element = await req.body.element;
        const isExist = await CareerLife.findOne({})
        if (isExist) {
            let splitUrl = await isExist.info[element].logo.split('/')
            let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
            await deleteSingle(file)
        }
        const { name, content } = req.body
        let fileImage = await `${req.file.destination}${req.file.filename}`
        let nameImage = await req.file.filename + name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let resultImage = await uploadSingle(fileImage, "CareerLife", nameImage)
        if (resultImage) {
            fs.unlinkSync(fileImage, (err) => {
                console.log(err)
            })
        }
        const info = {
            logo: resultImage,
            name: name,
            content: content
        }
        isExist.info[element] = info;
        let information = isExist.info;
        await CareerLife.findOneAndUpdate({}, { info: information }, { upsert: true, new: true })
        return sendSuccess(res, 'upload career-life successfully.');
    } catch (error) {
        console.log(error)
        if (req.files)
            req.files.map(file => unlinkSync(file.path))
        return sendServerError(res)
    }
})

/**
 * @route DELETE /api/admin/career-life/element/info
 * @description delete element career-life info
 * @access private
 */
careerLifeAdminRoute.delete('/element/info', async (req, res) => {
    try {
        const element = await req.body.element;
        const isExist = await CareerLife.findOne({})
        if (isExist) {
            let splitUrl = await isExist.info[element].logo.split('/')
            let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
            await deleteSingle(file)
        }
        isExist.info.splice(element,1);
        let information = isExist.info;
        await CareerLife.findOneAndUpdate({}, { info: information }, { upsert: true, new: true })
        return sendSuccess(res, 'Delete element career-life information successfully.');
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route POST /api/admin/career-life/bottom
* @description create/update career-life info
* @access private
*/
careerLifeAdminRoute.post('/bottom', createCareerLifeDir, uploadImg.fields([{ name: 'background', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, content, position } = req.body
        let fileLogo = await `${req.files['logo'][0].destination}${req.files['logo'][0].filename}`
        let nameLogo = await req.files['logo'][0].fieldname + name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let resultLogo = await uploadSingle(fileLogo, "CareerLife", nameLogo)
        if (resultLogo) {
            fs.unlinkSync(fileLogo, (err) => {
                console.log(err)
            })
        }
        let fileBackGround = await `${req.files['background'][0].destination}${req.files['background'][0].filename}`
        let nameBackGround = await req.files['background'][0].fieldname + name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let resultBackGround = await uploadSingle(fileBackGround, "CareerLife", nameBackGround)
        if (resultBackGround) {
            fs.unlinkSync(fileBackGround, (err) => {
                console.log(err)
            })
        }
        const info = {
            name: name,
            content: content,
            position: position,
            logo: resultLogo,
            background: resultBackGround
        }
        await CareerLife.findOneAndUpdate({}, { $push: { bottomPicture: info } }, { upsert: true, new: true })
        return sendSuccess(res, 'Set career-life information successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/admin/career-life/element/bottom
 * @description create/update element career-life bottom info
 * @access private
 */
careerLifeAdminRoute.post('/element/bottom', createCareerLifeDir, uploadImg.fields([{ name: 'background', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), async (req, res) => {
    try {
        const element = await +req.body.element;
        const isExist = await CareerLife.findOne({})
        if (isExist) {
            let splitUrlLogo = await isExist.bottomPicture[element].logo.split('/')
            let fileLogo = await `${splitUrlLogo[splitUrlLogo.length - 2]}/${splitUrlLogo[splitUrlLogo.length - 1].split('.')[0]}`
            await deleteSingle(fileLogo)
            let splitUrlBackGround = await isExist.bottomPicture[element].background.split('/')
            let fileBackGround = await `${splitUrlBackGround[splitUrlBackGround.length - 2]}/${splitUrlBackGround[splitUrlBackGround.length - 1].split('.')[0]}`
            await deleteSingle(fileBackGround)
        }
        const { name, content, position } = req.body
        let fileLogo = await `${req.files['logo'][0].destination}${req.files['logo'][0].filename}`
        let nameLogo = await req.files['logo'][0].fieldname + name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let resultLogo = await uploadSingle(fileLogo, "CareerLife", nameLogo)
        if (resultLogo) {
            fs.unlinkSync(fileLogo, (err) => {
                console.log(err)
            })
        }
        let fileBackGround = await `${req.files['background'][0].destination}${req.files['background'][0].filename}`
        let nameBackGround = await req.files['background'][0].fieldname + name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let resultBackGround = await uploadSingle(fileBackGround, "CareerLife", nameBackGround)
        if (resultBackGround) {
            fs.unlinkSync(fileBackGround, (err) => {
                console.log(err)
            })
        }
        const info = {
            name: name,
            content: content,
            position: position,
            logo: resultLogo,
            background: resultBackGround
        }
        isExist.bottomPicture[element] = info;
        let information = isExist.bottomPicture;
        await CareerLife.findOneAndUpdate({}, { bottomPicture: information }, { upsert: true, new: true })
        return sendSuccess(res, 'upload career-life successfully.');
    } catch (error) {
        console.log(error)
        if (req.files)
            req.files.map(file => unlinkSync(file.path))
        return sendServerError(res)
    }
})

/**
 * @route DELETE /api/admin/career-life/element/bottom
 * @description delete element career-life bottom info
 * @access private
 */
careerLifeAdminRoute.delete('/element/bottom', async (req, res) => {
    try {
        const element = await +req.body.element;
        const isExist = await CareerLife.findOne({})
        if (isExist) {
            let splitUrlLogo = await isExist.bottomPicture[element].logo.split('/')
            let fileLogo = await `${splitUrlLogo[splitUrlLogo.length - 2]}/${splitUrlLogo[splitUrlLogo.length - 1].split('.')[0]}`
            await deleteSingle(fileLogo)
            let splitUrlBackGround = await isExist.bottomPicture[element].background.split('/')
            let fileBackGround = await `${splitUrlBackGround[splitUrlBackGround.length - 2]}/${splitUrlBackGround[splitUrlBackGround.length - 1].split('.')[0]}`
            await deleteSingle(fileBackGround)
        }
        isExist.bottomPicture.splice(element,1);
        let information = isExist.bottomPicture;
        await CareerLife.findOneAndUpdate({}, { bottomPicture: information }, { upsert: true, new: true })
        return sendSuccess(res, 'Delete element career-life successfully.');
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default careerLifeAdminRoute