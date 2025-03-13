import { useState, useEffect, ChangeEvent, useRef } from "react";
import { Box, Typography, Grid2, InputLabel, IconButton, InputAdornment, Button, Autocomplete, Stack, TextField, OutlinedInput } from "@mui/material";
import { AddUserIcon } from "../../../../../assets/icons/AddUserIcon";
import { Colors } from "../../../../../common/colors";
import CancelSharpIcon from '@mui/icons-material/CancelSharp';
import projectService from "../../../../../services/projectService";

import { useForm } from "react-hook-form";

import { Collaborators, StepProps } from "../../../../../types";
import { showGlobalSnackbar } from "../../../../../common/snackbarProvider";
import { CustomAutocomplete, CustomOutlinedInput, CustomPrimaryButton, Textarea } from "../../../../../common/common.style";

export default function StepOne({ register, errors, setValue, getValues }: StepProps) {

    const hasFetchedCollaborators = useRef(false);

    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [selectedValueNew, setSelectedValueNew] = useState<any>(null);
    const [addedValues, setAddedValues] = useState<Collaborators[]>([]);
    const [isCollabAdded, SetIsCollabAdded] = useState<boolean>(false);
    // useEffect(() => {
    //     onDataChange(localData);
    // }, [localData]);

    // const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    //     const { name, value } = e.target;
    //     setLocalData({ ...localData, [name]: value, });
    // };
    const [collaborators, setCollaborators] = useState<Collaborators[]>([])


    const getCollaborators = async () => {
        try {

            const data = await projectService.listCollaborators()

            if (data.status) {
                setCollaborators(data.data)
            }
        } catch (err) {
            // showGlobalSnackbar('Something went wrong', 'error')
        }
    }

    useEffect(() => {

        if (!hasFetchedCollaborators.current) {
            getCollaborators();
            hasFetchedCollaborators.current = true; // Set to true after fetching
        }

    }, [])


    const handleAdd = () => {

        if (selectedValue && !addedValues.includes(selectedValueNew)) {
            setAddedValues((prev: any) => [...prev, selectedValueNew]);
            // let a = addedValues.push(selectedValueNew)
            // setAddedValues(a)
            // setValue('collaborators', addedValues); // ✅ sugar syntax to setValue twice

            SetIsCollabAdded(true)
            // setSelectedValue(''); // Clear the selected value after adding
        }
    };
    if (isCollabAdded) {
        setValue('collaborators', addedValues);
    }
    useEffect(() => {

        const values = getValues('collaborators')
        // if (Object.keys(values).length !=0) {
        setAddedValues(values ? values : [])

        // }

    }, [getValues])

    const handleRemove = (valueToRemove: string) => {
        setAddedValues(addedValues.filter(value => value.email !== valueToRemove));
        SetIsCollabAdded(true)
    };
    return (
        <Box sx={{ background: 'white', borderRadius: '24px', boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)', }} p={3}>

            <Typography variant="h5" sx={{ fontWeight: 700 }} mb={4}>Step 1: Project Details</Typography>

            <Typography sx={{ fontWeight: 600, fontSize: '20px' }} mb={3}>To start a new audit project, fill out the details below</Typography>

            <Grid2 container spacing={6}>

                <Grid2 size={6}>
                    <div className="mb-3">
                        <InputLabel htmlFor="component-helper" required>Project Name:</InputLabel>
                        <CustomOutlinedInput
                            placeholder='Project Name'
                            id="projectName"
                            size='small'
                            fullWidth
                            error={!!errors.projectName}
                            {...register("projectName", {
                                required: 'Project Name is required!',
                                pattern: {
                                    value: /^[a-zA-Z0-9_'\s-]+$/,
                                    message: 'Project name can only contain letters, numbers, spaces, _, -, and \'',
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
                    </div>
                    <div className="mb-3">
                        <InputLabel htmlFor="bootstrap-input" className="mb-2">Description:</InputLabel>
                        <Textarea
                            aria-label="Placeholder"
                            minRows={2}
                            className="MuiOutlinedInput-input"
                            placeholder="Description"
                            {...register("description", {
                                maxLength: {
                                    value: 256,
                                    message: 'Description must not be more than 256 characters long',
                                } })}
                        />
                        
                        {errors.description && (
                            <span className="text-red-500 text-sm mt-1">
                                {errors.description.message}
                            </span>
                        )}
                    </div>
                    <div className="mb-3">
                        <InputLabel htmlFor="bootstrap-input" className="mb-2" required>Client Name:</InputLabel>
                        <CustomOutlinedInput
                            placeholder='Client Name'
                            id="clientName"
                            size='small'
                            fullWidth
                            error={!!errors.clientName}
                            {...register("clientName", {
                                required: 'Client Name is required!',
                                maxLength: {
                                    value:30,
                                    message: 'Client name must not be more than 30 characters long',
                                }
                            })}
                        />
                        {errors.clientName && (
                            <span className="text-red-500 text-sm mt-1">
                                {errors.clientName.message}
                            </span>
                        )}
                    </div>

                </Grid2>
                <Grid2 size={6}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Collaborators</Typography>
                    <Typography variant="caption">Allow others to review and comment on audit results by inviting them as collaborators. You will remain the audit lead, while others also have access to document audit results. </Typography>
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
                        <CustomPrimaryButton disableRipple size="small" className=' rounded' onClick={handleAdd}
                            disabled={!selectedValueNew}>Add</CustomPrimaryButton>
                    </div>
                    {addedValues?.map((value: any, index: number) => (
                        <OutlinedInput className="mb-2" id="outlined-adornment-password" type='text' size="small" fullWidth
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
                    ))}


                </Grid2>
            </Grid2>


        </Box >
    );
};


