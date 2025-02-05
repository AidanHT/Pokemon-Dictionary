import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import {
    Container,
    TextField,
    Grid,
    Card,
    CardContent,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    CircularProgress,
    Alert,
    Snackbar,
    CardActionArea,
    IconButton,
    useTheme,
    Button
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import RecommendIcon from '@mui/icons-material/Recommend';
import axios from 'axios';
import PokemonDisplay from './pages/PokemonDisplay';
import SuggestedPokemon from './pages/SuggestedPokemon';
import { PokemonHistoryProvider } from './context/PokemonHistoryContext';
import { usePokemonHistory } from './context/PokemonHistoryContext';
import PokemonLogo from './components/PokemonLogo';

function PokemonList({ getTypeColor, toggleTheme, mode }) {
    const [pokemon, setPokemon] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();
    const { addToHistory } = usePokemonHistory();
    const types = ['GRASS', 'POISON', 'FIRE', 'FLYING', 'DRAGON', 'WATER', 'BUG', 'NORMAL', 'ELECTRIC', 'GROUND', 'FAIRY', 'FIGHTING', 'PSYCHIC', 'ROCK', 'STEEL', 'ICE', 'GHOST', 'DARK'];

    useEffect(() => {
        fetchPokemon();
    }, []);

    const fetchPokemon = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:3001/api/pokemon');
            setPokemon(response.data);
        } catch (error) {
            console.error('Error fetching pokemon:', error);
            setError('Failed to fetch Pokemon. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        setLoading(true);
        setError('');

        try {
            if (value) {
                const response = await axios.get(`http://localhost:3001/api/pokemon/search?name=${value}`);
                setPokemon(response.data);
            } else {
                fetchPokemon();
            }
        } catch (error) {
            console.error('Error searching pokemon:', error);
            setError('Failed to search Pokemon. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = async (event) => {
        const value = event.target.value;
        setSelectedType(value);
        setLoading(true);
        setError('');

        try {
            if (value) {
                const response = await axios.get(`http://localhost:3001/api/pokemon/type/${encodeURIComponent(value)}`);
                setPokemon(response.data);
            } else {
                fetchPokemon();
            }
        } catch (error) {
            console.error('Error filtering by type:', error);
            setError('Failed to filter Pokemon by type. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePokemonClick = (poke) => {
        addToHistory(poke);
        localStorage.setItem('selectedPokemon', JSON.stringify(poke));
        navigate(`/pokemon/${encodeURIComponent(poke.Name)}`);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PokemonLogo />
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.text.primary,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Pokemon Database
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RecommendIcon />}
                        onClick={() => navigate('/suggested')}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Suggested Pokemon
                    </Button>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="Search Pokemon"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                />

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Type</InputLabel>
                    <Select
                        value={selectedType}
                        label="Filter by Type"
                        onChange={handleTypeChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {types.map((type) => (
                            <MenuItem
                                key={type}
                                value={type}
                                sx={{
                                    backgroundColor: `${getTypeColor(type)}20`,
                                    '&:hover': {
                                        backgroundColor: `${getTypeColor(type)}40`
                                    }
                                }}
                            >
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {pokemon.map((poke) => (
                        <Grid item xs={12} sm={6} md={4} key={poke.Name + poke.Name2}>
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
                                                <Grid item xs={6}>
                                                    <Typography sx={{ color: '#fff', textShadow: `1px 1px 2px ${getTypeColor(poke['Primary Type'])}` }}>
                                                        <strong>Sp.Attack:</strong> {poke['Sp.Attack']}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography sx={{ color: '#fff', textShadow: `1px 1px 2px ${getTypeColor(poke['Primary Type'])}` }}>
                                                        <strong>Sp.Defense:</strong> {poke['Sp.Defense']}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography
                                                        sx={{
                                                            mt: 1,
                                                            fontWeight: 'bold',
                                                            color: '#fff',
                                                            textAlign: 'center',
                                                            fontSize: '1.2rem',
                                                            textShadow: `2px 2px 4px ${getTypeColor(poke['Primary Type'])}`,
                                                            bgcolor: `${getTypeColor(poke['Primary Type'])}90`,
                                                            borderRadius: 2,
                                                            py: 1
                                                        }}
                                                    >
                                                        Total: {poke.Total}
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

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
            >
                <Alert
                    onClose={() => setError('')}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}

function App({ mode, setMode }) {
    const getTypeColor = (type) => {
        const colors = {
            GRASS: '#78C850',
            POISON: '#A040A0',
            FIRE: '#F08030',
            FLYING: '#A890F0',
            DRAGON: '#7038F8',
            WATER: '#6890F0',
            BUG: '#A8B820',
            NORMAL: '#A8A878',
            ELECTRIC: '#F8D030',
            GROUND: '#E0C068',
            FAIRY: '#EE99AC',
            FIGHTING: '#C03028',
            PSYCHIC: '#F85888',
            ROCK: '#B8A038',
            STEEL: '#B8B8D0',
            ICE: '#98D8D8',
            GHOST: '#705898',
            DARK: '#705848'
        };
        return colors[type] || '#68A090';
    };

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <PokemonHistoryProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<PokemonList getTypeColor={getTypeColor} toggleTheme={toggleTheme} mode={mode} />} />
                    <Route path="/pokemon/:pokemonName" element={<PokemonDisplay getTypeColor={getTypeColor} toggleTheme={toggleTheme} mode={mode} />} />
                    <Route path="/suggested" element={<SuggestedPokemon getTypeColor={getTypeColor} />} />
                </Routes>
            </Router>
        </PokemonHistoryProvider>
    );
}

export default App; 