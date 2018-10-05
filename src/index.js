import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Home from './Home';
import AutorBox from './Autor';
import ApiLivrosBox from './Livros';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';

ReactDOM.render(
  (<Router>
      <App>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route path="/autor" component={AutorBox}/>
          <Route path="/livro" component={ApiLivrosBox}/>
        </Switch>
      </App>
  </Router>),
  document.getElementById('root')
);
registerServiceWorker();
