import React from 'react';

interface Props {
  searchTerm: string;
  onSearch: (term: string) => void;
  onClear: () => void;
}

const SearchBar: React.FC<Props> = ({ searchTerm, onSearch, onClear }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="🔍 Search transactions..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="search-input"
      />
      {searchTerm && (
        <button onClick={onClear} className="clear-search">
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;