import Error from "../helper/error.js";
import { POSITION,INDUSTRY,PROVINCES } from "../constant.js" 
export const careerValidate = (data) => {
  const error = new Error()

  error
    .isRequired(data.title, "title")
    .isRequired(data.applicationPosition, "applicationPosition")
    .isRequired(data.deadline, "deadline")
    .isRequired(data.salary, "salary")
    .isRequired(data.workingHours, "workingHours")
    .isRequired(data.addressDescription, "addressDescription")
    .isRequired(data.address, "address")
    .isInRangeName(data.address, PROVINCES, "address")
    .isRequired(data.benefits, "benefits")
    .isRequired(data.jobDescription, "jobDescription")
    .isRequired(data.jobRequirements, "jobRequirements")
    .isRequired(data.perks, "perks")
    .isRequired(data.position, "position")
    .isInRangeName(data.position, POSITION, "position")
    .isRequired(data.industry, "industry")
    .isInRangeName(data.industry, INDUSTRY, "industry")
  if (error.get()) return error.errors;
  if (data.isHot === undefined) return error.isRequired(data.isHost, "isHot");
  if (data.isNew === undefined) return error.isRequired(data.isNew, "isNew");
  return null;
};
