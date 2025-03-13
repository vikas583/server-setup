import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import React, { useEffect } from "react";


import CloseIcon from '@mui/icons-material/Close';
import { DeleteIcon } from "../../../../assets/icons/deleteIcon";
import projectService from "../../../../services/projectService";
import { useLoading } from "../../../../common/loader/loader-context";
import { showGlobalSnackbar } from "../../../../common/snackbarProvider";
import { useNavigate } from "react-router-dom";
import { CustomNegativeButton, CustomSecondaryButton } from "../../../../common/common.style";

interface DynamicDialogProps {
    open: boolean;
    onClose: () => void;
    onReceiveData: any,//(data[]: number) => void;
    dialogData: string | undefined; // Data passed from the parent
    optionalArgs?: any;
}
const ArchiveProject = ({ open, onClose, onReceiveData, dialogData, optionalArgs }: DynamicDialogProps) => {
    const { setLoading } = useLoading();
    const navigate = useNavigate()
    const projectArchive = async () => {
        if (dialogData) {
            try {
                setLoading(true)
                const obj = {
                    projectId: Number(dialogData),
                    archive: true
                }
                const resp = await projectService.archiveProject(obj)
                if (resp?.status) {
                    setLoading(false)
                    showGlobalSnackbar(resp.msg, 'success')
                    navigate('/projects')
                }
            } catch (error) {                
                showGlobalSnackbar('Something went wrong, try again later!', 'error')
                setLoading(false)
            }
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
                        <Typography variant='body1' > <span className="ms-3 font-semibold">{"Archive File?"}</span></Typography>

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
                        This project will be moved to the archive section, where you will not be able to upload files or start an audit.
                    </Typography>

                </DialogContent>
                <DialogActions>
                    <CustomSecondaryButton
                        size="small"
                        disableRipple
                        className='flex m-2 p-2 rounded'
                        onClick={onClose}>
                        Return to Settings
                    </CustomSecondaryButton>
                    <CustomNegativeButton
                        sx={{ marginLeft: '16px' }}
                        size="small"
                        disableRipple
                        className='flex m-2 p-2 rounded'
                        onClick={projectArchive}>
                        Archive
                    </CustomNegativeButton>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
export default React.memo(ArchiveProject) 