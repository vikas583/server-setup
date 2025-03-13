import { useEffect, useState } from "react";
import { Container, Box, Typography, Button, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Colors } from "../../../common/colors";
import { BackgroundContainer } from "../../login-pages/login-page/loginStyle";
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import authService from '../../../services/authService'
import { CustomPrimaryButton, CustomSecondaryButton } from "../../../common/common.style";

export default function RecoveryMethod() {
    const navigate = useNavigate()
    const { email } = (useLocation().state || {}) as { email?: string };
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/

        if (!email || !regex.test(email)) {
            setIsEmailValid(false)
            return
        }

        setIsEmailValid(true)
    }, [email])

    useEffect(() => {
        if (isEmailValid === false) {
            showGlobalSnackbar('Please enter a valid email address', 'warning')
        }
    }, [isEmailValid])

    const handleNext = async () => {
        if (!selectedOption || !isEmailValid || loading || !email) {
            return
        }

        if (selectedOption === 'email') {
            // make api call
            try {
                setLoading(true)
                await authService.sendPasswordResetEmail(email)
                navigate('/resend-email', {
                    replace: true
                })
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        } else if (selectedOption === 'app') {
            // navigate to next screen with email set to state
            navigate('/reset-password-mfa', {
                state: {
                    email
                }
            })
        }
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
                        width: 662,
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        margin: 'auto',
                        marginBottom: '140px',
                        background: 'white',
                        padding: '32px 64px 32px 64px'
                    }}
                >
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>Recovery method</Typography>
                    <Typography variant='body1' mb={5}>Select one of the options below to recover your password.</Typography>
                    <FormControl>
                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            defaultValue=""
                            name="radio-buttons-group"
                        >
                            <FormControlLabel value="email" control={<Radio />} label="Email Recovery" onChange={() => setSelectedOption('email')} />
                            <FormControlLabel value="app" control={<Radio />} label="Authentication App (Requires access to your authentication app)" onChange={() => setSelectedOption('app')} />
                        </RadioGroup>
                    </FormControl>
                    <Typography variant='body1' mt={5}>If neither of these options are available to you, please reach out to our support team at <Link to={'/'}>support@tiebreaker-ai.com</Link> to recover your account.</Typography>
                    <div className='flex justify-end mt-4'>
                        <CustomSecondaryButton onClick={() => navigate('/info')} sx={{ marginRight: '16px' }} size="small" disableRipple className='flex m-2 p-2 rounded'>Back</CustomSecondaryButton>
                        <CustomPrimaryButton
                           disableRipple
                            size="small"
                            className='flex m-2 p-2 rounded'
                            disabled={!isEmailValid || selectedOption === null || loading}
                            onClick={() => handleNext()}
                        >
                            Next
                        </CustomPrimaryButton>
                    </div>
                </Box>
            </Container>
        </BackgroundContainer>
    );
}