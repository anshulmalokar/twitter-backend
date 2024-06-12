import prisma from "../../db";
import { GraphQlContext } from "../../interfaces";
import { User } from "@prisma/client";
import UserService from "../../services/user";
import { redisClient } from "../../redis";

const queries = {
  verifyToken: async (parent: any, { token }: { token: string }) => {
    const resultToken = await UserService.verifyGoogleAuthToken(token);
    return resultToken;
  },
  getCurrentUser: async (parent: any, args: any, ctx: GraphQlContext) => {
    if (ctx.user?.id) {
      const user = await UserService.getCurrentUserById(ctx.user.id as string);
      return user;
    } else {
      throw new Error("User doesn't exist");
    }
  },
  getUserById: async (
    parent: any,
    { id }: { id: String },
    ctx: GraphQlContext
  ) => await UserService.getCurrentUserById(id as string),
};

const extraResolvers = {
  User: {
    tweets: async (parent: User) =>
      await prisma.tweet.findMany({ where: { authorId: parent.id } }),
    followers: async (parent: User) => {
      const followedBy = await prisma.follows.findMany({
        where: { followingId: parent.id },
        include: { follower: true },
      });
      return followedBy.map((e) => e.follower);
    },
    following: async (parent: User) => {
      const follows = await prisma.follows.findMany({
        where: { followerId: parent.id },
        include: { following: true },
      });
      return follows.map((e) => e.following);
    },
    recomendedUsers: async (parent: any, _: any, ctx: GraphQlContext) => {
      if (!ctx.user) return [];

      //   checkching if there is a cached value
      const cachedValue = await redisClient.get(
        `RECOMENDER_USERS${ctx.user.id}`
      );

      if(cachedValue){
        return JSON.parse(cachedValue);
      }

      const myFollowings = await prisma.follows.findMany({
        where: {
          follower: {
            id: ctx.user.id as string,
          },
        },
        include: {
          following: {
            include: {
              followers: {
                include: {
                  following: true,
                },
              },
            },
          },
        },
      });

      const users = [];

      for (const following of myFollowings) {
        for (const followingOfFollowedUser of following.following.followers) {
          if (
            ctx.user.id !== followingOfFollowedUser.followingId &&
            !myFollowings.find(
              (e) => e.followingId === followingOfFollowedUser.following.id
            )
          ) {
            users.push(followingOfFollowedUser.following);
          }
        }
      }

      // Caching the recomended_user for this particular user in redis
      await redisClient.set(
        `RECOMENDER_USERS${ctx.user.id}`,
        JSON.stringify(users),
      );

      return users;
    },
  },
};

const mutations = {
  followUser: async (
    parent: any,
    { to }: { to: String },
    ctx: GraphQlContext
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("User doesn' exist followUser");
    }
    await UserService.followUser(ctx.user.id as string, to as string);
    await redisClient.del(`RECOMENDER_USERS${ctx.user.id}`);
    return true;
  },
  unFollowUser: async (
    parent: any,
    { to }: { to: String },
    ctx: GraphQlContext
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("User doesn' exist unFollowUser");
    }
    await UserService.unfollowUser(ctx.user.id as string, to as string);
    await redisClient.del(`RECOMENDER_USERS${ctx.user.id}`);
    return true;
  },
};

export const resolvers = { queries, extraResolvers, mutations };
