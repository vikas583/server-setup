import  { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Colors } from '../../../../common/colors';
import { CustomSecondaryButton } from '../../../../common/common.style';

export default function DetailsRatingComponent(){
    const [step, setStep] = useState(1);
    const [ratings, setRatings] = useState<{ step1: number | null; rating1: number | null; step2: number | null; rating2: number | null }>({
        step1: 1,
        rating1: null,
        step2: 2,
        rating2: null,
    });
    const [isVisible, setIsVisible] = useState(true);


    const handleRatingClick = (value: number) => {
        if (step === 1) {
            setRatings((prev) => ({ ...prev, rating1: value }));
            setStep(2);
        } else if (step === 2) {
            setRatings((prev) => ({ ...prev, rating2: value }));
            setStep(3);
        }
    };


    useEffect(() => {
        if (step === 3 && ratings.rating2 !== null) {
        
        }
    }, [step, ratings.rating2]);

    const handleClose = () => {
        setIsVisible(false);
    };

    return isVisible ? (
        <Box
            sx={{
                width: '368px',
                height:'180px',
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                bgcolor: 'white',
                boxShadow: 3,
                borderRadius: '10px',
                padding: '16px',
                zIndex: 1000,
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">
                    {step === 1
                        ? 'Rate your experience (1/2)'
                        : step === 2
                            ? 'Rate your experience (2/2)'
                            : ''}
                </Typography>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {step === 1 && (
                <>
                    <Typography mt={1} mb={2}>
                        The project set up wizard was easy to use.
                    </Typography>

                    <Box display="flex" justifyContent="space-between">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <CustomSecondaryButton
                                key={num}
                                disableRipple
                                onClick={() => handleRatingClick(num)}
                                sx={{
                                    minWidth: '56px',
                                }}
                            >
                                {num}
                            </CustomSecondaryButton>
                        ))}
                    </Box>

                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Typography variant="caption">Strongly Disagree</Typography>
                        <Typography variant="caption">Strongly Agree</Typography>
                    </Box>
                </>
            )}

            {step === 2 && (
                <>
                    <Typography mt={1} mb={2}>
                        This project setup process meets my needs.
                    </Typography>

                    <Box display="flex" justifyContent="space-between">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <CustomSecondaryButton
                                key={num}
                                variant="outlined"
                                onClick={() => handleRatingClick(num)}
                                sx={{
                                    minWidth: '56px',
                                }}
                            >
                                {num}
                            </CustomSecondaryButton>
                        ))}
                    </Box>

                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Typography variant="caption">Strongly Disagree</Typography>
                        <Typography variant="caption">Strongly Agree</Typography>
                    </Box>
                </>
            )}

            {step === 3 && (
                <div>

                <Typography variant="body1" textAlign="center" fontWeight={600} >
                    Thank you for sharing your experience.
                    
                </Typography>
                <Typography variant="body1" textAlign="center" mt={2}>
                        Your feedback is important to us!

                </Typography>
                </div>
            )}
        </Box>
    ) : null;
};


