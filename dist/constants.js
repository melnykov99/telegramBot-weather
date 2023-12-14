"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_RESULT = exports.DB_RESULT = void 0;
var DB_RESULT;
(function (DB_RESULT) {
    DB_RESULT["NOT_FOUND"] = "entity not found in the database";
    DB_RESULT["UNKNOWN_ERROR"] = "An unknown error occurred during the request";
    DB_RESULT["SUCCESSFULLY"] = "Operation completed successfully";
})(DB_RESULT || (exports.DB_RESULT = DB_RESULT = {}));
var API_RESULT;
(function (API_RESULT) {
    API_RESULT["UNKNOWN_ERROR"] = "Some error occurred during the request";
})(API_RESULT || (exports.API_RESULT = API_RESULT = {}));
