import { version } from "mongoose";
import swaggerAutogen from "swagger-autogen";
const doc = {
  info: {
    version: "v0.0.1",
    title: "Dokumentasi API",
    description: "Dokumentasi API",
  },

  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local Server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      LoginRequest: {
        identifier: "ahmadherkal",
        password: "1234",
      },

      ActivationRequest: {
        code: "abcdef",
      },
    },
  },
};
const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
