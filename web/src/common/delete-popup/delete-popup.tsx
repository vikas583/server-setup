import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { DeleteIcon } from "../../assets/icons/deleteIcon";


import CloseIcon from '@mui/icons-material/Close';
import projectService from "../../services/projectService";
import { useLoading } from "../loader/loader-context";
import { showGlobalSnackbar } from "../snackbarProvider";
import { CustomNegativeButton, CustomSecondaryButton } from "../common.style";

interface DynamicDialogProps {
    open: boolean;
    onClose: () => void;
    onReceiveData: any,//(data[]: number) => void;
    dialogData: any; // Data passed from the parent
    optionalArgs?: any;
}
const DeletePopup = ({ open, onClose, onReceiveData, dialogData, optionalArgs }: DynamicDialogProps) => {
    const { setLoading } = useLoading();

    const deleteData = async () => {
        // console.log(dialogData);
        try {
            setLoading(true)

            const resp = await projectService.deleteDocument(dialogData[0]?.documentId, dialogData[0]?.projectId)
            if (resp?.data.status) {
                onReceiveData(true)
                showGlobalSnackbar(resp.data.msg, 'success')
            }
            onReceiveData(true)
            setLoading(false)
            onClose()

        } catch (error) {
            showGlobalSnackbar('Something went wrong', 'error')
            setLoading(false)
        }

    }
    return (
        <React.Fragment>
            <Dialog
                // fullScreen={fullScreen}
                maxWidth={'xs'}
                open={open}
                onClose={onClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    <div className="flex items-center mb-3">
                        <DeleteIcon fill="red" />
                        <Typography variant='body1' > <span className="ms-3 font-semibold">{"Delete File?"}</span></Typography>

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
                <DialogContent>
                    <Typography variant='body1'>
                        Files and their audit results cannot be recovered once they have been deleted.
                    </Typography>

                </DialogContent>
                <DialogActions>
                    <CustomSecondaryButton
                        size="small"
                        variant="contained"
                        className='flex m-2 p-2 rounded'
                        onClick={onClose}>
                        Cancel
                    </CustomSecondaryButton>
                    <CustomNegativeButton
                        sx={{ marginLeft: '16px' }}
                        size="small"
                        variant="contained"
                        className='flex m-2 p-2 rounded'
                        onClick={deleteData}>
                        Delete
                    </CustomNegativeButton>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
export default React.memo(DeletePopup) 