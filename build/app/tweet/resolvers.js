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
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const user_1 = __importDefault(require("../../services/user"));
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_DEFAULT_REGION
});
const queries = {
    getAllTweets: () => __awaiter(void 0, void 0, void 0, function* () { return yield db_1.default.tweet.findMany({ orderBy: { createdAt: "desc" } }); }),
    getSignedUrlForTweet: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { imageType, imageName }, ctx) {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("You are not authenticated");
        }
        // Validate the image type
        const allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp'];
        if (!allowedImageTypes.includes(imageType)) {
            throw new Error("Un-supported Image Type");
        }
        // put object command
        const putObjectCommand = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now().toString()}.${imageType}`
        });
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, putObjectCommand);
        return signedUrl;
    })
};
const mutations = {
    createTweet: (parent_2, _b, ctx_2) => __awaiter(void 0, [parent_2, _b, ctx_2], void 0, function* (parent, { payload }, ctx) {
        if (!ctx.user) {
            throw new Error("You are not authenticated");
        }
        const tweet = yield db_1.default.tweet.create({
            data: {
                content: payload.content,
                imageURL: payload.imageURL,
                author: {
                    connect: {
                        id: ctx.user.id
                    }
                }
            }
        });
        return tweet;
    })
};
const extraResolvers = {
    Tweet: {
        author: (parent) => __awaiter(void 0, void 0, void 0, function* () { return yield user_1.default.getCurrentUserById(parent.authorId); })
    }
};
exports.resolvers = { mutations, extraResolvers, queries };
