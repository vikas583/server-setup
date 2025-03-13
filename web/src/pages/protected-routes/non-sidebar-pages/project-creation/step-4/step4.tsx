import { useState, useEffect } from "react";
import { Box, Typography, Grid2, Tooltip } from "@mui/material";
import { truncateString } from "../../../../../utils/stringAvatar";
// import { Colors } from "../../../../../common/colors";

const StepFour = ({ getValues }: any) => {
    const [projectData, setProjectData] = useState<any>();

    useEffect(() => {
        const values = getValues()
        setProjectData(values)
    }, [getValues]);

    let content: JSX.Element | null = null

    if (projectData) {
        content = (
            <Box sx={{ background: 'white', borderRadius: '24px', boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)', }} px={5} py={3}>
                <Typography variant="h5" sx={{ fontWeight: 700 }} mb={4}>Step 3: Review</Typography>
                <Typography variant="body1" mb={3}>Before creating this project, ensure the details you have provided below are accurate to your case.</Typography>
                <Grid2 container spacing={3}>
                    <Grid2 size={6}>
                        <Typography sx={{ color: '#5C5F5B', fontWeight: 600 }} mb={2} variant="h6">Project Details</Typography>
                        <div className="mb-2">
                            <Typography variant="subtitle2" sx={{ color: '#5C5F5B', }}>Project Name:</Typography>
                            <Typography variant="subtitle2" className="break-words" >
                                {/* <Tooltip title={projectData?.projectName}>
                                <span> */}
                                {truncateString(projectData?.projectName)}
                                {/* </span>
                            </Tooltip> */}
                            </Typography>
                        </div>
                        <div className="mb-2">
                            <Typography variant="subtitle2" sx={{ color: '#5C5F5B' }}>Client Company:</Typography>
                            <Typography variant="subtitle2" className="break-words" >
                                <Tooltip title={projectData?.clientName}>
                                    <span>
                                        {truncateString(projectData?.clientName)}
                                    </span>
                                </Tooltip>
                            </Typography>
                        </div>
                        <div className="mb-2">
                            <Typography variant="subtitle2" sx={{ color: '#5C5F5B' }}>Description:</Typography>

                            <Typography variant="subtitle2" className="break-words" >
                                <Tooltip title={projectData?.description}>
                                    <span>
                                        {truncateString(projectData?.description)}
                                    </span>
                                </Tooltip>
                            </Typography>

                        </div>
                        <div className="mb-2">
                            <Typography variant="subtitle2" sx={{ color: '#5C5F5B' }}>Collaborators:</Typography>

                            {projectData?.collaborators?.map((value: any, index: number) => (
                                <Typography variant="subtitle2" key={value.id}>
                                    {value.name} ({value.email})
                                </Typography>
                            ))}

                        </div>
                    </Grid2>
                    <Grid2 size={6}>
                        <Typography sx={{ color: '#5C5F5B', fontWeight: 600 }} mb={2} variant="h6">Audit Scope</Typography>
                        {/* <div className="mb-2">
                            <Typography variant="subtitle2" sx={{ color: '#5C5F5B' }}>Mock Audit:</Typography>
                            <Typography variant="subtitle2" >Yes</Typography>
                        </div> */}
                        <div className="mb-2">
                            <Typography variant="subtitle2" sx={{ color: '#5C5F5B' }}>Regulations:</Typography>
                            {projectData?.regulations?.map((value: any, index: number) => (
                                <Typography variant="subtitle2" key={value?.id}>{value?.name}</Typography>
                            ))}
                        </div>
                        {/* <div className="mb-2">
                        <Typography variant="subtitle2" sx={{ color: '#5C5F5B' }}>Standards:</Typography>
                        <Typography variant="subtitle2" >ISO 27001 - Information Security Management System</Typography>
                        <Typography variant="subtitle2" >ISO 27001 - Information Security Management System</Typography>
                    </div>
                    <div className="mb-2">
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#5C5F5B' }}>Audit History</Typography>
                    </div>
                    <div className="mb-2">
                        <Typography variant="subtitle2" sx={{ color: '#5C5F5B' }}>Uploaded Documents:</Typography>
                        <Typography variant="subtitle2" >AuditReport01_2023.pdf</Typography>
                        <Typography variant="subtitle2" >AuditReport01_2024.pdf</Typography>
                    </div> */}
                    </Grid2>

                </Grid2>


            </Box >
        )
    } else {

    }


    return content;
}
export default StepFour;
