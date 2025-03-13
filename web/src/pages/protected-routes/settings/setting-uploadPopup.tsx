import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Colors } from "../../../common/colors";
import { AddIcon } from "../../../assets/icons/addIcon";
import { VisuallyHiddenInput } from "../all-files/allFiles.style";
import { showGlobalSnackbar } from "../../../common/snackbarProvider";
import documentService from "../../../services/documentService";
import { useLoading } from "../../../common/loader/loader-context";
import { CustomPrimaryButton, CustomSecondaryButton } from "../../../common/common.style";

interface DynamicDialogProps {
    open: boolean;
    onClose: () => void;
    onReceiveData: any,//(data[]: number) => void;
    dialogData: any; // Data passed from the parent
}
const SettingsUploadPopup = ({ open, onClose, onReceiveData, dialogData }: DynamicDialogProps) => {
    const [showUploadNextStep, setShowUploadNextStep] = useState<number>(0);

    const { setLoading } = useLoading();

    const UploadFileSharp = async (evt: any) => {

        if (evt?.target.files.length > 10) {
            showGlobalSnackbar('You can upload a maximum of 10 files.', 'warning')
            return;
        }

        for (let file of evt?.target.files) {
            if (file.size > 20000000) {
                showGlobalSnackbar('Each file must be less than 20 MB.', 'warning')
                return;
            }
        }
    }
    const submitUpload = async (data: any) => {
        setLoading(true)

        const formData: any = new FormData();

        for (let i = 0; i < data.length; i++) {

            formData.append('files', data[i]);

        }
        formData.append('projectId', dialogData.projectId);

        const response = await documentService.uploadDocuments(formData)
        if (response?.status) {
            // if (projectDetails?.data?.documentsCount && Number(projectDetails?.data?.documentsCount) <= 0) {
            //     await getProjectDetails()
            // } else {
            //     await getDocumentListing()
            // }
        }
        setLoading(false)
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
                        <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5 0.625C16.2832 0.625 21 5.3418 21 11.125C21 16.9492 16.2832 21.625 10.5 21.625C4.67578 21.625 0 16.9492 0 11.125C0 5.3418 4.67578 0.625 10.5 0.625ZM10.5 19.6562C15.1758 19.6562 19.0312 15.8418 19.0312 11.125C19.0312 6.44922 15.1758 2.59375 10.5 2.59375C5.7832 2.59375 1.96875 6.44922 1.96875 11.125C1.96875 15.8418 5.7832 19.6562 10.5 19.6562ZM12.1406 14.4062C12.6738 14.4062 13.125 14.8574 13.125 15.3906C13.125 15.9648 12.6738 16.375 12.1406 16.375H8.85938C8.28516 16.375 7.875 15.9648 7.875 15.3906C7.875 14.8574 8.28516 14.4062 8.85938 14.4062H9.51562V11.7812H9.1875C8.61328 11.7812 8.20312 11.3711 8.20312 10.7969C8.20312 10.2637 8.61328 9.8125 9.1875 9.8125H10.5C11.0332 9.8125 11.4844 10.2637 11.4844 10.7969V14.4062H12.1406ZM10.5 8.5C9.76172 8.5 9.1875 7.92578 9.1875 7.1875C9.1875 6.49023 9.76172 5.875 10.5 5.875C11.1973 5.875 11.8125 6.49023 11.8125 7.1875C11.8125 7.92578 11.1973 8.5 10.5 8.5Z" fill="#366475" />
                        </svg>
                        {dialogData === 'guideLines' ?
                            <Typography variant='body1' > <span className="ms-3 font-semibold">{"Create new Guideline"}</span></Typography>
                            :
                            <Typography variant='body1' > <span className="ms-3 font-semibold">{"Verify Standard or Regulation"}</span></Typography>
                        }
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
                <DialogContent sx={{ textAlign: 'center' }}>
                    {dialogData === 'guideLines' ?
                        <>
                            <Typography variant='body2' color={Colors.naturalGrey900} mb={3}>
                                Upload guidelines to audit against specific regulations (E.g. company policy, regional standards).
                            </Typography>
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<AddIcon fill="black" />}
                                sx={{ fontWeight: 600, fontSize: '14px', color: 'black', background: Colors.grey, }}
                            >
                                Upload File
                                <VisuallyHiddenInput
                                    type="file"
                                // onChange={(event) => UploadFileSharp(event)}
                                // multiple
                                // accept=".pdf"
                                />
                            </Button>
                        </>
                        :
                        <>
                            {showUploadNextStep == 0 &&
                                <>
                                    <Typography variant='body2' color={Colors.naturalGrey900} mb={3}>
                                        To confirm your access to this standard or regulation, upload your personal PDF copy.
                                    </Typography>
                                    <Button
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        tabIndex={-1}
                                        startIcon={<AddIcon fill="black" />}
                                        sx={{ fontWeight: 600, fontSize: '14px', color: 'black', background: Colors.grey, }}
                                    >
                                        Upload File
                                        <VisuallyHiddenInput
                                            type="file"
                                            onChange={(event) => UploadFileSharp(event)}
                                            multiple
                                            accept=".pdf"
                                        />
                                    </Button>
                                </>
                            }
                        </>
                    }
                </DialogContent>
                <DialogActions>
                    <CustomSecondaryButton
                        size="small"
                        disableRipple
                        className='flex m-2 p-2 rounded'
                        onClick={onClose}>
                        Cancel
                    </CustomSecondaryButton>
                    <CustomPrimaryButton
                        sx={{ marginLeft: '16px' }}
                        size="small"
                        disableRipple
                        className='flex m-2 p-2 rounded'>
                        Next
                    </CustomPrimaryButton>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
export default React.memo(SettingsUploadPopup) 