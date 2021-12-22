# Questions

### 1. What is the difference between Component and PureComponent? give an example where it might break my app.

`PureComponent` is exactly the same as `Component` except that do not re-renders when the value of state and props has been updated with the same values.

### 2. Context + ShouldComponentUpdate might be dangerous. Can think of why is that?

It's because the `shouldComponentUpdate` could prevent a component from re-rendering if their `state` or `props` haven't changed, so if a `Context` value is changed, the component doesn't render and never get the updated value.

### 3. Describe 3 ways to pass information from a component to its PARENT.

1. You can pass a callback function in the `props` of the child component so it can invoke the callback with any data.

```js
const Parent = () => (
  <Childen callback={(dataFromChild) => alert(dataFromChild)} />
);
```

2. You can use the `Context API` to update the value in a child component and have its value propagated to its parent component.

```js
const context = createContext();
const app = () =>
  <AppContext.Provider value={{updateValue: someFunction}}>
    {children}
  </AppContext.Provider>
)

const Children = () => {
  const { updateValue } = useContext(context);
  updateValue({data: 1})
}

const Parent = () => {
  const { data } = useContext(context); // 1
}

```

3. You can use a state management library like Redux or Mobx

### 4. Give 2 ways to prevent components from re-rendering.

1. You can use the `shouldComponentUpdate` method and return false to prevent a re-render (this is how PureComponents are implemented).

2. You can use `React.memo` and pass a custom comparison function to decide when a component should be re-rendered

### 5. What is a fragment and why do we need it? Give an example where it might break my app.

React fragments are a modern and clearner sintax to avoid wrapping our components with unnecessary `div` elements.
It could be problematic if a `HOC` or parent container try to inject styles or DOM events into the fragment, since fragments are just virtual DOM elements, this will not work.

### 6. Give 3 examples of the HOC pattern.

1. The `Context API` uses this pattern, the provider that is created from a context is a `HOC`

```js
const Context = React.createContext();

// This is a HOC
<Context.Provider>
  <Child />
<Context.Provider/>
```

2. You could implement a component that logs the props of its child component

```js
const LoggingHOC = ({ children, ...props }) => {
  console.logs('Props', props);
  return <>{children}</>;
};
```

3. You could implement a component that shows a loader until some data is ready

```js
const LoadingHOC = ({ children, isReady }) => {
  return isReady ? <>{children}</> : <AppLoader />;
};
```

### 7. what's the difference in handling exceptions in promises, callbacks and async...await.

In an `async...await` function you can use `try catch` to handle exceptions and `throw` to raise them.

```js
async f() {
  try{
    await brokenFunction(); // will raise error
  }
  catch(e) {
    console.log('Handling exception');
  }
}
```

In a promise you can use the `catch` method to handle exceptions, and use the `reject` method to raise them.

```js
new Promise((resolve, reject) => reject('This in an exception')).catch(() =>
  console.log('Handling exception')
);
```

There's no standard way to handle exceptions using callbacks in JS, however 2 common patterns are:

```js
// 1. returning an error response
invokeCallback({ error: true, errorMessage: 'The server is unavailable' });

// 2. passing a callback just for errors
foo({
  onSuccess: () => console.log('All good'),
  onError: () => console.log('Handling exception'),
});
```

### 8. How many arguments does setState take and why is it async.

It takes 2 arguments, an `state` object objets wich represents the new changes that should be applied in the current state, and the second one is `callback` which is a function that is called once the state has been modified.

`setState` is async to improve the overall performance of react appliactions. The problem is that `setState` cause rerendering and this could be a expensive operation so it could leave the browser in an unresponsive state while the code is evaluated.

### 9. List the steps needed to migrate a Class to Function Component.

1. Change the `class` keyword and make it a function
2. Place the contents of the `render` method in the function
3. Convert the class methods to functions (use `useCallback` when appropriate)
4. Remove the class constructor
5. Convert the `this.state = {}` to individual state values using `useState`
6. Inline all the props of the componenet in the function declaration
7. Remove any use of `this.` in the methods

### 10. List a few ways styles can be used with components.

1. Importing css files inside the component

```js
import './app.css';

const app = () => </>
```

2. Using `CSS Modules` to have class names scoped locally

```js
import styles from './app.css';

const app = () => (
  <div>
    <input className={styles.input} />
    <button className={styles.button} />
  </div>
);
```

3. Using `inline styles`

```js
const Box = () => (
  <div style={{ border: '1px solid red' }}>
    <p style={{ color: 'red', marginTop: 15 }}>Styled paragraph</p>
  </div>
);
```

4. Using `css-in-js`, there are some popular open source libraries like `emotion` and `style-components`

```js
// Example using the emotion API
const Box = () => (
  <div
    css={css`
      border: 1px solid red;
      font-size: 24px;
      border-radius: 4px;
    `}>
    Styled box
  </div>
);
```

### 11. How to render an HTML string coming from the server

The best and safer way is to sanitize the string to prevent `XSS` attacks, then we can set render the contents using `dangerouslySetInnerHTML`.

```js
const app = () => {
  const evilHTML = '<a href="#" onClick="deleteAllMyData()">click</a>';
  const sanitizedHTML = sanitizeHTML(evilHTML);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};
```
