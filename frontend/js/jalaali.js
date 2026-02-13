// Accurate Jalaali (Persian) Calendar Conversion
// Based on the official Jalaali algorithm

const breaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111,
  1181, 1210, 1635, 2060, 2097, 2192, 2262,
  2324, 2394, 2456, 3178
];

function div(a, b) {
  return ~~(a / b);
}

function mod(a, b) {
  return a - ~~(a / b) * b;
}

function jalCal(jy) {
  let bl = breaks.length;
  let gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm, jump, leap, n, i;

  if (jy < jp || jy >= breaks[bl - 1])
    throw new Error("Invalid Jalaali year");

  for (i = 1; i < bl; i++) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm)
      break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n + 3, 33), 4);

  if (mod(jump, 33) === 4 && jump - n === 4)
    leapJ++;

  let leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  let march = 20 + leapJ - leapG;

  if (jump - n < 6)
    n = n - jump + div(jump + 4, 33) * 33;

  leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1)
    leap = 4;

  return { leap, gy, march };
}

function jalaaliToGregorian(jy, jm, jd) {
  let r = jalCal(jy);
  let gy = r.gy;
  let march = r.march;

  let gDayNo = (jm <= 6)
    ? (jm - 1) * 31 + jd - 1
    : (jm - 7) * 30 + jd + 185;

  let gDate = new Date(gy, 2, march);
  gDate.setDate(gDate.getDate() + gDayNo);

  return {
    gy: gDate.getFullYear(),
    gm: gDate.getMonth() + 1,
    gd: gDate.getDate()
  };
}

function gregorianToJalaali(gy, gm, gd) {
  let gDate = new Date(gy, gm - 1, gd);
  let jy = gDate.getFullYear() - 621;

  let r = jalCal(jy);
  let gFarvardin = new Date(r.gy, 2, r.march);

  let diff = Math.floor((gDate - gFarvardin) / 86400000);

  let jm, jd;

  if (diff >= 0) {
    if (diff <= 185) {
      jm = 1 + div(diff, 31);
      jd = 1 + mod(diff, 31);
    } else {
      diff -= 186;
      jm = 7 + div(diff, 30);
      jd = 1 + mod(diff, 30);
    }
  } else {
    jy--;
    r = jalCal(jy);
    gFarvardin = new Date(r.gy, 2, r.march);
    diff = Math.floor((gDate - gFarvardin) / 86400000);

    if (diff <= 185) {
      jm = 1 + div(diff, 31);
      jd = 1 + mod(diff, 31);
    } else {
      diff -= 186;
      jm = 7 + div(diff, 30);
      jd = 1 + mod(diff, 30);
    }
  }

  return { jy, jm, jd };
}

function isLeapJalaaliYear(jy) {
  return jalCal(jy).leap === 0;
}

function getJalaaliMonthDays(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaaliYear(jy) ? 30 : 29;
}

// Make functions available in browser global scope when loaded via a
// normal <script> tag and also support CommonJS environments.
if (typeof window !== 'undefined') {
  window.gregorianToJalaali = gregorianToJalaali;
  window.jalaaliToGregorian = jalaaliToGregorian;
  window.isLeapJalaaliYear = isLeapJalaaliYear;
  window.getJalaaliMonthDays = getJalaaliMonthDays;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    gregorianToJalaali,
    jalaaliToGregorian,
    isLeapJalaaliYear,
    getJalaaliMonthDays
  };
}
