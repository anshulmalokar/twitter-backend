export const types = `

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



`