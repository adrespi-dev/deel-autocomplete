import { useCallback, useState } from 'react';
import { AutoComplete } from './auto-complete/auto-complete';
import { AutoCompleteWithHooks } from './auto-complete/auto-complete-hooks';
import { ArrayDataSource, RemoteDataSource } from './auto-complete/data-source';
import './app.css';

const ITEMS = [
  'Deel',
  'Facebook',
  'Microsoft',
  'Google',
  'Apple',
  'Huawei',
  'Samsung',
  'Dell',
  'Hitachi',
  'IBM',
  'Sony',
  'Intel',
  'Yalo',
  'Uber',
  'ClientChatLive',
  'Devsu',
];

const App = () => {
  const useGithubAPI = useCallback(
    (searchTerm, itemsLimit) =>
      fetch(
        `https://api.github.com/search/repositories?q=${searchTerm}&per_page=${itemsLimit}`
      )
        .then((response) => response.json())
        .then((response) => response.items.map((i) => i.full_name)),
    []
  );

  return (
    <div className="app">
      <div className="container">
        <AutoCompleteExample
          usingHooks={true}
          label="Github Respositores (Remote API)"
          placeholder="Search a Repository..."
          dataSource={new RemoteDataSource({ performRequest: useGithubAPI })}
        />

        <AutoCompleteExample
          usingHooks={true}
          label="Companies (Mock Data)"
          placeholder="Search a company..."
          dataSource={
            new ArrayDataSource({
              items: ITEMS,
            })
          }
        />
      </div>
    </div>
  );
};

const AutoCompleteExample = ({ label, usingHooks, ...props }) => {
  const [selectedItem, setSelectedItem] = useState();
  const Component = usingHooks ? AutoCompleteWithHooks : AutoComplete;

  return (
    <div className="example-block">
      <label>{label}</label>
      <Component {...props} onItemClick={setSelectedItem} />

      {selectedItem && (
        <div className="selected-text">
          You selected: <strong>{selectedItem}</strong>
        </div>
      )}
    </div>
  );
};

export default App;
