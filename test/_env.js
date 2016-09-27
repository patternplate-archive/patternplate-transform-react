// eslint-disable xo/filename-case;
import {jsdom} from 'jsdom';

// Provide an emulated DOM environment for React testing
global.document = jsdom('<body></body>');
global.window = global.document.defaultView;
global.navigator = global.window.navigator;
