// Persian Calendar Utility
// Converts Gregorian to Jalaali (Persian) calendar

function gregorianToJalaali(gy, gm, gd) {
    const g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd;
    let j_d_n = g_d_n - 79;
    
    let j_np = Math.floor(j_d_n / 12053);
    j_d_n = j_d_n % 12053;
    
    let jy = 979 + 33 * j_np + 4 * Math.floor(j_d_n / 1461);
    j_d_n %= 1461;
    
    if (j_d_n >= 366) {
        jy += Math.floor((j_d_n - 1) / 365);
        j_d_n = (j_d_n - 1) % 365;
    }
    
    let jm = 1;
    const saltMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    let md = 0;
    
    for (let i = 0; i < 12; i++) {
        md = saltMonth[i];
        if (j_d_n < md) break;
        j_d_n -= md;
        jm++;
    }
    
    const jd = j_d_n + 1;
    return { jy, jm, jd };
}

function jalaaliToGregorian(jy, jm, jd) {
    let j_d_n = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + jd;
    
    if (jm > 1) {
        for (let i = 0; i < jm - 1; i++) {
            if (i < 6) j_d_n += 31;
            else j_d_n += 30;
        }
    }
    
    let gy = 400 * Math.floor(j_d_n / 146097);
    j_d_n = j_d_n % 146097;
    
    let flag = true;
    if (j_d_n >= 36525) {
        j_d_n--;
        gy += 100 * Math.floor(j_d_n / 36524);
        j_d_n = j_d_n % 36524;
        if (j_d_n >= 365) j_d_n++;
        flag = false;
    }
    
    gy += 4 * Math.floor(j_d_n / 1461);
    j_d_n = j_d_n % 1461;
    
    if (flag) {
        if (j_d_n >= 366) {
            j_d_n--;
            gy += Math.floor(j_d_n / 365);
            j_d_n = j_d_n % 365;
        }
    }
    
    const saltMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((gy % 400 === 0) || (gy % 100 !== 0 && gy % 4 === 0)) saltMonth[1] = 29;
    
    let gm = 1;
    let md = 0;
    for (let i = 0; i < 12; i++) {
        md = saltMonth[i];
        if (j_d_n < md) break;
        j_d_n -= md;
        gm++;
    }
    
    return { gy, gm, gd: j_d_n + 1 };
}

function getJalaaliMonthDays(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    if (isLeapJalaali(jy)) return 30;
    return 29;
}

function isLeapJalaali(jy) {
    const cycle = jy + 1474;
    if (cycle < 0) cycle += 2820;
    const aux = 474 + (cycle % 2820);
    return (aux < 474) ? ((aux + 38) * 682) % 2816 < 682 : ((aux + 39) * 682) % 2816 < 682;
}

function getJalaaliCalendarDays(jy, jm) {
    const monthDays = getJalaaliMonthDays(jy, jm);
    
    // Get the first day of the month in gregorian to determine starting weekday
    const gregorian = jalaaliToGregorian(jy, jm, 1);
    const firstDay = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    let startWeekday = (firstDay.getDay() + 1) % 7; // Convert to Persian weekday (0=Saturday)
    
    const days = [];
    for (let i = 0; i < startWeekday; i++) {
        days.push(null);
    }
    for (let i = 1; i <= monthDays; i++) {
        days.push(i);
    }
    
    return days;
}

function getJalaaliMonthName(jm) {
    const monthNames = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    return monthNames[jm - 1];
}

function toPersianNumber(n) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(n).split('').map(c => {
        return /\d/.test(c) ? persianDigits[parseInt(c)] : c;
    }).join('');
}

export {
    gregorianToJalaali,
    jalaaliToGregorian,
    getJalaaliCalendarDays,
    getJalaaliMonthName,
    getJalaaliMonthDays,
    isLeapJalaali,
    toPersianNumber
};
