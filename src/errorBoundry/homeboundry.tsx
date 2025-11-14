import { useRouteError } from "react-router";

export function HomeBoundary() {
  let error = useRouteError() as Error;
  console.log(error.message,'message')
  return (
    <>
      <h2>Error 💥</h2>
      <p>{error.message}</p>
    </>
  );
}
