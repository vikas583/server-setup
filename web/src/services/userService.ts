import { showGlobalSnackbar } from "../common/snackbarProvider"
import { UserCreateResponse, UserListingResponse, UserRoleResponse } from "../types"
import axiosClient from "../utils/axiosClient"

export class UserService {
    async list() {
        try {
            const response = await axiosClient.get<UserListingResponse>(`/user/list`)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async roleList() {
        try {
            const response = await axiosClient.get<UserRoleResponse>(`/roles/list`)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async createUser(bodyData: any) {
        try {
            const { data } = await axiosClient.post<UserCreateResponse>('/user/create', {
                ...bodyData
            })
            return data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    // async updateUserProfile(bodyData: any, isDeleted:boolean) {
    //     try {
    //         const { data } = await axiosClient.patch<any>(`user/update/profile/pic?removeProfilePic=${isDeleted}`, {
    //             ...bodyData
    //         })
    //         return data
    //     } catch (error: any) {

    //         showGlobalSnackbar(error.response.data.msg)
    //     }
    // }
    async updateUserProfile(bodyData: any, isDeleted?: boolean) {
        try {

            const { data } = await axiosClient.patch<any>(`user/update/profile/pic`,
                bodyData, {

            })
            if (isDeleted) {
                const { data } = await axiosClient.patch<any>(`user/update/profile/pic?removeProfilePic=${isDeleted}`,
                    '', {

                })
                return data
            }

            return data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async userDetails(id: number) {
        try {
            const response = await axiosClient.get<UserRoleResponse>(`/user/details/${id}`)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async updateUser(bodyData: any) {
        try {
            const { data } = await axiosClient.patch<UserCreateResponse>('/user/update/details', {
                ...bodyData
            })
            return data
        } catch (error: any) {

            showGlobalSnackbar(error.response.data.msg)
        }
    }
    async updateUserPassword(bodyData: { oldPassword: string | undefined, newPassword: string }) {
        try {
            const { data } = await axiosClient.patch<UserCreateResponse>('/user/update/password', {
                ...bodyData
            })
            return data
        } catch (error: any) {

            showGlobalSnackbar(error.response.data.msg)
        }
    }

    async userPermissionRemove(id: number | undefined) {
        try {
            const response = await axiosClient.delete<UserRoleResponse>(`/user/delete/${id}`)

            return response.data
        } catch (error: any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }

}

const userService = new UserService()

export default userService