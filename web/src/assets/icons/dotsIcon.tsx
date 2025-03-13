interface Color {
    fill?: string;
}

export const DotsIcon: React.FC<Color> = ({ fill = '#158277' }) => {
    return (
        <svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.0625 17.25C16.0625 16.5391 16.6367 15.9375 17.375 15.9375C18.0859 15.9375 18.6875 16.5391 18.6875 17.25C18.6875 17.9883 18.0859 18.5625 17.375 18.5625C16.6367 18.5625 16.0625 17.9883 16.0625 17.25ZM11.6875 17.25C11.6875 16.5391 12.2617 15.9375 13 15.9375C13.7109 15.9375 14.3125 16.5391 14.3125 17.25C14.3125 17.9883 13.7109 18.5625 13 18.5625C12.2617 18.5625 11.6875 17.9883 11.6875 17.25ZM9.9375 17.25C9.9375 17.9883 9.33594 18.5625 8.625 18.5625C7.88672 18.5625 7.3125 17.9883 7.3125 17.25C7.3125 16.5391 7.88672 15.9375 8.625 15.9375C9.33594 15.9375 9.9375 16.5391 9.9375 17.25Z" 
            fill={fill} />
        </svg>

    )
}

