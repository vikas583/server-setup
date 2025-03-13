import { FC, useEffect, useState } from 'react';
import { Button, Box, Typography, IconButton } from '@mui/material';
import { DownloadIcon } from '../../../../assets/icons/downloadIcon';
import { Link } from 'react-router-dom';
import { Colors } from '../../../../common/colors';
import { DeleteIcon } from '../../../../assets/icons/deleteIcon';
import { DownArrrowIcon } from '../../../../assets/icons/downArrowIcon';
import AuditFeedbackForm from '../../feedbacks/audit-feedback/audit';
import { CalenderIcon } from '../../../../assets/icons/calenderIcon';
import { CustomPrimaryButton, CustomSecondaryButton } from '../../../../common/common.style';
import PieColor from '../../../charts/pieChart';
import Pie from '../../../charts/pieChart';
import { AuditResult, PagewiseAudit } from '../../../../types';
import Markdown from 'react-markdown';
import './sidebar.css'

interface TabData {
    label: string;
    content: React.ReactNode;
}

interface CustomButtonTabsProps {
    tabs: TabData[];
    selectedTab: number;
    onTabChange: (newValue: number) => void;
    auditData: AuditResult
}

const CustomButtonTabs: FC<CustomButtonTabsProps> = ({ tabs, selectedTab, onTabChange, auditData }) => {
    const [pieData, setPieData] = useState({
        num_gaps: NaN,
        num_majors: NaN,
        num_minors: NaN
    });

    const [auditIssues, setAuditIssues] = useState<PagewiseAudit[]>([]);


    useEffect(() => {
        setPieData({
            num_gaps: auditData?.result?.num_gaps,
            num_majors: auditData?.result?.num_majors,
            num_minors: auditData?.result?.num_minors
        })
        setAuditIssues(auditData?.result?.pagewise_audit)


    }, [auditData])

    return (
        <Box sx={{
            height: "100vh",
            overflowY: "auto",
            paddingBottom: '60px',
            "&::-webkit-scrollbar": {
                width: "8px",
            },
            "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#4CA095",
                borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#367d6c",
            },
        }}>
            <Box display="flex" gap={2} mb={2}>
                {tabs.map((tab, index) => (
                    <Button
                        key={index}
                        disableRipple
                        variant={selectedTab === index ? 'contained' : 'outlined'}
                        onClick={() => onTabChange(index)}
                        sx={{
                            textTransform: 'none',
                            color: selectedTab === index ? 'white' : '#4CA095',
                            backgroundColor: selectedTab === index ? '#4CA095' : 'transparent',
                            border: `1px solid #4CA095`,
                            padding: '6px 6px 6px 6px',
                            fontWeight: 600
                        }}
                    >
                        {tab.label}
                    </Button>
                ))}
            </Box>

            <Box >
                {/* <AuditFeedbackForm /> */}
                {tabs[selectedTab].label == 'All Issues' &&
                    <>
                        <Box sx={{ background: 'white', }} className="rounded-xl" p={2} mb={2}>
                            <div className="flex justify-between mb-5">
                                <Typography variant='h6' fontWeight={600}>Summary</Typography>
                                {/* <div className="flex items-center"><DownloadIcon /> <Link to={'/'} className='ms-2 font-semibold'>Download Full Report</Link></div> */}
                            </div>
                            <Box sx={{ color: Colors.garkGrey }}>
                                <Typography variant='body1' mb={2}>Audit Results</Typography>
                                <Typography variant='subtitle2' mb={2} sx={{ wordWrap: 'break-word' }}>
                                    <Markdown>{auditData?.result?.overall_summary}</Markdown>
                                </Typography>
                                <Typography variant='body1' mb={2} fontWeight={600} sx={{ textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>Result Breakdown</Typography>

                                <Pie pieData={pieData} />
                            </Box>
                        </Box>
                        {auditIssues?.map((row, index) => (
                            <Box sx={{ background: 'white', }} className="rounded-xl" p={2} mb={2}>
                                <div className="flex justify-between mb-5">
                                    <Typography variant='h6' fontWeight={600}>Page {row?.page?.number}</Typography>
                                    {/* <div className="flex items-center mb-4">
                                    <CustomSecondaryButton>Upgrade Severity</CustomSecondaryButton>
                                    <span className={`ms-2 rounded bg-[#FF897D]`}><IconButton><DeleteIcon fill='black' />
                                    </IconButton> </span>
                                </div> */}

                                </div>
                                <Typography variant='body1' fontWeight={600} mb={2} color={Colors.garkGrey}>{row?.subchapter_name}</Typography>
                                <Typography variant='subtitle2' mb={2} color={Colors.garkGrey}><Markdown>{row?.result}</Markdown></Typography>
                                <hr />
                                {/* <div className='mb-2'>
                                <Typography variant='h6' fontWeight={700} my={2}>Do you have something to add?</Typography>
                                <textarea className='mb-3'
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #158281', background: Colors.lightestGrey }}


                                    placeholder="Leave Comments here"
                                    rows={3}
                                />
                                <div className="flex justify-end">

                                    <CustomPrimaryButton disableRipple>Add Comment</CustomPrimaryButton>
                                </div>

                            </div> */}
                            </Box>

                        ))}
                    </>

                }
                {tabs[selectedTab].label == 'By Document' &&
                    <>
                        <Box sx={{ background: 'white', }} className="rounded-xl" p={2} mb={2}>
                            <div className="flex justify-between mb-5">
                                <Typography variant='h6' fontWeight={600}>Major</Typography>
                                <div className="flex items-center mb-4">
                                    <CustomSecondaryButton disableRipple>Downgrade Severity</CustomSecondaryButton>
                                    <span className={`ms-2 rounded bg-[#FF897D]`}><IconButton><DeleteIcon fill='black' /></IconButton> </span></div>
                            </div>
                            <Box sx={{ color: Colors.garkGrey }}>
                                <Typography variant='body1' mb={2} fontWeight={600}>Insufficient Information about lorem ipsum dolor sit amet</Typography>
                                <Typography variant='subtitle2' mb={2}>Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</Typography>

                            </Box>
                            <div className="flex justify-between mb-5">
                                <Typography variant='h6' fontWeight={600}>CAPA</Typography>
                                <div className="flex items-center mb-4">
                                    <CustomSecondaryButton disableRipple sx={{ borderRadius: '16px' }}>
                                        <span className={`me-2`}><CalenderIcon /> </span>Resolve in 90 Days</CustomSecondaryButton> </div>
                            </div>
                            <Box sx={{ color: Colors.garkGrey }}>
                                <Typography variant='body1'>Corrective Actions:</Typography>
                                <ol className="list-decimal p-4">
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.</li>

                                </ol>
                                <Typography variant='body1'>Preventative Actions:</Typography>
                                <ol className="list-decimal p-4">
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</li>

                                </ol>
                            </Box>
                            <div className='mb-2'>
                                <Typography variant='h6' fontWeight={700} my={2}>Do you have something to add?</Typography>
                                <textarea className='mb-3'
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #158281', background: Colors.lightestGrey }}


                                    placeholder="Leave Comments here"
                                    rows={3}
                                />
                                <div className="flex justify-end">

                                    <CustomPrimaryButton disableRipple>Add Comment</CustomPrimaryButton>
                                </div>

                            </div>
                        </Box>
                        <Box sx={{ background: 'white', }} className="rounded-xl" p={2} mb={2}>
                            <div className="flex justify-between mb-5">
                                <Typography variant='h6' fontWeight={600}>Minor</Typography>
                                <div className="flex items-center mb-4"><CustomSecondaryButton disableRipple >Upgrade Severity</CustomSecondaryButton>
                                    <span className={`ms-2 rounded bg-[#FF897D]`}><IconButton><DeleteIcon fill='black' /></IconButton> </span></div>

                            </div>
                            <Typography variant='body1' fontWeight={600} mb={2} color={Colors.garkGrey}>Insufficient Information about lorem ipsum dolor sit amet</Typography>
                            <Typography variant='subtitle2' mb={2} color={Colors.garkGrey}>IWorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</Typography>

                        </Box>
                    </>
                }
            </Box>
        </Box>
    );
};

export default CustomButtonTabs;
{/* <div className="font-semibold flex justify-center items-center">
                            <span className='me-2'><DownArrrowIcon /></span>
                            <Link to={'/'}> Show Dismissed Issues</Link>

                        </div> */}