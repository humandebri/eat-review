
import { defineConfig } from "@junobuild/config";

/** @type {import('@junobuild/config').JunoConfig} */
export default defineConfig({
  satellite: {
    ids: {
      development: "be2us-64aaa-aaaaa-qaabq-cai",
      production: 's6ojm-liaaa-aaaal-asftq-cai'
    },
    source: "out",
    predeploy: ["npm run build"],
    functions: {
      source: "src/serverless"
    }
  },
});
