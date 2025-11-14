import type {  LoaderFunctionArgs } from "react-router";

 export default async function loggingMiddleware({ request }:LoaderFunctionArgs, next:any) {
  let url = new URL(request.url);
  console.log(`Starting navigation: ${url.pathname}${url.search}`);
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  console.log(`Navigation completed in ${duration}ms`);
}
