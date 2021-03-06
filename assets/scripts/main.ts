import turbolinks from 'turbolinks';

import { initShareButton } from './modules/share-button';
import { initTracking } from './modules/tracking';

turbolinks.start();

initShareButton();
initTracking();
