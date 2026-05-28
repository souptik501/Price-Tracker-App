import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const AVAX_RATE = 5000;
const DUMMY_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const FALLBACK_IMAGE = 'https://placehold.co/240x180?text=Product';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Type a product and click Search.');
  const [wallet, setWallet] = useState({ connected: false, address: '', balance: 1.234 });
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (!window.ethereum) return undefined;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setWallet((current) => ({ ...current, connected: true, address: accounts[0] }));
      } else {
        setWallet((current) => ({ ...current, connected: false, address: '' }));
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setMessage('MetaMask not found. Install MetaMask to connect wallet.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet({ connected: true, address: accounts[0], balance: 1.234 });
      setMessage('Wallet connected. Ready to compare and simulate AVAX payment.');
    } catch {
      setMessage('Wallet connection cancelled.');
    }
  };

  const doSearch = async (event) => {
    event.preventDefault();

    if (!query.trim()) {
      setMessage('Please enter a product name first.');
      return;
    }

    setLoading(true);
    setMessage('Building smart query and fetching prices...');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/search`, { query });
      const data = response.data;
      setResults(data.results || []);
      const resultCount = data.results?.length || 0;
      setMessage(
        resultCount > 0
          ? `Showing ${resultCount} deals for "${data.query || query}"`
          : `No deals found for "${data.query || query}". Try a more specific product name.`
      );
    } catch (error) {
      console.error(error);
      setMessage('Search failed. Check backend or API keys.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item) => {
    setIsBuying(true);
    setMessage(`Simulating AVAX payment for Rs. ${item.price.toLocaleString('en-IN')}...`);
    await new Promise((resolve) => setTimeout(resolve, 850));
    setIsBuying(false);
    setMessage(`Payment simulated on Avalanche Fuji Testnet. Sent 0.001 AVAX to ${DUMMY_ADDRESS}`);
  };

  const cheapestIndex = results.reduce((best, item, index) => {
    if (best === -1 || item.price < results[best].price) return index;
    return best;
  }, -1);

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <p className="eyebrow">Universal Smart Price Comparison</p>
          <h1>Find the best deal across India with AVAX demo</h1>
          <p className="sub">Search once, compare prices, and simulate Avalanche payment.</p>
        </div>
        <div className="wallet-box">
          <p className="wallet-title">Avalanche Fuji Wallet</p>
          <p className="wallet-balance">Balance: {wallet.balance.toFixed(3)} AVAX</p>
          <p className="wallet-address">{wallet.connected ? wallet.address : 'Not connected'}</p>
          <button className="btn" onClick={connectWallet}>Connect MetaMask</button>
        </div>
      </header>

      <main>
        <section className="search-card">
          <form onSubmit={doSearch} className="search-form">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="search-input"
              placeholder="e.g. boAt Airdopes 141"
            />
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          <p className="helper">Search via smart query builder + SerpAPI Google Shopping compare engine.</p>
        </section>

        <section className="status-line">
          <span>{message}</span>
        </section>

        <section className="results-grid">
          {loading && Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card skeleton">
              <div className="simg"></div>
              <div className="stext"></div>
              <div className="stext short"></div>
            </div>
          ))}

          {!loading && results.length === 0 && (
            <div className="empty">No results yet. Search a product to compare prices.</div>
          )}

          {!loading && results.map((item, index) => {
            const isBest = index === cheapestIndex;

            return (
              <article key={`${item.site}-${index}-${item.price}`} className={`card ${isBest ? 'best' : ''}`}>
                <div className="card-head">
                  <span className="logo">{item.logo}</span>
                  <div>
                    <p className="site">{item.site}</p>
                    {isBest && <span className="badge">Best Deal</span>}
                  </div>
                </div>
                <div className="card-thumb">
                  <img
                    src={item.thumbnail || FALLBACK_IMAGE}
                    alt={item.title}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <h3>{item.title}</h3>
                <p className="price">Rs. {item.price.toLocaleString('en-IN')}</p>
                <p className="avax">~ {(item.price / AVAX_RATE).toFixed(3)} AVAX</p>
                <div className="buttons-row">
                  <a className="btn btn-ghost" href={item.url} target="_blank" rel="noreferrer">Go to Site</a>
                  <button
                    disabled={!wallet.connected || isBuying}
                    className="btn btn-primary"
                    onClick={() => handleBuy(item)}
                  >
                    Buy with AVAX
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <footer className="footer">Powered by Avalanche - Demo app - No real payments</footer>
    </div>
  );
}

export default App;
