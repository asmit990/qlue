import { Request, Response } from "express";
import { registerUser, loginUser, forgetPassword, resetPassword } from "./service";
import { loginSchema, registerSchema} from "./validation/validation";

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const { name, email, username, password} = value;

    const user = await registerUser( name, email, username, password);

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const { username, password } = value;

    const data = await loginUser(username, password);

    return res.json(data);
  } catch (error: any) {
    return res.status(401).json({
      error: error.message,
    });
  }
};



export const forgotPasswordd = async (req: Request, res: Response) => {
  try {
    await forgetPassword(req.body.email, req.body.username);
    res.json({ message: "Email sent" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPasswordd = async (req: Request, res: Response) => {
  try {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    await resetPassword(token, req.body.password);
    res.json({ message: "Password reset successful" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};