"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidName = void 0;
function isValidName(name) {
    return /^[A-Za-z\s]+$/.test(name);
}
exports.isValidName = isValidName;
