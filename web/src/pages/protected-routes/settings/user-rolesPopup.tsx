import { Dialog, DialogTitle, Typography, IconButton, DialogContent } from "@mui/material"
import React from "react"
import CloseIcon from '@mui/icons-material/Close';
import { Colors } from "../../../common/colors";
interface DynamicDialogProps {
    open: boolean;
    onClose: () => void;
}
const UserRolesPopup = ({ open, onClose }: DynamicDialogProps) => {
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
                            <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5 0.625C16.2832 0.625 21 5.3418 21 11.125C21 16.9492 16.2832 21.625 10.5 21.625C4.67578 21.625 0 16.9492 0 11.125C0 5.3418 4.67578 0.625 10.5 0.625ZM10.5 19.6562C15.1758 19.6562 19.0312 15.8418 19.0312 11.125C19.0312 6.44922 15.1758 2.59375 10.5 2.59375C5.7832 2.59375 1.96875 6.44922 1.96875 11.125C1.96875 15.8418 5.7832 19.6562 10.5 19.6562ZM12.1406 14.4062C12.6738 14.4062 13.125 14.8574 13.125 15.3906C13.125 15.9648 12.6738 16.375 12.1406 16.375H8.85938C8.28516 16.375 7.875 15.9648 7.875 15.3906C7.875 14.8574 8.28516 14.4062 8.85938 14.4062H9.51562V11.7812H9.1875C8.61328 11.7812 8.20312 11.3711 8.20312 10.7969C8.20312 10.2637 8.61328 9.8125 9.1875 9.8125H10.5C11.0332 9.8125 11.4844 10.2637 11.4844 10.7969V14.4062H12.1406ZM10.5 8.5C9.76172 8.5 9.1875 7.92578 9.1875 7.1875C9.1875 6.49023 9.76172 5.875 10.5 5.875C11.1973 5.875 11.8125 6.49023 11.8125 7.1875C11.8125 7.92578 11.1973 8.5 10.5 8.5Z" fill="#366475" />
                            </svg>
                            <Typography variant='body1' > <span className="ms-3 font-semibold">{"User Roles"}</span></Typography>

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
                    <DialogContent sx={{pt:0}}>
                        <div>
                            <Typography variant='body2' mb={1} color={Colors.naturalGrey900}>
                                Project Owner
                            </Typography>
                            <Typography variant='body2' mb={2} color={Colors.naturalGrey900}>
                                Project Owners can manage projects and have full control over project settings, scope and file management. They will only have access to projects assigned to them, but will be considered the lead-auditor.
                            </Typography>
                            <Typography variant='body2' color={Colors.naturalGrey900}>
                                Collaborator                            </Typography>
                            <Typography variant='body2' color={Colors.naturalGrey900}>
                                Collaborators can upload files to audits and review or leave comments on audit results. The project owner will remain the audit lead, responsible for project settings and scoping.
                            </Typography>
                        </div>
                        {/* <DialogContentText> */}


                        {/* </DialogContentText> */}
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        </>
    )
}
export default React.memo(UserRolesPopup) 