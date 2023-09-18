import Error from "../helper/error.js"

export const faqValidate = data => {
    const error = new Error()
    error.isRequired(data.question, 'question')
    error.isRequired(data.answer, 'answer')
    return error.get()
} 