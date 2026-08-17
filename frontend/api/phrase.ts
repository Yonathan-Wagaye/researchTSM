import {
    PhrasesResponse,
} from '@/types/phraseTypes';
import apiClient from '@/lib/api-client';

export const getPhraseTranslations = async (
    projectId: number,
    accessToken: string,
    limit = 20,
    offset = 0,
) => {
    const queryParams = new URLSearchParams({
        project_id: projectId.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
    });

    return await apiClient<PhrasesResponse>(
        `/phrases/getPhraseTranslations?${queryParams}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );
};
