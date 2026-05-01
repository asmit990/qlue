import { Router } from "express";
import { register, login } from "./controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get('/login/federated/google', passport.authenticate('google'));
export default router;
