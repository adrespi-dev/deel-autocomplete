import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactComponent as SearchIcon } from '../svg/search.svg';
import { ReactComponent as LoadingIcon } from '../svg/loading.svg';
import { ReactComponent as ErrorIcon } from '../svg/error.svg';

import './auto-complete.css';
import { debounce } from './debounce';

export const AutoCompleteWithHooks = ({
  placeholder,
  dataSource,
  onItemClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('ready');
  const [showPopup, setShowPopup] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [outsideClickHandler, setOutsideClickHandler] = useState();

  const removeOutsideClickEvent = useCallback(() => {
    document.removeEventListener('click', outsideClickHandler);
    setOutsideClickHandler(null);
  }, [outsideClickHandler, setOutsideClickHandler]);

  const handleItemClick = useCallback(
    (item) => {
      if (onItemClick) {
        onItemClick(item);
      } else {
        console.log('Item clicked: ', item);
      }

      setSearchTerm(item);
      setShowPopup(false);
    },
    [onItemClick, setSearchTerm, setShowPopup]
  );

  const updateEventListeners = useCallback(() => {
    if (!searchTerm) {
      removeOutsideClickEvent();
    } else {
      if (!outsideClickHandler) {
        const handler = (_) => {
          setShowPopup(false);
          removeOutsideClickEvent();
        };

        setOutsideClickHandler(() => handler);
        document.addEventListener('click', handler);
      }
    }
  }, [
    searchTerm,
    removeOutsideClickEvent,
    outsideClickHandler,
    setOutsideClickHandler,
  ]);

  const searchSuggestions = useMemo(() => {
    const handler = (searchTerm) => {
      setStatus('loading');
      dataSource
        .search(searchTerm)
        .then((suggestions) => {
          setSuggestions(suggestions);
          setStatus('ready');
        })
        .catch(() => setStatus('error'));
    };

    return debounce(handler, 300);
  }, [setStatus, dataSource, setSuggestions]);

  const handleInputChanged = useCallback(
    (e) => {
      setSearchTerm(e.target.value);
      setSuggestions([]);
      setShowPopup(true);

      updateEventListeners();
      searchSuggestions(e.target.value);
    },
    [
      setSearchTerm,
      setShowPopup,
      setSuggestions,
      updateEventListeners,
      searchSuggestions,
    ]
  );

  const statusIcon = useMemo(() => {
    if (status === 'ready') {
      return <SearchIcon />;
    }
    if (status === 'loading') {
      return <LoadingIcon className="loading" />;
    }

    return <ErrorIcon className="error" />;
  }, [status]);

  useEffect(() => {
    return () => {
      document.removeEventListener('click', outsideClickHandler);
    };
  }, [outsideClickHandler]);

  return (
    <div
      className={`autocomplete autocomplete-status--${status}`}
      onClick={(e) => e.stopPropagation()}>
      <div className="autocomplete-wrapper">
        <input
          className="autocomplete-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChanged}
        />
        <div className="autocomplete-icon">{statusIcon}</div>
      </div>
      <div
        className={`autocomplete-popup popup--${
          showPopup && suggestions.length > 0 ? 'show' : 'hide'
        }`}>
        <ul className="autocomplete-menu">
          {suggestions.map((s) => (
            <AutoCompleteItem
              key={s.text}
              text={s.text}
              highlightedText={s.highlightedText}
              onItemClick={handleItemClick}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

const AutoCompleteItem = ({ text, highlightedText, onItemClick }) => {
  return (
    <li
      dangerouslySetInnerHTML={{ __html: highlightedText }}
      className="autocomplete-menu-item"
      onClick={() => onItemClick(text)}></li>
  );
};
