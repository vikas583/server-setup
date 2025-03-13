import { useTheme } from "@emotion/react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton, TableFooter, TablePagination, Box, Typography, Breadcrumbs, Button, } from "@mui/material";
import Grid from '@mui/material/Grid2';

import { TablePaginationActionsProps } from "@mui/material/TablePagination/TablePaginationActions";
import { useState } from "react";
import { Link } from "react-router-dom";
import {GreaterThenIcon} from "../../../assets/icons/greaterThenIcon";
import { Colors } from "../../../common/colors";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { VisuallyHiddenInput } from "./allFiles.style";
import { UploadIcon } from "../../../assets/icons/uploadIcon";
import { TooltipIcon } from "../../../assets/icons/tooltipIcon";
import { DotsIcon } from "../../../assets/icons/dotsIcon";
import { FilterIcon } from "../../../assets/icons/filterIcon";
import { SearchIcon } from "../../../assets/icons/searchIocn";
import { BoxDiv } from "../projects/project.style";
import PaginationComponent from "../../../common/pagination";
import { CustomAvatar, CustomPrimaryButton } from "../../../common/common.style";
function createData(
    name: string,
    calories: string,
    fat: string,
    carbs: string,
    scope: string,
    fileSize: string,
    date: string
) {
    return { name, calories, fat, carbs, scope, fileSize, date };
}

const rows = [
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
];
export default function AllFiles() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    return (
        <>
            
            <div className="flex justify-between">
                <Typography sx={{ fontSize: '26px', fontWeight: 700 }} mb={4}>All Files</Typography>
                <div>
                    <CustomPrimaryButton
                        // component="label"
                        disabled
                        role={undefined}
                        tabIndex={-1}
                        startIcon={<UploadIcon fill="white" />}
                    >
                        Upload files
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => console.log(event.target.files)}
                            multiple
                        />
                    </CustomPrimaryButton>
                </div>
            </div>
            <Grid container spacing={4} size="grow">

                <Grid size={3}>
                    <BoxDiv>
                        <div className='flex justify-between w-full items-center'>
                            <Typography sx={{ fontWeight: 600 }}>Audits Completed</Typography>
                            <span><TooltipIcon /></span>
                        </div>
                        <Typography variant='h4' sx={{ fontWeight: 700 }}>10</Typography>
                    </BoxDiv>
                </Grid>
                <Grid size={3}>
                    <BoxDiv >
                        <div className='flex justify-between w-full items-center'>
                            <Typography sx={{ fontWeight: 600 }}>New Projects</Typography>
                            <span><TooltipIcon /></span>
                        </div>
                        <Typography variant='h4' sx={{ fontWeight: 700 }}>10</Typography>
                    </BoxDiv>
                </Grid>
                <Grid size={3}>
                    <BoxDiv>
                        <div className='flex justify-between w-full items-center'>
                            <Typography sx={{ fontWeight: 600 }}>New Clients</Typography>
                            <span><TooltipIcon /></span>
                        </div>
                        <Typography variant='h4' sx={{ fontWeight: 700 }}>4</Typography>
                    </BoxDiv>
                </Grid>
                <Grid size="grow">
                    <BoxDiv>
                        <div className='flex justify-between w-full items-center'>
                            <Typography sx={{ fontWeight: 600 }}>Document Processed</Typography>
                            <span><TooltipIcon /></span>
                        </div>
                        <Typography variant='h4' sx={{ fontWeight: 700 }}>120</Typography>
                    </BoxDiv>
                </Grid>
            </Grid>
            <div className='rounded-md shadow shadow-[#7d848f] bg-white mt-8'>
                <div className="flex justify-between">
                    <p className='p-2 text-md ps-4 font-semibold'>Files</p>
                    <div className='flex items-center'><SearchIcon />
                        <div className='ms-2'>
                            <select className='bg-[#f0f1ec] rounded-md p-1'>
                                <option>QuickFilter</option>
                                <option>2024 Q2</option>
                                <option>2024 Q3</option>
                            </select>
                        </div>
                        <div className="ms-2">
                            <FilterIcon />
                        </div>
                        <div className="ms-2">
                            <DotsIcon />
                        </div>
                    </div>

                </div>


                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                        <TableHead className='bg-[#f0f1ec]'>
                            <TableRow>
                                <TableCell><span className="font-semibold">Document Name</span></TableCell>
                                <TableCell><span className="font-semibold">Client</span></TableCell>
                                <TableCell><span className="font-semibold">Project Name</span></TableCell>
                                <TableCell><span className="font-semibold">Scope</span></TableCell>
                                <TableCell><span className="font-semibold">File Size</span></TableCell>
                                <TableCell><span className="font-semibold">Uploaded On</span></TableCell>
                                <TableCell><span className="font-semibold">Uploaded By</span></TableCell>
                                <TableCell><span className="font-semibold"></span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow
                                    key={index + 1}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" >{row.name}</TableCell>
                                    <TableCell>{row.calories}</TableCell>
                                    <TableCell><span className={`text-[${Colors.tertiary}]`}>{row.fat}</span></TableCell>
                                    <TableCell><span className={`text-[${Colors.tertiary}]`}>{row.scope}</span></TableCell>
                                    <TableCell>{row.fileSize}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell><CustomAvatar style={{ height: '30px', width: '30px' }} alt="Travis Howard" src="/static/images/avatar/2.jpg" /></TableCell>
                                    <TableCell><IconButton component={Link} to="/project-details"><GreaterThenIcon /></IconButton></TableCell>

                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                    <div className="flex items-center justify-between border">
                        <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic text-left'>Last updated: just now</p>
                        <TablePagination
                            component="div"
                            count={rows.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            ActionsComponent={(props) => <PaginationComponent {...props} />}
                            labelRowsPerPage="Items per page:"
                            slotProps={{
                                select: {
                                    inputProps: {
                                        'aria-label': 'rows per page',
                                    },
                                    native: true,
                                },
                            }}
                        />

                    </div>
                </TableContainer>

            </div >
        </>
    )
}