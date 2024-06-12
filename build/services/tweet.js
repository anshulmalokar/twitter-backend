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
const db_1 = __importDefault(require("../db"));
class TweetService {
    static getAllTweets() {
        return __awaiter(this, void 0, void 0, function* () {
            const tweets = db_1.default.tweet.findMany({ orderBy: { createdAt: "desc" } });
            return tweets;
        });
    }
    static createTweet(payload) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    static getSignedUrl(imageType, imageName) {
        // Validate the image type
        const allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp'];
        if (!allowedImageTypes.includes(imageType)) {
            throw new Error("Un-supported Image Type");
        }
        // put object command
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now().toString()}.${imageType}`
        });
        const signedUrl = yield getSignedUrl(s3Client, putObjectCommand);
        return signedUrl;
    }
}
exports.default = TweetService;
