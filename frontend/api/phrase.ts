import {
    PhrasesResponse,
    PhraseCreateResponse,
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


export const addPhrase = async (
    projectId: number,
    accessToken: string,
    data: { key: string; sourceText: string; context: string; usage: string },
) => {
    return await apiClient<PhraseCreateResponse>(
        `/phrases/createPhrase?project_id=${projectId}`,
        {
            method: "POST",
            body: JSON.stringify({
                key: data.key,
                source_text: data.sourceText,
                context: data.context || null,
                usage: data.usage || null,
            }),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        },
    );
};