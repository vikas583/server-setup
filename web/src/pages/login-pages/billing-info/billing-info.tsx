import { Container, Box, Typography, FormControl, InputAdornment, IconButton, Button, Grid2 } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Colors } from "../../../common/colors";
import login from "../login-page/login";
import { BackgroundContainer } from "../login-page/loginStyle";
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { authService } from "../../../services";
import { useEffect, useState } from "react";
import { InitialBillingInfoUpdateRequest } from "../../../types";
import initialRedirection from "../../../utils/initialRedirections";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import { useLoading } from "../../../common/loader/loader-context";
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from "../../../common/common.style";
import { useForm } from "react-hook-form";
import { validateAlphabetic, validateAlphaNumbers } from "../../../common/validations";

export default function BillingInfo() {

    const navigate = useNavigate()
    const { setLoading } = useLoading();

    // const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { register, handleSubmit, setValue, formState: { errors }, } = useForm<InitialBillingInfoUpdateRequest>()

    const finalSubmission = async (formData: InitialBillingInfoUpdateRequest) => {
        const response = await authService.initialBillingInfoUpdate(formData)

        if (response && response.status) {
            const navigateToUrl = initialRedirection(response.nextStep)
            navigate(navigateToUrl)

            setLoading(false)
        } else {
            showGlobalSnackbar('Something went wrong, try again later!', "error")
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };
    const gettingUserInfo = async () => {
        const resp = await authService.getBillingInfo()

        if (resp.status) {
            setValue('companyName', resp?.data?.companyName)
            setValue('addressLine1', resp?.data?.addressLine1)
            setValue('addressLine2', resp?.data?.addressLine2 || "")
            setValue('country', resp?.data?.country)
            setValue('co', resp?.data?.co || "")
            setValue('city', resp?.data?.city)
            setValue('state', resp?.data?.state)
            setValue('postalCode', resp?.data?.postalCode)
        }

    }
    useEffect(() => {
        gettingUserInfo()
    }, [])
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
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>Billing Information</Typography>
                    <Typography variant='body1' mb={6} sx={{ width: '80%' }}>
                        Review the following billing details below as this information will be used for payment going forward. These details can also be changed in account settings.
                    </Typography>

                    <form autoComplete="off" onSubmit={handleSubmit(finalSubmission)} noValidate>
                        <Grid2 container spacing={2}>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='CompanyName'
                                        placeholder="Company Name"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.companyName}
                                        {...register("companyName", {
                                            required: 'Company name is required!',
                                            minLength: {
                                                value: 1,
                                                message: 'Company name must at least 1 characters long',
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: 'Company name must not be more than 30 characters long',
                                            }
                                        })}
                                    />
                                    {errors.companyName && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.companyName.message}
                                        </span>
                                    )}

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='c/o'
                                        placeholder="c/o"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.co}
                                        {...register("co", {
                                            validate: validateAlphabetic,
                                            maxLength: {
                                                value: 30,
                                                message: 'CO must not be more than 30 characters long',
                                            }
                                        })}
                                    />
                                    {errors.co && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.co.message}
                                        </span>
                                    )}
                                </FormControl>
                            </Grid2>

                            <Grid2 size={12}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='AddressLine1'
                                        placeholder="Address Line 1"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.addressLine1}
                                        {...register("addressLine1", {
                                            required: 'Address line is required!',
                                            validate: validateAlphaNumbers,
                                            minLength: {
                                                value: 1,
                                                message: 'Address line must at least 1 characters long',
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: 'Address line must not be more than 50 characters long',
                                            }
                                        })}
                                    />
                                    {errors.addressLine1 && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.addressLine1.message}
                                        </span>
                                    )}
                                </FormControl>

                            </Grid2>
                            <Grid2 size={12}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='AddressLine2'
                                        placeholder="Address Line 2"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.addressLine2}
                                        {...register("addressLine2", {
                                            validate: validateAlphaNumbers,
                                            maxLength: {
                                                value: 50,
                                                message: 'Address line must not be more than 50 characters long',
                                            }
                                        })}
                                    />
                                    {errors.addressLine2 && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.addressLine2.message}
                                        </span>
                                    )}
                                </FormControl>

                            </Grid2>

                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='Country'
                                        placeholder="Country"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.country}
                                        {...register("country", {
                                            required: 'Country is required!',
                                            validate: validateAlphabetic,
                                            minLength: {
                                                value: 1,
                                                message: 'Country must at least 1 characters long',
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: 'Country must not be more than 30 characters long',
                                            }
                                        })}
                                    />
                                    {errors.country && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.country.message}
                                        </span>
                                    )}
                                </FormControl>

                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='ProvinceState'
                                        placeholder="Province/ State"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.state}
                                        {...register("state", {
                                            required: 'State is required!',
                                            validate: validateAlphabetic,
                                            minLength: {
                                                value: 2,
                                                message: 'State must at least 2 characters long',
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: 'State must not be more than 30 characters long',
                                            }
                                        })}
                                    />
                                    {errors.state && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.state.message}
                                        </span>
                                    )}

                                </FormControl>

                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='City'
                                        placeholder="City"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.city}
                                        {...register("city", {
                                            required: 'city is required!',
                                            validate: validateAlphabetic,
                                            minLength: {
                                                value: 1,
                                                message: 'City must at least 1 characters long',
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: 'City must not be more than 30 characters long',
                                            }
                                        })}
                                    />
                                    {errors.city && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.city.message}
                                        </span>
                                    )}

                                </FormControl>

                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='PostalCode'
                                        placeholder="Postal Code"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        error={!!errors.postalCode}
                                        {...register("postalCode", {
                                            required: 'postalCode is required!',
                                            validate: validateAlphaNumbers,
                                            minLength: {
                                                value: 5,
                                                message: 'Postal code must at least 5 characters long',
                                            },
                                            maxLength: {
                                                value: 6,
                                                message: 'Postal code must not be more than 6 characters long',
                                            }
                                        })}
                                    />
                                    {errors.postalCode && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.postalCode.message}
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
                                className='flex m-2 p-2 rounded' >
                                Next
                            </CustomPrimaryButton>
                        </div>
                    </form>

                </Box>
            </Container>

        </BackgroundContainer>
    );
}