const PIXEL = 'https://analytics.e5l.de/cctv.gif';

const TRACKING_ID =
  'f6ebcbdcc4353680520f8568746a882a56058f72754dfff2d953b89409ccf48f_6d6f6758976cf3c94611a1778c3eb0b1';

const track = () => {
  const { pathname, search } = location;
  const resource = encodeURIComponent(pathname + search);
  const referrer = encodeURIComponent(document.referrer);
  const src = `${PIXEL}?id=${TRACKING_ID}&resource=${resource}&referrer=${referrer}`;
  Object.assign(new Image(), { src });
};

export const initTracking = () => {
  if (location.hostname !== 'photos.klg.bz') {
    return;
  }

  document.addEventListener('turbolinks:load', () => track());
};
