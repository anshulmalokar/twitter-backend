export interface JWTUser{
    id: String,
    email: String
}

export interface GraphQlContext{
    user?: JWTUser
}