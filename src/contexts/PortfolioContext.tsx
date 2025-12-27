import React, { createContext, useContext } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';

const PortfolioContext = createContext<any>(null);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
    const { data, loading } = usePortfolioData();

    return (
        <PortfolioContext.Provider value={{ data, loading }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (context === undefined) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
};
