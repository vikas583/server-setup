import { showGlobalSnackbar } from "../common/snackbarProvider"
import { UploadDocumentData } from "../types"
import axiosClient from "../utils/axiosClient"

export class DocumentService {
    async documentListing(id: number) {
        try {
            let subUrl = `/documents/list/${id}`
            const response = await axiosClient.get<any>(subUrl)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }

    async uploadDocuments(bodyData: UploadDocumentData) {
        try {

            const { data } = await axiosClient.post<{
                msg: string,
                status: boolean
            }>('/documents/upload', bodyData, {

            })

            return data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
}

const documentService = new DocumentService()

export default documentService