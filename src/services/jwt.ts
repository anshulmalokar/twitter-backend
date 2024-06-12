import { User } from "@prisma/client";
import JWT from "jsonwebtoken";
import { JWTUser } from "../interfaces";

const JWT_SECRET = "secret";

class JWTService {
  public static generateTokenForUser(user: User) {
    const payload: JWTUser = {
      id: user?.id,
      email: user?.email,
    };

    const token = JWT.sign(payload, JWT_SECRET);

    return token;
  }

  public static decodeTonken(token: String) {
    try{
      const parsedTokenArray = token.split(" ");
      return JWT.verify(parsedTokenArray[1].toString(), JWT_SECRET) as JWTUser;
    }catch(e){
      return null;
    }
  }
}

export default JWTService;
