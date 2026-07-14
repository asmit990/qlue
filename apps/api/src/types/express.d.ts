// types/express.d.ts (or wherever your other .d.ts files live)
declare namespace Express {
  export interface Request {
    user: {
      id: number;
      [key: string]: any;
    };
  }
}