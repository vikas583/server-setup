import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { Colors } from '../../../../common/colors';
import { CustomPrimaryButton } from '../../../../common/common.style';

interface DashboardFeedbackButtonProps {
    onSubmitFeedback?: (feedback: { rating: number | null; text: string }) => void;
}

const DashboardFeedbackButton: React.FC<DashboardFeedbackButtonProps> = ({ onSubmitFeedback }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1); // Step state to control the multi-step process
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [feedbackText, setFeedbackText] = useState<string>(''); // Text feedback

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        setStep(1); // Reset to first step when reopened
    };

    const handleSubmitRating = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRating !== null) {
            setStep(2); // Move to the text feedback step
        }
    };

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmitFeedback) {
            onSubmitFeedback({ rating: selectedRating, text: feedbackText });
        }
        setStep(3); // Move to the thank you message
    };

    // Style for button and form to align and slide horizontally
    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
    };

    const buttonStyle: React.CSSProperties = {
        writingMode: 'vertical-rl',
        backgroundColor: '#158281',
        color: 'white',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '20px 0 0 20px',
        fontSize: '16px',
        transition: 'all 0.3s ease-in-out',
        zIndex: 1001,
        height: '200px',
        textAlign:'center'
    };

    const formContainerStyle: React.CSSProperties = {
        backgroundColor: 'white',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '5px',
        width: isOpen ? '380px' : '0', // Adjust form size and remove extra padding
        height: '200px',
        overflow: 'hidden', // Hide content until expanded
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: isOpen ? '-10px' : '0px', // Adjust for spacing next to the button
    };

    const formContentStyle: React.CSSProperties = {
        padding: '15px 20px', // Apply controlled padding inside the form content
    };

    const ratingButtonStyle: React.CSSProperties = {
        border: '1px solid #158281',
        backgroundColor: selectedRating ? '#158281' : 'white',
        color: selectedRating ? 'white' : '#158281',
        padding: '10px 15px',
        borderRadius: '5px',
        margin: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    };

    const submitButtonStyle: React.CSSProperties = {
        backgroundColor: '#158281',
        color: 'white',
        padding: '10px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s ease',
    };

    return (
        <div style={containerStyle}>
            {/* The Button */}
            <div
                style={buttonStyle}
                onClick={toggleOpen}
            >
                Provide Feedback
            </div>

            {/* The Form */}
            <div style={formContainerStyle}>
                {isOpen && (
                    <div style={formContentStyle}>
                        {step === 1 && (
                            <>
                                <h3>How satisfied are you with IntelVerse so far?</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                        
                                            key={rating}
                                            style={{
                                                ...ratingButtonStyle,
                                                backgroundColor: selectedRating === rating ? '#158281' : 'white',
                                                color: selectedRating === rating ? 'white' : '#158281',
                                            }}
                                            onClick={() => setSelectedRating(rating)}
                                        >
                                            {rating}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Very Dissatisfied</span>
                                    <span>Neutral</span>
                                    <span>Very Satisfied</span>
                                </div>
                                <CustomPrimaryButton sx={{mt:0.5}} disableRipple  onClick={handleSubmitRating}>
                                    Next
                                </CustomPrimaryButton>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h3>Please provide additional feedback:</h3>
                                <textarea
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #158281' }}
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Write your feedback here..."
                                    rows={3}
                                />
                                <CustomPrimaryButton sx={{ mt: 0.5 }} onClick={handleSubmitFeedback}>
                                    Next
                                </CustomPrimaryButton>
                            </>
                        )}

                        {step === 3 && (
                            <Box sx={{textAlign:'center'}}>
                                <Typography variant='body1' fontWeight={600} mb={2}>Thank you for sharing your experience.</Typography>
                                <Typography variant='body1' mb={2}>Your feedback is important to us!</Typography>
                                <Typography variant='body1' fontWeight={600} color={Colors.tertiary}>Request an email follow-up</Typography>
                            </Box>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardFeedbackButton;
