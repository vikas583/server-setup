import { Box, Button, Container, Typography } from "@mui/material";
import { BackgroundContainer } from "../login-page/loginStyle";
import { Colors } from '../../../common/colors';
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { CopyIcon } from "../../../assets/icons/copyIcon";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services";
import { useEffect, useState } from "react";
import { CustomPrimaryButton, CustomTertiaryButton } from "../../../common/common.style";

export default function MFASetup() {
    const [secret, setSecret] = useState('')
    const [barCode, setBarCode] = useState('')
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate()

    const getBarcodeAndSecret = async () => {
        try {
            const response = await authService.mfaSetup()

            if (response.status) {
                setSecret(response.data.secret)
                setBarCode(response.data.qr_code)
            }
        } catch (error) {

        }
    }
    const handleCopy = async () => {
        const textToCopy = document.getElementById('secCode')?.textContent;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 2000);
            });
        }
    };

    useEffect(() => {
        getBarcodeAndSecret()
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
                        width: 642, // adjust the width to your liking
                        // height: 396, // adjust the height to your liking
                        border: '1px solid #ccc', // adjust the border style to your liking
                        borderRadius: 4, // adjust the border radius to your liking

                        margin: 'auto', // this will center the box horizontally and vertically
                        marginBottom: '140px',
                        background: 'white',
                        padding: '32px 64px 32px 64px'
                    }}
                >
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>2-Factor Authentication</Typography>
                    <Typography variant='body1' mb={6} sx={{ width: '75%' }}>To ensure your data is extra secure, we require all users to use 2-factor authentication to login.</Typography>
                    <div className="my-6 flex justify-center">
                        <img
                            src={barCode}
                            alt="QR Code"
                            width="288"
                            height="282"
                            style={{
                                borderRadius: '20px',
                                maxWidth: '100%',
                                height: 'auto'
                            }}
                        />
                    </div>
                    <div className="flex justify-center items-center">
                        <Typography my={4} id="secCode" sx={{ textAlign: 'center' }}>{secret}</Typography>
                        <CustomTertiaryButton onClick={handleCopy} disableRipple>
                            <div className="ms-4 flex items-center"><CopyIcon /> <span className={`ms-1 text-[${Colors.tertiary}]`}>{copied ? 'Copied!' : 'Copy'}</span></div>

                        </CustomTertiaryButton>

                    </div>
                    <Typography variant='body1'>You may use your third-party authentication app of choice (E.g. Microsoft Authenticator, Google Authenticator, or Authy) to scan the QR code or enter the key manually. The 6-digit code from your authenticator will be needed for the next step.</Typography>
                    <div className='flex justify-end mt-4'>
                        <CustomPrimaryButton onClick={() => navigate('/mfa-verification')} disableRipple size="small" className='flex m-2 p-2 rounded' > Next</CustomPrimaryButton>
                    </div>
                </Box>
            </Container>
        </BackgroundContainer>
    )
}
