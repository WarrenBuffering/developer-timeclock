"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isYesOrNo = void 0;
function isYesOrNo(str) {
    const lcStr = str.toLowerCase();
    return lcStr === 'y' || lcStr === 'n';
}
exports.isYesOrNo = isYesOrNo;
