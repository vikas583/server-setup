import { useState } from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Colors } from "../../../common/colors";
import { BackgroundContainer } from "../../login-pages/login-page/loginStyle";
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from "../../../common/common.style";

export default function ResetPassword() {
    const [email, setEmail] = useState('')
    const navigate = useNavigate()

    const handleNext = () => {
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/

        if (!regex.test(email)) {
            showGlobalSnackbar('Please enter a valid email address', 'warning')
            return
        }

        navigate('/recovery-method', {
            state: {
                email
            }
        })
    }
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
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        margin: 'auto',
                        marginBottom: '140px',
                        background: 'white',
                        padding: '32px 64px 32px 64px'
                    }}
                >
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>Reset your password</Typography>
                    <Typography variant='body1' mb={6} sx={{ width: '85%' }}>To reset your password, enter your email to begin password recovery process.</Typography>
                    <CustomOutlinedInput
                        placeholder='john.doe@company.com'
                        size='small'
                        fullWidth
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />
                    <Typography variant='body1' mt={2} sx={{ width: '85%' }}>Remember your password? <Link to={"/"}>Sign in</Link></Typography>
                    <div className='flex justify-end mt-4'>
                        <CustomSecondaryButton onClick={() => navigate('/info')} disableRipple sx={{ marginRight: '16px'}} size="small" className='flex m-2 p-2 rounded' > Cancel</CustomSecondaryButton>
                        <CustomPrimaryButton
                            size="small"
                            disableRipple
                            className='flex m-2 p-2 rounded'
                            onClick={() => handleNext()}
                        >
                            Reset Password
                        </CustomPrimaryButton>
                    </div>
                </Box>
            </Container>
        </BackgroundContainer>
    );
}