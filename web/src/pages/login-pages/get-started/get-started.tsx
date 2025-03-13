import { Container, Box, Typography, FormControl, InputAdornment, IconButton, Button, Grid2, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Colors } from "../../../common/colors";
import login from "../login-page/login";
import { BackgroundContainer } from "../login-page/loginStyle";
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { useEffect, useState } from "react";
import { authService } from "../../../services";
import { useLoading } from "../../../common/loader/loader-context";
import initialRedirection from "../../../utils/initialRedirections";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import { UserInfoFormData } from "../../../types";
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from "../../../common/common.style";
import { useForm } from "react-hook-form";
import { validateAlphabetic, validateAlphabeticWithSpace } from "../../../common/validations";

const initialData: UserInfoFormData = {
    firstName: '',
    lastName: '',
    position: '',
    email: ''
};


export default function GetStarted() {

    // initialUserInfoSetup - api
    //redirect to billing info or setpass
    const navigate = useNavigate()
    const [formData, setFormData] = useState<UserInfoFormData>(initialData);
    // const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { setLoading } = useLoading();
    const { register, handleSubmit, setValue, formState: { errors }, control, clearErrors } = useForm<UserInfoFormData>()



    const finalSubmission = async (formData: UserInfoFormData) => {
        try {

            setLoading(true)
            const response = await authService.initialUserInfoSetup(formData)

            if (response && response.status) {
                const navigateToUrl = initialRedirection(response.nextStep)
                navigate(navigateToUrl)

                setLoading(false)
            } else {
                showGlobalSnackbar('Something went wrong, try again later!', "error")
            }



        } catch (err: any) {

            setLoading(false)
        }
    };
    const gettingUserInfo = async () => {
        const resp = await authService.getUserInfo()

        if (resp?.status === 200 || resp?.status === true) {
            setValue('firstName', resp?.data?.firstName)
            setValue('lastName', resp?.data?.lastName)
            setValue('email', resp?.data?.email)
            setValue('position', resp?.data?.position)
        } else if (resp.status == 403) {
            localStorage.clear()
            navigate('/')
        }

    }
    useEffect(() => {
        gettingUserInfo()
    }, [])
    const handleGoBack = () => {
        navigate(-1);
    };
    return (
        <BackgroundContainer>
            <Container className="container" >
                <div>
                    <div className='flex justify-center' style={{ marginBottom: '64px' }}>
                        <img src={LogoWhite} alt="" height={'91px'} width={'371px'} />
                    </div>

                </div>
                <Box
                    sx={{
                        width: 642,
                        minHeight: 396,
                        border: '1px solid #ccc',
                        borderRadius: 4,

                        margin: 'auto',
                        marginBottom: '140px',
                        background: 'white',
                        padding: '32px 64px 32px 64px'
                    }}
                >
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>Let’s Get Started</Typography>
                    <Typography variant='body1' mb={6} sx={{ width: '80%' }}>
                        To get started, verify your login credentials that have been provided to our team.
                        If you email is incorrect, please reach out to  <a href="mailto:support@tiebreaker-ai.com"> support@tiebreaker-ai.com</a> directly.
                    </Typography>

                    <form autoComplete="off" onSubmit={handleSubmit(finalSubmission)} noValidate>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='email'
                                        placeholder="john.doe@trident.com"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.email}
                                        {...register("email", {
                                            required: 'email is required!',
                                            validate: {
                                                matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                                    "Email address must be a valid address",
                                            }
                                        })}
                                        disabled
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='John'
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
                                    />
                                    {errors.firstName && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.firstName.message}
                                        </span>
                                    )}

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='Doe'
                                        placeholder="Doe"
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
                                    />
                                    {errors.lastName && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.lastName.message}
                                        </span>
                                    )}

                                </FormControl>

                            </Grid2>
                            <Grid2 size={12}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='SeniorComplianceCoordinator'
                                        placeholder="Senior Compliance Coordinator"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.position}
                                        {...register("position", {
                                            required:false,
                                            validate: validateAlphabeticWithSpace,
                                            minLength: {
                                                value: 0,
                                                message: '',
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: 'Position must not be more than 30 characters long',
                                            }
                                        })}
                                    />
                                    {errors.position && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.position.message}
                                        </span>
                                    )}

                                </FormControl>

                            </Grid2>
                        </Grid2>

                        <div className='flex justify-end mt-3'>
                            <CustomSecondaryButton onClick={handleGoBack} sx={{ marginRight: '16px' }} size="small" disableRipple className='flex m-2 p-2 rounded' >
                                Back
                            </CustomSecondaryButton>
                            <CustomPrimaryButton
                                type='submit'
                                size="small"
                                disableRipple
                                className='flex m-2 p-2 rounded'
                            >
                                Next
                            </CustomPrimaryButton>
                        </div>
                    </form>

                </Box>
            </Container>

        </BackgroundContainer>
    );
}