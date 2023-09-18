import Error from "../helper/error.js";
export const lifeStyleValidate = (data) => {
    const error = new Error()

    error
        .isRequired(data.descriptionAboutUs, "descriptionAboutUs")
        .isRequired(data.containerImages, "containerImages")
        .isRequired(data.imageAboutUs, "imageAboutUs")

    if (error.get()) return error.errors;
};
