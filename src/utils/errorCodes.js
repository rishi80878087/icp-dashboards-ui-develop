export const ERROR_MESSAGES_EN = {
  NOT_FOUND_001: "No record found for the provided airport code: {placeholder}.",
  NOT_FOUND_002: "Officer efficiency configuration not found.",
  
  BAD_REQUEST_001: "Invalid airport code provided: {placeholder}.",
  BAD_REQUEST_002: "Invalid traffic direction provided: {placeholder}.",
  BAD_REQUEST_003: "Invalid date format. Use YYYY-MM-DD (provided: {placeholder}).",
  BAD_REQUEST_004: "Both first_name and last_name, or full_name fields are required.",
  BAD_REQUEST_005: "Unable to delete the record because it is referenced in another table.",
  BAD_REQUEST_006: "Both first_name and last_name, or full_name fields cannot be null or empty.",
  BAD_REQUEST_007: "The number of shifts must be exactly 3 (provided: {placeholder}).",
  BAD_REQUEST_008: "Undetermined input lanugae: {placeholder}",

  UNPROCESSABLE_ENTITY_001: "The shift starting time configuration for the airport code '{placeholder}' is invalid and could not be processed.",
  UNPROCESSABLE_ENTITY_002: "The number of shifts for the airport code '{placeholder}' is invalid and could not be processed.",

  INTERNAL_SERVER_ERROR_001: "An unexpected error occurred. Please try again later or contact the administrator.",
  INTERNAL_SERVER_ERROR_002: "Unable to delete a record from the table for an unknown reason (airport code: {placeholder}).",
  
  CONFLICT_001: "Airport code '{placeholder}' already exists.",
  
  FORBIDDEN_001: "Permission denied.",
  
  UNAUTHORIZED_001: "Invalid authentication scheme.",
  UNAUTHORIZED_002: "Invalid authorization code.",
  UNAUTHORIZED_003: "Invalid token.",
  UNAUTHORIZED_004: "Token has expired.",
  UNAUTHORIZED_005: "Invalid user.",

  NOT_AUTHENTICATED_001: "Not authenticated.",

  INVALID_INTEGER_001: "Input should be a valid integer, unable to parse input '{placeholder}' as an integer.",
  INVALID_FLOAT_001: "Input should be a valid float, unable to parse input '{placeholder}' as a float.",
  INVALID_TIME_001: "Input should be a valid time, unable to parse input '{placeholder}' as a time.",
  INVALID_DATE_001: "Input should be a valid date, unable to parse input '{placeholder}' as a date.",
  INVALID_DATETIME_001: "Input should be a valid datetime, unable to parse input '{placeholder}' as a datetime.",
  INVALID_INPUT_001: "Invalid input",
  INVALID_INPUT_002: "Input should be less than or equal to {placeholder}.",
  INVALID_INPUT_003: "Input should be greater than or equal to {placeholder}.",

  DASHBOARDS_BAD_REQUEST_001: "Invalid input provided: {placeholder}.",
  DASHBOARDS_BAD_REQUEST_002: "Invalid gender provided: {placeholder}.",
  DASHBOARDS_BAD_REQUEST_003: "Invalid emirate code provided: {placeholder}.",
}

export const ERROR_MESSAGES_AR = {
  NOT_FOUND_001: "لا توجد سجلات للرمز المطار المقدم: {placeholder}.",
  NOT_FOUND_002: "تكوين كفاءة الضابط غير موجود.",
  
  BAD_REQUEST_001: "تم تقديم رمز مطار غير صالح: {placeholder}.",
  BAD_REQUEST_002: "تم تقديم اتجاه حركة غير صالح: {placeholder}.",
  BAD_REQUEST_003: "تنسيق التاريخ غير صالح. استخدم YYYY-MM-DD (المقدم: {placeholder}).",
  BAD_REQUEST_004: "يجب توفير كل من حقلي الاسم الأول والاسم الأخير، أو حقل الاسم الكامل.",
  BAD_REQUEST_005: "غير قادر على حذف السجل لأنه مرتبط بجدول آخر.",
  BAD_REQUEST_006: "لا يمكن أن تكون حقول الاسم الأول والاسم الأخير، أو حقل الاسم الكامل فارغة أو null.",
  BAD_REQUEST_007: "يجب أن يكون عدد الورديات بالضبط 3 (المقدم: {placeholder}).",
  BAD_REQUEST_008: "لغة الإدخال غير محددة: {placeholder}",

  UNPROCESSABLE_ENTITY_001: "تكوين وقت بدء الوردية لرمز المطار '{placeholder}' غير صالح ولا يمكن معالجته.",
  UNPROCESSABLE_ENTITY_002: "عدد الورديات لرمز المطار '{placeholder}' غير صالح ولا يمكن معالجته.",

  INTERNAL_SERVER_ERROR_001: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا أو الاتصال بالمسؤول.",
  INTERNAL_SERVER_ERROR_002: "غير قادر على حذف سجل من الجدول لسبب غير معروف (رمز المطار: {placeholder}).",
  
  CONFLICT_001: "رمز المطار '{placeholder}' موجود بالفعل.",
  
  FORBIDDEN_001: "تم رفض الإذن.",
  
  UNAUTHORIZED_001: "نظام المصادقة غير صالح.",
  UNAUTHORIZED_002: "رمز التفويض غير صالح.",
  UNAUTHORIZED_003: "رمز غير صالح.",
  UNAUTHORIZED_004: "انتهت صلاحية الرمز.",
  UNAUTHORIZED_005: "مستخدم غير صالح.",

  NOT_AUTHENTICATED_001: "غير مصادق عليه.",

  "INVALID_INTEGER_001": "يجب أن يكون الإدخال عددًا صحيحًا صالحًا، غير قادر على تحليل الإدخال '{placeholder}' كعدد صحيح.",
  "INVALID_FLOAT_001": "يجب أن يكون الإدخال عدد عشريًا صالحًا، غير قادر على تحليل الإدخال '{placeholder}' كعدد عشري.",
  "INVALID_TIME_001": "يجب أن يكون الإدخال وقتًا صالحًا، غير قادر على تحليل الإدخال '{placeholder}' كوقت.",
  "INVALID_DATE_001": "يجب أن يكون الإدخال تاريخًا صالحًا، غير قادر على تحليل الإدخال '{placeholder}' كتاريخ.",
  "INVALID_DATETIME_001": "يجب أن يكون الإدخال تاريخًا ووقتًا صالحين، غير قادر على تحليل الإدخال '{placeholder}' كتاريخ ووقت.",
  "INVALID_INPUT_001": "إدخال غير صالح",
  INVALID_INPUT_002: "يجب أن يكون الإدخال أقل من أو يساوي {placeholder}.",
  INVALID_INPUT_003: "يجب أن يكون الإدخال أكبر من أو يساوي {placeholder}.",

  DASHBOARDS_BAD_REQUEST_001: "تم تقديم إدخال غير صالح: {placeholder}.",
  DASHBOARDS_BAD_REQUEST_002: "تم تقديم جنس غير صالح: {placeholder}.",
  DASHBOARDS_BAD_REQUEST_003: "تم تقديم رمز إمارة غير صالح: {placeholder}.",
}


function replacePlaceholders(message, params) {
  return message.replace(/{placeholder}/g, () => {
    return params.shift() || '{placeholder}'; // Replace with param or keep placeholder if no param left
  });
}

export default function getErrorMessage({ errorCode, isRtl = false, params = [] }) {
  const messages = isRtl ? ERROR_MESSAGES_AR : ERROR_MESSAGES_EN;
  const fallbackMessage = isRtl ? "حدث خطأ ما" : "Something went wrong";
  const message = messages?.[errorCode] || fallbackMessage;

  const result = replacePlaceholders(message, params);
  return result;
}