import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Button,
    LinearProgress,
    Chip,
    Fade,
    Zoom,
    Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import RecommendIcon from '@mui/icons-material/Recommend';
import { usePokemonHistory } from '../context/PokemonHistoryContext';

function PokemonDisplay({ getTypeColor }) {
    const navigate = useNavigate();
    const pokemon = JSON.parse(localStorage.getItem('selectedPokemon'));
    const { addToHistory } = usePokemonHistory();
    const mainColor = pokemon ? getTypeColor(pokemon['Primary Type']) : '#2F6690';
    const tertiaryColor = pokemon ? `${getTypeColor(pokemon['Primary Type'])}40` : '#2F669040';

    useEffect(() => {
        if (pokemon) {
            addToHistory(pokemon);
        }
    }, [pokemon, addToHistory]);

    const getStatColor = (statName) => {
        const colors = {
            'HP': '#FF5959',          // Red for health
            'Attack': '#F5AC78',      // Orange for attack
            'Defense': '#FAE078',     // Yellow for defense
            'Speed': '#9DB7F5',       // Light blue for speed
            'Sp. Attack': '#9DB7F5',  // Purple for special attack
            'Sp. Defense': '#A7DB8D'  // Green for special defense
        };
        return colors[statName] || mainColor;
    };

    const StatBar = ({ label, value, maxValue = 255, index }) => {
        const percentage = (value / maxValue) * 100;
        const statColor = getStatColor(label);

        return (
            <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                    alignItems: 'center'
                }}>
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#fff',
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            fontSize: '0.875rem',
                            textShadow: `1px 1px 0 ${statColor}`
                        }}
                    >
                        {label}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 'bold',
                            color: '#fff',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            textShadow: `1px 1px 0 ${statColor}`
                        }}
                    >
                        {value}
                        {percentage >= 80 && <WhatshotIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: `${statColor}20`,
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: statColor,
                            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent)',
                            backgroundSize: '1rem 1rem',
                            animation: 'progress-bar-stripes 1s linear infinite',
                        },
                        '@keyframes progress-bar-stripes': {
                            '0%': { backgroundPosition: '1rem 0' },
                            '100%': { backgroundPosition: '0 0' }
                        }
                    }}
                />
            </Box>
        );
    };

    if (!pokemon) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h5" align="center">
                    Pokemon not found
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            bgcolor: mainColor,
                            '&:hover': {
                                bgcolor: `${mainColor}dd`
                            }
                        }}
                    >
                        Back to List
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    Back to List
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RecommendIcon />}
                    onClick={() => navigate('/suggested')}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    Back to Suggestions
                </Button>
            </Stack>

            <Zoom in timeout={500}>
                <Paper
                    elevation={8}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${mainColor}80 0%, ${mainColor}30 100%)`,
                        border: `2px solid ${mainColor}`,
                        boxShadow: `0 8px 32px ${mainColor}90`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <Typography
                            variant="h3"
                            component="h1"
                            gutterBottom
                            align="center"
                            sx={{
                                fontWeight: 900,
                                color: '#fff',
                                mb: 4,
                                textShadow: `2px 2px 4px ${mainColor}`
                            }}
                        >
                            {pokemon.Name} {pokemon.Name2 && `(${pokemon.Name2})`}
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 4,
                                position: 'relative'
                            }}
                        >
                            <Box
                                component="img"
                                src={`/images/${pokemon.Name.toLowerCase()}.png`}
                                alt={pokemon.Name}
                                sx={{
                                    width: '200px',
                                    height: '200px',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.2))',
                                    animation: 'float 3s ease-in-out infinite',
                                    '@keyframes float': {
                                        '0%, 100%': {
                                            transform: 'translateY(0)'
                                        },
                                        '50%': {
                                            transform: 'translateY(-10px)'
                                        }
                                    }
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: '-10px',
                                    width: '160px',
                                    height: '20px',
                                    background: `radial-gradient(ellipse at center, ${mainColor}40 0%, transparent 70%)`,
                                    animation: 'shadow 3s ease-in-out infinite',
                                    '@keyframes shadow': {
                                        '0%, 100%': {
                                            transform: 'scale(1)',
                                            opacity: 0.4
                                        },
                                        '50%': {
                                            transform: 'scale(0.8)',
                                            opacity: 0.6
                                        }
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'center',
                            mb: 4
                        }}>
                            <Chip
                                label={pokemon['Primary Type']}
                                sx={{
                                    bgcolor: mainColor,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    px: 2
                                }}
                            />
                            {pokemon['Secondary type'] && (
                                <Chip
                                    label={pokemon['Secondary type']}
                                    sx={{
                                        bgcolor: getTypeColor(pokemon['Secondary type']),
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        px: 2
                                    }}
                                />
                            )}
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Paper
                                    elevation={4}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        height: '100%',
                                        border: `2px solid ${mainColor}`,
                                        background: `linear-gradient(135deg, ${mainColor}40 0%, ${mainColor}10 100%)`
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            mb: 3,
                                            textShadow: `1px 1px 2px ${mainColor}`
                                        }}
                                    >
                                        Base Stats
                                    </Typography>
                                    <StatBar label="HP" value={pokemon.HP} index={0} />
                                    <StatBar label="Attack" value={pokemon.Attack} index={1} />
                                    <StatBar label="Defense" value={pokemon.Defense} index={2} />
                                    <StatBar label="Speed" value={pokemon.Speed} index={3} />
                                    <StatBar label="Sp. Attack" value={pokemon['Sp.Attack']} index={4} />
                                    <StatBar label="Sp. Defense" value={pokemon['Sp.Defense']} index={5} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper
                                    elevation={4}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        height: '100%',
                                        border: `2px solid ${mainColor}`,
                                        background: `linear-gradient(135deg, ${mainColor}40 0%, ${mainColor}10 100%)`
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            mb: 3,
                                            textShadow: `1px 1px 2px ${mainColor}`
                                        }}
                                    >
                                        Total Stats
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '80%'
                                        }}
                                    >
                                        <Typography
                                            variant="h1"
                                            sx={{
                                                fontWeight: 900,
                                                color: '#fff',
                                                textShadow: `2px 2px 4px ${mainColor}`
                                            }}
                                        >
                                            {pokemon.Total}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Zoom>
        </Container>
    );
}

export default PokemonDisplay; 