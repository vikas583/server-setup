import { Dialog, DialogTitle, Typography, IconButton, DialogContent, Button, DialogActions, dialogClasses } from "@mui/material"
import React, { useEffect } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { Colors } from "../../../common/colors";
import { CircleQuestionMarkIcon } from "../../../assets/icons/circleQuestionMarkIcon";
import userService from "../../../services/userService";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import { useLoading } from "../../../common/loader/loader-context";
import { CustomNegativeButton, CustomSecondaryButton } from "../../../common/common.style";
interface DynamicDialogProps {
    open: boolean;
    onClose: () => void;
    onReceiveData: any,
    dialogData: number | undefined;
}
const RemovePermissionPopup = ({ open, onClose, onReceiveData, dialogData }: DynamicDialogProps) => {
    const { setLoading } = useLoading();
    const submit = async () =>{
        try {
            setLoading(true)
            const resp = await userService.userPermissionRemove(dialogData)
            if (resp?.status) {
                onReceiveData(true)
                onClose()
                showGlobalSnackbar(resp.msg, "success")
            }
            setLoading(false)
        } catch (error) {
            showGlobalSnackbar('Something went wrong, try again later!', "error")
            setLoading(false)
        }
    }
    return (
        <>
            <React.Fragment>
                <Dialog
                    maxWidth={'xs'}
                    open={open}
                    onClose={onClose}
                    aria-labelledby="responsive-dialog-title"
                >
                    <DialogTitle id="responsive-dialog-title" sx={{ pb: 0 }}>
                        <div className="flex items-center mb-3">
                            <CircleQuestionMarkIcon />
                            <Typography variant='body1' > <span className="ms-3 font-semibold">{"Remove Permissions?"}</span></Typography>

                        </div>
                    </DialogTitle>
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
                    <DialogContent >
                        <div>
                            <Typography variant='body2' mb={1} color={Colors.naturalGrey900}>
                                This user will lose access to any projects they have access to.
                            </Typography>
                            
                        </div>
                        
                    </DialogContent>
                    <DialogActions>
                        <CustomSecondaryButton
                            size="small"
                            disableRipple
                            className='flex m-2 p-2 rounded'
                            onClick={onClose}>
                            Cancel
                        </CustomSecondaryButton>
                        <CustomNegativeButton
                            sx={{  marginLeft: '16px' }}
                            size="small"
                            disableRipple
                            className='flex m-2 p-2 rounded'
                            onClick={submit}>
                            Remove
                        </CustomNegativeButton>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        </>
    )
}
export default React.memo(RemovePermissionPopup) 