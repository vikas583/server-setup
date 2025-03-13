import { Container, Typography, Button, Box } from '@mui/material';
import LogoWhite from "../../../assets/imgs/logo_white.png";
import { BackgroundContainer } from '../../login-pages/login-page/loginStyle';
import { Colors } from '../../../common/colors';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../../services';
import { useLoading } from '../../../common/loader/loader-context';
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from '../../../common/common.style';


export default function MFAVerification() {
  const navigate = useNavigate()
  const { setLoading } = useLoading();
  const { email } = (useLocation().state || {}) as { email?: string };
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [isOtpCorrect, setIsOtpCorrect] = useState<boolean>(true)
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
      handleMFAVerification()
    }
  };
  const isOtpComplete = otp.every((digit) => digit !== '');

  const handleMFAVerification = async () => {
    if (!email || !isOtpComplete) return
    setLoading(true)

    try {
      const code = otp.join('')
      const response = await authService.resetPassword2FA(email, code)
      const token = response.resetPasswordToken;
      setLoading(false)

      navigate(`/reset-password-set?token=${token}`)
    } catch (error) {
      console.error(error)
      setLoading(false)
      setIsOtpCorrect(false)
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
          <Typography variant='body1' mb={6} sx={{ width: '75%' }}>To verify your identity, enter the 6-digit code provided by your authentication app.</Typography>
          <Box display="flex" justifyContent="center" gap={2} mb={2}>
            {otp.map((value: string, index: number) => (
              <CustomOutlinedInput
                className='rounded-lg'
                key={index}
                id={`otp-${index}`}
                value={value}
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
          <Typography variant='body1' my={6} >For issues with setup, view our <Link to={"/"}>troubleshooting guide.</Link> </Typography>
          <div className='flex justify-end mt-4'>
            <CustomSecondaryButton onClick={() => navigate('/login')} sx={{ marginRight: '16px'}} size="small" disableRipple className='flex m-2 p-2 rounded' >
              Back
            </CustomSecondaryButton>

            <CustomPrimaryButton disableRipple size="small" className={`flex m-2 p-2 rounded ${!isOtpComplete ? 'diabled-button' : ''}`}
              onClick={() => handleMFAVerification()}
              disabled={!isOtpComplete} >Verify
            </CustomPrimaryButton>
          </div>

        </Box>
      </Container>

    </BackgroundContainer>
  );
}

