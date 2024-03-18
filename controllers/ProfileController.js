import { imageValidater, uploadImage } from "../utils/helper.js";
import Prisma from "../DB/db.config.js";

class ProfileController {
  static async getUserProfile(req, res) {
    try {
      const user = req.user;
      return res.json({ status: 200, user });
    } catch (error) {
      return res.json({ status: 500, error });
    }
  }
  static async createUserProfile() {}
  static async getUserProfile() {}
  static async updateUserProfile(req, res) {
    const { id } = req.params;
    const user = req.user;
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Profile image is required." });
      }

      const profile = req.files.profile;
      const message = imageValidater(profile.size, profile.mimetype);

      if (message !== null) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        });
      }
      const imgName = uploadImage(image);
      await Prisma.users.update({
        data: {
          profile: imgName,
        },
        where: {
          id: Number(id),
        },
      });
      return res.json({
        status: 200,
        message: "Profile has been uploaded successfully.",
      });
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }
  static async deleteUserProfile() {}
}

export default ProfileController;
