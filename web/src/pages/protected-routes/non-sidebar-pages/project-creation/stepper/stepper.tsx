// @ts-ignore

import { useState } from "react";
import { Stepper, Step, StepLabel, Typography, Box } from "@mui/material";

import Step1 from "../step-1/step1";
import { Colors } from "../../../../../common/colors";
import Step2 from "../step-2/step2";
// import Step3 from "../step-3/step3";
import Step4 from "../step-4/step4";
import CancelPopup from "../cancel-popup/cancelPopup";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CreateProjectFormInput, UserRoles } from "../../../../../types";
import projectService from "../../../../../services/projectService";
import { showGlobalSnackbar } from "../../../../../common/snackbarProvider";
import { useLoading } from "../../../../../common/loader/loader-context";
import { useSelector } from "react-redux";
import { CustomPrimaryButton, CustomSecondaryButton, CustomTertiaryButton } from "../../../../../common/common.style";


const steps = ["Project Details", "Audit scope", "Review"];
export default function StepperForm() {
    const navigate = useNavigate();
    const { userData } = useSelector((state: any) => state.auth)

    const { register, handleSubmit, setValue, getValues, formState: { errors }, setError, clearErrors } = useForm<CreateProjectFormInput>()

    const [activeStep, setActiveStep] = useState(0);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<string>('');
    const { setLoading } = useLoading();




    const handleNext = () => {

        const obj = getValues()
        if (activeStep === 1 && !obj.regulations) {
            setError('regulations', {
                message: "Please select a regulation!"
            })
            return
        }
        if (activeStep === 1 && !obj?.selectedRegulations || obj?.selectedRegulations?.length === 0) {
            setError('selectedRegulations', {
                message: "Please select a scope!"
            })
            return
        }

        if (Object.keys(errors).length > 0) {
            return
        }
        setActiveStep((prev) => prev + 1)
    }
    const handleBack = () => {
        if (activeStep === 1) {
            clearErrors('regulations')
        }
        setActiveStep((prev) => prev - 1)

    };


    // const handleDataChange = (step: string, data: any) => {
    //     setFormData((prev) => ({ ...prev, [step]: data }));
    // };

    const finalSubmission = async (formData: CreateProjectFormInput) => {
        if (activeStep === steps.length - 1) {
            try {
                setLoading(true)
                const body = {
                    projectName: formData.projectName,
                    clientName: formData.clientName,
                    description: formData.description ? formData.description : "",
                    collaborators: formData.collaborators ? [...formData.collaborators] : [],
                    regulations: formData.regulations
                }
                const response = await projectService.createProject(body)
                if (response?.status) {
                    setLoading(false)
                    if (response.status) {
                        navigate("/projects");
                    } else {
                        showGlobalSnackbar(response.msg, "error")
                    }
                } else {
                    setLoading(false)
                }

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
        } else {
            handleNext()
        }
    };

    const getStepContent = (stepIndex: number) => {
        switch (stepIndex) {
            case 0:
                return <Step1 register={register} errors={errors} setValue={setValue} getValues={getValues} />;

            case 1:
                return <Step2
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    getValues={getValues}
                    clearErrors={clearErrors}
                />;
            // // case 2:
            // //     return <Step3 data={formData.education} onDataChange={(data: any) => handleDataChange("auditHistory", data)} />;
            case 2:
                return <Step4
                    register={register}
                    getValues={getValues}
                />;
            default:
                return "Unknown Step";
        }
    };


    const openDialogBox = () => {
        setDialogOpen(true)
    }

    // Function to close the dialog
    const handleContinuePopUpOption = () => {
        setDialogOpen(false);
    };


    const HandleCancelPopupOption = () => {
        // setReceivedData(data);
        if (userData.role === UserRoles.AccountOwner) {
            navigate('/dashboard')
        } else {
            navigate('/projects')
        }
    }


    return (
        <Box sx={{ background:'#F7F9F7'}}>
            <div className="grid grid-cols-1"

            // sx={{ direction: 'column', alignItems: 'center', justifyContent: 'center', background: Colors.lightestGrey, }}
            >

                <form onSubmit={handleSubmit(finalSubmission)}>
                    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 lg:px-8">
                        <Box mt={'60px'}>
                            <Stepper activeStep={activeStep} >
                                {steps.map((label) => (
                                    <Step key={label} >
                                        <StepLabel
                                            StepIconProps={{
                                                style: {
                                                    fill: Colors.tertiary,
                                                    borderRadius: '50%',
                                                    padding: '5px',
                                                    fontSize: '3rem'
                                                },
                                            }}
                                        >{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            <Box my={5}>
                                {activeStep === steps.length ? (
                                    <Typography>All steps completed - Thank you!</Typography>
                                ) : (
                                    <>
                                        {getStepContent(activeStep)}
                                        <Box mt={2} textAlign={'right'}>
                                            <CustomTertiaryButton onClick={openDialogBox} sx={{ marginRight: '16px' }} 
                                            size="small" disableRipple className='flex m-2 p-2 rounded'>Exit Setup</CustomTertiaryButton>
                                            {activeStep !== 0 &&
                                                <CustomSecondaryButton
                                                    onClick={handleBack}
                                                    sx={{ marginRight: '16px' }}
                                                    size="small"
                                                    disableRipple
                                                    className='flex m-2 p-2 rounded'>
                                                    Back
                                                </CustomSecondaryButton>

                                            }

                                            <CustomPrimaryButton
                                                type='submit'
                                                size="small"
                                                disableRipple
                                                className='flex m-2 p-2 rounded'>
                                                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                                            </CustomPrimaryButton>

                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </div>
                </form>
            </div>
            <CancelPopup open={isDialogOpen}
                onContinueSetup={handleContinuePopUpOption}
                onCancelSetup={HandleCancelPopupOption} // Callback to get data from the dialog
                dialogData={dialogData}
            />
        </Box >

    );
};

