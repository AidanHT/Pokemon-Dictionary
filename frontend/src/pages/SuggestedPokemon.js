import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Box,
    CircularProgress,
    useTheme,
    Button,
    Alert,
    Stack,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { usePokemonHistory } from '../context/PokemonHistoryContext';

const MAX_HISTORY = 20;

function SuggestedPokemon({ getTypeColor }) {
    const [suggestedPokemon, setSuggestedPokemon] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();
    const { searchHistory, removeFromHistory, clearHistory } = usePokemonHistory();

    const fetchSuggestedPokemon = async () => {
        setLoading(true);
        setError('');
        setErrorDetails('');

        try {
            // Test the server connection first
            try {
                await axios.get('http://localhost:3001/api/pokemon');
                console.log('Server connection test successful');
            } catch (e) {
                console.error('Server connection test failed:', e);
                throw new Error('Cannot connect to server. Please ensure the server is running.');
            }

            console.log('Using search history:', searchHistory);

            const response = await axios.get('http://localhost:3001/api/pokemon/smart-suggestions', {
                params: {
                    searchHistory: JSON.stringify(searchHistory),
                    limit: 15
                }
            });

            console.log('API Response:', response);

            if (response.data && Array.isArray(response.data)) {
                setSuggestedPokemon(response.data);
                if (response.data.length === 0) {
                    console.log('No pokemon found in response');
                    setError('No Pokémon found. Try viewing more Pokémon first.');
                }
            } else {
                console.error('Invalid response format:', response.data);
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Full error object:', error);
            let errorMessage = 'Failed to fetch Pokémon. ';
            let details = '';

            if (error.response) {
                console.error('Error response:', error.response);
                errorMessage += error.response.data?.error || 'Server error';
                details = error.response.data?.details || error.message;
            } else if (error.request) {
                console.error('Error request:', error.request);
                errorMessage += 'No response from server. Please check if the server is running.';
                details = 'Network error - no response';
            } else {
                console.error('Error message:', error.message);
                errorMessage += error.message;
                details = 'Request setup error';
            }

            setError(errorMessage);
            setErrorDetails(details);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestedPokemon();
    }, [searchHistory]);

    const handlePokemonClick = (poke) => {
        localStorage.setItem('selectedPokemon', JSON.stringify(poke));
        navigate(`/pokemon/${encodeURIComponent(poke.Name)}`);
    };

    const handleRetry = () => {
        fetchSuggestedPokemon();
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
                        Back
                    </Button>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.text.primary
                        }}
                    >
                        Smart Pokémon Suggestions
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={handleRetry}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    Refresh
                </Button>
            </Box>

            {searchHistory.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon /> Recent Views ({searchHistory.length})
                        </Typography>
                        <Tooltip title="Clear All History">
                            <IconButton onClick={clearHistory} size="small">
                                <ClearAllIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {searchHistory.map((poke) => (
                            <Chip
                                key={poke.Name}
                                label={poke.Name}
                                onDelete={() => removeFromHistory(poke.Name)}
                                deleteIcon={
                                    <Tooltip title="Remove from History">
                                        <DeleteIcon />
                                    </Tooltip>
                                }
                                onClick={() => handlePokemonClick(poke)}
                                sx={{
                                    bgcolor: `${getTypeColor(poke['Primary Type'])}40`,
                                    borderRadius: 2,
                                    '& .MuiChip-label': {
                                        color: getTypeColor(poke['Primary Type'])
                                    },
                                    '& .MuiChip-deleteIcon': {
                                        color: getTypeColor(poke['Primary Type']),
                                        '&:hover': {
                                            color: getTypeColor(poke['Primary Type'])
                                        }
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            {error}
                        </Typography>
                        {errorDetails && (
                            <Typography variant="body2" color="textSecondary">
                                Details: {errorDetails}
                            </Typography>
                        )}
                    </Alert>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRetry}
                        startIcon={<RefreshIcon />}
                        sx={{ mt: 2 }}
                    >
                        Try Again
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {suggestedPokemon.map((poke) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={poke.Name + poke.Name2}>
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    background: `linear-gradient(135deg, ${getTypeColor(poke['Primary Type'])}80 0%, ${getTypeColor(poke['Primary Type'])}30 100%)`,
                                    borderRadius: 4,
                                    border: `2px solid ${getTypeColor(poke['Primary Type'])}`,
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: `0 8px 16px ${getTypeColor(poke['Primary Type'])}90`,
                                        borderColor: getTypeColor(poke['Primary Type'])
                                    }
                                }}
                            >
                                <CardActionArea onClick={() => handlePokemonClick(poke)}>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            gutterBottom
                                            sx={{
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                textShadow: `2px 2px 4px ${getTypeColor(poke['Primary Type'])}`
                                            }}
                                        >
                                            {poke.Name} {poke.Name2 && `(${poke.Name2})`}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <Typography
                                                sx={{
                                                    bgcolor: getTypeColor(poke['Primary Type']),
                                                    color: 'white',
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: 2,
                                                    fontSize: '1rem',
                                                    fontWeight: 'bold',
                                                    boxShadow: `0 2px 4px ${getTypeColor(poke['Primary Type'])}90`
                                                }}
                                            >
                                                {poke['Primary Type']}
                                            </Typography>
                                            {poke['Secondary type'] && (
                                                <Typography
                                                    sx={{
                                                        bgcolor: getTypeColor(poke['Secondary type']),
                                                        color: 'white',
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        fontSize: '1rem',
                                                        fontWeight: 'bold',
                                                        boxShadow: `0 2px 4px ${getTypeColor(poke['Secondary type'])}90`
                                                    }}
                                                >
                                                    {poke['Secondary type']}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography variant="body2" component="div">
                                            <Grid container spacing={1}>
                                                <Grid item xs={6}>
                                                    <Typography sx={{ color: '#fff', textShadow: `1px 1px 2px ${getTypeColor(poke['Primary Type'])}` }}>
                                                        <strong>HP:</strong> {poke.HP}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography sx={{ color: '#fff', textShadow: `1px 1px 2px ${getTypeColor(poke['Primary Type'])}` }}>
                                                        <strong>Attack:</strong> {poke.Attack}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography sx={{ color: '#fff', textShadow: `1px 1px 2px ${getTypeColor(poke['Primary Type'])}` }}>
                                                        <strong>Defense:</strong> {poke.Defense}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography sx={{ color: '#fff', textShadow: `1px 1px 2px ${getTypeColor(poke['Primary Type'])}` }}>
                                                        <strong>Speed:</strong> {poke.Speed}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default SuggestedPokemon; 