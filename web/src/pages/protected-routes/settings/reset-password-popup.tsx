import { Box, Typography, Button, IconButton, InputAdornment, LinearProgress, FormControl, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Colors } from "../../../common/colors";
import { useState } from "react";
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserSetPasswordFormData } from "../../../types";
import { useLoading } from "../../../common/loader/loader-context";
import CloseIcon from '@mui/icons-material/Close';
import { SettingIcon } from "../../../assets/icons/settingIcon";
import userService from "../../../services/userService";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import React from "react";
import { useLogout } from "../../../common/logout";
import { CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from "../../../common/common.style";

interface DynamicDialogProps {
    open: boolean;
    onClose: () => void;
    onReceiveData: any,
    dialogData: number | undefined;
}
export default function ResetPasswordDialog({ open, onClose, onReceiveData, dialogData }: DynamicDialogProps) {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState<UserSetPasswordFormData>({ password: '', confirmPassword: '', currentPassword: '' })
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState([false, false, false, false]); // Array to track each criterion
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [apiError, setApiError] = useState<string>('');
    const { setLoading } = useLoading();
    const { globalLogout } = useLogout();

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
        if (field === 'password' || field === 'confirmPassword') {
            checkPasswordStrength(value);
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    };


    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.currentPassword) newErrors.currentPassword = 'Current Password is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true)
        if (validateForm()) {
            const checkStr = strength.every(value => value === true);
            if (!checkStr) {
                setErrors((prev) => ({ ...prev, ['strength']: "This password is not strong enough and cannot be used. Try again." }));
                return
            }
            if (formData.password === formData.confirmPassword) {
                try {
                    setLoading(true)
                    const obj = {
                        oldPassword: formData.currentPassword || undefined,
                        newPassword: formData.password
                    }
                    const resp = await userService.updateUserPassword(obj)                    
                    if (resp?.status) {
                        
                        showGlobalSnackbar(resp.msg, 'success')
                        onClose()
                        await globalLogout()
                    }
                    setLoading(false)
                } catch (error) {
                    showGlobalSnackbar('Something went wrong, try again later!', 'error')
                    setLoading(false)
                }
            } else {
                setErrors((prev) => ({ ...prev, ['notMatch']: "Password doesn't match!" }));
                setLoading(false)
            }
        }
        setLoading(false)
    };

    return (
        <React.Fragment>
            <Dialog
                maxWidth={'sm'}
                open={open}
                onClose={onClose}
                fullWidth={true}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    <div className="flex items-center mb-3">
                        <SettingIcon fill="black" />
                        <Typography variant='body1' > <span className="ms-3 font-semibold">{"Reset Password"}</span></Typography>

                    </div>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={(theme) => ({
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        })}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent >
                    <form autoComplete="off" onSubmit={handleSubmit} noValidate>
                        <div className="mb-3">
                            <FormControl className="w-full">
                                <CustomOutlinedInput
                                    placeholder='Current Password' required id="current-password" size='small' fullWidth
                                    name="Current Password"
                                    value={formData.currentPassword}
                                    onChange={handleChange('currentPassword')}
                                    type="password"
                                    error={!!errors.currentPassword}

                                />
                                {!!errors.currentPassword &&
                                    <Typography variant="body2" color={Colors.redBorder}>{errors.currentPassword}</Typography>
                                }
                            </FormControl>
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
                            <Typography variant="body2" sx={{ background: Colors.redLightest }} p={1} className="rounded flex items-center">
                                <span>
                                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 14.75C3.11719 14.75 0 11.6328 0 7.75C0 3.89453 3.11719 0.75 7 0.75C10.8555 0.75 14 3.89453 14 7.75C14 11.6328 10.8555 14.75 7 14.75ZM7 4.25C6.61719 4.25 6.34375 4.55078 6.34375 4.90625V7.96875C6.34375 8.35156 6.61719 8.625 7 8.625C7.35547 8.625 7.65625 8.35156 7.65625 7.96875V4.90625C7.65625 4.55078 7.35547 4.25 7 4.25ZM7.875 10.375C7.875 9.91016 7.46484 9.5 7 9.5C6.50781 9.5 6.125 9.91016 6.125 10.375C6.125 10.8672 6.50781 11.25 7 11.25C7.46484 11.25 7.875 10.8672 7.875 10.375Z" fill="#DE3730" />
                                    </svg>
                                </span>
                                <span className="ms-2">{errors.strength}</span>
                            </Typography>

                        }
                        <div className='flex justify-end pt-6'>
                            <CustomSecondaryButton
                                onClick={onClose}
                                sx={{  marginRight: '16px' }}
                                size="small"
                                disableRipple
                                className='flex m-2 p-2 rounded'
                            >
                                Cancel
                            </CustomSecondaryButton>
                            <CustomPrimaryButton
                                type="submit"
                                onClick={handleSubmit}
                                size="small"
                                disableRipple
                                className='flex m-2 p-2 rounded'
                            >
                                Reset
                            </CustomPrimaryButton>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}