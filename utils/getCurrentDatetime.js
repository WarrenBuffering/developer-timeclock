"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDatetime = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
function getCurrentDatetime() {
    return (0, dayjs_1.default)().toISOString();
}
exports.getCurrentDatetime = getCurrentDatetime;
