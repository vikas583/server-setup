import { useTheme } from "@emotion/react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery } from "@mui/material";
import * as React from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Colors } from "../../../../../common/colors";
import { CustomNegativeButton, CustomSecondaryButton } from "../../../../../common/common.style";

interface DynamicDialogProps {
    open: boolean;
    onContinueSetup: () => void;
    onCancelSetup: () => void;
    dialogData: string;  // Data passed from the parent
}
export default function CancelPopup({ open, onContinueSetup, onCancelSetup, dialogData }: DynamicDialogProps) {

    const theme: any = useTheme();
    const fullScreen = useMediaQuery(theme?.breakpoints.down('xs'));
    // const [inputValue, setInputValue] = React.useState<string>(dialogData); // Initialize with the data received

    // Handle the input field change
    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setInputValue(e.target.value);
    // };

    // Send the data back to the parent component
    // const handleSendData = () => {
    //     setInputValue('hi')
    //     onReceiveData('inputValue'); 
    // };
    return (
        <React.Fragment>
            <Dialog
                // fullScreen={fullScreen}
                maxWidth={'xs'}
                open={open}
                onClose={onCancelSetup}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    <div className="flex items-center">
                        <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5 0.625C16.2832 0.625 21 5.3418 21 11.125C21 16.9492 16.2832 21.625 10.5 21.625C4.67578 21.625 0 16.9492 0 11.125C0 5.3418 4.67578 0.625 10.5 0.625ZM10.5 19.6562C15.1758 19.6562 19.0312 15.8418 19.0312 11.125C19.0312 6.44922 15.1758 2.59375 10.5 2.59375C5.7832 2.59375 1.96875 6.44922 1.96875 11.125C1.96875 15.8418 5.7832 19.6562 10.5 19.6562ZM10.5 14.4062C11.1973 14.4062 11.8125 14.9805 11.8125 15.7188C11.8125 16.457 11.1973 17.0312 10.5 17.0312C9.7207 17.0312 9.1875 16.457 9.1875 15.7188C9.1875 14.9805 9.76172 14.4062 10.5 14.4062ZM11.8535 5.875C13.4941 5.875 14.7656 7.14648 14.7246 8.74609C14.7246 9.73047 14.1914 10.6738 13.3301 11.207L11.4844 12.3555V12.4375C11.4844 12.9707 11.0332 13.4219 10.5 13.4219C9.9668 13.4219 9.51562 12.9707 9.51562 12.4375V11.7812C9.51562 11.4531 9.67969 11.125 10.0078 10.9199L12.3457 9.52539C12.6328 9.36133 12.7969 9.07422 12.7969 8.74609C12.7969 8.25391 12.3457 7.84375 11.8125 7.84375H9.7207C9.22852 7.84375 8.85938 8.25391 8.85938 8.74609C8.85938 9.2793 8.4082 9.73047 7.875 9.73047C7.3418 9.73047 6.89062 9.2793 6.89062 8.74609C6.89062 7.14648 8.16211 5.875 9.76172 5.875H11.8535Z" fill="#757874" />
                        </svg>

                        <Typography variant='body1' > <span className="ms-3 font-semibold">{"Exit Project Setup?"}</span></Typography>

                    </div>
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={onContinueSetup}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    By leaving the setup process, you will lose all progress and uploaded documents.
                </DialogContent>
                <DialogActions>
                    <div className='flex justify-end'>
                        <CustomSecondaryButton sx={{ marginRight: '16px'}} size="small"
                            disableRipple className='flex m-2 p-2 rounded' onClick={onContinueSetup}>Continue Setup</CustomSecondaryButton>
                        <CustomNegativeButton
                            size="small" disableRipple className='flex m-2 p-2 rounded' onClick={onCancelSetup}>Exit Setup</CustomNegativeButton>
                    </div>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )

}