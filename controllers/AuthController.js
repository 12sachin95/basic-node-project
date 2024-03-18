import Prisma from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidations.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthController {
  static async register(req, res) {
    const body = req.body;
    try {
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      //check for unique email
      const findUser = await Prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (findUser) {
        return res.status(400).json({
          errors: {
            email: "Please provide unique email, its allready used.",
          },
        });
      }

      //encrypt the password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      const user = await Prisma.users.create({
        data: payload,
      });
      return res.status(200).json({ user });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res
          .status(500)
          .json({ status: 500, message: "Something went wromg." });
      }
    }
  }

  static async login(req, res) {
    const body = req.body;
    try {
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);
      const foundUser = await Prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (foundUser) {
        if (!bcrypt.compareSync(payload.password, foundUser.password)) {
          return res
            .status(400)
            .json({ errors: { email: "Invalid credentials" } });
          //   let token = jwt.sign(
          //     { id: foundUser.id, isAdmin: foundUser.isAdmin },
          //     process.env.JWT_SECRET,
          //     { expiresIn: "7d" }
          //   );
        }

        //issue token

        const payloadData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          profile: foundUser.profile,
        };

        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        return res.json({
          message: "logged in",
          access_token: `Bearer ${token}`,
        });
      }

      return res.status(200).json({ payload });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res
          .status(500)
          .json({ status: 500, message: "Something went wromg." });
      }
    }
  }
}

export default AuthController;
