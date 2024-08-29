import Link from 'next/link';

function JimpleLogo({ linkToRoot = true, ...props }) {
  const logo = (
    <div>
      <svg className="{...props}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" {...props}>
        <circle cx={31.98} cy={42.98} r={7.98} fill="#009fff" />
        <circle cx={63.98} cy={42.98} r={7.98} fill="#0ec152" />
        <circle cx={95.98} cy={42.98} r={7.98} fill="#ff3057" />
        <circle cx={127.98} cy={42.98} r={7.98} fill="#ffaf00" />
        <path
          d="M128 75c0 26.51-21.49 48-48 48s-48-21.49-48-48"
          fill="none"
          stroke="#f1f1f1"
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth="16px"
        />
      </svg>
    </div>
  );

  if (linkToRoot) {
    return <Link href="/">{logo}</Link>;
  }

  return logo; 
}

export default JimpleLogo;
