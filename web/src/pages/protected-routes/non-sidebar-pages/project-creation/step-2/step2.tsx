import { useState, useEffect, useCallback } from "react";
import { Box, Typography, RadioGroup, FormControl, FormControlLabel, Radio, TablePagination, Avatar, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Button, InputLabel, Alert } from "@mui/material";
import { Colors } from "../../../../../common/colors";
import { GreaterThenIcon } from "../../../../../assets/icons/greaterThenIcon";
import CustomizeScope from "../../../dialogs/scope/customize-scope";
import { ProjectRegulationScope, RegulationDetails, Regulations } from "../../../../../types";
import projectService from "../../../../../services/projectService";
import { showGlobalSnackbar } from "../../../../../common/snackbarProvider";
import { CustomPrimaryButton, CustomTertiaryButton } from "../../../../../common/common.style";
import { CircleInfoIcon } from "../../../../../assets/icons/circleInfoIcon";
import CloseIcon from '@mui/icons-material/Close';
import { TriangleExclamationIcon } from "../../../../../assets/icons/triangleExclamationIcon";
import { Link, useNavigate } from "react-router-dom";

export default function StepTwo({ register, errors, setValue, getValues, clearErrors, setError, goToTab }: any) {
    const LIMIT = 40;
    const [selectedRegulations, setSelectedRegulations] = useState<Number[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<RegulationDetails[]>([]);
    const [regulationData, setRegulationData] = useState<any>(null);
    const [regulations, setRegulations] = useState<Regulations[]>([]);
    const [total, setTotal] = useState<Number>(0);
    const [onReceiveData, setOnReceivedData] = useState<any>();
    const [infoShowOnLoad, setInfoShowOnLoad] = useState<boolean>(true);
   
    const navigate = useNavigate();
   
    const fetchRegulations = useCallback(async () => {
        try {
            const data = await projectService.listRegulations(0, LIMIT);
            if (data.status) {
                setRegulations(data.data.regulations);
                setTotal(data.data.total);
            }
        } catch (error) {
            console.error("Error fetching regulations:", error);
        }
    }, []);

    useEffect(() => {
        fetchRegulations();
    }, [fetchRegulations]);

    useEffect(() => {
        const values = getValues();
        if (values?.regulations) {
            listRegulationDetails(values.regulations[0]?.id, values.regulations[0]?.name, true);
            const selectedIds = values.regulations.map((item: any) => item.id);
            setSelectedRegulations(selectedIds);
            setRegulationData(values.regulations[0]);

        }
    }, [getValues]);

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCloseDialog = () => {
        if (onReceiveData) {
            setRegulationData((prev: any) => ({ ...prev, ['scope']: dialogData?.length === onReceiveData?.length ? ProjectRegulationScope.FULL_SCOPE : ProjectRegulationScope.REDUCED_SCOPE }));
        }
        setDialogOpen(false)
    };

    const handleDialogData = (data: any) => {
        if (data) {
            clearErrors('selectedRegulations')
        }
        setOnReceivedData(data)

        const finalReg = [{
            id: regulationData?.id,
            name: regulationData?.name,
            scope: dialogData.length === data.length ? ProjectRegulationScope.FULL_SCOPE : ProjectRegulationScope.REDUCED_SCOPE,
            regulationDetails: data
        }];
        setRegulationData(finalReg[0])
        setValue('regulations', finalReg);
        setValue('selectedRegulations', [regulationData?.id]);
        setDialogOpen(false);
    };

    const handleRegulationChange = async (event: React.ChangeEvent<HTMLInputElement>, regulation: any) => {
        const { value, checked } = event.target;
        const [id, name] = value.split(" ");
        if (checked) {
            if (selectedRegulations.length === 1) {
                showGlobalSnackbar('You cannot select more than one', 'warning');
                return;
            }
            setSelectedRegulations((prev) => [...prev, Number(id)]);
            listRegulationDetails(Number(id), name);
            setRegulationData(regulation);
            setDialogOpen(true);
            clearErrors("regulations");
        } else {
            setSelectedRegulations((prev) => prev.filter((item) => item !== Number(id)));
            setDialogData([]);
            setRegulationData(null);
            setValue('regulations', null)
            if (selectedRegulations.length === 0) {
                setError("regulations", { message: "Please select a regulation!" });
            }
            if (!onReceiveData && onReceiveData?.length === 0) {
                setError("regulations", { message: "Please select a scope!" });
            }
        }
    };
    const listRegulationDetails = async (id: number, name: string, isBack: boolean = false) => {
        try {
            const data = await projectService.listRegulationDetails(id);
            if (data.status) {
                setDialogData(data.data.regulationDetails);
                if (!isBack) {
                    setRegulationData({
                        id,
                        name,
                        scope: ProjectRegulationScope.FULL_SCOPE
                    });
                    const finalReg = [{
                        id,
                        name,
                        scope: ProjectRegulationScope.FULL_SCOPE,
                       
                    }];
                    setValue('regulations', finalReg);

                }
            }
        } catch (error) {
            console.error("Error fetching regulation details:", error);
        }
    };

    const openDialogandSendData = async (regData: any) => {
        if (selectedRegulations.length !== 1) {
            showGlobalSnackbar('Please select exactly one regulation', 'warning');
            return;
        }

        setRegulationData(regData);
        setDialogOpen(true);
    };



    return (
        <>
            <Box>
                {regulations?.length > 0 ?
                    <>
                        {infoShowOnLoad &&
                            <Box my={8}>
                                <Alert
                                    severity="error"
                                    icon={<CircleInfoIcon fill={Colors.NightBlue600} />}
                                    sx={{
                                        backgroundColor: `${Colors.NightBlue200}!important`,
                                        color: Colors.NightBlue950,
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        py: 0,
                                        px: '12px'
                                    }}
                                    action={
                                        <IconButton
                                            size="small"
                                            aria-label="close"
                                            color="inherit"
                                            onClick={() => setInfoShowOnLoad(false)}
                                        >
                                            <CloseIcon fontSize="small" />

                                        </IconButton>
                                    }
                                >
                                    <Typography sx={{ fontWeight: 600 }}>Select 5 sections</Typography>
                                    To optimize result accuracy, only select 5 sub-sections of a regulation.
                                </Alert>
                            </Box>
                        }
                    </>
                    :
                    <>
                        {/* {showWarningIfEmptyLoad &&
                            <Box my={8}>
                                <Alert
                                    severity="error"
                                    icon={<TriangleExclamationIcon fill={Colors.midOrange} />}
                                    sx={{
                                        backgroundColor: `${Colors.VenusOrange100}!important`,
                                        color: Colors.VenusOrange950,
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        py: 0,
                                        px: '12px'
                                    }}
                                    action={
                                        <IconButton
                                            size="small"
                                            aria-label="close"
                                            color="inherit"
                                            onClick={() => setShowWarningIfEmptyLoad(false)}
                                        >
                                            <CloseIcon fontSize="small" sx={{ color: Colors.venusOrange600 }} />

                                        </IconButton>
                                    }
                                >
                                    <Typography sx={{ fontWeight: 600 }}>Unverified Standards</Typography>
                                    To use an audit standard in a project, please first verify your ownership in <a onClick={() => navigate("/settings", { state: { tab: '2' } })} >scope settings</a>.
                                </Alert>
                            </Box>
                        } */}

                    </>
                }
            </Box>
            <Box sx={{ background: 'white', borderRadius: '24px', boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)', }} p={3}>

                <Typography variant="h5" sx={{ fontWeight: 700 }} mb={4}>Step 2: Regulations and Standards</Typography>
                <Typography variant="body1" mb={3}>Select the relevant standards, regulations or guidelines below to outline the scope of your audit.</Typography>


                <Typography variant="h6">Scope</Typography>
                <Typography variant="subtitle2">
                    <span className="text-[#757874]">
                        Based on the selected audit category, certain criteria have been recommended for this audit. Simply click on “All Options” to select from the fill list of regulations, standards, guidelines. Scope can also be adjusted after project creation.
                    </span>
                </Typography>
                <div className="my-4">
                    {/* <CustomPrimaryButton disableRipple size="small" className='flex m-2 p-2 rounded' > Recommended</CustomPrimaryButton>
                    <CustomTertiaryButton disableRipple sx={{ borderColor: Colors.tertiary, marginLeft: '16px', border: '2px solid' }}
                        size="small" className='flex m-2 p-2 rounded ms-3 border' onClick={() => setDialogOpen(true)}> All Options</CustomTertiaryButton> */}

                </div>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                        <TableHead className='bg-[#f0f1ec]'>
                            <TableRow

                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        inputProps={{
                                            'aria-label': 'select all desserts',
                                        }}
                                    />
                                </TableCell>
                                <TableCell><span className="font-semibold">Version</span></TableCell>
                                <TableCell><span className="font-semibold">Regulation/ Standard/ Guideline</span></TableCell>
                                <TableCell><span className="font-semibold">Category</span></TableCell>
                                <TableCell><span className="font-semibold"></span></TableCell>
                                <TableCell><span className="font-semibold"></span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {regulations?.length > 0 ?
                                <>
                                    {regulations.map((regulation, index) => (
                                        <TableRow
                                            key={index + 1}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                        >

                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    onChange={(event) => handleRegulationChange(event, regulation)}
                                                    color="primary"
                                                    value={`${regulation?.id} ${regulation.name}`}
                                                   
                                                    checked={selectedRegulations?.includes(regulation?.id)}

                                                />
                                            </TableCell>
                                            <TableCell component="th" scope="row" >{regulation.version}</TableCell>
                                            <TableCell>
                                                {regulation.name}
                                            </TableCell>
                                            <TableCell>
                                                {regulation.category}
                                            </TableCell>
                                            <TableCell>
                                                {(regulationData?.id === regulation?.id && regulationData?.scope === ProjectRegulationScope.REDUCED_SCOPE) &&
                                                    <div
                                                        className={`rounded-3xl border-2 p-1 text-center w-36 font-semibold border-[#FF7F30] bg-[${Colors.lightestOrange}] text-[${Colors.midOrange}]`}>
                                                        Reduced Scope
                                                    </div>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() =>
                                                    openDialogandSendData(regulation)}
                                                >
                                                    <GreaterThenIcon />
                                                </IconButton>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </>
                                :
                                <>

                                    <TableRow>
                                        <TableCell colSpan={12} align="center">
                                            <Typography variant="body1" color={Colors.naturalGrey900} fontSize={'14px'}>
                                                No Verified Regulations or Standards
                                            </Typography>
                                        </TableCell>
                                    </TableRow>

                                </>
                            }
                        </TableBody>

                    </Table>
                </TableContainer>

                {errors.regulations && (
                    <Typography color="error">{errors.regulations.message}</Typography>
                )}
                {errors.selectedRegulations && (
                    <Typography color="error">{errors.selectedRegulations.message}</Typography>
                )}
                <CustomizeScope open={isDialogOpen}
                    onClose={handleCloseDialog}
                    onReceiveData={handleDialogData}
                    dialogData={dialogData}
                    optionalArgs={regulationData?.regulationDetails}
                    isAddOrEdit={'add'}
                    scopeName={regulationData?.name}
                />
            </Box>
        </>
    );
};

