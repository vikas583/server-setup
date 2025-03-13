import axios from "axios"
import { showGlobalSnackbar } from "../common/snackbarProvider"
import { CollaboratorsListResponse, projectDetailsBodyData, projectDocumentBodyData, projectScopeBodyData, RegulationDetailsListResponse, RegulationsListResponse } from "../types"
import axiosClient from "../utils/axiosClient"

export class ProjectService {

    async listCollaborators() {
        const response = await axiosClient.get<CollaboratorsListResponse>('/user/active')

        return response.data
    }

    async listRegulations(skip: number, limit: number, searchStr?: string) {
        let subUrl = `/regulations/list/${skip}/${limit}`
        if (searchStr) {
            subUrl += `?query=${searchStr}`
        }

        const response = await axiosClient.get<RegulationsListResponse>(subUrl)

        return response.data
    }

    async listRegulationDetails(regulationId: number, searchStr?: string) {
        let subUrl = `/regulation/details/list?regulationId=${regulationId}`
        if (searchStr) {
            subUrl += `?query=${searchStr}`
        }

        const response = await axiosClient.get<RegulationDetailsListResponse>(subUrl)

        return response.data
    }
    async createProject(bodyData: any) {

        const { data } = await axiosClient.post<{
            status: boolean,
            msg: string
        }>('/project/create', {
            ...bodyData
        })

        return data

    }
    async archiveProject(bodyData: any) {
        try {
            const { data } = await axiosClient.patch<{
                status: boolean,
                msg: string
            }>('/project/archive', {
                ...bodyData
            })

            return data
        } catch (error: any) {

            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async projectListing(skip: number, limit: number, searchStr?: string) {
        try {
            let subUrl = `/project/list/${skip}/${limit}`
            const response = await axiosClient.get<any>(subUrl)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async projectDetails(id: number) {
        try {
            let subUrl = `/project/details/${id}`
            const response = await axiosClient.get<any>(subUrl)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async projectArchiveListing(skip: number, limit: number, searchStr?: string,) {
        try {
            let subUrl = `/project/list/${skip}/${limit}?isArchive=true`
            const response = await axiosClient.get<any>(subUrl)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async projectSettingUpdate(bodyData: projectDetailsBodyData) {

        const { data } = await axiosClient.patch<{
            status: boolean,
            msg: string
        }>('/project/update', {
            ...bodyData
        })

        return data

    }
    async projectScopeUpdate(bodyData: projectScopeBodyData) {
        try {
            const { data } = await axiosClient.patch<{
                status: boolean,
                msg: string
            }>('/project/update/scope', {
                ...bodyData
            })

            return data
        } catch (error: any) {

            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async deleteDocument(docId: number, projectId: number) {
        try {
            const response = await axiosClient.delete<{
                msg: string,
                status: boolean
            }>(`/documents/delete/${docId}/${projectId}`)

            return response
        } catch (error: any) {

            showGlobalSnackbar(error.response.data.msg)
        }
    }

}



const projectService = new ProjectService()

export default projectService