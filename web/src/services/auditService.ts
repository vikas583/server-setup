import { showGlobalSnackbar } from "../common/snackbarProvider"
import { DocumentDetailsResponse, RecentAuditResponse, RegulationsVerificationListResponse } from "../types"
import axiosClient from "../utils/axiosClient"

export class AuditService {
    async recentAudits() {
        try {
            let subUrl = `/audits/recent`
            const response = await axiosClient.get<RecentAuditResponse>(subUrl)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async regulationsVerificationList() {
        try {
            let subUrl = `/regulations/verification/list`
            const response = await axiosClient.get<RegulationsVerificationListResponse>(subUrl)
            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async auditStart(bodyData: { documentId: number, auditId: number }) {
        try {
            const { data } = await axiosClient.post<{
                status: boolean,
                msg: string
            }>('/audits/start', {
                ...bodyData
            })
            return data
        } catch (error: any) {

            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async documentDetails(docId: any) {
        try {
            let subUrl = `/documents/details/${docId}`
            const response = await axiosClient.get<DocumentDetailsResponse>(subUrl)
            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async auditDetails(auditId: any, docId: any) {
        try {
            let subUrl = `/audits/details/${auditId}?documentId=${docId}`
            const response = await axiosClient.get<any>(subUrl)
            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
}
///
////details/:docId

const auditService = new AuditService()

export default auditService