import { Project, CreateProject, UpdateProject } from '@/types/projectTypes';
import apiClient from '@/lib/api-client';

export const getPaginatedProjects = async (limit: number, offset: number) => {
    const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    });
    return await apiClient<Project[]>(`/projects/getProjects?${queryParams}`, {method: 'GET'});
}


export const getProject = async (projectId: number, access_token: string) => {
    const queryParams = new URLSearchParams({
        project_id: projectId.toString(),
    });
    return await apiClient<Project>(`/projects/getProject?${queryParams}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};


export const createProject = async (project: CreateProject, accessToken: string) => {
    return await apiClient<Project>("/projects/create", {
        method: "POST",
        body: JSON.stringify(project),
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

export const updateProject = async (project: UpdateProject) => {
    return await apiClient<UpdateProject>(`/projects/${project.id}`, {method: 'PUT', body: JSON.stringify(project)});
}

export const uploadPhrases = async (
    projectId: number,
    file: File,
    accessToken: string,
) => {
    const queryParams = new URLSearchParams({
        project_id: projectId.toString(),
    });
    const formData = new FormData();
    formData.append("phrase_file", file);

    return await apiClient<{
        phrase_count: number;
        languages: string[];
        unsupported_languages: string[];
    }>(
        `/projects/uploadPhrases?${queryParams}`,
        {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );
};

