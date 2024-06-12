export const queries = `
    type Query{
        verifyToken(token: String!): String
        getCurrentUser: User
        getUserById(id: String!): User
    }
`;
