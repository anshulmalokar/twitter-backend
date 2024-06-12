import axios from "axios";
import prisma from "../db";
import JWTService from "./jwt";

interface Data {
  iss?: String;
  azp?: String;
  aud?: String;
  sub?: String;
  email: String;
  email_verified?: String;
  nbf?: String;
  name?: String;
  picture?: String;
  given_name: String;
  family_name: String;
  iat?: String;
  exp?: String;
  jti?: String;
  alg?: String;
  kid?: String;
  typ?: String;
}

class UserService {
  public static async verifyGoogleAuthToken(token: string) {
    const googleToken = token;
    const googleAuthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleAuthUrl.searchParams.append("id_token", googleToken);

    const response = await axios.get(googleAuthUrl.toString(), {
      responseType: "json",
    });

    const data: Data = response.data;

    const checkForUser = await prisma.user.findUnique({
      where: {
        email: data.email.toString(),
      },
    });

    if (!checkForUser) {
      await prisma.user.create({
        data: {
          email: data.email.toString(),
          firstName: data.given_name.toString(),
          lastName: data.family_name.toString(),
          profileImageUrl: data.picture?.toString(),
        },
      });
    }

    const userInDb = await prisma.user.findUnique({
      where: {
        email: data.email.toString(),
      },
    });

    if (!userInDb) {
      throw new Error("User with Email not found");
    } else {
      const token = JWTService.generateTokenForUser(userInDb);
      return token;
    }
  }

  public static async getCurrentUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: id as string,
        },
      });
      return user;
    } catch (e) {
      throw new Error("Invalid Id passed getCurrentUserById");
    }
  }

  public static async followUser(from: string, to: string) {

    if(from === to){
      throw new Error("The User is trying to follow it's own account");
    }

    return await prisma.follows.create({
      data: {
        follower: {
          connect: {
            id: from as string,
          },
        },
        following: {
          connect: {
            id: to as string,
          },
        },
      },
    });
  }

  public static async unfollowUser(from: string, to: string) {
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: from,
          followingId: to,
        },
      },
    });
  }
}

export default UserService;
