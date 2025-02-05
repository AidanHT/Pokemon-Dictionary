import React, { createContext, useContext, useState, useEffect } from 'react';

const MAX_HISTORY = 20;
const PokemonHistoryContext = createContext();

export function PokemonHistoryProvider({ children }) {
    const [searchHistory, setSearchHistory] = useState([]);

    // Load history on mount
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('pokemonSearchHistory') || '[]');
        setSearchHistory(history);
    }, []);

    const addToHistory = (pokemon) => {
        setSearchHistory(prevHistory => {
            // Remove if already exists to avoid duplicates
            const filteredHistory = prevHistory.filter(p => p.Name !== pokemon.Name);
            // Add to beginning of array and limit length
            const newHistory = [pokemon, ...filteredHistory].slice(0, MAX_HISTORY);
            localStorage.setItem('pokemonSearchHistory', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const removeFromHistory = (pokemonName) => {
        setSearchHistory(prevHistory => {
            const newHistory = prevHistory.filter(p => p.Name !== pokemonName);
            localStorage.setItem('pokemonSearchHistory', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.setItem('pokemonSearchHistory', '[]');
    };

    return (
        <PokemonHistoryContext.Provider value={{
            searchHistory,
            addToHistory,
            removeFromHistory,
            clearHistory
        }}>
            {children}
        </PokemonHistoryContext.Provider>
    );
}

export function usePokemonHistory() {
    const context = useContext(PokemonHistoryContext);
    if (!context) {
        throw new Error('usePokemonHistory must be used within a PokemonHistoryProvider');
    }
    return context;
} 