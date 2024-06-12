"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `

    type User{
        id : ID!
        firstName : String!,
        lastName : String,
        email : String!,
        profileImageUrl: String

        followers: [User]
        following: [User]

        recomendedUsers: [User]

        tweets: [Tweet]
    }



`;
