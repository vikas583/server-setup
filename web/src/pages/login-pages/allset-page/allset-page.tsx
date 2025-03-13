import { Box, Button, Container, Typography } from "@mui/material";
import { BackgroundContainer } from "../login-page/loginStyle";
import { Colors } from '../../../common/colors';
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { UserRoles } from "../../../types";
import { CustomPrimaryButton } from "../../../common/common.style";

export default function AllSet() {
    const [redirectTo, setRedirectTo] = useState('')
    const { userData } = useSelector((state: any) => state.auth)
    const navigate = useNavigate()

    useEffect(() => {


        if (userData.role === UserRoles.AccountOwner) {
            setRedirectTo('/dashboard')
        } else {
            setRedirectTo('/projects')
        }

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
                        width: 514,
                       
                        border: '1px solid #ccc',
                        borderRadius: 4,

                        margin: 'auto',
                        marginBottom: '140px',
                        background: 'white',
                        padding: '32px 64px 32px 64px',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>You’re all set!</Typography>
                    <Typography variant='body1' mb={6}>
                        Now that your account has been configured, get started by joining Tiebreaker AI to turn compliance from your enemy to your friend.
                    </Typography>

                    <div className='flex justify-center mt-4'>
                        <CustomPrimaryButton onClick={() => navigate(redirectTo)} disableRipple size="small" className='flex m-2 p-2 rounded' > Open Dashboard</CustomPrimaryButton>
                    </div>
                </Box>
            </Container>
        </BackgroundContainer>
    )
}
