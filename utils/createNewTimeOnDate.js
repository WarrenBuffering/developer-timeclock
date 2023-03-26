"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewTimeOnDate = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
function createNewTimeOnDate(datetime, newTime) {
    const prevDate = (0, dayjs_1.default)(datetime).format('YYYY-MM-DD');
    return (0, dayjs_1.default)(`${prevDate} ${newTime}`).format('YYYY-MM-DDThh:mm:ss');
}
exports.createNewTimeOnDate = createNewTimeOnDate;
