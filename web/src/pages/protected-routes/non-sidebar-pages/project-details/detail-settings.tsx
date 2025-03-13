import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";

import CancelSharpIcon from '@mui/icons-material/CancelSharp';

import CloseIcon from '@mui/icons-material/Close';
import { SettingIcon } from "../../../../assets/icons/settingIcon";
import theme from "../../../../common/theme";
import { Colors } from "../../../../common/colors";
import { AddUserIcon } from "../../../../assets/icons/AddUserIcon";
import ArchiveProject from "./archive-project";
import { Collaborators, EditProjectDetails, projectDetailsBodyData, ProjectDetailsResponse } from "../../../../types";
import projectService from "../../../../services/projectService";
import { useLoading } from "../../../../common/loader/loader-context";
import { showGlobalSnackbar } from "../../../../common/snackbarProvider";
import { CustomAutocomplete, CustomNegativeButton, CustomOutlinedInput, CustomPrimaryButton, CustomSecondaryButton } from "../../../../common/common.style";
import { useForm } from "react-hook-form";

interface DynamicDialogProps {
    open: boolean;
    onClose: () => void;
    onReceiveData: any,
    dialogData: Number | undefined;
    optionalArgs?: any;
}
const initialData: EditProjectDetails = {
    projectName: '',
    clientName: '',
    description: '',
    collaborators: []
};

const ProjectDetailsSettings = ({ open, onClose, onReceiveData, dialogData, optionalArgs }: DynamicDialogProps) => {
    const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [isArchiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [archiveDialogData, setArchiveDialogData] = useState<string>(''); // State to pass data to the dialog
    const [archiveReceivedData, setArchiveReceivedData] = useState<string>('');
    const [formData, setFormData] = useState<EditProjectDetails>(initialData);
    // const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [collaborators, setCollaborators] = useState<Collaborators[]>([])
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [selectedValueNew, setSelectedValueNew] = useState<any>(null);
    const [addedValues, setAddedValues] = useState<Collaborators[]>([]);
    const [collaboratorsAdded, setCollaboratorsAdded] = useState<Collaborators[]>([]);
    const [collaboratorsDeleted, setCollaboratorsDeleted] = useState<Collaborators[]>([]);
    const { setLoading } = useLoading();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditProjectDetails>()

    const handleArchiveCloseDialog = () => {
        setArchiveDialogOpen(false);
    };
    const handleArchiveDialogData = (data: any) => {

    }
    useEffect(() => {
        if (dialogData) {

            getProjectDetails()
            getCollaborators()
        }
    }, [dialogData])
    const getProjectDetails = async () => {
        try {
            setLoading(true)
            const response = await projectService.projectDetails(Number(dialogData))

            if (response?.status) {
                response.data.records = []

                // setFormData({
                //     projectName: response?.data?.projectName || '',
                //     clientName: response?.data?.clientName || '',
                //     description: response?.data?.description || '',
                //     collaborators: response?.data?.collaborators || [],
                // })
                setValue('projectName', response?.data?.projectName)
                setValue('clientName', response?.data?.clientName)
                setValue('description', response?.data?.description)
                setValue('collaborators', response?.data?.collaborators)
                setAddedValues(response?.data?.collaborators || [])
            } else {
                showGlobalSnackbar('Something went wrong', 'error')
            }
            setLoading(false)

        } catch (error) {
            setLoading(false)
            showGlobalSnackbar('Something went wrong', 'error')
        }
    }
    const getCollaborators = async () => {
        setLoading(true)
        try {
            const data = await projectService.listCollaborators()
            if (data.status) {
                setCollaborators(data.data)
            }
            setLoading(false)
        } catch (err) {
            setLoading(false)
            // showGlobalSnackbar('Something went wrong', 'error')
        }
    }


    const finalSubmission = async (formData: EditProjectDetails) => {
        try {
            setLoading(true)
            setFormData(prevForm => ({ ...prevForm, ['collaborators']: addedValues }));

            // if (validateAll()) {                
            let obj: projectDetailsBodyData = {
                projectId: Number(dialogData),
                projectName: formData.projectName,
                clientName: formData.clientName,
                description: formData.description,
                collaboratorsDeleted: collaboratorsDeleted?.map(data => { return data.id }) || [],
                collaboratorsAdded: collaboratorsAdded?.map(data => { return data.id }) || []
                // collaborators: addedValues
            }

            const resp = await projectService.projectSettingUpdate(obj)
            if (resp?.status === true) {
                onClose();
                onReceiveData(true)
                showGlobalSnackbar(resp.msg, 'success')

            } else {
                setLoading(false)
            }

            // }
            setLoading(false)

        } catch (err: any) {
            setLoading(false)
            // Handle specific HTTP status codes
            if (err.response?.status === 400) {
                // Show all validation errors in snackbar
                if (Array.isArray(err.response.data)) {
                    const errorMessages = err.response.data
                        .map((error: { message: string }) => error.message)
                        .join(', ');
                    showGlobalSnackbar(errorMessages, "error");
                } else {
                    // Show generic validation error
                    const errorMessage = err.response.data.msg || "Validation error occurred";
                    showGlobalSnackbar(errorMessage, "error");
                }
            } else {
                // Generic error handling
                const errorMessage = err.response?.data?.msg || "An error occurred while creating the project";
                showGlobalSnackbar(errorMessage, "error");
            }
        }
    }
    const uiList = useMemo(() => {
        const filteredMainData = addedValues.filter(
            (user) => !collaboratorsDeleted.some((deleted) => deleted.email === user.email)
        );

        return [...filteredMainData, ...collaboratorsAdded];
    }, [addedValues, collaboratorsDeleted, collaboratorsAdded]);
    const handleAdd = () => {

        const isInMainData = addedValues.some((user) => user.email === selectedValueNew.email);

        if (!isInMainData) {
            setCollaboratorsAdded((prev) =>
                prev.some((user) => user.email === selectedValueNew.email) ? prev : [...prev, selectedValueNew]
            );
        }

        setCollaboratorsDeleted((prev) => prev.filter((user) => user.email !== selectedValueNew.email));
    };
    const handleRemove = (valueToRemove: string) => {

        const isAdded = collaboratorsAdded.some((user) => user.email === valueToRemove);

        if (isAdded) {
            setCollaboratorsAdded((prev) => prev.filter((user) => user.email !== valueToRemove));
        } else {
            const itemToDelete = addedValues.find((user) => user.email === valueToRemove);
            if (itemToDelete) {
                setCollaboratorsDeleted((prev) =>
                    prev.some((user) => user.email === valueToRemove) ? prev : [...prev, itemToDelete]
                );
            }
        }
    };
    const openArchiveDialog = () => {
        setArchiveDialogData(String(dialogData))
        setArchiveDialogOpen(true)
    }
    return (
        <React.Fragment>
            <Dialog
                fullScreen={fullScreen}
                // maxWidth={'md'}
                open={open}
                onClose={onClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    <div className="flex items-center mb-3">
                        <SettingIcon />
                        <Typography variant='body1' > <span className="ms-3 font-semibold">{"Settings"}</span></Typography>

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
                <form autoComplete="off" className="mb-7" onSubmit={handleSubmit(finalSubmission)} noValidate>
                    <DialogContent>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <InputLabel htmlFor="ProjectName" required className="mb-2">Project Name:</InputLabel>

                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='ProjectName'
                                        placeholder="Project Name"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        // value={formData.projectName}
                                        error={!!errors.projectName}
                                        {...register("projectName", {
                                            required: 'Project Name is required!',
                                            pattern: {
                                                value: /^[a-zA-Z0-9_'\s-]+$/,
                                                message: 'Project name can only contain letters, numbers, _, -, and \'',
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: 'Project name must not be more than 30 characters long',
                                            }
                                        })}
                                    />
                                    {errors.projectName && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.projectName.message}
                                        </span>
                                    )}

                                </FormControl>
                            </Grid2>
                            <Grid2 size={12}>
                                <InputLabel htmlFor="ClientName" required className="mb-2">Client Name:</InputLabel>
                                <FormControl className="w-full">
                                    <CustomOutlinedInput
                                        id='ClientName'
                                        placeholder="Client Name"
                                        size='small'
                                        className=' bg-[#F0F1EC]'
                                        {...register("clientName", {
                                            required: 'Client Name is required!',
                                            maxLength: {
                                                value: 30,
                                                message: 'Client name must not be more than 30 characters long',
                                            }
                                        })}

                                    />
                                    {errors.clientName && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.clientName.message}
                                        </span>
                                    )}

                                </FormControl>
                            </Grid2>

                            {/* <Grid2 size={6}>
                                <InputLabel htmlFor="ProjectCategory" required className="mb-2">Project Category:</InputLabel>
                                <FormControl className="w-full">
                                    <select className='bg-[#f0f1ec] rounded-md p-2 w-full'>
                                        <option>Cybersecurity</option>
                                        <option>2024 Q2</option>
                                        <option>2024 Q3</option>
                                    </select>

                                </FormControl>

                            </Grid2> */}
                            <Grid2 size={12}>
                                <InputLabel htmlFor="Description" className="mb-2">Description:</InputLabel>

                                <FormControl className="w-full">
                                    <textarea className='mb-3'
                                        style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#F0F1EC' }}
                                        placeholder="Placeholder"
                                        rows={3}
                                        {...register("description", {
                                            maxLength: {
                                                value: 256,
                                                message: 'Description must not be more than 256 characters long',
                                            }
                                        })}


                                    />
                                    {errors.description && (
                                        <span className="text-red-500 text-sm mt-1">
                                            {errors.description.message}
                                        </span>
                                    )}

                                </FormControl>

                            </Grid2>
                        </Grid2>



                        <Typography variant="body1" mb={1} fontWeight={600}>Collaborators</Typography>
                        <Typography variant="body2" mb={2}>Allow others to review and comment on audit results by inviting them as collaborators. You will remain the audit lead, while others also have access to document audit results. </Typography>
                        <Typography variant="body2" mb={2} fontWeight={600} color={Colors.tertiary} className="flex items-center"><AddUserIcon /> <span className="ms-2">Add Collaborators</span></Typography>
                        <div className="mb-6 gap-2 flex"  >
                            <Stack spacing={2} sx={{ width: '100%' }}>
                                <CustomAutocomplete
                                    id="free-solo-demo"
                                    aria-placeholder="Email"
                                    freeSolo
                                    // {...register("collaborators")}
                                    onChange={(event, newValue: any) => {
                                        setSelectedValue(newValue ? `${newValue.name}, ${newValue.email}` : '');
                                        setSelectedValueNew(newValue);


                                    }}
                                    // value={selectedValue}
                                    getOptionLabel={(option: any) => `${option.name}, ${option.email}`}
                                    // options={collaborators.map((option) => `${option.name}, ${option.email}`)}
                                    options={collaborators}
                                    renderInput={(params) => <TextField {...params} size="small" />}
                                />


                            </Stack>
                            <CustomPrimaryButton size="small" disableRipple className=' rounded'
                                onClick={handleAdd}
                                disabled={!selectedValueNew} >Add</CustomPrimaryButton>
                        </div>

                        <Grid2 container spacing={2} mb={4}>
                            {uiList?.map((value, index: number) => (
                                <Grid2 size={6} key={value.email + index}>
                                    <OutlinedInput className="mb-2" id="outlined-adornment-password" size="small" fullWidth
                                        key={index}
                                        value={`${value.name}, ${value.email}`}
                                        disabled
                                        endAdornment={
                                            <InputAdornment position="end" >
                                                <IconButton aria-label="toggle password visibility" edge="end" onClick={() => handleRemove(value.email)}>
                                                    <CancelSharpIcon sx={{ fontSize: '18px', color: 'rgba(170, 172, 167, 1)' }} />
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </Grid2>
                            ))}

                        </Grid2>
                        <Typography variant="body1" color="#414942" fontWeight={600}>Archive</Typography>
                        <Typography fontSize={'12px'} color="#414942" mb={4}>All projects can be archived before an audit is started, to permanently and securely delete all files and data, reach out to our team directly at<a href="mailto:support@tiebreaker-ai.com"> support@tiebreaker-ai.com</a> </Typography>
                        <CustomNegativeButton
                            size="small"
                            disableRipple
                            className='flex m-2 p-2 rounded'
                            onClick={() => openArchiveDialog()}>
                            Archive Project
                        </CustomNegativeButton>
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
                            className='flex m-2 p-2 rounded'
                            type='submit'

                        >
                            Save
                        </CustomPrimaryButton>
                    </DialogActions>
                </form>
            </Dialog>
            <ArchiveProject open={isArchiveDialogOpen}
                onClose={handleArchiveCloseDialog}
                onReceiveData={handleArchiveDialogData} // Callback to get data from the dialog
                dialogData={archiveDialogData}
            />
        </React.Fragment>
    )
}
export default React.memo(ProjectDetailsSettings) 