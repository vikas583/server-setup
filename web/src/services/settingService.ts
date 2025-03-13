import axios from "axios"
import { showGlobalSnackbar } from "../common/snackbarProvider"
import { BillingDetailsInfo} from "../types"
import axiosClient from "../utils/axiosClient"

export class SettingService {

    async billingDetails() {
        try {
            const response = await axiosClient.get<BillingDetailsInfo>('/account/billing/details')
    
            return response.data
            
        } catch (error:any) {
            showGlobalSnackbar(error.response.data.msg)
        }
    }

}



const settingService = new SettingService()

export default settingService