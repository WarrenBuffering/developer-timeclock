"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDate = void 0;
function isValidDate(str) {
    const date = new Date(str);
    return isNaN(date.getTime()) ? false : true;
}
exports.isValidDate = isValidDate;
