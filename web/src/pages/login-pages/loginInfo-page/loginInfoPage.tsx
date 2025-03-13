import { Container, Typography, Button, Box, FormControl, TextField, Grid2 } from '@mui/material';
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { BackgroundContainer } from '../login-page/loginStyle';
import { Colors } from '../../../common/colors';
import { Link, useNavigate } from 'react-router-dom';
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from '../../../common/common.style';

export default function LoginInfoPage() {
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
                        width: 642, // adjust the width to your liking
                        // height: 688, // adjust the height to your liking
                        border: '1px solid #ccc', // adjust the border style to your liking
                        borderRadius: 4, // adjust the border radius to your liking

                        margin: 'auto', // this will center the box horizontally and vertically
                        marginBottom: '140px',
                        background: 'white',
                        padding: '32px 64px 32px 64px'
                    }}
                >
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>Check Your Information</Typography>
                    <Typography variant='body1' mb={6} sx={{ width: '75%' }}>Review the following account details below to ensure the information used to set up your account is correct. Please reach out to our team if these details are incorrect.</Typography>

                    <div className='mb-4'>
                        <Typography variant='body1' sx={{ fontWeight: 600 }} mb={2}>Personal Details</Typography>
                        <Grid2 container spacing={2}>
                            <Grid2 size={6}>
                                <CustomOutlinedInput placeholder='First Name' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={6}>
                                <CustomOutlinedInput placeholder='Last Name' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={12}>
                                <CustomOutlinedInput placeholder='Company Name' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={6}>
                                <CustomOutlinedInput placeholder='Your Role' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={6}>
                                <CustomOutlinedInput placeholder='Company Contact Number' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                        </Grid2>

                    </div>
                    <div>
                        <Typography variant='body1' sx={{ fontWeight: 600 }} mb={2}>Company Address</Typography>
                        <Grid2 container spacing={2}>
                           
                            <Grid2 size={12}>
                                <CustomOutlinedInput placeholder='Address Line 1' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={12}>
                                <CustomOutlinedInput placeholder='Address Line 2' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={6}>
                                <CustomOutlinedInput placeholder='Country' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={6}>
                                <CustomOutlinedInput placeholder='Province/ State' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={6}>
                                <CustomOutlinedInput placeholder='City' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                            <Grid2 size={6}>
                                <CustomOutlinedInput placeholder='Postal Code' id="outlined-basic" size='small' fullWidth />
                            </Grid2>
                        </Grid2>

                    </div>
                    <div className='flex justify-end mt-4'>
                        <CustomSecondaryButton onClick={() => navigate('/login')}  sx={{ marginRight: '16px' }} size="small" disableRipple className='flex m-2 p-2 rounded' > Back</CustomSecondaryButton>
                        <CustomPrimaryButton onClick={() => navigate('/twofactor')} size="small" disableRipple className='flex m-2 p-2 rounded' > Next</CustomPrimaryButton>
                    </div>



                </Box>
            </Container>

        </BackgroundContainer>
    );
}

;