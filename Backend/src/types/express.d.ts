type AuthContext =
  | {
      authType: "jwt";
      userId: string;
      tenantId: string;
      role: string;
    }
  | {  
      authType: "api-key";
      userId: string;
      tenantId: string;
    };

    declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};