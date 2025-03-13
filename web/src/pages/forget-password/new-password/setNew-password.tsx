import { Container, Box, Typography, Button, IconButton, InputAdornment, LinearProgress, FormControl } from "@mui/material";
import { Colors } from "../../../common/colors";
import { BackgroundContainer } from "../../login-pages/login-page/loginStyle";
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { useEffect, useState } from "react";
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserSetPasswordFormData } from "../../../types";
import { useLoading } from "../../../common/loader/loader-context";
import { authService } from "../../../services";
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from "../../../common/common.style";

export default function SetNewPassword() {
    const [searchParams] = useSearchParams();
    const [token] = useState(searchParams.get('token'));
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
    const [formData, setFormData] = useState<UserSetPasswordFormData>({ password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState([false, false, false, false]); // Array to track each criterion
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { setLoading, loading } = useLoading()
    const navigate = useNavigate();
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const checkPasswordStrength = (password: string) => {
        const newStrength = [false, false, false, false]; // Reset strength array
        // Check for at least one uppercase letter
        if (/[A-Z]/.test(password)) {
            newStrength[0] = true; // Second progress bar fills for uppercase
        }

        // Check for at least one lowercase letter
        if (/[a-z]/.test(password)) {
            newStrength[1] = true; // Third progress bar fills for lowercase
        }

        // Check for at least one number
        if (/[0-9]/.test(password)) {
            newStrength[2] = true; // Fourth progress bar fills for number
        }

        // Check for at least one special character
        if (/[^A-Za-z0-9]/.test(password) && password.length >= 8) {
            newStrength[3] = true; // Update fourth progress bar if special character is present
        }

        setStrength(newStrength);
    };

    const handleChange = (field: keyof UserSetPasswordFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        checkPasswordStrength(value);
        setFormData((prev) => ({ ...prev, [field]: value }));
    };


    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleGoBack = () => {
        navigate(-1);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (loading || !token || !isTokenValid) return;

        if (validateForm()) {
            const checkStr = strength.every(value => value === true);

            if (!checkStr) {
                setErrors((prev) => ({ ...prev, ['strength']: "Please check password strength" }));
                return
            }

            if (formData.password === formData.confirmPassword) {
                setLoading(true)
                try {
                    await authService.resetPassword(token, formData.password)
                    navigate('/allset', {
                        replace: true
                    })
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false)
                }
            } else {
                setErrors((prev) => ({ ...prev, ['notMatch']: "Password doesn't match!" }));
            }
        }
    };

    useEffect(() => {
        async function check() {
            if (typeof isTokenValid === 'boolean') {
                return
            }

            if (!token) {
                setIsTokenValid(false)
                return
            }

            try {
                setLoading(true)
                await authService.validatePasswordResetToken(token)
                setIsTokenValid(true)
            } catch (error) {
                setIsTokenValid(false)
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        check()
    }, [isTokenValid, token, setLoading]);

    return (
        <BackgroundContainer>
            <Container className="container">
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
                    <form autoComplete="off" onSubmit={handleSubmit} noValidate>
                        <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>Set New Password</Typography>
                        {isTokenValid === false ?
                            <Typography variant='body1' mb={6} sx={{ width: '85%' }}>
                                The password reset link is invalid or has expired. Please request a new password reset.
                            </Typography>
                            :
                            <Typography variant='body1' mb={6} sx={{ width: '85%' }}>
                                Now that your account details have been confirmed, set your password below. It must meet password strength requirements to be used.
                            </Typography>
                        }
                        <div>
                        </div>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            {strength.map((isMet, index) => (
                                <Box key={index} sx={{ flex: 1, mx: 0.5 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={isMet ? 100 : 0}
                                    />
                                </Box>
                            ))}
                        </Box>
                        <div className="mb-3 mt-2">
                            <FormControl className="w-full">
                                <CustomOutlinedInput sx={{ background: '#F0F1EC' }} placeholder='New Password' required id="password" size='small' fullWidth
                                    name="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange('password')}
                                    error={!!errors.password}
                                    disabled={loading || !isTokenValid}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                onMouseUp={handleMouseUpPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                                {!!errors.password &&
                                    <Typography variant="body2" color={Colors.redBorder}>{errors.password}</Typography>
                                }
                            </FormControl>

                        </div>
                        <div className="mb-3">
                            <FormControl className="w-full">
                                <CustomOutlinedInput
                                    placeholder='Confirm Password' required id="confirm-password" size='small' fullWidth
                                    name="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    type="password"
                                    error={!!errors.confirmPassword}
                                    disabled={loading || !isTokenValid}
                                />
                                {!!errors.confirmPassword &&
                                    <Typography variant="body2" color={Colors.redBorder}>{errors.confirmPassword}</Typography>
                                }
                            </FormControl>
                        </div>
                        {errors.notMatch &&
                            <Typography variant="body2" color={Colors.redBorder}>{errors.notMatch}</Typography>
                        }
                        {errors.strength &&
                            <Typography variant="body2" color={Colors.redBorder}>{errors.strength}</Typography>
                        }
                        <div className='flex justify-end pt-6'>
                            <CustomSecondaryButton
                                onClick={handleGoBack}
                                sx={{ marginRight: '16px' }}
                                size="small"
                                disableRipple
                                className='flex m-2 p-2 rounded'
                                disabled={loading}
                            >
                                Back
                            </CustomSecondaryButton>
                            <CustomPrimaryButton
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading || !isTokenValid}
                                size="small"
                                disableRipple
                                className='flex m-2 p-2 rounded'
                            >
                                Reset
                            </CustomPrimaryButton>
                        </div>

                    </form>
                </Box>
            </Container>
        </BackgroundContainer>
    );
}