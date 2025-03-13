import { Container, Box, Typography, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Colors } from "../../../common/colors";
import { BackgroundContainer } from "../../login-pages/login-page/loginStyle";
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { GreaterThenIcon } from "../../../assets/icons/greaterThenIcon";
import { CustomPrimaryButton } from "../../../common/common.style";

export default function AllsetPassword() {
    const navigate = useNavigate();

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
                        width: 514,
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        margin: 'auto',
                        marginBottom: '140px',
                        background: 'white',
                        padding: '64px 64px 64px 64px'
                    }}
                >
                    <Typography variant='h5' textAlign={'center'} mb={1} sx={{ fontWeight: 700 }}>You’re all set!</Typography>
                    <Typography variant='body1' textAlign={'center'} mb={6}>
                        Your password has been reset, access your account by signing in with your new password.
                    </Typography>

                    <div className='flex justify-center'>
                        <CustomPrimaryButton onClick={() => navigate('/')}
                            size="small" variant="contained" className='flex m-2 p-2 rounded'>
                            Sign In
                            <span className="ms-3"><GreaterThenIcon fill="white  " />
                            </span>
                        </CustomPrimaryButton>
                    </div>
                </Box>
            </Container>
        </BackgroundContainer>
    );
}