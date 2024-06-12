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
exports.resolvers = void 0;
const db_1 = __importDefault(require("../../db"));
const user_1 = __importDefault(require("../../services/user"));
const queries = {
    verifyToken: (parent_1, _a) => __awaiter(void 0, [parent_1, _a], void 0, function* (parent, { token }) {
        const resultToken = yield user_1.default.verifyGoogleAuthToken(token);
        return resultToken;
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        if ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) {
            const user = yield user_1.default.getCurrentUserById(ctx.user.id);
            return user;
        }
        else {
            throw new Error("User doesn't exist");
        }
    }),
    getUserById: (parent_2, _c, ctx_1) => __awaiter(void 0, [parent_2, _c, ctx_1], void 0, function* (parent, { id }, ctx) { return yield user_1.default.getCurrentUserById(id); }),
};
const extraResolvers = {
    User: {
        tweets: (parent) => __awaiter(void 0, void 0, void 0, function* () { return yield db_1.default.tweet.findMany({ where: { authorId: parent.id } }); }),
        followers: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const followedBy = yield db_1.default.follows.findMany({ where: { followingId: parent.id }, include: { follower: true } });
            return followedBy.map(e => e.follower);
        }),
        following: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const follows = yield db_1.default.follows.findMany({ where: { followerId: parent.id }, include: { following: true } });
            return follows.map(e => e.following);
        }),
        recomendedUsers: (parent, _, ctx) => __awaiter(void 0, void 0, void 0, function* () {
            if (!ctx.user)
                return [];
            const myFollowings = yield db_1.default.follows.findMany({
                where: {
                    follower: {
                        id: ctx.user.id
                    }
                },
                include: {
                    following: {
                        include: {
                            followers: {
                                include: {
                                    following: true
                                }
                            }
                        }
                    }
                }
            });
            const users = [];
            for (const following of myFollowings) {
                for (const followingOfFollowedUser of following.following.followers) {
                    if (ctx.user.id !== followingOfFollowedUser.followingId
                        &&
                            !myFollowings.find(e => e.followingId === followingOfFollowedUser.following.id)) {
                        users.push(followingOfFollowedUser.following);
                    }
                }
            }
            return users;
        })
    },
};
const mutations = {
    followUser: (parent_3, _d, ctx_2) => __awaiter(void 0, [parent_3, _d, ctx_2], void 0, function* (parent, { to }, ctx) {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("User doesn' exist followUser");
        }
        yield user_1.default.followUser(ctx.user.id, to);
        return true;
    }),
    unFollowUser: (parent_4, _e, ctx_3) => __awaiter(void 0, [parent_4, _e, ctx_3], void 0, function* (parent, { to }, ctx) {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("User doesn' exist unFollowUser");
        }
        yield user_1.default.unfollowUser(ctx.user.id, to);
        return true;
    })
};
exports.resolvers = { queries, extraResolvers, mutations };
