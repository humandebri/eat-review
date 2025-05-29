import { withJuno } from "@junobuild/nextjs-plugin";

const config = {
  output: 'export',
  images: {
    unoptimized: true
  }
};

export default withJuno(config);
