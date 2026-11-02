// One numbered section of the terms or privacy page: paragraphs, then an optional bullet list.
export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
}

export interface LegalContent {
  terms: LegalSection[];
  privacy: LegalSection[];
  // The four promises in the green box at the top of the privacy page.
  privacyPromises: string[];
}
