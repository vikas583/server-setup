import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Container, Box, Typography, FormControl, InputAdornment, IconButton, Button, Grid2 } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Colors } from "../../../common/colors";
import login from "../login-page/login";
import { BackgroundContainer } from "../login-page/loginStyle";
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from "../../../common/common.style";
export default function ContactInfo() {
    const navigate = useNavigate()

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
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>Check Your Information</Typography>
                    <Typography variant='body1' mb={6} sx={{ width: '80%' }}>
                        Review the following account details below to ensure the information used to set up your account is correct.
                        Please <Link to={'/'}>reach out</Link> to our team if these details are incorrect.
                    </Typography>
                    <Typography variant='body1' mb={1} color={Colors.greySecondary} fontWeight={600}>Personal Details</Typography>

                    <form autoComplete="off" >
                        <Grid2 container spacing={2}>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='firstName'
                                        placeholder="First Name"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='LastName'
                                        placeholder="Last Name"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={12}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='LastName'
                                        placeholder="Last Name"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={12}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='CompanyName'
                                        placeholder="Company Name"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='YourRole'
                                        placeholder="Your Role"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='CompanyContactNumber'
                                        placeholder="Company Contact Number"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                            </Grid2>
                            <Grid2 size={12}>
                                <Typography variant='body1' color={Colors.greySecondary} fontWeight={600}>Company Address</Typography>

                            </Grid2>
                            <Grid2 size={12}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='AddressLine1'
                                        placeholder="Address Line 1"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                                
                            </Grid2>
                            <Grid2 size={12}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='AddressLine2'
                                        placeholder="Address Line 2"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                                
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='Country'
                                        placeholder="Country"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                                
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='ProvinceState'
                                        placeholder="Province/ State"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>
                                
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='City'
                                        placeholder="City"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>

                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='PostalCode'
                                        placeholder="Postal Code"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                    />

                                </FormControl>

                            </Grid2>
                        </Grid2>

                        <div className='flex justify-end mt-3'>
                            <CustomSecondaryButton onClick={() => navigate('/login')} sx={{marginRight: '16px' }} size="small" disableRipple className='flex m-2 p-2 rounded' >
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