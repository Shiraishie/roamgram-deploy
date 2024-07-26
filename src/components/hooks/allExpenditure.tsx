export async function allExpenditure(travelPlanId: string) {
  const res = await fetch(
    `${
      import.meta.env.VITE_APP_API_URL
    }/api/monetary/allExpenditure?travelPlanId=${travelPlanId}&pageNumber=0&pageSize=1000`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(`authToken`)}`,
      },
    }
  ).then((res) => res.json());
  console.log("res", res);
  return res;
}