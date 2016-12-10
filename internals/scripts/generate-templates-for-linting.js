const nodePlop = require('node-plop');
const path = require('path');
const chalk = require('chalk');
const rimraf = require('rimraf');

const xmark = require('./helpers/xmark');

process.chdir(path.join(process.cwd(), 'internals/generators'));

const prettyStringify = (data) => JSON.stringify(data, null, 2);

const checkForErrors = (result) => {
  if (Array.isArray(result.failures) && result.failures.length > 0) {
    throw result.failures;
  }
};

const reportErrorsFor = (title) => (err) => {
  // TODO Replace with our own helpers/log that is guaranteed to be blocking?
  xmark(() => console.error(chalk.red(` ERROR generating '${title}': `), prettyStringify(err)));
  process.exit(1);
};

// Generated tests are designed to fail, which would in turn fail CI builds
const removeTestsDir = (relativePath) => () => rimraf.sync(path.join(__dirname, '/../../app/', relativePath, '/tests'));

const plop = nodePlop('./index');

const componentGen = plop.getGenerator('component');
const ComponentEsclass = componentGen.runActions({ name: 'RbGeneratedComponentEsclass', type: 'ES6 Class', wantMessages: true })
  .then(checkForErrors)
  .then(removeTestsDir('components/RbGeneratedComponentEsclass'))
  .catch(reportErrorsFor('component/ES6 Class'));

componentGen.runActions({ name: 'RbGeneratedComponentEsclasspure', type: 'ES6 Class (Pure)', wantMessages: true })
  .then(checkForErrors)
  .then(removeTestsDir('components/RbGeneratedComponentEsclasspure'))
  .catch(reportErrorsFor('component/ES6 Class (Pure)'));

componentGen.runActions({ name: 'RbGeneratedComponentStatelessfunction', type: 'Stateless Function', wantMessages: true })
  .then(checkForErrors)
  .then(removeTestsDir('components/RbGeneratedComponentStatelessfunction'))
  .catch(reportErrorsFor('component/Stateless Function'));

const containerGen = plop.getGenerator('container');
containerGen.runActions({
  name: 'RbGeneratedContainerPureComponent',
  component: 'PureComponent',
  wantHeaders: true,
  wantActionsAndReducer: true,
  wantSagas: true,
  wantMessages: true
})
  .then(checkForErrors)
  .then(removeTestsDir('containers/RbGeneratedContainerPureComponent'))
  .catch(reportErrorsFor('container/PureComponent'));

const ContainerComponent = containerGen.runActions({
  name: 'RbGeneratedContainerComponent',
  component: 'Component',
  wantHeaders: true,
  wantActionsAndReducer: true,
  wantSagas: true,
  wantMessages: true
})
  .then(checkForErrors)
  .then(removeTestsDir('containers/RbGeneratedContainerComponent'))
  .catch(reportErrorsFor('container/Component'));

const routeGen = plop.getGenerator('route');

ContainerComponent
  .then(() => routeGen.runActions({ component: 'RbGeneratedContainerComponent', path: '/generated-route-container' })
    .then(checkForErrors)
    .catch(reportErrorsFor('route/Container'))
);

ComponentEsclass
  .then(() => routeGen.runActions({ component: 'RbGeneratedComponentEsclass', path: '/generated-route-component' })
    .then(checkForErrors)
    .catch(reportErrorsFor('route/Component'))
);

const languageGen = plop.getGenerator('language');
languageGen.runActions({ language: 'fr' })
  .catch(reportErrorsFor('language'));
