import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function PokemonLogo() {
    const navigate = useNavigate();

    return (
        <Box
            component="img"
            src="/images/pokeball.png"
            alt="Pokemon Logo"
            sx={{
                height: 40,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                animation: 'float 3s ease-in-out infinite',
                '&:hover': {
                    transform: 'scale(1.1) rotate(15deg)',
                },
                '@keyframes float': {
                    '0%, 100%': {
                        transform: 'translateY(0)',
                    },
                    '50%': {
                        transform: 'translateY(-5px)',
                    },
                },
            }}
            onClick={() => navigate('/')}
        />
    );
}

export default PokemonLogo; 