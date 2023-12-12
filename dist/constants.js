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
    API_RESULT["INCORRECT_CITY"] = "there is no such town.";
})(API_RESULT || (exports.API_RESULT = API_RESULT = {}));
