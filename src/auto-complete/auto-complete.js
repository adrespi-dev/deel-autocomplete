import { Component, PureComponent } from 'react';
import { instanceOf } from 'prop-types';
import { DataSource } from './data-source';
import { ReactComponent as SearchIcon } from '../svg/search.svg';
import { ReactComponent as LoadingIcon } from '../svg/loading.svg';
import { ReactComponent as ErrorIcon } from '../svg/error.svg';

import './auto-complete.css';
import { debounce } from './debounce';

export class AutoComplete extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      searchTerm: '',
      status: 'ready',
      showPopup: false,
      suggestions: [],
    };
  }

  componentWillUnmount() {
    this.removeOutsideClickEvent();
  }

  updateEventListeners = () => {
    if (!this.state.searchTerm) {
      this.removeOutsideClickEvent();
    } else {
      if (!this.outsideClickHandler) {
        this.outsideClickHandler = (_) => {
          this.setState({ showPopup: false });
          this.removeOutsideClickEvent();
        };

        document.addEventListener('click', this.outsideClickHandler);
      }
    }
  };

  removeOutsideClickEvent = () => {
    document.removeEventListener('click', this.outsideClickHandler);
    this.outsideClickHandler = null;
  };

  handleAutoCompleteClick = (e) => {
    e.stopPropagation();
  };

  handleInputChanged = (e) => {
    const searchTerm = e.target.value;
    this.setState({ searchTerm, showPopup: true, suggestions: [] }, () => {
      this.searchSuggestions();
      this.updateEventListeners();
    });
  };

  searchSuggestions = debounce(() => {
    this.setState({ status: 'loading' });

    this.props.dataSource
      .search(this.state.searchTerm)
      .then((suggestions) => {
        this.setState({ suggestions, status: 'ready' });
      })
      .catch(() => this.setState({ status: 'error' }));
  });

  handleItemClick = (item) => {
    const { onItemClick: callback } = this.props;
    if (callback) {
      callback(item);
    } else {
      console.log('Item clicked: ', item);
    }

    this.setState({ searchTerm: item, showPopup: false });
  };

  render() {
    const { searchTerm, status, showPopup, suggestions } = this.state;

    return (
      <div
        className={`autocomplete autocomplete-status--${status}`}
        onClick={this.handleAutoCompleteClick}>
        <div className="autocomplete-wrapper">
          <input
            className="autocomplete-input"
            placeholder={this.props.placeholder}
            value={searchTerm}
            onChange={this.handleInputChanged}
          />
          <div className="autocomplete-icon">
            {status === 'ready' && <SearchIcon />}
            {status === 'loading' && <LoadingIcon className="loading" />}
            {status === 'error' && <ErrorIcon className="error" />}
          </div>
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
                onItemClick={this.handleItemClick}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

AutoComplete.propTypes = {
  dataSource: instanceOf(DataSource),
};

class AutoCompleteItem extends PureComponent {
  render() {
    const { text, highlightedText, onItemClick } = this.props;

    return (
      <li
        dangerouslySetInnerHTML={{ __html: highlightedText }}
        className="autocomplete-menu-item"
        onClick={() => onItemClick(text)}></li>
    );
  }
}
