const localLogos = {
  Google: "/logos/simple-icons-develop/icons/google.svg",
  Oracle: "/logos/simple-icons-develop/icons/oracle.svg",
  Citi: "/logos/simple-icons-develop/icons/citi.svg",
  "Bank of America": "/logos/simple-icons-develop/icons/bankofamerica.svg",
  "Goldman Sachs": "/logos/simple-icons-develop/icons/goldmansachs.svg",
  HSBC: "/logos/simple-icons-develop/icons/hsbc.svg",
  Mastercard: "/logos/simple-icons-develop/icons/mastercard.svg",
  Visa: "/logos/simple-icons-develop/icons/visa.svg",
  "Wells Fargo": "/logos/simple-icons-develop/icons/wellsfargo.svg",
  SAP: "/logos/simple-icons-develop/icons/sap.svg",
};

const companyDomains = {
  Google: "google.com",
  Microsoft: "microsoft.com",
  Amazon: "amazon.com",
  Oracle: "oracle.com",
  Citi: "citi.com",
  "Goldman Sachs": "goldmansachs.com",
  "Bank of America": "bankofamerica.com",
  "BNY Mellon": "bnymellon.com",
  HSBC: "hsbc.com",
  Hitit: "hititcs.com",
  "JPMorgan Chase": "jpmorganchase.com",
  Mastercard: "mastercard.com",
  "Morgan Stanley": "morganstanley.com",
  NPCI: "npci.org.in",
  PwC: "pwc.com",
  Visa: "visa.com",
  UBS: "ubs.com",
  "Wells Fargo": "wellsfargo.com",
  Accela: "accela.com",
  "D.E. Shaw": "deshaw.com",
  "Dolat Capital": "dolatcapital.com",
  "Mahindra Finance": "mahindrafinance.com",
  "SAP Labs": "sap.com",
  TestCo: "testco.com",
  "Texas Instruments": "ti.com",
  Tracelink: "tracelink.com",
};

export default function CompanyLogo({ name, size = "w-12 h-12" }) {
  const localLogo = localLogos[name];
  const domain = companyDomains[name];

  // Local SVG logo
  if (localLogo) {
    return (
      <img
        src={localLogo}
        alt={name}
        className={`${size} rounded-xl object-contain bg-white p-1`}
        onError={(e) => {
          if (domain) {
            e.target.src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
          }
        }}
      />
    );
  }

  // Google favicon
  if (domain) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
        alt={name}
        className={`${size} rounded-xl object-contain bg-white p-1`}
      />
    );
  }

  // Fallback: First Letter
  return (
    <div
      className={`${size} rounded-xl flex items-center justify-center bg-orange-500 text-white font-bold`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}