// Business Logic Module - Category and Data Processing Functions

// ===== Category & Sub-category =====
function highLevelCategoryFromVuln(v) {
  const s = norm(v);
  if (/Windows/i.test(s)) return "Windows";
  if (/Google|Chrome|Mozilla|Firefox|Edge/i.test(s)) return "Browser";
  if (/Microsoft|Office|Power|Excel|Access|Security Update/i.test(s)) return "Microsoft Apps";
  return "Third Party Application";
}

const SUBCAT_RULES = [
  [/Windows/i, "Windows"],
  [/Mozilla|Firefox/i, "Browser Mozilla Firefox"],
  [/Google|Chrome/i, "Browser Google Chrome"],
  [/Edge/i, "Browser Microsoft Edge"],
  [/Microsoft|Office|Power|Excel|Access|Security Update/i, "Microsoft"],
  [/Adobe/i, "Adobe"],
  [/MariaDB/i, "MariaDB"],
  [/Open Source/i, "Open Source"],
  [/Upgrade openoffice|OpenOffice/i, "OpenOffice"],
  [/Dell Display/i, "Dell Display"],
  [/Wireshark/i, "Wireshark"],
  [/7\s?Zip|7zip/i, "7 Zip"],
  [/Snagit/i, "Snagit"],
  [/WinRAR/i, "WinRAR"],
  [/\b\.NET\b/i, ".NET"],
  [/Signature/i, "Signature"],
  [/Git\b/i, "Git"],
  [/FileZilla/i, "FileZilla"],
  [/VLC/i, "VLC"],
  [/Greenshot/i, "Greenshot"],
  [/Snipping/i, "Snipping"],
  [/Python/i, "Python"],
  [/Symantec/i, "Symantec"],
  [/PostgreSQL|Postgresql/i, "PostgreSQL"],
  [/MySQL/i, "MySQL"],
  [/\bSQL\b/i, "SQL"],
  [/JDK/i, "JDK"],
  [/GlobalProtect/i, "GlobalProtect"],
  [/Nessus/i, "Nessus"],
  [/Docker/i, "Docker"],
  [/FortiClient/i, "FortiClient"],
  [/\bVPN\b/i, "VPN"],
  [/Azure/i, "Azure"],
  [/Notepad/i, "Notepad"],
  [/PHP\b/i, "PHP"],
  [/Zoom\b/i, "Zoom"],
  [/Apache\b/i, "Apache"],
  [/WibuKey/i, "WibuKey"],
  [/AspNet/i, "AspNet"],
  [/\bPDF\b/i, "PDF"],
  [/SigPlus/i, "SigPlus"],
  [/Skype/i, "Skype"],
  [/PuTTy/i, "PuTTy"],
  [/Monitor\b/i, "Monitor"],
  [/Ghostscript/i, "Ghostscript"],
  [/Winamp/i, "Winamp"],
  [/Yarn\b/i, "Yarn"],
  [/Cisco\b/i, "Cisco"],
  [/WinZip|winzip/i, "WinZip"],
  [/Tomcat\b/i, "Tomcat"],
  [/KeePass/i, "KeePass"],
  [/Apple\b/i, "Apple"],
  [/Connect\b/i, "Connect"],
  [/Acrobat\b/i, "Acrobat"],
  [/Redis\b/i, "Redis"],
  [/Imagemagic/i, "Imagemagic"],
  [/Photoshop/i, "Photoshop"],
  [/NI LabVIEW/i, "NI LabVIEW"],
  [/BlueStacks/i, "BlueStacks"],
  [/Brother/i, "Brother IPrint Scan"],
  [/Dell\b/i, "Dell"],
  [/IZArc/i, "IZArc"],
  [/Runtime/i, ".NET Runtime"],
  [/Rockwell/i, "Rockwell"],
];

function extractProductAfterPhrase(vulnText) {
  if (!vulnText) return null;
  const lower = vulnText.toLowerCase();
  const phrases = ["are affected in", "are fixed in"];
  let idx = -1;
  let phraseLen = 0;
  for (const p of phrases) {
    const i = lower.indexOf(p);
    if (i !== -1 && (idx === -1 || i < idx)) {
      idx = i;
      phraseLen = p.length;
    }
  }
  if (idx === -1) return null;
  let tail = vulnText.slice(idx + phraseLen).trim();
  if (!tail) return null;
  tail = tail.replace(/^[\s:,\-]+/, "");
  const beforeParen = tail.split("(")[0].trim();
  if (!beforeParen) return null;
  const cleaned = beforeParen
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\/_,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = cleaned.split(" ").filter(Boolean);
  if (!tokens.length) return null;
  const t1 = tokens[0];
  const t2 = tokens[1];
  const isWordToken = (t) => {
    if (!t) return false;
    return /[\p{L}]/u.test(t) && !/[0-9]/.test(t);
  };
  const name = t2 && isWordToken(t2) ? `${t1} ${t2}` : t1;
  return name.replace(/[^\p{L}0-9 .+\-]/gu, "").trim() || null;
}

function finalizeSubcategory(label) {
  const s = norm(label);
  if (!s) return "Third party Unclassified";
  if (s === "Windows") return "Windows";
  if (s === "Microsoft") return "Microsoft";
  if (s.startsWith("Browser ")) return s;
  return s.toLowerCase().startsWith("third party ") ? s : `Third party ${s}`;
}

function subCategoryFromVuln(v) {
  const s = norm(v);
  for (const [re, label] of SUBCAT_RULES) {
    if (re.test(s)) return finalizeSubcategory(label);
  }
  const extracted = extractProductAfterPhrase(s);
  return finalizeSubcategory(extracted || "Unclassified");
}

// ===== Region & Market =====
function regionFromRemote(remote) {
  const s = (remote ?? "").toString().trim();
  if (!s) return "Other";
  const up = s.toUpperCase();
  if (up.startsWith("APAC")) return "APAC";
  if (up.startsWith("APAC IGBS")) return "IGBS";
  if (up.startsWith("SA ") || up.startsWith("SA-")) return "Americas";
  if (up.startsWith("EUROPE")) return "EUAF";
  if (up.startsWith("AFRICA")) return "EUAF";
  if (up.startsWith("UK ")) return "UK";
  if (up.includes(" IGBS ")) return "IGBS";
  if (up.startsWith("DDC")) return "DDC";
  if (
    /\b(HONG KONG|SINGAPORE|INDONESIA|THAILAND|PHILIPPINES|GUAM|SAIPAN|AUSTRALIA)\b/i.test(
      s
    )
  )
    return "APAC";
  if (
    /\b(CHILE|COLOMBIA|PERU|BOLIVIA|ECUADOR|PARAGUAY|URUGUAY|ARGENTINA|PANAMA|COSTA RICA|GUATEMALA|SALVADOR|BARBADOS|PUERTO RICO)\b/i.test(
      s
    )
  )
    return "Americas";
  if (
    /\b(BELGIUM|BULGARIA|ESTONIA|FINLAND|GREECE|LITHUANIA|LATVIA|NORTH MACEDONIA|POLAND|ROMANIA|EUROPEAN UNION|UNITED KINGDOM|UK)\b/i.test(s)) return "EUAF";
  if (/\b(KENYA|ETHIOPIA|DJIBOUTI)\b/i.test(s)) return "EUAF";
  if (/\b(DDC-Columbia|DDC-Philippines)\b/i.test(s)) return "DDC";
  if (/\b(APAC IGBS|SA CO IGBS)\b/i.test(s)) return "IGBS";
  return "Other";
}

function marketFromRemote(remote) {
  const s = (remote ?? "").toString().trim();
  if (!s) return "Other";
  const learned = (() => {
    try {
      return JSON.parse(localStorage.getItem("marketMap") || "{}");
    } catch {
      return {};
    }
  })();
  const STATIC_PREFIX_MAP = [
    ["APAC BN Brunei", "Brunei"],
    ["APAC ID Indonesia", "Indonesia"],
    ["APAC SG Singapore", "Singapore"],
    ["APAC TH Thailand", "Thailand"],
    ["APAC PH CATS", "Philippines"],
    ["APAC AU Australia", "Australia"],
    ["APAC HK HONG KONG", "Hong Kong"],
    ["APAC GU GUAM", "Guam"],
    ["APAC MP Saipan", "Saipan"],
    ["APAC MA MORRICO", "Morrico"], /* (dejamos tal cual) */
    ["APAC IGBS", "IGBS"],
    ["SA CHL Chile", "Chile"],
    ["SA CR Costa Rica", "Costa Rica"],
    ["SA Derco Chile", "Derco Chile"],
    ["SA Derco Bolivia", "Derco Bolivia"],
    ["SA BB Barbados", "Barbados"],
    ["SA-Chile-Ditec", "Chile Ditec"],
    ["SA EC Ecuador", "Ecuador"],
    ["SA UY Uruguay", "Uruguay"],
    ["SA PR Puerto Rico", "Puerto Rico"],
    ["SA CO Colombia", "Colombia"],
    ["SA PA Panama", "Panama"],
    ["SA AR Argentina", "Argentina"],
    ["SA PE Peru", "Peru"],
    ["SA GT Guatemala", "Guatemala"],
    ["SA SV El Salvador", "El Salvador"],
    ["SA Derco Peru", "Derco Peru"],
    ["SA Derco Colombia", "Derco Colombia"],
    ["SA Derco Bolivia Sta Cruz", "Derco Bolivia Sta Cruz"],
    ["SA CO IGBS_OTC", "IGBS"],
    ["SA CO IGBS_PSM", "IGBS"],
    ["SA CO IGBS_RTR", "IGBS"],
    ["SA CO IGBS", "IGBS"],
    ["SA CO IGBS_PTP", "IGBS"],
    ["DDC-Columbia", "DDC CO"],
    ["DDC-Philippines", "DDC PH"],
    ["Europe BE", "Belgium"],
    ["Europe BG", "Bulgaria"],
    ["Europe EE", "Estonia"],
    ["Europe EU", "European Union"],
    ["Europe FI", "Finland"],
    ["Europe GR", "Greece"],
    ["Europe LT", "Lithuania"],
    ["Europe LV", "Latvia"],
    ["Europe NM", "North Macedonia"],
    ["Europe PL", "Poland"],
    ["Europe RO", "Romania"],
    ["AFRICA KN", "Kenya"],
    ["AFRICA ETHIOPIA", "Ethiopia"],
    ["AFRICA Djibouti", "Djibouti"],
    ["UK SJS HQ", "St James's"],
  ];
  for (const [p, m] of [...Object.entries(learned), ...STATIC_PREFIX_MAP]) {
    if (s.startsWith(p)) return m;
  }
  return "Other";
}

function fillRegionAndMarkets(row) {
  if (!row["Region"] || String(row["Region"]).trim() === "")
    row["Region"] = regionFromRemote(row["Remote Office"]);
  if (!row["Markets"] || String(row["Markets"]).trim() === "")
    row["Markets"] = marketFromRemote(row["Remote Office"]);
  return row;
}

// Export functions globally for external usage
window.highLevelCategoryFromVuln = highLevelCategoryFromVuln;
window.SUBCAT_RULES = SUBCAT_RULES;
window.extractProductAfterPhrase = extractProductAfterPhrase;
window.finalizeSubcategory = finalizeSubcategory;
window.subCategoryFromVuln = subCategoryFromVuln;
window.regionFromRemote = regionFromRemote;
window.marketFromRemote = marketFromRemote;
window.fillRegionAndMarkets = fillRegionAndMarkets;