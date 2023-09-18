import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import Blog from "../../model/Blog.js"
import { createBlogDir } from "../../middleware/createDir.js"
import { uploadImg } from "../../middleware/storage.js"
import { 
    createBlogValidate,
    updateBlogCreateParagraphValidate,
    updateBlogDeleteParagraphValidate,
    updateBlogUpdateContentParagraphValidate,
    updateBlogUpdateImgsParagraphValidate,
    updateBlogReplaceOneImgParagraphValidate,
    updateBlogDeleteOneImgParagraphValidate, 
} from "../../validation/blog.js"
import { unlinkSync, unlink } from "fs"
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import fs from 'fs'
import mongoose from "mongoose"
import BlogBanner from "../../model/BlogBanner.js"
import { BLOG_BANNER } from "../../constant.js"

const blogAdminRoute = express.Router()

/**
 * @route POST api/admin/blog
 * @description create new blog
 * @access private
 */
blogAdminRoute.post("/banner", async (req, res) => {
    try {
        const blogBanner  = await BlogBanner.create({imgs : []});
        return sendSuccess(res, 'Admin create blog banner successfully', blogBanner);

    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});

/**
 * @route PATCH api/admin/banner/add-img
 * @description add-img
 * @access private
 */
blogAdminRoute.patch("/banner/add-img",
    createBlogDir,
    uploadImg.array('file', 5),
    async (req, res) => {
    try {
        const files = req.files;
     
        let blogBanner = await BlogBanner.findById(BLOG_BANNER.ID);

        let imgs = [];
        for (let i = 0; i < files.length; i++) {
            let file = await `${files[i].destination}${files[i].filename}`
            let name = await files[i].fieldname
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '') + Date.now();
            let result = await uploadSingle(file, "blog", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            imgs.push(result);
        }

        blogBanner.imgs = [
            ...blogBanner.imgs,
            ...imgs,
        ]; 
        await blogBanner.save();

        return sendSuccess(res, 'Admin add banner in blog successfully', blogBanner);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});

/**
 * @route PATCH api/admin/banner/replace-one-img
 * @description replace-one-img in banner
 * @access private
 */
blogAdminRoute.patch("/banner/replace-one-img",
    createBlogDir,
    uploadImg.single('file'),
    async (req, res) => {
    try {
        const files = req.file;
        const {urlImg} = req.body;

        let blogBanner = await BlogBanner.findById(BLOG_BANNER.ID);
   
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let result = await uploadSingle(file, "blog", name)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        
        // replace image in blog
        for (let i = 0 ; i < blogBanner.imgs.length ;i++){
            const value = blogBanner.imgs[i];

            if (value == urlImg){
                                   
                blogBanner.imgs[i] = result;
                let _path = urlImg.split('/');
                let _name = _path[_path.length - 1].split('.')[0];
                let _file = _path[_path.length - 2] + '/' + _name;
           
                await Promise.all([
                    deleteSingle(_file),
                    blogBanner.save(),
                ]);

                break;
            }
        }

        return sendSuccess(res, 'Admin replace-one-img banner in blog successfully', blogBanner);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});


/**
 * @route PATCH api/admin/banner/delete-one-img
 * @description delete-one-img-paragraph
 * @access private
 */
blogAdminRoute.patch("/banner/delete-one-img",
    async (req, res) => {
    try {
        const {url_img} = req.body;
        
        let blogBanner = await BlogBanner.findById(BLOG_BANNER.ID);

        // delete image in blog
        for (let i = 0 ; i < blogBanner.imgs.length ;i++){
            const value = blogBanner.imgs[i];

            if (value == url_img){
                        
                blogBanner.imgs = blogBanner.imgs.filter(item => item != url_img);
    
                let _path = url_img.split('/');
                let _name = _path[_path.length - 1].split('.')[0];
                let _file = _path[_path.length - 2] + '/' + _name;
           
                await Promise.all([
                    deleteSingle(_file),
                    blogBanner.save(),
                ]);
                break;
            }
        }

        return sendSuccess(res, 'Admin delete-one-img in blog banner successfully', blogBanner);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});


/**
 * @route POST api/admin/blog
 * @description create new blog
 * @access private
 */
blogAdminRoute.post("/", async (req, res) => {
    try {
       
        const error = createBlogValidate(req.body)
        if (error) return sendError(res,error);

        const { title, description, date, type } = req.body

        const blog  = await Blog.create({
            title : title,
            description : description,
            date : new Date(date),
            type : type,
        })
        return sendSuccess(res, 'Admin create blog successfully', blog);

    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});

/**
 * @route PATCH api/admin/blog/:id
 * @description admin update common content of blog
 * @access private
 */
blogAdminRoute.patch("/:id", async (req, res) => {
    try {
        const  {id} = req.params;
        const error = createBlogValidate(req.body)
        if (error) return sendError(res,error);

        const { title, description, date, type } = req.body

        const blog  = await Blog.findByIdAndUpdate(id,{
            title : title,
            description : description,
            date : new Date(date),
            type : type,
        },
        {new: true});
        return sendSuccess(res, 'Admin update blog successfully', blog);

    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});

/**
 * @route PATCH api/admin/blog
 * @description create a paragraph
 * @access private
 */
blogAdminRoute.patch("/:id/create-a-paragraph",
    async (req, res) => {
    try {
        const {id} = req.params;

        const error = updateBlogCreateParagraphValidate(id)
        if (error) return sendError(res,error);
        
        const blog = await Blog.findByIdAndUpdate(id, {
            $push: {
                paragraphs : {
                }
            }
        },
        {new: true})

        if (blog == null || blog == undefined) return sendError(res,`blog - ${id} is not exist`);

        return sendSuccess(res, 'Admin create-a-paragraph in blog successfully', blog);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});


/**
 * @route PATCH api/admin/blog
 * @description delete a paragraph
 * @access private
 */
blogAdminRoute.patch("/:id/delete-a-paragraph/:paragraphId",
    async (req, res) => {
    try {
        const {id, paragraphId} = req.params;
        
        const error = updateBlogDeleteParagraphValidate({id, paragraphId})
        if (error) return sendError(res,error);
        
        let blog = await Blog.findById(id);

        // remove image in cloundinary
        for (let i = 0 ; i < blog.paragraphs.length ;i++){

            const value = blog.paragraphs[i];

            if (value._id == paragraphId) {
                for (let j = 0 ; j < value.imgs.length ; j++){
                    const urlImg = value.imgs[j];
                    let _path = urlImg.split('/');
                    let _name = _path[_path.length - 1].split('.')[0];
                    let _file = _path[_path.length - 2] + '/' + _name;
                    await  deleteSingle(_file);
                }
                break;
            }
        }

        blog.paragraphs = blog.paragraphs.filter(item => item.id != paragraphId);

        await blog.save();

        return sendSuccess(res, 'Admin delete-a-paragraph in blog successfully', blog);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});

/**
 * @route PATCH api/admin/blog
 * @description update-content-paragraph
 * @access private
 */
blogAdminRoute.patch("/:id/update-content-paragraph/:paragraphId",
    async (req, res) => {
    try {
        const {id, paragraphId} = req.params;
        const {content} = req.body;
        const error = updateBlogUpdateContentParagraphValidate({id, paragraphId, content})
        if (error) return sendError(res,error);
        
        let blog = await Blog.findOneAndUpdate({
            _id : id,
            "paragraphs._id" : paragraphId
        }, {
            $set : {
                "paragraphs.$.content" : content
            }
        }, {new : true});

        return sendSuccess(res, 'Admin update-content-paragraph in blog successfully', blog);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});

/**
 * @route PATCH api/admin/blog
 * @description update-imgs-paragraph
 * @access private
 */
blogAdminRoute.patch("/:id/update-imgs-paragraph/:paragraphId",
    createBlogDir,
    uploadImg.array('file', 5),
    async (req, res) => {
    try {
        const {id, paragraphId} = req.params;
        const files = req.files;

        const error = updateBlogUpdateImgsParagraphValidate({id, paragraphId, files})
        if (error) return sendError(res,error);
        
        let blog = await Blog.findById(id);

        let imgs = [];
        for (let i = 0; i < files.length; i++) {
            let file = await `${files[i].destination}${files[i].filename}`
            let name = await files[i].fieldname + blog.title.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '') + Date.now();
            let result = await uploadSingle(file, "blog", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            imgs.push(result);
        }


        for (let i = 0 ; i < blog.paragraphs.length ;i++){
            const value = blog.paragraphs[i];

            if (value._id == paragraphId) {
                blog.paragraphs[i].imgs = [
                    ...blog.paragraphs[i].imgs,
                    ...imgs,
                ]; 
                await blog.save();
                break;
            }
        }

        return sendSuccess(res, 'Admin update-content-paragraph in blog successfully', blog);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});

/**
 * @route PATCH api/admin/blog
 * @description replace-one-img-paragraph
 * @access private
 */
blogAdminRoute.patch("/:id/replace-one-img-paragraph/:paragraphId",
    createBlogDir,
    uploadImg.single('file'),
    async (req, res) => {
    try {
        const {id, paragraphId} = req.params;
        const files = req.file;
        const {urlImg} = req.body;
        const error = updateBlogReplaceOneImgParagraphValidate({id, paragraphId,urlImg, files})
        if (error) return sendError(res,error);
        
        let blog = await Blog.findById(id);
   
        if (error) return sendError(res, error)
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname + blog.title.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let result = await uploadSingle(file, "blog", name)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        
        // replace image in blog
        for (let i = 0 ; i < blog.paragraphs.length ;i++){
            const value = blog.paragraphs[i];
            let isDone = false;

            if (value._id == paragraphId) {
                for (let j = 0 ; j < value.imgs.length ; j++){
                    if (value.imgs[j] == urlImg){
                                   
                        blog.paragraphs[i].imgs[j] = result;
                        let _path = urlImg.split('/');
                        let _name = _path[_path.length - 1].split('.')[0];
                        let _file = _path[_path.length - 2] + '/' + _name;
                   
                        await Promise.all([
                            deleteSingle(_file),
                            blog.save(),
                        ]);

                        isDone = true;
                        break;
                    }
                }
            }

            if (isDone == true){
                break;
            }
        }

        return sendSuccess(res, 'Admin replace-one-img-paragraph in blog successfully', blog);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});


/**
 * @route PATCH api/admin/blog
 * @description delete-one-img-paragraph
 * @access private
 */
blogAdminRoute.patch("/:id/delete-one-img-paragraph/:paragraphId",
    async (req, res) => {
    try {
        
        const {id, paragraphId} = req.params;
        const {urlImg} = req.body;
        const error = updateBlogDeleteOneImgParagraphValidate({id, paragraphId,urlImg})
        if (error) return sendError(res,error);
        
        let blog = await Blog.findById(id);

        // delete image in blog
        for (let i = 0 ; i < blog.paragraphs.length ;i++){
            const value = blog.paragraphs[i];
            let isDone = false;

            if (value._id == paragraphId) {
                for (let j = 0 ; j < value.imgs.length ; j++){
                    if (value.imgs[j] == urlImg){
                        
                        blog.paragraphs[i].imgs = blog.paragraphs[i].imgs.filter(item => item != urlImg);
            
                        let _path = urlImg.split('/');
                        let _name = _path[_path.length - 1].split('.')[0];
                        let _file = _path[_path.length - 2] + '/' + _name;
                   
                        await Promise.all([
                            deleteSingle(_file),
                            blog.save(),
                        ]);

                        isDone = true;
                        break;
                    }
                }
            }

            if (isDone == true){
                break;
            }
        }

        return sendSuccess(res, 'Admin delete-one-img-paragraph in blog successfully', blog);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});

/**
 * @route PATCH api/admin/blog
 * @description Admin update picture in blog
 * @access private
 */
blogAdminRoute.patch("/:id/update-picture",
    createBlogDir,
    uploadImg.single('file'),
    async (req, res) => {
    try {
        const {id} = req.params;
        
        let blog = await Blog.findById(id);
   
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname + blog.title.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
        let result = await uploadSingle(file, "blog", name)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        
        const old_picture = blog.picture;
        if (old_picture != null && old_picture != undefined) {
            let _path = old_picture.split('/');
            let _name = _path[_path.length - 1].split('.')[0];
            let _file = _path[_path.length - 2] + '/' + _name;
            deleteSingle(_file);
        }
        blog.picture = result;
        await blog.save();
       
        return sendSuccess(res, 'Admin update picture in blog successfully', blog);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
});



/**
 * @route DELETE api/admin/blog/:id
 * @description delete a blog by id
 * @access private
 */
blogAdminRoute.delete("/:id", async (req, res) => {
    try {
        const {id} = req.params;    
        let blog = await Blog.findById(id);
        
        const old_picture = blog.picture;
        if (old_picture != null && old_picture != undefined) {
            let _path = old_picture.split('/');
            let _name = _path[_path.length - 1].split('.')[0];
            let _file = _path[_path.length - 2] + '/' + _name;
            deleteSingle(_file);
        }

        // remove image in cloundinary
        for (let i = 0 ; i < blog.paragraphs.length ;i++){

            const value = blog.paragraphs[i];

            for (let j = 0 ; j < value.imgs.length ; j++){
                const urlImg = value.imgs[j];
                let _path = urlImg.split('/');
                let _name = _path[_path.length - 1].split('.')[0];
                let _file = _path[_path.length - 2] + '/' + _name;
                await  deleteSingle(_file);
            }
            break;
        }
        
        await Blog.findByIdAndRemove(id);

        return sendSuccess(res, 'Admin delete in blog successfully', blog);
    } catch (error) {
        console.log(error);
        sendServerError(res);
    }
})

export default blogAdminRoute