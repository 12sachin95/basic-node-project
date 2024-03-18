import prisma from "../DB/db.config.js";
import NewsApitransform from "../transform/newsApiTransform.js";
import { imageValidater, removeImage, uploadImage } from "../utils/helper.js";
import { newsSchema } from "../validations/newsValidation.js";
import vine, { errors } from "@vinejs/vine";

class NewsController {
  static async getAllNews(req, res) {
    const page = Number(req?.query?.page ?? 1);
    const limit = Number(req.query?.limit ?? 10);

    if (page <= 0) {
      page = 1;
    }

    if (limit <= 0 || limit > 100) {
      page = 10;
    }

    const skip = (page - 1) * limit;

    try {
      const news = await prisma.news.findMany({
        take: limit,
        skip: skip,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });
      const newstransform = news.map((item) =>
        NewsApitransform.transform(item)
      );

      const totalNews = await prisma.news.count();
      const totalPages = Math.ceil(totalNews / limit);
      return res.json({
        status: 200,
        data: newstransform,
        currentPage: page,
        totalItems: totalNews,
        totalPages: totalPages,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: error.message ?? "Something went wromg.",
        });
      }
    }
  }

  static async createNews(req, res) {
    const user = req.user;
    const body = req.body;
    try {
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);
      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ errors: "Image is required, No files were uploaded." });
      }
      const image = req.files?.image;
      const message = imageValidater(image?.size, image.mimetype);

      if (message !== null) {
        return res.status(400).json({ errors: message });
      }
      const imgName = uploadImage(image);
      payload.image = imgName;
      payload.user_id = user.id;
      const news = await prisma.news.create({
        data: payload,
      });

      return res.json({
        status: 200,
        message: "News created successfully.",
        data: news.data,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: error.message ?? "Something went wromg.",
        });
      }
    }
  }

  static async getNews(req, res) {
    const id = Number(req.params.id);
    try {
      const news = await prisma.news.findUnique({
        where: { id: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });
      return res.json({ status: 200, news: NewsApitransform.transform(news) });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: error.message ?? "Something went wromg.",
        });
      }
    }
  }

  static async updateNews(req, res) {
    const id = Number(req.params.id);
    const user = req.user;
    const body = req.body;

    try {
      const news = await prisma.news.findUnique({
        where: { id: id },
      });
      if (user.id !== news.user_id) {
        return res.json({
          status: 400,
          message: "You are not the owner of this post, you can't edit this ",
        });
      }
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);
      let imageName = undefined;
      const image = req?.files?.image;
      if (image) {
        const message = imageValidater(image?.size, image.mimetype);
        if (message !== null) {
          return res.status(400).json({ errors: { image: message } });
        }
        imageName = uploadImage(image);
        removeImage(news.image);
      }
      payload.image = imageName;
      await prisma.news.update({
        data: payload,
        where: {
          id: Number(id),
        },
      });

      return res.json({ status: 200, message: "News updated succesfully" });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: error.message ?? "Something went wromg.",
        });
      }
    }
  }

  static async deleteNews(req, res) {
    const { id } = req.params;
    const user = req.user;

    try {
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news.user_id) {
        return res.json({
          status: 400,
          message: "You are not the owner of this post, you can't edit this ",
        });
      }
      removeImage(news.image);

      await prisma.news.delete({
        where: {
          id: Number(id),
        },
      });

      return res.json({ status: 200, message: "News deleted successfully." });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: error.message ?? "Something went wromg.",
        });
      }
    }
  }
}

export default NewsController;
