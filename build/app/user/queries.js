"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queries = void 0;
exports.queries = `
    type Query{
        verifyToken(token: String!): String
        getCurrentUser: User
        getUserById(id: String!): User
    }
`;
