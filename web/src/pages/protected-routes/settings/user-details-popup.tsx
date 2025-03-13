import { Dialog, DialogTitle, Typography, IconButton, DialogContent, FormControl, Grid2, InputLabel, Button, DialogActions, MenuItem } from "@mui/material"
import React, { useEffect, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { Colors } from "../../../common/colors";
import { UserCreateFormData, UserRoleData } from "../../../types";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../common/loader/loader-context";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import userService from "../../../services/userService";
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton, CustomStyledSelect } from "../../../common/common.style";
import { Controller, useForm } from "react-hook-form";
import { validateAlphabetic } from "../../../common/validations";
import { replaceUnderscoresWithSpaces } from "../../../utils/stringAvatar";
interface DynamicDialogProps {
    open: boolean;
    onClose: () => void;
    onReceiveData: any,
    dialogData: any;
    isAddOrEdit: string
}
const initialData: UserCreateFormData = {
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    userId: NaN
};

const UserDetailsPopup = ({ open, onClose, onReceiveData, dialogData, isAddOrEdit }: DynamicDialogProps) => {
    const navigate = useNavigate()
    const [roleListArray, setRoleListArray] = useState<UserRoleData[]>([]);
    const { setLoading } = useLoading();
    const { register, handleSubmit, setValue, formState: { errors }, control, clearErrors } = useForm<UserCreateFormData>()



    useEffect(() => {
        setValue('firstName', '')
        setValue('lastName', '')
        setValue('email', '')
        setValue('roleId', '')
        clearErrors('firstName')
        clearErrors('lastName')
        clearErrors('email')
        clearErrors('roleId')
    }, [open])

    const finalSubmission = async (formData: UserCreateFormData) => {
        try {
            setLoading(true)
            let response
            if (isAddOrEdit === 'add') {
                response = await userService.createUser(formData)
            } else {
                response = await userService.updateUser(formData)
            }

            if (response && response.status) {
                showGlobalSnackbar(response.msg, "success")
                onReceiveData(true)
                onClose()
            }
            setLoading(false)
        } catch (error: any) {
            console.log(error.response.data.msg)
            showGlobalSnackbar(error.response.data.msg)
        }



    };
    useEffect(() => {
        roleList()
    }, [])
    useEffect(() => {
        let roleId = roleListArray.find(item => item.name === dialogData?.roleId)?.id
        setValue('firstName', dialogData?.firstName)
        setValue('lastName', dialogData?.lastName)
        setValue('email', dialogData?.email)
        setValue('roleId', roleId || '')
        setValue('userId', dialogData?.userId)

    }, [dialogData])
    const roleList = async () => {
        const response = await userService.roleList();
        if (response?.status) {
            setRoleListArray(response?.data)
        }
    }
    return (
        <>
            <React.Fragment>
                <Dialog
                    maxWidth={'sm'}
                    fullWidth={true}
                    open={open}
                    onClose={onClose}
                    aria-labelledby="responsive-dialog-title"
                >
                    <DialogTitle id="responsive-dialog-title" sx={{ pb: 0 }}>
                        <div className="flex items-center mb-3">
                            <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5 0.625C16.2832 0.625 21 5.3418 21 11.125C21 16.9492 16.2832 21.625 10.5 21.625C4.67578 21.625 0 16.9492 0 11.125C0 5.3418 4.67578 0.625 10.5 0.625ZM10.5 19.6562C15.1758 19.6562 19.0312 15.8418 19.0312 11.125C19.0312 6.44922 15.1758 2.59375 10.5 2.59375C5.7832 2.59375 1.96875 6.44922 1.96875 11.125C1.96875 15.8418 5.7832 19.6562 10.5 19.6562ZM12.1406 14.4062C12.6738 14.4062 13.125 14.8574 13.125 15.3906C13.125 15.9648 12.6738 16.375 12.1406 16.375H8.85938C8.28516 16.375 7.875 15.9648 7.875 15.3906C7.875 14.8574 8.28516 14.4062 8.85938 14.4062H9.51562V11.7812H9.1875C8.61328 11.7812 8.20312 11.3711 8.20312 10.7969C8.20312 10.2637 8.61328 9.8125 9.1875 9.8125H10.5C11.0332 9.8125 11.4844 10.2637 11.4844 10.7969V14.4062H12.1406ZM10.5 8.5C9.76172 8.5 9.1875 7.92578 9.1875 7.1875C9.1875 6.49023 9.76172 5.875 10.5 5.875C11.1973 5.875 11.8125 6.49023 11.8125 7.1875C11.8125 7.92578 11.1973 8.5 10.5 8.5Z" fill="#366475" />
                            </svg>
                            <Typography variant='body1' > <span className="ms-3 font-semibold">{"User Details"}</span></Typography>

                        </div>
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={(theme) => ({
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        })}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent >
                        <form autoComplete="off" onSubmit={handleSubmit(finalSubmission)} noValidate>
                            <Grid2 container spacing={2}>
                                <Grid2 size={12}>
                                    <InputLabel htmlFor="userEmail" required className="mb-2">User Email:</InputLabel>

                                    <FormControl className="w-full">
                                        <CustomOutlinedInput
                                            id='userEmail'
                                            placeholder="User Email:"
                                            size='small'
                                            error={!!errors.email}
                                            {...register("email", {
                                                required: 'email is required!',
                                                validate: {
                                                    matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                                        "Email address must be a valid address",
                                                }
                                            })}
                                            required
                                        />
                                        {errors.email && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {errors.email.message}
                                            </span>
                                        )}

                                    </FormControl>
                                </Grid2>
                                <Grid2 size={6}>
                                    <InputLabel htmlFor="firstName" required className="mb-2">First Name:</InputLabel>

                                    <FormControl className="w-full">
                                        <CustomOutlinedInput
                                            id='firstName'
                                            placeholder="John"
                                            size='small'
                                            className=' bg-[#F0F1EC]'
                                            error={!!errors.firstName}
                                            {...register("firstName", {
                                                required: 'First Name is required!',
                                                validate: validateAlphabetic,
                                                maxLength: {
                                                    value: 30,
                                                    message: 'First name must not be more than 30 characters long',
                                                }
                                            })}
                                            required
                                        />
                                        {errors.firstName && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {errors.firstName.message}
                                            </span>
                                        )}

                                    </FormControl>
                                </Grid2>
                                <Grid2 size={6}>
                                    <InputLabel htmlFor="lastName" required className="mb-2">Last Name:</InputLabel>

                                    <FormControl className="w-full">
                                        <CustomOutlinedInput
                                            id='lastName'
                                            placeholder="Deo"
                                            size='small'
                                            className=' bg-[#F0F1EC]'
                                            error={!!errors.lastName}
                                            {...register("lastName", {
                                                required: 'Last Name is required!',
                                                validate: validateAlphabetic,
                                                maxLength: {
                                                    value: 30,
                                                    message: 'Last name must not be more than 30 characters long',
                                                }
                                            })}
                                            required
                                        />
                                        {errors.lastName && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {errors.lastName.message}
                                            </span>
                                        )}

                                    </FormControl>
                                </Grid2>
                                <Grid2 size={12}>
                                    <InputLabel htmlFor="userRole" required className="mb-2">User Role:</InputLabel>
                                    <FormControl fullWidth error={!!errors.roleId}>
                                        <Controller
                                            name="roleId"
                                            control={control}
                                            defaultValue="" // Ensure a default value is set
                                            rules={{ required: "User role is required" }}
                                            render={({ field }) => (
                                                <CustomStyledSelect
                                                    {...field}
                                                    id="demo-simple-select"
                                                    size="small"
                                                    displayEmpty
                                                >
                                                    <MenuItem value="" disabled>
                                                        Please select role
                                                    </MenuItem>
                                                    {roleListArray?.map((row) => (
                                                        <MenuItem key={row.id} value={row.id}>
                                                            {replaceUnderscoresWithSpaces(row.name)}
                                                        </MenuItem>
                                                    ))}
                                                </CustomStyledSelect>
                                            )}
                                        />
                                        {errors.roleId && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {errors.roleId.message}
                                            </span>
                                        )}
                                    </FormControl>
                                </Grid2>
                            </Grid2>
                            <DialogActions>
                                <div className='flex justify-end mt-4'>
                                    <CustomSecondaryButton sx={{ marginRight: '16px' }} size="small" disableRipple className='flex m-2 p-2 rounded' onClick={onClose}>Cancel</CustomSecondaryButton>
                                    <CustomPrimaryButton size="small" disableRipple className='flex m-2 p-2 rounded' type='submit' > Save</CustomPrimaryButton>
                                </div>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        </>
    )
}
export default React.memo(UserDetailsPopup) 