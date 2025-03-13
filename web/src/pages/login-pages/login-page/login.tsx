import { Container, Typography, Button, Box, FormControl, IconButton, InputAdornment } from '@mui/material';
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { BackgroundContainer } from './loginStyle';
import { Colors } from '../../../common/colors';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form'
import { LoginFormInputs, UserInitialSteps } from '../../../types';
import { useSelector } from 'react-redux';
import { authService } from '../../../services';
import { useLoading } from '../../../common/loader/loader-context';
import { showGlobalSnackbar } from '../../../common/snackbarProvider';
import initialRedirection from '../../../utils/initialRedirections';
import { CustomOutlinedInput, CustomPrimaryButton } from '../../../common/common.style';


function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>()
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { setLoading } = useLoading();
    const authenticationStatus = useSelector((state: any) => state.auth.authenticated)

    useEffect(() => {
        if (authenticationStatus) {
            navigate('/dashboard')
        }
    }, [])
    useEffect(() => {
        setLoading(false)
    }, [])

    const login = async (data: LoginFormInputs) => {
        try {
            setLoading(true)
            const response = await authService.login(data)
            if (('nextStep' in response && response.nextStep)) {
                localStorage.setItem('tempToken', response.tempToken)
                localStorage.setItem('custFirstTime', (response.isFirstLogin).toString())
                const navigateToUrl = initialRedirection(response.nextStep)
                navigate(navigateToUrl)

                setLoading(false)
            } else {
                setLoading(false)

                showGlobalSnackbar('Something went wrong, try again later!', "error")
            }
            setLoading(false)
        }
        catch (err: any) {
            setLoading(false)
            showGlobalSnackbar('Something went wrong, try again later!', "error")
            setError(err.response.data.msg)
        }
    }


    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
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
                        minHeight: 396,
                        border: '1px solid #ccc',
                        borderRadius: 4,

                        margin: 'auto',
                        marginBottom: '140px',
                        background: 'white',
                        padding: '32px 64px 32px 64px'
                    }}
                >
                    <Typography variant='h5' mb={1} sx={{ fontWeight: 700 }}>Let’s Get Started</Typography>
                    <Typography variant='body1' mb={6} sx={{ width: '75%' }}>Welcome to Tiebreaker AI! To get started, enter your login credentials that have been provided by our team.</Typography>

                    <form onSubmit={handleSubmit(login)} autoComplete="off" >
                        <FormControl sx={{ width: '100%', marginBottom: '16px' }}>
                            <CustomOutlinedInput
                                id='email'
                                placeholder="Email"
                                size='small'
                                // className=' bg-[#F0F1EC] custom-input'
                                autoFocus
                                error={errors.email ? true : false}
                                {...register("email", {
                                    required: true,
                                    validate: {
                                        matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                            "Email address must be a valid address",
                                    }
                                })}
                                sx={{
                                    background: (errors.email) ? Colors.redLightest : '',
                                    border: (errors.email) ? `${Colors.redBorder}` : '',
                                }}
                            />
                            {errors.email && (
                                <span className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </span>
                            )}
                        </FormControl>
                        <FormControl sx={{ width: '100%', marginBottom: '16px' }}>
                            <CustomOutlinedInput
                                id="outlined-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                size='small' className='bg-[#F0F1EC]'
                                placeholder='Password'
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            onMouseUp={handleMouseUpPassword}
                                            edge="end"
                                            sx={{
                                                color: (errors.password) ? 'red' : 'grey',
                                            }}

                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                {...register("password", {
                                    required: true
                                })}
                                sx={{
                                    background: (errors.password) ? Colors.redLightest : '',
                                    border: (errors.password) ? `${Colors.redBorder} solid 1px` : '',
                                }}
                            />
                            {errors.password && (
                                <span className="text-red-500 text-sm mt-1">
                                    {errors.password.message}
                                </span>
                            )}
                            {/* <br /> */}
                            <span className="text-red-500 text-sm mt-1">
                                {error}
                            </span>
                        </FormControl>

                        <Typography variant='caption' mb={4} ><Link to={'/reset-password'} className={`text-[#158281]`}>Forgot your password? </Link></Typography>

                        <div className='flex justify-end mt-3'>
                            <CustomPrimaryButton
                                disableRipple
                                type='submit'
                                size="small"
                                className='flex m-2 p-2 rounded'>
                                Next
                            </CustomPrimaryButton>
                        </div>
                    </form>

                </Box>
            </Container>

        </BackgroundContainer>
    );
}

export default Login;