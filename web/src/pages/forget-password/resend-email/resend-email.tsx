import { Container, Box, Typography, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Colors } from "../../../common/colors";
import { BackgroundContainer } from "../../login-pages/login-page/loginStyle";
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { GreaterThenIcon } from "../../../assets/icons/greaterThenIcon";
import { ResendIcon } from "../../../assets/icons/resend";
import { CustomPrimaryButton } from "../../../common/common.style";

export default function ResendEmail() {
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
                        width: 514,
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        margin: 'auto',
                        marginBottom: '140px',
                        background: 'white',
                        padding: '64px 64px 64px 64px'
                    }}
                >
                    <Typography variant='h5' textAlign={'center'} mb={1} sx={{ fontWeight: 700 }}>Check your Inbox!</Typography>
                    <Typography variant='body1' textAlign={'center'} mb={6}>
                        Instructions have been sent to the email you provided. If it is associated with your account, you will receive an email with instructions to reset your password. 
                    </Typography>

                    <div className='flex justify-center'>
                        <CustomPrimaryButton onClick={() => navigate('/')} disableRipple
                            size="small" className='flex m-2 p-2 rounded'>Resend Email <span className="ms-2"><ResendIcon /></span></CustomPrimaryButton>
                    </div>
                </Box>
            </Container>
        </BackgroundContainer>
    );
}