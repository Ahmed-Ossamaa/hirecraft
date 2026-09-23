import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "http://localhost:5000/api/docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/shared/api/generated",
      schemas: "./src/shared/api/generated/model",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/shared/api/axios-instance.ts",
          name: "customAxiosInstance",
        },
      },
    },
  },
  zod: {
    input: {
      target: "http://localhost:5000/api/docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/shared/api/generated/zod",
      client: "zod",
    },
  },
});
