import { Avatar, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Colors } from "../../../common/colors";
import { GreaterThenIcon } from "../../../assets/icons/greaterThenIcon";
import { PencilIcon } from "../../../assets/icons/pencilIcon";
import { CircleRightIcon } from "../../../assets/icons/circleRightIcon";
import { AddIcon } from "../../../assets/icons/addIcon";
import { useEffect, useState } from "react";
import SettingsUploadPopup from './setting-uploadPopup'
import auditService from "../../../services/auditService";
import { RegulationsVerificationListInterface } from "../../../types";
import { useLoading } from "../../../common/loader/loader-context";
import StatusTypography from "../../../common/status-message/status-message";
export default function AuditScopeSettings() {
    const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadDialogData, setUploadDialogData] = useState<any>(); // State to pass data to the dialog
    const [auditListingArray, setAuditListingArray] = useState<RegulationsVerificationListInterface[]>([]);
    const { setLoading } = useLoading();
    function createData(
        name: string,
        calories: string,
        fat: string,
        status: string,
    ) {
        return { name, calories, fat, status };
    }

    
    const handleUploadCloseDialog = () => {
        setUploadDialogOpen(false);
    };
    const handleUploadDialogData = (data: any) => {

    }
    const uploadDialogBox = (data: string, id: number) => {
        setUploadDialogData({ type: data, projectId: id })
        setUploadDialogOpen(true)
    }
    const auditListing = async () => {
        setLoading(true)
        try {
            const resp = await auditService.regulationsVerificationList()
            setAuditListingArray(resp?.data || [])
            setLoading(false)

        } catch (error) {
            setLoading(false)

        }
    }
    useEffect(() => {
        auditListing()
    }, [])

    return (
        <div>
            <Typography variant="h6" fontWeight={600}>Audit Scope Settings</Typography>
            <Typography variant="body1" mb={5} lineHeight={'21px'} color={Colors.naturalGrey900} width={'762px'}> Tiebreaker AI provides access to a curated list of audit criteria that can be used with our AI system. However, before using audit standards, regulations or guidelines, they must be confirmed or uploaded here. To view to full list of scope we cover, visit our <Link to={'/'}>FAQ section.</Link></Typography>
            <Typography variant="body1" fontWeight={600}>Standards and Regulations</Typography>
            <Typography variant="body1" mb={2} lineHeight={'21px'} width={'762px'}> To audit files against the audit scope we provide, we must also verify your licensing of the corresponding standard or regulation. Review the table below and verify options you would like to use in projects.</Typography>
            <TableContainer component={Paper} sx={{ mb: 5 }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                    <TableHead className='bg-[#f0f1ec]'>
                        <TableRow>
                            <TableCell><span className="font-semibold">Year</span></TableCell>
                            <TableCell><span className="font-semibold">Title</span></TableCell>
                            <TableCell><span className="font-semibold">Category</span></TableCell>
                            <TableCell><span className="font-semibold"></span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {auditListingArray.map((row, index) => (
                            <TableRow
                                key={index + 1}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" >{row.version}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.category}</TableCell>
                                <TableCell>
                                    {row.status !== null ?
                                        <StatusTypography status={row.status} />
                                        :
                                        <Typography sx={{ color: Colors.greenDark, fontWeight: 600 }}
                                            className='w-9/12 px-1 justify-center flex items-center'>
                                            <span className="ms-2">
                                                Verify
                                            </span>
                                            <span className="ms-3">
                                                <IconButton onClick={() => uploadDialogBox('verify', row.id)}>
                                                    <GreaterThenIcon />
                                                </IconButton>
                                            </span>
                                        </Typography>
                                    }
                                </TableCell>


                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
                <div className="flex items-center justify-between border">
                    <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic text-left'>Don’t see what you’re looking for? <Link to={'/'}>Request a standard or regulation</Link></p>


                </div>
            </TableContainer>
            {/* <div className="flex items-center justify-between">
                <div>
                    <Typography variant="body1" fontWeight={600}>Guidelines</Typography>
                    <Typography variant="body1" mb={2} lineHeight={'21px'} width={'762px'}>To audit files against guidelines not covered by standards or regulations, upload them below.</Typography>

                </div>
                <Button sx={{ background: Colors.tertiary, fontWeight: 600, fontSize: '14px', color: 'white' }} onClick={() => uploadDialogBox('guideLines', NaN)}> <span className="me-2"><AddIcon fill='white' /> </span>New Guideline</Button>

            </div>
            <TableContainer component={Paper} sx={{ mb: 5 }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                    <TableHead className='bg-[#f0f1ec]'>
                        <TableRow>
                            <TableCell><span className="font-semibold">Title</span></TableCell>
                            <TableCell><span className="font-semibold">Category</span></TableCell>
                            <TableCell><span className="font-semibold"></span></TableCell>
                            <TableCell><span className="font-semibold"></span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow
                                key={index + 1}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{row.calories}</TableCell>
                                <TableCell><span className={`text-[${Colors.tertiary}]`}>{row.fat}</span></TableCell>
                                <TableCell><Typography sx={{ background: Colors.greenLight, color: Colors.greenDark, borderColor: Colors.greenMid, fontWeight: 600 }} className='w-9/12 px-1 rounded-lg border justify-center flex items-center'><div><CircleRightIcon fill="#158277" /> </div><div className="ms-2">Ready for use</div></Typography></TableCell>
                                <TableCell><GreaterThenIcon /></TableCell>


                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
                <div className="flex items-center justify-between border">
                    <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic text-left'>Don’t see what you’re looking for? <Link to={'/'}>Request a standard or regulation</Link></p>


                </div>
            </TableContainer> */}


            <SettingsUploadPopup open={isUploadDialogOpen}
                onClose={handleUploadCloseDialog}
                onReceiveData={handleUploadDialogData} // Callback to get data from the dialog
                dialogData={uploadDialogData}
            />
        </div>
    );
}