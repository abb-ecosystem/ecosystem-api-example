const T_COMPONENTS_EXAMPLE_VERSION = '1.0.10';

const moduleName = 'Ecosystem_BASE';
const configName = 'EIO_ECOSYSTEM_GUIDE';

const path = window.location.pathname.split('/');
const dir = path[path.length - 2];

const modulePath = `HOME/WebApps/${dir ? dir : 'EcosystemApi'}/rapid`;
const configPath = `HOME/WebApps/${dir ? dir : 'EcosystemApi'}/config`;

export { moduleName, modulePath, configName, configPath, T_COMPONENTS_EXAMPLE_VERSION };
