import { createApp } from "./src/app.ts";

const main = () => {
  const app = createApp();

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
