import { Language } from "@/types/langaugeTypes";
import apiClient from "@/lib/api-client";

export const getLanguages = async (accessToken: string) => {
    return await apiClient<Language[]>("/languages", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};
