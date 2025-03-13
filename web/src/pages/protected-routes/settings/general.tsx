import { Avatar, Box, Button, FormControl, Grid2, InputLabel, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { UserIcon } from "../../../assets/icons/userIcon";
import { UploadIcon } from "../../../assets/icons/uploadIcon";
import { Colors } from "../../../common/colors";
import { VisuallyHiddenInput } from "../all-files/allFiles.style";
import { LockIcon } from "../../../assets/icons/Lock";
import { AuthIcon } from "../../../assets/icons/auth";
import { BillingIcon } from "../../../assets/icons/billing";
import { GreaterThenIcon } from "../../../assets/icons/greaterThenIcon";
import settingService from "../../../services/settingService";
import { ChangeEvent, useEffect, useState } from "react";
import { useLoading } from "../../../common/loader/loader-context";
import { BillingDetailsInterface, userDetailsInfo } from "../../../types";
import { authService } from "../../../services";
import { formatString, stringAvatar } from "../../../utils/stringAvatar";
import userService from "../../../services/userService";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import store from "../../../store/store";
import ResetPasswordDialog from "./reset-password-popup";
import { CustomOutlinedInput, CustomSecondaryButton } from "../../../common/common.style";

const initialData: BillingDetailsInterface = {
    id: NaN,
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    co: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
};
type UserProfileProps = {
    userDetails: userDetailsInfo | undefined;
    refreshApi: () => void;
};

// export default function GeneralSettings(userDetails: UserProfileProps) {
// const GeneralSettings: React.FC<UserProfileProps> = {
const GeneralSettings = ({ userDetails, refreshApi }: UserProfileProps) => {


    const [billingDetails, setBillingDetails] = useState<BillingDetailsInterface>(initialData)
    // const [userDetails, setUserDetails] = useState<userDetailsInfo>();
    const [userToken, setUserToken] = useState<string | null>('');
    const { setLoading } = useLoading();
    const [isRoleInfoDialogOpen, setRoleInfoDialogOpen] = useState(false);
    const [isResetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
    const [ResetPasswordDialogData, setResetPasswordDialogData] = useState<any>();

    useEffect(() => {
        if (userDetails?.role === 'account_owner') {
            billingDetail()
        }

        const { accessToken } = store.getState().auth;
        setUserToken(accessToken)

    }, [userDetails])
    const billingDetail = async () => {
        try {
            setLoading(true)
            const response = await settingService.billingDetails()
            if (response?.status) {
                setBillingDetails(response.data)
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }

    }
    const handleChange = (field: keyof BillingDetailsInterface) => (event: React.ChangeEvent<HTMLInputElement>) => {
    }
    const updateProfile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setTimeout(() => {
                uploadApi(file)
            }, 1000);

        }

    }
    const uploadApi = async (file: File) => {
        try {
            setLoading(true)
            const formData: any = new FormData();

            formData.append('file', file);
            const resp = await userService.updateUserProfile(formData)
            showGlobalSnackbar(resp?.msg, 'success')
            setLoading(false)
            refreshApi()
        } catch (error) {
            setLoading(false)
            showGlobalSnackbar('Something went wrong', 'error')
        }
    }
    const removeProfile = async () => {
        try {
            setLoading(true)
            const resp = await userService.updateUserProfile('', true)
            showGlobalSnackbar(resp?.msg, 'success')
            refreshApi()
            setLoading(false)
        } catch (error) {
            setLoading(false)
            showGlobalSnackbar('Something went wrong', 'error')
        }

    }
    const openResetPassword = () => {
        setResetPasswordDialogOpen(true)
    }
    const handleResetPasswordDialogData = () => {

    }
    const handleResetPasswordCloseDialog = () => {
        setLoading(false)
        setResetPasswordDialogOpen(false)
    }
    return (
        <div>
            <Typography className="flex items-center" variant="h6" fontWeight={600}> <UserIcon /> <span className="ms-2">Account</span></Typography>
            <Typography variant="body1">Customize your profile image, personal information and company details.</Typography>
            <Box my={3}>
                <div className="flex items-center">

                    {userDetails?.profilePicUrl === null ?
                        <Avatar sx={{ width: '94px', height: '94px', bgcolor: '#18988B', fontSize: '2.25rem' }}  {...stringAvatar(userDetails?.firstName + " " + userDetails?.lastName)} />
                        :
                        <Avatar
                            alt={'User profile'}
                            src={userDetails?.profilePicUrl + '&token=' + userToken}
                            sx={{
                                width: '94px',
                                height: '94px',
                                border: '2px solid #ccc',
                            }}
                        />
                    }

                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        sx={{
                            background: Colors.grey, fontWeight: 600, fontSize: '14px', color: 'black',
                            marginLeft: '16px'
                        }}
                    >
                        Upload files
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => updateProfile(event)}
                            accept="image/*"
                        />
                    </Button>
                    {userDetails?.profilePicUrl &&
                        <Button disableRipple sx={{ color: 'red', marginLeft: '4px' }} onClick={removeProfile}>Remove</Button>
                    }
                </div>

            </Box>
            <Typography variant="body1" mb={2} fontWeight={600}>Personal Details</Typography>
            <Grid2 container spacing={2}>
                <Grid2 size={6} >
                    <div >
                        <InputLabel className="mb-1" htmlFor="component-helper" required><span className="text-sm">First Name:</span></InputLabel>
                        <CustomOutlinedInput aria-readonly disabled placeholder='john' required id="outlined-basic" size='small' fullWidth
                            name="First Name" value={userDetails?.firstName || ''} />
                    </div>
                </Grid2>
                <Grid2 size={6}>
                    <div className="mb-3">
                        <InputLabel className="mb-1" htmlFor="component-helper" required><span className="text-sm">Last Name:</span></InputLabel>
                        <CustomOutlinedInput aria-readonly disabled placeholder='deo' required id="outlined-basic" size='small' fullWidth
                            name="Last Name" value={userDetails?.lastName || ''} />
                    </div>
                </Grid2>
                <Grid2 size={6} mb={2}>
                    <div >
                        <InputLabel className="mb-1" htmlFor="component-helper"><span className="text-sm">Company Email:</span></InputLabel>
                        <CustomOutlinedInput aria-readonly disabled placeholder='john' required id="outlined-basic" size='small' fullWidth
                            name="Email"
                            value={userDetails?.email || ''}
                        />
                    </div>
                </Grid2>
                <Grid2 size={6}>
                    <div className="mb-3">
                        <InputLabel className="mb-1" htmlFor="component-helper"><span className="text-sm">Role:</span></InputLabel>
                        <CustomOutlinedInput aria-readonly disabled placeholder='Audit Program Coordinator' required id="outlined-basic" size='small' fullWidth
                            name="Audit Program Coordinator" value={formatString(userDetails?.role || '')} />
                    </div>
                </Grid2>
                <Grid2 size={12} >

                    <Typography variant="body1" fontWeight={600}>Company Details</Typography>
                </Grid2>
                <Grid2 size={6} >
                    <div >
                        <InputLabel className="mb-1" htmlFor="component-helper" required><span className="text-sm">Company Name:</span></InputLabel>
                        <CustomOutlinedInput disabled placeholder='Tiebreaker AI' required id="outlined-basic" size='small' fullWidth
                            name="Company Name" aria-readonly value={userDetails?.companyName || ''} />
                    </div>
                </Grid2>
                {/* <Grid2 size={6}>
                    <div className="mb-3">
                        <InputLabel className="mb-1" htmlFor="component-helper" required><span className="text-sm">Company Contact:</span></InputLabel>
                        <CustomOutlinedInput disabled placeholder='+1 (604)767-8778' required id="outlined-basic" size='small'  fullWidth
                            name="Company Contact" />
                    </div>
                </Grid2> */}
            </Grid2>
            <hr className="my-8" />
            <Typography className="flex items-center" variant="h6" fontWeight={600}><LockIcon /> <span className="ms-2">Password & Security</span></Typography>
            <Typography mb={3} variant="body1">Manage your login credentials and security settings. Review our <Link to={'/'}>FAQ page</Link> to learn more about our security measures.</Typography>
            <CustomSecondaryButton disableRipple sx={{ marginRight: '16px' }} size="small" variant="contained" className='flex m-2 p-2 rounded' onClick={openResetPassword}>Reset Password</CustomSecondaryButton>
            <Typography mb={3} color="#757874"><span className="text-xs">last changed: September 16, 2024</span></Typography>

            <Typography variant="body1" mb={1} fontWeight={600}>Two-Factor-Authentification</Typography>
            <Typography className="flex items-center" ><AuthIcon /> <span className="mx-2 text-sm">Authenticator App</span> <Link to={'/'} className="text-sm">Reconfigure</Link></Typography>
            {userDetails?.role === 'account_owner' &&
                <div>
                    <Box padding={'32px 0px 32px 0px'}>
                        <hr />
                    </Box>
                    <Typography className="flex items-center" variant="h6" fontWeight={600}> <BillingIcon /> <span className="ms-2">Billing</span></Typography>
                    <div className="flex justify-between items-baseline">
                        <Typography variant="body1" width={'75%'} mb={3}>Ensure uninterrupted access to Tiebreaker AI, by maintaining your billing details. Note that information provided here will be used for tax and invoice purposes. Reach out for additional support at
                            <a href="mailto:payment@tiebreaker-ai.com"> payment@tiebreaker-ai.com</a></Typography>
                        {/* <CustomSecondaryButton disableRipple sx={{ marginRight: '16px' }} size="small" variant="contained" className='flex m-2 p-2 rounded'>
                            Payment Method
                        </CustomSecondaryButton> */}


                    </div>
                    <Typography variant="body1" mb={2} fontWeight={600}>Billing Address</Typography>

                    <form autoComplete="off" >
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <InputLabel htmlFor="Optional" className="mb-1">C/O:</InputLabel>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        disabled
                                        id='Optional'
                                        placeholder="Optional"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        value={billingDetails?.co || ''}
                                        onChange={handleChange('co')}
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={12}>
                                <InputLabel htmlFor="AddressLine1" required className="mb-1">Address Line 1:</InputLabel>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        disabled
                                        id='AddressLine1'
                                        placeholder="Address Line 1"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        value={billingDetails?.addressLine1}
                                        onChange={handleChange('addressLine1')}
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={12}>
                                <InputLabel htmlFor="AddressLine2" className="mb-1">Address Line 2:</InputLabel>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        disabled
                                        id='AddressLine2'
                                        placeholder="Address Line 2"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        value={billingDetails?.addressLine2}
                                        onChange={handleChange('addressLine2')}
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <InputLabel htmlFor="Country" required className="mb-1">Country:</InputLabel>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        disabled
                                        id='Country'
                                        placeholder="Country"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        value={billingDetails?.country}
                                        onChange={handleChange('country')}
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <InputLabel htmlFor="Province/State" required className="mb-1">Province/State:</InputLabel>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        disabled
                                        id='Province/State'
                                        placeholder="Province/State"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        value={billingDetails?.state}
                                        onChange={handleChange('state')}
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <InputLabel htmlFor="City" required className="mb-1">City:</InputLabel>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        disabled
                                        id='City'
                                        placeholder="City"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        value={billingDetails?.city}
                                        onChange={handleChange('city')}
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <InputLabel htmlFor="PostalCode" required className="mb-1">Postal Code:</InputLabel>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        disabled
                                        id='Postal ode'
                                        placeholder="Postal Code"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        value={billingDetails?.postalCode}
                                        onChange={handleChange('postalCode')}
                                    />

                                </FormControl>
                            </Grid2>
                        </Grid2>
                    </form>
                </div>
            }
            <hr className="my-8" />
            <Typography className="flex items-center" variant="h6" fontWeight={600}> <BillingIcon /> <span className="ms-2">Support</span></Typography>
            <div className="flex justify-between items-baseline">
                <Typography variant="body1" width={'65%'} mb={3}>For additional support, contact our team at <a href="mailto:support@tiebreaker-ai.com">support@tiebreaker-ai.com</a> or start an enquiry and we will get back to you within 3 business days.
                </Typography>
                {/* <CustomSecondaryButton sx={{ marginRight: '16px' }} size="small" disableRipple className='flex m-2 p-2 rounded'>
                    Start Enquiry
                    <span className="ms-2">
                        <GreaterThenIcon /></span>
                </CustomSecondaryButton> */}


            </div>
            <ResetPasswordDialog open={isResetPasswordDialogOpen}
                onClose={handleResetPasswordCloseDialog}
                onReceiveData={handleResetPasswordDialogData} // Callback to get data from the dialog
                dialogData={ResetPasswordDialogData}
            />
        </div>
    );
}
export default GeneralSettings