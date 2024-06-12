import { Tweet } from "@prisma/client";
import prisma from "../../db";
import { GraphQlContext } from "../../interfaces";
import  {S3Client,PutObjectCommand} from "@aws-sdk/client-s3"
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import { redisClient } from "../../redis";

interface CreateTweetDatapayload{
    content: String,
    imageURL?: String
}

const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION
})

const queries = {
    getAllTweets: async() => {
        const cachedTweets = await redisClient.get(`ALL_TWEETS`)
        if(cachedTweets){
            return cachedTweets
        }
        const tweets = await prisma.tweet.findMany({orderBy: {createdAt: "desc"}});
        await redisClient.set(`ALL_TWEETS`,JSON.stringify(tweets));
        return tweets;
    },
    getSignedUrlForTweet: async(parent:any,{imageType,imageName}:{imageType: String,imageName: String},ctx:GraphQlContext) => {
        if(!ctx.user || !ctx.user.id){
            throw new Error("You are not authenticated")
        }
        // Validate the image type
        const allowedImageTypes = ['jpg','jpeg','png','webp']
        if(!allowedImageTypes.includes(imageType as string)){
            throw new Error("Un-supported Image Type")
        }
        // put object command
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now().toString()}.${imageType}`
        })

        const signedUrl = await getSignedUrl(s3Client,putObjectCommand);

        return signedUrl;
    }
}

const mutations = {
    createTweet: async (parent: any, {payload}:{payload: CreateTweetDatapayload}, ctx: GraphQlContext) => {
        if(!ctx.user){
            throw new Error("You are not authenticated")
        }

        // Adding the rate limit of 10 sec
        const rateLimitFlag = await redisClient.get(`RATE_LIMIT:${ctx.user.id}`);
        if(rateLimitFlag){
            throw new Error("Please wait for some time");
        }

        const tweet = await prisma.tweet.create({
            data:{
                content: payload.content as string,
                imageURL: payload.imageURL as string,
                author: {
                    connect:{
                        id: ctx.user.id as string
                    }
                }
            }
        })

        await redisClient.setex(`RATE_LIMIT:${ctx.user.id}`,10,1);

        await redisClient.del("ALL_TWEETS");
        return tweet;

    }
}

const extraResolvers = {
    Tweet: {
        author: async (parent: Tweet) => await UserService.getCurrentUserById(parent.authorId)
    }
}

export const resolvers = {mutations,extraResolvers,queries}