import { FindAll200, FindAllParams } from "@/shared/api/generated/model";

export async function getJobs(params?: FindAllParams): Promise<FindAll200> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  //query string
  const url = new URL(`${apiUrl}/api/v1/jobs`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}
