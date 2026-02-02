import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

export function IconChevronLeft(props: IconProps) {
  const { title = "Previous", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  const { title = "Next", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12z"
      />
    </svg>
  );
}

export function IconPerson(props: IconProps) {
  const { title = "Model", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.05 0-7.5 2.04-7.5 4.5V21h15v-2.25c0-2.46-3.45-4.5-7.5-4.5Z"
      />
    </svg>
  );
}

export function IconWhatsapp(props: IconProps) {
  const { title = "WhatsApp", ...rest } = props;
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" {...rest}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M19.11 17.9c-.25-.13-1.5-.74-1.73-.82-.23-.08-.4-.13-.57.13-.17.25-.66.82-.8.99-.15.17-.29.19-.54.06-.25-.13-1.05-.38-2-.1-1.9-.56-3.17-2.77-3.27-2.96-.1-.19 0-.29.11-.41.1-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.57-1.37-.78-1.88-.2-.48-.4-.42-.57-.43h-.49c-.17 0-.44.06-.67.32-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.42 1.43.54.6.19 1.15.16 1.58.1.48-.08 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.29Z"
      />
      <path
        fill="currentColor"
        d="M16 3C9.37 3 4 8.3 4 14.85c0 2.3.69 4.43 1.87 6.22L4 29l8.14-1.73A12.2 12.2 0 0 0 16 26.7c6.63 0 12-5.3 12-11.85C28 8.3 22.63 3 16 3Zm0 21.58c-1.3 0-2.58-.25-3.76-.74l-.27-.11-4.83 1.03 1-4.7-.17-.27a9.7 9.7 0 0 1-1.56-5.2C6.4 9.7 10.74 5.4 16 5.4s9.6 4.3 9.6 9.18-4.34 9.99-9.6 9.99Z"
      />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  const { title = "Instagram", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm8.4 2H7.8A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4Z"
      />
      <path
        fill="currentColor"
        d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
      />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconFullscreen(props: IconProps) {
  const { title = "Fullscreen", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M7 14H5v5h5v-2H7v-3Zm-2-4h2V7h3V5H5v5Zm14 4h-3v2h5v-5h-2v3ZM14 5v2h3v3h2V5h-5Z"
      />
    </svg>
  );
}

export function IconFullscreenExit(props: IconProps) {
  const { title = "Exit fullscreen", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <title>{title}</title>
      <path
        fill="currentColor"
        d="M5 16h3v3h2v-5H5v2Zm3-8H5v2h5V5H8v3Zm6 11h2v-3h3v-2h-5v5Zm2-11V5h-2v5h5V8h-3Z"
      />
    </svg>
  );
}

