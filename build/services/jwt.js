"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "secret";
class JWTService {
    static generateTokenForUser(user) {
        const payload = {
            id: user === null || user === void 0 ? void 0 : user.id,
            email: user === null || user === void 0 ? void 0 : user.email,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET);
        return token;
    }
    static decodeTonken(token) {
        try {
            const parsedTokenArray = token.split(" ");
            return jsonwebtoken_1.default.verify(parsedTokenArray[1].toString(), JWT_SECRET);
        }
        catch (e) {
            return null;
        }
    }
}
exports.default = JWTService;
