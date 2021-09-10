/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/register": {
    post: operations["register"];
  };
  "/login": {
    post: operations["login"];
  };
  "/musicians": {
    get: operations["getMusicians"];
  };
}

export interface components {
  schemas: {
    musician: {
      email: string;
      givenName: string;
      familyName: string;
      phone?: string;
      facebookUrl?: string;
      twitterUrl?: string;
      instagramUrl?: string;
      promotion: "L1" | "L2" | "L3" | "M1" | "M2";
      location: "Douai" | "Lille";
    };
    token: {
      token: string;
      refresh_token: string;
    };
  };
}

export interface operations {
  register: {
    responses: {
      /** The user has been registered in the db */
      201: {
        content: {
          "application/json": components["schemas"]["token"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["musician"] & {
          password: string;
        };
      };
    };
  };
  login: {
    responses: {
      /** Login successful */
      200: {
        content: {
          "application/json": components["schemas"]["token"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": {
          email?: string;
          password?: string;
        };
      };
    };
  };
  getMusicians: {
    responses: {
      /** A list of all the musicians */
      200: {
        content: {
          "application/json": components["schemas"]["musician"][];
        };
      };
    };
  };
}

export interface external {}
