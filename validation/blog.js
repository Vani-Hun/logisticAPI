import { BLOG_CATEGORY } from "../constant.js";
import Error from "../helper/error.js";

export const createBlogValidate = (data) => {
    const error = new Error()
    error.isRequired(data.title ,'title')
    error.isRequired(data.description, 'description')
    error.isRequired(data.date, 'date')
    error.isRequired(data.type, 'type')
    error.isInRangeName(data.type, BLOG_CATEGORY, 'type')
    return error.get()
}

export const updateBlogCreateParagraphValidate = (id) => {
    const error = new Error()
    error.isRequired(id,'id')
    error.checkMongoId(id, 'id');
    return error.get()
}

export const updateBlogDeleteParagraphValidate = (data) => {
    const error = new Error()
    error.isRequired(data.id,'id')
    error.checkMongoId(data.id, 'id');
    error.isRequired(data.paragraphId,'paragraphId')
    error.checkMongoId(data.paragraphId, 'paragraphId');
    return error.get()
}

export const updateBlogUpdateContentParagraphValidate = (data) => {
    const error = new Error()
    error.isRequired(data.id,'id')
    error.checkMongoId(data.id, 'id');
    error.isRequired(data.paragraphId,'paragraphId')
    error.checkMongoId(data.paragraphId, 'paragraphId');
    error.isRequired(data.content,'content')
    return error.get()
}

export const updateBlogUpdateImgsParagraphValidate = (data) => {
    const error = new Error()
    error.isRequired(data.id,'id')
    error.checkMongoId(data.id, 'id');
    error.isRequired(data.paragraphId,'paragraphId')
    error.checkMongoId(data.paragraphId, 'paragraphId');
    error.isRequired(data.files,'file')
    return error.get()
}

export const updateBlogReplaceOneImgParagraphValidate = (data) => {
    const error = new Error()
    error.isRequired(data.id,'id')
    error.checkMongoId(data.id, 'id');
    error.isRequired(data.paragraphId,'paragraphId')
    error.checkMongoId(data.paragraphId, 'paragraphId');
    error.isRequired(data.files,'file')
    error.isRequired(data.urlImg,'urlImg')
    return error.get()
}

export const updateBlogDeleteOneImgParagraphValidate = (data) => {
    const error = new Error()
    error.isRequired(data.id,'id')
    error.checkMongoId(data.id, 'id');
    error.isRequired(data.paragraphId,'paragraphId')
    error.checkMongoId(data.paragraphId, 'paragraphId');
    error.isRequired(data.urlImg,'urlImg')
    return error.get()
}