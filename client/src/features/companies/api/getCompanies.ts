import {
  FindAllCompanies200,
  FindAllCompaniesParams,
} from "@/shared/api/generated/model";

export async function getCompanies(
  params?: FindAllCompaniesParams
): Promise<FindAllCompanies200> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const url = new URL(`${apiUrl}/api/v1/companies`);
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
    throw new Error("Failed to fetch companies");
  }

  return res.json();
}
