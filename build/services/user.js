"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../db"));
const jwt_1 = __importDefault(require("./jwt"));
class UserService {
    static verifyGoogleAuthToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const googleToken = token;
            const googleAuthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
            googleAuthUrl.searchParams.append("id_token", googleToken);
            const response = yield axios_1.default.get(googleAuthUrl.toString(), {
                responseType: "json",
            });
            const data = response.data;
            const checkForUser = yield db_1.default.user.findUnique({
                where: {
                    email: data.email.toString(),
                },
            });
            if (!checkForUser) {
                yield db_1.default.user.create({
                    data: {
                        email: data.email.toString(),
                        firstName: data.given_name.toString(),
                        lastName: data.family_name.toString(),
                        profileImageUrl: (_a = data.picture) === null || _a === void 0 ? void 0 : _a.toString(),
                    },
                });
            }
            const userInDb = yield db_1.default.user.findUnique({
                where: {
                    email: data.email.toString(),
                },
            });
            if (!userInDb) {
                throw new Error("User with Email not found");
            }
            else {
                const token = jwt_1.default.generateTokenForUser(userInDb);
                return token;
            }
        });
    }
    static getCurrentUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield db_1.default.user.findUnique({
                    where: {
                        id: id,
                    },
                });
                return user;
            }
            catch (e) {
                throw new Error("Invalid Id passed getCurrentUserById");
            }
        });
    }
    static followUser(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            if (from === to) {
                throw new Error("The User is trying to follow it's own account");
            }
            return yield db_1.default.follows.create({
                data: {
                    follower: {
                        connect: {
                            id: from,
                        },
                    },
                    following: {
                        connect: {
                            id: to,
                        },
                    },
                },
            });
        });
    }
    static unfollowUser(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.default.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: from,
                        followingId: to,
                    },
                },
            });
        });
    }
}
exports.default = UserService;
