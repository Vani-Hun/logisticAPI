import PostOfficeCode from '../model/PostOfficeCode.js';
import code from '../data/express/code_address.js';
import { POSTOFFICE } from '../constant.js';

/**
 * generate ID for an 
 * @returns {string} generated post office code
 */
export const genaratePostOfficeCode = async (province, district) => {
    try {
      province = formatString(province);
      district = formatString(district);

      var code  = generateProvinceDistrictCode(province, district);
      
      if (code == "") {
        return "";
      }

      var postOfficeCode = await PostOfficeCode.findOne({ 
        code: code.substr(0, 
          POSTOFFICE.LENGTH_OF_1ST_PART_IN_CODE + 
          POSTOFFICE.LENGTH_OF_2ND_PART_IN_CODE)});
      
      var index = 1;

      if (postOfficeCode == null || postOfficeCode == undefined) {
        await PostOfficeCode.create({
          code : code,
          index : 1,
        });
      }
      else {
        index = postOfficeCode.index + 1;
        postOfficeCode.index = index;
        await postOfficeCode.save();
      }
      

      code = code + padWithLeadingZeros(index, POSTOFFICE.LENGTH_OF_3RD_PART_IN_CODE);
      
      return code;

    } catch (error) {
      console.log(error);
      return null;
    }
  };

/**
 * check provice valid
 * @returns {boolean} generated post office code
 */
function generateProvinceDistrictCode(province, district)  {
  try {
    const provinceCode = code.get(province);
    const districtCode = code.get(district);

    if (provinceCode == undefined || districtCode == undefined) {
      return "";
    }
    
    return provinceCode + districtCode;

  } catch (error) {
    console.log(error);
    return "";
  }
};

function padWithLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, '0');
}

function formatString(str){
  var _str = str
  .toLowerCase()
  .replace(/ /g, '') // Remove all spaces in string
  .replace(/-/g, '')  // Remove all spaces in string
  .replace(/'/g, ''); // Remove all spaces in string

  _str = toNonAccentVietnamese(_str); // Remove Accents

  return _str;
}

// Compare two strings with rule
function isQualStringWithRule(str1, str2) {
  try {
    var _str1 = str1
    .toLowerCase()
    .replace(/ /g, ''); // Remove all spaces in string

    _str1 = toNonAccentVietnamese(_str1); // Remove Accents

    var _str2 = str2
      .toLowerCase()
      .replaceAll(/ /g, ''); // Remove all spaces in string

    _str2 = toNonAccentVietnamese(_str2); // Remove Accents

    if (_str1.includes(_str2) || _str2.includes(_str1)) {
      return true;
    }

    return false;
  } catch (error) {
    console.log(error);
  }
}

// This function keeps the casing unchanged for str, then perform the conversion
function toNonAccentVietnamese(str) {
  str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str;
}
