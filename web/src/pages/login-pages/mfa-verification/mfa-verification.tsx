import { Container, Typography, Button, Box } from '@mui/material';
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { BackgroundContainer } from '../login-page/loginStyle';
import { Colors } from '../../../common/colors';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SuccessIcon } from '../../../assets/icons/successIcon';
import { authService } from '../../../services';
import { useDispatch } from 'react-redux';
import { createContext } from '../../../features/auth/authSlice';
import { showGlobalSnackbar } from '../../../common/snackbarProvider';
import { useLoading } from '../../../common/loader/loader-context';
import { useLogout } from '../../../common/logout';
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from '../../../common/common.style';
import { UserInitialSteps } from '../../../types';
import initialRedirection from '../../../utils/initialRedirections';


export default function MFAVerification() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { setLoading } = useLoading();
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [isOtpCorrect, setIsOtpCorrect] = useState<boolean>(true)
    const [verifySuccess, setVerifySuccess] = useState<boolean>(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number): void => {
        const value = e.target.value;

        if (/^\d$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);


            if (index < 5 && value) {
                const nextField = document.getElementById(`otp-${index + 1}`);
                if (nextField) {
                    nextField.focus();
                }
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, index: number): void => {
        const newOtp = [...otp];
        if (e.key === 'Backspace') {
            if (otp[index]) {
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {

                const prevField = document.getElementById(`otp-${index - 1}`);
                if (prevField) {
                    prevField.focus();
                }
            }
        }
        if (e.key === 'Enter') {
            handleVerify()
        }
    };
    const isOtpComplete = otp.every((digit) => digit !== '');

    const handleMFAVerification = async (token: string) => {
        setLoading(true)

        try {
            const isUser: string | null = localStorage.getItem('custFirstTime')
            console.log(typeof (isUser), 'isUser');

            if (isUser === 'true') {
                console.log('uyes');
                const response = await authService.mfaVerificationFirstTime(token)
                if (response.status) {

                    setIsOtpCorrect(true)
                    setVerifySuccess(true)
                    
                    const navigateToUrl = initialRedirection(response?.nextStep)
                    navigate(navigateToUrl)
                }
                else {

                    setVerifySuccess(false)
                    setIsOtpCorrect(false)
                }
            } else {
                const response = await authService.mfaVerification(token)
                if (response.status) {
                    // console.log('hiiiiii');

                    setIsOtpCorrect(true)
                    setVerifySuccess(true)
                    localStorage.removeItem('tempToken')

                    dispatch(createContext({ userData: response?.data?.user, accessToken: response?.data?.token }))

                        if (response.data.nextStep === UserInitialSteps.SETUP_DONE) {
                            navigate('/thankyou')
                        } else {
                            navigate('/dashboard')
                        }
                } else {
                    setVerifySuccess(false)
                    setIsOtpCorrect(false)
                }
            }

            setLoading(false)

        } catch (err: any) {
            console.log(err);

            if (err.status === 403) {
                localStorage.clear()
                navigate('/')
            }

            setLoading(false)
            showGlobalSnackbar(err.response?.data?.msg)
            setIsOtpCorrect(false)
        }
    }

    const handleVerify = () => {

        if (isOtpComplete) {
            // Perform OTP verification here
            const token = otp.join('')
            handleMFAVerification(token)
        }
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

                        border: '1px solid #ccc',
                        borderRadius: 4,
                        margin: 'auto',
                        marginBottom: '140px',
                        background: 'white',
                        padding: '32px 64px 32px 64px'
                    }}
                >
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>2-Factor Authentication</Typography>
                    <Typography variant='body1' mb={6} sx={{ width: '75%' }}>To finish setup, enter the 6-digit code provided by your authentication app.</Typography>
                    <Box display="flex" justifyContent="center" gap={2} mb={2}>
                        {otp.map((value: string, index: number) => (
                            <CustomOutlinedInput
                                className='rounded-lg'
                                key={index}
                                id={`otp-${index}`}
                                value={value}
                                tabIndex={0}
                                autoFocus={index === 0}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
                                sx={{
                                    width: 50, background: isOtpCorrect ? '' : Colors.redLightest,
                                    border: isOtpCorrect ? '' : `${Colors.redBorder} solid 1px`,
                                }} />
                        ))}
                    </Box>
                    {!isOtpCorrect &&
                        <p className='text-red-600 text-center block'>Code is incorrect or expired. Try again.</p>
                    }
                    {verifySuccess &&
                        <div className='flex justify-center items-center'>
                            <SuccessIcon />
                            <div className={`text-[${Colors.tertiary}] text-center block ms-2`}>
                                Setup Successful
                            </div>

                        </div>
                    }
                    <Typography variant='body1' my={6} >For issues with setup, view our <Link to={"/"}>troubleshooting guide.</Link> </Typography>
                    <div className='flex justify-end mt-4'>
                        <CustomSecondaryButton onClick={() => navigate(`/login`)} sx={{ marginRight: '16px' }} size="small" className='flex m-2 p-2 rounded' >
                            Back
                        </CustomSecondaryButton>

                        {!verifySuccess ?
                            <CustomPrimaryButton disableRipple size="small" className={`flex m-2 p-2 rounded ${!isOtpComplete ? 'diabled-button' : ''}`}
                                onClick={handleVerify}
                                disabled={!isOtpComplete} >Verify
                            </CustomPrimaryButton>
                            :
                            <CustomPrimaryButton disableRipple onClick={() => navigate(`/thankyou`)} sx={{ background: Colors.tertiary, fontWeight: 600, fontSize: '14px', }} size="small" className={`flex m-2 p-2 rounded ${!isOtpComplete ? 'diabled-button' : ''}`}
                                disabled={!isOtpComplete} >Next
                            </CustomPrimaryButton>
                        }
                    </div>

                </Box>
            </Container>

        </BackgroundContainer>
    );
}

