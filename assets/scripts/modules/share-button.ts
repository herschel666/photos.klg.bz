const ID_SHARE_BUTTON = 'share-button';

export const initShareButton = (): void => {
  document.documentElement.addEventListener('click', (event: MouseEvent) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const details = document.querySelector<HTMLDetailsElement>(
      `#${ID_SHARE_BUTTON}[open]`
    );

    if (
      !details ||
      event.target === details ||
      details.contains(event.target)
    ) {
      return;
    }

    details.open = false;
  });
};
