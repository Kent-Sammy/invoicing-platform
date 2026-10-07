// Shared document building blocks. They fix behaviour every template must
// get right (sample content, payment safety, QR legibility, logo sizing);
// templates decide how they look.
export { LogoMark } from "./logo-mark";
export { PayLink, PaymentQr } from "./payment";
export { isSampleParty, SampleText } from "./sample";
