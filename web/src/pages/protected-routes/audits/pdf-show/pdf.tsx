import { Grid2, Typography } from "@mui/material";
import AuditSidebar from "../sidebar-audit/sidebar-audit";
import { useEffect, useState, useRef, useCallback } from "react";
import { Colors } from "../../../../common/colors";
import { Document, Page } from 'react-pdf';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Optional for better rendering
import { pdfjs } from 'react-pdf';
import auditService from "../../../../services/auditService";
import { useNavigate, useParams } from "react-router-dom";
import { AuditResult, AuditStatus } from "../../../../types";
import { showGlobalSnackbar } from "../../../../common/snackbarProvider";
import Header from "../../../../common/header";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// page number changes when the current page is scrolled by this percentage
const SCROLL_THRESHOLD_PERCENT = 50; // Adjust this value between 0-100

export default function PDF() {
    const [numPages, setNumPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [docData, setDocData] = useState<any>();
    const [auditData, setAuditData] = useState<AuditResult | any>();
    const [projectDetailsId, setProjectDetailsId] = useState<string>('');
    let { id } = useParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);
    const navigate = useNavigate();
    
    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }    
    id = atob(id || '')    


    // Handle scroll events in the container
    const handleScroll = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const scrollTop = container.scrollTop;
            const viewportHeight = container.clientHeight;
            const scrollHeight = container.scrollHeight;

            // Calculate threshold point based on percentage
            const thresholdOffset = (viewportHeight * SCROLL_THRESHOLD_PERCENT) / 100;
            const currentPosition = scrollTop + thresholdOffset;
            const pageHeight = scrollHeight / numPages;
            const currentPage = Math.ceil(currentPosition / pageHeight);

            if (currentPage !== pageNumber && currentPage <= numPages && currentPage > 0) {
                setPageNumber(currentPage);
            }
        }, 50);
    }, [numPages, pageNumber]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [handleScroll]);

    useEffect(() => {
        setProjectDetailsId(localStorage.getItem('projDetId') || '')
        getDocDetails()
    }, [])

    useEffect(() => {
        let interval: number | null = null
        if (docData && docData.auditId && docData.id &&
            (docData.auditStatus === AuditStatus.PROCESSING)) {
            interval = setInterval(async () => {
                try {
                    const resp = await auditService.auditDetails(docData.auditId, docData.id)
                    if (resp?.data?.auditStatus !== AuditStatus.NOT_STARTED &&
                        resp?.data?.auditStatus !== AuditStatus.PROCESSING) {
                        if (interval) {
                            clearInterval(interval)
                        }
                        // Update docData with the latest status
                        getDocDetails()
                    }
                    setAuditData(resp?.data)
                } catch (error) {
                    console.log(error)
                }
            }, 10 * 1000)
            return () => {
                if (interval) {
                    clearInterval(interval)
                }
            }
        }
    }, [docData])

    useEffect(() => {
        if (docData && docData.auditStatus === AuditStatus.AUDIT_GENERATED && !auditData) {
            async function getAuditDetails() {
                const resp = await auditService.auditDetails(docData.auditId, docData.id)
                setAuditData(resp?.data)
            }
            getAuditDetails()
        }
    }, [docData, auditData])

    const getDocDetails = async () => {
        const resp = await auditService.documentDetails(id)
        if (resp?.data.auditStatus === AuditStatus.NOT_STARTED) {
            showGlobalSnackbar('Audit not started', 'error')
            navigate('/')
        } else {
            const auditResp = await auditService.auditDetails(resp?.data.auditId, resp?.data.id)            
            setAuditData(auditResp?.data)
        }
        setDocData(resp?.data)
    }

    return (
        <>
            <Header title={docData?.name} breadCrumb1={'All Projects'} breadCrumb2={{ name: 'Project Details', link: `/project/details/${projectDetailsId}` }} breadCrumb3={'Audit Details'} />
            <div style={{ height: '100vh!important', overflow: 'hidden' }}>
                <Grid2 container spacing={3}>
                    <Grid2 size={8.5}>
                        <div className="flex justify-between items-center mt-2 mb-5 px-4">
                            <Typography variant="body1" color={Colors.tertiary} fontWeight={600}>
                                Page {pageNumber} of {numPages}
                            </Typography>

                            {/* <CustomTertiaryButton disableRipple>
                            <RestartIcon />

                            <span className="ms-2"> Restart Audit</span>
                        </CustomTertiaryButton> */}
                        </div>
                        <div
                            ref={containerRef}
                            className="px-4 pdf-container"
                            style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}
                        >
                            <Document file={docData?.docUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                {Array.from(new Array(numPages), (_, index) => (
                                    <div
                                        key={`page_${index + 1}`}
                                        data-page-number={index + 1}
                                        className="pdf-page mb-4"
                                    >
                                        <Page
                                            pageNumber={index + 1}
                                            renderTextLayer={false}
                                            width={window.innerWidth * 0.5}
                                        />
                                    </div>
                                ))}
                            </Document>
                        </div>
                    </Grid2>
                    <Grid2 size={3.5}>
                        <AuditSidebar docData={docData} auditData={auditData} />
                    </Grid2>
                </Grid2>
            </div>
        </>
       
    )
}
