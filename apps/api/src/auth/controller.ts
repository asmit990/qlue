import { Request, Response } from "express";
import { registerUser, loginUser } from "./service";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await registerUser(username, password);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const data = await loginUser(username, password);
    res.json(data);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
