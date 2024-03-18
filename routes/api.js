import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleware from "../middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";
import redisCache from "../DB/redis-config.js";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

router.get("/profile", authMiddleware, ProfileController.getUserProfile);
router.put("/profile/:id", authMiddleware, ProfileController.updateUserProfile);
//news apis
router.get("/news/", redisCache.route(), NewsController.getAllNews);
router.post("/news/", authMiddleware, NewsController.createNews);
router.get("/news/:id", redisCache.route(), NewsController.getNews);
router.put("/news/:id", authMiddleware, NewsController.updateNews);
router.delete("/news/:id", authMiddleware, NewsController.deleteNews);

export default router;
