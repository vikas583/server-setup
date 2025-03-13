import { useState } from 'react';
import { Box, Button, Typography, Grid2, IconButton } from '@mui/material';
import { Colors } from '../../../../common/colors';
import CloseIcon from '@mui/icons-material/Close';
const AuditFeedbackForm: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    const handleRatingClick = (rating: number) => {
        setSelectedRating(rating);
        setActiveStep(1); // Move to thank you screen
    };
    const handleClose = () => {
        setIsVisible(false);
    };

    return isVisible ?(
        <Box sx={{  p: 1, border: '1px solid #E0E0E0', background:'white', borderRadius: 2, minHeight:'154px' }} mb={2}>
            {activeStep === 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Share your feedback
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        How likely are you to recommend IntelVerse to a friend or colleague?
                    </Typography>
                    <Grid2 container spacing={0.2} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                            <Grid2  key={number}>
                                <Button
                                    variant={selectedRating === number ? 'contained' : 'outlined'}
                                    onClick={() => handleRatingClick(number)}
                                    sx={{ width: '10px', minWidth: '10px', color: Colors.tertiary, borderColor:Colors.tertiary  }}
                                >
                                    {number}
                                </Button>
                            </Grid2>
                        ))}
                    </Grid2>
                    <Grid2 container justifyContent="space-between" sx={{ mt: 2 }}>
                        <Typography variant="body2">Not at all likely</Typography>
                        <Typography variant="body2">Extremely Likely</Typography>
                    </Grid2>
                </Box>
            )}

            {activeStep === 1 && (
                <Box
                   
                >
                    <div className="flex justify-end">

                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        
                        
                    >
                        <CloseIcon />
                    </IconButton>
                    </div>
                    <div className="text-center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Thank you for sharing your experience.
                    </Typography>
                    <Typography variant="body1">
                        Your feedback is important to us!
                    </Typography>

                    </div>
                </Box>
            )}
        </Box>
    ) : null;
};

export default AuditFeedbackForm;
