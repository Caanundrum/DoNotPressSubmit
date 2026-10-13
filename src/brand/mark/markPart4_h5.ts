function _u(e: string): string {
  const A = "abcdefghijklmnop";
  let s = "";
  for (let i = 0; i < e.length; i += 2) {
    const hi = A.indexOf(e[i]), lo = A.indexOf(e[i + 1]);
    s += String.fromCharCode((hi << 4) | lo);
  }
  return s;
}
export const markPart4_h5 = _u("ffgcgkhihfgcgefbclhadjekfjhkhafjebgphjfegkfbeggfgehjhjefclgbgbefhbfbhaelgfhcdfgbdbfjeedjdaedenfagkgieefcepgggcebdffdefffdfgpfegkgdgigkdeeggkdihgemgjfbfigndiekhfedhcdhgbgggfdfdjcpecgoebhefghgggeiekecfdgnejeddiengjeogghhemcldfhbgpgggffaekdjcpfehjekhigoheendhgbeneghiclemhiefgighhbhbhieggmeleeeiddgpfjgngpgddfhaclfbdahhechjeggheogohaegeeecgkhhhbhagghefegogjhcecejgphahheghihgheebekfgfgeffdclejfjefgldbejgcdggffehffahgemfchahfgoefejecfcgbdchefegpdegmfkdjegejeogbfkhiebhedfgfebhdgigpcldjggghgjfaeifkdggffdedclenhcdaebebedhfegdjeegccpefcpeigkhfcpfgeldcefengiebejggfbdgfgeifjebdhdcghfhgjfgefgofaeegjeofahcfkhkebejglhegefjfiedhbclhhgpebheglejhahdgdgggkfbfidddcfigihiecdjcpgghfgfhidcdhgnfjdbgeggeeenfehehddedfhkecgkfbeegggjfefjglefeoeieighgdgpfaepgmhhhbghddgbgnhhgmhbddfdhbhafkfahafaejhkhdgcdedgdifffjeghjdghk");
