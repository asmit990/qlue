import { Router } from "express";
import { register, login, forgotPasswordd, resetPasswordd } from "./controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgetpassword", forgotPasswordd);
router.post("/reset-password/:token", resetPasswordd);

export default router;