import express from "express"
import { sendServerError, sendSuccess, sendError } from "../helper/client.js"
import Blog from "../model/Blog.js";
import mongoose from "mongoose";
import { BLOG_BANNER, IMAGE_DEFAULT } from "../constant.js";
import BlogBanner from "../model/BlogBanner.js";

const blogRoute = express.Router()

/**
 * @route GET api/blog/banner
 * @description get blog banner
 * @access public
 */
blogRoute.get("/banner", async(req, res) => {
    try {
        let blogBanner = await BlogBanner.findById(BLOG_BANNER.ID).lean();
        return sendSuccess(res, 'Get a blog banner successfully.', blogBanner)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})


/**
 * @route GET api/blog
 * @description  get all blog
 * @access public
 */
blogRoute.get("/", async(req, res) => {
    try {
        const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 0
        const page = req.query.page ? Number(req.query.page) : 0
        const type = req.query.type;
        const keyword= req.query.keyword;

        let query = {}
        let keywordList = keyword 
            ? {
                $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                ]
            } : {}

        if (type) {
            query.type = type
        }
    
        let skipNum = (page - 1) * pageSize;
        if (skipNum < 0) {
            skipNum = 0;
        }

        let blogs = await Blog.find({ $and: [query, keywordList]})
            .limit(pageSize)
            .skip(skipNum)
            .sort({createdAt : -1})
            .lean();

        for (let i = 0; i < blogs.length; i++) {
            if (blogs[i].picture == null || blogs[i].picture == undefined){
                blogs[i].picture = IMAGE_DEFAULT.BLOG;
            }
        }
        return sendSuccess(res, 'Get blog successfully.', blogs, blogs.length)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route GET api/blog/:id
 * @description get blog by id
 * @access public
 */
blogRoute.get("/:id", async(req, res) => {
    try {
        const { id } = req.params
        if(mongoose.isValidObjectId(id) == false){
            return sendError(res, `blog - ${id} does not valid objectId.`)
        }
        let blog = await Blog.findById(id).lean();

        if (blog != null && blog != undefined){
            const paragraphs = blog.paragraphs;
            
            if (blog.picture == null || blog.picture == undefined){
                blog.picture = IMAGE_DEFAULT.BLOG;
            }
        }
       

        if(blog == null || blog == undefined) return sendError(res, 'ID blog does not existed.')
        return sendSuccess(res, 'Get a blog successfully.', blog)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})



export default blogRoute