// NOTE: Add strong type for express extend from express
declare namespace Express {
    interface Request {
      user: {
        id: string;
      };
    }
  }
  