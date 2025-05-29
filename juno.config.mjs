
import { defineConfig } from "@junobuild/config";

/** @type {import('@junobuild/config').JunoConfig} */
export default defineConfig({
  satellite: {
    ids: {
      development: "be2us-64aaa-aaaaa-qaabq-cai",
      production: '<PROD_SATELLITE_ID>'
    },
    source: "out",
    predeploy: ["npm run build"],
    functions: {
      source: "src/serverless"
    }
  },
});
